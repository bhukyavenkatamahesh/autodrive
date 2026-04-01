'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Gauge, Fuel, Settings, Star, Users, CheckCircle, Calendar, TrendingUp, Bot, Phone, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getCarById, formatPrice, cars } from '@/lib/mockData';
import CarCard from '@/components/cars/CarCard';

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const car = getCarById(id);
  const [activeImg, setActiveImg] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-6xl">🚗</p>
        <h2 className="text-2xl font-bold text-slate-800">Car not found</h2>
        <Link href="/cars" className="text-blue-600 hover:underline">Browse all cars</Link>
      </div>
    );
  }

  const images = car.images?.length ? car.images : [car.image];
  const similar = cars.filter(c => c.id !== car.id && c.make === car.make).slice(0, 3);
  const priceDiff = car.mlPrice ? car.mlPrice - car.price : 0;
  const isDeal = priceDiff > 0;

  const specs = [
    { label: 'Year', value: car.year, icon: Calendar },
    { label: 'Mileage', value: `${car.mileage.toLocaleString()} km`, icon: Gauge },
    { label: 'Fuel', value: car.fuelType, icon: Fuel },
    { label: 'Transmission', value: car.transmission, icon: Settings },
    { label: 'Owners', value: `${car.owners} Owner${car.owners > 1 ? 's' : ''}`, icon: Users },
    { label: 'Location', value: car.location, icon: MapPin },
    ...(car.engineCC ? [{ label: 'Engine', value: `${car.engineCC} cc`, icon: Settings }] : []),
    ...(car.seating ? [{ label: 'Seating', value: `${car.seating} Seats`, icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/cars" className="hover:text-blue-600">Used Cars</Link>
          <span>/</span>
          <span className="text-slate-800">{car.year} {car.make} {car.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Images + Specs */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
              <div className="relative h-80 md:h-96 bg-slate-100">
                <img
                  src={images[activeImg]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-blue-500' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specs grid */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 mb-4">Car Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specs.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
                      <Icon size={18} className="text-blue-600 mb-2" />
                      <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{s.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 mb-3">About this car</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{car.description}</p>
            </div>

            {/* Features */}
            {car.features && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Key Features</h3>
                <div className="flex flex-wrap gap-2">
                  {car.features.map(f => (
                    <div key={f} className="flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full">
                      <CheckCircle size={13} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Price analysis */}
            {car.mlPrice && (
              <div className={`rounded-2xl border p-5 ${isDeal ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className={isDeal ? 'text-green-600' : 'text-orange-600'} />
                  <h3 className={`font-bold ${isDeal ? 'text-green-800' : 'text-orange-800'}`}>
                    AI Price Analysis
                  </h3>
                  <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full text-slate-600">XGBoost ML</span>
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-black text-slate-900">{formatPrice(car.price)}</span>
                  <span className="text-slate-500 text-sm">Listed Price</span>
                </div>
                <div className={`flex items-center gap-2 text-sm font-semibold ${isDeal ? 'text-green-700' : 'text-orange-700'}`}>
                  <TrendingUp size={15} />
                  AI Fair Value: {formatPrice(car.mlPrice)}
                  <span className="font-normal text-slate-500">
                    ({isDeal ? `₹${priceDiff.toLocaleString('en-IN')} below market` : `₹${Math.abs(priceDiff).toLocaleString('en-IN')} above market`})
                  </span>
                </div>
                <p className={`text-xs mt-2 ${isDeal ? 'text-green-600' : 'text-orange-600'}`}>
                  {isDeal ? 'This is a good deal! Below fair market value.' : 'Priced above fair market value. You may negotiate.'}
                </p>
              </div>
            )}
          </div>

          {/* Right: Price + Actions */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {car.year} {car.make} {car.model}
                </h2>
              </div>

              {car.rating && (
                <div className="flex items-center gap-1.5 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14} className={i <= Math.floor(car.rating!) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                  ))}
                  <span className="text-sm text-slate-500">({car.reviews} reviews)</span>
                </div>
              )}

              <p className="text-3xl font-black text-blue-600 mb-1">{formatPrice(car.price)}</p>
              {isDeal && (
                <span className="inline-block text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full mb-4">
                  Good Deal — Below Market Value
                </span>
              )}

              <div className="flex gap-2 text-xs text-slate-500 mb-5">
                <span className="flex items-center gap-1"><Gauge size={12} />{car.mileage.toLocaleString()} km</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{car.location}</span>
              </div>

              {/* CTA buttons */}
              {!showBooking ? (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowBooking(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Book Test Drive
                  </button>
                  <Link
                    href="/chat"
                    className="w-full flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-colors"
                  >
                    <Bot size={16} />
                    Ask AI About This Car
                  </Link>
                  <button className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-colors text-sm">
                    <Phone size={15} />
                    Contact Seller
                  </button>
                </div>
              ) : booked ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                  <p className="font-bold text-slate-900 mb-1">Test Drive Booked!</p>
                  <p className="text-sm text-slate-500">Our team will call you within 2 hours to confirm the slot.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">Book Test Drive</h4>
                  <input type="text" placeholder="Your name" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="tel" placeholder="Phone number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-600">
                    <option>Select preferred time</option>
                    <option>Tomorrow 10AM – 12PM</option>
                    <option>Tomorrow 2PM – 5PM</option>
                    <option>Day after 10AM – 12PM</option>
                    <option>Weekend slot</option>
                  </select>
                  <button
                    onClick={() => setBooked(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Confirm Booking
                  </button>
                  <button onClick={() => setShowBooking(false)} className="w-full text-sm text-slate-500 hover:text-slate-700">
                    Cancel
                  </button>
                </div>
              )}

              <p className="text-xs text-slate-400 text-center mt-3">Free • No obligation • Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* Similar cars */}
        {similar.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Similar {car.make} Cars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map(c => <CarCard key={c.id} car={c} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
