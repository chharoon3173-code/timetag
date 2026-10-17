import { useCatalog } from '../lib/store.js';
import { match, useRoute } from '../lib/router.js';
import { CHAT_WHATSAPP } from '../data/products.js';
import './WhatsAppButton.css';

/** WhatsApp chat link: 03… becomes 923…, with a message already typed in. */
const chatLink = (message) =>
  `https://wa.me/${CHAT_WHATSAPP.replace(/\D/g, '').replace(/^0/, '92')}?text=${encodeURIComponent(message)}`;

/**
 * Floating green WhatsApp button, bottom-right of the shop pages (see App.jsx).
 * On a watch's page the message names that watch, so you know what the customer is asking about.
 */
export default function WhatsAppButton() {
  const { path } = useRoute();
  const catalog = useCatalog();
  const onProduct = match('/product/:id', path);
  const watch = onProduct && catalog.find((p) => p.id === onProduct.id);
  const message = watch
    ? `Hi TimeTag! I'm interested in the ${watch.name}: ${window.location.href}`
    : 'Hi TimeTag! I have a question about your watches.';

  return (
    <a className="wa-float" href={chatLink(message)} target="_blank" rel="noreferrer" aria-label="Chat with TimeTag on WhatsApp">
      <span className="wa-float__label" aria-hidden="true">Chat with us</span>
      <span className="wa-float__btn">
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false">
          {/* speech bubble */}
          <path d="M12 3.1a8.9 8.9 0 0 0-7.7 13.4L3.1 20.9l4.5-1.2A8.9 8.9 0 1 0 12 3.1Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          {/* phone handset */}
          <path d="M9.3 7.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3l-1.8-.9c-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.8-.2-.3 0-.4.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.8-2.1Z" fill="currentColor" />
        </svg>
      </span>
    </a>
  );
}
