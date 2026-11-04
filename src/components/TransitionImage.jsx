import { Link } from "react-router-dom";

const TRANSITION_IMAGE = "/images/architecture-statement.jpg";

// Statement layer of the Hero → Statement transition. Its scroll animation is
// owned by the transition stage in Home (single scrubbed GSAP timeline).
export default function TransitionImage() {
  return (
    <section className="transition" aria-label="Aurelis">
      <div className="transition__image">
        <img
          src={TRANSITION_IMAGE}
          alt="A wide architectural landscape with open sky and ocean"
          className="transition__image-img"
          loading="eager"
          fetchPriority="high"
          width={2400}
          height={1350}
        />
      </div>

      {/* Darkening veil: fades the Statement into the Collection's charcoal */}
      <div className="transition__veil" aria-hidden="true" />

      <div className="transition__content">
        <p className="transition__eyebrow">AURELIS / PRIVATE RESIDENCES</p>
        <h2 className="transition__headline">
          <span className="transition__headline-inner">
            Architecture shaped around the way you live.
          </span>
        </h2>
        <p className="transition__lead">
          Considered residences shaped by architecture, landscape and place.
        </p>
        <Link to="/properties" className="transition__cta">
          Discover Aurelis
          <span className="transition__cta-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
