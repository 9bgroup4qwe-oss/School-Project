# Learn.ai - API Endpoints Documentation

## 📋 API Overview

The Learn.ai platform uses a combination of Supabase auto-generated REST APIs and custom Python backend services. All endpoints follow RESTful conventions and return JSON responses.

### Base URLs
- **Supabase API:** `https://[project-ref].supabase.co/rest/v1/`
- **Python Backend:** `https://api.learn.ai/v1/`
- **Auth API:** `https://[project-ref].supabase.co/auth/v1/`

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-09-30T10:00:00Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "code": 400,
  "timestamp": "2024-09-30T10:00:00Z"
}
```

---

## 🔐 Authentication Endpoints

### 1. User Registration
**POST** `/auth/v1/signup`
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "options": {
    "data": {
      "full_name": "John Doe",
      "grade_level": 10
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "email_confirmed_at": null
    },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token"
    }
  }
}
```

### 2. Email Login
**POST** `/auth/v1/token?grant_type=password`
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### 3. Google OAuth
**GET** `/auth/v1/authorize?provider=google`

### 4. Email Verification
**POST** `/auth/v1/verify`
```json
{
  "email": "user@example.com",
  "token": "verification-token"
}
```

### 5. Password Reset
**POST** `/auth/v1/recover`
```json
{
  "email": "user@example.com"
}
```

### 6. Refresh Token
**POST** `/auth/v1/token?grant_type=refresh_token`
```json
{
  "refresh_token": "refresh-token"
}
```

---

## 👤 User Management Endpoints

### 1. Get User Profile
**GET** `/rest/v1/profiles?select=*`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "grade_level": 10,
      "school_name": "ABC School",
      "created_at": "2024-09-30T10:00:00Z",
      "preferences": {
        "theme": "light",
        "notifications_enabled": true,
        "study_reminders": true,
        "quiz_reminders": true
      }
    }
  ]
}
```

### 2. Update User Profile
**PATCH** `/rest/v1/profiles?id=eq.{user_id}`
```json
{
  "full_name": "Jane Doe",
  "grade_level": 11,
  "school_name": "XYZ School",
  "preferences": {
    "theme": "dark",
    "notifications_enabled": true
  }
}
```

### 3. Update User Preferences
**PATCH** `/rest/v1/profiles?id=eq.{user_id}`
```json
{
  "preferences": {
    "study_reminders": true,
    "quiz_reminders": true,
    "reminder_time": "18:00",
    "theme": "light"
  }
}
```

---

## 📝 Quiz Endpoints

### 1. Generate Quiz
**POST** `/api/v1/quiz/generate`
```json
{
  "topic_id": "uuid",
  "question_count": 10,
  "question_types": ["mcq", "multi_select"],
  "difficulty_level": 3,
  "quiz_type": "custom"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quiz_id": "uuid",
    "questions": [
      {
        "id": "uuid",
        "type": "mcq",
        "question": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "difficulty": 2,
        "topic": "Geography"
      }
    ],
    "time_limit": 600
  }
}
```

### 2. Get Preset Quiz
**GET** `/api/v1/quiz/preset/{type}`
- `{type}`: `short` (5 questions), `medium` (10 questions), `long` (20 questions)

### 3. Submit Quiz Answer
**POST** `/rest/v1/user_answers`
```json
{
  "quiz_attempt_id": "uuid",
  "question_id": "uuid",
  "user_answer": "Paris",
  "time_spent": 30
}
```

### 4. Complete Quiz Attempt
**POST** `/rest/v1/quiz_attempts`
```json
{
  "user_id": "uuid",
  "quiz_type": "medium",
  "questions": ["uuid1", "uuid2", "uuid3"],
  "score": 8,
  "total_questions": 10,
  "time_taken": 450,
  "is_retry": false
}
```

### 5. Get Quiz History
**GET** `/rest/v1/quiz_attempts?select=*&user_id=eq.{user_id}&order=completed_at.desc`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "quiz_type": "medium",
      "score": 8,
      "total_questions": 10,
      "time_taken": 450,
      "completed_at": "2024-09-30T10:00:00Z",
      "is_retry": false
    }
  ]
}
```

### 6. Get Retry Questions
**GET** `/api/v1/quiz/retry/{user_id}`
```json
{
  "success": true,
  "data": {
    "incorrect_answers": [
      {
        "question_id": "uuid",
        "question": "What is the capital of France?",
        "user_answer": "London",
        "correct_answer": "Paris",
        "attempts": 3
      }
    ]
  }
}
```

