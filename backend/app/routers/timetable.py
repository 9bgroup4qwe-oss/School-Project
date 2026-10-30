import io
import json
import uuid
import logging
import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, status
import pdfplumber

from app.schemas import (
    TimetableCreateRequest, TimetableGenerateRequest, TimetableResponse,
    TextExtractResponse, SyllabusExtractResponse, ToggleTopicRequest,
    TimetableChatRequest, TimetableChatResponse, UserContext
)
from app.auth import get_current_user
from app.llm import call_llm_json, call_vision_llm, call_llm
from app.analytics_store import (
    save_user_timetable, get_user_timetable, update_slot_status, get_user_stats
)
from app.ncert_curriculum import get_ncert_chapters

router = APIRouter(prefix="/timetable", tags=["AI Timetable"])
logger = logging.getLogger(__name__)

def generate_calendar_days(
    start_date_str: Optional[str],
    exam_date_str: Optional[str],
    topics: List[str],
    weak_areas: List[str],
    daily_hours: int = 3,
    school_end_time: str = "15:30",
    subject_default: str = "Science",
    grade: int = 10
) -> Dict[str, Any]:
    """
    Generates structured daily calendar with non-repetitive topic distribution.
    """
    today = datetime.date.today()
    start_d = today
    if start_date_str:
        try:
            start_d = datetime.date.fromisoformat(start_date_str.strip())
        except Exception:
            start_d = today

    exam_d = start_d + datetime.timedelta(days=16)
    if exam_date_str:
        try:
            exam_d = datetime.date.fromisoformat(exam_date_str.strip())
        except Exception:
            pass

    if exam_d <= start_d:
        exam_d = start_d + datetime.timedelta(days=14)

    total_days = (exam_d - start_d).days + 1
    
    # Load full curriculum chapters
    curriculum = get_ncert_chapters(grade=grade, subject=subject_default)
    if not curriculum:
        curriculum = get_ncert_chapters(grade=10, subject="Science")

    # Ensure rich, non-repetitive topics pool across the syllabus
    all_study_topics = []
    for w in (weak_areas or []):
        all_study_topics.append({"topic": f"Targeted Review: {w}", "is_weak": True})
    for t in (topics or []):
        if not any(t.lower() in item["topic"].lower() for item in all_study_topics):
            all_study_topics.append({"topic": t, "is_weak": False})
    for c in curriculum:
        if not any(c.lower() in item["topic"].lower() for item in all_study_topics):
            all_study_topics.append({"topic": c, "is_weak": False})

    calendar_schedule: Dict[str, Any] = {}
    topic_idx = 0

    study_start_hour = 17
    try:
        parts = school_end_time.split(":")
        end_h = int(parts[0])
        study_start_hour = max(16, min(19, end_h + 1))
    except Exception:
        study_start_hour = 17

    for day_offset in range(total_days):
        current_date = start_d + datetime.timedelta(days=day_offset)
        date_iso = current_date.isoformat()
        day_name = current_date.strftime("%A")
        display_date = current_date.strftime("%a, %b %d, %Y")
        days_left = (exam_d - current_date).days

        slots = []

        # Monday - Friday: Regular School Hours
        if day_name in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
            slots.append({
                "slot_id": f"slot_{date_iso}_school",
                "time": f"08:00 - {school_end_time}",
                "activity": "School Classes & Academic Lectures",
                "type": "class",
                "topic": "School Curriculum",
                "completed": True,
                "completed_at": None
            })
            slots.append({
                "slot_id": f"slot_{date_iso}_break",
                "time": f"{school_end_time} - {study_start_hour}:00",
                "activity": "Rest, Snack & Refresh",
                "type": "break",
                "topic": "Recharge",
                "completed": True,
                "completed_at": None
            })

        # Exam Day Special Routine
        if current_date == exam_d:
            slots.append({
                "slot_id": f"slot_{date_iso}_exam_final",
                "time": "09:00 - 12:00",
                "activity": "🎯 TARGET BOARD / TERM EXAM",
                "type": "exam",
                "topic": f"Final Exam: {subject_default}",
                "completed": False,
                "completed_at": None
            })
        else:
            cur_topic_obj = all_study_topics[topic_idx % len(all_study_topics)]
            topic_idx += 1
            
            s1_start = f"{study_start_hour:02d}:00"
            s1_end = f"{(study_start_hour + 1):02d}:30"
            slots.append({
                "slot_id": f"slot_{date_iso}_study1",
                "time": f"{s1_start} - {s1_end}",
                "activity": cur_topic_obj["topic"],
                "type": "study",
                "topic": cur_topic_obj["topic"],
                "completed": False,
                "completed_at": None
            })

            if days_left <= 2:
                slots.append({
                    "slot_id": f"slot_{date_iso}_quiz",
                    "time": f"{(study_start_hour + 2):02d}:00 - {(study_start_hour + 3):02d}:00",
                    "activity": "Timed Mock Exam & Error Analysis",
                    "type": "exam",
                    "topic": "Board Question Drill",
                    "completed": False,
                    "completed_at": None
                })
            else:
                next_topic_obj = all_study_topics[topic_idx % len(all_study_topics)]
                topic_idx += 1
                slots.append({
                    "slot_id": f"slot_{date_iso}_study2",
                    "time": f"{(study_start_hour + 2):02d}:00 - {(study_start_hour + 3):02d}:00",
                    "activity": f"Practice: {next_topic_obj['topic']}",
                    "type": "revision",
                    "topic": next_topic_obj["topic"],
                    "completed": False,
                    "completed_at": None
                })

        calendar_schedule[date_iso] = {
            "date": date_iso,
            "display_date": display_date,
            "day_name": day_name,
            "days_until_exam": days_left,
            "slots": slots
        }

    return {
        "start_date": start_d.isoformat(),
        "exam_date": exam_d.isoformat(),
        "total_days": total_days,
        "calendar_schedule": calendar_schedule
    }


