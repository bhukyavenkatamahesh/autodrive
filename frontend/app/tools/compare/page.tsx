'use client';
import { useState, useEffect } from 'react';
import { Scale, X } from 'lucide-react';
import { getCars } from '@/lib/api';
import { Car } from '@/lib/types';
import { formatPrice } from '@/lib/mockData';

const ROWS: { label: string; key: keyof Car }[] = [
  { label: 'Price',        key: 'price' },
  { label: 'Year',         key: 'year' },
  { label: 'Mileage',      key: 'mileage' },
  { label: 'Fuel Type',    key: 'fuelType' },
  { label: 'Transmission', key: 'transmission' },
  { label: 'Body Type',    key: 'bodyType' },
  { label: 'Engine CC',    key: 'engineCC' },
  { label: 'Seating',      key: 'seating' },
  { label: 'Location',     key: 'location' },
  { label: 'Owners',       key: 'owners' },
  { label: 'Rating',       key: 'rating' },
  { label: 'AI Price',     key: 'mlPrice' },
];

function displayVal(car: Car, key: keyof Car): string {
  const v = car[key];
  if (v == null) return '—';
  if (key === 'price' || key === 'mlPrice') return formatPrice(v as number);
  if (key === 'mileage') return `${(v as number).toLocaleString()} km`;
  if (key === 'engineCC') return `${v} cc`;
  if (key === 'seating') return `${v} seats`;
  if (key === 'owners') return `${v}`;
  if (key === 'rating') return `⭐ ${v}`;
  return String(v);
}

export default function ComparePage() {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [selected, setSelected] = useState<(Car | null)[]>([null, null]);

  useEffect(() => {
    getCars({ limit: 100 }).then(r => setAllCars(r.cars)).catch(() => {});
  }, []);

  function pick(index: number, id: string) {
    const car = allCars.find(c => c.id === id) ?? null;
    setSelected(prev => prev.map((s, i) => i === index ? car : s));
  }

  function clear(index: number) {
    setSelected(prev => prev.map((s, i) => i === index ? null : s));
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Scale size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Compare Cars</h1>
            <p className="text-slate-500 text-sm">Side-by-side comparison of any two cars</p>
          </div>
        </div>

        {/* Car selectors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[0, 1].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4">
              {selected[i] ? (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <img
                      src={selected[i]!.image || 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&q=60'}
                      alt=""
                      className="w-full h-32 object-cover rounded-xl mb-3"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&q=60'; }}
                    />
                    <p className="font-bold text-slate-900 text-sm">
                      {selected[i]!.year} {selected[i]!.make} {selected[i]!.model}
                    </p>
                    <p className="text-blue-600 font-black">{formatPrice(selected[i]!.price)}</p>
                  </div>
                  <button onClick={() => clear(i)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Car {i + 1}</p>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                    onChange={e => pick(i, e.target.value)}
                  >
                    <option value="" disabled>Select a car…</option>
                    {allCars.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.year} {c.make} {c.model} — {formatPrice(c.price)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison table */}
        {selected.some(Boolean) && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {ROWS.map(({ label, key }) => (
                  <tr key={key} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-500 w-32 bg-slate-50">{label}</td>
                    {[0, 1].map(i => (
                      <td key={i} className="px-4 py-3 text-slate-800 font-semibold">
                        {selected[i] ? displayVal(selected[i]!, key) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!selected.some(Boolean) && (
          <div className="text-center py-16 text-slate-400">
            <Scale size={40} className="mx-auto mb-3 opacity-30" />
            <p>Select two cars above to compare them</p>
          </div>
        )}
      </div>
    </div>
  );
}
