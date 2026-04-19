import Link from 'next/link';
import { Briefcase, MapPin, Clock } from 'lucide-react';

const JOBS = [
  { title: 'Senior Frontend Engineer',    team: 'Engineering',  location: 'Delhi / Remote', type: 'Full-time' },
  { title: 'ML Engineer — Pricing',       team: 'AI/ML',        location: 'Bangalore',      type: 'Full-time' },
  { title: 'Product Manager',             team: 'Product',      location: 'Delhi',           type: 'Full-time' },
  { title: 'Backend Engineer (FastAPI)',   team: 'Engineering',  location: 'Remote',          type: 'Full-time' },
  { title: 'Growth & Marketing Lead',     team: 'Marketing',    location: 'Mumbai',          type: 'Full-time' },
  { title: 'UX Designer',                 team: 'Design',       location: 'Remote',          type: 'Contract' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-black mb-4">Join AutoDrive</h1>
        <p className="text-slate-300 max-w-lg mx-auto text-lg">
          Help us build the future of car buying in India. We&apos;re a small, fast-moving team backed by IIT Delhi.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Open Positions</h2>
        <div className="space-y-4">
          {JOBS.map(job => (
            <div key={job.title} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start justify-between gap-4 hover:border-blue-200 transition-colors">
              <div>
                <p className="font-bold text-slate-900">{job.title}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Briefcase size={12} />{job.team}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{job.type}</span>
                </div>
              </div>
              <Link href="/contact" className="flex-shrink-0 text-sm font-semibold text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                Apply
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
          <p className="font-bold text-slate-900 mb-1">Don&apos;t see a fit?</p>
          <p className="text-sm text-slate-600 mb-4">We&apos;re always looking for talented people. Drop us a line.</p>
          <Link href="/contact" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
