'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrands } from '@/lib/api';
import { Brand } from '@/lib/types';

const brandLogos: Record<string, string> = {
  'Maruti Suzuki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Maruti_logo.svg/200px-Maruti_logo.svg.png',
  'Hyundai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/200px-Hyundai_Motor_Company_logo.svg.png',
  'Tata': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/200px-Tata_logo.svg.png',
  'Honda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/200px-Honda_Logo.svg.png',
  'Toyota': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/200px-Toyota_carlogo.svg.png',
  'Kia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia-logo.svg/200px-Kia-logo.svg.png',
  'Mahindra': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mahindra_Logo.svg/200px-Mahindra_Logo.svg.png',
  'BMW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/150px-BMW.svg.png',
};

export default function BrandBar() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-10 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Browse by Brand</h2>
        {loading ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 p-3 animate-pulse h-24" />
            ))}
          </div>
        ) : brands.length > 0 ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {brands.map(brand => (
              <button
                key={brand.name}
                onClick={() => router.push(`/cars?make=${encodeURIComponent(brand.name)}`)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                    {brand.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600 text-center leading-tight">
                  {brand.name.split(' ')[0]}
                </span>
                <span className="text-xs text-slate-400">{brand.count.toLocaleString()}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
            Brand data is unavailable right now.
          </div>
        )}
      </div>
    </section>
  );
}
