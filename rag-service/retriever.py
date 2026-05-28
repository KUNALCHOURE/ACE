from pymongo import MongoClient
import os


class Retriever:
    def __init__(self):
        mongo_url = os.getenv("MONGODB_URL")
        if not mongo_url:
            raise RuntimeError("MONGODB_URL not set")
        self.client = MongoClient(mongo_url)
        self.db = self.client["campus_connect"]
        self.discussions = self.db["discussions"]

    def search_campus(self, query_vector, category=None, limit=5):
        """Run Atlas $vectorSearch over the discussions collection."""
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "discussion_embeddings",
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": 30,
                    "limit": limit,
                }
            },
            {
                "$project": {
                    "title": 1,
                    "content": 1,
                    "category": 1,
                    "tags": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            },
        ]

        if category and category != "all":
            pipeline.insert(1, {"$match": {"category": category}})

        try:
            results = list(self.discussions.aggregate(pipeline))
            # 0.65 threshold works well for Gemini text-embedding-004 cosine
            return [r for r in results if r.get("score", 0) > 0.65]
        except Exception as e:
            print(f"[retriever] $vectorSearch failed: {e}")
            return []
