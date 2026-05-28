# Campus Connect RAG Service

Self-contained Python RAG service. It owns the entire pipeline — embedding,
Mongo retrieval, web search, and generation — using Gemini for AI calls and
MongoDB Atlas Vector Search for retrieval.

```
USER → Node /api/v1/chat/chat (verifyjwt + rate limit)
              │
              ▼   ragService.ragChat(message)
            POST /chat
              │
              ▼
         Python (FastAPI)  ─── owns the full RAG pipeline ───┐
              │                                              │
              ├ embed_query()                       Gemini ──┤
              ├ retriever.search_campus()           Mongo ───┤  (Atlas $vectorSearch)
              ├ web_search.search()                 Tavily ──┤  (optional)
              └ generator.generate()                Gemini ──┘
              │
              ▼
       { response, ragUsed, sourcesCount, webUsed }
```

If anything in the pipeline fails, `Backend/controllers/chatController.js`
catches the error and falls back to the existing Groq chat logic.

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in:
- `GEMINI_API_KEY` — free at https://aistudio.google.com
- `MONGODB_URL` — same connection string as your Node backend
- `TAVILY_API_KEY` — optional (web search degrades gracefully without it)

### 3. Create the MongoDB Atlas Vector Search index

Atlas → Search Indexes → Create Search Index → **Vector Search** →
collection `discussions`, index name **`discussion_embeddings`**:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```

`numDimensions: 768` for Gemini `text-embedding-004` (NOT 1536).

### 4. Run the service

```bash
uvicorn main:app --reload --port 8001
```

### 5. Verify

```bash
curl http://localhost:8001/health
# => {"status":"running","model":"gemini-1.5-flash","embedding":"text-embedding-004"}
```

### 6. Seed (from the Node backend)

```bash
cd ../Backend
node scripts/seedDiscussions.js
```

This inserts 25 realistic discussions via Mongoose and, for each one, calls
`POST /embed` on this Python service. Python generates the Gemini embedding
and writes it back to Mongo via its own pymongo connection.

---

## API

| Method | Path     | Body                                                    | Returns                                                       |
| ------ | -------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| GET    | `/health`| —                                                       | `{status, model, embedding}`                                  |
| POST   | `/embed` | `{discussionId, title, content, tags, category}`        | `{success, discussionId, dimensions}` — also stores in Mongo  |
| POST   | `/chat`  | `{message, userId}`                                     | `{response, ragUsed, sourcesCount, webUsed}`                  |

## Module map

| File              | Responsibility                                        |
| ----------------- | ----------------------------------------------------- |
| `main.py`         | FastAPI endpoints                                     |
| `pipeline.py`     | Orchestration: embed → retrieve → maybe web → generate |
| `embedder.py`     | Gemini `text-embedding-004` (768-dim)                 |
| `generator.py`    | Gemini `gemini-1.5-flash` with 4 prompt templates     |
| `retriever.py`    | Mongo Atlas `$vectorSearch`                           |
| `web_search.py`   | Tavily search (optional)                              |
