# FinanceGPT 💬📊

> **AI-powered financial document Q&A — ask plain-English questions about any financial report and get accurate, source-cited answers.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)

---

## What is FinanceGPT?

FinanceGPT is a full-stack web application that lets users upload financial documents (annual reports, earnings statements, budget plans) and interact with them through a natural language chat interface — powered by large language models and a RAG (Retrieval-Augmented Generation) pipeline.

Built as a demonstration of how AI can transform financial reporting and analytics workflows — directly inspired by the kind of digital transformation work done in enterprise finance teams.

---

## Demo

![FinanceGPT Demo](docs/demo.png)

**Try it:** Upload Nokia's 2024 Annual Report → Ask *"What was Nokia's net revenue in Q3?"* → Get a precise, cited answer in seconds.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Next.js 15 Frontend                    │   │
│   │   • Chat UI (React + TypeScript + Tailwind CSS)     │   │
│   │   • PDF upload + drag-and-drop                      │   │
│   │   • Streaming token display                         │   │
│   │   • Conversation history sidebar                    │   │
│   └────────────────────┬────────────────────────────────┘   │
└────────────────────────│────────────────────────────────────┘
                         │ HTTP / SSE streaming
┌────────────────────────▼────────────────────────────────────┐
│                   FastAPI Backend (Python)                   │
│                                                             │
│   POST /api/upload  →  PDF ingestion pipeline               │
│   POST /api/ask     →  RAG query + LLM response             │
│   GET  /api/history →  Conversation retrieval               │
│   DELETE /api/clear →  Session management                   │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │              RAG Pipeline (LangChain)                │  │
│   │                                                      │  │
│   │  PDF → PyMuPDF → Text chunks → Embeddings           │  │
│   │                                    ↓                 │  │
│   │                             ChromaDB (vector store)  │  │
│   │                                    ↓                 │  │
│   │  Query → Retrieve top-k chunks → LLM (GPT/Llama)   │  │
│   │                                    ↓                 │  │
│   │                          Grounded answer + sources   │  │
│   └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    PostgreSQL Database                       │
│                                                             │
│   conversations  →  session_id, question, answer, timestamp │
│   documents      →  filename, upload_time, chunk_count      │
│   sessions       →  session metadata                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15, React 19, TypeScript | Web UI, routing, SSR |
| Styling | Tailwind CSS | Component styling |
| Backend | FastAPI, Python 3.11 | REST API + streaming |
| AI / LLM | LangChain, OpenAI / Groq | RAG pipeline, LLM calls |
| Vector Store | ChromaDB | Embedding storage + retrieval |
| Embeddings | sentence-transformers | Text → vector conversion |
| Database | PostgreSQL 16 + SQLAlchemy | Conversation persistence |
| PDF parsing | PyMuPDF | Document ingestion |
| DevOps | Docker, docker-compose | Containerisation |
| CI/CD | GitHub Actions | Automated testing + linting |

---

## Features

- 📄 **PDF upload** — drag and drop any financial document
- 💬 **Natural language Q&A** — ask questions in plain English
- 🔍 **Source citations** — every answer shows which pages were used
- ⚡ **Streaming responses** — tokens stream like ChatGPT, no waiting
- 🧠 **Conversation memory** — follow-up questions use prior context
- 📚 **Chat history** — all past conversations saved and searchable
- 🐳 **One-command deploy** — `docker-compose up` starts everything
- 🔒 **Session isolation** — each user session has its own document context

---

## Getting Started

### Prerequisites

