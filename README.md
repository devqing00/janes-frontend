# JANES — Frontend

Next.js 16 storefront and admin panel for JANES, a fashion designer e-commerce platform. Built with the App Router, TypeScript, Tailwind CSS v4, and Sanity CMS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| CMS | Sanity v3 (`@sanity/client`) |
| Animation | Framer Motion 12 |
| Auth | `jose` JWT — HTTP-only cookie |
| Payments | Paystack + Direct Bank Transfer |
| Data Fetching | SWR (admin), Sanity CDN (public) |

---

## Project Structure

```
src/
├── app/
│   ├── (site)/           # Public storefront
│   │   ├── page.tsx      # Homepage
│   │   ├── shop/         # Shop listing + [slug] product detail
│   │   ├── collections/  # All collections
│   │   ├── lookbook/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── wishlist/
│   │   ├── faq/
│   │   ├── shipping/
│   │   ├── privacy/
│   │   ├── terms/
│   │   └── checkout/     # Checkout + /callback confirmation
│   ├── admin/
│   │   ├── login/        # Admin login page
│   │   └── (shell)/      # Authenticated admin panel
│   │       ├── page.tsx  # Dashboard
│   │       ├── products/
│   │       ├── collections/
│   │       ├── orders/
│   │       ├── content/
│   │       ├── messages/
│   │       └── settings/
│   ├── api/              # API routes (Next.js Route Handlers)
│   │   ├── admin/        # Protected admin REST API
│   │   ├── products/
│   │   ├── collections/
│   │   ├── checkout/
│   │   ├── paystack/webhook/
│   │   ├── payment-methods/
│   │   ├── shipping-rates/
│   │   └── contact/
│   ├── globals.css
│   └── layout.tsx
├── components/           # Shared React components
├── lib/
│   ├── auth.ts           # getAdminSession() JWT helper
│   └── sanity.ts         # Sanity client + writeClient + urlFor
└── sanity/schemas/       # Sanity schema definitions (plain objects)
```

---

## Routes

### Public (`(site)/`)

| Route | Description |
|---|---|
| `/` | Homepage — hero, editorial grid, featured products |
| `/shop` | Full shop listing with filters |
| `/shop/[slug]` | Product detail page |
| `/collections` | All collections overview |
| `/lookbook` | Lookbook gallery |
| `/about` | About JANES |
| `/contact` | Contact form |
| `/wishlist` | Client-side wishlist |
| `/checkout` | Checkout form + payment |
| `/checkout/callback` | Post-payment confirmation |
| `/faq` | FAQs |
| `/shipping` | Shipping policy |
| `/privacy` | Privacy policy |
| `/terms` | Terms and conditions |

### Admin (`admin/(shell)/`)

| Route | Description |
|---|---|
| `/admin` | Dashboard |
| `/admin/products` | Product CRUD |
| `/admin/collections` | Collection CRUD |
| `/admin/orders` | Orders list and detail |
| `/admin/content` | CMS content manager |
| `/admin/messages` | Contact messages |
| `/admin/settings` | Site settings, payment toggles, bank accounts |
| `/admin/login` | Login page |

---

## Authentication

Admin routes are protected by a JWT stored in an HTTP-only cookie named `janes-admin-token` (24h expiry). All `/api/admin/*` route handlers call `getAdminSession()` from `src/lib/auth.ts` and return `401` if the session is invalid.

---

## Payments

### Paystack
Redirect-based flow. Checkout posts to `/api/checkout` → receives Paystack authorization URL → redirects user → Paystack calls `/api/paystack/webhook` with HMAC-SHA512 signature → order saved on `charge.success`.

### Direct Bank Transfer
Order created immediately with status `awaiting_payment`. Bank transfer reference format: `BT-{timestamp}-{uuid8}`. Bank account details are read from Sanity `siteSettings`. Both methods are toggled in Admin → Settings.

---

## Checkout Autofill

After a successful delivery step, the user's email, name, address, city, state, and phone are saved to `localStorage` under the key `janes_checkout_saved`. On next visit, a banner prompts the user to autofill their details. The saved data is cleared after successful order submission.

---

## Internationalization (i18n)

JANES supports **English** (`en`) and **French** (`fr`) with a custom lightweight i18n system — no external library, no URL restructuring.

### How it works

| Piece | Location |
|---|---|
| Provider + hook | `src/components/LocaleProvider.tsx` |
| English translations | `src/i18n/en.json` |
| French translations | `src/i18n/fr.json` |
| Locale persistence | `localStorage` key `janes-locale` |

`LocaleProvider` wraps all public pages in `(site)/layout.tsx`. Every component calls `useLocale()` to get `{ locale, setLocale, t }`.

### Usage

```tsx
import { useLocale } from "@/components/LocaleProvider";

export default function MyComponent() {
  const { t } = useLocale();
  return <h1>{t("shop.title")}</h1>;
}
```

### Parameter interpolation

```tsx
t("shop.loadMore", { n: remaining })   // "Load More (5 remaining)"
t("footer.copyright", { year: 2026 })  // "© 2026 JANES. All rights reserved."
```

### Adding a new language

1. Copy `src/i18n/en.json` → `src/i18n/<code>.json` and translate all values.
2. Import the new JSON in `src/components/LocaleProvider.tsx` and add it to the `messages` map.
3. Add the locale entry to the `LOCALES` array.

### Language toggle

A language switcher is built into the Navbar (desktop dropdown + mobile inline buttons), mirroring the currency toggle pattern.

---

## Environment Variables

Create a `.env.local` file in this directory:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=o2vehhtt
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_write_token

PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...

JWT_SECRET=your_jwt_secret_min_32_chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password

NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
