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
