from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import os
import json
import time
from dotenv import load_dotenv
from pathlib import Path
import pdfplumber
import io
from PIL import Image

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

class ChatMessage(BaseModel):
    role: str
    content: str

class TimetableContext(BaseModel):
    phase: str
    schoolType: Optional[str] = None
    gradeLevel: Optional[str] = None
    classes: List[Any] = []
    studyPreferences: Optional[Dict[str, Any]] = None
    activities: List[Any] = []
    personalInfo: Optional[Dict[str, Any]] = None

class TimetableChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[ChatMessage]] = None
    context: Optional[Dict[str, Any]] = None
    currentTimetable: Optional[Dict[str, Any]] = None

@router.post("/chat")
async def timetable_chat(request: TimetableChatRequest):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        is_modification = request.currentTimetable is not None
        
        if is_modification:
            system_prompt = f"""You are an AI assistant helping students modify their existing timetable.

CURRENT TIMETABLE:
{json.dumps(request.currentTimetable, indent=2)}

User's modification request: "{request.message}"

Please update the timetable based on their request. Your response should include:
1. A natural confirmation message about what you changed
2. The complete updated timetable in JSON format

IMPORTANT: Always end your response with the complete updated timetable like this:

[TIMETABLE]
{{
  "metadata": {{...}},
  "schedule": {{
    "monday": [...],
    "tuesday": [...],
    "wednesday": [...],
    "thursday": [...],
    "friday": [...]
  }},
  "settings": {{...}}
}}
[/TIMETABLE]

The schedule must include all 5 weekdays. Each item must have: time, activity, and type fields."""
        else:
            system_prompt = f"""You are an AI assistant that creates student timetables. The user said: "{request.message}"

Extract their schedule information and create a complete weekly timetable.

Your response should:
1. Be friendly and conversational
2. If you need more information, ask for it
3. If you have enough information, create the timetable

IMPORTANT: When creating the timetable, always include it at the end of your response like this:

[TIMETABLE]
{{
  "metadata": {{
    "schoolType": "High School",
    "gradeLevel": "Grade 10",
    "createdAt": "{time.strftime('%Y-%m-%dT%H:%M:%SZ')}"
  }},
  "schedule": {{
    "monday": [
      {{"time": "07:00-08:00", "activity": "Morning Routine", "type": "personal"}},
      {{"time": "08:00-09:00", "activity": "Breakfast", "type": "meal"}},
      {{"time": "09:00-10:00", "activity": "Mathematics", "type": "class", "location": "Room 101"}},
      {{"time": "10:00-11:00", "activity": "Math Study", "type": "study", "priority": "high"}},
      {{"time": "12:00-13:00", "activity": "Lunch", "type": "meal"}}
    ],
    "tuesday": [...],
    "wednesday": [...],
    "thursday": [...],
    "friday": [...]
  }},
  "settings": {{
    "studySessionDuration": 45,
    "breakDuration": 15,
    "preferredStudyTimes": ["Evening"],
    "difficultSubjects": []
  }}
}}
[/TIMETABLE]

Make sure to:
- Include all 5 weekdays (monday-friday)
- Each schedule item must have: time (e.g., "09:00-10:00"), activity, and type (class, study, meal, personal, activity)
- Add classes, study sessions, meals, and breaks
- Sort items by time for each day"""

        response = model.generate_content(system_prompt)
        text_response = response.text
        
        clean_text = text_response.strip()
        timetable = None
        
        if "[TIMETABLE]" in clean_text:
            try:
                parts = clean_text.split("[TIMETABLE]")
                clean_text = parts[0].strip()
                timetable_str = parts[1].split("[/TIMETABLE]")[0].strip()
                timetable = json.loads(timetable_str)
            except Exception as e:
                print(f"Error parsing timetable JSON: {e}")
        
        return {
            "response": clean_text,
            "timetable": timetable
        }

    except Exception as e:
        print(f"Error in timetable chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    try:
        content = await file.read()
        extracted_text = ""
        
        if file.content_type == "application/pdf":
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    extracted_text += page.extract_text() + "\n"
        elif file.content_type.startswith("image/"):
            # For images, we'd ideally use OCR. 
            # For now, let's just say we can't do OCR without tesseract installed,
            # or use Gemini to describe the image/extract text.
            # Using Gemini for OCR is actually a very good idea!
            model = genai.GenerativeModel('gemini-1.5-flash')
            img = Image.open(io.BytesIO(content))
            response = model.generate_content(["Extract all the text from this portion sheet/syllabus image. Organize it by subject and chapters.", img])
            extracted_text = response.text
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
            
        return {"success": True, "text": extracted_text}
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
