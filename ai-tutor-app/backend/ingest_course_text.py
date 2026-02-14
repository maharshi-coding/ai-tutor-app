"""
Simple ingestion script for course text into the RAG index.

Usage (from backend directory):

  python ingest_course_text.py 1 course_content/python_intro.txt

This will:
- Read the text file.
- Split it into manageable chunks.
- Embed and store them in a Chroma collection for course_id=1.

The tutor endpoint will then be able to use this context when answering
questions for that course.
"""

import sys
from pathlib import Path
from typing import List, Tuple

from app.rag import ingest_course_chunks


def split_into_chunks(text: str, max_chars: int = 800) -> List[str]:
    """
    Naive text splitter: splits on paragraph boundaries into ~max_chars chunks.
    """
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0

    for p in paragraphs:
        if current_len + len(p) + 2 > max_chars and current:
            chunks.append("\n\n".join(current))
            current = []
            current_len = 0
        current.append(p)
        current_len += len(p) + 2

    if current:
        chunks.append("\n\n".join(current))

    return chunks


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: python ingest_course_text.py <course_id> <text_file>")
        sys.exit(1)

    course_id = int(sys.argv[1])
    file_path = Path(sys.argv[2])

    if not file_path.exists():
        print(f"File not found: {file_path}")
        sys.exit(1)

    text = file_path.read_text(encoding="utf-8")
    raw_chunks = split_into_chunks(text)

    chunks: List[Tuple[str, str]] = []
    for idx, chunk in enumerate(raw_chunks):
        chunk_id = f"{course_id}_{idx}"
        chunks.append((chunk_id, chunk))

    print(f"Ingesting {len(chunks)} chunks for course {course_id}...")
    ingest_course_chunks(course_id, chunks)
    print("Done.")


if __name__ == "__main__":
    main()

