import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Plus } from "lucide-react";
import { properties } from "../data/properties";

gsap.registerPlugin(ScrollTrigger);

// Derived metadata, so the hero copy can never drift out of sync with the
// data it describes: one line of restrained numbering, nothing decorative.
const residenceCount = properties.length;
const countryCount = new Set(
  properties.map((property) => property.country).filter(Boolean)
).size;

// Editorial opening plate for /properties. The entrance is a single
// coordinated timeline (time-based, no scrub on entrance elements) and the
// only scroll-linked tweens are transform-only drifts on two wrapper
// elements that the timeline never touches — so GSAP systems never fight
// over the same properties, and nothing pins or blocks page scrolling.
export default function PropertiesHero() {
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // No tweens, no hidden initial states — the plate renders fully.
    }

    const ctx = gsap.context(() => {
      // Choreography: frame draws first, then text settles in below it.
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        // Metadata strip settles while the top hairline draws across.
        .fromTo(
          ".props-hero__meta",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          0
        )
        .fromTo(
          ".props-hero__rule-h",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.2, ease: "expo.out" },
          0
        )
        // Stroke numeral breathes in behind the composition.
        .fromTo(
          ".props-hero__numeral",
          { opacity: 0 },
          { opacity: 1, duration: 1.6, ease: "power2.out" },
          0.3
        )
        // Eyebrow: tracking tightens as it lands (established AURELIA reveal).
        .fromTo(
          ".props-hero__eyebrow",
          { opacity: 0, y: 16, letterSpacing: "0.5em" },
          { opacity: 1, y: 0, letterSpacing: "0.35em", duration: 1.0 },
          0.25
        )
        // Title: per-line mask reveals, expo settle.
        .fromTo(
          ".props-hero__line > span",
          { yPercent: 112 },
          { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.14 },
          0.4
        )
        // Champagne datum rule draws out of its cross mark.
        .fromTo(
          ".props-hero__lower",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          1.0
        )
        .fromTo(
          ".props-hero__rule-gold",
          { scaleX: 0.05 },
          { scaleX: 1, duration: 1.1 },
          1.0
        )
        // Statement: clip-path collet reveal, sweep handed to inset.
        .fromTo(
          ".props-hero__statement",
          { clipPath: "inset(0% 100% 0% 0%)", y: 14, opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "expo.out",
          },
          1.15
        )
        // Scroll cue arrives last; its arrow then drifts on a gentle loop.
        .fromTo(
          ".props-hero__scrollcue",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          1.45
        );

      const arrow = hero.querySelector(".props-hero__arrow");
      if (arrow) {
        gsap.to(arrow, {
          y: 5,
          duration: 1.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Scroll-linked depth: the title block and the numeral leave at
      // different rates as the hero travels. Transform-only, ease "none",
      // no pin — scrolling is never intercepted. The scrub owns the same
      // elements' y transform alone; the entrance animates their children,
      // so no property is written by two systems.
      const drift = (element, distance) =>
        gsap.to(element, {
          y: distance,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            // "top top" (not "top bottom") so load-time progress is exactly 0 —
            // the hero already sits below the sticky bar when the page opens.
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      drift(".props-hero__titleblock", -26);
      drift(".props-hero__numeral", -64);
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={heroRef}
      className="props-hero"
      aria-labelledby="properties-hero-title"
    >
      {/* Plate columns: hairline frame rules at the content edges */}
      <div className="props-hero__rule-side left-0" aria-hidden="true" />
      <div
        className="props-hero__rule-side right-0 hidden lg:block"
        aria-hidden="true"
      />

      {/* Oversized catalogue numeral, a stroke-only artifact behind the type */}
      <div className="props-hero__numeral" aria-hidden="true">
        01
      </div>

      <div className="relative z-10">
        <p className="props-hero__meta tabular-nums">
          <span>Properties — Index N° 01</span>
          <span>
            {residenceCount} Residences · {countryCount} Countries
          </span>
        </p>
        <div className="props-hero__rule-h" aria-hidden="true" />

        <div className="props-hero__titleblock mt-14">
          <p className="props-hero__eyebrow">The Aurelia Collection</p>
          <h1 id="properties-hero-title" className="props-hero__title">
            <span className="props-hero__line">
              <span>Residences of</span>
            </span>
            <span className="props-hero__line">
              <span>quiet consequence.</span>
            </span>
          </h1>

          <div className="props-hero__lower">
            <div className="props-hero__datum" aria-hidden="true">
              <div className="props-hero__rule-gold" />
              <Plus className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-champagne/60" />
            </div>
            <p className="props-hero__statement">
              A curated selection of architectural residences — catalogued by
              place, material and light.
            </p>
          </div>
        </div>

        <p className="props-hero__scrollcue">
          <span>Scroll to explore</span>
          <ArrowDown
            className="props-hero__arrow h-3.5 w-3.5 text-champagne/70"
            size={14}
            aria-hidden="true"
          />
        </p>
      </div>
    </header>
  );
}
