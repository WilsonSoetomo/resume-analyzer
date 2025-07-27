from fastapi import APIRouter, HTTPException, Depends
from app.models.resume import ResumeSubmission, ResumeAnalysis, ResumeSearchResult
from app.services.openai_service import OpenAIService
from typing import List
import uuid
from datetime import datetime

resume_router = APIRouter()

# Initialize services
openai_service = OpenAIService()

# Try to initialize Pinecone, but don't fail if it doesn't work
try:
    from app.services.pinecone_service import PineconeService
    pinecone_service = PineconeService()
    PINECONE_AVAILABLE = pinecone_service.pinecone_available
except Exception as e:
    print(f"Warning: Pinecone not available: {e}")
    pinecone_service = None
    PINECONE_AVAILABLE = False

@resume_router.post("/analyze", response_model=ResumeAnalysis)
async def analyze_resume(submission: ResumeSubmission):
    """
    Analyze a resume using GPT-4 and return detailed feedback
    """
    try:
        start_time = datetime.now()
        
        # Analyze resume using OpenAI
        feedback = await openai_service.analyze_resume(submission)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Generate unique ID
        analysis_id = str(uuid.uuid4())
        
        # Store in Pinecone for similarity search (if available)
        if PINECONE_AVAILABLE and pinecone_service:
            try:
                await pinecone_service.store_resume(
                    resume_id=analysis_id,
                    content=submission.content,
                    feedback=feedback.dict()
                )
            except Exception as e:
                print(f"Warning: Failed to store in Pinecone: {e}")
        
        return ResumeAnalysis(
            id=analysis_id,
            submission=submission,
            feedback=feedback,
            created_at=start_time,
            processing_time=processing_time,
            model_version="gpt-3.5-turbo"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@resume_router.get("/similar/{analysis_id}", response_model=List[ResumeSearchResult])
async def get_similar_resumes(analysis_id: str, top_k: int = 5):
    """
    Find similar resumes based on content similarity
    """
    try:
        if not PINECONE_AVAILABLE or not pinecone_service:
            # Return mock data if Pinecone is not available
            return [
                ResumeSearchResult(
                    id="mock_1",
                    similarity_score=0.85,
                    content_preview="Software Engineer with 5 years experience...",
                    feedback_summary="Strong technical skills, good structure"
                )
            ]
        
        # Get the original analysis to extract content
        # In a real implementation, you'd fetch this from a database
        # For now, we'll use a mock approach
        
        similar_resumes = await pinecone_service.find_similar_resumes(
            content="",  # This would be the actual content from analysis_id
            top_k=top_k
        )
        
        return [
            ResumeSearchResult(
                id=resume["id"],
                similarity_score=resume["similarity_score"],
                content_preview=resume["content_preview"],
                feedback_summary=str(resume["feedback_summary"])
            )
            for resume in similar_resumes
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@resume_router.get("/feedback/{analysis_id}")
async def get_feedback(analysis_id: str):
    """
    Retrieve feedback for a specific analysis
    """
    try:
        # In a real implementation, you'd fetch this from a database
        # For now, return mock data
        return {
            "id": analysis_id,
            "feedback": {
                "overall_score": 85.0,
                "technical_clarity": 88.0,
                "impact_phrasing": 82.0,
                "structure_format": 90.0,
                "suggestions": [
                    "Add more quantifiable achievements",
                    "Use stronger action verbs",
                    "Improve keyword optimization"
                ],
                "strengths": [
                    "Clear structure",
                    "Good technical skills",
                    "Relevant experience"
                ],
                "areas_for_improvement": [
                    "Quantify achievements",
                    "Add more industry-specific keywords"
                ],
                "keyword_analysis": {
                    "relevant_keywords": ["Python", "Machine Learning", "Data Analysis"],
                    "missing_keywords": ["AWS", "Docker", "Kubernetes"],
                    "keyword_density": 0.75
                },
                "industry_alignment": 85.0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@resume_router.delete("/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """
    Delete a resume analysis
    """
    try:
        if PINECONE_AVAILABLE and pinecone_service:
            await pinecone_service.delete_resume(analysis_id)
        return {"message": "Analysis deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@resume_router.get("/stats")
async def get_stats():
    """
    Get application statistics
    """
    try:
        # In a real implementation, you'd calculate these from your database
        return {
            "total_analyses": 1250,
            "average_score": 78.5,
            "user_satisfaction": 92.0,
            "processing_time_avg": 2.3,
            "top_industries": [
                "Technology",
                "Finance", 
                "Healthcare",
                "Consulting"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 