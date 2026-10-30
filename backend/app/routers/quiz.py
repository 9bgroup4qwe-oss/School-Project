import uuid
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from app.schemas import (
    QuizGenerateRequest, QuizGenerateResponse, QuestionOut,
    QuizSubmitRequest, QuizSubmitResponse, QuestionResult,
    UserContext
)
from app.auth import get_current_user
from app.llm import call_llm_json
from app.analytics_store import save_quiz_session, get_quiz_session, record_quiz_completion

router = APIRouter(prefix="/quiz", tags=["Quiz"])
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=QuizGenerateResponse)
async def generate_quiz(
    req: QuizGenerateRequest,
    user: UserContext = Depends(get_current_user),
    authorization: str = Header(None)
):
    session_id = str(uuid.uuid4())
    grade_val = req.grade or 10
    difficulty_val = (req.difficulty or "medium").lower()
    time_limit_seconds = req.question_count * 90

    chapters_str = ", ".join(req.chapters) if req.chapters else "Full NCERT Curriculum"

    system_prompt = (
        f"You are a senior NCERT/CBSE curriculum subject matter expert and examiner for Class {grade_val}.\n"
        f"Your task is to generate {req.question_count} brand-new, original, concept-testing multiple choice questions "
        f"strictly tailored to Class {grade_val} {req.subject}.\n\n"
        "RULES:\n"
        "1. Every question must be original and directly test deep conceptual understanding and problem-solving for the specified chapters.\n"
        "2. NEVER repeat the same standard questions or generic questions.\n"
        "3. Provide exactly 4 distinct, plausible options.\n"
        "4. Format all math equations, exponents, and symbols using clean Unicode (e.g. x², α, β, √, ±, θ, 1/2) or plain text notation. Do not write raw LaTeX backslash commands.\n"
        "5. Specify 'correct_answer' as an integer index (0, 1, 2, or 3) pointing to the correct option in 'options'.\n"
        "6. Include an in-depth 'explanation' explaining WHY the correct option is right and highlighting the underlying NCERT rule, law, formula, or concept.\n"
        "7. Return ONLY a valid JSON object matching this schema:\n"
        "{\n"
        '  "questions": [\n'
        '    {\n'
        '      "question_text": "Detailed question stem",\n'
        '      "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        '      "correct_answer": 0,\n'
        '      "explanation": "Clear, step-by-step conceptual justification",\n'
        '      "chapter": "Exact chapter name"\n'
        '    }\n'
        '  ]\n'
        "}"
    )

    user_prompt = (
        f"Generation Seed: {uuid.uuid4().hex[:8]}\n"
        f"Grade: Class {grade_val} (NCERT/CBSE)\n"
        f"Subject: {req.subject}\n"
        f"Target Chapters: {chapters_str}\n"
        f"Difficulty: {difficulty_val}\n"
        f"Number of Questions: {req.question_count}\n"
        f"Generate {req.question_count} fresh, unique multiple choice questions now."
    )

    try:
        data = await call_llm_json(prompt=user_prompt, system_prompt=system_prompt, temperature=0.7)
        candidate_list = data.get("questions", [])
        if isinstance(candidate_list, list) and len(candidate_list) > 0:
            raw_questions = candidate_list[:req.question_count]
        else:
            raise ValueError("LLM JSON did not contain a valid questions array")
    except Exception as e:
        logger.error(f"LLM quiz generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI Quiz Generation failed: {str(e)}. Please ensure your OPENAI_API_KEY is configured in backend/.env"
        )

    questions_for_client: List[QuestionOut] = []
    questions_cache: Dict[str, Any] = {}

    for idx, q in enumerate(raw_questions):
        q_id = str(uuid.uuid4())
        q_text = str(q.get("question_text", f"Question {idx+1}")).strip()
        
        # Ensure 4 options
        raw_opts = q.get("options", [])
        if not isinstance(raw_opts, list):
            raw_opts = []
        options = [str(opt).strip() for opt in raw_opts][:4]
        while len(options) < 4:
            options.append(f"Option {len(options)+1}")

        # Correct answer index
        ans = q.get("correct_answer", 0)
        try:
            correct_idx = int(ans) % 4
        except (ValueError, TypeError):
            correct_idx = 0

        chapter_name = q.get("chapter", req.chapters[0] if req.chapters else req.subject)
        explanation = q.get("explanation", "Refer to NCERT textbook concepts for this chapter.")

        questions_cache[q_id] = {
            "id": q_id,
            "question_text": q_text,
            "options": options,
            "correct_answer": correct_idx,
            "explanation": explanation,
            "subject": req.subject,
            "chapter": chapter_name,
            "difficulty": difficulty_val,
            "question_index": idx
        }

        questions_for_client.append(QuestionOut(
            id=q_id,
            question_text=q_text,
            options=options,
            subject=req.subject,
            chapter=chapter_name,
            difficulty=difficulty_val,
            question_index=idx
        ))

    # Persist session permanently to SQLite
    save_quiz_session(
        session_id=session_id,
        user_id=user.user_id,
        grade=grade_val,
        subject=req.subject,
        chapters=req.chapters,
        questions_cache=questions_cache
    )

    return QuizGenerateResponse(
        session_id=session_id,
        grade=grade_val,
        subject=req.subject,
        difficulty=difficulty_val,
        question_count=len(questions_for_client),
        time_limit_seconds=time_limit_seconds,
        questions=questions_for_client,
        source="ai"
    )


