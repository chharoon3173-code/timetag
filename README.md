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
├── public/favicon.svg
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # puts all the sections together
    ├── index.css              # colours, fonts, buttons, shared styles
    ├── data/products.js       # ← products, prices, collections, reviews (edit here)
    ├── hooks/useWishlist.js   # wishlist state, saved in the browser
    ├── lib/store.js           # cart, orders, stock (swap for a database later)
    ├── lib/auth.js            # admin login
    ├── lib/router.js          # page routing (#/product/…, #/checkout, …)
    ├── pages/                 # HomePage, ProductPage, CheckoutPage, ThankYouPage
    ├── admin/                 # admin login, overview, orders, inventory
    └── components/
        ├── Header.jsx/.css            sticky nav + mobile menu
        ├── Hero.jsx/.css              "More than just time" hero
        ├── TrustBar.jsx/.css          shipping / authentic / returns / payments
        ├── Collections.jsx/.css       Find Your Signature Timepiece
        ├── TimeTagEdit.jsx/.css       The TimeTag Edit showcase + filters
        ├── FeaturedCollection.jsx/.css Timeless by Design banner
        ├── NewArrivals.jsx/.css       Just In
        ├── BrandStory.jsx/.css        Built Around Time
        ├── WhyTimeTag.jsx/.css        four benefits
        ├── Reviews.jsx/.css           Worn. Loved. Remembered.
        ├── Newsletter.jsx/.css        Stay In Time
        ├── Footer.jsx/.css
        ├── Watch.jsx                  vector watch drawing (+ ProductVisual)
        ├── HeartButton.jsx, Icons.jsx, Reveal.jsx, Grain.jsx
```

## Pages

| URL | Page |
| --- | --- |
| `#/` | Home |
| `#/product/<id>` | Product page (gallery, stock, add to bag, buy now) |
| `#/checkout` | Checkout (contact, delivery, shipping method, COD / bank transfer) |
| `#/thank-you/<order>` | Order confirmation |
| `#/admin` | Admin panel — orders, inventory, overview (also linked as "Staff login" in the footer) |

## Admin panel

- Log in at `#/admin` with the admin username and password.
- **Overview:** order count, revenue, pending orders, low-stock alerts.
- **Orders:** filter by status, search, open an order to see the customer and address, change status
  (Pending → Confirmed → Shipped → Delivered, or Cancelled — cancelling puts the stock back), call or
  WhatsApp the customer, export to CSV.
- **Inventory:** change price and stock, hide or show a watch in the store.
- The password itself is not in the code — only its SHA-256 fingerprint (see `src/lib/auth.js` for how to change it).

> ⚠️ **Demo storage.** There is no server yet, so orders, stock and the admin login all live in the
> browser (`src/lib/store.js`). Orders placed on a customer's phone will **not** reach your admin.
> Before taking real orders, connect a database (e.g. Supabase or Firebase) — only `src/lib/store.js`
> and `src/lib/auth.js` need to change.

## What works

- **Cart drawer**, product pages, checkout with validation, and a thank-you page
- **Stock tracking** — orders reduce stock, sold-out watches can't be bought
- **Filter chips** in The TimeTag Edit (All / Men's / Women's / Best Sellers / New Arrivals)
- **Wishlist hearts** with a live count on the header icon (remembered between visits)
- **Newsletter form** with email validation and a thank-you state
- **Mobile menu**, sticky header, scroll fade-in animations, hover effects
- Responsive down to phone width; respects "reduce motion" settings

## Adding real product photos

The watches are drawn in code until you have photography. To use a photo:

1. Put the image in `public/images/` (a transparent PNG looks best), e.g. `public/images/chronograph-x1.png`
2. In `src/data/products.js`, set that product's `image: '/images/chronograph-x1.png'`

The photo replaces the drawing everywhere that product appears.

## Before going live

- Product names (other than Chronograph X1) and prices are **placeholders**.
- The three reviews are **placeholder text** — replace them with real, verified customer reviews.
- Social links in `Footer.jsx` point to `#` — add your real profile URLs.
- The newsletter form doesn't send anywhere yet — see the `TODO` in `Newsletter.jsx`.
- Bank transfer details on the thank-you page are placeholders — edit `BANK_DETAILS` in `src/pages/ThankYouPage.jsx`.
- Connect a database so orders reach the admin from every device (see "Demo storage" above).

## Deploying

Push to GitHub, then import the repo on [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Both detect Vite automatically (build command `npm run build`, output folder `dist`).
