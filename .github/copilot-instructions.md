# GitHub Copilot Instructions — JANES Frontend

## Project Overview
JANES is a luxury fashion designer e-commerce platform. This repository contains the Next.js 16 frontend — a public storefront and a custom admin panel.

## Core Stack
- **Framework:** Next.js 16 with App Router and Turbopack
- **Language:** TypeScript 5 (strict mode — always type everything)
- **Styling:** Tailwind CSS v4 (utility-first, no CSS modules)
- **CMS:** Sanity v3 via `@sanity/client`
- **Animation:** Framer Motion 12
- **Auth:** `jose` JWT, HTTP-only cookie `janes-admin-token`
- **Payments:** Paystack (redirect) + Direct Bank Transfer
- **Data fetching:** SWR for admin pages, Sanity CDN for public pages

## Route Architecture
The app uses two route groups:

### `src/app/(site)/` — Public Storefront
Pages accessible to all visitors. Layout in `(site)/layout.tsx` includes `<Navbar>`, `<CartSlideout>`, and `<Footer>`.

### `src/app/admin/(shell)/` — Admin Panel
Protected pages requiring valid JWT. Layout in `admin/(shell)/layout.tsx` wraps content in `<AdminShell>`. All admin API routes are under `src/app/api/admin/` and call `getAdminSession()` to validate the cookie.

## Authentication Pattern
```typescript
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  // ... handler logic
}
```
Never skip the session check in any `/api/admin/*` route.

## Sanity Pattern
```typescript
import { client, writeClient, urlFor } from "@/lib/sanity";

// Read (CDN, public)
const products = await client.fetch(GROQ_QUERY);

// Write (requires SANITY_API_TOKEN)
await writeClient.create({ _type: "order", ... });

// Image URL
<img src={urlFor(product.image).width(800).url()} />
```
Schemas live in `src/sanity/schemas/` as plain TypeScript objects (no `defineField`/`defineType` — those are for the `studio/` package only). Keep these in sync with `studio/schemas/`.

## Admin UI Design System
- Background: `#E8E2DB` (warm beige)
- Primary text: `#1A1A1A`
- Accent / CTA: `#C08A6F` (terracotta)
- Borders: `border-[#C08A6F]/20`
- Use `AdminShell`, `Toast`, `ConfirmModal`, `ImageUpload` components from `src/components/admin/`

## Payment Dual-Path Pattern
Checkout has two paths — Paystack and Bank Transfer — toggled in Sanity `siteSettings.paymentMethods`. Always check which method is active before rendering payment UI. Bank transfer orders use status `awaiting_payment`; Paystack orders use `paid` after webhook confirmation.

## localStorage Autofill
Key: `janes_checkout_saved`. Saved after delivery step completes. Cleared after successful order submission. Format:
```typescript
interface SavedCheckout {
  email: string; firstName: string; lastName: string;
  address: string; city: string; state: string; phone: string;
}
```

## Code Conventions
- All components are `"use client"` when they use hooks or browser APIs
- Server components fetch Sanity data directly (no `useEffect`)
- API routes return `Response` objects (not `NextResponse`)
- Use `async/await` not `.then()` chains
- Keep components small — extract logic to hooks or utility functions
- Never use `any` type — always be explicit
