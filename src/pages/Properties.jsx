import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section from "../components/Section";
import PropertiesHero from "../components/PropertiesHero";
import PropertiesClosing from "../components/PropertiesClosing";
import { properties } from "../data/properties";

gsap.registerPlugin(ScrollTrigger);

// The hero stages the collection's opening plate; the grid keeps the same
// visual language as the Home rail — thin warm-white frame, editorial type,
// champagne rule. The grid's only GSAP work is the scroll reveal below,
// scoped to the grid — it never touches the hero's elements or properties,
// so no two systems animate the same node.
export default function Properties() {
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    // Reduced motion: no reveals and no hidden initial states — the grid
    // renders fully, text included.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".property-card");

      // Hidden initial states live solely inside GSAP (reverted with the
      // context), so content stays visible whenever animations don't run.
      gsap.set(cards, { autoAlpha: 0, y: 40 });
      gsap.set(".property-card__info > h3, .property-card__info > p", {
        autoAlpha: 0,
        y: 12,
      });

      // Fast, clearly visible entrance: quick fade + 40px rise with a short
      // stagger, fired the moment a card's FIRST pixel enters the viewport
      // ("top bottom" — no dead zone where a card sits unanimated inside the
      // viewport). fromTo makes every re-entry visibly replay (e.g. when the
      // user scrolls back up past a batch), and no `once` means nothing
      // latches shut: repeated visits re-run the whole reveal.
      const reveal = (batch) => {
        gsap.fromTo(
          batch,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.1,
            overwrite: true,
          }
        );
        batch.forEach((card) => {
          gsap.fromTo(
            card.querySelectorAll(
              ".property-card__info > h3, .property-card__info > p"
            ),
            { autoAlpha: 0, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              ease: "power3.out",
              stagger: 0.05,
              delay: 0.08,
              overwrite: true,
            }
          );
        });
      };

      ScrollTrigger.batch(cards, {
        start: "top bottom",
        onEnter: reveal, // scrolled down: card enters from below
        onEnterBack: reveal, // scrolled up: card enters from either edge
      });
    }, grid);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Section>
        <PropertiesHero />

        <ul
          ref={gridRef}
          id="collection-grid"
          className="mt-16 grid grid-cols-1 justify-items-center gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {properties.map((property, index) => (
            <li
              key={property.order}
              className="property-card w-full max-w-[420px]"
            >
              <Link
                to={`/properties/${property.slug}`}
                className="group block overflow-hidden rounded-[18px] border border-warm-white/10 bg-[#17140f] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)] transition-colors duration-300 hover:border-warm-white/25 focus-visible:border-champagne"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-warm-white/5">
                  <img
                    // Tailwind v4 emits scale-* utilities as the standalone CSS
                    // `scale` property (not transform), so the transition list
                    // must name `scale` for the zoom to animate instead of
                    // snapping instantly.
                    className="h-full w-full object-cover transition-[scale,filter] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07] group-hover:brightness-[1.04]"
                    src={property.image}
                    alt={`${property.name}, ${property.location}`}
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
                <div className="property-card__info p-5">
                  <h3 className="m-0 font-display text-xl font-medium tracking-tight text-warm-white">
                    {property.name}
                  </h3>
                  <p className="mt-1 text-sm tracking-[0.05em] text-warm-white/50">
                    {property.location}
                  </p>
                  <div
                    className="mt-4 h-px bg-champagne/45"
                    aria-hidden="true"
                  />
                  <div className="mt-3 flex items-baseline justify-between gap-4">
                    <p className="m-0 font-display text-[10px] font-bold tracking-[0.28em] uppercase text-warm-white/75">
                      {property.category}
                    </p>
                    <p className="m-0 text-[10px] tracking-[0.16em] uppercase text-warm-white/40">
                      {property.beds ? `${property.beds} bed` : null}
                      {property.beds && property.areaLabel ? " · " : null}
                      {property.areaLabel}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      {/* Outside the Section wrapper: the closing plate sets its own margins. */}
      <PropertiesClosing />
    </>
  );
}