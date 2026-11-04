import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Section 03 — the closing statement. A quiet editorial composition that
// hands the page to the shared Footer: obsidian ground, one champagne rule,
// one serif statement. The entrance is a single viewport-triggered timeline
// that plays once and reverses on re-entry — never pinned, never scrubbed.
// Reduced motion gets no trigger and no hidden initial states.
export default function ContactClosing() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        })
        .fromTo(
          ".contact-closing__eyebrow",
          { opacity: 0, y: 12, letterSpacing: "0.5em" },
          { opacity: 1, y: 0, letterSpacing: "0.35em", duration: 0.9, ease: "power3.out" },
          0
        )
        .fromTo(
          ".contact-closing__title .contact__title-line > span",
          { yPercent: 112 },
          { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.14 },
          0.15
        )
        .fromTo(
          ".contact-closing__rule-gold",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: "expo.out" },
          0.55
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="contact-closing"
      aria-labelledby="contact-closing-title"
    >
      <p className="contact__eyebrow contact-closing__eyebrow">AURELIA</p>
      <h2 id="contact-closing-title" className="contact-closing__title">
        <span className="contact__title-line">
          <span>Some conversations lead</span>
        </span>
        <span className="contact__title-line">
          <span>somewhere extraordinary.</span>
        </span>
      </h2>
      <div className="contact__rule-gold contact-closing__rule-gold" aria-hidden="true" />
    </section>
  );
}
