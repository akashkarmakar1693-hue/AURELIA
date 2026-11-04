import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { NavLink } from "react-router-dom";
import { whenFontsReady } from "../utils/fontsReady";

const links = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  // Opening beat: the bar is hidden pre-paint, then revealed once the
  // document fonts have settled (capped) — so the wordmark never swaps face
  // mid-entrance. Time-based (like the Home opening), never scroll-linked:
  // the navbar is site chrome, not part of the page's scrub choreography.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let tween = null;
    gsap.set(el, { opacity: 0, y: -10 });
    whenFontsReady().then(() => {
      if (cancelled) return;
      tween = gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" });
    });

    return () => {
      cancelled = true;
      tween?.kill();
      gsap.set(el, { clearProps: "all" });
    };
  }, []);

  // -mb-18 (-72px) cancels the header's own height (py-6 + 24px row) so the
  // transparent bar overlays the Hero instead of pushing it down.
  return (
    <header ref={headerRef} className="sticky top-0 z-40 -mb-18">
      <nav aria-label="Primary" className="flex items-center justify-between px-[5vw] py-6">
        <NavLink to="/" className="wordmark text-base font-bold text-warm-white">
          AURELIS
        </NavLink>

        <button
          className="flex h-5 w-5 flex-col justify-center gap-[5px] sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label="Toggle menu"
        >
          <span className="h-[1.5px] w-full rounded bg-warm-white/70 transition-opacity" style={{ opacity: open ? 0 : 1 }} />
          <span className="h-[1.5px] w-full rounded bg-warm-white/70" />
          <span className="h-[1.5px] w-full rounded bg-warm-white/70 transition-opacity" style={{ opacity: open ? 0 : 1 }} />
        </button>

        <ul
          id="nav-menu"
          className={`absolute left-0 right-0 top-full flex flex-col gap-0 border-b border-warm-white/10 bg-obsidian/70 px-6 py-6 transition-opacity sm:static sm:flex sm:flex-row sm:items-center sm:gap-8 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 ${open ? "opacity-100" : "opacity-0 sm:opacity-100"}`}
        >
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm transition-colors ${isActive ? "text-champagne" : "text-warm-white/50 hover:text-champagne"}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
