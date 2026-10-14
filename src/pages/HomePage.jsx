import { useEffect } from 'react';
import Hero from '../components/Hero.jsx';
import Collections from '../components/Collections.jsx';
import TimeTagEdit from '../components/TimeTagEdit.jsx';
import FeaturedCollection from '../components/FeaturedCollection.jsx';
import SignatureCollection from '../components/SignatureCollection.jsx';
import BrandStory from '../components/BrandStory.jsx';
import WhyTimeTag from '../components/WhyTimeTag.jsx';
import Reviews from '../components/Reviews.jsx';
import Newsletter from '../components/Newsletter.jsx';
import { useShopProducts } from '../lib/store.js';

export default function HomePage({ wishlist }) {
  const products = useShopProducts();
  // Signature Collection = watches tagged "Best Sellers" in the admin (all watches if fewer than 3), max 8.
  const bestSellers = products.filter((p) => p.tags.includes('best'));
  const signature = (bestSellers.length >= 3 ? bestSellers : products).slice(0, 8);

  useEffect(() => {
    document.title = 'TimeTag — More Than Just Time';
  }, []);

  return (
    <>
      <Hero />
      <Collections />
      <TimeTagEdit wishlist={wishlist} products={products} />
      <FeaturedCollection />
      <SignatureCollection products={signature} />
      <BrandStory />
      <WhyTimeTag />
      <Reviews />
      <Newsletter />
    </>
  );
}