@router.post("/{session_id}/submit", response_model=QuizSubmitResponse)
async def submit_quiz(
    session_id: str,
    submission: QuizSubmitRequest,
    user: UserContext = Depends(get_current_user),
    authorization: str = Header(None)
):
    """
    Evaluates submissions accurately using the persistent database store.
    Provides detailed feedback explaining why wrong answers are wrong.
    """
    session_info = get_quiz_session(session_id)
    if not session_info:
        logger.error(f"Quiz session {session_id} not found in database.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz session '{session_id}' not found or expired. Please start a fresh quiz."
        )

    q_map = session_info.get("questions", {})
    results: List[QuestionResult] = []
    correct_count = 0
    results_for_store = []

    for ans in submission.answers:
        q = q_map.get(ans.question_id)
        if not q:
            continue
        
        correct_idx = q["correct_answer"]
        selected_idx = ans.selected_option
        is_correct = (selected_idx == correct_idx)

        if is_correct:
            correct_count += 1
            feedback_explanation = f"Correct! {q.get('explanation', '')}"
        else:
            opt_chosen = q["options"][selected_idx] if selected_idx < len(q["options"]) else f"Option {selected_idx+1}"
            opt_correct = q["options"][correct_idx] if correct_idx < len(q["options"]) else f"Option {correct_idx+1}"
            raw_expl = q.get("explanation", "")
            feedback_explanation = (
                f"You selected '{opt_chosen}'. The correct answer is '{opt_correct}'. {raw_expl}"
            )

        q_res = QuestionResult(
            question_id=ans.question_id,
            question_text=q["question_text"],
            options=q["options"],
            selected_option=selected_idx,
            correct_answer=correct_idx,
            is_correct=is_correct,
            explanation=feedback_explanation
        )
        results.append(q_res)
        results_for_store.append({
            "chapter": q.get("chapter", session_info.get("subject", "General")),
            "is_correct": is_correct
        })

    total = len(results)
    score_percentage = round((correct_count / total * 100), 1) if total > 0 else 0.0

    # Persist real performance metrics in SQLite
    record_quiz_completion(
        user_id=user.user_id,
        subject=session_info.get("subject", "General"),
        chapters=session_info.get("chapters", []),
        total_questions=total,
        correct_answers=correct_count,
        score_percentage=score_percentage,
        time_taken=submission.time_taken,
        results=results_for_store
    )

    return QuizSubmitResponse(
        session_id=session_id,
        total_questions=total,
        correct_answers=correct_count,
        score_percentage=score_percentage,
        time_taken=submission.time_taken,
        results=results
    )
