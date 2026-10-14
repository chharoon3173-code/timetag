import { useEffect, useMemo } from 'react';
import TimeTagEdit from '../components/TimeTagEdit.jsx';
import NotFound from './NotFound.jsx';
import { Arrow } from '../components/Icons.jsx';
import { useCollections, useShopProducts } from '../lib/store.js';
import { href } from '../lib/router.js';
import './CollectionPage.css';

/** One collection's page (#/collection/<id>): its logo and name, then only its watches. */
export default function CollectionPage({ id, wishlist }) {
  const collections = useCollections();
  const products = useShopProducts();
  const collection = collections.find((c) => c.id === id);
  const watches = useMemo(() => products.filter((p) => p.collectionId === id), [products, id]);

  useEffect(() => {
    if (collection) document.title = `${collection.title} — TimeTag`;
  }, [collection]);

  if (!collection) {
    return <NotFound title="Collection not found" text="This collection doesn’t exist or has been removed." />;
  }

  return (
    <>
      <section className="section--ivory cpage" aria-labelledby="cpage-title">
        <div className="container">
          <nav className="pp-crumbs cpage__crumbs" aria-label="Breadcrumb">
            <a href={href('/')}>Home</a><span aria-hidden="true">/</span>
            <a href="#collections">Collections</a><span aria-hidden="true">/</span>
            <span aria-current="page">{collection.title}</span>
          </nav>
          <div className="cpage__head">
            <span className="cpage__mark" aria-hidden="true">
              {collection.image ? <img src={collection.image} alt="" /> : collection.mark}
            </span>
            <div>
              <p className="eyebrow">Collection</p>
              <h1 id="cpage-title" className="display cpage__title">{collection.title}</h1>
            </div>
          </div>
        </div>
      </section>

      <TimeTagEdit
        wishlist={wishlist}
        products={watches}
        id="collection-watches"
        title="In this collection"
        className="cpage__grid"
        showCollection={false}
        empty={
          <div className="cpage__empty">
            <svg className="cpage__empty-icon" width="56" height="56" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <circle cx="24" cy="24" r="11" /><path d="M24 18v6l4 3" strokeLinecap="round" />
              <path d="M18 14l1.5-8h9L30 14M18 34l1.5 8h9L30 34" strokeLinejoin="round" />
            </svg>
            <h2>Watches in this collection are coming soon</h2>
            <p>We’re preparing new {collection.title} pieces. In the meantime, shop something else from TimeTag.</p>
            <div className="cpage__actions">
              <a href="#edit" className="btn btn--dark">Shop all watches <Arrow /></a>
              <a href="#collections" className="text-link">Browse other collections</a>
            </div>
          </div>
        }
      />
    </>
  );
}
