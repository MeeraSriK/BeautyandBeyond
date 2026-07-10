import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { DeployStatus } from "@/components/DeployStatus";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono-label text-thread mb-4">404 · Page not found</p>
        <h1 className="font-display text-5xl">This page hasn't been booked yet.</h1>
        <Link
          to="/"
          className="mt-8 inline-block border border-ink px-5 py-3 text-sm hover:bg-ink hover:text-linen transition"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">Something went quiet.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 border border-ink px-5 py-2 text-sm hover:bg-ink hover:text-linen"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Beauty & Beyond by Sonia — Narellan Facials, Massage, Brows & Lashes" },
      {
        name: "description",
        content:
          "A solo-practitioner treatment room in Narellan, NSW. Facials, lymphatic & relaxation massage, brows & lashes — consultation before every treatment. By appointment.",
      },
      { property: "og:title", content: "Beauty & Beyond by Sonia — Narellan Facials, Massage, Brows & Lashes" },
      { property: "og:description", content: "A solo-practitioner treatment room in Narellan, NSW. Facials, lymphatic & relaxation massage, brows & lashes — consultation before every treatment. By appointment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Beauty & Beyond by Sonia — Narellan Facials, Massage, Brows & Lashes" },
      { name: "twitter:description", content: "A solo-practitioner treatment room in Narellan, NSW. Facials, lymphatic & relaxation massage, brows & lashes — consultation before every treatment. By appointment." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/59731495-4740-4d32-a224-7861092d9489" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/59731495-4740-4d32-a224-7861092d9489" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,0..100;1,9..144,300..600,0..100&family=Instrument+Serif:ital@0;1&family=Public+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
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
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <DeployStatus />
    </QueryClientProvider>
  );
}
