import os
import sqlite3
import json
import time
import hashlib
from typing import Dict, Any, List, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DB_DIR, "growmyiq.db")

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Users account table for authentic persistence
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password_hash TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Active quiz sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT,
            grade INTEGER,
            subject TEXT,
            chapters_json TEXT,
            questions_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Completed quiz submissions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_history (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            subject TEXT,
            chapters_json TEXT,
            total_questions INTEGER,
            correct_answers INTEGER,
            score_percentage REAL,
            time_taken INTEGER,
            results_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Saved timetables
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_timetables (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            timetable_json TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

# Auto-initialize tables
init_db()

def create_or_verify_user(email: str, password: Optional[str] = None) -> Dict[str, Any]:
    norm_email = email.lower().strip()
    user_id = f"usr_{hashlib.sha256(norm_email.encode()).hexdigest()[:16]}"
    pw_hash = hashlib.sha256((norm_email + ":" + (password or "default_pw")).encode()).hexdigest()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (norm_email,))
    row = cursor.fetchone()

    if not row:
        cursor.execute("""
            INSERT INTO users (id, email, password_hash)
            VALUES (?, ?, ?)
        """, (user_id, norm_email, pw_hash))
        conn.commit()
        ret_user = {"id": user_id, "email": norm_email}
    else:
        ret_user = {"id": row[0], "email": row[1]}

    conn.close()
    return ret_user

def save_quiz_session(
    session_id: str,
    user_id: str,
    grade: int,
    subject: str,
    chapters: List[str],
    questions_cache: Dict[str, Any]
):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO quiz_sessions 
        (session_id, user_id, grade, subject, chapters_json, questions_json)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        session_id,
        user_id,
        grade,
        subject,
        json.dumps(chapters),
        json.dumps(questions_cache)
    ))
    conn.commit()
    conn.close()

def get_quiz_session(session_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT session_id, user_id, grade, subject, chapters_json, questions_json
        FROM quiz_sessions WHERE session_id = ?
    """, (session_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "session_id": row[0],
        "user_id": row[1],
        "grade": row[2],
        "subject": row[3],
        "chapters": json.loads(row[4]),
        "questions": json.loads(row[5])
    }

def record_quiz_completion(
    user_id: str,
    subject: str,
    chapters: List[str],
    total_questions: int,
    correct_answers: int,
    score_percentage: float,
    time_taken: int,
    results: List[Dict[str, Any]]
):
    quiz_id = f"q_{int(time.time()*1000)}"
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO quiz_history 
        (id, user_id, subject, chapters_json, total_questions, correct_answers, score_percentage, time_taken, results_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        quiz_id,
        user_id,
        subject,
        json.dumps(chapters),
        total_questions,
        correct_answers,
        score_percentage,
        time_taken,
        json.dumps(results)
    ))
    conn.commit()
    conn.close()

def get_user_stats(user_id: str) -> Dict[str, Any]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, subject, chapters_json, total_questions, correct_answers, score_percentage, time_taken, results_json, created_at
        FROM quiz_history
        WHERE user_id = ?
        ORDER BY created_at ASC
    """, (user_id,))
    rows = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) FROM user_timetables WHERE user_id = ?", (user_id,))
    tt_count = cursor.fetchone()[0]
    conn.close()

    if not rows:
        return {
            "total_quizzes_completed": 0,
            "average_score": 0.0,
            "active_timetables_count": tt_count or 1,
            "weak_areas_count": 0,
            "recent_quizzes": [],
            "weak_areas": []
        }

    history = []
    chapter_stats: Dict[str, Dict[str, Any]] = {}

    for r in rows:
        chaps = json.loads(r[2])
        res_list = json.loads(r[7])
        entry = {
            "id": r[0],
            "subject": r[1],
            "chapters": chaps,
            "total_questions": r[3],
            "correct_answers": r[4],
            "score_percentage": r[5],
            "time_taken": r[6],
            "results": res_list,
            "created_at": r[8]
        }
        history.append(entry)

        sub = r[1]
        for res in res_list:
            chap = res.get("chapter") or (chaps[0] if chaps else sub)
            key = f"{sub}::: {chap}"
            if key not in chapter_stats:
                chapter_stats[key] = {"subject": sub, "chapter": chap, "correct": 0, "total": 0}
            chapter_stats[key]["total"] += 1
            if res.get("is_correct"):
                chapter_stats[key]["correct"] += 1

    total_quizzes = len(history)
    avg_score = round(sum(q["score_percentage"] for q in history) / total_quizzes, 1)

    weak_areas = []
    for key, cdata in chapter_stats.items():
        if cdata["total"] > 0:
            acc = round((cdata["correct"] / cdata["total"]) * 100, 1)
            # Chapter is flagged as weak if accuracy is below 70%
            if acc < 70.0:
                weak_areas.append({
                    "subject": cdata["subject"],
                    "chapter": cdata["chapter"],
                    "accuracy_rate": acc,
                    "total_tested": cdata["total"]
                })

    weak_areas.sort(key=lambda x: x["accuracy_rate"])

    return {
        "total_quizzes_completed": total_quizzes,
        "average_score": avg_score,
        "active_timetables_count": tt_count or 1,
        "weak_areas_count": len(weak_areas),
        "recent_quizzes": history[-5:],
        "weak_areas": weak_areas
    }