### 7. Get Quiz Statistics
**GET** `/api/v1/quiz/stats/{user_id}`
```json
{
  "success": true,
  "data": {
    "total_quizzes": 25,
    "average_score": 7.8,
    "best_score": 10,
    "improvement_rate": 15,
    "subject_performance": {
      "Mathematics": 8.2,
      "Science": 7.5,
      "English": 8.0
    }
  }
}
```

---

## 📚 Study Planner Endpoints

### 1. Create Study Plan
**POST** `/rest/v1/study_plans`
```json
{
  "user_id": "uuid",
  "name": "Final Exam Preparation",
  "description": "Comprehensive study plan for final exams",
  "start_date": "2024-10-01",
  "end_date": "2024-12-15",
  "target_goals": {
    "mathematics": 90,
    "science": 85,
    "english": 88
  },
  "is_active": true
}
```

### 2. Get Study Plans
**GET** `/rest/v1/study_plans?user_id=eq.{user_id}&is_active=eq.true`

### 3. Update Study Progress
**PATCH** `/rest/v1/study_progress?id=eq.{progress_id}`
```json
{
  "status": "completed",
  "completion_percentage": 100,
  "time_spent": 120,
  "understanding_level": 4
}
```

### 4. Log Study Session
**POST** `/rest/v1/study_sessions`
```json
{
  "user_id": "uuid",
  "study_plan_id": "uuid",
  "topic_id": "uuid",
  "duration": 45,
  "notes": "Completed quadratic equations practice",
  "session_type": "planned"
}
```

### 5. Get Study Progress
**GET** `/rest/v1/study_progress?user_id=eq.{user_id}`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "topic_id": "uuid",
      "status": "in_progress",
      "completion_percentage": 65,
      "time_spent": 180,
      "last_studied": "2024-09-30T10:00:00Z",
      "understanding_level": 3
    }
  ]
}
```

### 6. Get Subject Progress
**GET** `/api/v1/study/progress/{user_id}/subjects`
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "name": "Mathematics",
        "completion_percentage": 75,
        "time_spent": 720,
        "last_studied": "2024-09-30T10:00:00Z"
      }
    ]
  }
}
```

### 7. Upload Timetable
**POST** `/api/v1/study/timetable/upload`
```json
{
  "file": "base64-encoded-file",
  "file_type": "pdf",
  "user_id": "uuid"
}
```

---

## 📊 Dashboard & Analytics Endpoints

### 1. Get Dashboard Data
**GET** `/api/v1/dashboard/{user_id}`
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_study_time": 2540,
      "quizzes_completed": 25,
      "topics_completed": 18,
      "current_streak": 7
    },
    "recent_activity": [
      {
        "type": "quiz_completed",
        "title": "Mathematics Quiz",
        "timestamp": "2024-09-30T10:00:00Z",
        "score": 8
      }
    ],
    "upcoming_reminders": [
      {
        "type": "study_reminder",
        "title": "Study Physics Chapter 5",
        "due_date": "2024-10-01T18:00:00Z"
      }
    ]
  }
}
```

### 2. Get Progress Overview
**GET** `/api/v1/progress/overview/{user_id}`
```json
{
  "success": true,
  "data": {
    "overall_progress": 68,
    "subject_progress": [
      {
        "subject": "Mathematics",
        "progress": 75,
        "time_spent": 720
      }
    ],
    "weekly_goals": {
      "target": 300,
      "achieved": 245,
      "percentage": 82
    }
  }
}
```

### 3. Get Study Streaks
**GET** `/rest/v1/user_streaks?user_id=eq.{user_id}`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "current_streak": 7,
      "longest_streak": 21,
      "last_activity_date": "2024-09-30",
      "streak_freeze_available": true
    }
  ]
}
```

### 4. Get Recent Activity
**GET** `/api/v1/activity/recent/{user_id}?limit=10`

### 5. Get Performance Analytics
**GET** `/api/v1/analytics/performance/{user_id}`
```json
{
  "success": true,
  "data": {
    "quiz_performance": {
      "average_score": 7.8,
      "improvement_trend": "positive",
      "strengths": ["Algebra", "Geometry"],
      "weaknesses": ["Trigonometry"]
    },
    "study_efficiency": {
      "average_session_time": 45,
      "focus_score": 8.2,
      "retention_rate": 78
    }
  }
}
```

---

## 📚 Content & Curriculum Endpoints

