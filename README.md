# Grow My IQ: Next-Gen AI Study Companion & Assessment Engine

Clean, secure, high-performance web architecture replacing legacy code.

- **Backend**: FastAPI (Python 3.13), async OpenRouter LLM orchestration, server-side quiz grading, Supabase database + JWT authentication.
- **Frontend**: Plain JavaScript (React JSX + Vite), modern dark-mode aesthetic with custom design tokens, single-source API service.
- **Database**: PostgreSQL (Supabase) with hardened Row-Level Security (RLS) policies.

---

## 🚀 Quickstart

### 1. Backend (FastAPI)
```bash
cd backend
/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run automated tests
PYTHONPATH=. pytest

# Start development server on port 8000
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
# App starts instantly at http://localhost:5173
```

---

## 🔒 Security & Architecture Fixes Addressed
1. **Server-Side Grading**: Quiz answers are never shipped to the client ahead of time. Grading and percentage calculation happen strictly on the server.
2. **Safe PDF Parsing**: Syllabus extractor handles `None` text pages and memory buffering safely with strict 15MB limits.
3. **Hardened RLS**: Replaced open `WITH CHECK (true)` policies with strict `auth.uid() = user_id` ownership checks.
4. **Resilient AI Fallback**: OpenRouter queries use an async non-blocking client with 45s timeout. If external AI fails or times out, curriculum-based questions are loaded automatically without crashing the UI.
5. **Clean Type-Free Frontend**: Removed conflicting React 18/19 and TypeScript build breaks; now runs on fast, modular plain JavaScript.
