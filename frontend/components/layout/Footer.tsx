import Link from 'next/link';
import { Car } from 'lucide-react';

const BUY_LINKS = [
  { label: 'Used Cars',     href: '/cars' },
  { label: 'Electric Cars', href: '/cars?fuelType=Electric' },
  { label: 'SUVs',          href: '/cars?bodyType=SUV' },
  { label: 'Sedans',        href: '/cars?bodyType=Sedan' },
  { label: 'Hatchbacks',    href: '/cars?bodyType=Hatchback' },
  { label: 'Luxury Cars',   href: '/cars?minPrice=2000000' },
];

const TOOL_LINKS = [
  { label: 'AI Price Predictor', href: '/tools/valuation' },
  { label: 'EMI Calculator',     href: '/tools/emi-calculator' },
  { label: 'Compare Cars',       href: '/tools/compare' },
  { label: 'Car Valuation',      href: '/tools/valuation' },
  { label: 'AI Assistant',       href: '/chat' },
  { label: 'Test Drive',         href: '/cars' },
];

const COMPANY_LINKS = [
  { label: 'About Us',       href: '/about' },
  { label: 'Careers',        href: '/careers' },
  { label: 'Press',          href: '/press' },
  { label: 'Blog',           href: '/blog' },
  { label: 'Contact',        href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car size={16} className="text-white" />
              </div>
              <span className="text-lg font-black text-white">
                Auto<span className="text-blue-400">Drive</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              AI-powered car marketplace. Find your perfect car with smart pricing and intelligent recommendations.
            </p>
            <div className="flex gap-3">
              {['X', 'In', 'IG'].map(label => (
                <button key={label} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors text-xs font-bold">
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Buy */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Buy Cars</h4>
            <ul className="space-y-2 text-sm">
              {BUY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-blue-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Tools</h4>
            <ul className="space-y-2 text-sm">
              {TOOL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-blue-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-blue-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <Car size={11} className="text-white" />
            </div>
            <span className="text-slate-500">© 2025 <span className="text-white font-semibold">AutoDrive</span>. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <span>Built with</span>
            {['Next.js 14', 'FastAPI', 'PostgreSQL', 'Azure'].map((tech, i) => (
              <span key={tech} className="flex items-center gap-1">
                {i > 0 && <span>·</span>}
                <span className="text-slate-400">{tech}</span>
              </span>
            ))}
          </div>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
            <Link href="/about" className="hover:text-blue-400 transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
