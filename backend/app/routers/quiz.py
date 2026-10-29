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

# Subject & Grade specific verified NCERT question pool used ONLY if external AI network is completely unreachable
CURRICULUM_BACKUP_POOL: Dict[str, List[Dict[str, Any]]] = {
    "science_10": [
        {
            "question_text": "An object is placed at 20 cm in front of a concave mirror of focal length 15 cm. What is the nature and position of the image?",
            "options": ["Real, inverted, in front of mirror", "Virtual, erect, behind mirror", "Real, erect, at focus", "Virtual, inverted, at center of curvature"],
            "correct_answer": 0,
            "explanation": "Since object distance u = -20 cm lies between the focus (f = -15 cm) and center of curvature (C = -30 cm), a concave mirror forms a real, inverted and magnified image beyond C in front of the mirror.",
            "chapter": "Light - Reflection and Refraction",
            "difficulty": "medium"
        },
        {
            "question_text": "What is the absolute refractive index of a medium if the speed of light in it is 2 × 10^8 m/s? (Speed of light in vacuum c = 3 × 10^8 m/s)",
            "options": ["1.33", "1.5", "1.75", "2.0"],
            "correct_answer": 1,
            "explanation": "Refractive index n = c / v = (3 × 10^8) / (2 × 10^8) = 1.5. This matches glass.",
            "chapter": "Light - Reflection and Refraction",
            "difficulty": "easy"
        },
        {
            "question_text": "Which part of the nephron is primarily responsible for the ultrafiltration of blood under pressure?",
            "options": ["Bowman's Capsule and Glomerulus", "Loop of Henle", "Distal Convoluted Tubule", "Collecting Duct"],
            "correct_answer": 0,
            "explanation": "High hydrostatic pressure in the glomerulus forces water and small solutes through the podocytes of Bowman's capsule, initiating urine formation.",
            "chapter": "Life Processes",
            "difficulty": "medium"
        },
        {
            "question_text": "What happens when dilute hydrochloric acid is added to iron filings?",
            "options": ["Hydrogen gas and iron chloride are produced", "Chlorine gas and iron hydroxide are produced", "No reaction takes place", "Iron salt and water are produced"],
            "correct_answer": 0,
            "explanation": "Fe (s) + 2HCl (aq) -> FeCl2 (aq) + H2 (g). Iron displaces hydrogen from acid to liberate hydrogen gas and form ferrous chloride.",
            "chapter": "Chemical Reactions and Equations",
            "difficulty": "easy"
        },
        {
            "question_text": "The functional group present in propanone (CH3-CO-CH3) is:",
            "options": ["Aldehyde (-CHO)", "Ketone (>C=O)", "Carboxylic Acid (-COOH)", "Alcohol (-OH)"],
            "correct_answer": 1,
            "explanation": "Propanone is a ketone containing the carbonyl group (>C=O) bonded to two alkyl methyl groups.",
            "chapter": "Carbon and its Compounds",
            "difficulty": "easy"
        }
    ],
    "mathematics_10": [
        {
            "question_text": "If alpha and beta are zeroes of the quadratic polynomial p(x) = x^2 - 5x + 6, find the value of (alpha + beta):",
            "options": ["5", "-5", "6", "-6"],
            "correct_answer": 0,
            "explanation": "For ax^2 + bx + c = 0, sum of roots alpha + beta = -b/a = -(-5)/1 = 5.",
            "chapter": "Polynomials",
            "difficulty": "easy"
        },
        {
            "question_text": "The discriminant of the quadratic equation 2x^2 - 4x + 3 = 0 is:",
            "options": ["-8 (No real roots)", "8 (Two distinct real roots)", "0 (Two equal real roots)", "16"],
            "correct_answer": 0,
            "explanation": "Discriminant D = b^2 - 4ac = (-4)^2 - 4(2)(3) = 16 - 24 = -8. Since D < 0, there are no real roots.",
            "chapter": "Quadratic Equations",
            "difficulty": "medium"
        },
        {
            "question_text": "What is the 10th term of the arithmetic progression (AP): 2, 7, 12, ...?",
            "options": ["47", "45", "52", "50"],
            "correct_answer": 0,
            "explanation": "First term a = 2, common difference d = 7 - 2 = 5. nth term an = a + (n - 1)d = 2 + (10 - 1)*5 = 2 + 45 = 47.",
            "chapter": "Arithmetic Progressions",
            "difficulty": "easy"
        },
        {
            "question_text": "Evaluate: sin^2(30°) + cos^2(30°):",
            "options": ["1", "0.5", "1.5", "0"],
            "correct_answer": 0,
            "explanation": "By fundamental trigonometric identity, sin^2(theta) + cos^2(theta) = 1 for any angle theta.",
            "chapter": "Introduction to Trigonometry",
            "difficulty": "easy"
        }
    ],
    "social_science_10": [
        {
            "question_text": "Who was proclaimed the Emperor of unified Germany at the Palace of Versailles in January 1871?",
            "options": ["Kaiser William I of Prussia", "Otto von Bismarck", "Napoleon Bonaparte", "Victor Emmanuel II"],
            "correct_answer": 0,
            "explanation": "Following Prussian victories orchestrated by Bismarck, Kaiser William I was proclaimed German Emperor at Versailles in 1871.",
            "chapter": "The Rise of Nationalism in Europe",
            "difficulty": "medium"
        },
        {
            "question_text": "Which soil type covers the largest area in India and is formed by the deposition of silt by Himalayan river systems?",
            "options": ["Alluvial Soil", "Black Soil (Regur)", "Red and Yellow Soil", "Laterite Soil"],
            "correct_answer": 0,
            "explanation": "Alluvial soil is deposited by the Indus, Ganga, and Brahmaputra river systems and covers the vast northern plains of India.",
            "chapter": "Resources and Development",
            "difficulty": "easy"
        }
    ],
    "general": [
        {
            "question_text": "Which fundamental principle states that the total energy of an isolated system remains constant over time?",
            "options": ["Law of Conservation of Energy", "Newton's First Law", "Hooke's Law", "Archimedes' Principle"],
            "correct_answer": 0,
            "explanation": "The Law of Conservation of Energy states energy cannot be created or destroyed, only transformed from one form to another.",
            "chapter": "Core Curriculum",
            "difficulty": "easy"
        },
        {
            "question_text": "What is the SI unit of electric potential difference?",
            "options": ["Volt (V)", "Ampere (A)", "Ohm", "Watt (W)"],
            "correct_answer": 0,
            "explanation": "Potential difference is measured in Volts (V), defined as work done per unit electric charge: 1 V = 1 Joule / 1 Coulomb.",
            "chapter": "Electricity",
            "difficulty": "easy"
        }
    ]
}

