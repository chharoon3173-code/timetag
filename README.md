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

## What works

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

## Deploying

Push to GitHub, then import the repo on [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Both detect Vite automatically (build command `npm run build`, output folder `dist`).
