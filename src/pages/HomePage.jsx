import { useEffect } from 'react';
import Hero from '../components/Hero.jsx';
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
  // Watches added in the admin and tagged "new" come first, then the default picks.
  const newArrivals = [
    ...products.filter((p) => p.custom && p.tags.includes('new')),
    ...NEW_ARRIVAL_IDS.map((id) => products.find((p) => p.id === id)).filter(Boolean),
  ]
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 4);

  useEffect(() => {
    document.title = 'TimeTag — More Than Just Time';
  }, []);

  return (
    <>
      <Hero />
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
