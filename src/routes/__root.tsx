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

const siteUrl = "https://studioyoungdesigns.com";

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
      { rel: "canonical", href: siteUrl },
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
    "@type": "HomeAndConstructionBusiness",
    name: "Studio Young Designs",
    url: "https://studioyoungdesigns.com",
    logo: "https://studioyoungdesigns.com/logo-transparent.png",
    image: "https://studioyoungdesigns.com/og.jpg",
    description:
      "Bespoke luxury interior design, modular kitchens, custom walk-in wardrobes, and turnkey residential execution in Bangalore since 1981.",
    telephone: "+91-9902599515",
    email: "info@studioyoungdesigns.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "No.105, Parvathi Plaza, Richmond Rd, Richmond Town",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560025",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:30",
      closes: "20:00",
    },
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
    ],
  };

  return (
    <html lang="en">
      <head>
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

    const isHomePage = location.pathname === "/" || location.pathname === "";

    let userTouched = false;

    // Detect actual physical user interaction (wheel, touch, arrow keys)
    const onUserInteract = () => {
      userTouched = true;
    };

    window.addEventListener("wheel", onUserInteract, { passive: true });
    window.addEventListener("touchmove", onUserInteract, { passive: true });
    window.addEventListener("pointerdown", onUserInteract, { passive: true });
    window.addEventListener("keydown", onUserInteract, { passive: true });

    let autoScrollTimer: any;

    // Auto-scroll gently after 2s ONLY for inner subpages (About, Gallery, Services, Journal)
    if (!isHomePage) {
      autoScrollTimer = setTimeout(() => {
        if (!userTouched) {
          const targetY = Math.round(window.innerHeight * 0.45);
          window.scrollTo({
            top: targetY > 150 ? targetY : 380,
            behavior: "smooth",
          });
        }
      }, 2000);
    }

    const handleResetScroll = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("beforeunload", handleResetScroll);
    window.addEventListener("pagehide", handleResetScroll);

    return () => {
      clearTimeout(autoScrollTimer);
      window.removeEventListener("wheel", onUserInteract);
      window.removeEventListener("touchmove", onUserInteract);
      window.removeEventListener("pointerdown", onUserInteract);
      window.removeEventListener("keydown", onUserInteract);
      window.removeEventListener("beforeunload", handleResetScroll);
      window.removeEventListener("pagehide", handleResetScroll);
    };
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  );
}
