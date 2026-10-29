from fastapi import APIRouter, Depends
from app.schemas import UserContext
from app.auth import get_current_user
from app.analytics_store import get_user_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def get_dashboard_summary(
    user: UserContext = Depends(get_current_user)
):
    """
    100% Real, Dynamic Metrics calculated directly from the student's actual quizzes!
    Zero hardcoded numbers.
    """
    stats = get_user_stats(user.user_id)
    
    return {
        "user_id": user.user_id,
        "email": user.email,
        "metrics": {
            "total_quizzes_completed": stats["total_quizzes_completed"],
            "average_score": stats["average_score"],
            "active_timetables_count": stats["active_timetables_count"],
            "weak_areas_count": stats["weak_areas_count"]
        },
        "recent_quizzes": stats["recent_quizzes"],
        "weak_areas": stats["weak_areas"]
    }