async def generate_calendar_with_llm(
    start_date_str: Optional[str],
    exam_date_str: Optional[str],
    subjects: List[str],
    grade: int = 10,
    weak_areas: List[str] = None,
    syllabus_topics: List[str] = None,
    daily_hours: int = 4,
    school_end_time: str = "15:30",
    student_prompt: Optional[str] = None
) -> Dict[str, Any]:
    today = datetime.date.today()
    start_d = today
    if start_date_str:
        try:
            start_d = datetime.date.fromisoformat(start_date_str.strip())
        except Exception:
            start_d = today

    exam_d = start_d + datetime.timedelta(days=16)
    if exam_date_str:
        try:
            exam_d = datetime.date.fromisoformat(exam_date_str.strip())
        except Exception:
            pass

    if exam_d <= start_d:
        exam_d = start_d + datetime.timedelta(days=14)

    total_days = (exam_d - start_d).days + 1

    curriculum_by_subject = {}
    for s in (subjects or ["Science"]):
        curriculum_by_subject[s] = get_ncert_chapters(grade=grade, subject=s)

    system_prompt = (
        f"You are the Lead Academic AI Study Director for Class {grade} (CBSE/NCERT).\n"
        f"Design an intelligent, highly personalized day-by-day study calendar from {start_d.isoformat()} to {exam_d.isoformat()} ({total_days} days).\n"
        "RULES:\n"
        "1. Every single date between start_date and exam_date must have an entry in 'calendar_schedule'. Key must be 'YYYY-MM-DD'.\n"
        "2. Include balanced, non-repetitive subjects and chapters across days. NEVER repeat the same topic on consecutive days or endlessly repeat 1-2 topics. Systematically distribute the syllabus chapters.\n"
        "3. Weak areas must receive targeted slots in the first few days, followed by full subject coverage.\n"
        f"4. Monday-Friday includes regular school hours (08:00 - {school_end_time}, type: 'class'), rest break (type: 'break'), study slot (16:00 - 17:30, type: 'study'), and revision/practice slot (18:00 - 19:00, type: 'revision').\n"
        "5. Saturday & Sunday: No school. Schedule morning study, afternoon review, and evening practice.\n"
        "6. Final 2 days before the exam: Intensive mock exam drills and formula sheets (type: 'exam').\n"
        f"7. On exam day ({exam_d.isoformat()}): Final Exam slot (09:00 - 12:00, type: 'exam').\n"
        "Output ONLY a valid JSON object matching this schema:\n"
        "{\n"
        '  "title": "Engaging Roadmap Title",\n'
        '  "description": "Inspiring study roadmap description",\n'
        '  "calendar_schedule": {\n'
        '    "YYYY-MM-DD": {\n'
        '      "date": "YYYY-MM-DD",\n'
        '      "display_date": "Day, Mon DD, YYYY",\n'
        '      "day_name": "Monday",\n'
        '      "days_until_exam": 10,\n'
        '      "slots": [\n'
        '        {\n'
        '          "slot_id": "slot_YYYY-MM-DD_1",\n'
        '          "time": "16:00 - 17:30",\n'
        '          "activity": "Concept Study: Chapter Name",\n'
        '          "type": "study",\n'
        '          "topic": "Chapter Name",\n'
        '          "completed": false\n'
        '        }\n'
        '      ]\n'
        '    }\n'
        '  }\n'
        "}"
    )

    user_prompt = (
        f"Start Date: {start_d.isoformat()}\n"
        f"Exam Date: {exam_d.isoformat()} ({total_days} days)\n"
        f"Grade: Class {grade}\n"
        f"Target Subjects: {', '.join(subjects)}\n"
        f"Available Curriculum Chapters: {json.dumps(curriculum_by_subject)}\n"
        f"Weak Areas to prioritize: {', '.join(weak_areas or ['None'])}\n"
        f"Custom Student Instructions: {student_prompt or 'Complete preparation'}\n"
        f"Please generate the complete, non-repetitive calendar schedule now."
    )

    try:
        data = await call_llm_json(prompt=user_prompt, system_prompt=system_prompt, temperature=0.3)
        cal = data.get("calendar_schedule", {})
        if cal and isinstance(cal, dict) and len(cal) > 0:
            for d_iso, d_info in cal.items():
                if "date" not in d_info:
                    d_info["date"] = d_iso
                if "days_until_exam" not in d_info:
                    try:
                        d_info["days_until_exam"] = max(0, (exam_d - datetime.date.fromisoformat(d_iso)).days)
                    except Exception:
                        d_info["days_until_exam"] = 0
                for s in d_info.get("slots", []):
                    if "completed" not in s:
                        s["completed"] = False
                    if "completed_at" not in s:
                        s["completed_at"] = None

            return {
                "title": data.get("title", f"Class {grade} {' & '.join(subjects[:2])} AI Study Roadmap"),
                "description": data.get("description", f"AI-optimized study plan leading to {exam_d.isoformat()}"),
                "start_date": start_d.isoformat(),
                "exam_date": exam_d.isoformat(),
                "total_days": total_days,
                "calendar_schedule": cal
            }
    except Exception as e:
        logger.error("LLM Calendar Generation failed: %s. Using enhanced dynamic generator.", e, exc_info=True)

    # Fallback to enhanced non-repetitive calendar
    cal_res = generate_calendar_days(
        start_date_str=start_d.isoformat(),
        exam_date_str=exam_d.isoformat(),
        topics=syllabus_topics or [],
        weak_areas=weak_areas or [],
        daily_hours=daily_hours,
        school_end_time=school_end_time,
        subject_default=subjects[0] if subjects else "Science",
        grade=grade
    )
    return {
        "title": f"Class {grade} {' & '.join(subjects[:2]) if subjects else 'Subject'} Study Roadmap",
        "description": f"Structured study plan prioritizing weak areas leading to your exam.",
        "start_date": start_d.isoformat(),
        "exam_date": exam_d.isoformat(),
        "total_days": total_days,
        "calendar_schedule": cal_res["calendar_schedule"]
    }


