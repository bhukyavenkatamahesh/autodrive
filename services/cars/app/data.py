# data.py — our in-memory "database"
#
# WHY in-memory first?
# In a real app you'd use a database (PostgreSQL, MongoDB, etc.).
# But starting with a Python list lets us learn the API layer first.
# The list lives in RAM — it resets every time the server restarts.
# Later we'll replace this list with real database calls.
#
# This data comes from frontend/lib/mockData.ts — same cars, now in Python.

from .models import Car

CARS: list[Car] = [
    Car(
        id="1", make="Maruti Suzuki", model="Swift", year=2022, price=750000,
        ml_price=720000, mileage=22000, fuel_type="Petrol", transmission="Manual",
        location="Delhi",
        image="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80",
        images=[
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80",
        ],
        color="White", owners=1, rating=4.5, reviews=24, engine_cc=1197, seating=5,
        description="Well-maintained Swift with full service history. Single owner, accident-free.",
        features=["ABS", "Airbags", "Reverse Camera", "Bluetooth", "Keyless Entry"],
    ),
    Car(
        id="2", make="Hyundai", model="Creta", year=2023, price=1450000,
        ml_price=1480000, mileage=8000, fuel_type="Diesel", transmission="Automatic",
        location="Mumbai",
        image="https://images.unsplash.com/photo-1583267746897-2cf415887172?w=600&q=80",
        color="Silver", owners=1, rating=4.8, reviews=12, engine_cc=1493, seating=5,
        description="Nearly new Creta SX(O) with panoramic sunroof, ventilated seats.",
        features=["Sunroof", "Ventilated Seats", "ADAS", "Wireless Charging", "Connected Car"],
    ),
    Car(
        id="3", make="Tata", model="Nexon EV", year=2023, price=1680000,
        ml_price=1620000, mileage=12000, fuel_type="Electric", transmission="Automatic",
        location="Bangalore",
        image="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80",
        color="Blue", owners=1, rating=4.7, reviews=31, seating=5,
        description="Tata Nexon EV Max with 437km range. Home charger included.",
        features=["437km Range", "Home Charger", "Connected Car", "Sunroof", "ADAS"],
    ),
    Car(
        id="4", make="Honda", model="City", year=2021, price=980000,
        ml_price=950000, mileage=35000, fuel_type="Petrol", transmission="Manual",
        location="Pune",
        image="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80",
        color="Red", owners=1, rating=4.3, reviews=18, engine_cc=1498, seating=5,
        description="Honda City VX with leather seats and sunroof. Regular service done at Honda ASS.",
        features=["Sunroof", "Leather Seats", "Lane Watch", "Rear AC Vents", "Cruise Control"],
    ),
    Car(
        id="5", make="Toyota", model="Fortuner", year=2021, price=3200000,
        ml_price=3150000, mileage=42000, fuel_type="Diesel", transmission="Automatic",
        location="Delhi",
        image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
        color="Black", owners=1, rating=4.9, reviews=9, engine_cc=2755, seating=7,
        description="Toyota Fortuner Legender 4x2. Single owner corporate car. Pristine condition.",
        features=["4x2", "Leather Seats", "JBL Audio", "Wireless Charging", "ADAS"],
    ),
    Car(
        id="6", make="Kia", model="Seltos", year=2022, price=1350000,
        ml_price=1380000, mileage=18000, fuel_type="Petrol", transmission="Automatic",
        location="Chennai",
        image="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80",
        color="Grey", owners=1, rating=4.6, reviews=22, engine_cc=1395, seating=5,
        description="Kia Seltos GTX+ with Bose audio, HUD, and ventilated seats.",
        features=["Bose Audio", "HUD", "Ventilated Seats", "Wireless Charging", "Sunroof"],
    ),
    Car(
        id="7", make="MG", model="Hector", year=2020, price=1150000,
        ml_price=1100000, mileage=55000, fuel_type="Petrol", transmission="Manual",
        location="Hyderabad",
        image="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&q=80",
        color="White", owners=1, rating=4.2, reviews=16, engine_cc=1451, seating=5,
        description="MG Hector Sharp with 10.4\" touchscreen and connected car tech.",
        features=["10.4\" Touchscreen", "Connected Car", "Sunroof", "TPMS", "Wireless Android Auto"],
    ),
    Car(
        id="8", make="Mahindra", model="XUV700", year=2022, price=2200000,
        ml_price=2250000, mileage=25000, fuel_type="Diesel", transmission="Automatic",
        location="Kolkata",
        image="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80",
        color="Red", owners=1, rating=4.7, reviews=28, engine_cc=2184, seating=7,
        description="Mahindra XUV700 AX7L with ADAS, dual 10.25\" screens, Sony audio.",
        features=["ADAS", "Dual Screens", "Sony Audio", "Panoramic Sunroof", "AWD"],
    ),
    Car(
        id="9", make="Volkswagen", model="Polo", year=2019, price=620000,
        ml_price=600000, mileage=48000, fuel_type="Petrol", transmission="Manual",
        location="Mumbai",
        image="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
        color="Blue", owners=2, rating=4.1, reviews=11, engine_cc=999, seating=5,
        description="Volkswagen Polo Highline. German build quality, solid performer.",
        features=["ABS", "Airbags", "Climatronic AC", "Alloy Wheels", "Rear Camera"],
    ),
    Car(
        id="10", make="BMW", model="3 Series", year=2021, price=4500000,
        ml_price=4350000, mileage=28000, fuel_type="Petrol", transmission="Automatic",
        location="Delhi",
        image="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
        color="Black", owners=1, rating=4.9, reviews=7, engine_cc=1998, seating=5,
        description="BMW 330i M Sport. Corporate owned, immaculate condition.",
        features=["M Sport Body Kit", "Harman Kardon", "Head-Up Display", "Parking Assistant", "Driving Modes"],
    ),
    Car(
        id="11", make="Renault", model="Kwid", year=2020, price=380000,
        ml_price=370000, mileage=32000, fuel_type="Petrol", transmission="Manual",
        location="Jaipur",
        image="https://images.unsplash.com/photo-1607664887510-2d5f53de8d79?w=600&q=80",
        color="Orange", owners=1, rating=4.0, reviews=20, engine_cc=999, seating=5,
        description="Renault Kwid RXT with 8\" MediaNAV. Great entry-level car.",
        features=["8\" Touchscreen", "MediaNAV", "Rear Camera", "Airbags", "ABS"],
    ),
    Car(
        id="12", make="Skoda", model="Slavia", year=2023, price=1680000,
        ml_price=1650000, mileage=5000, fuel_type="Petrol", transmission="Automatic",
        location="Ahmedabad",
        image="https://images.unsplash.com/photo-1617469767824-5cbcf2cfd4f7?w=600&q=80",
        color="Silver", owners=1, rating=4.8, reviews=6, engine_cc=1498, seating=5,
        description="Skoda Slavia Style 1.5 TSI DSG. Nearly new with Czech engineering.",
        features=["1.5 TSI DSG", "Ventilated Seats", "Sunroof", "Connected Car", "Matrix LED"],
    ),
]

# All unique car brands with logo emoji and listing count
BRANDS = [
    {"name": "Maruti Suzuki", "logo": "🚗", "count": 4523},
    {"name": "Hyundai",       "logo": "🚙", "count": 3210},
    {"name": "Tata",          "logo": "🚘", "count": 2876},
    {"name": "Honda",         "logo": "🏎",  "count": 2341},
    {"name": "Toyota",        "logo": "🚐", "count": 1987},
    {"name": "Kia",           "logo": "🚗", "count": 1654},
    {"name": "Mahindra",      "logo": "🚙", "count": 1432},
    {"name": "BMW",           "logo": "🏎",  "count": 876},
]

LOCATIONS = [
    "All Cities", "Delhi", "Mumbai", "Bangalore", "Chennai",
    "Pune", "Hyderabad", "Kolkata", "Ahmedabad", "Jaipur",
]
