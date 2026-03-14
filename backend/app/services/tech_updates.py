from __future__ import annotations

import html
import re
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from email.utils import parsedate_to_datetime
from typing import Iterable, Optional
from urllib.parse import urlparse
from xml.etree import ElementTree

import httpx

from app.config import settings


TAG_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+")
SCRIPT_TARGET_WORDS = 105
MAX_SUMMARY_WORDS = 26

_daily_update_cache: dict[str, "DailyTechUpdate"] = {}


@dataclass
class TechUpdateItem:
    title: str
    url: str
    summary: str
    source: str
    published_at: datetime


@dataclass
class DailyTechUpdate:
    title: str
    summary: str
    script: str
    highlights: list[str]
    source_urls: list[str]
    date_key: str


def _feed_urls() -> list[str]:
    raw = (settings.TECH_UPDATES_FEEDS or "").strip()
    return [url.strip() for url in raw.split(",") if url.strip()]


def _strip_html(text: str) -> str:
    cleaned = TAG_RE.sub(" ", html.unescape(text or ""))
    return WHITESPACE_RE.sub(" ", cleaned).strip()


def _truncate_words(text: str, max_words: int) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text.strip()
    shortened = " ".join(words[:max_words]).rstrip(" ,;:-")
    return f"{shortened}."


def _normalize_title(text: str) -> str:
    cleaned = _strip_html(text)
    cleaned = cleaned.replace("â€™", "'").replace("â€“", "-").replace("â€”", "-")
    return _truncate_words(cleaned, 18)


def _normalize_summary(text: str, title: str) -> str:
    cleaned = _strip_html(text)
    if not cleaned:
        return title
    lowered_title = title.lower()
    if cleaned.lower().startswith(lowered_title):
        cleaned = cleaned[len(title) :].strip(" .:-")
    return _truncate_words(cleaned, MAX_SUMMARY_WORDS)


def _safe_datetime(raw_value: Optional[str]) -> datetime:
    if not raw_value:
        return datetime.now(UTC)
    try:
        value = parsedate_to_datetime(raw_value)
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value.astimezone(UTC)
    except Exception:
        return datetime.now(UTC)


def _source_label(url: str) -> str:
    host = urlparse(url).netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    return host or "tech news"


def _extract_items_from_feed(xml_text: str, source_url: str) -> list[TechUpdateItem]:
    root = ElementTree.fromstring(xml_text)
    items: list[TechUpdateItem] = []
    namespaces = {"atom": "http://www.w3.org/2005/Atom"}

    for node in root.findall("./channel/item"):
        title = _normalize_title(node.findtext("title") or "")
        url = (node.findtext("link") or "").strip()
        summary = _normalize_summary(
            node.findtext("description") or node.findtext("content:encoded") or "",
            title,
        )
        published_at = _safe_datetime(node.findtext("pubDate"))
        if title and url:
            items.append(
                TechUpdateItem(
                    title=title,
                    url=url,
                    summary=summary,
                    source=_source_label(source_url),
                    published_at=published_at,
                )
            )

    for node in root.findall("./atom:entry", namespaces):
        title = _normalize_title(node.findtext("atom:title", default="", namespaces=namespaces))
        url = ""
        for link in node.findall("atom:link", namespaces):
            href = (link.attrib.get("href") or "").strip()
            if href:
                url = href
                break
        summary = _normalize_summary(
            node.findtext("atom:summary", default="", namespaces=namespaces)
            or node.findtext("atom:content", default="", namespaces=namespaces)
            or "",
            title,
        )
        published_at = _safe_datetime(
            node.findtext("atom:updated", default="", namespaces=namespaces)
            or node.findtext("atom:published", default="", namespaces=namespaces)
        )
        if title and url:
            items.append(
                TechUpdateItem(
                    title=title,
                    url=url,
                    summary=summary,
                    source=_source_label(source_url),
                    published_at=published_at,
                )
            )

    return items


async def fetch_latest_tech_updates() -> list[TechUpdateItem]:
    lookback = datetime.now(UTC) - timedelta(days=max(settings.TECH_UPDATES_LOOKBACK_DAYS, 1))
    deduped: dict[str, TechUpdateItem] = {}

    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
        for feed_url in _feed_urls():
            try:
                response = await client.get(feed_url)
                response.raise_for_status()
                parsed_items = _extract_items_from_feed(response.text, feed_url)
            except Exception:
                continue

            for item in parsed_items:
                if item.published_at < lookback:
                    continue
                key = item.url.strip().lower() or item.title.strip().lower()
                if not key:
                    continue
                current = deduped.get(key)
                if current is None or item.published_at > current.published_at:
                    deduped[key] = item

    sorted_items = sorted(
        deduped.values(),
        key=lambda item: item.published_at,
        reverse=True,
    )
    return sorted_items[: max(settings.TECH_UPDATES_MAX_ITEMS * 2, 6)]


def _build_highlights(items: Iterable[TechUpdateItem]) -> list[str]:
    highlights: list[str] = []
    for index, item in enumerate(items):
        prefix = ["First", "Next", "Also"][index] if index < 3 else "Also"
        sentence = item.summary if item.summary else item.title
        sentence = sentence.rstrip(". ")
        highlights.append(f"{prefix}, {sentence}.")
    return highlights


def _build_script(items: list[TechUpdateItem], date_label: str) -> str:
    highlights = _build_highlights(items[:3])
    intro = f"Here is your daily tech briefing for {date_label}."
    outro = "That is your one-minute update."
    script = " ".join([intro, *highlights, outro])
    return _truncate_words(script, SCRIPT_TARGET_WORDS)


def _build_summary(items: list[TechUpdateItem]) -> str:
    top = items[:3]
    if not top:
        raise RuntimeError("No recent technology updates were available.")
    sentences = [item.title.rstrip(". ") + "." for item in top]
    return " ".join(sentences)


async def build_daily_tech_update(force_refresh: bool = False) -> DailyTechUpdate:
    date_key = datetime.now(UTC).date().isoformat()
    if not force_refresh and date_key in _daily_update_cache:
        return _daily_update_cache[date_key]

    items = await fetch_latest_tech_updates()
    if not items:
        raise RuntimeError("Could not fetch any recent technology updates.")

    top_items = items[: max(settings.TECH_UPDATES_MAX_ITEMS, 3)]
    date_label = datetime.now(UTC).strftime("%B %d")
    update = DailyTechUpdate(
        title=f"Daily Tech Briefing for {date_label}",
        summary=_build_summary(top_items),
        script=_build_script(top_items, date_label),
        highlights=[item.title for item in top_items[:3]],
        source_urls=[item.url for item in top_items[:3]],
        date_key=date_key,
    )
    _daily_update_cache[date_key] = update
    return update