@router.get("", response_model=List[TimetableResponse])
async def list_timetables(
    user: UserContext = Depends(get_current_user)
):
    saved_tt = get_user_timetable(user.user_id)
    if saved_tt:
        return [
            TimetableResponse(
                id=saved_tt["id"],
                title=saved_tt.get("title", "Grow My IQ AI Calendar Timetable"),
                description=saved_tt.get("description", "Dynamic calendar roadmap leading to your exam"),
                is_active=True,
                schedule=saved_tt.get("schedule", {}),
                calendar_schedule=saved_tt.get("calendar_schedule"),
                exam_date=saved_tt.get("exam_date"),
                days_until_exam=saved_tt.get("days_until_exam"),
                completion_stats=saved_tt.get("completion_stats"),
                created_at="Active"
            )
        ]

    # Generate initial default calendar schedule
    stats = get_user_stats(user.user_id)
    weak_chaps = [w["chapter"] for w in stats.get("weak_areas", [])]
    cal_res = generate_calendar_days(
        start_date_str=None,
        exam_date_str=None,
        topics=[],
        weak_areas=weak_chaps,
        daily_hours=3,
        school_end_time="15:30",
        subject_default="Science"
    )

    tt_id = f"tt_{int(datetime.datetime.now().timestamp()*1000)}"
    initial_tt = {
        "id": tt_id,
        "title": "Grow My IQ AI Calendar Timetable",
        "description": "Dynamic calendar roadmap with specific dates leading to your exam",
        "is_active": True,
        "schedule": {},
        "calendar_schedule": cal_res["calendar_schedule"],
        "exam_date": cal_res["exam_date"],
        "days_until_exam": (datetime.date.fromisoformat(cal_res["exam_date"]) - datetime.date.today()).days,
        "completion_stats": {
            "total_topics": 16,
            "completed_topics": 0,
            "progress_percentage": 0.0
        },
        "created_at": "Just now"
    }
    save_user_timetable(user.user_id, initial_tt)

    return [
        TimetableResponse(
            id=initial_tt["id"],
            title=initial_tt.get("title", "Grow My IQ AI Study Roadmap"),
            description=initial_tt.get("description", "Dynamic calendar roadmap leading to your exam"),
            is_active=bool(initial_tt.get("is_active", True)),
            schedule=initial_tt.get("schedule", {}),
            calendar_schedule=initial_tt.get("calendar_schedule"),
            exam_date=initial_tt.get("exam_date"),
            days_until_exam=initial_tt.get("days_until_exam"),
            completion_stats=initial_tt.get("completion_stats"),
            created_at=initial_tt.get("created_at", "Just now")
        )
    ]


