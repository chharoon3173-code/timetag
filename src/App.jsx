import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import TrustBar from './components/TrustBar.jsx';
import Collections from './components/Collections.jsx';
import TimeTagEdit from './components/TimeTagEdit.jsx';
import FeaturedCollection from './components/FeaturedCollection.jsx';
import NewArrivals from './components/NewArrivals.jsx';
import BrandStory from './components/BrandStory.jsx';
import WhyTimeTag from './components/WhyTimeTag.jsx';
import Reviews from './components/Reviews.jsx';
import Newsletter from './components/Newsletter.jsx';
import Footer from './components/Footer.jsx';
import useWishlist from './hooks/useWishlist.js';

export default function App() {
  const wishlist = useWishlist();
  const bagCount = 2; // placeholder until a cart is wired up

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header wishlistCount={wishlist.count} bagCount={bagCount} />
      <main id="main">
        <Hero />
        <TrustBar />
        <Collections />
        <TimeTagEdit wishlist={wishlist} />
        <FeaturedCollection />
        <NewArrivals wishlist={wishlist} />
        <BrandStory />
        <WhyTimeTag />
        <Reviews />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
