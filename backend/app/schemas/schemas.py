from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    candidate = "candidate"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str]

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    role: RoleEnum
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: int | None = None
    exp: int | None = None

class JobCreate(BaseModel):
    title: str
    description: Optional[str]
    location: Optional[str]
    department: Optional[str]

class JobOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    location: Optional[str]
    department: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str]

class ApplicationOut(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
