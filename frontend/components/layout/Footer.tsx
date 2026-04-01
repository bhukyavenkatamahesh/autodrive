import Link from 'next/link';
import { Car, Globe, Share2, ExternalLink } from 'lucide-react';
const SocialIcons = [Globe, Share2, ExternalLink];

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
              {SocialIcons.map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Buy */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Buy Cars</h4>
            <ul className="space-y-2 text-sm">
              {['Used Cars', 'Electric Cars', 'SUVs', 'Sedans', 'Hatchbacks', 'Luxury Cars'].map(item => (
                <li key={item}>
                  <Link href="/cars" className="hover:text-blue-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Tools</h4>
            <ul className="space-y-2 text-sm">
              {['AI Price Predictor', 'EMI Calculator', 'Compare Cars', 'Car Valuation', 'AI Assistant', 'Test Drive'].map(item => (
                <li key={item}>
                  <Link href="/chat" className="hover:text-blue-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              {['About Us', 'Careers', 'Press', 'Blog', 'Contact', 'Privacy Policy'].map(item => (
                <li key={item}>
                  <Link href="/" className="hover:text-blue-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs">
          <p>© 2025 AutoDrive. Built with Next.js 14 + Azure OpenAI.</p>
          <p>Ashad Alam • Pritam Maji • Samarth Agrawal • Venkata Mahesh</p>
        </div>
      </div>
    </footer>
  );
}
