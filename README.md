# CareerMatch AI

A small full-stack app for comparing a resume with a job description. This repository currently contains the project setup only: a React frontend and a FastAPI backend. Sign-in, resume analysis, and the dashboard are not built yet.

## Project layout

- `frontend/` — React, Vite, and Tailwind CSS
- `backend/` — Python and FastAPI

The frontend will later talk to Supabase for accounts, file storage, and saved analyses. The backend will later call an OpenAI-compatible API. API keys stay in `.env` files and are never written into source code.

## Requirements

- Node.js 20 or newer
- Python 3.11 or newer

## Frontend

From the project root:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

Open http://localhost:5173. The page should say that project setup is ready.

`frontend/.env` is for the Supabase URL, the Supabase anon key, and the backend URL. Leave the Supabase values empty until authentication is added. The anon key is meant for the browser only because Row Level Security is enabled on the database.

## Backend

From the project root, create a virtual environment and install dependencies:

```bash
cd backend
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

On macOS or Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000/health. A working API returns:

```json
{"status":"ok"}
```

Interactive API docs are at http://127.0.0.1:8000/docs.

`backend/.env` will later hold the AI API key. The server does not read that file yet, because analysis is not implemented.

Run the frontend and the backend in two separate terminals when you want both at once.

## Checks

Frontend production build:

```bash
cd frontend
npm run build
```

Backend import check, from `backend` with the virtual environment active:

```bash
python -c "from app.main import app; print(app.title)"
```
