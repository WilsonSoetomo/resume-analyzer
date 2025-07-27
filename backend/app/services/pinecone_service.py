from pinecone import Pinecone
from app.core.config import settings
from typing import List, Dict, Any
import openai
import json
import logging

logger = logging.getLogger(__name__)

class PineconeService:
    def __init__(self):
        try:
            # Use the newer Pinecone client format
            self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            self.index_name = settings.PINECONE_INDEX_NAME
            self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Initialize index if it doesn't exist
            self._ensure_index_exists()
            self.pinecone_available = True
            logger.info("Pinecone initialized successfully")
        except Exception as e:
            logger.warning(f"Pinecone initialization failed: {e}")
            self.pinecone_available = False
    
    def _ensure_index_exists(self):
        """Ensure the Pinecone index exists"""
        try:
            # List all indexes
            indexes = self.pc.list_indexes()
            if self.index_name not in [index.name for index in indexes]:
                # Create index if it doesn't exist
                self.pc.create_index(
                    name=self.index_name,
                    dimension=1536,  # OpenAI embedding dimension
                    metric="cosine"
                )
                logger.info(f"Created Pinecone index: {self.index_name}")
            else:
                logger.info(f"Pinecone index {self.index_name} already exists")
        except Exception as e:
            logger.warning(f"Could not ensure Pinecone index exists: {e}")
    
    def get_index(self):
        """Get the Pinecone index"""
        if not self.pinecone_available:
            raise Exception("Pinecone is not available")
        return self.pc.Index(self.index_name)
    
    async def create_embedding(self, text: str) -> List[float]:
        """Create embedding for text using OpenAI"""
        response = self.openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding
    
    async def store_resume(self, resume_id: str, content: str, feedback: Dict[str, Any]):
        """Store resume content and feedback in Pinecone"""
        if not self.pinecone_available:
            logger.warning("Pinecone not available, skipping resume storage")
            return
            
        try:
            # Create embedding for resume content
            embedding = await self.create_embedding(content)
            
            # Prepare metadata
            metadata = {
                "content": content[:1000],  # Truncate for metadata
                "feedback_summary": json.dumps(feedback),
                "resume_id": resume_id
            }
            
            # Upsert to Pinecone
            index = self.get_index()
            index.upsert(
                vectors=[(resume_id, embedding, metadata)]
            )
            logger.info(f"Stored resume {resume_id} in Pinecone")
        except Exception as e:
            logger.error(f"Failed to store resume in Pinecone: {e}")
    
    async def find_similar_resumes(self, content: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Find similar resumes using vector similarity search"""
        if not self.pinecone_available:
            logger.warning("Pinecone not available, returning empty results")
            return []
            
        try:
            # Create embedding for query content
            query_embedding = await self.create_embedding(content)
            
            # Search in Pinecone
            index = self.get_index()
            results = index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True
            )
            
            # Process results
            similar_resumes = []
            for match in results.matches:
                metadata = match.metadata
                similar_resumes.append({
                    "id": match.id,
                    "similarity_score": match.score,
                    "content_preview": metadata.get("content", "")[:200] + "...",
                    "feedback_summary": json.loads(metadata.get("feedback_summary", "{}"))
                })
            
            return similar_resumes
        except Exception as e:
            logger.error(f"Failed to find similar resumes: {e}")
            return []
    
    async def update_resume_feedback(self, resume_id: str, feedback: Dict[str, Any]):
        """Update feedback for an existing resume"""
        if not self.pinecone_available:
            logger.warning("Pinecone not available, skipping feedback update")
            return
            
        try:
            # Get the existing vector
            index = self.get_index()
            fetch_response = index.fetch(ids=[resume_id])
            
            if resume_id in fetch_response.vectors:
                vector_data = fetch_response.vectors[resume_id]
                embedding = vector_data.values
                
                # Update metadata with new feedback
                metadata = vector_data.metadata
                metadata["feedback_summary"] = json.dumps(feedback)
                
                # Upsert updated vector
                index.upsert(
                    vectors=[(resume_id, embedding, metadata)]
                )
        except Exception as e:
            logger.error(f"Failed to update resume feedback: {e}")
    
    async def delete_resume(self, resume_id: str):
        """Delete a resume from the index"""
        if not self.pinecone_available:
            logger.warning("Pinecone not available, skipping resume deletion")
            return
            
        try:
            index = self.get_index()
            index.delete(ids=[resume_id])
        except Exception as e:
            logger.error(f"Failed to delete resume: {e}") 