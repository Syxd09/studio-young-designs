# Full Site Technical Audit & Verification Report

**Studio Young Designs — Web Application (TanStack Start + React + Supabase + Cloudflare Workers)**
_Date: July 21, 2026_

---

## Executive Summary

A comprehensive technical audit was performed across the entire **Studio Young Designs** codebase. The audit evaluated **code quality, security, SEO, performance, caching, accessibility, and dependency health**.

| Audit Dimension | Status | Key Finding |
|:---------------|:------:|:------------|
| **TypeScript Type Check** | `PASSED` | **0 errors** (`npx tsc --noEmit`) |
| **Code Formatting (Prettier)** | `PASSED` | All files compliant |
| **Linter Check (ESLint)** | `PASSED` | **0 errors**, 9 non-blocking warnings |
| **Production Build** | `PASSED` | Vite + Nitro Cloudflare bundle builds successfully |
| **Database & RLS Security** | `PASSED` | 7/7 Supabase tables secured with RLS |
| **Security Headers** | `PARTIAL` | Missing CSP, HSTS; hardcoded credentials found |
| **SEO / OpenGraph** | `PARTIAL` | Critical missing `og.jpg`; per-page OG tags missing |
| **Performance / Caching** | `PARTIAL` | Good caching headers; no image optimization component |
| **PWA / Offline** | `NOT CONFIGURED` | No service worker, no offline support |

---

## 1. Build & Code Quality

| Check | Result |
|:------|:------:|
| TypeScript (`tsc --noEmit`) | **0 errors** — strict mode enabled |
| ESLint | **0 errors**, 9 react-refresh warnings (non-blocking) |
| Prettier | All files formatted (100 char width, trailing commas) |
| Production Build | Vite + Nitro Cloudflare bundle builds in ~1.5s |

---

## 2. Security Audit

### 2.1 Security Headers (src/server.ts:47-53)

| Header | Value | Present? |
|:-------|:------|:--------:|
| `X-Content-Type-Options` | `nosniff` | YES |
| `X-Frame-Options` | `DENY` | YES |
| `X-XSS-Protection` | `1; mode=block` | YES (deprecated) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | YES |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | YES |
| `Content-Security-Policy` | — | **MISSING** |
| `Strict-Transport-Security` | — | **MISSING** |

