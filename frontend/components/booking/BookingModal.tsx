'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Loader2, X } from 'lucide-react';
import { bookTestDrive, Booking } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

interface BookingModalProps {
  carId: string;
  carLabel: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: (booking: Booking) => void;
}

const TIME_SLOTS = [
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
];

function nextThreeDays(): { iso: string; label: string }[] {
  const days: { iso: string; label: string }[] = [];
  for (let offset = 1; offset <= 5; offset++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    days.push({ iso, label });
  }
  return days;
}

export default function BookingModal({
  carId,
  carLabel,
  open,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const { user, token } = useAuth();
  const dates = useMemo(() => nextThreeDays(), []);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(dates[0]?.iso ?? '');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Booking | null>(null);

  useEffect(() => {
    if (open) {
      setName(user?.name ?? '');
      setError(null);
      setSuccess(null);
    }
  }, [open, user]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('Please sign in to book a test drive.');
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const booking = await bookTestDrive(
        carId,
        { date, timeSlot, name: name.trim(), phone: phone.trim() },
        token,
      );
      setSuccess(booking);
      onSuccess?.(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Book Test Drive</h3>
            <p className="text-sm text-slate-500 mt-0.5">{carLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle size={48} className="text-green-500 mx-auto" />
            <h4 className="text-xl font-bold text-slate-900">Test drive booked!</h4>
            <p className="text-sm text-slate-600">
              We&apos;ve reserved <strong>{success.timeSlot}</strong> on{' '}
              <strong>{success.date}</strong>. Our team will call you on{' '}
              <strong>{success.phone}</strong> to confirm.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
              >
                View my bookings
              </Link>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        ) : !user ? (
          <div className="p-6 text-center space-y-3">
            <p className="text-slate-600">You need an account to book a test drive.</p>
            <div className="flex gap-2 justify-center">
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-xl"
              >
                Register
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Preferred day
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {dates.map((d) => (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setDate(d.iso)}
                    className={`px-2 py-2 text-xs font-medium rounded-lg border transition-colors ${
                      date === d.iso
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Time slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Booking…' : 'Confirm booking'}
            </button>
            <p className="text-xs text-slate-400 text-center">
              Free • No obligation • Cancel anytime
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
