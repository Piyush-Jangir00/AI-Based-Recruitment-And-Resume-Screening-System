from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.schemas.schemas import UserCreate, UserOut, Token
from app.database.session import get_db
from app.models.models import User, RoleEnum
from app.services.auth_service import get_password_hash, verify_password, create_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=user_in.email, full_name=user_in.full_name or "", hashed_password=get_password_hash(user_in.password), role=RoleEnum.candidate)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(form_data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.email).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": str(user.id)})
    # For brevity refresh token uses same create_access_token (extend as needed)
    refresh_token = create_access_token({"sub": str(user.id)}, expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    return {"access_token": access_token, "refresh_token": refresh_token}
