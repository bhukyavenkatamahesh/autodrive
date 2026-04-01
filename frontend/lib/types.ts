export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mlPrice?: number;
  mileage: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  location: string;
  image: string;
  images?: string[];
  color: string;
  description: string;
  owners: number;
  rating?: number;
  reviews?: number;
  features?: string[];
  engineCC?: number;
  seating?: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Brand {
  name: string;
  logo: string;
  count: number;
}

export interface FilterState {
  make: string;
  minPrice: number;
  maxPrice: number;
  fuelType: string;
  transmission: string;
  minYear: number;
  maxYear: number;
  location: string;
}
