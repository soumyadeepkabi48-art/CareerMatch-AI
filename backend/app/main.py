from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CareerMatch AI API")

# The Vite dev server runs on port 5173. This allows that origin to call the API later.
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


@app.get("/health")
def health():
    return {"status": "ok"}
