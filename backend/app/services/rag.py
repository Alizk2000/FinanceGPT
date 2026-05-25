import os
import json
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 1000))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 200))
TOP_K = int(os.getenv("TOP_K_RESULTS", 5))
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3-8b-8192")

# In-memory store: session_id -> Chroma vectorstore
_vectorstores: dict = {}
# In-memory store: session_id -> conversation memory
_memories: dict = {}

embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)


def get_llm():
    """Return LLM based on configured provider."""
    if LLM_PROVIDER == "groq":
        return ChatGroq(
            api_key=os.getenv("GROQ_API_KEY"),
            model_name=LLM_MODEL,
            streaming=True,
        )
    return ChatOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        model_name=LLM_MODEL,
        streaming=True,
    )


def ingest_pdf(file_path: str, session_id: str) -> int:
    """
    Load a PDF, split into chunks, embed, and store in ChromaDB.
    Returns the number of chunks created.
    """
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    chunks = splitter.split_documents(documents)

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=f"session_{session_id}",
    )
    _vectorstores[session_id] = vectorstore

    # Reset memory for new document
    _memories[session_id] = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer",
    )

    return len(chunks)


def query_rag(question: str, session_id: str):
    """
    Retrieve relevant chunks and generate a streamed LLM answer.
    Yields tokens as they are generated, then yields sources.
    """
    vectorstore = _vectorstores.get(session_id)
    if not vectorstore:
        yield json.dumps({"error": "No document uploaded for this session."})
        return

    memory = _memories.get(session_id)
    retriever = vectorstore.as_retriever(search_kwargs={"k": TOP_K})

    chain = ConversationalRetrievalChain.from_llm(
        llm=get_llm(),
        retriever=retriever,
        memory=memory,
        return_source_documents=True,
    )

    result = chain({"question": question})
    answer = result["answer"]
    source_docs = result.get("source_documents", [])

    # Yield answer tokens word by word (simulate streaming)
    for word in answer.split(" "):
        yield json.dumps({"token": word + " "})

    # Yield sources
    sources = []
    for doc in source_docs:
        page = doc.metadata.get("page", "?")
        sources.append(f"Page {page + 1}")
    sources = list(dict.fromkeys(sources))  # deduplicate

    yield json.dumps({"sources": sources, "done": True})
