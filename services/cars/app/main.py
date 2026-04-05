# main.py — the Cars Service API
#
# HOW FastAPI WORKS:
#   1. You create an `app` object
#   2. You define Python functions
#   3. You attach HTTP methods + URLs to those functions using decorators:
#        @app.get("/cars")   → responds to GET http://localhost:8001/cars
#        @app.get("/cars/{id}") → the {id} part is a "path parameter"
#   4. FastAPI automatically converts Python dicts/objects to JSON responses
#
# WHAT IS REST?
#   REST is a convention for how to design APIs using HTTP:
#     GET    → read data          (safe, no side effects)
#     POST   → create new data    (creates something)
#     PUT    → update data        (replaces something)
#     DELETE → delete data        (removes something)
#   URLs should be nouns (things): /cars, /cars/1, /reviews
#   NOT verbs: /getCars, /deleteReview
#
# QUERY PARAMETERS vs PATH PARAMETERS:
#   Path param:  /cars/1          → specific resource, the ID is IN the URL
#   Query param: /cars?make=Honda → filter/search, comes after the `?`

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .models import Car
from .data import CARS, BRANDS, LOCATIONS

# Create the FastAPI application
# title and description show up at http://localhost:8001/docs (auto-generated docs!)
app = FastAPI(
    title="AutoDrive Cars Service",
    description="API for listing, filtering, and retrieving used car listings.",
    version="1.0.0",
)

# CORS = Cross-Origin Resource Sharing
# WHY: Browsers block frontend code from talking to a different domain/port by default.
# Our frontend runs on port 3000, this API on port 8001 — different ports = different "origin".
# This middleware tells the browser: "it's okay, allow requests from the frontend."
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # only allow our frontend
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@app.get("/health")
def healthcheck() -> dict[str, str]:
    """Simple health check — used by Docker/Kubernetes to know the service is alive."""
    return {"service": "cars", "status": "ok"}


@app.get("/cars", response_model=list[Car])
def list_cars(
    # Query parameters — all optional filters from the frontend
    # Query(...) means "read this from the URL query string"
    # The `?` after the URL starts the query string: /cars?make=Honda&location=Delhi
    make: Optional[str] = Query(default=None),
    min_price: Optional[int] = Query(default=None),
    max_price: Optional[int] = Query(default=None),
    fuel_type: Optional[str] = Query(default=None),
    transmission: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
) -> list[Car]:
    """
    Return all cars, with optional filtering.

    Examples:
      GET /cars                          → all 12 cars
      GET /cars?make=Honda               → only Honda cars
      GET /cars?fuel_type=Electric       → only EVs
      GET /cars?min_price=500000&max_price=1000000  → budget range
      GET /cars?search=swift             → full-text search
    """
    results = CARS  # start with all cars

    # Apply each filter only if it was provided (not None)
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
        results = [
            c for c in results
            # search across make, model, and year combined
            if q in f"{c.make} {c.model} {c.year}".lower()
        ]

    return results


@app.get("/cars/{car_id}", response_model=Car)
def get_car(car_id: str) -> Car:
    """
    Return a single car by its ID.

    Example:
      GET /cars/1   → returns the Maruti Swift
      GET /cars/99  → 404 Not Found
    """
    # next() finds the first matching item, or returns None if not found
    car = next((c for c in CARS if c.id == car_id), None)

    if car is None:
        # HTTPException sends a proper HTTP error response with a status code
        # 404 = "Not Found" — a standard HTTP status code
        raise HTTPException(status_code=404, detail=f"Car with id '{car_id}' not found")

    return car


@app.get("/brands")
def list_brands() -> list[dict]:
    """Return all car brands with logo and listing count."""
    return BRANDS


@app.get("/locations")
def list_locations() -> list[str]:
    """Return all available cities."""
    return LOCATIONS
