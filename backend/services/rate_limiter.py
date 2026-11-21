"""
CivicLens In-Memory Rate Limiter
Enforces a sliding window per-IP limit on complaint submissions to protect against spam.
"""

import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, HTTPException, status
from config import RATE_LIMIT_REQUESTS_PER_MINUTE

class InMemoryRateLimiter:
    def __init__(self, max_requests: int = RATE_LIMIT_REQUESTS_PER_MINUTE, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def check(self, request: Request) -> None:
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        cutoff = now - self.window_seconds

        # Clean timestamps older than window
        timestamps = [t for t in self.requests[client_ip] if t > cutoff]
        self.requests[client_ip] = timestamps

        if len(timestamps) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Please wait a moment before submitting another complaint."
            )

        self.requests[client_ip].append(now)

limiter = InMemoryRateLimiter()
