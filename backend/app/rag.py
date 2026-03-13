from pathlib import Path
import re
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
_STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "how",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "this",
    "to",
    "what",
    "when",
    "where",
    "which",
    "why",
    "with",
}


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
    chunks: List[Tuple[str, str] | Tuple[str, str, dict[str, Any]]],
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

    ids: List[str] = []
    texts: List[str] = []
    metadatas: List[dict[str, Any]] = []
    for item in chunks:
        if len(item) == 2:
            chunk_id, text = item
            metadata = {}
        else:
            chunk_id, text, metadata = item
        ids.append(chunk_id)
        texts.append(text)
        metadatas.append(metadata)

    embeddings = embedder.encode(texts).tolist()
    cleaned_metadatas = [metadata or {} for metadata in metadatas]

    if hasattr(collection, "upsert"):
        collection.upsert(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=cleaned_metadatas,
        )
        return

    collection.add(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=cleaned_metadatas,
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
    return [passage["text"] for passage in retrieve_relevant_passages(course_id, query, top_k)]


def retrieve_relevant_passages(
    course_id: int,
    query: str,
    top_k: int = 4,
) -> List[dict[str, Any]]:
    """
    Retrieve the most relevant text chunks for a course & query.

    Returns a list of passage payloads with text and metadata.
    """
    collection = get_course_collection(course_id)
    if collection.count() == 0:
        return []

    embedder = get_embedder()
    query_vec = embedder.encode([query]).tolist()[0]

    results = collection.query(
        query_embeddings=[query_vec],
        n_results=max(top_k * 3, top_k),
        include=["documents", "metadatas", "distances"],
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]
    if not documents:
        return []

    query_terms = _tokenize(query)
    candidates: List[dict[str, Any]] = []
    for index, document in enumerate(documents):
        metadata = metadatas[index] if index < len(metadatas) else {}
        distance = distances[index] if index < len(distances) else None
        lexical = _keyword_overlap_score(query_terms, document, metadata)
        distance_penalty = float(distance) if isinstance(distance, (float, int)) else 1.0
        score = lexical + (1 / (1 + max(distance_penalty, 0.0)))
        candidates.append(
            {
                "text": document,
                "metadata": metadata or {},
                "distance": distance,
                "score": score,
            }
        )

    candidates.sort(key=lambda item: item["score"], reverse=True)

    deduped: List[dict[str, Any]] = []
    seen_keys: set[str] = set()
    for candidate in candidates:
        text = candidate["text"].strip()
        key = text[:180]
        if not text or key in seen_keys:
            continue
        seen_keys.add(key)
        deduped.append(candidate)
        if len(deduped) >= top_k:
            break
    return deduped


def _tokenize(value: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-zA-Z][a-zA-Z0-9_+-]{1,}", value.lower())
        if token not in _STOPWORDS
    }


def _keyword_overlap_score(
    query_terms: set[str],
    document: str,
    metadata: dict[str, Any] | None,
) -> float:
    if not query_terms:
        return 0.0
    metadata = metadata or {}
    metadata_text = " ".join(
        str(metadata.get(key, ""))
        for key in ("title", "source", "path")
    )
    document_terms = _tokenize(f"{metadata_text} {document[:2000]}")
    if not document_terms:
        return 0.0
    overlap = len(query_terms & document_terms)
    if overlap == 0:
        return 0.0
    return overlap / max(len(query_terms), 1)

