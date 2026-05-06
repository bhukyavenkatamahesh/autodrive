import json
import os
import time
from contextlib import contextmanager
from typing import Optional

import psycopg
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .auth import AuthUser, require_user
from .bookings import (
    Booking,
    BookingRequest,
    bookings_for_car,
    bookings_for_user,
    create_booking,
    find_conflict,
)
from .data import BRANDS, CARS, LOCATIONS
from .models import Car, CarCreate, CarUpdate, CarsListResponse

app = FastAPI(
    title="AutoDrive Cars Service",
    description="Cars listings, admin CRUD, and test-drive bookings.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)

DATABASE_URL = os.getenv(
    "CARS_DATABASE_URL",
    os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/autodrive"),
)


@contextmanager
def get_conn():
    conn = psycopg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()


def _jsonb(data: dict) -> dict:
    """Serialize list/dict fields to JSON strings for psycopg3 JSONB columns."""
    out = dict(data)
    for key in ("images", "features"):
        if key in out and isinstance(out[key], (list, dict)):
            out[key] = json.dumps(out[key])
    return out


def _require_admin(x_user_role: Optional[str]) -> None:
    if x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")


def _row_to_car(row: dict) -> Car:
    return Car(
        id=str(row["id"]),
        make=row["make"],
        model=row["model"],
        year=row["year"],
        price=row["price"],
        ml_price=row["ml_price"],
        mileage=row["mileage"],
        fuel_type=row["fuel_type"],
        transmission=row["transmission"],
        location=row["location"],
        image=row["image"],
        images=row["images"] or [],
        color=row["color"],
        description=row["description"],
        owners=row["owners"],
        rating=row["rating"],
        reviews=row["reviews"],
        features=row["features"] or [],
        engine_cc=row["engine_cc"],
        seating=row["seating"],
        body_type=row.get("body_type"),
    )


def _ensure_schema_and_seed() -> None:
    attempts = 0
    while True:
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        CREATE TABLE IF NOT EXISTS cars (
                          id TEXT PRIMARY KEY,
                          make TEXT NOT NULL,
                          model TEXT NOT NULL,
                          year INT NOT NULL,
                          price INT NOT NULL,
                          ml_price INT,
                          mileage INT NOT NULL,
                          fuel_type TEXT NOT NULL,
                          transmission TEXT NOT NULL,
                          location TEXT NOT NULL,
                          image TEXT NOT NULL,
                          images JSONB NOT NULL DEFAULT '[]'::jsonb,
                          color TEXT NOT NULL,
                          description TEXT NOT NULL,
                          owners INT NOT NULL,
                          rating FLOAT,
                          reviews INT,
                          features JSONB NOT NULL DEFAULT '[]'::jsonb,
                          engine_cc INT,
                          seating INT,
                          body_type TEXT
                        )
                        """
                    )
                    cur.execute(
                        "ALTER TABLE cars ADD COLUMN IF NOT EXISTS body_type TEXT"
                    )
                    cur.execute(
                        "UPDATE cars SET body_type = 'SUV' WHERE id::text IN ('2','3','5','6','7','8') AND body_type IS NULL"
                    )
                    cur.execute(
                        "UPDATE cars SET body_type = 'Sedan' WHERE id::text IN ('4','10','12') AND body_type IS NULL"
                    )
                    cur.execute(
                        "UPDATE cars SET body_type = 'Hatchback' WHERE id::text IN ('1','9','11') AND body_type IS NULL"
                    )
                    for car in CARS:
                        cur.execute(
                            """
                            INSERT INTO cars (
                              id, make, model, year, price, ml_price, mileage, fuel_type,
                              transmission, location, image, images, color, description,
                              owners, rating, reviews, features, engine_cc, seating, body_type
                            ) VALUES (
                              %(id)s, %(make)s, %(model)s, %(year)s, %(price)s, %(ml_price)s, %(mileage)s, %(fuel_type)s,
                              %(transmission)s, %(location)s, %(image)s, %(images)s, %(color)s, %(description)s,
                              %(owners)s, %(rating)s, %(reviews)s, %(features)s, %(engine_cc)s, %(seating)s, %(body_type)s
                            )
                            ON CONFLICT (id) DO NOTHING
                            """,
                            _jsonb(car.model_dump()),
                        )
                conn.commit()
            return
        except psycopg.OperationalError:
            attempts += 1
            if attempts >= 20:
                raise
            time.sleep(1.5)


@app.on_event("startup")
def on_startup() -> None:
    _ensure_schema_and_seed()


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"service": "cars", "status": "ok"}


@app.get("/cars", response_model=CarsListResponse)
def list_cars(
    make: Optional[str] = Query(default=None),
    min_price: Optional[int] = Query(default=None),
    max_price: Optional[int] = Query(default=None),
    fuel_type: Optional[str] = Query(default=None),
    transmission: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    body_type: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    sort: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: Optional[int] = Query(default=None, ge=1, le=100),
) -> CarsListResponse:
    where_clauses: list[str] = []
    where_params: dict = {}
    if make and make.lower() != "all":
        where_clauses.append("LOWER(make) = LOWER(%(make)s)")
        where_params["make"] = make
    if min_price is not None:
        where_clauses.append("price >= %(min_price)s")
        where_params["min_price"] = min_price
    if max_price is not None:
        where_clauses.append("price <= %(max_price)s")
        where_params["max_price"] = max_price
    if fuel_type and fuel_type.lower() != "all":
        where_clauses.append("LOWER(fuel_type) = LOWER(%(fuel_type)s)")
        where_params["fuel_type"] = fuel_type
    if transmission and transmission.lower() != "all":
        where_clauses.append("LOWER(transmission) = LOWER(%(transmission)s)")
        where_params["transmission"] = transmission
    if location and location.lower() not in ("all", "all cities"):
        where_clauses.append("LOWER(location) = LOWER(%(location)s)")
        where_params["location"] = location
    if body_type and body_type.lower() != "all":
        where_clauses.append("LOWER(body_type) = LOWER(%(body_type)s)")
        where_params["body_type"] = body_type
    if search:
        where_clauses.append("LOWER(make || ' ' || model || ' ' || year::text) LIKE LOWER(%(search)s)")
        where_params["search"] = f"%{search}%"

    order_sql = "ORDER BY id"
    if sort == "price_asc":
        order_sql = "ORDER BY price ASC"
    elif sort == "price_desc":
        order_sql = "ORDER BY price DESC"
    elif sort == "year_desc":
        order_sql = "ORDER BY year DESC"
    elif sort == "year_asc":
        order_sql = "ORDER BY year ASC"
    elif sort == "mileage_asc":
        order_sql = "ORDER BY mileage ASC"

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

    with get_conn() as conn:
        with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute(f"SELECT COUNT(*)::bigint AS c FROM cars {where_sql}", where_params)
            total = int(cur.fetchone()["c"])

            list_params = dict(where_params)
            list_sql = f"SELECT * FROM cars {where_sql} {order_sql}"
            effective_page = 1
            list_pages = 1

            if limit is not None:
                offset = (page - 1) * limit
                list_params["limit"] = limit
                list_params["offset"] = offset
                list_sql += " LIMIT %(limit)s OFFSET %(offset)s"
                effective_page = page
                list_pages = max(1, (total + limit - 1) // limit) if total else 1

            cur.execute(list_sql, list_params)
            cars = [_row_to_car(row) for row in cur.fetchall()]

    return CarsListResponse(
        cars=cars,
        total=total,
        page=effective_page,
        pages=list_pages,
    )


@app.get("/cars/{car_id}", response_model=Car)
def get_car(car_id: str) -> Car:
    with get_conn() as conn:
        with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute("SELECT * FROM cars WHERE id = %s", (car_id,))
            row = cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail=f"Car with id '{car_id}' not found")
            return _row_to_car(row)


@app.get("/brands")
def list_brands() -> list[dict]:
    return BRANDS


@app.get("/locations")
def list_locations() -> list[str]:
    return LOCATIONS


@app.post("/cars", response_model=Car, status_code=201)
def create_car(payload: CarCreate, x_user_role: Optional[str] = Header(default=None)) -> Car:
    _require_admin(x_user_role)
    row_data = _jsonb({"id": str(int(time.time() * 1000)), **payload.model_dump()})
    with get_conn() as conn:
        with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute(
                """
                INSERT INTO cars (
                  id, make, model, year, price, ml_price, mileage, fuel_type, transmission, location,
                  image, images, color, description, owners, rating, reviews, features, engine_cc, seating, body_type
                ) VALUES (
                  %(id)s, %(make)s, %(model)s, %(year)s, %(price)s, %(ml_price)s, %(mileage)s, %(fuel_type)s, %(transmission)s, %(location)s,
                  %(image)s, %(images)s, %(color)s, %(description)s, %(owners)s, %(rating)s, %(reviews)s, %(features)s, %(engine_cc)s, %(seating)s, %(body_type)s
                )
                RETURNING *
                """,
                row_data,
            )
            row = cur.fetchone()
        conn.commit()
    return _row_to_car(row)


@app.put("/cars/{car_id}", response_model=Car)
def update_car(car_id: str, payload: CarUpdate, x_user_role: Optional[str] = Header(default=None)) -> Car:
    _require_admin(x_user_role)
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided for update")
    set_clauses = ", ".join([f"{k} = %({k})s" for k in updates.keys()])
    updates["id"] = car_id
    with get_conn() as conn:
        with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute(f"UPDATE cars SET {set_clauses} WHERE id = %(id)s RETURNING *", updates)
            row = cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail=f"Car with id '{car_id}' not found")
        conn.commit()
    return _row_to_car(row)


@app.delete("/cars/{car_id}", status_code=204)
def delete_car(car_id: str, x_user_role: Optional[str] = Header(default=None)) -> None:
    _require_admin(x_user_role)
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM cars WHERE id = %s", (car_id,))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"Car with id '{car_id}' not found")
        conn.commit()


@app.post("/cars/{car_id}/book", response_model=Booking, status_code=201)
def book_car(car_id: str, body: BookingRequest, user: AuthUser = Depends(require_user)) -> Booking:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM cars WHERE id = %s", (car_id,))
            if cur.fetchone() is None:
                raise HTTPException(status_code=404, detail=f"Car with id '{car_id}' not found")
    if find_conflict(car_id, body.date, body.time_slot):
        raise HTTPException(status_code=409, detail="This time slot is already booked")
    return create_booking(car_id=car_id, user_id=user.id, user_email=user.email, data=body)


@app.get("/cars/{car_id}/bookings", response_model=list[Booking])
def get_car_bookings(car_id: str, user: AuthUser = Depends(require_user)) -> list[Booking]:
    return bookings_for_car(car_id)


@app.get("/bookings/me", response_model=list[Booking])
def my_bookings(user: AuthUser = Depends(require_user)) -> list[Booking]:
    return sorted(bookings_for_user(user.id), key=lambda b: b.created_at, reverse=True)
