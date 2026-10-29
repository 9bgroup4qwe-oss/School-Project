from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import quiz, timetable

app = FastAPI(
    title="GrowMyIQ Python Backend",
    description="FastAPI Backend for AI Quiz Generation and Study Planning in GrowMyIQ",
    version="2.0.0"
)

# Configure CORS to accept requests from Next.js development and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(timetable.router, prefix="/api/timetable", tags=["timetable"])

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "GrowMyIQ Backend API",
        "version": "2.0.0",
        "endpoints": [
            "/api/quiz/generate",
            "/api/timetable/chat",
            "/api/timetable/extract-text",
            "/docs"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "GrowMyIQ-FastAPI"}