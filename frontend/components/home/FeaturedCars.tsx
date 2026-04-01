import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cars } from '@/lib/mockData';
import CarCard from '@/components/cars/CarCard';

export default function FeaturedCars() {
  const featured = cars.slice(0, 6);

  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Cars</h2>
            <p className="text-slate-500 text-sm mt-1">Handpicked quality verified cars</p>
          </div>
          <Link
            href="/cars"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </section>
  );
}
