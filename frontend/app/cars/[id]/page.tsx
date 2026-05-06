'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin, Gauge, Fuel, Settings, Star, Users,
  Calendar, TrendingUp, Bot, Phone,
  ChevronLeft, ChevronRight, Sparkles, CheckCircle, Trash2,
} from 'lucide-react';
import { getCarById, getCars, getReviews, postReview, deleteReview, predictPrice } from '@/lib/api';
import type { ReviewsResponse, PricePrediction } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { Car } from '@/lib/types';
import CarCard from '@/components/cars/CarCard';
import BookingModal from '@/components/booking/BookingModal';
import { useAuth } from '@/lib/authContext';

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'bg-green-100 text-green-700',
  negative: 'bg-red-100 text-red-700',
  neutral: 'bg-slate-100 text-slate-600',
};

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user, token } = useAuth();

  const [car, setCar] = useState<Car | null>(null);
  const [similar, setSimilar] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [booked, setBooked] = useState(false);

  const [mlPrediction, setMlPrediction] = useState<PricePrediction | null>(null);
  const [mlLoading, setMlLoading] = useState(false);

  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setLoading(true);
    getCarById(id)
      .then(carData => {
        setCar(carData);
        if (carData) {
          setMlLoading(true);
          predictPrice({
            make: carData.make,
            model: carData.model,
            year: carData.year,
            mileage: carData.mileage,
            fuelType: carData.fuelType,
            location: carData.location,
          })
            .then(setMlPrediction)
            .catch(() => {})
            .finally(() => setMlLoading(false));
          getCars({ make: carData.make, limit: 12 })
            .then(r => setSimilar(r.cars.filter(c => c.id !== id).slice(0, 3)))
            .catch(() => {});
          getReviews(id)
            .then(setReviewsData)
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePostReview(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !newComment.trim()) return;
    setSubmitting(true);
    setReviewError('');
    try {
      const review = await postReview(id, newRating, newComment.trim(), token);
      setReviewsData(prev => prev ? {
        ...prev,
        reviews: [review, ...prev.reviews],
        total: prev.total + 1,
        averageRating: Math.round(
          ((prev.averageRating * prev.total) + review.rating) / (prev.total + 1) * 10
        ) / 10,
      } : { reviews: [review], averageRating: review.rating, total: 1 });
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!token) return;
    try {
      await deleteReview(reviewId, token);
      setReviewsData(prev => prev ? {
        ...prev,
        reviews: prev.reviews.filter(r => r.id !== reviewId),
        total: prev.total - 1,
      } : prev);
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-6xl">🚗</p>
        <h2 className="text-2xl font-bold text-slate-800">Car not found</h2>
        <Link href="/cars" className="text-blue-600 hover:underline">Browse all cars</Link>
      </div>
    );
  }

  const images = car.images?.length ? car.images : [car.image];
  const liveMlPrice = mlPrediction?.predictedPrice ?? car.mlPrice;
  const priceDiff = liveMlPrice ? liveMlPrice - car.price : 0;
  const isDeal = priceDiff > 0;

  const specs = [
    { label: 'Year', value: car.year, icon: Calendar },
    { label: 'Mileage', value: `${car.mileage.toLocaleString()} km`, icon: Gauge },
    { label: 'Fuel', value: car.fuelType, icon: Fuel },
    { label: 'Transmission', value: car.transmission, icon: Settings },
    { label: 'Owners', value: `${car.owners} Owner${car.owners > 1 ? 's' : ''}`, icon: Users },
    { label: 'Location', value: car.location, icon: MapPin },
    ...(car.engineCC ? [{ label: 'Engine', value: `${car.engineCC} cc`, icon: Settings }] : []),
    ...(car.seating ? [{ label: 'Seating', value: `${car.seating} Seats`, icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/cars" className="hover:text-blue-600">Used Cars</Link>
          <span>/</span>
          <span className="text-slate-800">{car.year} {car.make} {car.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Images + Specs */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
              <div className="relative h-80 md:h-96 bg-slate-100">
                <Image
                  src={images[activeImg] || 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80'}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-blue-500' : 'border-transparent'}`}
                    >
                      <Image src={img} alt="" width={64} height={48} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specs grid */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 mb-4">Car Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specs.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
                      <Icon size={18} className="text-blue-600 mb-2" />
                      <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{s.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 mb-3">About this car</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{car.description}</p>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Key Features</h3>
                <div className="flex flex-wrap gap-2">
                  {car.features.map(f => (
                    <div key={f} className="flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full">
                      <CheckCircle size={13} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Price analysis — always shown, fetched live from ML service */}
            {(mlLoading || liveMlPrice) && (
              <div className={`rounded-2xl border p-5 ${mlLoading ? 'bg-slate-50 border-slate-200' : isDeal ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className={mlLoading ? 'text-slate-400' : isDeal ? 'text-green-600' : 'text-orange-600'} />
                  <h3 className={`font-bold ${mlLoading ? 'text-slate-500' : isDeal ? 'text-green-800' : 'text-orange-800'}`}>
                    AI Price Analysis
                  </h3>
                  <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full text-slate-600">ML Model</span>
                </div>
                {mlLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-slate-200 rounded w-2/5" />
                    <div className="h-4 bg-slate-200 rounded w-3/5" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-3xl font-black text-slate-900">{formatPrice(car.price)}</span>
                      <span className="text-slate-500 text-sm">Listed Price</span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-semibold ${isDeal ? 'text-green-700' : 'text-orange-700'}`}>
                      <TrendingUp size={15} />
                      AI Fair Value: {formatPrice(liveMlPrice!)}
                      <span className="font-normal text-slate-500">
                        ({isDeal
                          ? `₹${priceDiff.toLocaleString('en-IN')} below market`
                          : `₹${Math.abs(priceDiff).toLocaleString('en-IN')} above market`})
                      </span>
                    </div>
                    {mlPrediction && (
                      <p className="text-xs text-slate-500 mt-1">
                        Confidence range: {formatPrice(mlPrediction.confidenceLow)} – {formatPrice(mlPrediction.confidenceHigh)}
                      </p>
                    )}
                    <p className={`text-xs mt-2 ${isDeal ? 'text-green-600' : 'text-orange-600'}`}>
                      {isDeal ? 'This is a good deal! Below fair market value.' : 'Priced above fair market value. You may negotiate.'}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">
                  Reviews
                  {reviewsData && reviewsData.total > 0 && (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      ({reviewsData.total}) · ⭐ {reviewsData.averageRating}
                    </span>
                  )}
                </h3>
              </div>

              {/* Post review form */}
              {user ? (
                <form onSubmit={handlePostReview} className="mb-6 p-4 bg-slate-50 rounded-xl space-y-3">
                  <p className="text-sm font-medium text-slate-700">Write a review</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNewRating(n)}
                        className="p-0.5"
                      >
                        <Star
                          size={22}
                          className={n <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-300'}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Share your experience with this car..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {submitting ? 'Posting…' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="mb-5 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  <Link href="/login" className="font-semibold hover:underline">Log in</Link> to write a review.
                </div>
              )}

              {/* Reviews list */}
              {reviewsData && reviewsData.reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviewsData.reviews.map(r => (
                    <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                            {r.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{r.user.name}</p>
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} size={11} className={i <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SENTIMENT_COLORS[r.sentiment] ?? SENTIMENT_COLORS.neutral}`}>
                            {r.sentiment}
                          </span>
                          {user && (user.id === r.user.id || user.role === 'admin') && (
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete review"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.comment}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Right: Price + Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {car.year} {car.make} {car.model}
                </h2>
              </div>

              {car.rating && (
                <div className="flex items-center gap-1.5 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14} className={i <= Math.floor(car.rating!) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                  ))}
                  <span className="text-sm text-slate-500">({car.reviews} reviews)</span>
                </div>
              )}

              <p className="text-3xl font-black text-blue-600 mb-1">{formatPrice(car.price)}</p>
              {isDeal && (
                <span className="inline-block text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full mb-4">
                  Good Deal — Below Market Value
                </span>
              )}

              <div className="flex gap-2 text-xs text-slate-500 mb-5">
                <span className="flex items-center gap-1"><Gauge size={12} />{car.mileage.toLocaleString()} km</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{car.location}</span>
              </div>

              {booked ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                  <p className="font-bold text-slate-900 mb-1">Test Drive Booked!</p>
                  <p className="text-sm text-slate-500">
                    We&apos;ll call you within 2 hours to confirm the slot.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:underline"
                  >
                    View my bookings →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setBookingOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Book Test Drive
                  </button>
                  <Link
                    href="/chat"
                    className="w-full flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-colors"
                  >
                    <Bot size={16} />
                    Ask AI About This Car
                  </Link>
                  <button className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-colors text-sm">
                    <Phone size={15} />
                    Contact Seller
                  </button>
                </div>
              )}

              <p className="text-xs text-slate-400 text-center mt-3">Free • No obligation • Cancel anytime</p>
            </div>
          </div>
        </div>

        <BookingModal
          carId={car.id}
          carLabel={`${car.year} ${car.make} ${car.model}`}
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          onSuccess={() => setBooked(true)}
        />

        {/* Similar cars */}
        {similar.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Similar {car.make} Cars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map(c => <CarCard key={c.id} car={c} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
