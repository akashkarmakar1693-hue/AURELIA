import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Section 01 — The Perspective. The opening plate of /about: an editorial
// meta strip frames the section, the headline holds the left column while
// the large architectural image anchors the right. The entrance is a single
// time-based timeline; the only scroll-linked tween is a transform-only
// drift on the media plate, so the two never write the same property.
export default function AboutHero() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const plate = ref.current;
    if (!plate) return;
    // Reduced motion: no tweens, no hidden initial states — render fully.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        // Meta strip settles as the hairline draws across.
        .fromTo(
          ".about__meta",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          0
        )
        .fromTo(
          ".about-hero__rule",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.2, ease: "expo.out" },
          0
        )
        // Eyebrow: tracking tightens as it lands (established AURELIS reveal).
        .fromTo(
          ".about-hero__eyebrow",
          { opacity: 0, y: 14, letterSpacing: "0.5em" },
          { opacity: 1, y: 0, letterSpacing: "0.35em", duration: 1.0 },
          0.2
        )
        // Headline: per-line mask reveals, expo settle.
        .fromTo(
          ".about-hero__title .about__title-line > span",
          { yPercent: 112 },
          { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.14 },
          0.35
        )
        .fromTo(
          ".about-hero__datum",
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          0.7
        )
        .fromTo(
          ".about-hero__lead",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          0.85
        )
        // Image: clip-path sweep with a counter-scale settle underneath.
        .fromTo(
          ".about-hero__media",
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.out" },
          0.4
        )
        .fromTo(
          ".about-hero__img",
          { scale: 1.18 },
          { scale: 1, duration: 1.7, ease: "expo.out" },
          0.4
        )
        .fromTo(
          ".about-hero__caption",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          1.2
        );

      // Scroll depth: the media leaves at its own rate as the plate travels.
      gsap.to(".about-hero__media", {
        y: -34,
        ease: "none",
        scrollTrigger: {
          trigger: plate,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, plate);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="about-hero about"
      aria-labelledby="about-perspective-title"
    >
      <p className="about__meta">
        <span>AURELIS / OUR PERSPECTIVE</span>
        <span>01 — The Perspective</span>
      </p>
      <div className="about__rule about-hero__rule" aria-hidden="true" />

      <div className="about-hero__grid">
        <div>
          <p className="about__eyebrow about-hero__eyebrow">The Perspective</p>
          <h1
            id="about-perspective-title"
            className="about__title about-hero__title"
          >
            <span className="about__title-line">
              <span>Beyond</span>
            </span>
            <span className="about__title-line">
              <span>the ordinary.</span>
            </span>
          </h1>
          <div className="about-hero__datum" aria-hidden="true">
            <div className="about__rule-gold" />
          </div>
          <p className="about__lead about-hero__lead">
            We believe exceptional living begins with finding a place that
            feels entirely its own.
          </p>
        </div>

        <div>
          <div className="about__media about-hero__media">
            <img
              className="about__img about-hero__img"
              src="/images/perspective.jpg"
              alt="Monolithic architectural facade, seen from below against the sky"
              loading="eager"
              decoding="async"
            />
          </div>
          <p className="about__caption about-hero__caption">
            Fig. 01 — Form, material, light
          </p>
        </div>
      </div>
    </section>
  );
}
