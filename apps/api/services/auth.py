"""
Auth Service — validates Supabase JWT tokens and retrieves current user.

Architecture:
- get_supabase_client() returns a SERVICE ROLE client that bypasses RLS.
  Use only for server-side operations that need admin access
  (e.g., auto-creating patient records, cross-user reads).
- Token validation in get_current_user_id() uses the Supabase Auth API
  which validates JWTs independently of the client's key type.
"""

import os
import threading
from fastapi import Header, HTTPException, Depends
from supabase import create_client, Client

_service_client: Client | None = None
_service_client_key: str | None = None
_client_lock = threading.Lock()


def get_supabase_client() -> Client:
    """Return a Supabase client using the service role key (bypasses RLS).

    WARNING: This client has full database access. Only use for server-side
    operations where RLS bypass is intentional (e.g., patient auto-creation).
    Falls back to anon key if service key is not set.
    Thread-safe: uses a lock to prevent races during cold-start creation.
    Detects key rotation: re-creates client if the key changes.
    """
    global _service_client, _service_client_key
    url = os.getenv("SUPABASE_URL", "")
    # Prefer service role key for server-side ops (bypasses RLS)
    key = os.getenv("SUPABASE_SERVICE_KEY", "") or os.getenv("SUPABASE_ANON_KEY", "")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) must be set")

    with _client_lock:
        if _service_client is None or _service_client_key != key:
            _service_client = create_client(url, key)
            _service_client_key = key
    return _service_client


async def get_current_user_id(authorization: str = Header(None)) -> str:
    """
    Validate the Bearer token and return the user ID.
    If Supabase validation fails, raises 401.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    token = authorization.split(" ")[1]
    client = get_supabase_client()

    try:
        user = client.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
