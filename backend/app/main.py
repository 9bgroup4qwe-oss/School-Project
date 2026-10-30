from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, quiz, timetable, dashboard

app = FastAPI(
    title="Grow My IQ Core API",
    description="Clean, secure backend powering AI-driven quizzes, timetables, and analytics.",
    version="2.0.0"
)

# Standardized JSON error response handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": str(exc)}}
    )

# Strict CORS: supports local dev + all Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(timetable.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Grow My IQ Core API", "version": "2.0.0"}
