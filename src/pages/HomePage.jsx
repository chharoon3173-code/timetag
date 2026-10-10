import { useEffect } from 'react';
import Hero from '../components/Hero.jsx';
import TrustBar from '../components/TrustBar.jsx';
import Collections from '../components/Collections.jsx';
import TimeTagEdit from '../components/TimeTagEdit.jsx';
import FeaturedCollection from '../components/FeaturedCollection.jsx';
import NewArrivals from '../components/NewArrivals.jsx';
import BrandStory from '../components/BrandStory.jsx';
import WhyTimeTag from '../components/WhyTimeTag.jsx';
import Reviews from '../components/Reviews.jsx';
import Newsletter from '../components/Newsletter.jsx';
import { useShopProducts } from '../lib/store.js';
import { NEW_ARRIVAL_IDS } from '../data/products.js';

export default function HomePage({ wishlist }) {
  const products = useShopProducts();
  const newArrivals = NEW_ARRIVAL_IDS.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  useEffect(() => {
    document.title = 'TimeTag — More Than Just Time';
  }, []);

  return (
    <>
      <Hero />
      <TrustBar />
      <Collections />
      <TimeTagEdit wishlist={wishlist} products={products} />
      <FeaturedCollection />
      <NewArrivals wishlist={wishlist} items={newArrivals} />
      <BrandStory />
      <WhyTimeTag />
      <Reviews />
      <Newsletter />
    </>
  );
}
