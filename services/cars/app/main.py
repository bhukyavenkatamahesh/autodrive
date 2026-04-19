# main.py — the Cars Service API
#
# Endpoints:
#   GET    /cars                        list with optional filters
#   GET    /cars/{car_id}               single car
#   GET    /brands                      list of brands
#   GET    /locations                   list of cities
#   POST   /cars/{car_id}/book          create a booking (auth required)
#   GET    /cars/{car_id}/bookings      bookings for a car (auth required)
#   GET    /bookings/me                 current user's bookings (auth required)
#   GET    /health                      liveness probe

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .models import Car
from .data import CARS, BRANDS, LOCATIONS
from .auth import require_user, AuthUser
from .bookings import (
    BookingRequest,
    Booking,
    create_booking,
    find_conflict,
    bookings_for_user,
    bookings_for_car,
)


app = FastAPI(
    title="AutoDrive Cars Service",
    description="API for listing, filtering, retrieving car listings, and booking test drives.",
    version="1.1.0",
)

# CORS — allow the Next.js frontend to talk to us directly from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)


# ─── PUBLIC ENDPOINTS ─────────────────────────────────────────────────────────

@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"service": "cars", "status": "ok"}


@app.get("/cars", response_model=list[Car])
def list_cars(
    make: Optional[str] = Query(default=None),
    min_price: Optional[int] = Query(default=None),
    max_price: Optional[int] = Query(default=None),
    fuel_type: Optional[str] = Query(default=None),
    transmission: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    sort: Optional[str] = Query(default=None, description="price_asc, price_desc, year_desc, mileage_asc"),
    limit: Optional[int] = Query(default=None, ge=1, le=100),
) -> list[Car]:
    """Return all cars, with optional filtering and sorting."""
    results = list(CARS)

    if make and make.lower() != "all":
        results = [c for c in results if c.make.lower() == make.lower()]
    if min_price is not None:
        results = [c for c in results if c.price >= min_price]
    if max_price is not None:
        results = [c for c in results if c.price <= max_price]
    if fuel_type and fuel_type.lower() != "all":
        results = [c for c in results if c.fuel_type.lower() == fuel_type.lower()]
    if transmission and transmission.lower() != "all":
        results = [c for c in results if c.transmission.lower() == transmission.lower()]
    if location and location.lower() not in ("all", "all cities"):
        results = [c for c in results if c.location.lower() == location.lower()]
    if search:
        q = search.lower()
        results = [c for c in results if q in f"{c.make} {c.model} {c.year}".lower()]

    if sort:
        sort_map = {
            "price_asc": (lambda c: c.price, False),
            "price_desc": (lambda c: c.price, True),
            "year_desc": (lambda c: c.year, True),
            "year_asc": (lambda c: c.year, False),
            "mileage_asc": (lambda c: c.mileage, False),
        }
        if sort in sort_map:
            key, reverse = sort_map[sort]
            results = sorted(results, key=key, reverse=reverse)

    if limit:
        results = results[:limit]

    return results


@app.get("/cars/{car_id}", response_model=Car)
def get_car(car_id: str) -> Car:
    """Return a single car by its ID, or 404 if not found."""
    car = next((c for c in CARS if c.id == car_id), None)
    if car is None:
        raise HTTPException(status_code=404, detail=f"Car with id '{car_id}' not found")
    return car


@app.get("/brands")
def list_brands() -> list[dict]:
    return BRANDS


@app.get("/locations")
def list_locations() -> list[str]:
    return LOCATIONS


# ─── BOOKING ENDPOINTS (auth required) ────────────────────────────────────────

@app.post("/cars/{car_id}/book", response_model=Booking, status_code=201)
def book_car(
    car_id: str,
    body: BookingRequest,
    user: AuthUser = Depends(require_user),
) -> Booking:
    """Book a test drive for a specific car. Requires a valid JWT."""
    car = next((c for c in CARS if c.id == car_id), None)
    if car is None:
        raise HTTPException(status_code=404, detail=f"Car with id '{car_id}' not found")

    if find_conflict(car_id, body.date, body.time_slot):
        raise HTTPException(status_code=409, detail="This time slot is already booked")

    return create_booking(
        car_id=car_id,
        user_id=user.id,
        user_email=user.email,
        data=body,
    )


@app.get("/cars/{car_id}/bookings", response_model=list[Booking])
def get_car_bookings(
    car_id: str,
    user: AuthUser = Depends(require_user),
) -> list[Booking]:
    """Return all confirmed bookings for a car. Auth required (internal/admin use)."""
    return bookings_for_car(car_id)


@app.get("/bookings/me", response_model=list[Booking])
def my_bookings(user: AuthUser = Depends(require_user)) -> list[Booking]:
    """Return the current authenticated user's bookings, newest first."""
    mine = bookings_for_user(user.id)
    return sorted(mine, key=lambda b: b.created_at, reverse=True)
