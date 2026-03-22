"""
Medicine Database Service — queries Supabase medicines table.

All public functions are async. Since supabase-py is synchronous,
DB calls are offloaded via asyncio.to_thread to avoid blocking the event loop.
"""

import asyncio
import os
import threading
import time
from services.auth import get_supabase_client

_MEDICINE_CACHE_LOCK = threading.Lock()
_MEDICINE_NAMES_CACHE: dict[str, str | float | None] = {"value": None, "expires_at": 0.0}
_MEDICINE_NAMES_TTL_SECONDS = int(os.getenv("MEDICINE_NAMES_CACHE_TTL_SECONDS", "600"))


def _get_client():
    return get_supabase_client()


def _escape_ilike(s: str) -> str:
    """Escape special ilike wildcard characters in user input."""
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _search_medicines_sync(query: str, limit: int) -> list[dict]:
    client = _get_client()
    q = _escape_ilike(query.strip().lower())
    result = (
        client.table("medicines")
        .select("*")
        .or_(
            f"brand_name.ilike.%{q}%,"
            f"generic_name.ilike.%{q}%,"
            f"salt_composition.ilike.%{q}%,"
            f"hindi_name.ilike.%{q}%"
        )
        .limit(limit)
        .execute()
    )
    return result.data or []


async def search_medicines(query: str, limit: int = 20) -> list[dict]:
    """Search medicines by brand name, generic name, or salt composition."""
    return await asyncio.to_thread(_search_medicines_sync, query, limit)


def _get_medicine_by_id_sync(medicine_id: str) -> dict | None:
    client = _get_client()
    result = client.table("medicines").select("*").eq("id", medicine_id).single().execute()
    return result.data


async def get_medicine_by_id(medicine_id: str) -> dict | None:
    """Get a single medicine by ID."""
    return await asyncio.to_thread(_get_medicine_by_id_sync, medicine_id)


def _get_medicines_by_names_sync(names: list[str]) -> list[dict]:
    """Single-query batch lookup instead of N sequential queries."""
    client = _get_client()
    # Build a single OR filter for all names
    conditions = []
    for name in names:
        q = _escape_ilike(name.strip().lower())
        if q:
            conditions.append(f"brand_name.ilike.%{q}%")
            conditions.append(f"generic_name.ilike.%{q}%")
            conditions.append(f"salt_composition.ilike.%{q}%")

    if not conditions:
        return []

    result = (
        client.table("medicines")
        .select("*")
        .or_(",".join(conditions))
        .limit(50)
        .execute()
    )
    return result.data or []


async def get_medicines_by_names(names: list[str]) -> list[dict]:
    """Look up medicines by a list of brand/generic names (single batch query)."""
    return await asyncio.to_thread(_get_medicines_by_names_sync, names)


def _get_medicines_by_category_sync(category: str, limit: int) -> list[dict]:
    client = _get_client()
    result = (
        client.table("medicines")
        .select("*")
        .eq("category", category)
        .order("generic_name")
        .limit(limit)
        .execute()
    )
    return result.data or []


async def get_medicines_by_category(category: str, limit: int = 50) -> list[dict]:
    """Get medicines filtered by category."""
    return await asyncio.to_thread(_get_medicines_by_category_sync, category, limit)


def _get_all_medicine_names_sync() -> str:
    client = _get_client()
    result = (
        client.table("medicines")
        .select("generic_name, brand_name, strength, dosage_form, category")
        .order("generic_name")
        .limit(500)
        .execute()
    )
    if not result.data:
        return "No medicines in database"

    lines = []
    for m in result.data:
        line = f"- {m['generic_name']} ({m['brand_name']}) {m.get('strength', '')} {m.get('dosage_form', '')} [{m.get('category', '')}]"
        lines.append(line)
    return "\n".join(lines)


async def get_all_medicine_names() -> str:
    """Get a compact list of all medicines for Gemini prompt context."""
    now = time.time()
    with _MEDICINE_CACHE_LOCK:
        cached_value = _MEDICINE_NAMES_CACHE.get("value")
        expires_at = float(_MEDICINE_NAMES_CACHE.get("expires_at") or 0.0)
        if isinstance(cached_value, str) and now < expires_at:
            return cached_value

    value = await asyncio.to_thread(_get_all_medicine_names_sync)

    with _MEDICINE_CACHE_LOCK:
        # Double-check: another thread may have refreshed while we waited
        expires_at = float(_MEDICINE_NAMES_CACHE.get("expires_at") or 0.0)
        if now >= expires_at:
            _MEDICINE_NAMES_CACHE["value"] = value
            _MEDICINE_NAMES_CACHE["expires_at"] = time.time() + _MEDICINE_NAMES_TTL_SECONDS

    return value
