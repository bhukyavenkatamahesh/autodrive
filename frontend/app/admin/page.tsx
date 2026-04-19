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
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    getCars()
      .then(r => setCars(r.cars))
      .catch(() => setError('Failed to load cars'));
  }, [router, user]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user) return;
    if (!form.make.trim() || !form.model.trim()) return setError('Make and Model are required');
    if (form.price <= 0) return setError('Price must be greater than 0');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const created = await createCar(token, user.role, {
        ...form,
        mlPrice: undefined,
        images: form.image ? [form.image] : [],
        rating: undefined,
        reviews: undefined,
        features: [],
        engineCC: undefined,
        seating: 5,
      });
      setCars(prev => [created, ...prev]);
      setForm(emptyForm);
      setSuccess(`"${created.make} ${created.model}" added successfully!`);
      setTimeout(() => setSuccess(''), 4000);
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
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

      <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white border rounded-xl p-4">
        <input required className="border rounded-lg px-3 py-2" placeholder="Make *" value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
        <input required className="border rounded-lg px-3 py-2" placeholder="Model *" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="Image URL (optional)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
        <input className="border rounded-lg px-3 py-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
        <input required type="number" min={1} className="border rounded-lg px-3 py-2" placeholder="Price (₹) *" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
        <input type="number" min={0} className="border rounded-lg px-3 py-2" placeholder="Mileage (km)" value={form.mileage || ''} onChange={e => setForm({ ...form, mileage: Number(e.target.value) })} />
        <input type="number" min={1} className="border rounded-lg px-3 py-2" placeholder="Owners" value={form.owners} onChange={e => setForm({ ...form, owners: Number(e.target.value) })} />
        <select className="border rounded-lg px-3 py-2 bg-white" value={form.fuelType} onChange={e => setForm({ ...form, fuelType: e.target.value as Car['fuelType'] })}>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <select className="border rounded-lg px-3 py-2 bg-white" value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value as Car['transmission'] })}>
          <option value="Manual">Manual</option>
          <option value="Automatic">Automatic</option>
        </select>
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
