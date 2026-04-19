'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Phone, Car as CarIcon, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { getMyBookings, Booking } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user === null && token === null) {
      // hydrated — user genuinely logged out
      const timeout = setTimeout(() => {
        if (!localStorage.getItem('auth_token')) router.push('/login');
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [user, token, router]);

  useEffect(() => {
    if (!token) return;
    getMyBookings(token)
      .then(setBookings)
      .catch((err) => setError(err.message));
  }, [token]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-600 mt-1">Your test drive bookings and activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total bookings"
            value={bookings ? String(bookings.length) : '…'}
            icon={<CarIcon size={18} />}
          />
          <StatCard
            label="Upcoming"
            value={
              bookings
                ? String(
                    bookings.filter(
                      (b) =>
                        b.status === 'confirmed' &&
                        new Date(b.date) >= new Date(new Date().toDateString()),
                    ).length,
                  )
                : '…'
            }
            icon={<Calendar size={18} />}
          />
          <StatCard
            label="Completed"
            value={
              bookings
                ? String(bookings.filter((b) => b.status === 'completed').length)
                : '…'
            }
            icon={<CheckCircle size={18} />}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">My test drives</h2>
            <Link
              href="/cars"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Browse more cars →
            </Link>
          </div>

          {error && (
            <div className="p-5 text-sm text-red-600 bg-red-50">{error}</div>
          )}

          {bookings === null && !error && (
            <div className="p-8 flex items-center justify-center text-slate-500">
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}

          {bookings && bookings.length === 0 && (
            <div className="p-10 text-center space-y-3">
              <p className="text-5xl">🚗</p>
              <p className="text-slate-600">No test drives booked yet.</p>
              <Link
                href="/cars"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
              >
                Find a car
              </Link>
            </div>
          )}

          {bookings && bookings.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <li key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <CarIcon size={14} className="text-blue-600" />
                      <Link
                        href={`/cars/${b.carId}`}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600"
                      >
                        Car #{b.carId}
                      </Link>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : b.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {b.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {b.timeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {b.phone}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/cars/${b.carId}`}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    View car →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