### 1. Get Subjects by Grade
**GET** `/rest/v1/subjects?grade_level=eq.{grade}&is_active=eq.true`

### 2. Get Chapters by Subject
**GET** `/rest/v1/chapters?subject_id=eq.{subject_id}&is_active=eq.true`

### 3. Get Topics by Chapter
**GET** `/rest/v1/topics?chapter_id=eq.{chapter_id}`

### 4. Get NCERT Syllabus
**GET** `/api/v1/curriculum/ncert/{grade}`
```json
{
  "success": true,
  "data": {
    "grade": 10,
    "subjects": [
      {
        "name": "Mathematics",
        "chapters": [
          {
            "chapter_number": 1,
            "name": "Real Numbers",
            "topics": ["Euclid's Division Lemma", "Fundamental Theorem of Arithmetic"]
          }
        ]
      }
    ]
  }
}
```

### 5. Search Content
**GET** `/api/v1/content/search?query={query}&grade={grade}`

---

## 🔔 Notification Endpoints

### 1. Get Notifications
**GET** `/rest/v1/notifications?user_id=eq.{user_id}&order=scheduled_for.desc`

### 2. Mark Notification as Read
**PATCH** `/rest/v1/notifications?id=eq.{notification_id}`
```json
{
  "is_read": true
}
```

### 3. Schedule Quiz Reminder
**POST** `/api/v1/notifications/quiz-reminder`
```json
{
  "user_id": "uuid",
  "scheduled_time": "2024-10-01T18:00:00Z",
  "message": "Time for your daily quiz!"
}
```

### 4. Schedule Study Reminder
**POST** `/api/v1/notifications/study-reminder`
```json
{
  "user_id": "uuid",
  "topic_name": "Physics Chapter 5",
  "scheduled_time": "2024-10-01T19:00:00Z"
}
```

---

## 📁 File Upload Endpoints

### 1. Upload Timetable
**POST** `/api/v1/upload/timetable`
```json
{
  "file": "base64-encoded-file",
  "file_type": "pdf",
  "user_id": "uuid"
}
```

### 2. Upload Syllabus
**POST** `/api/v1/upload/syllabus`
```json
{
  "file": "base64-encoded-file",
  "file_type": "pdf",
  "user_id": "uuid",
  "grade_level": 10
}
```

### 3. Upload Textbook Pages
**POST** `/api/v1/upload/textbook`
```json
{
  "file": "base64-encoded-file",
  "file_type": "image",
  "user_id": "uuid",
  "chapter_id": "uuid"
}
```

---

## 🔧 AI Service Endpoints

### 1. Generate Questions
**POST** `/api/v1/ai/generate-questions`
```json
{
  "topic": "Quadratic Equations",
  "difficulty": 3,
  "count": 5,
  "types": ["mcq", "multi_select"],
  "context": "NCERT Class 10 Mathematics"
}
```

### 2. Grade Paragraph Answer
**POST** `/api/v1/ai/grade-answer`
```json
{
  "question": "Explain the process of photosynthesis",
  "answer": "Photosynthesis is the process by which plants make their own food...",
  "rubric": "Key points: sunlight, chlorophyll, carbon dioxide, glucose, oxygen"
}
```

### 3. Generate Study Plan
**POST** `/api/v1/ai/generate-plan`
```json
{
  "user_id": "uuid",
  "deadline": "2024-12-15",
  "subjects": ["Mathematics", "Science", "English"],
  "available_hours": 20,
  "current_progress": {}
}
```

### 4. Analyze Study Pattern
**POST** `/api/v1/ai/analyze-patterns`
```json
{
  "user_id": "uuid",
  "study_data": [],
  "quiz_data": []
}
```

---

## 📊 Real-time Subscriptions

### 1. Quiz Updates
**Channel:** `quiz_updates:{user_id}`
**Events:** `quiz_started`, `question_answered`, `quiz_completed`

### 2. Progress Updates
**Channel:** `progress_updates:{user_id}`
**Events:** `topic_completed`, `milestone_reached`, `streak_updated`

### 3. Notification Updates
**Channel:** `notifications:{user_id}`
**Events:** `new_notification`, `reminder_triggered`

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## 📋 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Quiz Generation | 10 requests | 1 hour |
| File Upload | 5 requests | 1 hour |
| AI Services | 20 requests | 1 hour |

---

## 🔒 Security Headers

All API responses include security headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

**Last Updated:** September 30, 2024
**Next Review:** Upon API implementation changes