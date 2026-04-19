import Link from 'next/link';
import { Car, Shield, Sparkles, Users } from 'lucide-react';

const STATS = [
  { value: '10,000+', label: 'Cars Listed' },
  { value: '25,000+', label: 'Happy Buyers' },
  { value: '50+',     label: 'Cities' },
  { value: '98%',     label: 'Satisfaction Rate' },
];

const VALUES = [
  { icon: Sparkles, title: 'AI-Powered',   desc: 'Our ML model analyses millions of data points to give you a fair price estimate for every car.' },
  { icon: Shield,   title: 'Verified Cars', desc: 'Every listing goes through a 150-point inspection. What you see is exactly what you get.' },
  { icon: Users,    title: 'Buyer First',   desc: 'No hidden fees, no pushy sales. We make money only when you find your perfect car.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-violet-700 text-white py-20 px-4 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Car size={32} />
        </div>
        <h1 className="text-4xl font-black mb-4">About AutoDrive</h1>
        <p className="text-blue-200 max-w-xl mx-auto text-lg">
          India&apos;s most trusted AI-powered car marketplace, built by IIT Delhi students to make car buying transparent and smart.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
              <p className="text-3xl font-black text-blue-600 mb-1">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Buying a used car in India is broken. Prices are opaque, dealers are pushy, and buyers feel cheated. AutoDrive was born to fix that.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We combine machine learning price predictions, verified listings, and a seamless booking experience so every Indian can buy a car they love at a price that&apos;s fair.
          </p>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">What We Stand For</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/cars" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors">
            Browse Cars
          </Link>
        </div>
      </div>
    </div>
  );
}
