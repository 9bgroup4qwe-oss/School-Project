from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Base Error Model
class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    error: ErrorDetail

# Auth schemas
class UserContext(BaseModel):
    user_id: str
    email: Optional[str] = None
    role: str = "authenticated"

# Quiz schemas
class QuestionOut(BaseModel):
    id: str
    question_text: str
    options: List[str]
    subject: str
    chapter: str
    difficulty: str
    question_index: int

class QuizGenerateRequest(BaseModel):
    grade: Optional[int] = Field(default=10, ge=1, le=12)
    subject: str = Field(..., min_length=1, max_length=100)
    chapters: List[str] = Field(default_factory=list)
    difficulty: str = Field(default="medium", pattern=r"^(?i)(easy|medium|hard)$")
    question_count: int = Field(default=5, ge=1, le=25)

class QuizGenerateResponse(BaseModel):
    session_id: str
    grade: int
    subject: str
    difficulty: str
    question_count: int
    time_limit_seconds: int
    questions: List[QuestionOut]
    source: str = "ai"

class AnswerSubmission(BaseModel):
    question_id: str
    selected_option: int = Field(..., ge=0, le=3)
    time_taken: int = Field(default=0, ge=0)

class QuizSubmitRequest(BaseModel):
    answers: List[AnswerSubmission]
    time_taken: int = Field(default=0, ge=0)

class QuestionResult(BaseModel):
    question_id: str
    question_text: str
    options: List[str]
    selected_option: int
    correct_answer: int
    is_correct: bool
    explanation: Optional[str] = None

class QuizSubmitResponse(BaseModel):
    session_id: str
    total_questions: int
    correct_answers: int
    score_percentage: float
    time_taken: int
    results: List[QuestionResult]

# Timetable schemas
class TimetableSlot(BaseModel):
    slot_id: Optional[str] = None
    time: str
    activity: str
    type: str
    topic: Optional[str] = None
    completed: bool = False
    completed_at: Optional[str] = None

class TimetableCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    schedule: Dict[str, Any] = Field(default_factory=dict)
    calendar_schedule: Optional[Dict[str, Any]] = None
    exam_date: Optional[str] = None
    settings: Dict[str, Any] = Field(default_factory=dict)

class TimetableGenerateRequest(BaseModel):
    grade: Optional[int] = Field(default=10, ge=1, le=12)
    available_hours_per_day: int = Field(default=4, ge=1, le=16)
    subjects: List[str] = Field(..., min_length=1)
    weak_areas: List[str] = Field(default_factory=list)
    syllabus_topics: List[str] = Field(default_factory=list)
    exam_date: Optional[str] = None
    start_date: Optional[str] = None
    school_end_time: Optional[str] = "15:30"
    preferences: Optional[str] = None

class ToggleTopicRequest(BaseModel):
    slot_id: str
    completed: bool

class TimetableResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    is_active: bool
    schedule: Dict[str, Any] = Field(default_factory=dict)
    calendar_schedule: Optional[Dict[str, Any]] = None
    exam_date: Optional[str] = None
    days_until_exam: Optional[int] = None
    completion_stats: Optional[Dict[str, Any]] = None
    created_at: str

class TextExtractResponse(BaseModel):
    filename: str
    pages_processed: int
    extracted_text: str
    topics: List[str] = Field(default_factory=list)

class SyllabusExtractResponse(BaseModel):
    filename: str
    file_type: str
    subject: Optional[str] = None
    detected_exam_date: Optional[str] = None
    extracted_text: str
    topics: List[str] = Field(default_factory=list)

# Timetable AI Assistant Chat
class TimetableChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str

class TimetableChatRequest(BaseModel):
    messages: List[TimetableChatMessage]
    current_schedule: Optional[Dict[str, Any]] = None
    calendar_schedule: Optional[Dict[str, Any]] = None
    grade: Optional[int] = 10
    exam_date: Optional[str] = None

class TimetableChatResponse(BaseModel):
    reply: str
    suggested_schedule_update: Optional[Dict[str, Any]] = None
    suggested_calendar_update: Optional[Dict[str, Any]] = None
    updated_timetable: Optional[Dict[str, Any]] = None
    exam_date: Optional[str] = None
