"""
Admin API — lightweight identity flagging (is this email the configured
admin?) and an admin-only overview of every user and the reviews they've
run. There's no password/account system here (spec: email-only identity) —
the "admin" flag is just a users-table column seeded from ``ADMIN_EMAIL``.
"""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from core.database import is_admin_email, list_reviews, list_users, upsert_user

logger = logging.getLogger("proofdesk.api.admin")

router = APIRouter(tags=["admin"])


class IdentifyRequest(BaseModel):
    email: EmailStr


class IdentifyResponse(BaseModel):
    email: str
    is_admin: bool


@router.post("/identify", response_model=IdentifyResponse)
def identify_user(request: IdentifyRequest) -> IdentifyResponse:
    """Register/refresh a user by email and report whether they're the admin."""
    user = upsert_user(request.email)
    return IdentifyResponse(email=user["email"], is_admin=bool(user["is_admin"]))


@router.get("/admin/users")
def admin_list_users(email: EmailStr) -> dict:
    """Return every known user and the reviews ('stories') they've analysed. Admin-only."""
    if not is_admin_email(email):
        raise HTTPException(status_code=403, detail="Not authorised")

    users = []
    for user in list_users():
        reviews = list_reviews(user["email"])
        users.append({
            "email": user["email"],
            "is_admin": bool(user["is_admin"]),
            "created_at": user["created_at"],
            "last_seen_at": user["last_seen_at"],
            "review_count": len(reviews),
            "reviews": reviews,
        })
    return {"users": users}
