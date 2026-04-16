'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getCars } from '@/lib/api';
import { Car } from '@/lib/types';
import CarCard from '@/components/cars/CarCard';
import CarFilters from '@/components/cars/CarFilters';

const defaultFilters = {
  make: 'All',
  fuelType: 'All',
  transmission: 'All',
  location: 'All Cities',
  minPrice: 0,
  maxPrice: 99999999,
};

function CarsContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Read URL params on first mount
  useEffect(() => {
    const make = searchParams.get('make');
    const fuelType = searchParams.get('fuelType');
    const location = searchParams.get('location');
    const q = searchParams.get('search');
    setFilters(f => ({
      ...f,
      ...(make ? { make } : {}),
      ...(fuelType ? { fuelType } : {}),
      ...(location ? { location } : {}),
    }));
    if (q) setSearch(q);
  }, [searchParams]);

  // Re-fetch whenever filters or search change
  useEffect(() => {
    setLoading(true);
    setError('');
    getCars({
      make: filters.make,
      fuelType: filters.fuelType,
      transmission: filters.transmission,
      location: filters.location,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      search,
    })
      .then(setCars)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load cars'))
      .finally(() => setLoading(false));
  }, [filters, search]);

  // Client-side sort (API already filtered)
  let results = [...cars];
  if (sortBy === 'price-asc') results.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') results.sort((a, b) => b.price - a.price);
  else if (sortBy === 'year-desc') results.sort((a, b) => b.year - a.year);
  else if (sortBy === 'mileage-asc') results.sort((a, b) => a.mileage - b.mileage);

  function handleFilterChange(key: string, value: string | number) {
    setFilters(f => ({ ...f, [key]: value }));
  }

  function handleReset() {
    setFilters({ ...defaultFilters });
    setSearch('');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100 py-5">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Used Cars</h1>
          <p className="text-slate-500 text-sm">
            {loading ? 'Loading…' : `${results.length} cars found`}
          </p>

          {/* Search + Sort bar */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="flex-1 min-w-48 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={15} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search brand, model..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 py-2.5 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="year-desc">Year: Newest First</option>
              <option value="mileage-asc">Mileage: Lowest</option>
            </select>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white"
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters sidebar - desktop */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <CarFilters filters={filters} onChange={handleFilterChange} onReset={handleReset} />
          </div>

          {/* Mobile filters drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>
                <CarFilters filters={filters} onChange={handleFilterChange} onReset={handleReset} />
              </div>
            </div>
          )}

          {/* Cars grid */}
          <div className="flex-1">
            {error ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">⚠️</p>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Could not load cars</h3>
                <p className="text-slate-500 mb-6 text-sm">{error}</p>
                <button
                  onClick={() => setFilters({ ...defaultFilters })}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 h-72 animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🚗</p>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No cars found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {results.map(car => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Loading…</p></div>}>
      <CarsContent />
    </Suspense>
  );
}
