"""JWT validation — shares the secret with the auth service.

The auth service (Node, @fastify/jwt) signs tokens with HS256. We decode the
same tokens here using the same secret, so any endpoint that takes a user
identity doesn't need to call the auth service on every request.
"""

import os
from typing import Optional
from fastapi import Header, HTTPException
import jwt


JWT_SECRET = os.getenv("JWT_SECRET", "autodrive-dev-secret-change-in-prod")


class AuthUser:
    def __init__(self, id: str, name: str, email: str, role: str = "user"):
        self.id = id
        self.name = name
        self.email = email
        self.role = role


def require_user(authorization: Optional[str] = Header(default=None)) -> AuthUser:
    """FastAPI dependency: decode and verify the Authorization header."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if "id" not in payload or "email" not in payload:
        raise HTTPException(status_code=401, detail="Malformed token payload")

    return AuthUser(
        id=payload["id"],
        name=payload.get("name", ""),
        email=payload["email"],
        role=payload.get("role", "user"),
    )
