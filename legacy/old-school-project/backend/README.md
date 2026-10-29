# GrowMyIQ - Python Backend API

FastAPI backend service powering AI Quiz Generation, Intelligent Practice Questioning, and Timetable/Syllabus processing for GrowMyIQ.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://127.0.0.1:8000`  
Interactive Swagger docs: `http://127.0.0.1:8000/docs`

## Endpoints
- `GET /` — API status
- `GET /health` — Health check
- `POST /api/quiz/generate` — Generate tailored quiz questions for subjects/chapters
- `POST /api/timetable/chat` — Conversational schedule planner
- `POST /api/timetable/extract-text` — Extract topics from syllabus PDFs/images
