// All site content lives here — edit names, prices and images in one place.
//
// Each product has a `watch` style used by the <Watch /> drawing.
// When you have real photography, set `image: '/images/your-photo.png'`
// (put the file in /public/images) and it will be shown instead of the drawing.

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

// NOTE: names (other than Chronograph X1) and prices are placeholders.
export const PRODUCTS = [
  {
    id: 'chronograph-x1',
    name: 'TimeTag Chronograph X1',
    collection: 'Chronographs',
    badge: 'Best Seller',
    description: 'Precision engineered for those who make every second count.',
    price: 64999,
    stock: 8,                 // starting stock (admin can change it)
    rating: 5,
    gender: ['men'],
    tags: ['best'],
    watch: WATCH_STYLES.steelChrono,
    image: null,
  },
  {
    id: 'heritage-classique',
    name: 'Heritage Classique',
    collection: 'The Classics',
    badge: 'Best Seller',
    description: 'Ivory dial and warm gold — the quiet confidence of a classic.',
    price: 58500,
    stock: 5,                 // starting stock (admin can change it)
    rating: 5,
    gender: ['women', 'men'],
    tags: ['best'],
    watch: WATCH_STYLES.heritageGold,
    image: null,
  },
  {
    id: 'meridian-automatic',
    name: 'Meridian Automatic',
    collection: 'Modern Icons',
    badge: 'New Arrival',
    description: 'A midnight dial that reads like a clear night sky.',
    price: 72000,
    stock: 12,                 // starting stock (admin can change it)
    rating: 5,
    gender: ['men', 'women'],
    tags: ['new'],
    watch: WATCH_STYLES.midnight,
    image: null,
  },
  {
    id: 'aurelia-34',
    name: 'Aurelia 34',
    collection: 'Everyday Essentials',
    badge: 'New Arrival',
    description: 'Champagne warmth, sized for a refined wrist.',
    price: 46999,
    stock: 3,                 // starting stock (admin can change it)
    rating: 5,
    gender: ['women'],
    tags: ['new'],
    watch: WATCH_STYLES.champagne,
    image: null,
  },
  {
    id: 'noir-chronograph',
    name: 'Noir Chronograph',
    collection: 'Chronographs',
    badge: 'Best Seller',
    description: 'Blacked-out steel with gold detailing, made for after dark.',
    price: 54999,
    stock: 10,                 // starting stock (admin can change it)
    rating: 5,
    gender: ['men'],
    tags: ['best', 'new'],
    watch: WATCH_STYLES.noir,
    image: null,
  },
  {
    id: 'verdant-gmt',
    name: 'Verdant GMT',
    collection: 'Modern Icons',
    badge: 'New Arrival',
    description: 'Forest-green dial, gold case, two time zones at a glance.',
    price: 89000,
    stock: 4,                 // starting stock (admin can change it)
    rating: 5,
    gender: ['men', 'women'],
    tags: ['new', 'best'],
    watch: WATCH_STYLES.verdant,
    image: null,
  },
];

export const FILTERS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'men', label: "Men's", test: (p) => p.gender.includes('men') },
  { key: 'women', label: "Women's", test: (p) => p.gender.includes('women') },
  { key: 'best', label: 'Best Sellers', test: (p) => p.tags.includes('best') },
  { key: 'new', label: 'New Arrivals', test: (p) => p.tags.includes('new') },
];

export const NEW_ARRIVAL_IDS = ['meridian-automatic', 'aurelia-34', 'verdant-gmt', 'noir-chronograph'];

export const COLLECTIONS = [
  { id: 'classics', number: '01', title: 'The Classics', description: 'Traditional elegance, refined over generations of style.', tone: 'amber', size: 'large', watch: WATCH_STYLES.heritageGold },
  { id: 'modern', number: '02', title: 'Modern Icons', description: 'Contemporary design with a confident presence.', tone: 'navy', size: 'medium', watch: WATCH_STYLES.midnight },
  { id: 'chrono', number: '03', title: 'Chronographs', description: 'Sporty precision, sophisticated finish.', tone: 'graphite', size: 'medium', watch: WATCH_STYLES.steelChrono },
  { id: 'everyday', number: '04', title: 'Everyday Essentials', description: 'Versatile watches for every day and every occasion.', tone: 'bronze', size: 'large', watch: WATCH_STYLES.champagne },
];

// Brand tiles in the home page "Shop by Collection" row.
// `mark` is the monogram shown in the circle. To show a logo image instead, put the file in
// /public/brand/collections/ and set `image: 'brand/collections/your-file.png'`.
export const BRAND_COLLECTIONS = [
  { id: 'rolex', title: 'Rolex', mark: 'R', image: 'brand/collections/rolex.png' },
  { id: 'patek-philippe', title: 'Patek Philippe', mark: 'PP', image: 'brand/collections/patek-philippe.png' },
  { id: 'hublot', title: 'Hublot', mark: 'H', image: 'brand/collections/hublot.png' },
  { id: 'cartier', title: 'Cartier', mark: 'C', image: 'brand/collections/cartier.png' },
  { id: 'bestwin', title: 'Bestwin', mark: 'B', image: 'brand/collections/bestwin.png' },
  { id: 'automatic', title: 'Automatic Watches', mark: 'A', image: 'brand/collections/automatic.png' },
  { id: 'master-grade', title: 'Master Grade', mark: 'MG', image: 'brand/collections/master-grade.png' },
];

// Placeholder testimonials — replace with real, verified customer reviews before launch.
export const REVIEWS = [
  { id: 1, quote: 'The weight on the wrist, the finish on the case — it feels far beyond what I paid. I have stopped reaching for anything else.', name: '[Customer name]', initial: 'C', product: 'Chronograph X1', rating: 5 },
  { id: 2, quote: 'It arrived in a box that felt like an occasion in itself. A gift for my father — he hasn’t taken it off since.', name: '[Customer name]', initial: 'C', product: 'Heritage Classique', rating: 5 },
  { id: 3, quote: 'Understated enough for the office, sharp enough for the evening. Exactly the watch I had been looking for.', name: '[Customer name]', initial: 'C', product: 'Meridian Automatic', rating: 5 },
];

export const formatPrice = (amount) => `Rs. ${amount.toLocaleString('en-PK')}`;
