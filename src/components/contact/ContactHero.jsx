import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Section 01 — the opening statement. Editorial plate in the About
// vocabulary: the eyebrow frames the section, the serif headline owns the
// left column while the architectural media plate anchors the right under a
// dark veil. The entrance is a single time-based timeline fired on mount —
// no pinning, no scrub, so it can never interact with page scrolling.
// Reduced motion gets no tweens and no hidden initial states, so the
// section renders fully visible.
export default function ContactHero() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          ".contact-hero__eyebrow",
          { autoAlpha: 0, y: 12, letterSpacing: "0.5em" },
          { autoAlpha: 1, y: 0, letterSpacing: "0.35em", duration: 0.9, ease: "power3.out" },
          0
        )
        // Headline: per-line mask reveals, expo settle.
        .fromTo(
          ".contact-hero__title .contact__title-line > span",
          { yPercent: 112 },
          { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.14 },
          0.25
        )
        .fromTo(
          ".contact-hero__rule-gold",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: "expo.out" },
          0.6
        )
        .fromTo(
          ".contact-hero__lead",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          0.85
        )
        // Image: clip-path sweep with a counter-scale settle underneath.
        .fromTo(
          ".contact-hero__media",
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.out" },
          0.35
        )
        .fromTo(
          ".contact-hero__img",
          { scale: 1.14 },
          { scale: 1, duration: 1.7, ease: "expo.out" },
          0.35
        )
        .fromTo(
          ".contact-hero__caption",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          1.15
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="contact-hero" aria-labelledby="contact-hero-title">
      <p className="contact__eyebrow contact-hero__eyebrow">Private Enquiries</p>

      <div className="contact-hero__grid">
        <div>
          <h1 id="contact-hero-title" className="contact-hero__title">
            <span className="contact__title-line">
              <span>Every exceptional place</span>
            </span>
            <span className="contact__title-line">
              <span>begins with a conversation.</span>
            </span>
          </h1>
          <div className="contact__rule-gold contact-hero__rule-gold" aria-hidden="true" />
          <p className="contact-hero__lead">
            Whether you have a particular residence in mind or would simply like
            to learn more about AURELIS, we welcome your enquiry.
          </p>
        </div>

        <figure>
          <div className="contact-hero__media">
            <img
              className="contact-hero__img"
              src="/images/Philosophy.jpg"
              alt="Concrete architectural pavilion with full-height glazing, framed by mature trees in warm evening light"
              loading="eager"
              decoding="async"
            />
          </div>
          <figcaption className="contact-hero__caption">
            Fig. 01 — Where every conversation begins
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
