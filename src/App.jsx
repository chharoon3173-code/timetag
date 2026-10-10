import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ThankYouPage from './pages/ThankYouPage.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminApp from './admin/AdminApp.jsx';
import useWishlist from './hooks/useWishlist.js';
import { match, useRoute } from './lib/router.js';
import { openCart, useCart } from './lib/store.js';

export default function App() {
  const { path, anchor } = useRoute();
  const wishlist = useWishlist();
  const { count } = useCart();

  // Scroll to top on page change, or to a section when a #anchor link is used.
  useEffect(() => {
    if (anchor) {
      requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView());
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [path, anchor]);

  if (path === '/admin') return <AdminApp />;

  let params;
  if ((params = match('/checkout', path))) return <CheckoutPage />;
  if ((params = match('/thank-you/:id', path))) return <ThankYouPage id={params.id} />;

  let page;
  if (path === '/') page = <HomePage wishlist={wishlist} />;
  else if ((params = match('/product/:id', path))) page = <ProductPage key={params.id} id={params.id} wishlist={wishlist} />;
  else page = <NotFound />;

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header wishlistCount={wishlist.count} bagCount={count} onBagClick={openCart} />
      <main id="main">{page}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
