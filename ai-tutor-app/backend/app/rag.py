from pathlib import Path
from typing import List, Tuple, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer


_EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_CHROMA_DIR = Path("./rag_data")

_embedder: Optional[SentenceTransformer] = None
_client: Optional[chromadb.Client] = None


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

  collection.add(
      ids=ids,
      documents=texts,
      embeddings=embeddings,
  )


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

