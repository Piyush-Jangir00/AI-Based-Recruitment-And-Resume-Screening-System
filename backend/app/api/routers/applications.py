from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import Application, Job, User
from app.schemas.schemas import ApplicationCreate, ApplicationOut
import os

router = APIRouter(prefix="/applications", tags=["applications"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../../uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ApplicationOut)
async def apply_job(job_id: int = Form(...), candidate_id: int = Form(...), cover_letter: str = Form(None), resume: UploadFile = File(None), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    candidate = db.query(User).filter(User.id == candidate_id).first()
    if not job or not candidate:
        raise HTTPException(status_code=404, detail="Job or candidate not found")
    resume_path = None
    if resume:
        dest = os.path.join(UPLOAD_DIR, resume.filename)
        with open(dest, "wb") as f:
            f.write(await resume.read())
        resume_path = dest
    application = Application(candidate_id=candidate.id, job_id=job.id, cover_letter=cover_letter, resume_path=resume_path)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@router.get("/candidate/{candidate_id}", response_model=List[ApplicationOut])
def list_applications(candidate_id: int, db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.candidate_id == candidate_id).all()
    return apps
