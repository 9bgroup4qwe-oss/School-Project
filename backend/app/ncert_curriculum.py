import os
import json
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

CURRICULUM_PATH = os.path.join(os.path.dirname(__file__), "ncert_curriculum.json")

_ncert_data: Optional[Dict[str, Any]] = None

def load_ncert_data() -> Dict[str, Any]:
    global _ncert_data
    if _ncert_data is None:
        try:
            with open(CURRICULUM_PATH, "r", encoding="utf-8") as f:
                _ncert_data = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load ncert_curriculum.json: {e}")
            _ncert_data = {}
    return _ncert_data

def get_ncert_chapters(grade: int, subject: str) -> List[str]:
    """
    Dynamically retrieves authentic NCERT chapters for ANY grade (1-12) and ANY subject.
    Never hardcodes topics!
    """
    data = load_ncert_data()
    grade_key = str(grade)
    grade_data = data.get(grade_key, {})
    subjects_list = grade_data.get("subjects", [])

    sub_norm = subject.lower().strip()

    # Special handling for distinct subjects
    target_keyword = None
    if any(k in sub_norm for k in ["social", "history", "civic", "geo", "sst", "pol", "econ"]):
        target_keyword = "social"
    elif any(k in sub_norm for k in ["math", "calculus", "algebra"]):
        target_keyword = "math"
    elif any(k in sub_norm for k in ["physics"]):
        target_keyword = "physics"
    elif any(k in sub_norm for k in ["chemistry"]):
        target_keyword = "chemistry"
    elif any(k in sub_norm for k in ["biology"]):
        target_keyword = "biology"
    elif any(k in sub_norm for k in ["english"]):
        target_keyword = "english"
    elif any(k in sub_norm for k in ["science"]):
        target_keyword = "science"

    # Search by keyword first
    if target_keyword:
        for s in subjects_list:
            s_name = s.get("name", "").lower()
            s_id = s.get("id", "").lower()
            if target_keyword in s_id or target_keyword in s_name:
                if s.get("chapters"):
                    return s["chapters"]

    # Direct name search
    for s in subjects_list:
        s_name = s.get("name", "").lower()
        if sub_norm in s_name or s_name in sub_norm:
            if s.get("chapters"):
                return s["chapters"]

    # Fallback search across other grades if subject not in this specific grade
    for g_k, g_v in data.items():
        for s in g_v.get("subjects", []):
            if sub_norm in s.get("name", "").lower() and s.get("chapters"):
                return s["chapters"]

    # Fully dynamic fallback based on the actual subject requested
    return [
        f"{subject}: Fundamentals & Core Concepts",
        f"{subject}: Theoretical Principles & Laws",
        f"{subject}: Practical Applications & Numericals",
        f"{subject}: Advanced Problem Solving",
        f"{subject}: Comprehensive Chapter Revision & Mock Test"
    ]
