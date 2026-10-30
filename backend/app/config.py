from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = "https://zuxrndrpeopqdoxixkea.supabase.co"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eHJuZHJwZW9wcWRveGl4a2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTQ3NDcsImV4cCI6MjEwMzY3MDc0N30.pPg16NWYTGC82HIYXhff8ZRyepWZlg3XgVIUyCfn2BI"
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    OPENROUTER_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    LLM_MODEL: str = "nvidia/nemotron-3.5-lightning:free"
    LLM_TIMEOUT_SECONDS: float = 45.0

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://localhost:3000"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
