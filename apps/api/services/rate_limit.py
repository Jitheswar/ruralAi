"""Shared rate limiter instance for use across routers."""

import os

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def _client_ip(request: Request) -> str:
    """Extract client IP. Only trusts proxy headers when BEHIND_PROXY=true."""
    trust_proxy = os.getenv("BEHIND_PROXY", "false").lower() == "true"
    if trust_proxy:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
    return get_remote_address(request)


limiter = Limiter(key_func=_client_ip, default_limits=["60/minute"])
