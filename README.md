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
├── supabase/setup.sql         # database setup: paste into Supabase → SQL Editor → Run
├── public/
│   ├── favicon.png, apple-touch-icon.png
│   ├── brand/                 # lion + wordmark logos, hero.jpg, collections/ (brand tile logos)
│   └── reviews/               # WhatsApp review screenshots (names blurred)
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # puts all the sections together
    ├── index.css              # colours, fonts, buttons, shared styles
    ├── data/products.js       # watch drawing styles, default bar text, review list
    ├── hooks/useWishlist.js   # wishlist state, saved in the browser
    ├── lib/supabase.js        # connection to the database (address + public key)
    ├── lib/store.js           # loads & saves watches, collections, settings and orders; the bag
    ├── lib/auth.js            # admin sign-in (Supabase email + password)
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
        ├── LoadingState.jsx           "Loading…" / "couldn't load — try again"
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

- Sign in at `#/admin` with the admin **email and password** you created in Supabase (see "Database" below).
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
  choose; first photo is the main one; reorder or remove). Photos are resized and uploaded automatically.
  **Edit** or **Delete** any watch.
- New orders appear by themselves (checked every minute), or click **Refresh** on the Orders page.

## Database (Supabase)

Watches (and their photos), collections (and logos), the Signature picks, the announcement bar and
**orders** are stored in a Supabase project, so every visitor and every device sees the same data.
The bag, wishlist and saved checkout details stay on each visitor's own device.

**Security** (all in `supabase/setup.sql`):
- Anyone can *see* visible watches, collections and settings; only admins can change them.
- Orders can only be read by admins. Customers create them through `place_order`, which checks stock,
  takes prices from the database (they can't be changed in the browser) and handles two people buying
  the last watch at the same moment.
- Only emails in the `admins` table can use the admin panel.

**Setting it up (once):**
1. Supabase → **SQL Editor** → New query → paste all of `supabase/setup.sql` → **Run**.
2. Supabase → **Authentication → Users → Add user → Create new user**: your email + a strong password,
   tick **Auto Confirm User**.
3. SQL Editor → run: `insert into public.admins (email) values ('your-email@example.com');` (lowercase)
4. Sign in at `#/admin`.

The project address and **publishable** key are at the top of `src/lib/supabase.js` (they're meant to
be public). Never put a *secret* / *service_role* key in the code. If you change the shipping prices,
change them in both `SHIPPING_METHODS` (`src/lib/store.js`) and `place_order` (`supabase/setup.sql`).
Free Supabase projects pause after a week with no visitors — click **Restore** in the dashboard if that happens.

## What works

- **Cart drawer**, product pages, checkout with validation, and a thank-you page
- **Stock tracking in the database** — orders reduce stock, sold-out watches can't be bought
- **All Watches grid** showing every visible watch, and a **Signature Collection** dial of Best Sellers
  (drag the bezel, tap a watch, or use the arrows)
- **Customer review slider** — tap a review to see it full size
- **Wishlist hearts** with a live count on the header icon (remembered between visits)
- **Newsletter form** with email validation and a thank-you state
- **Mobile menu**, sticky header, scroll fade-in animations, hover effects
- Responsive down to phone width; respects "reduce motion" settings

## Before going live

- The 6 demo watches are **placeholders** — delete or hide them in Admin → Inventory once your real watches are in.
- Social links in `Footer.jsx` point to `#` — add your real profile URLs.
- The newsletter form doesn't send anywhere yet — see the `TODO` in `Newsletter.jsx`.
- Bank transfer details on the thank-you page are placeholders — edit `BANK_DETAILS` in `src/pages/ThankYouPage.jsx`.

## Deploying

Push to GitHub, then import the repo on [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Both detect Vite automatically (build command `npm run build`, output folder `dist`).