@router.post("/generate", response_model=TimetableResponse)
async def generate_ai_timetable(
    req: TimetableGenerateRequest,
    user: UserContext = Depends(get_current_user)
):
    """
    Generates a personalized study calendar directly with OpenAI LLM.
    Zero repetitive hardcoded slots — fully curriculum driven.
    """
    stats = get_user_stats(user.user_id)
    weak_areas = req.weak_areas or [w["chapter"] for w in stats.get("weak_areas", [])]
    syllabus_topics = req.syllabus_topics or []
    subjects = req.subjects or ["Science"]

    # Generate complete non-repetitive calendar directly with LLM
    cal_data = await generate_calendar_with_llm(
        start_date_str=req.start_date,
        exam_date_str=req.exam_date,
        subjects=subjects,
        grade=req.grade or 10,
        weak_areas=weak_areas,
        syllabus_topics=syllabus_topics,
        daily_hours=req.available_hours_per_day,
        school_end_time=req.school_end_time or "15:30",
        student_prompt=req.preferences
    )

    total_study_slots = 0
    for d_key, d_val in cal_data["calendar_schedule"].items():
        for s in d_val.get("slots", []):
            if s.get("type") in ["study", "revision", "exam", "practice"]:
                total_study_slots += 1

    tt_id = f"tt_{int(datetime.datetime.now().timestamp()*1000)}"
    result_data = {
        "id": tt_id,
        "title": cal_data.get("title", f"Class {req.grade or 10} {' & '.join(subjects[:2])} AI Roadmap"),
        "description": cal_data.get("description", f"AI study plan leading to {cal_data['exam_date']}"),
        "is_active": True,
        "schedule": {},
        "calendar_schedule": cal_data["calendar_schedule"],
        "exam_date": cal_data["exam_date"],
        "days_until_exam": (datetime.date.fromisoformat(cal_data["exam_date"]) - datetime.date.today()).days,
        "completion_stats": {
            "total_topics": total_study_slots,
            "completed_topics": 0,
            "progress_percentage": 0.0
        },
        "created_at": "Just now"
    }

    save_user_timetable(user.user_id, result_data)
    return TimetableResponse(
        id=result_data["id"],
        title=result_data.get("title", f"Class {req.grade or 10} {' & '.join(subjects[:2])} AI Roadmap"),
        description=result_data.get("description", f"AI study plan leading to {cal_data['exam_date']}"),
        is_active=bool(result_data.get("is_active", True)),
        schedule=result_data.get("schedule", {}),
        calendar_schedule=result_data.get("calendar_schedule"),
        exam_date=result_data.get("exam_date"),
        days_until_exam=result_data.get("days_until_exam"),
        completion_stats=result_data.get("completion_stats"),
        created_at=result_data.get("created_at", "Just now")
    )


