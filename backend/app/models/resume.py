from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ResumeSubmission(BaseModel):
    content: str = Field(..., description="Resume content in text format")
    job_title: Optional[str] = Field(None, description="Target job title")
    industry: Optional[str] = Field(None, description="Target industry")
    experience_level: Optional[str] = Field(None, description="Experience level (entry, mid, senior)")

class ResumeFeedback(BaseModel):
    overall_score: float = Field(..., ge=0, le=100, description="Overall resume score")
    technical_clarity: float = Field(..., ge=0, le=100, description="Technical clarity score")
    impact_phrasing: float = Field(..., ge=0, le=100, description="Impact and phrasing score")
    structure_format: float = Field(..., ge=0, le=100, description="Structure and format score")
    suggestions: List[str] = Field(..., description="List of improvement suggestions")
    strengths: List[str] = Field(..., description="List of resume strengths")
    areas_for_improvement: List[str] = Field(..., description="Areas that need improvement")
    keyword_analysis: dict = Field(..., description="Keyword analysis results")
    industry_alignment: float = Field(..., ge=0, le=100, description="Industry alignment score")

class ResumeAnalysis(BaseModel):
    id: str
    submission: ResumeSubmission
    feedback: ResumeFeedback
    created_at: datetime
    processing_time: float
    model_version: str = "gpt-4"

class ResumeSearchResult(BaseModel):
    id: str
    similarity_score: float
    content_preview: str
    feedback_summary: str 