
import os
import re

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="CareerMatch AI API")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://careermatch-ai-rouge.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    resume_text: str = Field(min_length=1, max_length=200_000)
    job_description: str = Field(min_length=1, max_length=40_000)


async def verify_user(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Please sign in first.")

    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise HTTPException(
            status_code=503,
            detail="Backend authentication is not configured."
        )

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "apikey": SUPABASE_PUBLISHABLE_KEY,
                    "Authorization": authorization,
                },
            )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=503,
            detail="Could not contact the authentication service."
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Your session is invalid. Please sign in again."
        )

    return response.json()


COMMON_SKILLS = [
    "javascript",
    "react",
    "node",
    "node.js",
    "python",
    "java",
    "c++",
    "sql",
    "html",
    "css",
    "mongodb",
    "supabase",
    "git",
    "github",
    "typescript",
    "express",
    "aws",
    "docker",
    "machine learning",
    "data structures",
    "algorithms",
]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_resume(
    request: AnalyzeRequest,
    user: dict = Depends(verify_user),
):
    raw_resume_text = request.resume_text.strip()
raw_job_description = request.job_description.strip()

if not raw_resume_text:
    raise HTTPException(
        status_code=400,
        detail="No readable text was extracted from your resume PDF."
    )

if not raw_job_description:
    raise HTTPException(
        status_code=400,
        detail="Please provide a job description."
    )

resume_text = raw_resume_text.lower()
job_description = raw_job_description.lower()

    pattern = r"\b[a-zA-Z][a-zA-Z0-9+#.-]{2,}\b"

    resume_words = set(re.findall(pattern, resume_text))
    job_words = set(re.findall(pattern, job_description))

    matched_words = resume_words.intersection(job_words)

    score = int(
        (len(matched_words) / max(len(job_words), 1)) * 100 + 0.5
    )

    resume_skills = [
        skill for skill in COMMON_SKILLS
        if skill in resume_text
    ]

    job_skills = [
        skill for skill in COMMON_SKILLS
        if skill in job_description
    ]

    matched_skills = [
        skill for skill in job_skills
        if skill in resume_skills
    ]

    missing_skills = [
        skill for skill in job_skills
        if skill not in resume_skills
    ]

    message = (
        f"Resume analyzed successfully! Match Score: {score}%. "
        f"Consider adding: {', '.join(missing_skills)}"
        if missing_skills
        else (
            f"Resume analyzed successfully! Match Score: {score}%. "
            "Your resume covers the key skills in this job description."
        )
    )

    return {
        "score": score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "message": message,
        "matched_word_count": len(matched_words),
        "job_word_count": len(job_words),
    }
