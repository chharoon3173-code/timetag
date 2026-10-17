// Site content that isn't in the database: watch drawing styles, default bar text, filters,
// the review screenshots, payment accounts, and the price format.
//
// Each watch has a drawing style (`watchStyle`) from WATCH_STYLES, used by <Watch /> until
// it has photos — pick it in Admin → Inventory → Edit.

export const WATCH_STYLES = {
  steelChrono: {
    caseA: '#5c5e63', caseB: '#f2f2f3', caseC: '#a4a6aa', bezel: '#0d0d0e',
    dialA: '#2c2c30', dialB: '#060607', strapA: '#111111', strapB: '#2c2824',
    accent: '#C9A96E', ticks: '#dcd6c9', hands: '#EFE9DC',
    chronograph: true, bracelet: false,
  },
  heritageGold: {
    caseA: '#86662f', caseB: '#f4ddab', caseC: '#b8914f', bezel: '#a8823f',
    dialA: '#fbf6ea', dialB: '#ddd2bc', strapA: '#3a2417', strapB: '#5e3d28',
    accent: '#8a6a35', ticks: '#3a332a', hands: '#241e17',
    chronograph: false, bracelet: false,
  },
  midnight: {
    caseA: '#5c5e63', caseB: '#f2f2f3', caseC: '#a4a6aa', bezel: '#161c2a',
    dialA: '#283552', dialB: '#080b13', strapA: '#6c6e73', strapB: '#e0e1e3',
    accent: '#C9A96E', ticks: '#d3d7e0', hands: '#EFE9DC',
    chronograph: false, bracelet: true,
  },
  champagne: {
    caseA: '#6a6c71', caseB: '#f4f4f5', caseC: '#b0b2b6', bezel: '#c9b68e',
    dialA: '#f1dfb6', dialB: '#a98a5c', strapA: '#6c6e73', strapB: '#e0e1e3',
    accent: '#5a4426', ticks: '#3f3220', hands: '#2b2116',
    chronograph: false, bracelet: true,
  },
  noir: {
    caseA: '#141415', caseB: '#525255', caseC: '#2a2a2c', bezel: '#09090a',
    dialA: '#222224', dialB: '#050505', strapA: '#0d0d0d', strapB: '#1f1f20',
    accent: '#C9A96E', ticks: '#C9A96E', hands: '#D8BC86',
    chronograph: true, bracelet: false,
  },
  verdant: {
    caseA: '#86662f', caseB: '#f4ddab', caseC: '#b8914f', bezel: '#15231c',
    dialA: '#28402f', dialB: '#06100a', strapA: '#1c1712', strapB: '#3c2d20',
    accent: '#E4CC9A', ticks: '#E4CC9A', hands: '#F4EFE6',
    chronograph: false, bracelet: false,
  },
};

// The watches themselves now live in the database (Supabase): add and edit them in
// Admin → Inventory. The 6 demo watches are created by supabase/setup.sql.

// The sliding gold bar above the header. Change it in Admin → Settings; this is the default text.
export const DEFAULT_ANNOUNCEMENTS = [
  'Free shipping on all orders',
  '100% authentic — guaranteed genuine',
  'Easy, hassle-free returns',
  'Secure payments — encrypted checkout',
];

// Category filters (not shown on the site yet — kept for the planned "Shop ▾" menu).
export const FILTERS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'men', label: "Men's", test: (p) => p.gender.includes('men') },
  { key: 'women', label: "Women's", test: (p) => p.gender.includes('women') },
  { key: 'best', label: 'Best Sellers', test: (p) => p.tags.includes('best') },
  { key: 'new', label: 'New Arrivals', test: (p) => p.tags.includes('new') },
];

// Collections (Rolex, Cartier…) also live in the database: manage them in Admin → Collections.
// The starting 7 are created by supabase/setup.sql; their logos are in /public/brand/collections/.

// Real WhatsApp reviews for the "Hear From Our Happy Customers" slider (images in /public/reviews).
// Customers' full names and profile photos are blurred in the images.
// `alt` describes each screenshot for people using screen readers (and for search engines).
// To add one: put the screenshot in /public/reviews and add a line below.
export const CUSTOMER_REVIEWS = [
  { id: 1, image: 'reviews/review-01.jpg', alt: 'WhatsApp review with a video of a watch in its box: “Absolute perfection! This watch exceeded all my expectations. The quality is truly amazing and top-notch, 10/10 in every aspect. Highly recommended to anyone looking for a premium watch!”' },
  { id: 2, image: 'reviews/review-02.jpg', alt: 'WhatsApp review with a photo of a silver watch in a wooden box: “Five stars. Excellent quality! The watch looks exactly as shown in the pictures. Great design, comfortable to wear, and worth the price. Fast delivery and satisfied with the purchase. Highly recommended!”' },
  { id: 3, image: 'reviews/review-03.jpg', alt: 'WhatsApp review in Roman Urdu with a photo of a green-dial watch in its box. The customer says the parcel arrived, it was exactly the watch and colour shown in the video, and the price is very fair for the quality.' },
  { id: 4, image: 'reviews/review-04.jpg', alt: 'WhatsApp review with a photo of a steel watch on its box: “Received brother. Good quality as I expected. Thanks.”' },
  { id: 5, image: 'reviews/review-05.jpg', alt: 'WhatsApp review in Roman Urdu with a photo of a square silver watch in its box. The customer says the parcel arrived and the quality is very good for the price.' },
  { id: 6, image: 'reviews/review-06.jpg', alt: 'WhatsApp review with a photo of a rose-gold watch in its box. The customer says it is a very beautiful watch and they really like it.' },
  { id: 7, image: 'reviews/review-07.jpg', alt: 'WhatsApp review with two photos of a silver watch: “Received. As always top notch quality.”' },
  { id: 8, image: 'reviews/review-08.jpg', alt: 'WhatsApp review in Roman Urdu with a photo of a watch and accessories. The customer says the quality is very good, they are delighted, and they are now a regular customer.' },
  { id: 9, image: 'reviews/review-09.jpg', alt: 'WhatsApp review in Urdu with a photo of two watches and accessories. The customer says the parcel arrived, the items are very nice and the quality is very good.' },
  { id: 10, image: 'reviews/review-10.jpg', alt: 'WhatsApp messages in Roman Urdu from a customer who gave the watch to a friend as a gift and says it was an outclass watch.' },
];

// Where customers send the money when they choose "Bank transfer" at checkout.
// Shown at checkout and on the thank-you page — edit here to change both.
export const PAYMENT_ACCOUNTS = [
  { name: 'Bank Alfalah', rows: [['Account title', 'Muhammad Haroon Rafiq'], ['Account number', '58385002453845']] },
  { name: 'JazzCash', rows: [['Account title', 'Muhammad Haroon Rafiq'], ['Mobile number', '03101743278']] },
];

// Customers send their payment screenshot to this WhatsApp number.
export const PAYMENT_WHATSAPP = '03060752710';

// The floating green WhatsApp button on the shop pages opens a chat with this number.
export const CHAT_WHATSAPP = '03060752710';

export const formatPrice = (amount) => `Rs. ${amount.toLocaleString('en-PK')}`;
