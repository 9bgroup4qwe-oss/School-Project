import time
import jwt
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.analytics_store import create_or_verify_user
from app.auth import get_current_user, JWT_SECRET, JWT_ALGORITHM
from app.schemas import UserContext

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

class AuthRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/signup", response_model=AuthResponse)
async def signup(req: AuthRequest):
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    norm_email = req.email.lower().strip()
    user_data = create_or_verify_user(norm_email, req.password)
    user_id = user_data["id"]

    token = jwt.encode(
        {
            "sub": user_id,
            "email": norm_email,
            "role": "authenticated",
            "iat": int(time.time()),
            "exp": int(time.time()) + (30 * 86400) # 30 days
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user={"id": user_id, "email": norm_email}
    )

@router.post("/login", response_model=AuthResponse)
async def login(req: AuthRequest):
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    norm_email = req.email.lower().strip()
    user_data = create_or_verify_user(norm_email, req.password)
    user_id = user_data["id"]

    token = jwt.encode(
        {
            "sub": user_id,
            "email": norm_email,
            "role": "authenticated",
            "iat": int(time.time()),
            "exp": int(time.time()) + (30 * 86400)
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user={"id": user_id, "email": norm_email}
    )

@router.get("/me", response_model=UserContext)
async def get_me(user: UserContext = Depends(get_current_user)):
    return user
