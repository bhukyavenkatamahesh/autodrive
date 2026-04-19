# models.py — defines the shape of our data
#
# Pydantic is a Python library for data validation.
# When the frontend sends data to us, or when we send data back,
# Pydantic makes sure it has the right shape and types.
#
# Think of it like a contract: "a Car MUST have these fields with these types"

from typing import Literal, Optional
from pydantic import BaseModel


# This is our Car model — it mirrors the TypeScript interface in frontend/lib/types.ts
# Literal["Petrol", "Diesel", ...] means the field can ONLY be one of those values
class Car(BaseModel):
    id: str
    make: str
    model: str
    year: int
    price: int                          # price in rupees
    ml_price: Optional[int] = None      # AI-predicted price (optional)
    mileage: int                        # km driven
    fuel_type: Literal["Petrol", "Diesel", "Electric", "Hybrid"]
    transmission: Literal["Manual", "Automatic"]
    location: str
    image: str                          # primary image URL
    images: list[str] = []             # additional image URLs
    color: str
    description: str
    owners: int                         # number of previous owners
    rating: Optional[float] = None
    reviews: Optional[int] = None
    features: list[str] = []
    engine_cc: Optional[int] = None
    seating: Optional[int] = None
    body_type: Optional[str] = None


class CarCreate(BaseModel):
    make: str
    model: str
    year: int
    price: int
    ml_price: Optional[int] = None
    mileage: int
    fuel_type: Literal["Petrol", "Diesel", "Electric", "Hybrid"]
    transmission: Literal["Manual", "Automatic"]
    location: str
    image: str
    images: list[str] = []
    color: str
    description: str
    owners: int
    rating: Optional[float] = None
    reviews: Optional[int] = None
    features: list[str] = []
    engine_cc: Optional[int] = None
    seating: Optional[int] = None
    body_type: Optional[str] = None


class CarUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    price: Optional[int] = None
    ml_price: Optional[int] = None
    mileage: Optional[int] = None
    fuel_type: Optional[Literal["Petrol", "Diesel", "Electric", "Hybrid"]] = None
    transmission: Optional[Literal["Manual", "Automatic"]] = None
    location: Optional[str] = None
    image: Optional[str] = None
    images: Optional[list[str]] = None
    color: Optional[str] = None
    description: Optional[str] = None
    owners: Optional[int] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    features: Optional[list[str]] = None
    engine_cc: Optional[int] = None
    seating: Optional[int] = None
    body_type: Optional[str] = None


# This model is used when someone wants to filter/search cars.
# Optional means the field can be omitted — if omitted, don't filter by it.
class CarFilters(BaseModel):
    make: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    location: Optional[str] = None
    search: Optional[str] = None        # free text search across make/model/year


class CarsListResponse(BaseModel):
    cars: list[Car]
    total: int
    page: int
    pages: int


class BookingCreate(BaseModel):
    date: str
    time_slot: str
    name: str
    phone: str


class Booking(BaseModel):
    id: str
    car_id: str
    user_id: str
    date: str
    time_slot: str
    name: str
    phone: str
    status: str
    created_at: str