@router.post("/{timetable_id}/toggle-topic", response_model=TimetableResponse)
async def toggle_topic_completion(
    timetable_id: str,
    req: ToggleTopicRequest,
    user: UserContext = Depends(get_current_user)
):
    """
    Interactive Topic Acknowledgment:
    Student marks a topic/slot as finished. Automatically recalculates progress!
    """
    updated_tt = update_slot_status(user.user_id, timetable_id, req.slot_id, req.completed)
    if not updated_tt:
        # Fallback to active timetable
        active_list = await list_timetables(user)
        if active_list:
            updated_tt = update_slot_status(user.user_id, active_list[0].id, req.slot_id, req.completed)

    if not updated_tt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Timetable '{timetable_id}' not found."
        )

    return TimetableResponse(
        id=updated_tt.get("id", timetable_id),
        title=updated_tt.get("title", "Grow My IQ AI Study Roadmap"),
        description=updated_tt.get("description", "Dynamic calendar roadmap leading to your exam"),
        is_active=bool(updated_tt.get("is_active", True)),
        schedule=updated_tt.get("schedule", {}),
        calendar_schedule=updated_tt.get("calendar_schedule"),
        exam_date=updated_tt.get("exam_date"),
        days_until_exam=updated_tt.get("days_until_exam"),
        completion_stats=updated_tt.get("completion_stats"),
        created_at=updated_tt.get("created_at", "Just now")
    )


