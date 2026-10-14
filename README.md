# TimeTag — Luxury Watch Store (React + Vite)

A premium e-commerce homepage for the TimeTag watch brand, built with **React**, **HTML** and **plain CSS** (no UI framework).

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install      # first time only
npm run dev      # start the dev server → open the URL it prints (usually http://localhost:5173)
npm run build    # production build into /dist
npm run preview  # preview the production build
```

## Project structure

```
timetag/
├── index.html                 # page shell, fonts, meta tags
├── public/
│   ├── favicon.png, apple-touch-icon.png
│   ├── brand/                 # lion + wordmark logos, hero.jpg, collections/ (brand tile logos)
│   └── reviews/               # WhatsApp review screenshots (names blurred)
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # puts all the sections together
    ├── index.css              # colours, fonts, buttons, shared styles
    ├── data/products.js       # ← products, prices, brand tiles, review list (edit here)
    ├── hooks/useWishlist.js   # wishlist state, saved in the browser
    ├── lib/store.js           # cart, orders, stock (swap for a database later)
    ├── lib/auth.js            # admin login
    ├── lib/router.js          # page routing (#/product/…, #/checkout, …)
    ├── pages/                 # HomePage, ProductPage, CollectionPage, CheckoutPage, ThankYouPage
    ├── admin/                 # admin login, overview, orders, inventory, collections, settings
    └── components/                    (home page sections, top to bottom)
        ├── AnnouncementBar.jsx/.css   sliding gold bar above the header (free shipping…)
        ├── Header.jsx/.css            sticky nav + mobile menu
        ├── Hero.jsx/.css              "More than just time" hero with the watch photo
        ├── Collections.jsx/.css       Shop by Collection — brand logo tiles
        ├── TimeTagEdit.jsx/.css       All Watches product grid (#edit)
        ├── FeaturedCollection.jsx/.css Timeless by Design banner + live Pakistan time
        ├── SignatureCollection.jsx/.css Our Signature Collection — rotating bezel dial
        ├── CustomerReviews.jsx/.css   Hear From Our Happy Customers — sliding WhatsApp reviews
        ├── WhyChooseUs.jsx/.css       Why Choose Us between animated waves (#story)
        ├── Newsletter.jsx/.css        Stay In Time
        ├── Footer.jsx/.css
        ├── NewArrivals.jsx/.css       "You may also like" row on product pages
        ├── CartDrawer.jsx/.css, checkout/   bag and checkout layout
        ├── Watch.jsx                  vector watch drawing (+ ProductVisual)
        ├── HeartButton.jsx, QtyStepper.jsx, Icons.jsx, Reveal.jsx, Grain.jsx
```

## Pages

| URL | Page |
| --- | --- |
| `#/` | Home |
| `#/product/<id>` | Product page (gallery, stock, add to bag, buy now) |
| `#/collection/<id>` | One collection's watches (opened from the collection logos and the footer); shows "coming soon" when empty |
| `#/checkout` | Checkout (contact, delivery, shipping method, COD / bank transfer) |
| `#/thank-you/<order>` | Order confirmation |
| `#/admin` | Admin panel — orders, inventory, overview (also linked as "Staff login" in the footer) |

## Admin panel

- Log in at `#/admin` with the admin username and password.
- **Overview:** order count, revenue, pending orders, low-stock alerts.
- **Orders:** filter by status, search, open an order to see the customer and address, change status
  (Pending → Confirmed → Shipped → Delivered, or Cancelled — cancelling puts the stock back), call or
  WhatsApp the customer, export to CSV.
- **Collections:** pick the 4 watches for the home page **Signature Collection** dial; **+ Add collection**
  (name + optional logo), rename it, change its logo or delete it. Collections show in the home page
  "Shop by Collection" row and the footer. Watches with no collection are flagged here.
- **Settings:** edit, add, reorder or remove the messages in the sliding **announcement bar** above the
  header (with a live preview), or switch the bar off.
- **Inventory:** change price and stock, hide or show a watch, and **+ Add watch** — name, price, stock,
  collection (required), description, Men/Women, New Arrivals/Best Sellers, and **up to 6 photos** (drag & drop or
  choose; first photo is the main one; reorder or remove). Photos are resized automatically. **Edit** any
  watch (including the built-in ones) to add photos or change its text; watches you added can be deleted.
- The password itself is not in the code — only its SHA-256 fingerprint (see `src/lib/auth.js` for how to change it).

> ⚠️ **Demo storage.** There is no server yet, so orders, stock and the admin login all live in the
> browser (`src/lib/store.js`). Orders placed on a customer's phone will **not** reach your admin.
> Before taking real orders, connect a database (e.g. Supabase or Firebase) — only `src/lib/store.js`
> and `src/lib/auth.js` need to change.

## What works

- **Cart drawer**, product pages, checkout with validation, and a thank-you page
- **Stock tracking** — orders reduce stock, sold-out watches can't be bought
- **All Watches grid** showing every visible watch, and a **Signature Collection** dial of Best Sellers
  (drag the bezel, tap a watch, or use the arrows)
- **Customer review slider** — tap a review to see it full size
- **Wishlist hearts** with a live count on the header icon (remembered between visits)
- **Newsletter form** with email validation and a thank-you state
- **Mobile menu**, sticky header, scroll fade-in animations, hover effects
- Responsive down to phone width; respects "reduce motion" settings

## Adding products in code (alternative to the admin)

The watches are drawn in code until you have photography. To use a photo:

1. Put the image in `public/images/` (a transparent PNG looks best), e.g. `public/images/chronograph-x1.png`
2. In `src/data/products.js`, set that product's `image: '/images/chronograph-x1.png'`

The photo replaces the drawing everywhere that product appears.

## Before going live

- Product names (other than Chronograph X1) and prices are **placeholders**.
- Social links in `Footer.jsx` point to `#` — add your real profile URLs.
- The newsletter form doesn't send anywhere yet — see the `TODO` in `Newsletter.jsx`.
- Bank transfer details on the thank-you page are placeholders — edit `BANK_DETAILS` in `src/pages/ThankYouPage.jsx`.
- Connect a database so orders reach the admin from every device (see "Demo storage" above).

## Deploying

Push to GitHub, then import the repo on [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Both detect Vite automatically (build command `npm run build`, output folder `dist`).
