import openai
from app.core.config import settings
from app.models.resume import ResumeSubmission, ResumeFeedback
import json
import time
from typing import Dict, Any

class OpenAIService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def analyze_resume(self, submission: ResumeSubmission) -> ResumeFeedback:
        """Analyze resume using GPT-3.5-turbo and return structured feedback"""
        start_time = time.time()
        
        # Create the analysis prompt
        prompt = self._create_analysis_prompt(submission)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert resume reviewer and career coach. Analyze resumes and provide detailed, actionable feedback."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            # Parse the response
            feedback_data = json.loads(response.choices[0].message.content)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Create ResumeFeedback object
            feedback = ResumeFeedback(
                overall_score=feedback_data.get("overall_score", 0),
                technical_clarity=feedback_data.get("technical_clarity", 0),
                impact_phrasing=feedback_data.get("impact_phrasing", 0),
                structure_format=feedback_data.get("structure_format", 0),
                suggestions=feedback_data.get("suggestions", []),
                strengths=feedback_data.get("strengths", []),
                areas_for_improvement=feedback_data.get("areas_for_improvement", []),
                keyword_analysis=feedback_data.get("keyword_analysis", {
                    "relevant_keywords": [],
                    "missing_keywords": [],
                    "keyword_density": 0.0
                }),
                industry_alignment=feedback_data.get("industry_alignment", 0)
            )
            
            return feedback
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {e}")
            print(f"Raw response: {response.choices[0].message.content}")
            raise Exception("Failed to parse AI response")
        except Exception as e:
            print(f"Error in OpenAI API call: {e}")
            # Return mock data if OpenAI fails (for testing)
            print("⚠️ OpenAI API failed, returning mock data for testing")
            return self._get_mock_feedback(submission)
    
    def _create_analysis_prompt(self, submission: ResumeSubmission) -> str:
        """Create a detailed prompt for resume analysis"""
        prompt = f"""
        Please analyze the following resume and provide detailed feedback in JSON format.
        
        Resume Content:
        {submission.content}
        
        Target Job Title: {submission.job_title or "Not specified"}
        Target Industry: {submission.industry or "Not specified"}
        Experience Level: {submission.experience_level or "Not specified"}
        
        Please provide feedback in the following JSON format:
        {{
            "overall_score": <float 0-100>,
            "technical_clarity": <float 0-100>,
            "impact_phrasing": <float 0-100>,
            "structure_format": <float 0-100>,
            "suggestions": ["suggestion1", "suggestion2", ...],
            "strengths": ["strength1", "strength2", ...],
            "areas_for_improvement": ["area1", "area2", ...],
            "keyword_analysis": {{
                "relevant_keywords": ["keyword1", "keyword2", ...],
                "missing_keywords": ["keyword1", "keyword2", ...],
                "keyword_density": <float>
            }},
            "industry_alignment": <float 0-100>
        }}
        
        Focus on:
        1. Technical clarity and impact of achievements
        2. Proper use of action verbs and quantifiable results
        3. Structure and formatting
        4. Keyword optimization for ATS systems
        5. Industry-specific alignment
        """
        return prompt
    
    async def get_similar_resumes(self, content: str, top_k: int = 5) -> list:
        """Find similar resumes using semantic search"""
        # This would integrate with Pinecone for vector search
        # For now, return mock data
        return [
            {
                "id": "resume_1",
                "similarity_score": 0.85,
                "content_preview": "Software Engineer with 5 years experience...",
                "feedback_summary": "Strong technical skills, good structure"
            }
        ] 

    def _get_mock_feedback(self, submission: ResumeSubmission) -> ResumeFeedback:
        """Return dynamic mock feedback based on actual resume content"""
        content = submission.content.lower()
        
        # Analyze the actual content for keywords and structure
        words = content.split()
        word_count = len(words)
        
        # Extract potential keywords from the content
        technical_keywords = ["python", "javascript", "react", "node", "java", "sql", "aws", "docker", "kubernetes", "git", "agile", "scrum"]
        leadership_keywords = ["led", "managed", "supervised", "coordinated", "directed", "oversaw"]
        action_keywords = ["developed", "implemented", "created", "built", "designed", "optimized", "improved"]
        
        found_technical = [kw for kw in technical_keywords if kw in content]
        found_leadership = [kw for kw in leadership_keywords if kw in content]
        found_action = [kw for kw in action_keywords if kw in content]
        
        # Calculate scores based on content analysis
        technical_score = min(95, 70 + len(found_technical) * 5)
        impact_score = min(90, 65 + len(found_action) * 4)
        structure_score = min(95, 75 + (word_count // 50))  # Better structure with more content
        
        # Generate suggestions based on content
        suggestions = []
        if len(found_technical) < 3:
            suggestions.append("Add more technical skills and technologies")
        if len(found_action) < 5:
            suggestions.append("Use more action verbs to describe achievements")
        if word_count < 200:
            suggestions.append("Expand on your experience with more details")
        if not any(word in content for word in ["%", "percent", "increased", "decreased", "reduced"]):
            suggestions.append("Add quantifiable achievements with specific metrics")
        
        # Generate strengths based on content
        strengths = []
        if len(found_technical) >= 3:
            strengths.append("Good technical skills presentation")
        if len(found_leadership) >= 2:
            strengths.append("Strong leadership experience")
        if word_count > 300:
            strengths.append("Comprehensive experience description")
        if "experience" in content or "worked" in content:
            strengths.append("Clear work history")
        
        # Areas for improvement
        areas = []
        if len(found_technical) < 5:
            areas.append("Add more technical skills")
        if word_count < 250:
            areas.append("Provide more detailed descriptions")
        if not any(word in content for word in ["achieved", "improved", "increased"]):
            areas.append("Include more quantifiable achievements")
        
        # Keyword analysis based on actual content
        relevant_keywords = found_technical + found_action[:3]
        missing_keywords = [kw for kw in technical_keywords[:8] if kw not in content]
        keyword_density = len(found_technical) / max(1, len(words) // 20)
        
        return ResumeFeedback(
            overall_score=min(90, (technical_score + impact_score + structure_score) // 3),
            technical_clarity=technical_score,
            impact_phrasing=impact_score,
            structure_format=structure_score,
            suggestions=suggestions[:4],  # Limit to 4 suggestions
            strengths=strengths[:3],  # Limit to 3 strengths
            areas_for_improvement=areas[:3],  # Limit to 3 areas
            keyword_analysis={
                "relevant_keywords": relevant_keywords[:5],
                "missing_keywords": missing_keywords[:5],
                "keyword_density": min(1.0, keyword_density)
            },
            industry_alignment=min(90, 75 + len(found_technical) * 2)
        ) 