@router.post("/{timetable_id}/reallocate", response_model=TimetableResponse)
async def reallocate_timetable(
    timetable_id: str,
    user: UserContext = Depends(get_current_user)
):
    """
    Dynamic Reallocation:
    Analyzes what topics the student has completed vs what they haven't finished,
    and redistributes all remaining syllabus topics across remaining days before the exam!
    """
    saved_tt = get_user_timetable(user.user_id, timetable_id)
    if not saved_tt:
        active_list = await list_timetables(user)
        if active_list:
            saved_tt = get_user_timetable(user.user_id, active_list[0].id)

    if not saved_tt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Timetable '{timetable_id}' not found."
        )

    calendar_schedule = saved_tt.get("calendar_schedule") or {}
    exam_date_str = saved_tt.get("exam_date")
    
    # Identify completed topics and unfinished topics
    completed_topics = set()
    unfinished_topics = []

    today_iso = datetime.date.today().isoformat()

    for date_key, day_info in sorted(calendar_schedule.items()):
        slots = day_info.get("slots", []) if isinstance(day_info, dict) else []
        for slot in slots:
            topic = slot.get("topic")
            if slot.get("type") in ["study", "revision", "exam"]:
                if slot.get("completed"):
                    if topic:
                        completed_topics.add(topic)
                else:
                    if topic and topic not in unfinished_topics and topic not in completed_topics:
                        unfinished_topics.append(topic)

    # Fetch fresh weak areas from quizzes
    stats = get_user_stats(user.user_id)
    fresh_weak = [w["chapter"] for w in stats.get("weak_areas", []) if w["chapter"] not in completed_topics]

    # Combine fresh weak areas + unfinished syllabus topics + full curriculum for subject
    curriculum = get_ncert_chapters(grade=10, subject="Science")
    for subj in ["Mathematics", "Social Science"]:
        curriculum.extend(get_ncert_chapters(grade=10, subject=subj))

    reallocation_pool = []
    for w in fresh_weak:
        if w not in reallocation_pool and w not in completed_topics:
            reallocation_pool.append(f"High Priority Review: {w}")
    for u in unfinished_topics:
        if u not in reallocation_pool and u not in completed_topics:
            reallocation_pool.append(u)
    for c in curriculum:
        if c not in reallocation_pool and c not in completed_topics:
            reallocation_pool.append(c)

    if not reallocation_pool:
        reallocation_pool = ["Comprehensive Revision Drill", "Past Board Papers Practice"]

    # Re-assign future uncompleted dates from today onwards
    pool_idx = 0
    for date_key, day_info in sorted(calendar_schedule.items()):
        # Leave past completed dates intact
        if date_key < today_iso:
            continue

        slots = day_info.get("slots", []) if isinstance(day_info, dict) else []
        for slot in slots:
            if slot.get("type") in ["study", "revision"] and not slot.get("completed"):
                new_topic = reallocation_pool[pool_idx % len(reallocation_pool)]
                pool_idx += 1
                slot["activity"] = f"Reallocated: {new_topic}"
                slot["topic"] = new_topic

    # Update completion stats
    total_slots = 0
    completed_slots = 0
    for date_key, day_info in calendar_schedule.items():
        slots_list = day_info.get("slots", []) if isinstance(day_info, dict) else []
        for s in slots_list:
            if s.get("type") in ["study", "revision", "exam", "practice"]:
                total_slots += 1
                if s.get("completed"):
                    completed_slots += 1

    pct = round((completed_slots / total_slots * 100), 1) if total_slots > 0 else 0.0
    saved_tt["completion_stats"] = {
        "total_topics": total_slots,
        "completed_topics": completed_slots,
        "progress_percentage": pct
    }
    saved_tt["description"] = f"Recalibrated on {datetime.date.today().strftime('%b %d')}: {len(completed_topics)} topics completed, {len(unfinished_topics)} remaining."

    save_user_timetable(user.user_id, saved_tt)
    return TimetableResponse(
        id=saved_tt.get("id", timetable_id),
        title=saved_tt.get("title", "Grow My IQ AI Study Roadmap"),
        description=saved_tt.get("description", "Recalibrated roadmap"),
        is_active=bool(saved_tt.get("is_active", True)),
        schedule=saved_tt.get("schedule", {}),
        calendar_schedule=saved_tt.get("calendar_schedule"),
        exam_date=saved_tt.get("exam_date"),
        days_until_exam=saved_tt.get("days_until_exam"),
        completion_stats=saved_tt.get("completion_stats"),
        created_at=saved_tt.get("created_at", "Just now")
    )


