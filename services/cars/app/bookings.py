"""In-memory booking store + Pydantic models.

Booking = a user's test-drive reservation for a specific car on a specific
date/time_slot. Swap this in-memory list for a real database later — the
rest of the app only touches it through the helpers here.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Literal, Optional
from pydantic import BaseModel, Field


BookingStatus = Literal["confirmed", "cancelled", "completed"]


class BookingRequest(BaseModel):
    """Body for POST /cars/{car_id}/book."""
    date: str = Field(..., description="ISO date, e.g. 2025-03-15")
    time_slot: str = Field(..., description="e.g. 10:00 or 'Tomorrow 10AM – 12PM'")
    name: str = Field(..., min_length=1, max_length=120)
    phone: str = Field(..., min_length=5, max_length=20)


class Booking(BaseModel):
    id: str
    car_id: str
    user_id: str
    user_email: str
    date: str
    time_slot: str
    name: str
    phone: str
    status: BookingStatus = "confirmed"
    created_at: str


# ── In-memory store: list of Booking records ──────────────────────────────
_BOOKINGS: list[Booking] = []


def create_booking(
    car_id: str,
    user_id: str,
    user_email: str,
    data: BookingRequest,
) -> Booking:
    booking = Booking(
        id=str(uuid.uuid4()),
        car_id=car_id,
        user_id=user_id,
        user_email=user_email,
        date=data.date,
        time_slot=data.time_slot,
        name=data.name,
        phone=data.phone,
        status="confirmed",
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    _BOOKINGS.append(booking)
    return booking


def find_conflict(car_id: str, date: str, time_slot: str) -> Optional[Booking]:
    """Return an existing confirmed booking for the same car/date/slot, if any."""
    for b in _BOOKINGS:
        if (
            b.car_id == car_id
            and b.date == date
            and b.time_slot == time_slot
            and b.status == "confirmed"
        ):
            return b
    return None


def bookings_for_user(user_id: str) -> list[Booking]:
    return [b for b in _BOOKINGS if b.user_id == user_id]


def bookings_for_car(car_id: str) -> list[Booking]:
    return [b for b in _BOOKINGS if b.car_id == car_id]
