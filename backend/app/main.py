from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import resume_router
from app.core.config import settings

app = FastAPI(
    title="AI Resume Grader API",
    description="GPT-4 powered resume review tool with real-time feedback",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "AI Resume Grader API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 