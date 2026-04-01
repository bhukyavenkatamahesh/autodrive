'use client';
import { X, SlidersHorizontal } from 'lucide-react';

interface FiltersProps {
  filters: {
    make: string;
    fuelType: string;
    transmission: string;
    location: string;
    minPrice: number;
    maxPrice: number;
  };
  onChange: (key: string, value: string | number) => void;
  onReset: () => void;
}

const makes = ['All', 'Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Kia', 'Mahindra', 'BMW', 'Volkswagen', 'Renault', 'Skoda', 'MG'];
const fuelTypes = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];
const transmissions = ['All', 'Manual', 'Automatic'];
const locations = ['All Cities', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Jaipur'];

const priceRanges = [
  { label: 'Any', min: 0, max: 99999999 },
  { label: 'Under ₹3L', min: 0, max: 300000 },
  { label: '₹3L – ₹5L', min: 300000, max: 500000 },
  { label: '₹5L – ₹10L', min: 500000, max: 1000000 },
  { label: '₹10L – ₹20L', min: 1000000, max: 2000000 },
  { label: '₹20L – ₹50L', min: 2000000, max: 5000000 },
  { label: 'Above ₹50L', min: 5000000, max: 99999999 },
];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-5 mb-5 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
      <h4 className="text-sm font-semibold text-slate-800 mb-3">{title}</h4>
      {children}
    </div>
  );
}

export default function CarFilters({ filters, onChange, onReset }: FiltersProps) {
  const hasActive = filters.make !== 'All' || filters.fuelType !== 'All' ||
    filters.transmission !== 'All' || filters.location !== 'All Cities' ||
    filters.maxPrice < 99999999;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <SlidersHorizontal size={16} className="text-blue-600" />
          Filters
        </div>
        {hasActive && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
          >
            <X size={12} /> Reset All
          </button>
        )}
      </div>

      {/* Budget */}
      <FilterSection title="Budget">
        <div className="space-y-1.5">
          {priceRanges.map(r => (
            <label key={r.label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="price"
                className="accent-blue-600"
                checked={filters.maxPrice === r.max && filters.minPrice === r.min}
                onChange={() => {
                  onChange('minPrice', r.min);
                  onChange('maxPrice', r.max);
                }}
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">{r.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Fuel Type */}
      <FilterSection title="Fuel Type">
        <div className="flex flex-wrap gap-2">
          {fuelTypes.map(f => (
            <button
              key={f}
              onClick={() => onChange('fuelType', f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filters.fuelType === f
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Transmission */}
      <FilterSection title="Transmission">
        <div className="flex gap-2">
          {transmissions.map(t => (
            <button
              key={t}
              onClick={() => onChange('transmission', t)}
              className={`flex-1 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filters.transmission === t
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-blue-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Make */}
      <FilterSection title="Brand">
        <select
          value={filters.make}
          onChange={e => onChange('make', e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {makes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </FilterSection>

      {/* Location */}
      <FilterSection title="City">
        <select
          value={filters.location}
          onChange={e => onChange('location', e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </FilterSection>
    </div>
  );
}