- Docker and docker-compose
- An OpenAI API key **or** a free [Groq API key](https://groq.com) (recommended)

### Run with Docker (recommended)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/FinanceGPT.git
cd FinanceGPT

# 2. Set your API key
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY or GROQ_API_KEY

# 3. Start everything
docker-compose up --build

# 4. Open in browser
# Frontend: http://localhost:3000
# API docs:  http://localhost:8000/docs
```

### Run locally (development)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

**Database:**
```bash
# Make sure PostgreSQL is running, then:
cd backend
alembic upgrade head
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# LLM Provider — use one of these
OPENAI_API_KEY=sk-...          # OpenAI (paid)
GROQ_API_KEY=gsk_...           # Groq (free, recommended)

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/financegpt

# App config
LLM_PROVIDER=groq              # "openai" or "groq"
LLM_MODEL=llama3-8b-8192       # model name
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RESULTS=5
```

---

## Project Structure

```
FinanceGPT/
├── frontend/                   # Next.js 15 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing / redirect
│   │   │   ├── chat/
│   │   │   │   └── page.tsx    # Main chat interface
│   │   │   ├── history/
│   │   │   │   └── page.tsx    # Conversation history
│   │   │   └── layout.tsx      # Root layout + sidebar
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx  # Message display
│   │   │   ├── ChatInput.tsx   # Question input + submit
│   │   │   ├── FileUpload.tsx  # PDF drag-and-drop
│   │   │   ├── Sidebar.tsx     # Navigation + history
│   │   │   └── SourceCitation.tsx  # Source page display
│   │   └── lib/
│   │       └── api.ts          # API call functions
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                    # FastAPI Python app
│   ├── app/
│   │   ├── main.py             # FastAPI app + CORS
│   │   ├── routers/
│   │   │   ├── upload.py       # POST /api/upload
│   │   │   ├── chat.py         # POST /api/ask (streaming)
│   │   │   └── history.py      # GET /api/history
│   │   ├── models/
│   │   │   └── database.py     # SQLAlchemy models
│   │   └── services/
│   │       ├── rag.py          # LangChain RAG pipeline
│   │       ├── llm.py          # LLM provider abstraction
│   │       └── embeddings.py   # Embedding service
│   ├── alembic/                # DB migrations
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml          # Orchestrates all services
├── .env.example                # Environment template
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
└── README.md
```

---

## API Reference

### `POST /api/upload`
Upload a PDF document for processing.
```json
// Request: multipart/form-data
{ "file": <PDF file>, "session_id": "abc123" }

// Response
{ "message": "Document processed", "chunks": 47, "filename": "nokia_2024.pdf" }
```

### `POST /api/ask`
Ask a question — returns a streaming response (SSE).
```json
// Request
{ "question": "What was Nokia's net revenue in 2024?", "session_id": "abc123" }

// Response: Server-Sent Events stream
data: {"token": "Nokia"}
data: {"token": "'s net"}
data: {"token": " revenue..."}
data: {"sources": ["Page 12", "Page 34"], "done": true}
```

### `GET /api/history`
Get all past conversations.
```json
// Response
[
  {
    "id": 1,
    "session_id": "abc123",
    "question": "What was Nokia's revenue?",
    "answer": "Nokia's net revenue was €22.3 billion...",
    "sources": ["Page 12"],
    "timestamp": "2026-05-23T10:30:00"
  }
]
```

---

## How RAG Works

```
1. UPLOAD PHASE
   PDF file → PyMuPDF extracts text → Split into 1000-char chunks
   → sentence-transformers converts each chunk to a 384-dim vector
   → Vectors stored in ChromaDB with metadata (page number, filename)

2. QUERY PHASE
   User question → Convert to vector using same embedding model
   → ChromaDB finds top-5 most similar chunks (cosine similarity)
   → Chunks injected into LLM prompt as context
   → LLM generates answer grounded in document content
   → Sources (page numbers) returned alongside answer

3. MEMORY PHASE
   Previous Q&A pairs stored in PostgreSQL
   → Passed as conversation history to LLM for follow-up questions
   → Enables context-aware multi-turn conversations
```

---

## Roadmap

- [x] PDF upload and RAG pipeline
- [x] Streaming LLM responses
- [x] PostgreSQL conversation history
- [x] Source citations
- [x] Docker deployment
- [ ] Multi-document support (query across multiple PDFs)
- [ ] User authentication
- [ ] Export conversation as PDF report
- [ ] Support for Excel/CSV financial data
- [ ] Azure deployment (AKS)

---

## Contributing

Pull requests welcome. For major changes please open an issue first.

---

## License

MIT

---

## Author

**Ali Zain Kareem**
BBA Business & IT — LAB University of Applied Sciences, Espoo, Finland
BSc Computer Science — FAST-NUCES

[LinkedIn](https://linkedin.com/in/YOUR_PROFILE) · [GitHub](https://github.com/YOUR_USERNAME)
