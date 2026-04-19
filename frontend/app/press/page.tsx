import { Newspaper } from 'lucide-react';

const COVERAGE = [
  { outlet: 'YourStory',      date: 'Mar 2025', headline: 'AutoDrive uses AI to bring price transparency to India\'s used car market',    tag: 'Featured' },
  { outlet: 'Economic Times', date: 'Feb 2025', headline: 'IIT Delhi startup AutoDrive raises seed round, aims to list 1 lakh cars',        tag: 'Funding' },
  { outlet: 'Inc42',          date: 'Jan 2025', headline: 'Meet the team disrupting India\'s ₹3.5 lakh crore used car industry',            tag: 'Profile' },
  { outlet: 'The Hindu',      date: 'Dec 2024', headline: 'How machine learning is making car valuation fairer for Indian buyers',           tag: 'Technology' },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 py-16 px-4 text-center">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Newspaper size={28} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Press & Media</h1>
        <p className="text-slate-500 max-w-md mx-auto">AutoDrive in the news. For press enquiries contact <span className="text-blue-600">press@autodrive.in</span></p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {COVERAGE.map(item => (
            <div key={item.headline} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-slate-900 text-sm">{item.outlet}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{item.tag}</span>
                  </div>
                  <p className="text-slate-700">{item.headline}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{item.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-slate-900 text-white rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-2">Press Kit</h2>
          <p className="text-slate-400 text-sm mb-4">Download logos, product screenshots, and founder bios.</p>
          <button className="bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition-colors">
            Download Press Kit
          </button>
        </div>
      </div>
    </div>
  );
}
