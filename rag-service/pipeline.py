"""
Full RAG pipeline — entirely in Python.

embed() and chat() are both end-to-end:
  - embed:  Gemini embed → write directly to Mongo
  - chat:   Gemini embed query → Mongo $vectorSearch → maybe Tavily → Gemini generate
"""
import os
from bson import ObjectId
from pymongo import MongoClient

from embedder import Embedder
from generator import Generator
from retriever import Retriever
from web_search import WebSearch


class RAGPipeline:
    def __init__(self):
        self.embedder = Embedder()
        self.generator = Generator()
        self.retriever = Retriever()
        self.web_search = WebSearch()

        mongo_url = os.getenv("MONGODB_URL")
        if not mongo_url:
            raise RuntimeError("MONGODB_URL not set")
        self.client = MongoClient(mongo_url)
        self.db = self.client["campus_connect"]
        self.discussions = self.db["discussions"]

    # ---------- embedding (write side) ----------

    def embed(self, discussion_id, title, content, tags, category):
        """Generate Gemini embedding and store it on the discussion document."""
        try:
            vector = self.embedder.embed_discussion(title, content, tags, category)

            # Mongoose stores _id as ObjectId. Accept both string and ObjectId.
            try:
                _id = ObjectId(discussion_id)
            except Exception:
                _id = discussion_id

            self.discussions.update_one(
                {"_id": _id},
                {"$set": {"embedding": vector}},
            )

            return {
                "success": True,
                "discussionId": str(discussion_id),
                "dimensions": len(vector),
            }
        except Exception as e:
            print(f"[pipeline.embed] failed: {e}")
            return {"success": False, "error": str(e)}

    # ---------- chat (read side) ----------

    def chat(self, message):
        # 1) embed the user query (different task_type than documents)
        query_vector = self.embedder.embed_query(message)

        # 2) Mongo $vectorSearch — top-K above similarity threshold
        campus_docs = self.retriever.search_campus(query_vector)

        # 3) decide whether to add fresh web info
        web_docs = []
        if self._needs_web_search(message, campus_docs):
            web_docs = self.web_search.search(message)

        # 4) generate with Gemini, picking a prompt template based on context availability
        return self.generator.generate(message, campus_docs, web_docs)

    # ---------- helpers ----------

    def _needs_web_search(self, query, campus_docs):
        if not campus_docs:
            return True
        keywords = [
            "latest", "2024", "2025", "recent",
            "current", "new", "today", "now",
            "trending", "this year",
        ]
        q = (query or "").lower()
        return any(kw in q for kw in keywords)
