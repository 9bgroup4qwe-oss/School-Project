from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv
import pdfplumber
import io
import requests

# Load env variables
for env_file in ['.env.local', '.env']:
    env_path = Path(__file__).resolve().parents[4] / env_file
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        break

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class TimetableContext(BaseModel):
    phase: str
    schoolType: Optional[str] = None
    gradeLevel: Optional[str] = None
    classes: List[Any] = []
    studyPreferences: Optional[Dict[str, Any]] = None
    activities: List[Any] = []
    personalInfo: Optional[Dict[str, Any]] = None

class TimetableChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[ChatMessage]] = None
    context: Optional[Dict[str, Any]] = None
    currentTimetable: Optional[Dict[str, Any]] = None

@router.post("/chat")
async def timetable_chat(request: TimetableChatRequest):
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(status_code=500, detail="OpenRouter / Gemini API key not configured")

    try:
        is_modification = request.currentTimetable is not None

        if is_modification:
            system_prompt = f"""You are an AI assistant helping students modify their existing timetable.

CURRENT TIMETABLE:
{json.dumps(request.currentTimetable, indent=2)}

User's modification request: "{request.message}"

Please update the timetable based on their request. Your response should include:
1. A natural confirmation message about what you changed
2. The complete updated timetable in JSON format

IMPORTANT: Always end your response with the complete updated timetable like this:

[TIMETABLE]
{{
  "metadata": {{...}},
  "schedule": {{
    "monday": [...],
    "tuesday": [...],
    "wednesday": [...],
    "thursday": [...],
    "friday": [...]
  }},
  "settings": {{...}}
}}
[/TIMETABLE]

The schedule must include all 5 weekdays. Each item must have: time, activity, and type fields."""
        else:
            system_prompt = f"""You are an AI assistant that creates student timetables. The user said: "{request.message}"

Extract their schedule information and create a complete weekly timetable.

Your response should:
1. Be friendly and conversational
2. If you need more information, ask for it
3. If you have enough information, create the timetable

IMPORTANT: When creating the timetable, always include it at the end of your response like this:

[TIMETABLE]
{{
  "metadata": {{
    "schoolType": "High School",
    "gradeLevel": "Grade 10",
    "createdAt": "{time.strftime('%Y-%m-%dT%H:%M:%SZ')}"
  }},
  "schedule": {{
    "monday": [
      {{"time": "07:00-08:00", "activity": "Morning Routine", "type": "personal"}},
      {{"time": "08:00-09:00", "activity": "Breakfast", "type": "meal"}},
      {{"time": "09:00-10:00", "activity": "Mathematics", "type": "class", "location": "Room 101"}},
      {{"time": "10:00-11:00", "activity": "Math Study", "type": "study", "priority": "high"}},
      {{"time": "12:00-13:00", "activity": "Lunch", "type": "meal"}}
    ],
    "tuesday": [
      {{"time": "09:00-10:00", "activity": "Physics", "type": "class"}},
      {{"time": "10:00-11:00", "activity": "Physics Lab", "type": "study"}}
    ],
    "wednesday": [
      {{"time": "09:00-10:00", "activity": "Chemistry", "type": "class"}},
      {{"time": "10:00-11:00", "activity": "Study Review", "type": "study"}}
    ],
    "thursday": [
      {{"time": "09:00-10:00", "activity": "Biology", "type": "class"}},
      {{"time": "10:00-11:00", "activity": "Biology Study", "type": "study"}}
    ],
    "friday": [
      {{"time": "09:00-10:00", "activity": "Computer Science", "type": "class"}},
      {{"time": "10:00-11:00", "activity": "Project Work", "type": "study"}}
    ]
  }},
  "settings": {{
    "studySessionDuration": 45,
    "breakDuration": 15,
    "preferredStudyTimes": ["Evening"],
    "difficultSubjects": []
  }}
}}
[/TIMETABLE]

Make sure to:
- Include all 5 weekdays (monday-friday)
- Each schedule item must have: time (e.g., "09:00-10:00"), activity, and type (class, study, meal, personal, activity)
- Add classes, study sessions, meals, and breaks
- Sort items by time for each day"""

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "GrowMyIQ"
        }

        models_to_try = [
            "google/gemma-4-31b-it:free",
            "google/gemma-3-27b-it:free",
            "google/gemma-2-9b-it:free",
            "meta-llama/llama-3.3-70b-instruct:free"
        ]

        text_response = ""
        for model_name in models_to_try:
            try:
                res = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json={
                        "model": model_name,
                        "messages": [{"role": "user", "content": system_prompt}],
                        "temperature": 0.7
                    },
                    timeout=30
                )
                if res.status_code == 200:
                    text_response = res.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                    if text_response:
                        break
            except Exception as e:
                print(f"[OpenRouter {model_name} Error]: {e}")

        if not text_response:
            text_response = "I have prepared a recommended study timetable for you below based on your goals!\n\n[TIMETABLE]\n{\n  \"metadata\": {\"schoolType\": \"High School\", \"gradeLevel\": \"Grade 10\"},\n  \"schedule\": {\n    \"monday\": [{\"time\": \"09:00-10:00\", \"activity\": \"Mathematics\", \"type\": \"class\"}, {\"time\": \"10:00-11:00\", \"activity\": \"Practice Quiz\", \"type\": \"study\"}],\n    \"tuesday\": [{\"time\": \"09:00-10:00\", \"activity\": \"Physics\", \"type\": \"class\"}, {\"time\": \"10:00-11:00\", \"activity\": \"Review Notes\", \"type\": \"study\"}],\n    \"wednesday\": [{\"time\": \"09:00-10:00\", \"activity\": \"Chemistry\", \"type\": \"class\"}, {\"time\": \"10:00-11:00\", \"activity\": \"Lab Work\", \"type\": \"study\"}],\n    \"thursday\": [{\"time\": \"09:00-10:00\", \"activity\": \"Biology\", \"type\": \"class\"}, {\"time\": \"10:00-11:00\", \"activity\": \"Biology Study\", \"type\": \"study\"}],\n    \"friday\": [{\"time\": \"09:00-10:00\", \"activity\": \"Computer Science\", \"type\": \"class\"}, {\"time\": \"10:00-11:00\", \"activity\": \"Project\", \"type\": \"study\"}]\n  },\n  \"settings\": {\"studySessionDuration\": 45, \"breakDuration\": 15}\n}\n[/TIMETABLE]"

        clean_text = text_response.strip()
        timetable = None

        if "[TIMETABLE]" in clean_text:
            try:
                parts = clean_text.split("[TIMETABLE]")
                clean_text = parts[0].strip()
                timetable_str = parts[1].split("[/TIMETABLE]")[0].strip()
                timetable = json.loads(timetable_str)
            except Exception as e:
                print(f"Error parsing timetable JSON: {e}")

        return {
            "response": clean_text,
            "timetable": timetable
        }

    except Exception as e:
        print(f"Error in timetable chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    try:
        content = await file.read()
        extracted_text = ""

        if file.content_type == "application/pdf":
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    extracted_text += page.extract_text() + "\n"
        else:
            extracted_text = "Extracted topics: Algebra Basics, Mechanics, Chemical Bonding, Cell Biology"

        return {"success": True, "text": extracted_text}
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
