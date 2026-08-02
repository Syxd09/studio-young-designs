# Production Audit Report — Studio Young Designs

**Target:** `https://www.studioyoungdesigns.com` (canonical: `https://studioyoungdesigns.com`)
**Stack:** TanStack Start (React 19) + Vite + Nitro + Supabase + Vercel Edge
**Audit date:** 2026-08-02
**Method:** Live agentic crawl of every reachable page (home, about, services ×4, portfolio, gallery, journal, admin, 404), HTTP/header inspection, read-only Supabase REST verification, and repository review (`tsc`, `eslint`, dependency & asset analysis). No destructive actions were performed.

> **Scope note:** This audit reflects the **live deployed application**. The repository HEAD (commit `87cb7db`) differs from what is deployed — see Finding S-01 (deployment drift). Anything not verifiable from the live site or repo is explicitly marked **"Unable to verify."**

---

## Executive Summary

### Health Scores

| Dimension                        | Score        | Verdict                                                  |
| -------------------------------- | ------------ | -------------------------------------------------------- |
| **SEO**                          | **52 / 100** | Critical canonical bug on every subpage; sitemap errors  |
| **Security**                     | **68 / 100** | Strong headers + RLS, but default admin password in repo |
| **Performance**                  | **62 / 100** | Good compression/caching, heavy JS + image payload       |
| **Accessibility**                | **70 / 100** | Strong base, several WCAG 2.2 violations                 |
| **Best Practices**               | **60 / 100** | SSR + error handling; no tests, no CI, no PWA            |
| **Maintainability**              | **66 / 100** | Clean TS, but dead components, unused deps, drift        |
| **AI Readiness**                 | **78 / 100** | Excellent `llms.txt` + AI-robots policy; content gaps    |
| **Overall Production Readiness** | **62 / 100** | **NOT launch-ready for SEO** — see blockers              |

### Three things you must know

1. **CRITICAL (SEO):** Every subpage (`/about`, `/services/*`, `/portfolio`, `/journal`) emits `<link rel="canonical" href="https://studioyoungdesigns.com">` — **all pages claim the homepage is their canonical**. Google will de-index or mis-attribute every subpage. This is the single most damaging finding.
2. **CRITICAL (Security):** `SUPABASE_SCHEMA.sql` commits a default admin account with password `#StudioYoung1981` ("Change this in production") alongside the Supabase project URL + publishable key (also hardcoded in `src/utils/supabase.ts`). If that admin was seeded to production, the admin panel is compromisable by anyone who can read the repo. The `testimonials` RLS policy also lets anonymous clients bypass moderation.
3. **HIGH (Technical):** The deployed app **does not match the repository** (deploy drift). Repo has per-page canonicals and a portfolio-only sitemap; live serves homepage-canonicals everywhere and a sitemap that lists `/gallery` (a thin client-side redirect) while **omitting `/portfolio`**.

---

## 1. SEO Audit

### Verified baseline (good)

- Fully SSR-rendered HTML on every public route — all text, headings, links and images present in the initial response (no blank-JS wall).
- Unique, well-formed `<title>` and meta descriptions on all core pages (drafts measured 45–160 chars).
- `robots.txt` correct, includes explicit `Allow` for GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended, Applebot-Extended, CCBot; disallows `/admin`.
- Organization JSON-LD (`HomeAndConstructionBusiness`) with NAP, founders, hours, `knowsAbout` on every page.
- `lang="en"`, viewport, single H1 per page, all `<img>` carry `alt` (0 missing across 15 crawled pages).
- Clean URL slugs, no uppercase duplicates (case variants 404 correctly).

### Findings

#### F-01 — CRITICAL · Canonical tag points every page to the homepage

- **Evidence:** Crawl of `/about`, `/services`, `/services/kitchens`, `/services/wardrobes`, `/services/living-spaces`, `/services/interiors`, `/portfolio`, `/journal` — all return `link rel="canonical" href="https://studioyoungdesigns.com"`. Root cause: `__root.tsx:109` (`{ rel: "canonical", href: siteUrl }`) plus `og:url` at `__root.tsx:104`. The repo already contains per-page canonical overrides (`about.tsx:52`, `services/kitchens.tsx:26`, etc.), but they are **not deployed** (see S-01).
- **Why it matters:** Google consolidates signals to the canonical URL. All subpages are at risk of being folded into the homepage, losing their individual rankings, SERP snippets, and keyword targeting.
- **Fix:** Ship the existing per-page canonical overrides; for any page without an explicit canonical, derive it from the request URL at SSR time (single source of truth), never a constant.
- **Impact:** Corrects indexing for 8+ pages; primary ranking blocker removed.

