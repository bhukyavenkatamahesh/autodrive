'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, ChevronDown, Menu, X, Car, Bot } from 'lucide-react';
import { locations } from '@/lib/mockData';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [cityOpen, setCityOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
      {/* Top bar */}
      <div className="bg-blue-700 text-white text-xs py-1.5 text-center">
        🎉 AI-powered car discovery • 10,000+ verified cars • Free test drive booking
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Car size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">
              Auto<span className="text-blue-600">Drive</span>
            </span>
          </Link>

          {/* City picker */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCityOpen(!cityOpen)}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              <MapPin size={14} className="text-blue-600" />
              <span>{selectedCity}</span>
              <ChevronDown size={14} />
            </button>
            {cityOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                {locations.slice(1).map(city => (
                  <button
                    key={city}
                    onClick={() => { setSelectedCity(city); setCityOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 gap-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by brand, model (e.g. Swift, Creta)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  window.location.href = `/cars?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="flex-1 bg-transparent py-2.5 text-sm text-slate-700 outline-none placeholder-slate-400"
            />
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/cars" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Used Cars
            </Link>
            <Link href="/cars?fuelType=Electric" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Electric
            </Link>
            <Link href="/chat" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Bot size={14} />
              AI Chat
            </Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0 flex-shrink-0">
            <Link
              href="/login"
              className="hidden md:block text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              Register
            </Link>
            <button
              className="md:hidden p-2 text-slate-600 hover:text-blue-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 pt-3 space-y-2">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 gap-2">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search cars..."
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
            <Link href="/cars" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600">Used Cars</Link>
            <Link href="/cars?fuelType=Electric" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600">Electric Cars</Link>
            <Link href="/chat" className="block px-3 py-2 text-sm font-medium text-blue-600">AI Chat</Link>
          </div>
        )}
      </div>
    </header>
  );
}
