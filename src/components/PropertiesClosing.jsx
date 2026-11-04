import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Reuses an unused asset already shipped in /public — quiet villa at dusk,
// symmetrical composition with clear sky above and dark water below, so the
// text plinth lower-left never fights the architecture for detail.
const ENQUIRY_IMAGE = "/images/perspective.jpg";

// The editorial back page of /properties: one framed plate, one headline,
// one CTA. The entrance timeline is viewport-triggered (no pin, no scrub on
// text), the only scroll-linked work is a shallow transform-only parallax
// on the image, and every element keeps its final state once revealed.
export default function PropertiesClosing() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    // Reduced motion: no tweens, no hidden initial states — the plate and
    // its words render in place.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            // Plays once on approach and stays; no reverse to fight scrolling.
            toggleActions: "play none none none",
          },
        })
        // The crop opens out: at rest it is already the finished crop, and the
        // tween's from-state lives only inside GSAP.
        .fromTo(
          ".closing__media",
          { clipPath: "inset(4% 6% 14% 6%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out" },
          0
        )
        .fromTo(
          ".closing__rule",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.0, ease: "power3.out" },
          0.35
        )
        .fromTo(
          ".closing__eyebrow",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
          0.45
        )
        // Headline: one restrained rise, no masks or per-letter theatrics.
        .fromTo(
          ".closing__title",
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 1.1, ease: "expo.out" },
          0.6
        )
        .fromTo(
          ".closing__copy",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
          0.85
        )
        .fromTo(
          ".closing__actions > *",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 },
          1.05
        );

      // Shallow image parallax, scrubbed 1:1. The entrance owns the media
      // wrapper's clip-path; this owns only the img's transform, so no two
      // systems write the same element. ±4% of the 116%-tall crop stays
      // well inside the frame — no gaps, no layout effect.
      gsap.fromTo(
        ".closing__img",
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const returnToCollection = (event) => {
    event.currentTarget.blur(); // Don't leave focus on a scrolling control.
    const grid = document.getElementById("collection-grid");
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      grid.scrollIntoView(); // Instant — CSS scroll-behavior defaults to auto.
      return;
    }
    // Controlled tween instead of native smooth scroll (same reasoning as
    // the Footer's back-to-top): browsers stretch native smooth scrolling
    // with distance and it reads as a stall.
    gsap.to(window, {
      scrollTo: { y: grid, offsetY: 24 },
      duration: 1.4,
      ease: "power2.inOut",
      overwrite: true,
    });
  };

  return (
    <section
      ref={sectionRef}
      className="closing"
      aria-labelledby="closing-title"
    >
      <div className="closing__stage">
        <div className="closing__media">
          <img
            className="closing__img"
            src={ENQUIRY_IMAGE}
            alt="Modern villa at dusk with an infinity pool reflecting the evening sky"
            loading="lazy"
            decoding="async"
          />
          <div className="closing__veil" aria-hidden="true" />
        </div>

        <div className="closing__content">
          <div className="closing__rule" aria-hidden="true" />
          <p className="closing__eyebrow">AURELIS / PRIVATE ENQUIRIES</p>
          <h2 id="closing-title" className="closing__title">
            Some places stay with you.
          </h2>
          <p className="closing__copy">
            Discover a residence that reflects your perspective on living. Our
            team is available to guide your next step.
          </p>
          <div className="closing__actions">
            <Link to="/contact" className="closing__cta">
              Make an Enquiry
              <span className="closing__cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <button
              type="button"
              onClick={returnToCollection}
              className="closing__secondary"
            >
              Return to Collection
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
