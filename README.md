# RecruitAI - AI-Based Recruitment and Resume Screening System

A complete AI recruitment platform that combines a React + TypeScript frontend with a FastAPI backend, PostgreSQL database support, and AI-enhanced candidate screening, interview workflows, and analytics.

## 🚀 Project Summary

RecruitAI is designed to automate recruitment workflows for HR and candidates using:
- AI-powered resume screening and ranking
- Candidate profile and application management
- Real-time video interview and speech processing
- Admin dashboards, pipeline management, and analytics
- Backend API services for auth, job posting, applications, and realtime updates

## ⚙️ Full Project Pipeline

This project contains two main subprojects:
- `frontend/` — React + TypeScript application built with Vite
- `backend/` — FastAPI application with SQLAlchemy, authentication, and OpenAI integration

### Pipeline Overview

1. Frontend development server runs on port `5173`
2. Backend API server runs on port `8000`
3. PostgreSQL database runs in Docker as the persistent data store
4. Frontend communicates with backend API for auth, jobs, applications, and websocket events

## 📁 Repository Layout

```
./
├── backend/
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── api/routers/
│       ├── core/config.py
│       ├── database/session.py
│       ├── models/models.py
│       ├── schemas/schemas.py
│       ├── services/auth_service.py
│       ├── uploads/
│       └── websocket/manager.py
├── frontend/
│   ├── docker-compose.yml
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── types/
└── README.md
```

## 🧩 Backend Stack

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL (Docker)
- Uvicorn
- OpenAI SDK
- JWT auth with `python-jose`
- Password hashing with `passlib[bcrypt]`
- Environment configuration with `python-dotenv`

### Backend key files

- `backend/app/main.py` — FastAPI app and router registration
- `backend/app/core/config.py` — environment settings and secrets
- `backend/app/database/session.py` — database engine and session management
- `backend/app/api/routers/` — auth, jobs, applications, websocket endpoints
- `backend/requirements.txt` — backend Python dependencies

## 🖥️ Frontend Stack

- React 19
- TypeScript 5
- Vite
- Tailwind CSS 4
- React Router 7
- Recharts
- WebRTC / Web Speech API
- Lucide React icons

### Frontend key files

- `frontend/src/main.tsx` — app entrypoint
- `frontend/src/App.tsx` — routes and layout
- `frontend/src/context/AuthContext.tsx` — auth state
- `frontend/src/context/DataContext.tsx` — app data state
- `frontend/src/services/aiService.ts` — AI integration helpers
- `frontend/src/services/advancedAIService.ts` — enhanced AI feature support
- `frontend/src/services/realtimeService.ts` — realtime/WebSocket helpers

## 🚀 Development Setup

### Option 1: Run frontend and backend locally

#### 1. Backend setup

From repository root:

```bash
cd backend
python -m pip install -r requirements.txt
```

Create a `.env` file at the repository root or set environment variables manually:

```env
DATABASE_URL=sqlite:///./backend.db
JWT_SECRET_KEY=supersecret
OPENAI_API_KEY=<your-openai-key>
```

Then start the backend:

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend setup

From repository root:

```bash
cd frontend
npm install
npm run dev
```

#### 3. Open in browser

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

### Option 2: Run full stack with Docker Compose

From the repository root:

```bash
cd frontend
docker-compose up --build
```

This starts:
- `db` on `5432`
- `backend` on `8000`
- `frontend` on `5173`

## 🔌 Environment Variables

For local development, set these values before running the backend:

```env
DATABASE_URL=sqlite:///./backend.db
JWT_SECRET_KEY=supersecret
OPENAI_API_KEY=<your-openai-key>
```

If using Docker Compose, the backend service receives:
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/recruitment_db`
- `JWT_SECRET_KEY=supersecret`
- `OPENAI_API_KEY=${OPENAI_API_KEY}`

## 🧠 Core Features

### Admin / HR
- Dashboard analytics and hiring funnel
- Job creation and editing
- AI candidate screening and ranking
- Recruitment pipeline Kanban board
- Interview transcript review and feedback analyzer
- Candidate comparison and duplicate detection

### Candidate
- Job search and applications
- AI resume improvement and cover letter generation
- AI interview assistant and real-time video interview
- Profile builder and application tracking
- Speech-to-text and text-to-speech interview support

## 📦 Backend API Endpoints

The backend exposes routes for:
- Authentication
- Job listings
- Candidate applications
- WebSocket / realtime updates
- Health check at `/health`

## 🔧 How the Pipeline Works

1. `frontend` serves the UI and calls backend APIs for data
2. `backend` stores data in the configured database and manages auth
3. `backend` may call OpenAI to generate screening results and questionnaire data
4. `frontend` displays AI insights, charts, and realtime interview feedback
5. Docker Compose ties the database, backend, and frontend together for a single deployment flow

## 🧪 Notes

- The backend currently supports SQLite for local development and PostgreSQL via Docker Compose.
- `backend/app/core/config.py` loads environment variables from `../.env` when running locally from `backend/`.
- `frontend/docker-compose.yml` is the recommended full-stack pipeline for local development with containers.

## 👨‍💻 Demo Accounts

### Admin Account
- Email: `admin@recruitai.com`
- Password: `admin123`

### Candidate Account
- Email: `john@example.com`
- Password: `password123`

## 📄 License

MIT License — feel free to use this project for learning or production reference.
