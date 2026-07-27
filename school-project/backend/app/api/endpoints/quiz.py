from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
import os
import json
import time
from dotenv import load_dotenv
from pathlib import Path

# Load env variables
env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env.local'
if not env_path.exists():
    env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

router = APIRouter()

# Initialize Gemini
KEY = os.getenv("GEMINI_API_KEY")
if KEY:
    genai.configure(api_key=KEY)

class QuizRequest(BaseModel):
    subject: str
    chapters: List[str]
    difficulty: str
    questionCount: int

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str
    difficulty: str
    subject: str
    chapter: str

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        difficulty_map = {
            "easy": "simple, straightforward questions that test basic concepts and definitions",
            "medium": "moderately challenging questions that require some thinking and application of concepts",
            "hard": "challenging questions that test deep understanding, problem-solving, and application of multiple concepts"
        }
        
        prompt = f"""You are a quiz generator for educational content. Generate exactly {request.questionCount} multiple-choice questions for a {request.subject} quiz.

Chapters to cover: {', '.join(request.chapters)}
Difficulty level: {request.difficulty} ({difficulty_map.get(request.difficulty, 'standard')})

Requirements:
1. Each question must have exactly 4 options (A, B, C, D)
2. Questions should be clear, concise, and educational
3. Options should be plausible but only one should be correct
4. Include a clear explanation for why the correct answer is right
5. Distribute questions evenly across all specified chapters
6. Questions should be appropriate for the specified difficulty level

Output Format:
Provide the response as a valid JSON array. Do NOT use markdown code blocks or any additional text.

[
  {{
    "question": "Your question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Clear explanation of why this is the correct answer",
    "difficulty": "{request.difficulty}",
    "subject": "{request.subject}",
    "chapter": "Chapter name from the provided list"
  }}
]

Generate exactly {request.questionCount} questions in the JSON array format above."""

        response = model.generate_content(prompt)
        text_response = response.text
        
        # Clean response
        cleaned_response = text_response.strip()
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response.replace('```json', '', 1)
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3]
        elif cleaned_response.startswith('```'):
            cleaned_response = cleaned_response.replace('```', '', 1)
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3]
                
        cleaned_response = cleaned_response.strip()
        
        try:
            questions_data = json.loads(cleaned_response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON: {cleaned_response}")
            raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
            
        if not isinstance(questions_data, list) or len(questions_data) == 0:
             raise HTTPException(status_code=500, detail="No questions generated")

        # Process questions to match Pydantic model
        processed_questions = []
        for i, q in enumerate(questions_data):
            processed_questions.append(QuizQuestion(
                id=f"q_{int(time.time())}_{i}",
                question=q.get("question", f"Question {i + 1}"),
                options=q.get("options", ["Option A", "Option B", "Option C", "Option D"]),
                correctAnswer=q.get("correctAnswer", 0),
                explanation=q.get("explanation", "No explanation provided."),
                difficulty=q.get("difficulty", request.difficulty),
                subject=q.get("subject", request.subject),
                chapter=q.get("chapter", request.chapters[0] if request.chapters else "General")
            ))
            
        return QuizResponse(questions=processed_questions)

    except Exception as e:
        print(f"Error generating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
