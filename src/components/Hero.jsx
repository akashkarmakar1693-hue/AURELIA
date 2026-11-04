import { useRef } from "react";

const HERO_IMAGE = "/images/hero-architectural.webp";

export default function Hero() {
  const heroRef = useRef(null);

  return (
    <section ref={heroRef} className="hero" aria-label="Hero">
      <div className="hero__media">
        <img
          src={HERO_IMAGE}
          alt="A contemporary architectural residence framed by landscape"
          className="hero__image"
          loading="eager"
          fetchPriority="high"
          width={1672}
          height={941}
        />
        <div className="hero__gradient" />
        <div className="hero__overlay" />
      </div>

      <span className="hero__cue" aria-hidden="true">↓</span>

      <div className="hero__content">
        <p className="hero__eyebrow">La Réserve</p>
        <h1 className="hero__title">
          <span className="hero__title-line">
            <span>Architecture</span>
          </span>
          <span className="hero__title-line">
            <span>&amp; Landscape</span>
          </span>
        </h1>
        <div className="hero__rule" aria-hidden="true" />
        <div className="hero__foot">
          <p className="hero__lead">Curated residences of quiet distinction.</p>
          <a href="#properties" className="hero__cta">
            View Collection
            <span className="hero__cta-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
