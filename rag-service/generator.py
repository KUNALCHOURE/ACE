import google.generativeai as genai
import os


class Generator:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 400,
            }
        )

    def generate(self, question: str, campus_docs: list, web_docs: list) -> dict:
        campus_context = ""
        if campus_docs:
            campus_context = "\n\n".join([
                f"[Campus Discussion - {d['title']}]:\n{d['content']}"
                for d in campus_docs
            ])

        web_context = ""
        if web_docs:
            web_context = "\n\n".join([
                f"[Web - {r.get('title', '')}]:\n{r.get('content', '')}"
                for r in web_docs
            ])

        if campus_docs and web_docs:
            prompt = f"""You are CampusBot for Campus Connect college platform.

Answer the question using BOTH sources below.
Clearly distinguish campus vs web information.
Keep response under 250 words.

CAMPUS DISCUSSIONS (from our students):
{campus_context}

WEB SOURCES (recent internet data):
{web_context}

Question: {question}"""

        elif campus_docs:
            prompt = f"""You are CampusBot for Campus Connect.

Answer based on these campus discussions.
Mention the answer is from campus experiences.
Keep response under 200 words.
Never make up information not in the context.

CAMPUS DISCUSSIONS:
{campus_context}

Question: {question}"""

        elif web_docs:
            prompt = f"""You are CampusBot for Campus Connect.

Answer based on these web sources.
Keep response under 200 words.

WEB SOURCES:
{web_context}

Question: {question}"""

        else:
            prompt = f"""You are CampusBot for Campus Connect, a college platform for CS students.
Help with tech, competitive programming, placements, and career advice.
Keep response under 150 words.

Question: {question}"""

        response = self.model.generate_content(prompt)

        return {
            "response": response.text,
            "ragUsed": len(campus_docs) > 0,
            "sourcesCount": len(campus_docs),
            "webUsed": len(web_docs) > 0
        }
