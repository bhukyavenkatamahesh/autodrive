'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { locations } from '@/lib/mockData';

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Delhi');
  const [cityOpen, setCityOpen] = useState(false);
  const [budget, setBudget] = useState('');

  const budgets = [
    'Under ₹3L', '₹3L – ₹5L', '₹5L – ₹10L',
    '₹10L – ₹20L', '₹20L – ₹50L', 'Above ₹50L',
  ];

  function handleSearch() {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (city !== 'All Cities') params.set('location', city);
    router.push(`/cars?${params.toString()}`);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-16 pb-20">
      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -top-20 -right-40 pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] bg-violet-500/10 rounded-full blur-3xl bottom-0 -left-20 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">
          <Sparkles size={14} />
          AI-Powered Car Discovery • GPT-4o
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
          Find Your Perfect
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400"> Drive</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Search 10,000+ verified cars. Chat with AI to find exactly what you need.
        </p>

        {/* Search box */}
        <div className="bg-white rounded-2xl p-3 shadow-2xl max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-2">
            {/* City */}
            <div className="relative">
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm text-slate-700 whitespace-nowrap transition-colors w-full md:w-auto"
              >
                <MapPin size={15} className="text-blue-600" />
                <span className="font-medium">{city}</span>
                <ChevronDown size={14} />
              </button>
              {cityOpen && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 text-left">
                  {locations.slice(1).map(c => (
                    <button
                      key={c}
                      onClick={() => { setCity(c); setCityOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search input */}
            <div className="flex-1 flex items-center gap-2 px-4 bg-slate-50 rounded-xl">
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder='Search brand, model (e.g. "Creta", "City")'
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 py-3 text-sm text-slate-700 bg-transparent outline-none placeholder-slate-400"
              />
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Search Cars
            </button>
          </div>

          {/* Budget pills */}
          <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 self-center">Budget:</span>
            {budgets.map(b => (
              <button
                key={b}
                onClick={() => { setBudget(b); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  budget === b
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-10">
          {[
            { label: 'Verified Cars', value: '10,000+' },
            { label: 'Cities', value: '50+' },
            { label: 'Happy Buyers', value: '2L+' },
            { label: 'AI Accuracy', value: '94%' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
