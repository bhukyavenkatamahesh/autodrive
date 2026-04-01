import Hero from '@/components/home/Hero';
import BrandBar from '@/components/home/BrandBar';
import FeaturedCars from '@/components/home/FeaturedCars';
import WhyUs from '@/components/home/WhyUs';
import AICTABanner from '@/components/home/AICTABanner';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <BrandBar />
      <FeaturedCars />
      <WhyUs />
      <AICTABanner />
    </main>
  );
}
