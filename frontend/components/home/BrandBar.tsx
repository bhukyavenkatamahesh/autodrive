'use client';
import { useRouter } from 'next/navigation';
import { brands } from '@/lib/mockData';

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
  return (
    <section className="py-10 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Browse by Brand</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {brands.map(brand => (
            <button
              key={brand.name}
              onClick={() => router.push(`/cars?make=${encodeURIComponent(brand.name)}`)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={brandLogos[brand.name]}
                  alt={brand.name}
                  className="w-10 h-10 object-contain grayscale group-hover:grayscale-0 transition-all"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600 text-center leading-tight">
                {brand.name.split(' ')[0]}
              </span>
              <span className="text-xs text-slate-400">{brand.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
