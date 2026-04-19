'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Car } from '@/lib/types';
import { createCar, deleteCar, getCars, updateCar } from '@/lib/api';

const emptyForm = {
  make: '',
  model: '',
  year: 2024,
  price: 0,
  mileage: 0,
  fuelType: 'Petrol' as Car['fuelType'],
  transmission: 'Manual' as Car['transmission'],
  location: '',
  image: '',
  color: '',
  description: '',
  owners: 1,
};

export default function AdminPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    getCars().then(setCars).catch(() => setError('Failed to load cars'));
  }, [router, user]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user) return;
    setLoading(true);
    setError('');
    try {
      const created = await createCar(token, user.role, {
        ...form,
        mlPrice: undefined,
        images: [form.image],
        rating: undefined,
        reviews: undefined,
        features: [],
        engineCC: undefined,
        seating: 5,
      });
      setCars(prev => [created, ...prev]);
      setForm(emptyForm);
    } catch {
      setError('Failed to create car');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!token || !user) return;
    try {
      await deleteCar(token, user.role, id);
      setCars(prev => prev.filter(c => c.id !== id));
    } catch {
      setError('Failed to delete car');
    }
  }

  async function onQuickPriceUpdate(car: Car) {
    if (!token || !user) return;
    try {
      const updated = await updateCar(token, user.role, car.id, { price: car.price + 10000 });
      setCars(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch {
      setError('Failed to update car');
    }
  }

  if (!user || user.role !== 'admin') {
    return <div className="max-w-4xl mx-auto p-6 text-slate-600">Checking access…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Cars Management</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white border rounded-xl p-4">
        <input className="border rounded-lg px-3 py-2" placeholder="Make" value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Mileage" value={form.mileage} onChange={e => setForm({ ...form, mileage: Number(e.target.value) })} />
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Owners" value={form.owners} onChange={e => setForm({ ...form, owners: Number(e.target.value) })} />
        <button disabled={loading} className="md:col-span-2 bg-blue-600 text-white rounded-lg py-2 font-medium disabled:opacity-60">
          {loading ? 'Saving...' : 'Create Car'}
        </button>
      </form>

      <div className="space-y-2">
        {cars.map(car => (
          <div key={car.id} className="bg-white border rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{car.make} {car.model}</p>
              <p className="text-sm text-slate-500">{car.location} • Rs. {car.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onQuickPriceUpdate(car)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50">+10k price</button>
              <button onClick={() => onDelete(car.id)} className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