def get_fallback_questions(subject: str, grade: int, count: int) -> List[Dict[str, Any]]:
    sub_lower = subject.lower()
    pool_key = "general"
    if "science" in sub_lower or "physics" in sub_lower or "chem" in sub_lower or "bio" in sub_lower:
        pool_key = f"science_{grade}" if f"science_{grade}" in CURRICULUM_BACKUP_POOL else "science_10"
    elif "math" in sub_lower:
        pool_key = f"mathematics_{grade}" if f"mathematics_{grade}" in CURRICULUM_BACKUP_POOL else "mathematics_10"
    elif "social" in sub_lower or "history" in sub_lower or "civics" in sub_lower or "geo" in sub_lower:
        pool_key = f"social_science_{grade}" if f"social_science_{grade}" in CURRICULUM_BACKUP_POOL else "social_science_10"

    pool = CURRICULUM_BACKUP_POOL.get(pool_key, CURRICULUM_BACKUP_POOL["general"])
    # Repeat pool to fulfill count
    full_list = (pool * ((count // len(pool)) + 1))[:count]
    return full_list

@router.post("/generate", response_model=QuizGenerateResponse)
async def generate_quiz(
    req: QuizGenerateRequest,
    user: UserContext = Depends(get_current_user),
    authorization: str = Header(None)
):
    session_id = str(uuid.uuid4())
    grade_val = req.grade or 10
    time_limit_seconds = req.question_count * 90

    chapters_str = ", ".join(req.chapters) if req.chapters else "Core NCERT Curriculum"

    system_prompt = (
        f"You are a senior NCERT/CBSE curriculum subject matter expert and examiner for Class {grade_val}.\n"
        f"Your task is to generate {req.question_count} high-quality, concept-testing multiple choice questions "
        f"strictly tailored to Class {grade_val} {req.subject}.\n\n"
        "RULES:\n"
        "1. Every question must directly test concepts from the specified syllabus/chapters.\n"
        "2. Provide 4 distinct, plausible options.\n"
        "3. Specify 'correct_answer' as an integer index (0, 1, 2, or 3) into the options list.\n"
        "4. Include an in-depth 'explanation' explaining WHY the correct option is right and highlighting the underlying NCERT rule/formula.\n"
        "5. Return ONLY a valid JSON object matching this schema:\n"
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
        f"Grade: Class {grade_val} (NCERT/CBSE)\n"
        f"Subject: {req.subject}\n"
        f"Target Chapters: {chapters_str}\n"
        f"Difficulty: {req.difficulty}\n"
        f"Number of Questions: {req.question_count}\n"
        f"Please generate {req.question_count} authentic questions now."
    )

    source = "ai"
    raw_questions: List[Dict[str, Any]] = []

    try:
        data = await call_llm_json(prompt=user_prompt, system_prompt=system_prompt)
        candidate_list = data.get("questions", [])
        if isinstance(candidate_list, list) and len(candidate_list) > 0:
            raw_questions = candidate_list[:req.question_count]
        else:
            raise ValueError("LLM JSON did not contain a valid questions array")
    except Exception as e:
        logger.error(f"LLM quiz generation failed: {e}. Activating curriculum backup.")
        source = "curriculum-fallback"
        raw_questions = get_fallback_questions(req.subject, grade_val, req.question_count)

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
            "difficulty": req.difficulty,
            "question_index": idx
        }

        questions_for_client.append(QuestionOut(
            id=q_id,
            question_text=q_text,
            options=options,
            subject=req.subject,
            chapter=chapter_name,
            difficulty=req.difficulty,
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
        difficulty=req.difficulty,
        question_count=len(questions_for_client),
        time_limit_seconds=time_limit_seconds,
        questions=questions_for_client,
        source=source
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
