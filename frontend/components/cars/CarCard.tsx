'use client';
import Link from 'next/link';
import { MapPin, Gauge, Fuel, Settings, TrendingDown, TrendingUp, Star } from 'lucide-react';
import { Car } from '@/lib/types';
import { formatPrice } from '@/lib/mockData';

interface CarCardProps {
  car: Car;
}

const fuelColors: Record<string, string> = {
  Petrol: 'bg-orange-50 text-orange-600 border-orange-200',
  Diesel: 'bg-blue-50 text-blue-600 border-blue-200',
  Electric: 'bg-green-50 text-green-600 border-green-200',
  Hybrid: 'bg-purple-50 text-purple-600 border-purple-200',
};

export default function CarCard({ car }: CarCardProps) {
  const priceDiff = car.mlPrice ? car.mlPrice - car.price : 0;
  const isDeal = priceDiff > 0;

  return (
    <Link href={`/cars/${car.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-blue-200 hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img
            src={car.image}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Year badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {car.year}
          </div>

          {/* AI Price badge */}
          {car.mlPrice && (
            <div className={`absolute top-3 right-3 flex items-center gap-1 text-white text-xs px-2.5 py-1 rounded-full ${isDeal ? 'bg-green-600' : 'bg-orange-500'}`}>
              {isDeal ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
              AI: {formatPrice(car.mlPrice)}
            </div>
          )}

          {/* Rating */}
          {car.rating && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Star size={11} className="text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-800">{car.rating}</span>
              <span className="text-xs text-slate-500">({car.reviews})</span>
            </div>
          )}

          {/* Fuel type */}
          <div className={`absolute bottom-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full border ${fuelColors[car.fuelType]}`}>
            {car.fuelType}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-slate-900 text-lg leading-tight mb-0.5">
            {car.year} {car.make} {car.model}
          </h3>
          <p className="text-2xl font-black text-blue-600 mb-3">{formatPrice(car.price)}</p>

          {/* Specs row */}
          <div className="flex gap-3 text-slate-500 text-xs mb-4">
            <span className="flex items-center gap-1">
              <Gauge size={12} />
              {car.mileage.toLocaleString()} km
            </span>
            <span className="flex items-center gap-1">
              <Fuel size={12} />
              {car.fuelType}
            </span>
            <span className="flex items-center gap-1">
              <Settings size={12} />
              {car.transmission}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {car.location}
            </span>
          </div>

          {/* Owners + CTA */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {car.owners === 1 ? '1st Owner' : `${car.owners} Owners`}
            </span>
            {isDeal && (
              <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                Good Deal
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
