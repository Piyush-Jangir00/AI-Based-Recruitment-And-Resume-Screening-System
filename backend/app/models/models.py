from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.session import Base
import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    candidate = "candidate"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.candidate)
    created_at = Column(DateTime, default=datetime.utcnow)
    applications = relationship("Application", back_populates="candidate")

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    location = Column(String)
    department = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    applications = relationship("Application", back_populates="job")

class ApplicationStatusEnum(str, enum.Enum):
    applied = "applied"
    screening = "screening"
    interviewing = "interviewing"
    offered = "offered"
    rejected = "rejected"

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    resume_path = Column(String, nullable=True)
    cover_letter = Column(Text, nullable=True)
    status = Column(Enum(ApplicationStatusEnum), default=ApplicationStatusEnum.applied)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")

class Interview(Base):
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    scheduled_at = Column(DateTime, nullable=True)
    mode = Column(String, default="video")
    transcript_id = Column(Integer, ForeignKey("transcripts.id"), nullable=True)

class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Analytics(Base):
    __tablename__ = "analytics"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, index=True)
    value = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
