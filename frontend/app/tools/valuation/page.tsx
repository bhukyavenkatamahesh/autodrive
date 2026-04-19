'use client';
import { useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { predictPrice } from '@/lib/api';
import type { PricePrediction } from '@/lib/api';

const MAKES = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Kia', 'Mahindra', 'MG', 'Volkswagen', 'BMW', 'Audi', 'Mercedes', 'Skoda', 'Renault', 'Nissan', 'Ford', 'Jeep'];
const YEARS = Array.from({ length: 15 }, (_, i) => 2025 - i);

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

export default function ValuationPage() {
  const [form, setForm] = useState({
    make: '', model: '', year: 2022, mileage: 20000, fuelType: 'Petrol', location: 'Delhi',
  });
  const [result, setResult] = useState<PricePrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.make || !form.model) return setError('Make and Model are required');
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await predictPrice({ ...form });
      setResult(data);
    } catch {
      setError('Valuation service is currently unavailable. Your teammate\'s ML service will power this when ready.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">AI Car Valuation</h1>
            <p className="text-slate-500 text-sm">Get an instant AI-powered price estimate</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Make *</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.make}
                onChange={e => setForm({ ...form, make: e.target.value })}
              >
                <option value="">Select make…</option>
                {MAKES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Model *</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Swift, Creta"
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Year</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.year}
                onChange={e => setForm({ ...form, year: Number(e.target.value) })}
              >
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Mileage (km)</label>
              <input
                type="number" min={0}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.mileage}
                onChange={e => setForm({ ...form, mileage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Fuel Type</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.fuelType}
                onChange={e => setForm({ ...form, fuelType: e.target.value })}
              >
                {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">City</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              >
                {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Jaipur'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            {loading ? 'Estimating…' : 'Get AI Valuation'}
          </button>
        </form>

        {result && (
          <div className="mt-5 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} />
              <p className="font-semibold">AI Estimated Value</p>
              <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{result.modelVersion}</span>
            </div>
            <p className="text-4xl font-black mb-4">{fmt(result.predictedPrice)}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-xs text-blue-200">Price Range (Low)</p>
                <p className="font-bold">{fmt(result.confidenceLow)}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-xs text-blue-200">Price Range (High)</p>
                <p className="font-bold">{fmt(result.confidenceHigh)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
