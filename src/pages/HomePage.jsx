import { useEffect } from 'react';
import Hero from '../components/Hero.jsx';
import Collections from '../components/Collections.jsx';
import TimeTagEdit from '../components/TimeTagEdit.jsx';
import FeaturedCollection from '../components/FeaturedCollection.jsx';
import SignatureCollection from '../components/SignatureCollection.jsx';
import CustomerReviews from '../components/CustomerReviews.jsx';
import WhyChooseUs from '../components/WhyChooseUs.jsx';
import Newsletter from '../components/Newsletter.jsx';
import { useShopProducts, useSignatureProducts } from '../lib/store.js';

export default function HomePage({ wishlist }) {
  const products = useShopProducts();
  // Signature Collection = the 4 watches picked in Admin → Collections (first 4 Best Sellers if none picked).
  const signature = useSignatureProducts();

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
      <CustomerReviews />
      <WhyChooseUs />
      <Newsletter />
    </>
  );
}
