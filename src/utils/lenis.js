import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Single site-wide smooth-scroll controller (no competing RAF loops: Lenis's
// update is driven by GSAP's ticker, and ScrollTrigger is fed by Lenis's
// scroll event — the exact integration from the Lenis docs). Lenis runs on
// native scroll, so sticky positioning, accessibility and keyboard scrolling
// keep working; touch input stays native (syncTouch is off by default), which
// is the right mobile behavior with pinned ScrollTriggers below.
//
// Programmatic scrolls (route changes, back-to-top) and anchor links must go
// through this instance, otherwise Lenis's own raf loop would override any
// external window.scrollTo — so it is shared via getLenis().
let lenis = null;
let teardown = null;

export function initLenis() {
  if (lenis) return lenis;

  lenis = new Lenis({
    autoRaf: false, // driven by gsap.ticker below
    anchors: true, // hero CTA's #properties anchor scrolls smoothly
    duration: 1.15,
    stopInertiaOnNavigate: true, // route clicks don't coast through transitions
  });

  lenis.on("scroll", ScrollTrigger.update);

  // TEMP-VERIFY: exposes the controller so headless scroll probes can drive
  // Lenis directly instead of fighting it with window.scrollTo. Removed after
  // browser verification.
  window.__lenis = lenis;

  const raf = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  teardown = () => {
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(1, 100);
    lenis.destroy();
    lenis = null;
    delete window.__lenis;
  };

  return lenis;
}

export function getLenis() {
  return lenis;
}
