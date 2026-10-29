import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_unauthorized_endpoints():
    # Quizzes require auth
    res = client.post("/api/quiz/generate", json={
        "subject": "Physics",
        "chapters": ["Kinematics"],
        "difficulty": "easy",
        "question_count": 5
    })
    assert res.status_code == 401

    # Timetables require auth
    res = client.get("/api/timetable")
    assert res.status_code == 401

    # Dashboard requires auth
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 401
