/**
 * api.ts — centralised API client
 *
 * All fetch calls to the backend services go through here.
 * Environment variables (set in .env.local or docker-compose) control the URLs;
 * the defaults point to localhost for local development.
 */

import { Car, Brand } from './types';

const CARS_API = process.env.NEXT_PUBLIC_CARS_API_URL ?? 'http://localhost:8001';
const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:4001';

// ── Field name mapping ─────────────────────────────────────────────────────
// The Python backend uses snake_case (fuel_type, ml_price, engine_cc).
// The TypeScript frontend uses camelCase (fuelType, mlPrice, engineCC).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCar(raw: Record<string, any>): Car {
  return {
    id: raw.id,
    make: raw.make,
    model: raw.model,
    year: raw.year,
    price: raw.price,
    mlPrice: raw.ml_price ?? undefined,
    mileage: raw.mileage,
    fuelType: raw.fuel_type,
    transmission: raw.transmission,
    location: raw.location,
    image: raw.image,
    images: raw.images ?? undefined,
    color: raw.color,
    description: raw.description,
    owners: raw.owners,
    rating: raw.rating ?? undefined,
    reviews: raw.reviews ?? undefined,
    features: raw.features ?? undefined,
    engineCC: raw.engine_cc ?? undefined,
    seating: raw.seating ?? undefined,
  };
}

// ── Cars API ───────────────────────────────────────────────────────────────

export interface CarFilters {
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  location?: string;
  search?: string;
}

export async function getCars(filters: CarFilters = {}): Promise<Car[]> {
  const params = new URLSearchParams();
  if (filters.make && filters.make !== 'All') params.set('make', filters.make);
  if (filters.minPrice) params.set('min_price', String(filters.minPrice));
  if (filters.maxPrice && filters.maxPrice < 99999999) params.set('max_price', String(filters.maxPrice));
  if (filters.fuelType && filters.fuelType !== 'All') params.set('fuel_type', filters.fuelType);
  if (filters.transmission && filters.transmission !== 'All') params.set('transmission', filters.transmission);
  if (filters.location && filters.location !== 'All Cities') params.set('location', filters.location);
  if (filters.search) params.set('search', filters.search);

  const qs = params.toString();
  const res = await fetch(`${CARS_API}/cars${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Cars API error: ${res.statusText}`);
  const data = await res.json();
  return data.map(mapCar);
}

export async function getCarById(id: string): Promise<Car | null> {
  const res = await fetch(`${CARS_API}/cars/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Cars API error: ${res.statusText}`);
  return mapCar(await res.json());
}

export async function getBrands(): Promise<Brand[]> {
  const res = await fetch(`${CARS_API}/brands`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Cars API error: ${res.statusText}`);
  return res.json();
}

export async function getLocations(): Promise<string[]> {
  const res = await fetch(`${CARS_API}/locations`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Cars API error: ${res.statusText}`);
  return res.json();
}

// ── Auth API ───────────────────────────────────────────────────────────────

export interface AuthResult {
  token: string;
  user: { id: string; name: string; email: string };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${AUTH_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Login failed');
  }
  return res.json();
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const res = await fetch(`${AUTH_API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Registration failed');
  }
  return res.json();
}
