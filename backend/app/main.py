from fastapi import FastAPI
from app.api.routers import auth, jobs, applications, ws
from app.database.session import engine, Base

app = FastAPI(title="AI Recruitment Platform API", version="0.1.0")

# Create DB tables (for dev/demo)
Base.metadata.create_all(bind=engine)

app.include_router(auth)
app.include_router(jobs)
app.include_router(applications)
app.include_router(ws)

@app.get("/health")
def health():
    return {"status": "ok"}