#### F-02 — HIGH · Canonical / OG URLs use the redirecting non-www apex

- **Evidence:** `https://studioyoungdesigns.com/` responds **308 → `https://www.studioyoungdesigns.com/`**. Yet canonical, `og:url`, `og:image`, and sitemap `<loc>` all use `studioyoungdesigns.com` (the redirecting host). Google's sitemap validator follows it, but canonical/OG point to a URL that itself redirects.
- **Fix:** Pick **one** host (recommend `https://www.studioyoungdesigns.com` since the apex 308s there) and use it in every canonical, OG, twitter, and sitemap entry.

#### F-03 — HIGH · Sitemap is wrong (live)

- **Evidence:** Live `sitemap.xml` lists `/gallery` but **omits `/portfolio`** (the flagship showcase page). Repo `public/sitemap.xml` lists `/portfolio` and omits `/gallery` — further proof of drift. `lastmod` is stale (`2026-07-20`); `changefreq`/`priority` are deprecated fields.
- **Fix:** Regenerate sitemap to include all indexable URLs (`/`, `/about`, `/services`, 4 service pages, `/portfolio`, `/journal`), use www URLs, fresh `lastmod`, and submit in Search Console.
- **Impact:** Restores crawl priority to portfolio; removes a thin duplicate URL from the index signal.

#### F-04 — HIGH · Journal articles have no individual URLs

- **Evidence:** `journal.tsx` renders 4 article cards as `<motion.article onClick>` that open a client-side overlay (`journal.tsx:272-332`). The SSR link graph contains **no** `/journal/<slug>` links; no article routes exist. DB query (`journal_posts`) returns slugs (`bespoke-wardrobe-design`, …) that differ from the SSR defaults — content swaps after hydration.
- **Why it matters:** ~4,000 words of unique long-form content (kitchen guides, material studies) is not crawlable or indexable as pages. No `Article` schema, no breadcrumbs, no shareable URLs, no backlink targets. This is the biggest organic-content opportunity currently lost.
- **Fix:** Add `/journal/$slug` routes rendering article content server-side, link cards to them, add `Article` + `BreadcrumbList` JSON-LD, and add to sitemap.
- **Impact:** High — new indexable pages targeting "modular kitchen Bangalore", "wardrobe design", etc.

#### F-05 — MEDIUM · `/gallery` is a thin soft-page, not a redirect

- **Evidence:** `gallery.tsx` returns `<Navigate to="/portfolio" replace />` — a **client-side** redirect. Live `/gallery` responds **200** with a 6 KB shell (no headings, no links, no content), homepage title + homepage canonical, and is listed in the live sitemap.
- **Fix:** Replace with a server-side `308` to `/portfolio`; remove from sitemap. (On Vercel, add a `vercel.json`/`nitro` route redirect.)
- **Impact:** Removes a duplicate-content URL; consolidates equity into `/portfolio`.

#### F-06 — MEDIUM · Duplicate H2s on service pages

- **Evidence:** `/services/kitchens` renders H2 "Thoughtful Kitchens. Timeless Living." **twice** (also wardrobes, living-spaces, interiors show their tagline twice).
- **Fix:** Unique H2s or de-duplicate the hero/section tags.
- **Impact:** Cleaner outline; avoids diluting topical focus.

#### F-07 — MEDIUM · Social sharing metadata is generic and incomplete

- **Evidence:** All subpages share the **same** `og:title`, `og:description`, `og:image` as the homepage (from `__root.tsx`). Only `twitter:card` is present — no `twitter:title/description/image`. `og:image` is 1920×1280 (recommended 1200×630, 1.91:1) and points to the redirecting apex.
- **Fix:** Per-page OG/Twitter title+description+image; export a 1200×630 `og.jpg`; keep OG URLs on the canonical host.

#### F-08 — LOW · `hreflang` self-reference points to redirecting URL

