import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Section 04 — The Collection. The closing plate: strong editorial
// typography, then a full-bleed architectural image that runs edge to edge
// before handing off to the footer. One entrance timeline as the section
// approaches; no pinned content, no scroll interception.
export default function AboutCollection() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const plate = ref.current;
    if (!plate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: plate, start: "top 72%", once: true },
        })
        .fromTo(
          ".about-collection__eyebrow",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8 },
          0
        )
        .fromTo(
          ".about-collection__title .about__title-line > span",
          { yPercent: 112 },
          { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.14 },
          0.1
        )
        .fromTo(
          ".about-collection__rule-gold",
          { scaleX: 0.05 },
          { scaleX: 1, duration: 1.0, ease: "expo.out" },
          0.45
        )
        .fromTo(
          ".about-collection__desc",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          0.55
        )
        .fromTo(
          ".about-collection__cta",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          0.7
        )
        // The closing image rises out of a top mask — the low, wide sweep
        // that leads the eye across the full width before the footer.
        .fromTo(
          ".about-collection__media",
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.out" },
          0.25
        )
        .fromTo(
          ".about-collection__img",
          { scale: 1.14 },
          { scale: 1, duration: 1.8, ease: "expo.out" },
          0.25
        );
    }, plate);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="about-collection about"
      aria-labelledby="about-collection-title"
    >
      <div className="about-collection__head">
        <p className="about__eyebrow about-collection__eyebrow">
          The Collection
        </p>
        <h2
          id="about-collection-title"
          className="about__title about-collection__title"
        >
          <span className="about__title-line">
            <span>Different places.</span>
          </span>
          <span className="about__title-line">
            <span>One perspective.</span>
          </span>
        </h2>
        <div className="about-collection__rule-gold" aria-hidden="true">
          <div className="about__rule-gold" />
        </div>
        <p className="about__body about-collection__desc">
          Every residence has a story. We bring the exceptional ones into
          focus.
        </p>

        <Link to="/properties" className="about__cta about-collection__cta">
          <span>Explore the Collection</span>
          <ArrowUpRight
            className="about__cta-arrow h-3.5 w-3.5 text-champagne/80"
            size={14}
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="about__media about-collection__media">
        <img
          className="about__img about-collection__img"
          src="/images/The Collection.jpg"
          alt="Exceptional residences gathered under one perspective"
          loading="lazy"
          decoding="async"
        />
      </div>
      <p className="about__caption about-collection__caption">
        Fig. 03 — The Aurelis Collection
      </p>
    </section>
  );
}
