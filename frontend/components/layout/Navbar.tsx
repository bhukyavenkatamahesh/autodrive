'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, Menu, X, Car, Bot, LogOut, User } from 'lucide-react';
import { getLocations } from '@/lib/api';
import { locations as mockLocations } from '@/lib/mockData';
import { useAuth } from '@/lib/authContext';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [cityOpen, setCityOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>(mockLocations);

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch(() => {}); // keep mock data on failure
  }, []);

  function handleSearch() {
    if (searchQuery.trim()) {
      router.push(`/cars?search=${encodeURIComponent(searchQuery)}`);
    }
  }

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
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
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

          {/* Auth section */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0 flex-shrink-0">
            {user ? (
              // Logged-in: show user name + dropdown
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-sm text-slate-700 transition-colors"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={13} className="text-white" />
                  </div>
                  <span className="font-medium max-w-24 truncate">{user.name}</span>
                  <ChevronDown size={13} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Logged-out: Login + Register
              <>
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
              </>
            )}
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
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
            <Link href="/cars" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600">Used Cars</Link>
            <Link href="/cars?fuelType=Electric" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600">Electric Cars</Link>
            <Link href="/chat" className="block px-3 py-2 text-sm font-medium text-blue-600">AI Chat</Link>
            {user ? (
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600">Login</Link>
                <Link href="/register" className="block px-3 py-2 text-sm font-medium text-blue-600">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
