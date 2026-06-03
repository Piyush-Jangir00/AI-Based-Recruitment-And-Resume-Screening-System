from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import auth, jobs, applications, ws
from app.database.session import engine, Base
import os

app = FastAPI(title="AI Recruitment Platform API", version="0.1.0")

# CORS (IMPORTANT for Render frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # change later to your frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ❗ DEV ONLY (remove later in production)
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(auth)
app.include_router(jobs)
app.include_router(applications)
app.include_router(ws)

@app.get("/health")
def health():
    return {"status": "ok"}
