import Link from 'next/link';
import { Bot, ArrowRight } from 'lucide-react';

export default function AICTABanner() {
  return (
    <section className="py-12 bg-gradient-to-r from-blue-600 to-violet-600">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Bot size={30} className="text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
          Not sure which car to buy?
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          Chat with AutoDrive AI — powered by GPT-4o. Tell it your budget, needs, and preferences. It'll find your perfect match.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/chat"
            className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-xl transition-colors"
          >
            <Bot size={18} />
            Chat with AI <ArrowRight size={16} />
          </Link>
          <Link
            href="/cars"
            className="flex items-center gap-2 border border-white/40 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Browse All Cars
          </Link>
        </div>
      </div>
    </section>
  );
}
