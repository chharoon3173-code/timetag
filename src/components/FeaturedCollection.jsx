import './FeaturedCollection.css';

// A full-width decorative band: a close-up photo of a watch dial (public/brand/feature-watch.jpg).
// To change it, replace that file with another square photo (dial in the middle).
export default function FeaturedCollection() {
  return (
    <section className="feature" aria-hidden="true">
      <div className="feature__media">
        <img className="feature__photo" src="brand/feature-watch.jpg" alt="" loading="lazy" />
        <div className="feature__vignette" />
      </div>
    </section>
  );
}
