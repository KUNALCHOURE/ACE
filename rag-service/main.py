from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from pipeline import RAGPipeline

app = FastAPI(title="Campus Connect RAG Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = RAGPipeline()


class EmbedRequest(BaseModel):
    discussionId: str
    title: str
    content: str
    tags: List[str] = []
    category: str = "general"


class ChatRequest(BaseModel):
    message: str
    userId: Optional[str] = None


@app.get("/health")
def health():
    return {
        "status": "running",
        "model": "gemini-1.5-flash",
        "embedding": "text-embedding-004",
    }


@app.post("/embed")
def embed(req: EmbedRequest):
    result = pipeline.embed(
        req.discussionId, req.title, req.content, req.tags, req.category
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "embed failed"))
    return result


@app.post("/chat")
def chat(req: ChatRequest):
    try:
        return pipeline.chat(req.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
