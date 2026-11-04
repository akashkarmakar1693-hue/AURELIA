import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Section 02 — The Philosophy. Asymmetric two-column composition: the image
// column carries the weight while the text column lands lower against it.
// Entrance reveals run once as the section approaches the viewport; the
// media's scrub-driven drift never touches the clip-path the entrance owns.
export default function AboutPhilosophy() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const plate = ref.current;
    if (!plate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: plate, start: "top 78%", once: true },
        })
        // Image lifts out of a bottom mask — a different sweep than the
        // section above, so consecutive reveals don't repeat themselves.
        .fromTo(
          ".about-philosophy__media",
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.out" },
          0
        )
        .fromTo(
          ".about-philosophy__img",
          { scale: 1.16 },
          { scale: 1, duration: 1.7, ease: "expo.out" },
          0
        )
        .fromTo(
          ".about-philosophy__eyebrow",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8 },
          0.25
        )
        .fromTo(
          ".about-philosophy__title .about__title-line > span",
          { yPercent: 112 },
          { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.13 },
          0.35
        )
        .fromTo(
          ".about-philosophy__body",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 },
          0.6
        )
        .fromTo(
          ".about-philosophy__rule-gold",
          { scaleX: 0.05 },
          { scaleX: 1, duration: 1.1, ease: "expo.out" },
          0.75
        )
        .fromTo(
          ".about-philosophy__caption",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          0.8
        );

      // Parallax: restrained drift on the media plate only, transform-only.
      gsap.to(".about-philosophy__media", {
        y: -26,
        ease: "none",
        scrollTrigger: {
          trigger: plate,
          start: "top bottom",
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
      className="about-philosophy about"
      aria-labelledby="about-philosophy-title"
    >
      <div className="about__numeral about-philosophy__numeral" aria-hidden="true">
        02
      </div>

      <div className="about-philosophy__grid">
        <div>
          <div className="about__media about-philosophy__media">
            <img
              className="about__img about-philosophy__img"
              src="/images/Philosophy.jpg"
              alt="Considered residential interior in warm natural light"
              loading="lazy"
              decoding="async"
            />
          </div>
          <p className="about__caption about-philosophy__caption">
            Fig. 02 — Architecture with intention
          </p>
        </div>

        <div className="about-philosophy__text">
          <p className="about__eyebrow about-philosophy__eyebrow">
            The Philosophy
          </p>
          <h2
            id="about-philosophy-title"
            className="about__title about-philosophy__title"
          >
            <span className="about__title-line">
              <span>Places with</span>
            </span>
            <span className="about__title-line">
              <span>purpose.</span>
            </span>
          </h2>
          <p className="about__body about-philosophy__body">
            Exceptional residences bring together architecture with intention,
            a meaningful connection to their surroundings, and spaces shaped
            around the experience of living.
          </p>
          <div className="about-philosophy__rule-gold" aria-hidden="true">
            <div className="about__rule-gold" />
          </div>
        </div>
      </div>
    </section>
  );
}
