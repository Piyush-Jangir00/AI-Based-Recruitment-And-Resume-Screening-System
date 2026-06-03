from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import Job
from app.schemas.schemas import JobCreate, JobOut

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/", response_model=JobOut)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    job = Job(**job_in.dict())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/", response_model=List[JobOut])
def list_jobs(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    jobs = db.query(Job).offset(skip).limit(limit).all()
    return jobs

@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"ok": True}
