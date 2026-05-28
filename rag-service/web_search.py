from tavily import TavilyClient
import os


class WebSearch:
    def __init__(self):
        api_key = os.getenv("TAVILY_API_KEY")
        self.client = TavilyClient(api_key=api_key) if api_key else None

    def search(self, query):
        if not self.client:
            print("[web_search] TAVILY_API_KEY not set — skipping web search")
            return []
        try:
            results = self.client.search(
                f"{query} India campus 2024",
                max_results=3,
                include_domains=[
                    "glassdoor.com",
                    "ambitionbox.com",
                    "linkedin.com",
                    "geeksforgeeks.org",
                ],
            )
            return results.get("results", [])
        except Exception as e:
            # NEVER crash — web search is optional
            print(f"[web_search] Tavily failed gracefully: {e}")
            return []
