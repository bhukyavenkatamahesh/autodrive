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
const REVIEWS_API = (
  process.env.NEXT_PUBLIC_REVIEWS_API_URL ?? 'http://localhost:4002'
).replace(/\/reviews\/?$/, '');
const CHATBOT_API = process.env.NEXT_PUBLIC_CHATBOT_API_URL ?? 'https://autodrive-chatbot.azurewebsites.net';
const ML_PRICE_API =
  process.env.NEXT_PUBLIC_ML_PRICE_API_URL ?? 'https://autodrive-ml-samarth.azurewebsites.net';

// ── Field name mapping ─────────────────────────────────────────────────────
// Python backend uses snake_case; TypeScript frontend uses camelCase.
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
    bodyType: raw.body_type ?? undefined,
  };
}

async function asJsonError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return (body?.error as string) ?? (body?.detail as string) ?? fallback;
  } catch {
    return fallback;
  }
}

// ── Cars API ───────────────────────────────────────────────────────────────

export interface CarFilters {
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  location?: string;
  bodyType?: string;
  search?: string;
  sort?: string;
  limit?: number;
  page?: number;
}

export interface CarsListResponse {
  cars: Car[];
  total: number;
  page: number;
  pages: number;
}

export async function getCars(filters: CarFilters = {}): Promise<CarsListResponse> {
  const params = new URLSearchParams();
  if (filters.make && filters.make !== 'All') params.set('make', filters.make);
  if (filters.minPrice) params.set('min_price', String(filters.minPrice));
  if (filters.maxPrice && filters.maxPrice < 99999999) params.set('max_price', String(filters.maxPrice));
  if (filters.fuelType && filters.fuelType !== 'All') params.set('fuel_type', filters.fuelType);
  if (filters.transmission && filters.transmission !== 'All') params.set('transmission', filters.transmission);
  if (filters.location && filters.location !== 'All Cities') params.set('location', filters.location);
  if (filters.bodyType && filters.bodyType !== 'All') params.set('body_type', filters.bodyType);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.limit != null) params.set('limit', String(filters.limit));
  if (filters.page != null && filters.page > 0) params.set('page', String(filters.page));

  const qs = params.toString();
  const res = await fetch(`${CARS_API}/cars${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Cars API error: ${res.statusText}`);
  const data = await res.json();
  if (Array.isArray(data)) {
    const rows = data.map(mapCar);
    return {
      cars: rows,
      total: rows.length,
      page: 1,
      pages: 1,
    };
  }
  const rawCars = data.cars ?? [];
  const cars = Array.isArray(rawCars) ? rawCars.map(mapCar) : [];
  return {
    cars,
    total: Number(data.total ?? cars.length),
    page: Number(data.page ?? 1),
    pages: Number(data.pages ?? 1),
  };
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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${AUTH_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await asJsonError(res, 'Login failed'));
  return res.json();
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user',
): Promise<AuthResult> {
  const res = await fetch(`${AUTH_API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok) throw new Error(await asJsonError(res, 'Registration failed'));
  return res.json();
}

export async function logoutUser(token: string): Promise<void> {
  await fetch(`${AUTH_API}/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {}); // best-effort — client-side discard is authoritative
}

export async function refreshToken(token: string): Promise<AuthResult> {
  const res = await fetch(`${AUTH_API}/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await asJsonError(res, 'Refresh failed'));
  return res.json();
}

// ── Bookings API ───────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  carId: string;
  userId: string;
  userEmail: string;
  date: string;
  timeSlot: string;
  name: string;
  phone: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface BookingInput {
  date: string;
  timeSlot: string;
  name: string;
  phone: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBooking(raw: Record<string, any>): Booking {
  return {
    id: raw.id,
    carId: raw.car_id,
    userId: raw.user_id,
    userEmail: raw.user_email,
    date: raw.date,
    timeSlot: raw.time_slot,
    name: raw.name,
    phone: raw.phone,
    status: raw.status,
    createdAt: raw.created_at,
  };
}

export async function bookTestDrive(
  carId: string,
  input: BookingInput,
  token: string,
): Promise<Booking> {
  const res = await fetch(`${CARS_API}/cars/${carId}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      date: input.date,
      time_slot: input.timeSlot,
      name: input.name,
      phone: input.phone,
    }),
  });
  if (!res.ok) throw new Error(await asJsonError(res, 'Booking failed'));
  return mapBooking(await res.json());
}

