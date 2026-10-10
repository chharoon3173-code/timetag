import { HeartIcon } from './Icons.jsx';

export default function HeartButton({ product, wishlist, light = false, size = 18 }) {
  const active = wishlist.has(product.id);
  return (
    <button
      type="button"
      className={`heart-btn${active ? ' is-active' : ''}${light ? ' heart-btn--light' : ''}`}
      aria-pressed={active}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      onClick={() => wishlist.toggle(product.id)}
    >
      <HeartIcon size={size} sw={1.4} filled={active} />
    </button>
  );
}
