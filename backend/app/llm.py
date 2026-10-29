import json
import re
import base64
import logging
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

# Tiered fallback list of verified active free models on OpenRouter
FALLBACK_MODELS = [
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "liquid/lfm-2.5-2.6b:free"
]

def get_openrouter_queue() -> List[str]:
    primary = settings.LLM_MODEL.strip() if settings.LLM_MODEL else "nvidia/nemotron-3.5-lightning:free"
    queue = [primary]
    for m in FALLBACK_MODELS:
        if m not in queue:
            queue.append(m)
    return queue

async def call_llm(prompt: str, system_prompt: Optional[str] = None) -> str:
    """
    Unified LLM invocation:
    1. If OPENAI_API_KEY is configured, calls OpenAI (gpt-4o-mini) directly.
    2. Falls back to OpenRouter with automatic tiered model failover.
    """
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    # Attempt 1: Direct OpenAI (if key provided by user)
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip().startswith("sk-"):
        try:
            logger.info("Invoking OpenAI API with model: %s", settings.OPENAI_MODEL)
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY.strip()}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": settings.OPENAI_MODEL or "gpt-4o-mini",
                "messages": messages,
                "temperature": 0.3
            }
            async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT_SECONDS) as client:
                res = await client.post(OPENAI_URL, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    if content and len(content.strip()) > 5:
                        logger.info("OpenAI call succeeded.")
                        return content
                logger.warning("OpenAI failed with status %s: %s", res.status_code, res.text[:120])
        except Exception as e:
            logger.warning("OpenAI invocation failed: %s. Falling back to OpenRouter.", e)

    # Attempt 2: OpenRouter with tiered models
    if not settings.OPENROUTER_API_KEY:
        raise ValueError("Neither OPENAI_API_KEY nor OPENROUTER_API_KEY is configured")

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Grow My IQ AI",
        "User-Agent": "GrowMyIQ-Backend/2.0 (NCERT-AI-Quizzer)"
    }

    model_queue = get_openrouter_queue()
    last_error = None

    async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT_SECONDS) as client:
        for model in model_queue:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.3
            }
            try:
                logger.info("Invoking OpenRouter model: %s", model)
                response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
                
                if response.status_code == 200:
                    res_data = response.json()
                    choices = res_data.get("choices", [])
                    if choices and "message" in choices[0]:
                        content = choices[0]["message"].get("content", "")
                        if content and len(content.strip()) > 10:
                            logger.info("Successfully generated response with model: %s", model)
                            return content

                logger.warning("Model %s returned status %s: %s", model, response.status_code, response.text[:120])
                last_error = Exception(f"Model {model} failed with HTTP {response.status_code}: {response.text[:120]}")
            except Exception as e:
                logger.warning("Model %s invocation exception: %s", model, e)
                last_error = e

    raise last_error or RuntimeError("All candidate LLM models failed to respond.")

async def call_llm_json(prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
    """
    Calls LLM and parses JSON safely, handling reasoning tokens or markdown blocks.
    """
    raw_content = await call_llm(prompt=prompt, system_prompt=system_prompt)
    
    # Strip reasoning tags <think> ... </think>
    cleaned = re.sub(r"<think>.*?</think>", "", raw_content, flags=re.DOTALL).strip()

    # Extract JSON object substring
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1:
        cleaned = cleaned[first_brace:last_brace + 1]

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error("Failed to parse JSON response: %s. Raw: %s", e, raw_content[:300])
        raise ValueError(f"LLM did not return valid JSON: {str(e)}")

async def call_vision_llm(prompt: str, image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """
    Analyzes an uploaded syllabus image (photo of syllabus sheet, datesheet, or textbook table of contents)
    using OpenAI gpt-4o-mini or multimodal vision.
    """
    b64_img = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{b64_img}"

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": data_url}}
            ]
        }
    ]

    # Try OpenAI gpt-4o-mini first
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip().startswith("sk-"):
        try:
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY.strip()}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": messages,
                "temperature": 0.2
            }
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(OPENAI_URL, headers=headers, json=payload)
                if res.status_code == 200:
                    return res.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning("OpenAI vision analysis failed: %s", e)

    # OpenRouter vision fallback
    if settings.OPENROUTER_API_KEY:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "Grow My IQ AI",
            "User-Agent": "GrowMyIQ-Backend/2.0"
        }
        for v_model in ["nvidia/nemotron-3.5-super-vl:free", "google/gemma-4-26b-a4b-it:free"]:
            try:
                payload = {
                    "model": v_model,
                    "messages": messages,
                    "temperature": 0.2
                }
                async with httpx.AsyncClient(timeout=45.0) as client:
                    res = await client.post(OPENROUTER_URL, headers=headers, json=payload)
                    if res.status_code == 200:
                        return res.json()["choices"][0]["message"]["content"]
            except Exception as e:
                logger.warning("Vision model %s failed: %s", v_model, e)

    raise RuntimeError("Could not process syllabus image with vision models. Please paste syllabus text or upload .md.")
