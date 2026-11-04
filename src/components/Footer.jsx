import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { getLenis } from "../utils/lenis";

gsap.registerPlugin(ScrollToPlugin);

const exploreLinks = [
  { to: "/properties", label: "Properties" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const handleBackToTop = (event) => {
    // Drop focus before the scroll: on Home the footer becomes inert again
    // as soon as the reveal window is left, so focus must not rest inside it.
    event.currentTarget.blur();
    // Lenis, when running, owns the window scroll — route programmatic moves
    // through it (reduced-motion users get an instant jump automatically).
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 2) });
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0);
      return;
    }
    // A controlled tween instead of native smooth scrolling: the Home page is
    // tens of thousands of pixels tall, and browsers scale native smooth
    // scroll duration with distance, which reads as a stall.
    gsap.to(window, {
      scrollTo: 0,
      duration: 1.2,
      ease: "power2.inOut",
      overwrite: true,
    });
  };

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <p className="footer__eyebrow">AURELIS / PRIVATE RESIDENCES</p>
          {/* Decorative: the eyebrow and the copyright already name the brand
              for assistive technology, so the oversized mark is not repeated. */}
          <p className="footer__wordmark" aria-hidden="true">
            <span className="footer__wordmark-inner">AURELIS</span>
          </p>
          <p className="footer__statement">
            Architecture shaped around the way you live.
          </p>
        </div>

        <div className="footer__columns">
          <nav className="footer__column" aria-labelledby="footer-explore">
            <h2 className="footer__label" id="footer-explore">
              Explore
            </h2>
            <ul className="footer__list">
              {exploreLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="footer__link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer__column" aria-labelledby="footer-enquiries">
            <h2 className="footer__label" id="footer-enquiries">
              Enquiries
            </h2>
            <ul className="footer__list">
              <li>
                <Link to="/contact" className="footer__link">
                  Private Enquiries
                </Link>
              </li>
              <li>
                <span className="footer__muted">By appointment</span>
              </li>
            </ul>
          </nav>

          <div className="footer__column">
            <h2 className="footer__label">Brand</h2>
            <p className="footer__note">
              AURELIS presents architecture as experience — precise, restrained,
              and intentional. A curated collection of residences in the world's
              most prestigious locations.
            </p>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">© {year} AURELIS</p>
          <button type="button" className="footer__top" onClick={handleBackToTop}>
            Back to top
            <span className="footer__top-arrow" aria-hidden="true">
              ↑
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
