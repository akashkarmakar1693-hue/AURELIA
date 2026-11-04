import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "../components/Hero";
import TransitionImage from "../components/TransitionImage";
import PropertiesRail from "../components/PropertiesRail";
import Journal from "../components/Journal";
import PrivateEnquiries from "../components/PrivateEnquiries";
import { whenFontsReady } from "../utils/fontsReady";

gsap.registerPlugin(ScrollTrigger);

// Length of the Hero â†’ Statement scene in viewport heights. Every tween on
// the stage is positioned inside this span (1 unit = 1vh), so the scroll
// distance and the timeline can never drift apart.
const STAGE_VH = 2.8;

export default function Home() {
  const stageRef = useRef(null);
  const outroRef = useRef(null);

  // ---------------------------------------------------------------------
  // Hero â†’ Statement (one pinned scene, ONE timeline)
  //
  // Ownership rules this scene is built on:
  //   â€¢ the timeline below is the only writer for every element inside the
  //     stage â€” there is no second trigger animating the Statement copy,
  //     the image, the veil or the Hero layers;
  //   â€¢ all phases are fromTo() tweens, so the scene is a pure function of
  //     scroll position and reverses exactly;
  //   â€¢ the Hero opening entrance (time based, after fonts settle) only
  //     writes text children, never anything the scrub owns.
  // ---------------------------------------------------------------------
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hero = stage.querySelector(".hero");
    const statement = stage.querySelector(".transition");

    // Only the layer that is actually on top may take pointer/keyboard/AT
    // input. Without this, the invisible Statement plate sits over the Hero
    // and swallows the Hero CTA (and vice versa at the end of the scene).
    let statementLive = null;
    const setLiveLayer = (progress) => {
      const live = progress > 0.42;
      if (live === statementLive) return;
      statementLive = live;
      if (hero) hero.inert = live;
      if (statement) statement.inert = !live;
      statement?.classList.toggle("is-live", live);
    };

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => "+=" + window.innerHeight * STAGE_VH,
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // This pin sits earlier in the document but is created AFTER the
            // collection's (child effects run first). Refresh it first so the
            // collection's start/end are measured with this spacer present.
            refreshPriority: 1,
            onUpdate: (self) => setLiveLayer(self.progress),
          },
        })
        // 0 â†’ 0.9 â”€ Hero pushes in, its veil deepens and the copy lifts out.
        .fromTo(
          ".hero__image",
          { scale: 1, xPercent: 0 },
          { scale: 1.08, xPercent: -1.5, duration: 0.9, ease: "none" },
          0
        )
        .fromTo(".hero__overlay", { opacity: 0 }, { opacity: 0.6, duration: 0.9, ease: "none" }, 0)
        .fromTo(
          ".hero__content",
          { yPercent: 0, opacity: 1 },
          { yPercent: -16, opacity: 0, duration: 0.65, ease: "power1.in" },
          0
        )
        .fromTo(".hero__cue", { opacity: 1 }, { opacity: 0, duration: 0.35, ease: "none" }, 0.1)
        // 0.35 â†’ 1.3 â”€ The Statement is a full-height plate that rises from
        // below through a cropped window and expands to full bleed. It visibly
        // slides over the Hero instead of fading through it.
        .fromTo(
          ".transition",
          { y: () => window.innerHeight, clipPath: "inset(18% 8% 22% 8% round 3px)" },
          { y: 0, clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.95, ease: "power2.out" },
          0.35
        )
        // 0.35 â†’ 2.35 â”€ The architectural plate keeps pushing in after it has
        // landed, so the composition never reads as a still image.
        .fromTo(
          ".transition__image-img",
          { scale: 1.16, yPercent: 4 },
          { scale: 1.02, yPercent: 0, duration: 2, ease: "none" },
          0.35
        )
        // 1.0 â†’ 1.95 â”€ Copy renders in, inside the same scrubbed timeline, so
        // it can never play before its section is on screen.
        .fromTo(
          ".transition__eyebrow",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          1
        )
        .fromTo(
          ".transition__headline-inner",
          { opacity: 0, yPercent: 55 },
          { opacity: 1, yPercent: 0, duration: 0.6, ease: "power3.out" },
          1.1
        )
        .fromTo(
          ".transition__lead",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          1.35
        )
        .fromTo(
          ".transition__cta",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          1.5
        )
        // 2.1 â†’ 2.8 â”€ The Statement recedes: copy lifts out first, then the
        // veil closes to the Collection's charcoal.
        .fromTo(
          ".transition__content",
          { yPercent: 0, opacity: 1 },
          { yPercent: -12, opacity: 0, duration: 0.5, ease: "power2.in" },
          2.1
        )
        .fromTo(".transition__veil", { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power2.in" }, 2.1);

      // Opening beat, written pre-paint: the title sits below its masks and
      // the lower register is transparent, so nothing flashes before the
      // fonts settle. These elements are owned exclusively by the entrance
      // timeline below (the scrub only moves their parent container).
      gsap.set(".hero__title-line > span", { yPercent: 115 });
      gsap.set(".hero__eyebrow", { opacity: 0, y: 14 });
      gsap.set(".hero__rule", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".hero__foot", { opacity: 0, y: 18 });
    }, stage);

    setLiveLayer(0);

    // Hero entrance â€” time based and choreographed once, after fonts settle.
    // It never writes anything the scrubbed timeline owns.
    let entranceCtx = null;
    let cancelled = false;
    whenFontsReady().then(() => {
      if (cancelled) return;
      entranceCtx = gsap.context(() => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(".hero__media", { scale: 1.08 }, { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
          .to(".hero__eyebrow", { opacity: 1, y: 0, duration: 0.9 }, 0.35)
          .to(".hero__title-line > span", { yPercent: 0, duration: 1.25, stagger: 0.14 }, 0.5)
          .to(".hero__rule", { scaleX: 1, duration: 1.1, ease: "power3.out" }, 1.15)
          .to(".hero__foot", { opacity: 1, y: 0, duration: 0.9 }, 1.3);
      }, stage);
    });

    return () => {
      cancelled = true;
      entranceCtx?.revert();
      ctx.revert();
      if (hero) hero.inert = false;
      if (statement) {
        statement.inert = false;
        statement.classList.remove("is-live");
      }
    };
  }, []);

  // ---------------------------------------------------------------------
  // Footer reveal after the Collection's pin releases. The outro window is
  // the only transparent band in #main; its height is the scroll distance of
  // the reveal, so it is mapped 1:1 onto the footer's real height.
  // ---------------------------------------------------------------------
  useLayoutEffect(() => {
    const outro = outroRef.current;
    if (!outro) return;

    document.body.classList.add("home-outro");

    const footer = document.querySelector("footer");

    // Re-measure on resize and on any footer reflow (web-font swap, text
    // wrap) so the window and the plate stay mapped 1:1.
    const sizeOutro = () => {
      if (!footer) return;
      const next = `${footer.offsetHeight}px`;
      if (outro.style.height === next) return;
      outro.style.height = next;
      ScrollTrigger.refresh();
    };
    sizeOutro();

    // While the curtain still covers it, the fixed footer is visually hidden
    // behind #main. Keep it out of the tab order and the accessibility tree
    // for exactly that interval, then release it as the reveal begins.
    let frame = 0;
    const syncFooterVisibility = () => {
      if (!footer) return;
      footer.inert = outro.getBoundingClientRect().top >= window.innerHeight;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        syncFooterVisibility();
      });
    };
    const onResize = () => {
      sizeOutro();
      syncFooterVisibility();
    };
    syncFooterVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && footer ? new ResizeObserver(sizeOutro) : null;
    if (resizeObserver && footer) resizeObserver.observe(footer);

    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Scrubbed 1:1 with the reveal, so it is complete exactly at document
      // bottom and reverses naturally on the way up. Parts animate bottom-up
      // in the order the curtain uncovers them.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: outro,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(".footer__bottom", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0)
        .fromTo(
          ".footer__column",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" },
          0.05
        )
        .fromTo(".footer__statement", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.28)
        .fromTo(".footer__wordmark-inner", { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: "power2.out" }, 0.4)
        .fromTo(".footer__eyebrow", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.5);
    });
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      if (footer) footer.inert = false;
      ctx.revert();
      document.body.classList.remove("home-outro");
    };
  }, []);

  // ---------------------------------------------------------------------
  // Section handoffs: Collection â†’ Journal â†’ Private Enquiries.
  //
  // Each boundary is ONE scrubbed timeline over exactly one viewport of
  // scroll (the incoming section travelling from the viewport bottom to the
  // top). The outgoing plate recedes (lifts, shrinks, clips inward) in the
  // first half while the incoming plate rises through a cropped window and
  // expands in the second half â€” a visible spatial replacement, not a fade.
  //
  // Animated elements are the *plates* (or, for Enquiries, the section):
  // the Collection stage and Journal stage stay free of transforms so their
  // pins are measured against clean geometry.
  // ---------------------------------------------------------------------
  useLayoutEffect(() => {
    const collectionPlate = document.querySelector(".collection__plate");
    const journalPlate = document.querySelector(".journal__plate");
    const journalEnter = document.querySelector(".journal__enter");
    const journalImages = document.querySelector(".journal__images");
    const journalSection = document.querySelector(".journal");
    const enquiries = document.querySelector(".enquiries");
    if (!collectionPlate || !journalPlate || !journalEnter || !enquiries) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // The same recede state ends every outgoing plate; declaring it once
      // keeps the two boundaries visually identical.
      const recede = {
        yPercent: -8,
        scale: 0.9,
        opacity: 0.38,
        clipPath: "inset(0% 6% 10% 6% round 4px)",
      };

      // Collection â†’ Journal. Ends exactly at the Journal pin start, where
      // the plate is back to identity and the pinned timeline takes over.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: journalSection,
            start: "top bottom",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          collectionPlate,
          { yPercent: 0, scale: 1, opacity: 1, clipPath: "inset(0% 0% 0% 0% round 0px)" },
          { ...recede, duration: 0.5, ease: "power1.in" },
          0
        )
        .fromTo(
          journalEnter,
          { yPercent: -12, clipPath: "inset(0% 6% 12% 6% round 3px)" },
          { yPercent: 0, clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.75, ease: "power2.out" },
          0.25
        )
        // The plate's image keeps opening after the frame lands.
        .fromTo(journalImages, { scale: 1.1 }, { scale: 1, duration: 0.75, ease: "none" }, 0.25);

      // Journal â†’ Private Enquiries. Starts at the Journal pin release (the
      // Enquiries top is then exactly at the viewport bottom) and hands over
      // a fully resolved Section 4 at the top of the viewport.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: enquiries,
            start: "top bottom",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(journalPlate, { yPercent: 0, scale: 1, opacity: 1, clipPath: "inset(0% 0% 0% 0% round 0px)" }, { ...recede, duration: 0.5, ease: "power1.in" }, 0)
        .fromTo(
          enquiries,
          { yPercent: -12, clipPath: "inset(0% 6% 12% 6% round 3px)" },
          { yPercent: 0, clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.75, ease: "power2.out" },
          0.25
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="transition-stage" ref={stageRef}>
        <Hero />
        <TransitionImage />
      </div>
      <PropertiesRail />
      <Journal />
      <PrivateEnquiries />
      <section className="collection-outro" ref={outroRef} aria-hidden="true" />
    </>
  );
}


