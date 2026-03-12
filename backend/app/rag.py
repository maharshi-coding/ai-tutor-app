from pathlib import Path
from typing import Any, List, Optional, Tuple

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except Exception:  # pragma: no cover - optional dependency
    RecursiveCharacterTextSplitter = None  # type: ignore[assignment]


_EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_CHROMA_DIR = Path("./rag_data")

_embedder: Optional[SentenceTransformer] = None
_client: Optional[chromadb.Client] = None
_text_splitter: Optional[Any] = None


def get_embedder() -> SentenceTransformer:
    """Lazily load a sentence-transformers embedding model."""
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer(_EMBED_MODEL_NAME)
    return _embedder


def get_chroma_client() -> chromadb.Client:
    """Return a persistent Chroma client stored under ./rag_data."""
    global _client
    if _client is None:
        _CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        _client = chromadb.Client(
            ChromaSettings(
                persist_directory=str(_CHROMA_DIR),
                is_persistent=True,
            )
        )
    return _client


def get_text_splitter() -> Any | None:
    """Return a LangChain splitter when available."""
    global _text_splitter
    if RecursiveCharacterTextSplitter is None:
        return None
    if _text_splitter is None:
        _text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1200,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
    return _text_splitter


def split_text_for_rag(
    text: str,
    metadata: Optional[dict[str, Any]] = None,
) -> List[str]:
    """
    Split long course text into retrieval-friendly chunks.

    Prefers a LangChain recursive splitter when installed, but falls back
    to a light word-based splitter so the app still runs in lean envs.
    """
    normalized = text.strip()
    if not normalized:
        return []

    splitter = get_text_splitter()
    if splitter is not None:
        documents = splitter.create_documents([normalized], metadatas=[metadata or {}])
        return [
            document.page_content.strip()
            for document in documents
            if document.page_content.strip()
        ]

    words = normalized.split()
    chunks: List[str] = []
    chunk_size = 220
    overlap = 35
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end]).strip()
        if chunk:
            chunks.append(chunk)
        start += max(chunk_size - overlap, 1)
    return chunks


def get_course_collection(course_id: int):
    """
    Get (or create) a Chroma collection for a course.

    Each course has its own namespace, so content for different subjects
    is kept separate.
    """
    client = get_chroma_client()
    name = f"course_{course_id}"
    return client.get_or_create_collection(name=name)


def ingest_course_chunks(
    course_id: int,
    chunks: List[Tuple[str, str]],
) -> None:
    """
    Ingest text chunks for a course into Chroma.

    Args:
        course_id: numeric course id from the DB.
        chunks: list of (chunk_id, text) tuples.
    """
    if not chunks:
        return

    collection = get_course_collection(course_id)
    embedder = get_embedder()

    ids = [cid for cid, _ in chunks]
    texts = [txt for _, txt in chunks]

    embeddings = embedder.encode(texts).tolist()

    if hasattr(collection, "upsert"):
        collection.upsert(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
        )
        return

    collection.add(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
    )


def delete_course_chunks(course_id: int, chunk_ids: List[str]) -> None:
    """Best-effort deletion used when refreshing seeded course content."""
    if not chunk_ids:
        return

    try:
        collection = get_course_collection(course_id)
        collection.delete(ids=chunk_ids)
    except Exception:
        # Chroma deletion should not take the app down.
        return


def retrieve_relevant_chunks(
    course_id: int,
    query: str,
    top_k: int = 4,
) -> List[str]:
    """
    Retrieve the most relevant text chunks for a course & query.

    Returns a list of raw text snippets (may be empty).
    """
    collection = get_course_collection(course_id)
    if collection.count() == 0:
        return []

    embedder = get_embedder()
    query_vec = embedder.encode([query]).tolist()[0]

    results = collection.query(
        query_embeddings=[query_vec],
        n_results=top_k,
    )

    return results.get("documents", [[]])[0]