**Risk: HIGH** — No CSP means no browser-level defense against XSS. No HSTS means no HTTPS enforcement from the app layer (Cloudflare edge may handle it but the app doesn't enforce it).

### 2.2 CRITICAL: Hardcoded Admin Credentials (src/routes/admin.tsx:254-257)

```tsx
onClick={() => {
  setEmail("admin@studioyoung.in");
  setPassword("#StudioYoung1981");
  toast.info("Credentials pre-filled");
}}
```

A "Pre-fill login" button exposes the admin email and password in client-side source code. The same password appears in `SUPABASE_SCHEMA.sql:208-209`.

**Action required:** Remove hardcoded credentials immediately. Use environment variables or remove the debug button.

### 2.3 dangerouslySetInnerHTML Usage

| Location | Line | Risk |
|:---------|:----:|:-----|
| `__root.tsx` — inline scroll script | 178 | Low (static) |
| `__root.tsx` — JSON-LD structured data | 185 | Low (static) |
| `chart.tsx` — chart theme styles | 73 | Low (static) |

No user input is passed to these, but no DOMPurify/sanitizer is used anywhere in the codebase.

### 2.4 CSRF Protection

**Risk: HIGH** — No CSRF tokens implemented. Admin mutations rely solely on Supabase session auth (localStorage). Public forms (contact, testimonial) have no CSRF protection.

### 2.5 Row-Level Security (Supabase)

All 7 tables have RLS enabled:

| Table | Public Access | Admin Access |
|:------|:-------------|:-------------|
| `site_config` | `SELECT` only | Full CRUD |
| `layout_images` | `SELECT` only | Full CRUD |
| `services` | `SELECT` where `is_visible=true` | Full CRUD |
| `gallery` | `SELECT` where `is_visible=true` | Full CRUD |
| `testimonials` | `SELECT` where `is_approved=true`; public `INSERT` | Full CRUD |
| `journal_posts` | `SELECT` where `is_visible=true` | Full CRUD |
| `enquiries` | `INSERT` only | SELECT/UPDATE/DELETE |

**Status: GOOD** — RLS policies are properly configured.

### 2.6 Dependency Security

| Issue | Severity | Details |
|:------|:--------:|:--------|
| `nitro` beta version | Medium | `3.0.260603-beta` used in production |
| No `npm audit` in CI | Medium | No automated vulnerability scanning |
| Exposed Supabase anon key | Low | By design (VITE_ prefix, client-side) |

---

## 3. SEO Audit

### 3.1 CRITICAL: Missing `og.jpg` (__root.tsx:102)

The Open Graph image is set to `https://studioyoungdesigns.com/og.jpg` but **this file does not exist** anywhere in the `public/` directory. Every social media share will show a broken image.

### 3.2 Missing Per-Page Open Graph Tags

| Route | og:title | og:description | og:image | og:url |
|:------|:--------:|:--------------:|:--------:|:------:|
| `/` (Home) | Inherited | Inherited | Broken (missing file) | YES |
| `/about` | YES | MISSING | MISSING | YES |
| `/services` | MISSING | MISSING | MISSING | YES |
| `/services/kitchens` | MISSING | MISSING | MISSING | YES |
| `/services/wardrobes` | MISSING | MISSING | MISSING | YES |
| `/services/living-spaces` | MISSING | MISSING | MISSING | YES |
| `/services/interiors` | MISSING | MISSING | MISSING | YES |
| `/services/$slug` | MISSING | MISSING | MISSING | YES |
| `/gallery` | MISSING | MISSING | MISSING | YES |
| `/journal` | MISSING | MISSING | MISSING | YES |

**All Twitter card tags** (`twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`) are also missing on every sub-page.

### 3.3 Title Tag Quality

| Route | Title | Rating |
|:------|:------|:------:|
| `/` | "Studio Young Designs — Bespoke Interiors, Bangalore" | GOOD |
| `/about` | "About Us — Studio Young Designs \| 40+ Years..." | GOOD |
| `/services` | "Services — Studio Young Designs" | WEAK (too generic) |
| `/services/kitchens` | "Modular Kitchens — Studio Young Designs" | GOOD |
| `/services/wardrobes` | "Bespoke Wardrobes — Studio Young Designs" | GOOD |
| `/services/living-spaces` | "Living Spaces — Studio Young Designs" | GOOD |
| `/services/interiors` | "Complete Interiors — Studio Young Designs" | GOOD |
| `/services/$slug` | "{Slug} — Studio Young Designs" | WEAK (no hyphen handling) |
| `/gallery` | "Gallery — Studio Young Designs" | WEAK (too generic) |
| `/journal` | "Journal & Design Insights — Studio Young Designs" | GOOD |

### 3.4 Sitemap (public/sitemap.xml)

**Issues:**
- **Static/hardcoded** — new CMS-driven pages won't appear
- 9 URLs only (does not include individual journal articles or dynamic service slugs)
- All `lastmod` dates hardcoded to `2026-07-20`
- No `<image:image>` extension for gallery pages

### 3.5 Structured Data (JSON-LD)

**Only on homepage** (`__root.tsx:128-172`):
- Uses non-standard `@type: "HomeAndConstructionBusiness"` — not a standard Schema.org type
- Missing: `BreadcrumbList` (on all inner pages), `Article` (journal), `Service` (service pages), `ImageGallery` (gallery), `Review` (testimonials), `sameAs` social links

### 3.6 What's Good

- **robots.txt** — Excellent. Disallows `/admin/`, explicitly allows AI crawlers
- **Canonical URLs** — Present on every public route
- **Semantic HTML** — Proper use of `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`, `<figure>`, `<blockquote>`
- **Heading hierarchy** — One `<h1>` per page, proper `<h2>` → `<h3>` nesting
- **Alt text** — Mostly descriptive on public-facing images
- **hreflang** — Present (English only)

---

## 4. Performance & Caching Audit

### 4.1 Image Optimization — CRITICAL GAPS

| Concern | Details |
|:--------|:--------|
| **No image optimization component** | All images use plain `<img>` / `<motion.img>` — no `next/image` equivalent, no `<picture>`, no `srcset`/`sizes` |
| **No WebP/AVIF via `<picture>`** | WebP variants exist in `src/assets/` and `public/images/founders/` but the code imports `.jpg` versions |
| **Many images lack width/height** | Gallery, journal, founder photos, lightbox images, service row images — missing dimensions → CLS |
| **No `fetchpriority="high"`** | Hero image (LCP element) not explicitly prioritized |
| **No `preload` for hero image** | Browser discovers hero image late |

### 4.2 Font Loading

**Redundant font loading detected:**
1. `<link>` in `__root.tsx:115-118` — loads Cormorant Garamond + Inter
2. `@import` in `styles.css:1` — loads Alex Brush + Great Vibes + **Cormorant Garamond again** (duplicate)

**Good:** `display=swap` is used. Preconnect hints to Google Fonts domains are present.

### 4.3 Caching Configuration (public/_headers)

**Excellent** for static assets — 1-year immutable cache for `/images/*`, `/*.{webp,png,jpg,svg,woff2}`, `/_build/*`, `/assets/*`.

**Gaps:**
- Root-level files not covered: `/favicon.ico`, `/favicon.png`, `/logo-transparent.png`, `/footer-logo.png`
- No `_headers` rule for JS bundles outside `/_build/`

### 4.4 JavaScript & Bundle

| Concern | Impact |
|:--------|:-------|
| **framer-motion (~130KB gzipped)** | Largest dependency, used on every page — animations could be CSS |
| **recharts (~100KB+)** | Admin-only but included in main bundle |
| **No component-level dynamic imports** | Heavy components not lazy-loaded |
| **No service worker** | No offline support, no precaching |

**Good:** Route-based code splitting via TanStack Router. Intent-based preloading (`defaultPreload: "intent"`). Passive scroll event listeners.

### 4.5 Core Web Vitals Risks

| Metric | Risk Factors |
|:-------|:-------------|
| **LCP** | Unoptimized hero image, render-blocking fonts, 2.8s loader animation delays content |
| **FID/INP** | Large framer-motion bundle, 5+ Supabase queries on homepage, complex animation JS |
| **CLS** | Images without dimensions, FOUT from `display=swap`, loader → content transition, auto-scroll 45vh after 2s |

### 4.6 TanStack Query Caching

| Setting | Value |
|:--------|:------|
| Router-level `staleTime` | 5 minutes |
| Router-level `gcTime` | 30 minutes |
| Page-level `staleTime` | 1 minute (overridden, too short for static CMS data) |

---

## 5. Accessibility

| Check | Status |
|:------|:-------|
| Semantic HTML | EXCELLENT — `<nav>`, `<main>`, `<article>`, `<section>`, etc. used throughout |
| Alt text on images | GOOD — mostly descriptive |
| One `<h1>` per page | GOOD |
| Heading hierarchy | GOOD — proper descending order |
| Keyboard navigation | Not verified (need manual testing) |
| Color contrast | Not verified (need manual testing) |
| ARIA labels | Not verified (need manual testing) |

---

## 6. Configuration & Infrastructure

| Aspect | Status |
|:-------|:-------|
| TypeScript strict mode | Enabled |
| Path alias `@/*` → `./src/*` | Configured |
| ESLint flat config | Properly configured with React Hooks, Prettier integration |
| Prettier | Configured (100 char, semicolons, double quotes) |
| Vite 8 + Nitro beta | Modern build pipeline |
| Cloudflare Workers deploy | Configured (`cloudflare-module` preset) |
| .env.local gitignored | YES (`*.local` pattern) |
| Supabase anon key (VITE_ prefix) | Visible in client bundle (by design) |

---

## 7. Priority Issue Tracker

### CRITICAL (Fix Immediately)
| # | Issue | File | Existing? |
|:-:|:------|:----:|:---------:|
| 1 | Hardcoded admin credentials in client source | `src/routes/admin.tsx:254-257` | YES |
| 2 | `og.jpg` referenced but does not exist | `__root.tsx:102`, referenced in schema too | YES |
| 3 | No Content-Security-Policy header | `src/server.ts:47-53` | MISSING |
| 4 | No Strict-Transport-Security header | `src/server.ts:47-53` | MISSING |

### HIGH
| # | Issue | File |
|:-:|:------|:----:|
| 5 | Per-page Open Graph + Twitter tags missing (8+ pages) | All sub-routes |
| 6 | Sitemap is static — CMS-driven pages excluded | `public/sitemap.xml` |
| 7 | No image optimization (no WebP via `<picture>`, no `srcset`) | All route files |
| 8 | Many images lack width/height → CLS | `gallery.tsx`, `about.tsx`, `service-page.tsx`, etc. |
| 9 | Duplicate Google Fonts loading (link + @import) | `__root.tsx:115` + `styles.css:1` |
| 10 | No CSRF protection on any form | All forms |
| 11 | Structured data only on homepage, non-standard type | `__root.tsx:128-172` |
| 12 | Journal articles lack individual URLs (can't be indexed) | `journal.tsx` |
| 13 | Hero image not preloaded (LCP impact) | `__root.tsx` head |
| 14 | No service worker / PWA support | — |

### MEDIUM
| # | Issue | File |
|:-:|:------|:----:|
| 15 | `/services` and `/gallery` titles too generic for SEO | `services/index.tsx`, `gallery.tsx` |
| 16 | `$slug.tsx` doesn't replace hyphens in title | `services/$slug.tsx` |
| 17 | Admin pages lack `<meta name="robots" content="noindex">` | `admin.tsx` |
| 18 | framer-motion ~130KB on every page | `package.json` |
| 19 | recharts ~100KB+ in bundle (admin only) | `package.json` |
| 20 | `loading="lazy"` missing on several images | Lightbox, founders, journal |
| 21 | Page-level Query `staleTime` is 1min (too short) | Various route files |
| 22 | Root-level PNGs missing cache headers | `public/_headers` |
| 23 | CSV injection risk in enquiries export | `admin/enquiries.tsx:158-167` |
| 24 | Sidebar cookie missing Secure/SameSite flags | `sidebar.tsx:86` |
| 25 | `nitro` beta version in production | `package.json` |
| 26 | No `security.txt` file | — |

---

## 8. Recommendations

### Immediate (< 1 hour)
1. Remove hardcoded credentials from `admin.tsx:254-257`
2. Create `public/og.jpg` (1200x630px) and reference correctly
3. Add `Content-Security-Policy` and `Strict-Transport-Security` to `server.ts:47-53`

### Short-term (this sprint)
4. Add complete OG + Twitter card tags to every route
5. Fix `$slug.tsx` title: replace hyphens, properly capitalize
6. Give journal articles individual routes (`/journal/$slug`)
7. Generate sitemap dynamically from Supabase data
8. Add `noindex` to admin pages

### Medium-term (next sprint)
9. Implement image optimization: `<picture>` with WebP fallbacks, `srcset`, `loading="lazy"`, explicit dimensions
10. Reduce framer-motion usage (replace simple animations with CSS)
11. Add structured data per page type (BreadcrumbList, Article, Service, ImageGallery)
12. Implement CSRF protection
13. Add service worker for offline + precaching

### Long-term
14. Self-host fonts (eliminate external font requests)
15. Implement critical CSS inlining
16. Consider migrating to a stable Nitro release
17. Set up `npm audit` / Snyk in CI pipeline
18. Create `public/.well-known/security.txt`