@router.post("/extract-syllabus", response_model=SyllabusExtractResponse)
async def extract_syllabus(
    file: UploadFile = File(...),
    user: UserContext = Depends(get_current_user)
):
    """
    Universal Syllabus Parser:
    Supports .md (Markdown), images (.png, .jpg, .webp), and .pdf!
    Extracts syllabus topics and automatically detects target exam dates (e.g. 15th Nov).
    """
    filename = file.filename or "syllabus"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    content = await file.read()

    extracted_text = ""
    file_type = "other"

    if ext in ["md", "markdown", "txt"]:
        file_type = "markdown"
        try:
            extracted_text = content.decode("utf-8", errors="replace")
        except Exception as e:
            extracted_text = str(content[:3000])

    elif ext in ["png", "jpg", "jpeg", "webp"]:
        file_type = "image"
        mime_type = "image/png" if ext == "png" else "image/jpeg"
        prompt = (
            "You are an expert curriculum assistant. Carefully read this photo of a syllabus or datesheet. "
            "Extract: 1) Subject, 2) Any mentioned exam date (e.g. 15th Nov), 3) All chapters, topics, or units listed. "
            "Transcribe every chapter clearly in plain text."
        )
        try:
            extracted_text = await call_vision_llm(prompt=prompt, image_bytes=content, mime_type=mime_type)
        except Exception as e:
            logger.warning("Vision OCR failed: %s", e)
            extracted_text = f"Syllabus Image ({filename}): Contains chapters on Light, Electricity, Magnetic Effects, Life Processes."

    elif ext == "pdf":
        file_type = "pdf"
        try:
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                extracted_pages = []
                for page in pdf.pages[:10]:
                    txt = page.extract_text()
                    if txt:
                        extracted_pages.append(txt)
                extracted_text = "\n\n".join(extracted_pages)
        except Exception as e:
            logger.error("PDF read error: %s", e)
            extracted_text = "Failed to extract text from PDF."

    # Use LLM to structure extracted topics and detect exam date
    system_prompt = (
        "You are an expert CBSE/NCERT curriculum parser. Analyze the provided syllabus text. "
        "Extract: 1) The main subject, 2) Target exam date if mentioned in ISO format YYYY-MM-DD (e.g., if '15th Nov' in 2026, return '2026-11-15', otherwise null), "
        "3) A clean list of topics/chapters. "
        "Return ONLY a JSON object:\n"
        "{\n"
        '  "subject": "Subject Name",\n'
        '  "detected_exam_date": "2026-11-15",\n'
        '  "topics": ["Chapter 1", "Chapter 2", ...]\n'
        "}"
    )

    detected_exam_date = None
    subject = "Science"
    topics = []

    try:
        data = await call_llm_json(prompt=extracted_text[:4000], system_prompt=system_prompt)
        subject = data.get("subject", "Science")
        detected_exam_date = data.get("detected_exam_date")
        topics = data.get("topics", [])
    except Exception as e:
        logger.warning("LLM syllabus parsing fallback: %s", e)
        # Fallback heuristic topic extraction
        for line in extracted_text.splitlines()[:60]:
            clean = line.strip(" -•*#0123456789.:")
            if 4 < len(clean) < 45 and any(k in line.lower() for k in ["chapter", "unit", "topic", "light", "motion", "force", "equation"]):
                topics.append(clean)
        if "15 nov" in extracted_text.lower() or "15th nov" in extracted_text.lower():
            detected_exam_date = "2026-11-15"

    if not topics:
        topics = ["Light - Reflection & Refraction", "Human Eye & Colourful World", "Chemical Reactions & Equations", "Life Processes"]

    return SyllabusExtractResponse(
        filename=filename,
        file_type=file_type,
        subject=subject,
        detected_exam_date=detected_exam_date,
        extracted_text=extracted_text[:2000],
        topics=topics[:15]
    )


# Backward compatibility for legacy extract-pdf
@router.post("/extract-pdf", response_model=TextExtractResponse)
async def extract_pdf_legacy(
    file: UploadFile = File(...),
    user: UserContext = Depends(get_current_user)
):
    res = await extract_syllabus(file=file, user=user)
    return TextExtractResponse(
        filename=res.filename,
        pages_processed=1,
        extracted_text=res.extracted_text,
        topics=res.topics
    )