export async function getMyBookings(token: string): Promise<Booking[]> {
  const res = await fetch(`${CARS_API}/bookings/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await asJsonError(res, 'Could not load bookings'));
  const data = await res.json();
  return data.map(mapBooking);
}

// ── Reviews API ────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  carId: string;
  user: { id: string; name: string };
  rating: number;
  comment: string;
  sentiment: string;
  sentimentScore: number;
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  total: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReview(raw: Record<string, any>): Review {
  return {
    id: raw.id,
    carId: raw.car_id,
    user: raw.user,
    rating: raw.rating,
    comment: raw.comment,
    sentiment: raw.sentiment,
    sentimentScore: raw.sentiment_score,
    createdAt: raw.created_at,
  };
}

export async function getReviews(carId: string): Promise<ReviewsResponse> {
  const res = await fetch(`${REVIEWS_API}/reviews/${carId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await asJsonError(res, 'Could not load reviews'));
  const data = await res.json();
  return {
    reviews: (data.reviews ?? []).map(mapReview),
    averageRating: data.average_rating ?? 0,
    total: data.total ?? 0,
  };
}

export async function postReview(
  carId: string,
  rating: number,
  comment: string,
  token: string,
): Promise<Review> {
  const res = await fetch(`${REVIEWS_API}/reviews/${carId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });
  if (!res.ok) throw new Error(await asJsonError(res, 'Could not submit review'));
  return mapReview(await res.json());
}

export async function deleteReview(reviewId: string, token: string): Promise<void> {
  const res = await fetch(`${REVIEWS_API}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await asJsonError(res, 'Could not delete review'));
}

// ── Chatbot API ────────────────────────────────────────────────────────────

export interface ChatAction {
  type: string;
  car_id?: string;
  [k: string]: unknown;
}

export interface StreamChatHandlers {
  onToken: (token: string) => void;
  onAction?: (action: ChatAction) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
}

/**
 * streamChat — SSE streaming chat.
 *
 * The chatbot (Ashad) emits `data: {"token": "..."}` lines. A final
 * `data: [DONE]` marks the end. If the chatbot service is unreachable we
 * invoke onError so the caller can fall back to a static reply.
 */
export async function streamChat(
  message: string,
  sessionId: string,
  handlers: StreamChatHandlers,
): Promise<void> {
  try {
    const res = await fetch(`${CHATBOT_API}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    if (!res.ok || !res.body) {
      // Streaming endpoint not available — fall back to non-streaming /chat
      // and simulate tokens by emitting small chunks with small delays.
      const reply = await chatOnce(message, sessionId);
      const words = reply.split(/(\s+)/);
      for (const w of words) {
        handlers.onToken(w);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 20));
      }
      handlers.onDone?.();
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (!data) continue;
        if (data === '[DONE]') {
          handlers.onDone?.();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed.token === 'string') handlers.onToken(parsed.token);
          if (parsed.action && handlers.onAction) handlers.onAction(parsed as ChatAction);
        } catch {
          // ignore malformed SSE chunk
        }
      }
    }
    handlers.onDone?.();
  } catch (err) {
    handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}

/** Non-streaming fallback used when SSE isn't available. */
export async function chatOnce(message: string, sessionId: string): Promise<string> {
  const res = await fetch(`${CHATBOT_API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Chatbot service error (${res.status})`);
  const data = await res.json();
  return data.response ?? '';
}

// ── ML Price API ───────────────────────────────────────────────────────────

export interface PricePrediction {
  predictedPrice: number;
  confidenceLow: number;
  confidenceHigh: number;
  modelVersion: string;
}

export async function predictPrice(input: {
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  location?: string;
}): Promise<PricePrediction> {
  const res = await fetch(`${ML_PRICE_API}/predict/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      make: input.make,
      model: input.model,
      year: input.year,
      mileage: input.mileage,
      fuel_type: input.fuelType,
      location: input.location ?? 'Unknown',
    }),
  });
  if (!res.ok) throw new Error(await asJsonError(res, 'Price prediction failed'));
  const data = await res.json();
  return {
    predictedPrice: data.predicted_price,
    confidenceLow: data.confidence_interval?.low ?? data.predicted_price,
    confidenceHigh: data.confidence_interval?.high ?? data.predicted_price,
    modelVersion: data.model_version ?? 'unknown',
  };
}

export async function getOAuthUrl(provider: 'google' | 'github'): Promise<string> {
  const res = await fetch(`${AUTH_API}/oauth/${provider}/start`, { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Failed to start ${provider} OAuth`);
  }
  const payload = (await res.json()) as { authUrl: string };
  return payload.authUrl;
}

export async function createCar(
  token: string,
  role: 'user' | 'admin',
  payload: Omit<Car, 'id'>,
): Promise<Car> {
  const res = await fetch(`${CARS_API}/cars`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-user-role': role,
    },
    body: JSON.stringify({
      make: payload.make,
      model: payload.model,
      year: payload.year,
      price: payload.price,
      ml_price: payload.mlPrice,
      mileage: payload.mileage,
      fuel_type: payload.fuelType,
      transmission: payload.transmission,
      location: payload.location,
      image: payload.image,
      images: payload.images ?? [],
      color: payload.color,
      description: payload.description,
      owners: payload.owners,
      rating: payload.rating,
      reviews: payload.reviews,
      features: payload.features ?? [],
      engine_cc: payload.engineCC,
      seating: payload.seating,
      body_type: payload.bodyType,
    }),
  });
  if (!res.ok) throw new Error('Failed to create car');
  return mapCar(await res.json());
}

export async function updateCar(
  token: string,
  role: 'user' | 'admin',
  id: string,
  payload: Partial<Omit<Car, 'id'>>,
): Promise<Car> {
  const res = await fetch(`${CARS_API}/cars/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-user-role': role,
    },
    body: JSON.stringify({
      make: payload.make,
      model: payload.model,
      year: payload.year,
      price: payload.price,
      ml_price: payload.mlPrice,
      mileage: payload.mileage,
      fuel_type: payload.fuelType,
      transmission: payload.transmission,
      location: payload.location,
      image: payload.image,
      images: payload.images,
      color: payload.color,
      description: payload.description,
      owners: payload.owners,
      rating: payload.rating,
      reviews: payload.reviews,
      features: payload.features,
      engine_cc: payload.engineCC,
      seating: payload.seating,
      body_type: payload.bodyType,
    }),
  });
  if (!res.ok) throw new Error('Failed to update car');
  return mapCar(await res.json());
}

export async function deleteCar(token: string, role: 'user' | 'admin', id: string): Promise<void> {
  const res = await fetch(`${CARS_API}/cars/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-user-role': role,
    },
  });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete car');
}
