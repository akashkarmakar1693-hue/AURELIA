import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { initLenis, getLenis } from "../utils/lenis";
import { applyPageMetadata } from "../utils/seo";

export default function RootLayout() {
  const { pathname } = useLocation();

  // Route-aware title, description, canonical and social metadata. This is a
  // client-rendered Vite SPA, so every route serves the same index.html; the
  // defaults there are replaced here as soon as the route is known.
  useLayoutEffect(() => {
    applyPageMetadata(pathname);
  }, [pathname]);

  // One site-wide smooth-scroll controller (see utils/lenis.js for the
  // ticker hookup details).
  useLayoutEffect(() => {
    initLenis();
  }, []);

  // Client-side routing keeps the window scroll between routes. Leaving Home
  // (tens of thousands of px tall) for a short page would clamp the stale
  // offset to the new document bottom — landing on the footer with the page
  // content off-screen. Reset before paint on every route change, through
  // Lenis when it is running (window.scrollTo would be overridden by the
  // controller's raf loop); immediate so the new page measures from the top.
  useLayoutEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-champagne focus:px-4 focus:py-2 focus:text-obsidian"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
