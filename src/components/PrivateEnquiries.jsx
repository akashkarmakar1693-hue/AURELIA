import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Page 5 — the closing chapter: one full-screen architectural frame with the
// enquiry invitation anchored bottom-left, the Statement's editorial
// composition reprised as an ending. The entrance is a single
// viewport-triggered render (the Collection intro's pattern): it plays once,
// reverses on re-entry, and is never bound to scroll — so it cannot interact
// with the Journal's pinned timeline or the handoff coordinator owning the
// sections above. Reduced motion gets no trigger and no hidden initial
// states, so the section renders fully visible.
export default function PrivateEnquiries() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Spatial close: the dusk plate arrives from a deeper crop and
      // settles 1:1 with the section's travel into place — the final
      // architectural frame "locks" as its content renders in.
      gsap.fromTo(
        ".enquiries__media img",
        { scale: 1.1 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top 12%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // The copy sits at the bottom of a full-height plate, so a trigger on
      // the section would reveal it while it is still far below the fold.
      // Trigger on the content column itself: it plays as that column crosses
      // into view, in step with the section's spatial entrance from Home.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".enquiries__content",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
        .fromTo(".enquiries__eyebrow", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 0)
        .fromTo(".enquiries__title", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.3, ease: "power3.out" }, 0.15)
        .fromTo(".enquiries__lead", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, 0.4)
        .fromTo(".enquiries__cta", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }, 0.65)
        .fromTo(".enquiries__note", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }, 0.85);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="enquiries" aria-labelledby="enquiries-title">
      <div className="enquiries__media">
        <img
          src="/images/private-enquiries.jpg"
          alt="A private residence at dusk with warm light glowing from its entrance"
          width={1200}
          height={675}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Controlled dark gradient: secures the text column and the sticky
          navbar while the warm entrance glow stays dominant. */}
      <div className="enquiries__veil" aria-hidden="true" />

      <div className="enquiries__content">
        <p className="enquiries__eyebrow">AURELIS / PRIVATE ENQUIRIES</p>
        <h2 className="enquiries__title" id="enquiries-title">
          A place worth calling your own.
        </h2>
        <p className="enquiries__lead">
          Discover a residence that reflects your way of living. Our team welcomes
          private enquiries for selected properties.
        </p>
        <Link to="/contact" className="enquiries__cta">
          Begin a Private Enquiry
          <span className="enquiries__cta-arrow" aria-hidden="true">→</span>
        </Link>
        <p className="enquiries__note">Discuss availability and acquisition with our team.</p>
      </div>
    </section>
  );
}
