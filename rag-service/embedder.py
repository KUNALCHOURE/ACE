import google.generativeai as genai
import os


class Embedder:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = "models/text-embedding-004"

    def embed_text(self, text: str) -> list[float]:
        result = genai.embed_content(
            model=self.model,
            content=text,
            task_type="retrieval_document"
        )
        return result["embedding"]

    def embed_query(self, text: str) -> list[float]:
        result = genai.embed_content(
            model=self.model,
            content=text,
            task_type="retrieval_query"
        )
        return result["embedding"]

    def embed_discussion(self, title, content, tags, category) -> list[float]:
        rich_text = f"""
        Title: {title}
        Category: {category}
        Tags: {', '.join(tags) if tags else ''}
        Content: {content}
        """
        return self.embed_text(rich_text.strip())
