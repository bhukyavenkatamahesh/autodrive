import { Bot, Shield, TrendingUp, Clock } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Search',
    description: 'Chat with our GPT-4o powered assistant to find your perfect car. Just describe what you want.',
    color: 'blue',
  },
  {
    icon: TrendingUp,
    title: 'Fair Price Guarantee',
    description: 'Our XGBoost ML model predicts fair market price so you never overpay. 94% accuracy.',
    color: 'violet',
  },
  {
    icon: Shield,
    title: 'Verified Cars',
    description: '200-point inspection on every car. Full service history and accident report included.',
    color: 'green',
  },
  {
    icon: Clock,
    title: 'Instant Test Drive',
    description: 'Book a test drive in 60 seconds. We come to your doorstep, no hassle.',
    color: 'orange',
  },
];

const colorMap: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600' },
  green: { bg: 'bg-green-50', icon: 'text-green-600' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
};

export default function WhyUs() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Why AutoDrive?</h2>
          <p className="text-slate-500">The smartest way to buy your next car</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => {
            const c = colorMap[f.color];
            const Icon = f.icon;
            return (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={22} className={c.icon} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
