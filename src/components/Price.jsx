import { formatPrice } from '../data/products.js';

/**
 * A watch's price: what the customer pays, then — if it's discounted — the original price crossed out.
 * e.g. "Rs. 2,499 R̶s̶.̶ ̶4̶,̶5̶0̶0̶". Set both in Admin → Inventory → Edit.
 */
export default function Price({ product }) {
  const was = product.originalPrice > product.price ? product.originalPrice : null;
  return (
    <>
      {formatPrice(product.price)}
      {was && (
        <>
          {' '}
          <s className="price-was">
            <span className="sr-only">Original price: </span>
            {formatPrice(was)}
          </s>
        </>
      )}
    </>
  );
}