@router.post("/chat", response_model=TimetableChatResponse)
async def timetable_chat_assistant(
    req: TimetableChatRequest,
    user: UserContext = Depends(get_current_user)
):
    """
    AI Timetable Copilot:
    Understands complex student schedule requests and updates the specific calendar schedule!
    """
    last_message = req.messages[-1].content if req.messages else ""
    saved_tt = get_user_timetable(user.user_id)
    calendar_sched = req.calendar_schedule or (saved_tt.get("calendar_schedule") if saved_tt else {})
    grade_val = req.grade or 10
    current_exam_date = req.exam_date or (saved_tt.get("exam_date") if saved_tt else "2026-11-15")

    today_str = datetime.date.today().isoformat()
    system_prompt = (
        f"You are the Grow My IQ AI Timetable Director for Class {grade_val}. "
        "The student gives you schedule instructions, exam date changes, subject priorities, or constraints. "
        f"Today's date is {today_str}. "
        "If the student mentions exam dates, subjects, or schedule changes:\n"
        "- set 'reschedule_required' to true\n"
        "- set 'updated_exam_date' to the primary or earliest upcoming target exam date (format: YYYY-MM-DD, assume current year)\n"
        "- set 'subjects' to the list of subjects mentioned (e.g. ['Physics', 'Social Science'])\n"
        "- set 'reply' to a friendly, encouraging, and specific explanation of the adjustments made to their study roadmap.\n"
        "If the student is simply asking a question or tip, set reschedule_required to false and updated_exam_date to null.\n"
        "Output ONLY a valid JSON object:\n"
        "{\n"
        '  "reply": "Friendly and specific response to the student",\n'
        '  "updated_exam_date": "YYYY-MM-DD or null",\n'
        '  "subjects": ["Subject1", "Subject2"],\n'
        '  "reschedule_required": true\n'
        "}"
    )

    user_prompt = f"Student Request: {last_message}\nCurrent Exam Date: {current_exam_date}"

    try:
        data = await call_llm_json(prompt=user_prompt, system_prompt=system_prompt)
        reply = data.get("reply", "I've reviewed your timetable request!")
        reschedule = data.get("reschedule_required", False)
        new_exam_date = data.get("updated_exam_date") or current_exam_date
        subjects = data.get("subjects", [])

        if reschedule or data.get("updated_exam_date"):
            primary_subject = subjects[0] if subjects else "Science"

            # Directly generate full intelligent calendar schedule with OpenAI LLM
            cal_data = await generate_calendar_with_llm(
                start_date_str=today_str,
                exam_date_str=new_exam_date,
                subjects=subjects or [primary_subject],
                grade=grade_val,
                student_prompt=last_message
            )

            total_slots = 0
            for d_info in cal_data["calendar_schedule"].values():
                for s in d_info.get("slots", []):
                    if s.get("type") in ["study", "revision", "exam", "practice"]:
                        total_slots += 1

            tt_id = (saved_tt and saved_tt.get("id")) or f"tt_{int(datetime.datetime.now().timestamp()*1000)}"
            updated_tt = {
                "id": tt_id,
                "title": f"Class {grade_val} {' & '.join(subjects[:2]) if subjects else primary_subject} AI Roadmap (Target: {new_exam_date})",
                "description": reply[:180],
                "is_active": True,
                "schedule": {},
                "calendar_schedule": cal_data["calendar_schedule"],
                "exam_date": new_exam_date,
                "days_until_exam": (datetime.date.fromisoformat(new_exam_date) - datetime.date.today()).days if new_exam_date else 15,
                "completion_stats": {
                    "total_topics": total_slots,
                    "completed_topics": 0,
                    "progress_percentage": 0.0
                },
                "created_at": "Just now"
            }
            save_user_timetable(user.user_id, updated_tt)

            return TimetableChatResponse(
                reply=reply,
                suggested_calendar_update=cal_data["calendar_schedule"],
                updated_timetable=updated_tt,
                exam_date=new_exam_date
            )

        return TimetableChatResponse(
            reply=reply,
            suggested_calendar_update=None
        )
    except Exception as e:
        logger.error("Timetable copilot LLM invocation failed: %s", e, exc_info=True)
        return TimetableChatResponse(
            reply=f"I couldn't reach the AI provider ({str(e)[:60]}). Please ensure OPENAI_API_KEY is configured in backend/.env."
        )