def save_user_timetable(user_id: str, timetable_data: Dict[str, Any]) -> str:
    tt_id = timetable_data.get("id") or f"tt_{int(time.time()*1000)}"
    timetable_data["id"] = tt_id
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO user_timetables (id, user_id, timetable_json, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    """, (tt_id, user_id, json.dumps(timetable_data)))
    conn.commit()
    conn.close()
    return tt_id

def get_user_timetable(user_id: str, timetable_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    row = None
    if timetable_id and timetable_id != "current-schedule-id":
        cursor.execute("""
            SELECT id, user_id, timetable_json, updated_at
            FROM user_timetables WHERE id = ? AND user_id = ?
        """, (timetable_id, user_id))
        row = cursor.fetchone()

    # Graceful fallback to user's latest timetable
    if not row:
        cursor.execute("""
            SELECT id, user_id, timetable_json, updated_at
            FROM user_timetables WHERE user_id = ?
            ORDER BY updated_at DESC LIMIT 1
        """, (user_id,))
        row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    data = json.loads(row[2])
    data["id"] = row[0]
    return data

def update_slot_status(user_id: str, timetable_id: str, slot_id: str, completed: bool) -> Optional[Dict[str, Any]]:
    tt = get_user_timetable(user_id, timetable_id)
    if not tt:
        return None

    calendar_schedule = tt.get("calendar_schedule", {})
    slot_found = False

    for date_key, day_info in calendar_schedule.items():
        slots = day_info.get("slots", []) if isinstance(day_info, dict) else day_info
        for slot in slots:
            if slot.get("slot_id") == slot_id or slot.get("topic") == slot_id:
                slot["completed"] = completed
                slot["completed_at"] = time.strftime("%Y-%m-%d %H:%M:%S") if completed else None
                slot_found = True
                break
        if slot_found:
            break

    # Recalculate completion statistics
    total_slots = 0
    completed_slots = 0
    for date_key, day_info in calendar_schedule.items():
        slots = day_info.get("slots", []) if isinstance(day_info, dict) else day_info
        for s in slots:
            if s.get("type") in ["study", "revision", "exam", "practice"]:
                total_slots += 1
                if s.get("completed"):
                    completed_slots += 1

    pct = round((completed_slots / total_slots * 100), 1) if total_slots > 0 else 0.0
    tt["completion_stats"] = {
        "total_topics": total_slots,
        "completed_topics": completed_slots,
        "progress_percentage": pct
    }

    save_user_timetable(user_id, tt)
    return tt
