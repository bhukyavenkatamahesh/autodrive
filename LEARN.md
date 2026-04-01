# AutoDrive — Beginner's Guide to Every File

> This file explains everything in the project in plain, simple English.
> No prior coding knowledge assumed. Read top to bottom, or jump to any section.

---

## Table of Contents

1. [What Is AutoDrive?](#1-what-is-autodrive)
2. [The Big Picture — How It's Structured](#2-the-big-picture)
3. [Technologies Explained Simply](#3-technologies-explained-simply)
4. [Root Files (Project Foundation)](#4-root-files)
5. [Frontend Files (What Users See)](#5-frontend-files)
   - [Config Files](#51-config-files)
   - [Pages (Routes)](#52-pages-routes)
   - [Data Files](#53-data-files)
   - [Components (UI Pieces)](#54-components-ui-pieces)
6. [Backend Services (APIs)](#6-backend-services)
7. [Infrastructure Files (Deployment)](#7-infrastructure-files)
8. [How Everything Connects](#8-how-everything-connects)
9. [How to Run the App](#9-how-to-run-the-app)

---

## 1. What Is AutoDrive?

AutoDrive is a **used car marketplace website** — like CarDekho or OLX Cars — but built with modern AI features:

- You can **search and filter** thousands of cars
- An **AI assistant (powered by GPT-4o)** helps you find the right car
- An **ML model (XGBoost)** predicts a fair market price for each car
- You can **book a test drive** directly from the website

Think of it like Amazon for used cars, but with a smart AI helper built in.

---

## 2. The Big Picture

The project is split into **3 layers**:

```
┌─────────────────────────────────────────────┐
│  LAYER 1 — FRONTEND (What users see)        │
│  Next.js website running on port 3000        │
│  Files: frontend/                           │
└─────────────────────────────────────────────┘
                     ↕ talks to
┌─────────────────────────────────────────────┐
│  LAYER 2 — BACKEND (The engines)            │
│  6 separate mini-servers (microservices)     │
│  Files: services/                           │
└─────────────────────────────────────────────┘
                     ↕ deployed on
┌─────────────────────────────────────────────┐
│  LAYER 3 — INFRASTRUCTURE (The cloud)       │
│  Azure servers managed by code              │
│  Files: infra/                              │
└─────────────────────────────────────────────┘
```

**Right now**, Layer 1 (the frontend) is fully built. Layers 2 and 3 are scaffolded (skeleton structure exists but not fully implemented yet). The frontend uses **fake/mock data** to work while the backend isn't ready.

---

## 3. Technologies Explained Simply

Think of building a house — you need different tools for different jobs. Same here:

| Technology | What It Is | Simple Analogy |
|-----------|-----------|----------------|
| **Next.js** | The main web framework | The house blueprint + construction crew |
| **React** | Builds UI from small pieces | LEGO bricks — snap components together |
| **TypeScript** | JavaScript with type checking | Spellcheck for your code — catches mistakes early |
| **Tailwind CSS** | Pre-built styling classes | Ready-made paint colors — use `text-blue-600` instead of writing CSS from scratch |
| **Lucide React** | Icon library | A box of 1,000 ready-made icons (arrows, stars, cars, etc.) |
| **Framer Motion** | Animation library | Makes elements slide, bounce, fade smoothly |
| **Node.js** | Runs JavaScript outside the browser | The engine that powers backend JS code |
| **Fastify** | Fast Node.js web server | A restaurant — receives requests, returns responses |
| **Python** | Programming language | Used for AI/ML services (data scientists love it) |
| **FastAPI** | Fast Python web server | Same as Fastify but for Python code |
| **Docker** | Packages your app in a container | A shipping container — app runs the same everywhere |
| **Docker Compose** | Runs multiple containers together | An orchestra conductor for all your containers |
| **Terraform** | Creates cloud resources with code | Code that "clicks buttons" on Azure to create servers |
| **Kubernetes (Helm)** | Manages containers at scale | An airport control tower for containers |
| **LangChain** | Connects AI models to your app | A translator between your code and GPT-4o |
| **MLflow** | Manages ML models | A warehouse for storing trained AI models |
| **GitHub Actions** | Auto-runs tasks on code push | A robot that runs tests whenever you save code |
| **Git** | Version control | A time machine for your code — go back to any point |

---

## 4. Root Files

These files live at the very top of `autodrive/`. They control the whole project.

---

### `README.md`
**What it is:** The welcome note for the project.

When someone visits the GitHub page, this is the first thing they read. It describes what the project is and how the folder structure is organized. It's just text — it doesn't affect how the app runs.

---

### `docker-compose.yml`
**What it is:** The master switch that starts ALL services at once.

```
Think of it like a power strip with 7 switches:
- Switch 1: Start the website (port 3000)
- Switch 2: Start the auth server (port 4001)
- Switch 3: Start the cars server (port 8001)
... and so on
```

Without this file, you'd have to manually start each of the 7 services in separate terminal windows. With this file, one command (`docker compose up`) starts everything.

**Key contents:**
- Lists all 7 services (frontend, auth, cars, reviews, chatbot, ml-price, sentiment)
- Tells each service which port to run on
- Tells Docker how to build each service using its Dockerfile

---

### `Makefile`
**What it is:** A shortcuts file — like keyboard shortcuts but for terminal commands.

Instead of typing long commands, you type short ones:

```bash
make dev      # instead of: docker compose up --build
make install  # instead of: npm install && pip install ...
make test     # runs all tests
```

Think of it like having a remote control — each button triggers a longer action behind the scenes.

---

### `.gitignore`
**What it is:** A list of files Git should NEVER save or track.

Some files should not go to GitHub:
- `node_modules/` — thousands of library files (too big, others can regenerate them)
- `.env` files — contain passwords and secret keys
- `.next/` — the build output (auto-generated, no need to save)
- `__pycache__/` — Python's compiled cache files

This file tells Git: "Skip these, never commit them."

---

### `.github/workflows/ci.yml`
**What it is:** Automated testing robot on GitHub.

Every time you push code to GitHub, this file triggers a robot that:
1. Sets up Node.js 20 and Python 3.11
2. Checks that key files exist (package.json, requirements.txt, etc.)
3. Reports if anything is broken

CI stands for **Continuous Integration** — it continuously checks your code is healthy.
It's like having an automatic safety inspector every time you change something.

---

## 5. Frontend Files

Everything inside `frontend/` is the website — what users actually see and interact with.

---

### 5.1 Config Files

These files don't show anything to the user — they configure how the app is built and run.

---

#### `frontend/package.json`
**What it is:** The shopping list of JavaScript libraries the frontend needs.

```json
"dependencies": {
  "next": "14.2.15",      ← the main framework
  "react": "18.3.1",      ← the UI library
  "tailwindcss": "...",   ← the styling system
  "framer-motion": "...", ← animations
  "lucide-react": "..."   ← icons
}
```

When you run `npm install`, npm reads this file and downloads everything in the list. Without this file, the project can't run.

The `scripts` section defines shortcuts:
- `npm run dev` → start development server
- `npm run build` → create the production-ready version
- `npm run start` → serve the production build

---

#### `frontend/tsconfig.json`
**What it is:** TypeScript's rulebook.

TypeScript is JavaScript with type checking. This file tells TypeScript HOW to check the code:
- `"strict": true` → be very strict about type errors
- `"paths": {"@/*": ["./*"]}` → lets you write `@/components/Navbar` instead of `../../components/Navbar`
- `"jsx": "preserve"` → tells TypeScript this code uses React's JSX syntax (the HTML-in-JavaScript style)

You rarely need to edit this — it's set up once and mostly stays the same.

---

#### `frontend/next.config.js`
**What it is:** Settings file for the Next.js framework.

```javascript
const nextConfig = {
  reactStrictMode: true,          // Extra warnings during development
  images: { remotePatterns: [...] } // Allow images from Unsplash, Wikimedia
  webpack(config) {               // "@" shortcut in imports
    config.resolve.alias['@'] = ...
  }
}
```

The most important part here is the `images` setting — Next.js blocks external images by default for security. We had to explicitly whitelist Unsplash and Wikimedia so car photos load.

---

#### `frontend/postcss.config.js`
**What it is:** Makes Tailwind CSS work inside Next.js.

Tailwind CSS needs to be "processed" (converted from utility classes to real CSS) before the browser can understand it. PostCSS is the tool that does that processing. This file just tells PostCSS to use the Tailwind plugin.

You should never need to edit this file.

---

#### `frontend/global.d.ts`
**What it is:** Tells TypeScript that CSS files exist.

By default, TypeScript doesn't know what a `.css` file is and throws an error when you try to import one. This one-line file says: "CSS files are valid to import, stop complaining."

```typescript
declare module '*.css' {}
```

One line. One job. Very important for the build to work.

---

#### `frontend/next-env.d.ts`
**What it is:** Auto-generated by Next.js — don't touch it.

Next.js creates this file automatically to give TypeScript the type definitions it needs for Next.js features. The comment at the top says "NOTE: This file should not be edited." It regenerates itself.

---

#### `frontend/app/globals.css`
**What it is:** Global styles that apply to the ENTIRE website.

This file is the first CSS loaded. It sets up:
- `@import "tailwindcss"` → activates all Tailwind CSS utilities
- Custom scrollbar styling (thin, grey scrollbar)
- Basic reset (`box-sizing: border-box`)
- `scroll-behavior: smooth` for smooth page scrolling
- `.line-clamp-2` utility for truncating text

Think of it as the "base coat of paint" before you paint individual rooms.

---

### 5.2 Pages (Routes)

In Next.js, every file inside `app/` that is named `page.tsx` becomes a URL. This is called **file-based routing** — the folder structure IS the URL structure.

```
app/page.tsx              → website.com/
app/cars/page.tsx         → website.com/cars
app/cars/[id]/page.tsx    → website.com/cars/1, /cars/2, /cars/3...
app/chat/page.tsx         → website.com/chat
```

---

#### `frontend/app/layout.tsx`
**What it is:** The outer wrapper — the shell around EVERY page.

Think of it like a picture frame — every page is the picture, and this file is the frame around it.

```
Every page on the website has:
┌─────────────────────────────┐
│  NAVBAR (from layout.tsx)   │
├─────────────────────────────┤
│  PAGE CONTENT               │ ← this changes per page
│  (homepage, cars, chat...)  │
├─────────────────────────────┤
│  FOOTER (from layout.tsx)   │
└─────────────────────────────┘
│  CHAT WIDGET (floating)     │
```

This file also:
- Imports `globals.css` (so styles work everywhere)
- Sets the browser tab title to "AutoDrive — AI-Powered Car Marketplace"
- Sets the meta description (shown in Google search results)

---

#### `frontend/app/page.tsx` — The Homepage
**Route:** `/`
**What it is:** The first page users see when they visit AutoDrive.

This file is very simple — it just arranges 5 components in order:

```tsx
export default function HomePage() {
  return (
    <main>
      <Hero />          // Big search banner at top
      <BrandBar />      // Row of car brand logos
      <FeaturedCars />  // Grid of 6 cars
      <WhyUs />         // 4 feature cards
      <AICTABanner />   // "Chat with AI" blue banner
    </main>
  );
}
```

The page itself has almost no code — it just imports and arranges components. The actual content and logic lives inside each component file.

---

#### `frontend/app/cars/page.tsx` — Cars Listing Page
**Route:** `/cars`
**What it is:** The page that shows all cars with search and filters.

This is one of the more complex pages. It:

1. **Reads URL parameters** — if you come from a brand logo click, the URL might be `/cars?make=Hyundai`, and this page reads that and pre-sets the filter
2. **Manages filter state** — tracks what the user has selected (budget, fuel type, brand, city)
3. **Filters the car data** — calls `filterCars()` from mockData with the current filters
4. **Sorts results** — by price, year, or mileage based on the dropdown
5. **Shows results** — renders a grid of `CarCard` components

It also handles:
- A search input (filter by text)
- A mobile filter drawer (sidebar becomes a popup on small screens)
- "No results" state with a "Clear Filters" button

The `'use client'` at the top means this component runs in the browser (not on the server), because it needs to react to user clicks.

`Suspense` is used to handle the loading state while URL params are being read.

---

#### `frontend/app/cars/[id]/page.tsx` — Car Detail Page
**Route:** `/cars/1`, `/cars/2`, etc.
**What it is:** The individual car page — everything about one specific car.

The `[id]` in the folder name is a **dynamic segment** — it matches any car ID. When you visit `/cars/3`, Next.js passes `{ id: "3" }` to this page, and the page calls `getCarById("3")` to load that car's data.

This page shows:
- **Image carousel** — click left/right arrows to see different photos
- **Specs grid** — year, mileage, fuel type, transmission, owners, location, engine, seats
- **Description** — the seller's description
- **Features list** — ABS, airbags, sunroof, etc.
- **AI Price Analysis** — compares listed price to ML-predicted fair value
- **Test Drive Booking** — a form that collects name, phone, preferred time
- **Similar Cars** — other cars of the same brand

The booking form shows a confirmation message when submitted (it doesn't actually call an API yet — it just changes the UI state).

---

#### `frontend/app/chat/page.tsx` — Full AI Chat Page
**Route:** `/chat`
**What it is:** A full-screen conversation interface with the AutoDrive AI.

This page looks like WhatsApp or iMessage — messages appear in bubbles on left (AI) and right (you). It includes:

- **Suggestion pills** at the start — click a suggestion to send it instantly
- **Message history** — scrollable list of all messages
- **Typing indicator** — three bouncing dots while AI is "thinking"
- **Input bar** — type and press Enter or click Send
- **Auto-scroll** — always scrolls to the latest message

The AI responses are currently **hardcoded mock responses** — when you ask about "SUVs under 15L", it returns a pre-written answer. In the real version, this would call the chatbot backend service, which would call GPT-4o.

---

### 5.3 Data Files

These files live in `frontend/lib/` — they hold data and helper functions.

---

#### `frontend/lib/types.ts`
**What it is:** Blueprints/shapes for data — tells TypeScript what a "Car" looks like.

In TypeScript, an **interface** is like a form template. It says: "A Car MUST have these fields, and they MUST be these types."

```typescript
interface Car {
  id: string;           // "1", "2", "3"...
  make: string;         // "Hyundai", "Tata"...
  model: string;        // "Creta", "Nexon"...
  year: number;         // 2021, 2022, 2023
  price: number;        // 750000 (in rupees)
  mlPrice?: number;     // ? means optional
  mileage: number;      // kilometers driven
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'; // only these 4 values
  // ... more fields
}
```

The benefit: if you accidentally write `car.pricee` (typo), TypeScript immediately shows a red error. This prevents bugs.

Other interfaces defined here:
- `Message` — a chat message (role: 'user' or 'assistant', content: text)
- `Brand` — a car brand (name, logo, count)
- `FilterState` — the current filter selections

---

#### `frontend/lib/mockData.ts`
**What it is:** Fake car data used while the real backend isn't ready.

This file has:

**`cars` array** — 12 complete car objects:
- Maruti Swift, Hyundai Creta, Tata Nexon EV, Honda City, Toyota Fortuner...
- Each car has all the fields defined in `types.ts`
- Photos come from Unsplash (free photo service)
- Prices, mileage, features are realistic Indian market values

**`brands` array** — 8 car brands with their India inventory counts

**`locations` array** — 10 Indian cities

**Helper functions:**
- `formatPrice(750000)` → returns `"₹7.50 L"` (converts raw numbers to readable Indian format)
- `getCarById("3")` → finds and returns the car with that ID
- `filterCars({make: "Hyundai", fuelType: "Diesel"})` → returns matching cars

When the real backend (cars service on port 8001) is ready, you'll replace this file's data with real API calls, and the rest of the app won't need to change.

---

### 5.4 Components (UI Pieces)

Components are reusable UI pieces. Think of them like ready-made LEGO bricks — build them once, use them anywhere.

Components live in `frontend/components/`.

---

#### Layout Components

##### `components/layout/Navbar.tsx`
**What it is:** The top navigation bar — visible on EVERY page.

Contains:
- **Blue top banner** — "AI-powered car discovery • 10,000+ verified cars..."
- **Logo** — "AutoDrive" with a car icon
- **City picker** — dropdown to select your city (affects future filtering)
- **Search bar** — type a car name, press Enter to search
- **Nav links** — Used Cars, Electric, AI Chat (hidden on mobile)
- **Auth buttons** — Login, Register
- **Mobile menu** — hamburger icon (☰) on small screens

State it manages:
- `menuOpen` — is the mobile menu open or closed?
- `selectedCity` — which city is selected?
- `cityOpen` — is the city dropdown showing?
- `searchQuery` — what's typed in the search box?

The `sticky top-0 z-50` Tailwind classes make it stay at the top as you scroll.

---

##### `components/layout/Footer.tsx`
**What it is:** The bottom footer — visible on every page.

Contains 4 columns:
1. **Brand** — logo, tagline, social icon buttons
2. **Buy Cars** — links to different car categories
3. **Tools** — links to features (AI Price Predictor, EMI Calculator, etc.)
4. **Company** — About, Careers, Contact, Privacy Policy

Bottom row shows the team names and the tech stack used.

---

#### Car Components

##### `components/cars/CarCard.tsx`
**What it is:** A single car tile in the listings grid.

This is used in 3 places:
1. The home page featured cars section
2. The `/cars` listings page
3. The car detail page's "Similar Cars" section

Each card shows:
- **Car photo** — zooms in slightly on hover
- **Year badge** — top-left corner
- **AI Price badge** — top-right, green if it's a good deal, orange if overpriced
- **Star rating + review count** — bottom-left of image
- **Fuel type badge** — bottom-right, color-coded (orange=Petrol, blue=Diesel, green=Electric)
- **Title** — `2023 Hyundai Creta`
- **Price** — big blue number like `₹14.50 L`
- **Specs row** — mileage, fuel, transmission, city
- **"Good Deal" badge** — if AI price > listed price (meaning you're getting it cheaper than market value)

The entire card is a clickable link to `/cars/[id]`.

---

##### `components/cars/CarFilters.tsx`
**What it is:** The left sidebar filter panel on the `/cars` page.

This component receives:
- `filters` — the current filter values (from parent page's state)
- `onChange` — a function to call when user changes a filter
- `onReset` — a function to call when user clicks "Reset All"

Filter sections:
1. **Budget** — radio buttons for price ranges (Under ₹3L, ₹3L–₹5L, etc.)
2. **Fuel Type** — pill buttons (Petrol, Diesel, Electric, Hybrid)
3. **Transmission** — pill buttons (Manual, Automatic)
4. **Brand** — dropdown select with 13 car makes
5. **City** — dropdown select with 10 cities

"Reset All" button only appears when at least one filter is active.

---

#### Chat Components

##### `components/chat/ChatWidget.tsx`
**What it is:** The floating chat button that appears on every page (bottom-right corner).

Two states:
1. **Closed** — shows a blue/purple bot icon button with a green "online" dot
2. **Open** — shows a 360×540px chat panel

The panel can also be **minimized** (only the header bar shows) by clicking the minimize button.

Includes:
- Gradient header with "AutoDrive AI" and "GPT-4o • Always online"
- Message bubbles (blue for user, grey for AI)
- Typing indicator (3 bouncing dots)
- Quick suggestion pills (shown only for the first message)
- Text input + send button

The responses are simple keyword-matching mock replies — when the real chatbot service is connected, this will make API calls instead.

---

#### Home Page Components

##### `components/home/Hero.tsx`
**What it is:** The big "hero" section at the top of the homepage.

A "hero section" in web design is the first big visual that grabs attention.

This one has:
- Dark gradient background (navy → blue → navy)
- Two blurry colored orbs in corners (a modern design trend)
- "AI-Powered Car Discovery • GPT-4o" badge
- Giant headline: "Find Your Perfect **Drive**" (Drive in blue gradient)
- Subtext: "Search 10,000+ verified cars..."
- Search box with city picker + text input + Search button
- Budget quick-select pills (Under ₹3L, ₹3L–₹5L, etc.)
- Stats row: "10,000+ Verified Cars", "50+ Cities", "2L+ Happy Buyers", "94% AI Accuracy"

When you click Search, it navigates to `/cars?search=...&location=...`.

---

##### `components/home/BrandBar.tsx`
**What it is:** A grid of 8 car brand logos you can click to browse that brand.

Each brand tile:
- Shows the brand logo (from Wikipedia SVGs)
- Shows the brand name
- Shows how many cars are available
- On hover: turns from grayscale to color
- On click: goes to `/cars?make=Hyundai` (or whichever brand)

If a logo fails to load (network error), the `onError` handler hides the broken image.

---

##### `components/home/FeaturedCars.tsx`
**What it is:** The "Featured Cars" section showing 6 cars on the homepage.

Very simple:
- Takes the first 6 cars from `mockData.ts`
- Renders them in a 3-column grid using `CarCard`
- Has a "View All →" link to `/cars`

---

##### `components/home/WhyUs.tsx`
**What it is:** The "Why AutoDrive?" section with 4 feature highlight cards.

4 cards:
1. **AI-Powered Search** (blue icon) — Chat with GPT-4o
2. **Fair Price Guarantee** (violet icon) — XGBoost ML at 94% accuracy
3. **Verified Cars** (green icon) — 200-point inspection
4. **Instant Test Drive** (orange icon) — We come to your doorstep

Each card has: colored icon background, title, description.
The `colorMap` object maps color names to Tailwind classes.

---

##### `components/home/AICTABanner.tsx`
**What it is:** A full-width call-to-action banner prompting users to try the AI.

CTA = Call To Action.

Blue-to-violet gradient background with:
- Large bot icon
- Headline: "Not sure which car to buy?"
- Body: Explains what the AI can do
- Two buttons: "Chat with AI" (white) and "Browse All Cars" (outline)

---

## 6. Backend Services

The backend is split into **6 separate services** (microservices). Each service does one job and runs independently.

**Why separate services instead of one big app?**
- If one service crashes, others keep running
- You can update/scale each service independently
- Different services can use different programming languages

All services are currently **stubs** — they have the structure and health endpoints, but the actual business logic needs to be implemented.

---

### Auth Service (`services/auth/`)

**Port:** 4001
**Language:** Node.js + Fastify
**Job:** Handle user login, registration, and token verification

**Files:**

| File | Purpose |
|------|---------|
| `package.json` | Lists Fastify as the only dependency |
| `src/index.js` | Creates the server, sets up `/health` endpoint, listens on port 4001 |
| `Dockerfile` | Instructions to package this service into a Docker container |

**`src/index.js` explained:**
```javascript
const app = Fastify({ logger: true });  // Create web server with logging
app.get('/health', ...) // Health check endpoint (used by Kubernetes to verify service is alive)
app.listen({ port: 4001, host: '0.0.0.0' }) // Start listening
```

**What it will do eventually:** When you click "Login" or "Register" on the website, the frontend will call this service's API. The service will check your password, create a JWT token (a secure key), and send it back. The frontend stores that token and sends it with every future request to prove who you are.

---

### Cars Service (`services/cars/`)

**Port:** 8001
**Language:** Python + FastAPI
**Job:** Serve car inventory data from the database

**Files:**

| File | Purpose |
|------|---------|
| `requirements.txt` | Lists FastAPI and Uvicorn (the server runner) as dependencies |
| `app/main.py` | Creates the FastAPI app, sets up `/health` endpoint |
| `Dockerfile` | Instructions to containerize this service |

**`requirements.txt` explained:**
```
fastapi==0.115.0   ← the web framework
uvicorn==0.30.6    ← the server that runs FastAPI (like Node for Python)
```

**`Dockerfile` explained:**
```dockerfile
FROM python:3.11-slim          ← start with a minimal Python image
WORKDIR /app                   ← set working directory
COPY requirements.txt .        ← copy the library list
RUN pip install ...            ← install the libraries
COPY app/ .                    ← copy the actual code
EXPOSE 8001                    ← tell Docker this port is used
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
                               ← start the server
```

**What it will do eventually:** When the frontend needs car data (instead of using mock data), it will call `http://cars-service:8001/cars?make=Hyundai&max_price=1500000`. This service will query the PostgreSQL database and return real car listings.

---

### Reviews Service (`services/reviews/`)

**Port:** 4002
**Language:** Node.js + Fastify
**Job:** Store and serve car reviews written by users

**Files:** Same structure as auth service — `package.json`, `src/index.js`, `Dockerfile`.

**What it will do eventually:** When a user writes a review for a car, the frontend sends it to this service. The service saves it to MongoDB (a database good for text content). When someone views a car, the detail page calls this service to get all reviews for that car.

It will also publish an **event** to Azure Event Hubs (a messaging system) saying "new review submitted". The Sentiment service picks up that event and analyses whether the review is positive or negative.

---

### Chatbot Service (`services/chatbot/`)

**Port:** 8002
**Language:** Python + FastAPI + LangChain
**Job:** Power the AI chat assistant using GPT-4o

**Files:**

| File | Purpose |
|------|---------|
| `requirements.txt` | Lists FastAPI, Uvicorn, AND LangChain 0.3.1 |
| `app/main.py` | Creates the FastAPI app, health endpoint |
| `Dockerfile` | Containerization recipe |

**LangChain** is the key library here. It:
- Connects to Azure OpenAI (GPT-4o)
- Manages conversation history (remembers what was said)
- Does RAG (Retrieval-Augmented Generation) — searches the car database before answering so GPT-4o has real data about your inventory

**What it will do eventually:**
1. User sends "Show me electric cars under ₹20L"
2. Chatbot service searches Azure AI Search (vector database of car descriptions)
3. Gets top 5 matching cars
4. Sends GPT-4o: "Here are 5 cars [data]. Now answer the user's question."
5. GPT-4o generates a helpful response
6. Streams it back to the frontend word by word (so you see it typing)

---

### ML Price Service (`services/ml-price/`)

**Port:** 8003
**Language:** Python + FastAPI + MLflow
**Job:** Predict the fair market price for any car using machine learning

**Files:**

| File | Purpose |
|------|---------|
| `requirements.txt` | FastAPI, Uvicorn, AND MLflow 2.16.2 |
| `app/main.py` | FastAPI app with health endpoint |
| `Dockerfile` | Containerization recipe |

**MLflow** manages trained ML models — it stores different versions of the model and serves them.

**What it will do eventually:**
1. Car gets listed with price ₹14.5L
2. Frontend calls ML service: "What's the fair price for a 2023 Hyundai Creta Diesel AT, 8,000 km?"
3. ML service loads the XGBoost model from MLflow
4. Model processes: brand, year, mileage, fuel type, location → outputs ₹14.8L
5. Frontend shows "AI Fair Value: ₹14.8L — Good Deal!" on the listing

This is the `mlPrice` field you see on every car card today (currently hardcoded in mock data).

---

### Sentiment Service (`services/sentiment/`)

**Port:** 7071
**Language:** Python + Azure Functions
**Job:** Analyse whether car reviews are positive or negative

**Files:**

| File | Purpose |
|------|---------|
| `requirements.txt` | Azure Functions library |
| `function_app.py` | Azure Functions app with health endpoint |
| `host.json` | Azure Functions runtime configuration |
| `Dockerfile` | Containerization (uses Azure Functions base image) |

**Different from other services:** This uses **Azure Functions** (serverless) instead of a regular web server. It doesn't run continuously — it wakes up only when there's a new review event to process. This saves money (you pay per execution, not per hour).

**What it will do eventually:**
1. Reviews service publishes: "New review submitted: 'The car had some issues with AC'"
2. Sentiment service wakes up, runs HuggingFace transformer model on the text
3. Gets result: "NEGATIVE (confidence: 0.87)"
4. Updates the review in MongoDB with the sentiment score
5. If very negative (score < -0.8), escalates to the support team

---

## 7. Infrastructure Files

These files define and deploy the Azure cloud infrastructure that runs everything in production.

---

### Terraform (`infra/terraform/`)

**What is Terraform?** — You write code, Terraform reads it and creates real cloud resources. Instead of clicking buttons in the Azure portal, you describe what you want in `.tf` files.

#### `infra/terraform/main.tf`
**What it does:** Creates an Azure Resource Group (a container for all your Azure resources).

```hcl
terraform {
  required_providers {
    azurerm = { version = "~>4.0" }  ← use Azure provider version 4+
  }
}

resource "azurerm_resource_group" "main" {
  name     = "rg-autodrive-dev"       ← the resource group name in Azure
  location = "Central India"          ← Mumbai Azure region
}
```

When you run `terraform apply`, Azure creates a resource group called `rg-autodrive-dev` in their Mumbai data center. This is where all other resources (VMs, databases, networking) will live.

#### `infra/terraform/variables.tf`
**What it does:** Defines input variables so you can reuse the same config for different environments.

```hcl
variable "environment" {
  type    = string
  default = "dev"  ← can be "dev", "staging", "prod"
}
```

This lets you run `terraform apply -var="environment=prod"` to deploy a production environment with different settings.

---

### Helm (`infra/helm/`)

**What is Helm?** — Helm is like a package manager for Kubernetes. Kubernetes tells you HOW to run containers, and Helm packages up all those Kubernetes instructions into a single deployable "chart."

#### `infra/helm/autodrive/Chart.yaml`
**What it is:** The name tag for the Helm package.

```yaml
name: autodrive
description: Helm chart for the AutoDrive platform
version: 0.1.0
appVersion: 0.1.0
```

Just metadata — tells Helm what this chart is called and what version it is.

#### `infra/helm/autodrive/values.yaml`
**What it is:** Default configuration values for the deployment.

```yaml
replicaCount: 1           ← run 1 copy of the app
image: autodrive/frontend:latest ← which Docker image to use
service:
  type: ClusterIP         ← internal-only service
  port: 3000              ← expose on port 3000
```

You can override these values when deploying (e.g., set `replicaCount: 3` for production).

#### `infra/helm/autodrive/templates/deployment.yaml`
**What it is:** Tells Kubernetes exactly how to run the app containers.

This is a **Kubernetes Deployment** — it says:
- Run the AutoDrive frontend container
- Use the image from values.yaml
- Expose port 3000
- Run N replicas (copies) as defined in values.yaml

Kubernetes ensures the app is always running — if a container crashes, Kubernetes restarts it automatically.

---

## 8. How Everything Connects

Here's the complete picture of how a user action flows through all these files:

### Example: User searches for "Creta under ₹15L"

```
1. User types "Creta" in Navbar search bar
   File: components/layout/Navbar.tsx
   → onKeyDown detects Enter key
   → navigates to /cars?search=Creta

2. Cars page loads
   File: app/cars/page.tsx
   → useSearchParams reads search=Creta from URL
   → setSearch("Creta") updates state
   → filterCars({search: "Creta"}) is called

3. filterCars runs
   File: lib/mockData.ts
   → loops through all 12 cars
   → checks if "Creta" is in `${make} ${model}` string
   → returns [Hyundai Creta car object]

4. Results rendered
   File: components/cars/CarCard.tsx
   → receives car object as prop
   → renders image, price, specs
   → formats price with formatPrice(1450000) → "₹14.50 L"
   → shows "AI Fair Value: ₹14.80 L" badge
   → entire card is a link to /cars/2

5. User clicks the card
   → navigates to /cars/2

6. Detail page loads
   File: app/cars/[id]/page.tsx
   → getCarById("2") returns Hyundai Creta data
   → renders image carousel, specs, description
   → shows AI Price Analysis comparing 14.5L vs 14.8L
   → "Good Deal!" badge shown (listed < AI price)

7. User clicks "Ask AI About This Car"
   → navigates to /chat

8. Chat page loads
   File: app/chat/page.tsx
   → shows default AI greeting
   → user types "Tell me about the Creta"
   → sendMessage() called
   → typing indicator shows (fake 900ms delay)
   → mock response returned
   (real version would call chatbot service on port 8002)
```

---

### File Dependency Map

```
app/layout.tsx
  ├── imports Navbar (components/layout/Navbar.tsx)
  ├── imports Footer (components/layout/Footer.tsx)
  └── imports ChatWidget (components/chat/ChatWidget.tsx)

app/page.tsx
  ├── imports Hero (components/home/Hero.tsx)
  │   └── uses: locations from lib/mockData.ts
  ├── imports BrandBar (components/home/BrandBar.tsx)
  │   └── uses: brands from lib/mockData.ts
  ├── imports FeaturedCars (components/home/FeaturedCars.tsx)
  │   ├── uses: cars from lib/mockData.ts
  │   └── uses: CarCard (components/cars/CarCard.tsx)
  │       ├── uses: Car type from lib/types.ts
  │       └── uses: formatPrice from lib/mockData.ts
  ├── imports WhyUs (components/home/WhyUs.tsx)
  └── imports AICTABanner (components/home/AICTABanner.tsx)

app/cars/page.tsx
  ├── imports CarCard (components/cars/CarCard.tsx)
  ├── imports CarFilters (components/cars/CarFilters.tsx)
  └── uses: filterCars, cars from lib/mockData.ts

app/cars/[id]/page.tsx
  ├── imports CarCard (for similar cars)
  └── uses: getCarById, formatPrice, cars from lib/mockData.ts

app/chat/page.tsx
  └── uses: Message type from lib/types.ts
```

---

## 9. How to Run the App

### Option 1: Frontend only (recommended for now)

```bash
# Navigate to the frontend folder
cd autodrive/frontend

# Install all libraries (first time only)
npm install

# Start development server
npm run dev

# Open in browser:
# http://localhost:3000
```

You'll see the full UI with all 12 mock cars. Everything works except real AI responses (those need the chatbot backend).

### Option 2: All services with Docker

```bash
# From the root autodrive/ folder
# Requires Docker Desktop to be installed

docker compose up --build

# Frontend: http://localhost:3000
# Auth API: http://localhost:4001/health
# Cars API: http://localhost:8001/health
# Reviews: http://localhost:4002/health
# Chatbot: http://localhost:8002/health
# ML Price: http://localhost:8003/health
# Sentiment: http://localhost:7071/health
```

Or use the shortcut:
```bash
make dev
```

---

## Quick Reference: File Cheat Sheet

| If you want to... | Edit this file |
|-------------------|---------------|
| Change the homepage layout | `app/page.tsx` |
| Change the hero banner text | `components/home/Hero.tsx` |
| Add/edit car listings | `lib/mockData.ts` |
| Change what shows on a car card | `components/cars/CarCard.tsx` |
| Add a new filter option | `components/cars/CarFilters.tsx` |
| Change the navbar | `components/layout/Navbar.tsx` |
| Change the footer | `components/layout/Footer.tsx` |
| Change the chat AI responses | `components/chat/ChatWidget.tsx` (widget) or `app/chat/page.tsx` (full page) |
| Add a new page | Create `app/your-page/page.tsx` |
| Change global styles | `app/globals.css` |
| Add a new data field to Car | `lib/types.ts` first, then `lib/mockData.ts` |
| Change browser tab title | `app/layout.tsx` (metadata export) |

---

*This guide was written for the AutoDrive project — a cloud-native car marketplace built as a Microsoft Azure Cloud Computing course project by Ashad Alam, Pritam Maji, Samarth Agrawal, and Venkata Mahesh.*
