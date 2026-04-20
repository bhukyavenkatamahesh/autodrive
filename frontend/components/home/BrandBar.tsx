'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrands } from '@/lib/api';
import { Brand } from '@/lib/types';
import { brandLogos } from './brandLogos';

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
              <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 p-3 animate-pulse h-28" />
            ))}
          </div>
        ) : brands.length > 0 ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {brands.map(brand => (
              <button
                key={brand.name}
                onClick={() => router.push(`/cars?make=${encodeURIComponent(brand.name)}`)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-slate-50 group-hover:bg-white transition-colors">
                  <div className="w-12 h-12 text-slate-400 group-hover:text-blue-600 transition-colors">
                    {brandLogos[brand.name] ?? (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-bold text-sm">
                        {brand.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 text-center leading-tight">
                  {brand.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {brand.count.toLocaleString()} cars
                </span>
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
