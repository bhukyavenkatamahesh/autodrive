import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';

const POSTS = [
  {
    title: '5 things to check before buying a used car in India',
    excerpt: 'From RC verification to insurance transfer — a complete checklist for first-time buyers.',
    tag: 'Buying Guide', date: 'Apr 10, 2025', readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=70',
  },
  {
    title: 'Is an electric car worth it in 2025? We did the math',
    excerpt: 'Running costs, charging infrastructure, and resale value — the full picture.',
    tag: 'Electric Cars', date: 'Apr 3, 2025', readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=70',
  },
  {
    title: 'How AutoDrive\'s AI pricing model works',
    excerpt: 'Behind the scenes of our XGBoost model trained on 500,000+ Indian car transactions.',
    tag: 'Technology', date: 'Mar 25, 2025', readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=70',
  },
  {
    title: 'Top 10 most reliable used cars under ₹10 lakh',
    excerpt: 'Ranked by owner satisfaction, service cost, and parts availability across Indian cities.',
    tag: 'Rankings', date: 'Mar 18, 2025', readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=70',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <BookOpen size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">AutoDrive Blog</h1>
            <p className="text-slate-500">Car buying guides, industry insights, and AutoDrive news</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {POSTS.map(post => (
            <div key={post.title} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all">
              <Image src={post.image} alt="" width={600} height={176} className="w-full h-44 object-cover" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{post.tag}</span>
                  <span className="text-xs text-slate-400">{post.date} · {post.readTime}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5 leading-snug">{post.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{post.excerpt}</p>
                <Link href="#" className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:underline">
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
