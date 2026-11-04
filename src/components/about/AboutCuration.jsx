import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Section 03 — The Art of Curation. Three image-led compositions on a
// 12-column field, each proportioned and placed differently — editorial
// numbering beneath each plate, never a boxed card. Each composition
// reveals on its own viewport trigger so nothing waits on its neighbours.
const COMPOSITIONS = [
  {
    key: "one",
    index: "01",
    name: "Architecture",
    line: "Form, proportion and detail.",
    image: "/images/The Art of Curation 1.jpg",
    alt: "Architectural study of form and proportion",
    mediaClass: "aspect-[3/4]",
  },
  {
    key: "two",
    index: "02",
    name: "Setting",
    line: "An enduring connection to place.",
    image: "/images/The Art of Curation 2.jpg",
    alt: "A residence held within its landscape",
    mediaClass: "aspect-[4/5]",
  },
  {
    key: "three",
    index: "03",
    name: "Experience",
    line: "Spaces made for living.",
    image: "/images/The Art of Curation 3.jpg",
    alt: "A living space shaped for daily experience",
    mediaClass: "aspect-[5/3]",
  },
];

export default function AboutCuration() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const plate = ref.current;
    if (!plate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Headline block: staged before the compositions beneath it.
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: ".about-cur__head", start: "top 82%", once: true },
        })
        .fromTo(
          ".about-cur__eyebrow",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8 },
          0
        )
        .fromTo(
          ".about-cur__title .about__title-line > span",
          { yPercent: 112 },
          { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.14 },
          0.15
        );

      // Compositions: each answers for its own reveal — clip sweep,
      // counter-scale settle, then its numbering and name.
      gsap.utils.toArray(".about-cur__item").forEach((item) => {
        const media = item.querySelector(".about-cur__media");
        const img = item.querySelector(".about-cur__img");
        const texts = item.querySelectorAll(
          ".about-cur__index, .about-cur__name, .about-cur__line, .about-cur__rule"
        );
        if (!media || !img) return;

        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: item, start: "top 86%", once: true },
          })
          .fromTo(
            media,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out" },
            0
          )
          .fromTo(
            img,
            { scale: 1.16 },
            { scale: 1, duration: 1.6, ease: "expo.out" },
            0
          )
          .fromTo(
            texts,
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 },
            0.4
          );
      });
    }, plate);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="about-cur about"
      aria-labelledby="about-curation-title"
    >
      <div className="about-cur__head">
        <p className="about__eyebrow about-cur__eyebrow">The Art of Curation</p>
        <h2
          id="about-curation-title"
          className="about__title about-cur__title"
        >
          <span className="about__title-line">
            <span>Considered.</span>
          </span>
          <span className="about__title-line">
            <span>Selected. Presented.</span>
          </span>
        </h2>
      </div>

      <div className="about-cur__grid">
        {COMPOSITIONS.map((composition) => (
          <article
            key={composition.key}
            className={`about-cur__item about-cur__item--${composition.key}`}
          >
            <div className={`about__media about__media--hover about-cur__media ${composition.mediaClass}`}>
              <img
                className="about__img about-cur__img"
                src={composition.image}
                alt={composition.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="about-cur__index">{composition.index}</p>
            <h3 className="about-cur__name">{composition.name}</h3>
            <p className="about-cur__line">{composition.line}</p>
            <div className="about-cur__rule" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}
