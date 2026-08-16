import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportError } from "../lib/error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { SpeedInsights } from "@vercel/speed-insights/react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const siteUrl = "https://www.studioyoungdesigns.com";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Studio Young Designs — Bespoke Interiors, Bangalore" },
      {
        name: "description",
        content:
          "For over 40 years, Studio Young Designs has crafted timeless interiors, modular kitchens, and custom furniture across Bangalore.",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "author", content: "Studio Young Designs" },
      { property: "og:title", content: "Studio Young Designs — 40+ Years of Bespoke Interiors" },
      {
        property: "og:description",
        content:
          "Timeless interior design, modular kitchens, custom wardrobes and living spaces — crafted in Bangalore since 1981.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: `${siteUrl}/og.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "alternate", hrefLang: "en", href: siteUrl },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Great+Vibes&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const schemaOrgJSON = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "InteriorDesigner", "HomeGoodsStore"],
        "@id": "https://www.studioyoungdesigns.com/#organization",
        name: "Studio Young Designs",
        url: "https://www.studioyoungdesigns.com",
        logo: "https://www.studioyoungdesigns.com/logo-transparent.png",
        image: "https://www.studioyoungdesigns.com/og.jpg",
        description:
          "Bespoke luxury interior design, modular kitchens, custom walk-in wardrobes, custom woodwork, and turnkey residential execution in Bangalore since 1981.",
        telephone: "+91-9902599515",
        email: "info@studioyoungdesigns.com",
        priceRange: "₹₹₹₹",
        address: {
          "@type": "PostalAddress",
          streetAddress: "No.105, Parvathi Plaza, Richmond Rd, Richmond Town",
          addressLocality: "Bengaluru",
          addressRegion: "Karnataka",
          postalCode: "560025",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 12.9606,
          longitude: 77.6011,
        },
        areaServed: [
          { "@type": "City", name: "Bengaluru" },
          { "@type": "AdministrativeArea", name: "Richmond Town" },
          { "@type": "AdministrativeArea", name: "Indiranagar" },
          { "@type": "AdministrativeArea", name: "Koramangala" },
          { "@type": "AdministrativeArea", name: "Whitefield" },
          { "@type": "AdministrativeArea", name: "Sadashivanagar" },
          { "@type": "AdministrativeArea", name: "HSR Layout" },
          { "@type": "AdministrativeArea", name: "Dollar Colony" },
          { "@type": "AdministrativeArea", name: "Jayanagar" },
          { "@type": "City", name: "Chennai" },
          { "@type": "City", name: "Hyderabad" },
        ],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "10:30",
            closes: "20:00",
          },
        ],
        founder: [
          {
            "@type": "Person",
            name: "Dhanesh Samant",
            jobTitle: "Founder",
          },
          {
            "@type": "Person",
            name: "Geeta Samant",
            jobTitle: "Co-Founder",
          },
        ],
        knowsAbout: [
          "Modular Kitchens",
          "Custom Wardrobes",
          "Turnkey Residential Interiors",
          "Luxury Living Room Design",
          "Bespoke Furniture Manufacturing",
          "Woodwork & Architectural Carpentry",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Interior Design & Woodwork Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Modular Kitchens",
                description:
                  "German hardware, soft-close Blum/Hettich fittings, marine plywood, quartz countertops, and custom veneer finishes.",
                url: "https://www.studioyoungdesigns.com/services/kitchens",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Custom Walk-in Wardrobes",
                description:
                  "Bespoke floor-to-ceiling closets, sliding wardrobes, illuminated dressers, and solid wood joinery.",
                url: "https://www.studioyoungdesigns.com/services/wardrobes",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Living Room Interiors",
                description:
                  "Custom TV consoles, acoustic wood paneling, false ceiling design, partition walls, and dining furniture.",
                url: "https://www.studioyoungdesigns.com/services/living-spaces",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Turnkey Residential Interiors",
                description:
                  "End-to-end luxury home interiors for apartments, villas, and penthouses with in-house manufacturing.",
                url: "https://www.studioyoungdesigns.com/services/interiors",
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KW3R88RC');`,
          }}
        />
        {/* End Google Tag Manager */}
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-50WQYWJB49" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-50WQYWJB49');`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);})();`,
          }}
        />
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSON) }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KW3R88RC"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Force top scroll immediately
    window.scrollTo(0, 0);

    const handleResetScroll = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("beforeunload", handleResetScroll);
    window.addEventListener("pagehide", handleResetScroll);

    return () => {
      window.removeEventListener("beforeunload", handleResetScroll);
      window.removeEventListener("pagehide", handleResetScroll);
    };
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScrollProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </SmoothScrollProvider>
      <Toaster position="bottom-right" richColors />
      <SpeedInsights />
    </QueryClientProvider>
  );
}