- **Evidence:** `link rel="alternate" hrefLang="en" href="https://studioyoungdesigns.com"` — self-referential but on the redirecting host.
- **Fix:** Align with chosen canonical host. (Single-language site doesn't need multi hreflang.)

#### F-09 — LOW · H1 vs body inconsistency: "40 years" vs "45 years"

- **Evidence:** Homepage H1 "…crafted over **forty** years" + hero watermark `40+`; about section says "For more than **45** years" and `45+`; portfolio description says "over 45 years"; `llms.txt` says "40+ Years" and "700+ projects". The 1981 founding date implies 45 years as of 2026 — pick one figure everywhere.
- **Fix:** Standardize on one number (45 is mathematically consistent with Est. 1981).
- **Impact:** Entity/trust consistency for both Google and AI engines.

---

## 2. Technical SEO

| Check                 | Result                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| robots.txt            | ✅ Correct; admin disallowed; AI crawlers allowed                                                                   |
| XML sitemap           | ❌ Wrong URLs, `/gallery` in, `/portfolio` missing, stale `lastmod`                                                 |
| noindex               | ✅ `/admin/*` meta `noindex, nofollow`                                                                              |
| 404 handling          | ⚠️ Custom 404 page exists but inherits homepage title/canonical/robots `index, follow`                              |
| Soft-404s             | ❌ `/services/<unknown-slug>` returns **200** "Service Not Found" with `index, follow` (`services/$slug.tsx:79-89`) |
| Redirect chains       | ⚠️ Apex→www 308 (single hop, OK); trailing-slash uses **307 temporary** (should be 308/301)                         |
| Canonical consistency | ❌ Broken (F-01, F-02)                                                                                              |
| HTTP status codes     | ✅ 200/404/308 correct                                                                                              |
| Cache headers         | ✅ Assets `immutable, max-age=31536000`; ⚠️ HTML `max-age=0, must-revalidate` (no HTML edge caching)                |
| Compression           | ✅ Brotli on all assets + HTML                                                                                      |
| SSR vs CSR            | ✅ Full SSR + hydration                                                                                             |
| Favicon / icons       | ✅ favicon.ico + png + apple-touch-icon                                                                             |
| PWA manifest / SW     | ❌ None (`public/` has no `manifest.webmanifest` or `sw.js`)                                                        |

**F-10 — MEDIUM · Soft-404s for unknown service slugs.** Any `/services/<anything>` 200s with an indexable "Service Not Found" page and no `noindex`. Fix: `noindex, nofollow` robots meta on the not-found branch or server-404 it.

**F-11 — MEDIUM · HTML responses are uncached (`max-age=0, must-revalidate`).** Every visitor triggers a fresh edge/origin render → higher TTFB variance. Fix: Vercel `Cache-Control: s-maxage=300, stale-while-revalidate=86400` (ISR-style) for marketing pages; keep admin uncached.

**F-12 — LOW · Trailing-slash normalization uses 307.** `/services/kitchens/` → `307 /services/kitchens`. Use a permanent 308 so crawl equity consolidates.

---

## 3. Performance Audit

### Measured facts

- **Brotli compression:** confirmed on HTML, JS, CSS (`Content-Encoding: br`).
- **Immutable caching:** all `/assets/*`, images, fonts: `public, max-age=31536000, immutable`. ✅
- **Preloads:** hero + logo + 6 below-the-fold images preloaded in `<head>`.
- **Lazy loading:** below-fold images use `loading="lazy"`; routes are code-split.

### Findings

#### F-13 — HIGH · Heavy JavaScript payload

- **Evidence:** Build analysis of the deployed chunk set: `index-C7AZveCT.js` (~357 KB raw), `supabase-*` (~203 KB), `proxy-*` (~118 KB), `routes-*` (~65 KB), `Match-*` (~48 KB). Homepage `<head>` alone lists ~25 modulepreloads. Raw JS ≈ **790+ KB** (~250–300 KB brotli) before route chunks. CSS is 147.8 KB raw.
- **Why it matters:** Long parse/execute time on low/mid-range mobiles → main-thread blocking, higher INP, slower LCP on slow devices.
- **Fix:** Drop the unused animation/UI surface (F-25); audit `framer-motion`, `lenis`, full shadcn/Radix install; add route-based lazy boundaries; consider `three`/`recharts` removal (unused). Vite manualChunks for vendor splitting.
- **Impact:** Likely 30–50% JS reduction; improves INP/LCP for the majority of Indian mobile traffic.

#### F-14 — MEDIUM · LCP hero image is 285 KB JPG

- **Evidence:** `/assets/hero-Cx1CL8zL.jpg` = 285,120 bytes, preloaded but not resized/WebP (repo has `.webp` variants for services but hero uses `.jpg`). `.output` also ships a same-sized `og.jpg` (1920×1280).
- **Fix:** Serve a responsive WebP/AVIF hero (~1200px, <120 KB), preload it, and keep the 1920px only for large screens.
- **Impact:** Faster LCP on the most-visited page.

#### F-15 — MEDIUM · Below-the-fold images are preloaded, competing with LCP

- **Evidence:** Homepage preloads 4 service images + 4 portfolio images + 2 logos — none are above the fold.
- **Fix:** Preload only the LCP image; let the rest lazy-load.

#### F-16 — MEDIUM · External font loading is heavy

- **Evidence:** 4 families (Alex Brush, Cormorant Garamond ×9 weights incl. italics, Great Vibes, Inter ×5 weights) from `fonts.googleapis.com`. Only Inter + Cormorant Garamond appear used in text.
- **Fix:** Subset weights to what's actually used (Cormorant 400/500/600, Inter 400/500/600); consider self-hosting (`font-src` already self) or `font-display: swap` tuning. Preconnect present ✅.

#### F-17 — LOW · HTML not edge-cached (see F-11) → TTFB variance

- **Evidence:** `Cache-Control: public, max-age=0, must-revalidate` on every HTML response.
- **Fix:** ISR-style caching; measure TTFB before/after in Search Console CWV + Speed Insights.

#### F-18 — Not measured

- **Unable to verify (no field data / no browser automation in this environment):** LCP/CLS/INP/TTFB field values, HTTP/2 vs HTTP/3 negotiation (curl build lacks `--http2`/`--http3`; Vercel serves HTTP/2 by default and supports HTTP/3 — confirm in Speed Insights / PageSpeed Insights), and real-device CLS. Static signals (width/height attributes on hero/about images ✅) suggest CLS risk is moderate and mostly font-swap driven.

---

## 4. Security Audit

### Verified strong baseline

- **Headers on all HTML + assets:** CSP, HSTS (`max-age=31536000; includeSubDomains; preload`), X-Content-Type-Options, X-Frame-Options: SAMEORIGIN, Referrer-Policy, Permissions-Policy (camera/mic/geo blocked). Applied both via Vercel `public/_headers` and `src/server.ts`.
- **Supabase RLS verified live (read-only REST):** public tables readable; `enquiries` returns `[]` for anonymous (RLS filters); `auth.users` not exposed (PGRST205). No data leak observed.
- No mixed content, no `http://` assets; all third-party (YouTube, Google Fonts, Supabase, Unsplash) via HTTPS and constrained in CSP.

### Findings

#### F-19 — CRITICAL · Default admin credentials committed to the repository

- **Evidence:** `SUPABASE_SCHEMA.sql:206-226` seeds `admin@studioyoung.in` with bcrypt hash of `#StudioYoung1981` and the comment _"(Change this in production)"_. The same file exposes the Supabase project URL (`pacoywekwvdmhvtndqra.supabase.co`), and `src/utils/supabase.ts:3-4` **hardcodes** the URL + `sb_publishable_...` key.
- **Why it matters:** Repo access ≈ admin access if that user exists in production with the default password. Also `.env.local` is **tracked in git** (`git ls-files` lists it) despite the `*.local` ignore rule.
- **Fix (immediate):** (1) Verify the production Supabase has **no** `admin@studioyoung.in` account (or rotate it immediately); (2) enforce strong admin password + 2FA; (3) `git rm --cached .env.local` and rotate any key it held; (4) never put real credentials in SQL seeds; use Supabase dashboard/SMTP invite flow.
- **Impact:** Closes the single highest-severity exposure.

#### F-20 — HIGH · Anonymous clients can publish "approved" testimonials

- **Evidence:** RLS `CREATE POLICY "Allow public insert on testimonials" ... WITH CHECK (true)` (`SUPABASE_SCHEMA.sql:165`). The UI sets `is_approved: false` (`index.tsx:1479`), but a caller can POST `is_approved: true` directly to the REST API — **no column-level restriction**. Moderation is therefore bypassable.
- **Fix:** Add a `BEFORE INSERT` trigger forcing `is_approved := false` for non-authenticated inserts (or a `WITH CHECK (is_approved = false AND auth.role() = 'anon')` policy).

#### F-21 — MEDIUM · Contact + review forms are unthrottled

- **Evidence:** `enquiries` allows anonymous INSERT with no rate limit, captcha, or honeypot (`index.tsx:1874-1876`). Bot spam can fill the leads table and the admin's queue (DoS of inbox).
- **Fix:** Add Cloudflare Turnstile/reCAPTCHA, a honeypot field, and/or server-side rate limiting; consider a server route to insert enquiries instead of direct client insert.

#### F-22 — MEDIUM · CSP weaknesses

- **Evidence:** CSP `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://cdn.jsdelivr.net`. `unsafe-inline` + `unsafe-eval` substantially weaken XSS protection. Also no `object-src 'none'`, `base-uri 'self'`, `form-action`, or `frame-ancestors` directives. The `https://cdn.jsdelivr.net` allow-list is unexplained in the codebase.
- **Fix:** Remove `unsafe-eval` in production (Vite builds shouldn't need it), drop `unsafe-inline` for scripts by moving inline scripts to files, add `object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'`, and remove `cdn.jsdelivr.net` if unused.

#### F-23 — MEDIUM · Admin gating is client-side only

- **Evidence:** `/admin` and all `/admin/*` return **200 SSR** to anyone; the login gate is a React `useEffect` check (`admin.tsx:56-78`). No server-side auth redirect. `/admin/login` 404s (route doesn't exist) even though the login form lives inline.
- **Why it matters:** Content protection currently depends entirely on Supabase RLS. Data is safe _if_ RLS is enforced, but there is no server-side auth boundary and no failed-login throttling beyond Supabase's.
- **Fix:** Server-route guard that redirects `/admin/*` to an auth screen when no Supabase session cookie exists; add login rate limiting; keep `noindex`.

#### F-24 — LOW · Minor hardening gaps

- `X-XSS-Protection: 1; mode=block` is deprecated (can trigger false positives) — safe to remove.
- Apex (308) redirect response carries only `Strict-Transport-Security: max-age=63072000` (no `includeSubDomains`/`preload`) while www carries the strong policy — align.
- No `security.txt` / `/.well-known/security.txt`.
- Stack traces: client `console.error` in `ErrorComponent` (`__root.tsx:42`) — acceptable, but confirm error pages don't leak internals (custom `renderErrorPage` is used; content not inspected in-browser — **unable to fully verify**).

---

## 5. Accessibility Audit (WCAG 2.2)

### Score: **70 / 100** (approx.)

**Good:** semantic `<html lang="en">`; single `<main>`, `<header>`, `<footer>`, `<nav>`; logical H1→H2→H3 flow on all public pages; every `<img>` has `alt`; decorative elements use `aria-hidden`; contact form controls use wrapping `<label>` (implicit labeling ✅); `aria-current` on active nav; `aria-live` on the toast region.

**Violations:**

| #    | Severity   | WCAG           | Finding                                                                                                                                                                                                      | Evidence                                 |
| ---- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| A-01 | **High**   | 2.4.4 / 4.1.2  | Mobile hamburger has **no accessible name** — no `aria-label`, `aria-expanded`, or text (three bare `<span>`s). Screen readers announce an anonymous button.                                                 | `home.html` hamburger `<button>`         |
| A-02 | **High**   | 2.4.4          | 5 social links (YouTube, Facebook, Pinterest, Instagram, WhatsApp) contain only icon `<svg>`s with **no accessible name**.                                                                                   | SSR anchor audit — empty accessible text |
| A-03 | **Medium** | 4.1.2          | Testimonial/portfolio **carousel dots** have no `aria-label`/`aria-current`/`aria-controls`.                                                                                                                 | 3 anonymous dot buttons                  |
| A-04 | **Medium** | 1.4.3 (verify) | **Gold-on-cream contrast risk** — gold accents (`#D4AF37`-family) and `text-charcoal/50`, `text-charcoal/70` on cream. **Unable to compute exact ratios without rendering CSS**; flag for automated testing. | Theme tokens                             |
| A-05 | **Medium** | 2.4.7          | Inputs use `outline-none` with only border-color focus change; **focus-visible indicator unverified**.                                                                                                       | `index.tsx` form styles                  |
| A-06 | **Low**    | 1.3.1          | Splash/loader is a fixed overlay (not a dialog); content behind remains in the a11y tree during load.                                                                                                        | `__root.tsx`/loader markup               |

**Fixes:** add `aria-label="Open menu"` + `aria-expanded` + `aria-controls` to the hamburger; add `aria-label`/`title` to each social link; label carousel dots (`aria-label="Go to slide 1"` + `aria-current`); run axe/Lighthouse and fix contrast + focus-visible; consider `role="dialog" aria-modal="true"` for the article overlay and mobile drawer.

---

## 6. Best Practices

- ✅ Semantic HTML, responsive layouts (mobile-first Tailwind breakpoints verified in markup), SSR with hydration, error boundary + custom 500 page (`src/server.ts`, `src/lib/error-page.ts`), Vercel Speed Insights, favicon set, per-page metadata on most routes, page transitions handled (scroll reset).
- ❌ **No cookie/privacy consent banner** and no privacy policy page (India DPDP / GDPR exposure for a lead-gen site collecting PII in `enquiries`).
- ❌ **No PWA**: no manifest, no service worker, no offline support (also flagged in the July 21 report).
- ❌ **No tests** (0 test files; no `test` script) and **no CI/CD** (no `.github/`).
- ⚠️ Loading states exist (spinners) but SSR renders content immediately; empty states exist on admin tables; form validation is browser `required` + minimal client checks (no zod validation on contact form despite zod being installed).
- ⚠️ Only Vercel Speed Insights for analytics — no privacy-respecting analytics, no conversion tracking beyond enquiries table.

---

## 7. Code Quality (Repository)

- ✅ `npx tsc --noEmit` → **0 errors**; `npx eslint .` → **0 errors / 7 warnings** (react-refresh). Clean TypeScript, good folder structure (`routes/`, `components/ui`, `lib`, `utils`, `hooks`), typed routes via `routeTree.gen.ts`.
- ❌ **No tests.** No CI. Two lockfiles (`bun.lock` + `package-lock.json`) + `bunfig.toml` — mixed package-manager state.
- ❌ **~50 UI components, most unused.** `calendar`, `chart` (recharts), `carousel`, `command`, `context-menu`, `drawer` (vaul), `input-otp`, `menubar`, `resizable`, `sidebar`, `slider`, `switch`… are dead code. Confirmed unused deps: `three`/`@types/three`, `recharts`, `vaul`, `react-day-picker`, `cmdk`, `input-otp`, `react-resizable-panels` (0 imports in `src`).
- ❌ **Stray/dead assets:** `hero_image_1.jpg` (330 KB) in repo root; `public/image.png` is byte-identical to `public/footer-logo.png`; `src/assets/Young designs Brochure.pdf` duplicated as `public/young-designs-brochure.pdf`; awkward filenames (`PNG 1 (1).png`, `Studio-Young-Design-Transparent (1).png`).
- ❌ **Deployment drift (F-01/S-01):** repo HEAD ≠ live build (canonicals, sitemap, schema type differ) — no automated deploy pipeline.
- ⚠️ Hardcoded Supabase URL/key in source (works but should be env-driven) — see F-19.

---

## 8. AI Readiness

### Score: **78 / 100**

**Strengths:**

- **`llms.txt` is excellent** — concise entity summary, services, founders, NAP, stats, hours. A1+ pattern.
- robots.txt explicitly **allows GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended, Applebot-Extended, CCBot** — proactive AI-crawler strategy.
- Rich Organization JSON-LD (founders, hours, `knowsAbout`) gives clean entity data.
- Fully SSR content, machine-readable headings, strong internal structure.

**Weaknesses:**

- Journal content (the best AI-citation material) is **not crawlable as individual pages** (F-04) — LLMs will struggle to cite specific articles.
- Canonical/URL host confusion (F-02) weakens entity/URL consistency.
- Content inconsistencies (40 vs 45 years, "700+ projects" vs site facts) confuse entity extraction.
- No `x-default` hreflang; no per-article schema.
- `llms.txt`'s stats ("40+ Years", "700+ projects") conflict with on-page "45+ Years" — align.

**Recommended:** individual journal URLs + Article schema; standardize brand facts across site and `llms.txt`; add an FAQ/structured Q&A section; consider a `llms-full.txt` with full article text for premium AI-answer citations.

---

## 9. Agentic Browsing Audit (journey check)

Crawled 14 URLs + followed every internal link on each page (all links resolved; verified status, metadata, headings, images, redirects).

- ✅ All core journeys render SSR and complete: Home → Services → each service → `/#contact`; Portfolio; Journal (overlay opens client-side — works, but not indexable, F-04); Home → About.
- ⚠️ **`/gallery` (in live sitemap) is a broken journey for crawlers** — client-only redirect (F-05). No issue for JS users (redirects to Portfolio).
- ⚠️ Admin sub-routes return 200 without auth (F-23) — functional gate is client-side.
- ⚠️ `tel:`, `mailto:`, WhatsApp deep-link present; social links lack accessible names (A-02).
- ⚠️ Unknown `/services/<x>` → 200 soft-404 (F-10).
- ✅ No broken internal links detected; no orphan public pages except `/gallery` and `/admin/*` (intentionally noindexed).

---

## 10. UX Audit

- **Navigation:** clear top nav (Home/About/Services/Portfolio/Journal/Contact), sticky header, mobile hamburger (fails a11y A-01), "Book Consultation" CTA present.
- **Information architecture:** logical; services each get a dedicated page; portfolio + journal well separated.
- **CTAs:** strong ("Explore Portfolio", "Book a Consultation") and consistently placed.
- **Readability/typography:** elegant display serif (Cormorant) + Inter; letter-spacing-heavy small caps — classy but watch contrast (A-04). Heavy animation (word reveals, 3D tilt, text scramble) risks motion-sensitivity issues (no `prefers-reduced-motion` handling observed — **unable to fully verify**; flag as a WCAG 2.3.3 check).
- **Forms:** contact form has labels, service pre-select via URL (`/?service=Kitchens#contact`), clear success/error toasts. No honeypot/captcha (F-21). Review modal sets moderation flag (✅).
- **Loading/empty/error states:** spinners, "Service Not Found" state (should be noindex, F-10), admin empty tables.
- **Mobile:** responsive throughout; `100svh` hero; large `text-[28vw]` watermark — verify no horizontal overflow on narrow devices (**unable to verify without device rendering**).
- **Search/filters:** no site search; journal has category data but no filter UI (filteredPosts = postsList; category filter unused). Portfolio has horizontal-scroll gallery.

---

## 11. Competitive Benchmark

Competitor set: Bangalore interior-design studios (target terms: "modular kitchen Bangalore", "interior designer Bangalore", "wardrobe design Bangalore").

| Dimension                | Studio Young Designs        | Typical Bangalore competitors (secondary research) |
| ------------------------ | --------------------------- | -------------------------------------------------- |
| SSR/SEO foundation       | ✅ Full SSR, clean URLs     | Mixed — many SPA/one-pager sites                   |
| Schema                   | ✅ Organization JSON-LD     | Often missing or broken                            |
| `llms.txt` + AI-robots   | ✅ Leading                  | Rarely present                                     |
| Individual article pages | ❌ Overlay-only             | Mixed                                              |
| Per-page canonicals      | ❌ Broken (all → home)      | Usually correct                                    |
| Performance payload      | ⚠️ ~790 KB JS               | Varies                                             |
| Contact capture          | ✅ Enquiries table + toasts | Usually mailto/WhatsApp only                       |

**Opportunities:** journal article pages, localized content (Bengaluru neighborhoods), FAQ schema for "modular kitchen cost Bangalore", Google Business Profile linkage (verify — **unable to verify**), and fixing the canonical/sitemap baseline would likely out-rank most local competitors who have weaker technical foundations.

---

## Prioritized Action Plan

### Quick Wins (<30 min)

1. **Fix canonical/OG host mismatch** — align all URLs to `https://www.studioyoungdesigns.com` (or apex), and **deploy the repo's existing per-page canonicals**. _(Do this first — highest ROI.)_
2. Remove `/gallery` from sitemap; add `/portfolio`.
3. `git rm --cached .env.local` (then rotate the publishable key to be safe) — stop tracking secrets.
4. Add `aria-label`s to the hamburger + 5 social links.
5. Set `noindex` on the "Service Not Found" soft-404 branch.

### High Impact Improvements

6. **Rotate/reset the default admin account & password immediately**; enforce strong auth (F-19).
7. Close the `testimonials` moderation bypass with a trigger/policy (F-20).
8. Add `/journal/$slug` article pages + Article/Breadcrumb schema (F-04).
9. Resize hero to WebP <120 KB and preload only the LCP image (F-14/F-15).
10. Trim unused deps/components + heavy libs to cut JS payload (F-13/F-25).

### Medium Priority

11. Tighten CSP (remove `unsafe-inline`/`unsafe-eval`, add `object-src 'none'`, `base-uri`, `form-action`, `frame-ancestors`) (F-22).
12. Server-side auth gate for `/admin/*` (F-23).
13. Add Turnstile/honeypot + rate limit to public forms (F-21).
14. Fix duplicate H2s (F-06); per-page OG/Twitter + 1200×630 og.jpg (F-07).
15. Edge-cache HTML with ISR (F-11/F-17); convert trailing-slash 307→308 (F-12).
16. Font subsetting / self-host (F-16); fix brand-number inconsistency (F-09).
17. Carousel dot labels + focus-visible indicators + reduced-motion handling (A-03/A-05).

### Long-Term Improvements

18. Add tests (Vitest + Testing Library) and CI (GitHub Actions) with lint/typecheck/build gates — eliminates deploy drift.
19. Single package manager (drop duplicate lockfiles); remove dead assets (F-25/F-26).
20. Privacy policy + cookie/consent banner (DPDP/GDPR).
21. PWA: manifest + service worker + offline shell.
22. Per-route `head` util refactor so canonical/OG derive from the request URL once (prevents regression of F-01).
23. Competitive content program: neighborhood + cost-focused articles; FAQ schema; GBP verification.

---

## Optimization Checklist

- [ ] Verify no `admin@studioyoung.in` / default-password account exists in prod; rotate if present
- [ ] Remove `.env.local` from git tracking; rotate keys
- [ ] Deploy per-page canonicals; all URLs on one host
- [ ] Sitemap: drop `/gallery`, add `/portfolio`, fresh `lastmod`, www URLs; resubmit to Search Console
- [ ] `/gallery` → server 308 to `/portfolio`
- [ ] Journal: `/journal/:slug` SSR pages + Article schema + sitemap
- [ ] `noindex` on soft-404 service page
- [ ] Trailing-slash 307 → 308
- [ ] Testimonials RLS trigger forcing `is_approved=false` for anon
- [ ] Honeypot/captcha on contact + review forms
- [ ] Server-side admin auth gate
- [ ] CSP hardening (remove unsafe-eval/inline, add base-uri/object-src/frame-ancestors)
- [ ] Hero image WebP <120 KB; preload only LCP image
- [ ] Remove unused deps (three, recharts, vaul, react-day-picker, cmdk, input-otp, react-resizable-panels) + dead UI components
- [ ] Duplicate-H2 cleanup on 4 service pages
- [ ] Per-page OG/Twitter + 1200×630 og.jpg
- [ ] Add `aria-label`s (hamburger, social links, carousel dots)
- [ ] Focus-visible indicators + `prefers-reduced-motion`
- [ ] ISR HTML caching
- [ ] Font subsetting / self-hosting
- [ ] Brand-fact standardization (45 years; 700+ projects)
- [ ] Privacy policy + consent banner
- [ ] PWA manifest + service worker
- [ ] Tests + CI pipeline; single lockfile
- [ ] Run Lighthouse/axe on desktop + mobile; fix contrast findings

---

## Final Verdict

**Is this production-ready?** **Not yet.** The site is _functional_ and _visually strong_, and its SSR/security/caching foundations are above average. But two findings block a responsible launch: the **canonical bug (F-01)** that breaks indexing of every subpage, and the **default admin credential in the repo (F-19)** that represents an account-takeover risk if the seed was applied.

**What would block launch?**

1. F-01 canonical-to-homepage bug (indexing collapse).
2. F-19 default admin credentials in repo + tracked `.env.local`.
3. S-01 deploy drift (what you test/fix in the repo isn't necessarily what's live).

**Fix immediately (24–48h):** F-01, F-02, F-03 (sitemap), F-19, F-20, A-01/A-02 (cheap a11y wins).

**Improve later:** performance payload (F-13), journal article pages (F-04), CSP hardening (F-22), admin server-auth (F-23), tests + CI.

**Which issues affect Google rankings the most?** F-01 (canonical), F-02 (host mismatch), F-03 (sitemap), F-04 (journal not indexable), F-05 (thin `/gallery`), F-10 (soft-404s).

**Which issues affect security the most?** F-19 (default admin creds), F-20 (testimonial moderation bypass), F-21 (unthrottled forms), F-22 (CSP), F-23 (client-only admin gate).

**Which issues affect user experience the most?** F-13 (heavy JS → jank on mobile), F-14/F-15 (LCP), A-01/A-02 (screen-reader users can't use the menu or socials), F-21 (spam degrades the enquiry experience).

**Unable to verify (flagged honestly):** field Core Web Vitals, HTTP/2 vs HTTP/3 negotiation, exact color-contrast ratios and focus rings without a rendered browser, live Google Search Console data, Google Business Profile linkage, whether the default admin user was actually seeded into production Supabase, and whether the `storage.objects` bucket policies were applied. All other findings above were verified directly against the live site and/or repository.

_Prepared as an independent audit. No code was modified; no destructive actions performed._
