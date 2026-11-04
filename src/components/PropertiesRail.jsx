import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { properties } from "../data/properties";

gsap.registerPlugin(ScrollTrigger);

const PARALLAX = 44; // px of image drift at the rail edges

// Each property owns one scroll segment. The whole segment drives the
// move to the next property with a smootherstep whose velocity is zero
// at both ends, so motion is continuous and nothing parks between them.
const HOLD = 0;

// Editorial horizontal rail on FIXED GEOMETRY: each card occupies a fixed
// pitch slot, and the rail translate3d — driven solely by applyLayout — is
// the primary motion, sliding the sequence through the viewport center.
// Focus is a secondary, pair-local treatment: only the outgoing and incoming
// cards change width (their widths sum to a constant, so every other card's
// position is untouched), plus opacity/scale/info fades. The rail's
// translation interpolates between canonical per-card centers that never
// depend on live widths, so the coordinate system itself never morphs.
export default function PropertiesRail() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const railRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const rail = railRef.current;
    if (!section || !stage || !rail) return;

    const mobileMq = window.matchMedia("(max-width: 767px)");
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cards = Array.from(rail.querySelectorAll(".collection__card"));
    const infos = cards.map((card) => card.querySelector(".collection__info"));
    const visuals = cards.map((card) => card.querySelector(".collection__img"));
    const count = cards.length;

    // Layout metrics are measured once per ScrollTrigger refresh and cached.
    // applyLayout used to read stage.clientWidth on every scroll tick — a
    // layout read right after the pin's style writes, forcing a synchronous
    // style/geometry flush per frame. The pinned stroke only changes
    // transforms, so the geometry cannot change mid-scroll; the cache is
    // invalidated on each refresh (onRefreshInit) and re-measured lazily.
    let layout = null;
    const metrics = () => {
      if (layout) return layout;
      const s = stage.clientWidth;
      const m = mobileMq.matches;
      layout = {
        s,
        wide: s * (m ? 0.84 : 0.55),
        narrow: s * (m ? 0.34 : 0.21),
        gap: s * (m ? 0.05 : 0.028),
      };
      return layout;
    };

    const prevInfo = new Array(count).fill(null);
    const prevInfoSX = new Array(count).fill(null);
    const prevCard = new Array(count).fill(null);
    const prevImg = new Array(count).fill(null);
    const prevX = new Array(count).fill(null);

    // GSAP quickSetters skip repeated CSS parsing/setup for values written
    // every scroll update. One per (element, property): they compose GSAP's
    // internal transform cache, so independent quickSetters on x/scale/etc.
    // of the same node cooperate instead of clobbering each other.
    const setRailX = gsap.quickSetter(rail, "x", "px");
    const setCardOp = cards.map((c) => gsap.quickSetter(c, "opacity"));
    const setCardX = cards.map((c) => gsap.quickSetter(c, "x", "px"));
    const setCardY = cards.map((c) => gsap.quickSetter(c, "y", "px"));
    const setCardScaleX = cards.map((c) => gsap.quickSetter(c, "scaleX"));
    const setCardScaleY = cards.map((c) => gsap.quickSetter(c, "scaleY"));
    const setInfoOp = infos.map((el) => gsap.quickSetter(el, "opacity"));
    const setInfoScaleX = infos.map((el) => gsap.quickSetter(el, "scaleX"));
    const setImgX = visuals.map((v) => gsap.quickSetter(v, "x", "px"));
    const setImgScaleX = visuals.map((v) => gsap.quickSetter(v, "scaleX"));
    const setImgScaleY = visuals.map((v) => gsap.quickSetter(v, "scaleY"));

    // Base card dimensions are layout. They are written here and only here —
    // once on init and once per ScrollTrigger refresh — never inside
    // applyLayout, so the scroll handler does zero layout writes.
    const setBaseWidth = () => {
      const { wide } = metrics();
      for (let j = 0; j < count; j++) cards[j].style.width = wide + "px";
    };

    // p: pinned-stroke progress 0..1 (horizontal movement).
    const applyLayout = (p) => {
      const { s, wide, narrow, gap } = metrics();
      if (!s || !count) return;

      const gP = p;

      // Segment space runs 0..count-1+HOLD so the final property's hold
      // lasts until the pin releases. Within a segment, u in [0, HOLD] is
      // the stable hold; u in (HOLD, 1] is the smoothstep move to the next
      // property. `i` is the outgoing index, `t` the eased move 0→1.
      const seg = gP * (count - 1 + HOLD);
      const segIdx = Math.min(Math.floor(seg), count - 1);
      const segU = Math.min(seg - segIdx, 1);
      let i, t;
      if (segU <= HOLD || segIdx === count - 1) {
        i = segIdx;
        t = 0;
      } else {
        i = Math.min(segIdx, count - 2);
        const u = (segU - HOLD) / (1 - HOLD);
        // Smootherstep: zero velocity AND zero acceleration at both ends, so
        // each morph eases out of the hold and settles into the next one.
        t = u * u * u * (u * (u * 6 - 15) + 10);
      }

      const pitch = narrow + gap;

      // Engagement per card: 1 = focused. Only the outgoing/incoming pair
      // blends; e_i + e_{i+1} = 1 keeps their combined visual width constant,
      // so cards before and after the pair never shift.
      const centers = [];
      const widths = [];
      let pos = 0;
      for (let j = 0; j < count; j++) {
        const e = j === i ? 1 - t : j === i + 1 ? t : 0;
        const w = narrow + (wide - narrow) * e;
        widths[j] = w;
        centers[j] = pos + w / 2;
        const io = +e.toFixed(3);
        if (prevInfo[j] !== io) {
          setInfoOp[j](io);
          prevInfo[j] = io;
        }
        // Counter-scale the info panel horizontally so its text keeps the
        // undistorted `wide` layout inside a scaleX-compressed card frame
        // (the card's overflow clips it like the original layout did).
        const infoSX = +(wide / w).toFixed(4);
        if (prevInfoSX[j] !== infoSX) {
          setInfoScaleX[j](infoSX);
          prevInfoSX[j] = infoSX;
        }
        pos += w + gap;
      }

      // Single source of truth for rail position: interpolate between
      // canonical centers C_k = k*pitch + wide/2, which are fixed for a
      // given viewport and independent of any live card width.
      const cI = i * pitch + wide / 2;
      const cNext = (i + 1) * pitch + wide / 2;
      const tx = s / 2 - (cI + (cNext - cI) * t);
      setRailX(tx);

      for (let j = 0; j < count; j++) {
        const e = j === i ? 1 - t : j === i + 1 ? t : 0;
        const norm = Math.max(-1, Math.min(1, (centers[j] + tx - s / 2) / s));
        // Per-card entrance, driven purely by where the card sits in the
        // viewport during the pinned stroke: it fades/rises/settles as its
        // center crosses the right 30% of the screen, and reverses when
        // scrolled back out. ponytail: derived in applyLayout because GSAP
        // ScrollTrigger triggers don't track the transform-driven rail live.
        const u = Math.max(0, Math.min(1, (1 - (centers[j] + tx) / s) / 0.3));
        const en = 1 - Math.pow(1 - u, 3);
        const enS = 0.97 + 0.03 * en;
        const cardOp = +(en * (0.7 + 0.3 * e)).toFixed(3);
        // Entrance rise (30px while the card crosses into view) plus a
        // focus lift: the engaged card sits 12px higher than idle neighbors,
        // so the active plate visibly separates from the rail's depth.
        const cardY = +((1 - en) * 30 - 12 * e).toFixed(1);
        const cardX = +(centers[j] - wide / 2).toFixed(1);
        // Visual width = base width (wide) × scaleX. scaleX combines the
        // entrance settle with the engagement-driven width ratio, so the
        // focused card still measures exactly `wide` on screen.
        const cardSX = +(enS * (widths[j] / wide)).toFixed(4);
        const cardSY = +enS.toFixed(3);
        const cardKey = `${cardOp}|${cardY}|${cardSX}|${cardSY}`;
        if (prevCard[j] !== cardKey) {
          setCardOp[j](cardOp);
          setCardY[j](cardY);
          setCardScaleX[j](cardSX);
          setCardScaleY[j](cardSY);
          prevCard[j] = cardKey;
        }
        if (prevX[j] !== cardX) {
          setCardX[j](cardX);
          prevX[j] = cardX;
        }
        // Active images settle toward their natural scale; idle ones sit
        // slightly more zoomed-in. The entrance adds a 1.04 → 1 settle.
        // Parallax stays subtle and positional — it never feeds back into
        // card geometry or the rail transform.
        const zoom = (1.1 - 0.08 * e) * (1 + 0.04 * (1 - en));
        // Undo the card's own scaleX/scaleY on the image so the render
        // crops and parallaxes exactly like the original cover layout —
        // the image never looks squashed, only panned/zoomed. Parallax is
        // divided by cardSX because the image shift happens inside the
        // card's scaled frame.
        const ratio = widths[j] / wide;
        const imgX = +((-norm * PARALLAX) / ratio).toFixed(1);
        const imgSX = +(zoom / ratio).toFixed(4);
        const imgSY = +zoom.toFixed(4);
        const imgKey = `${imgX}|${imgSX}|${imgSY}`;
        if (prevImg[j] !== imgKey) {
          setImgX[j](imgX);
          setImgScaleX[j](imgSX);
          setImgScaleY[j](imgSY);
          prevImg[j] = imgKey;
        }
      }
    };

    const reduced = reduceMq.matches;
    if (reduced) section.classList.add("collection--static");
    else {
      setBaseWidth();
      applyLayout(0);
    }

    const ctx = gsap.context(() => {
      if (reduced) return;

      // Strict 1:1 scroll coupling: a scrubbed proxy tween is the ONLY writer
      // of state.p, so nothing else fights ScrollTrigger for the rail.
      // scrub: true maps the wheel straight onto the rail through the
      // per-segment smootherstep, which already supplies all the easing tied
      // to scroll position — motion is positioned, not time-based, so it
      // follows the input exactly in both directions with no glide lag, no
      // catch-up tween and no snaps. (Supersedes the earlier smoothed
      // `scrub: 0.8` proxy, whose lag read as loose under Lenis.)
      const state = { p: 0 };
      const render = () => applyLayout(state.p);

      // Scroll length follows the rail's real horizontal travel, no fixed px.
      // 7.2x (desktop) / 8.5x (mobile) of the travel paces the sequence — a
      // touch brisker than before (8.5 / 10) so the collection is explored
      // faster while staying cinematic.
      const scrollLength = () => {
        const { narrow, gap } = metrics();
        const travel = (count - 1) * (narrow + gap);
        const pace = mobileMq.matches ? 8.5 : 7.2;
        return Math.max(travel * pace, stage.clientHeight);
      };

      gsap.fromTo(
        state,
        { p: 0 },
        {
          p: 1,
          ease: "none",
          immediateRender: false,
          onUpdate: render,
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => "+=" + scrollLength(),
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            scrub: true,
            // Geometry may legitimately change during a refresh (viewport
            // width). Drop the cached metrics before start/end are
            // re-evaluated, so scrollLength() and setBaseWidth() measure
            // once, fresh.
            onRefreshInit: () => {
              layout = null;
            },
            onRefresh: () => {
              setBaseWidth();
              render();
            },
          },
        }
      );

      // Viewport-triggered render animation: the intro text plays once when
      // it enters, reverses on re-entry from below — it is never bound to
      // scroll progress, so the text stays put once rendered.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".collection__intro",
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        })
        .fromTo(
          ".collection__eyebrow",
          { opacity: 0, y: 16, letterSpacing: "0.52em" },
          { opacity: 1, y: 0, letterSpacing: "0.38em", duration: 1.1, ease: "power3.out" },
          0
        )
        .fromTo(
          ".collection__title-line > span",
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            stagger: 0.14,
            ease: "power3.out",
          },
          0.25
        )
        .fromTo(
          ".collection__intro-rule",
          { scaleX: 0.05, opacity: 0 },
          { scaleX: 1, opacity: 0.55, duration: 1.2, ease: "power3.out" },
          1.0
        )
        .fromTo(
          ".collection__statement",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" },
          1.35
        );
    }, section);

    // Warm the rail's images ahead of the pinned stroke, one at a time,
    // staggered through idle time. Cards are CSS-sized (absolutely positioned,
    // 100% of the stage), so an image load can never change layout — the old
    // per-image ScrollTrigger.refresh() only forced full trigger
    // recalculations DURING the stroke. Decoding each image before it is
    // needed removes the mid-morph decode hitch without eager-loading all 12
    // at once.
    let warmCancelled = false;
    const idle =
      typeof window.requestIdleCallback === "function"
        ? (cb) => window.requestIdleCallback(cb, { timeout: 1200 })
        : (cb) => window.setTimeout(cb, 200);
    const warmQueue = Array.from(rail.querySelectorAll("img"));
    const warmNext = () => {
      const img = warmQueue.shift();
      if (warmCancelled || !img) return;
      const next = () => {
        if (!warmCancelled) idle(warmNext);
      };
      if (img.complete) {
        (img.decode ? img.decode() : Promise.resolve()).then(next, next);
        return;
      }
      img.loading = "eager"; // fetch this image only when its turn comes
      const loaded = img.decode
        ? img.decode()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          });
      loaded.then(next, next);
    };
    if (!reduced) idle(warmNext);

    return () => {
      warmCancelled = true;
      section.classList.remove("collection--static");
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="properties"
      ref={sectionRef}
      className="collection"
      aria-labelledby="collection-title"
    >
      <div className="collection__intro">
        <p className="collection__eyebrow">AURELIS / Private Residences</p>
        <h2 id="collection-title" className="collection__title">
          <span className="collection__title-line">
            <span>Homes of quiet</span>
          </span>
          <span className="collection__title-line">
            <span>distinction.</span>
          </span>
        </h2>
        <div className="collection__intro-rule" aria-hidden="true" />
        <p className="collection__statement">
          A considered collection of residences where architecture, landscape,
          and place exist in deliberate balance.
        </p>
      </div>

      <div className="collection__stage" ref={stageRef}>
        {/* Visual plate. The Home section-handoff owns this element's
            transform/clip; the pin trigger above stays untransformed so its
            start/end are measured against clean geometry. */}
        <div className="collection__plate">
          <div className="collection__rail" ref={railRef}>
            {properties.map((property, index) => (
            <article className="collection__card" key={property.order}>
              <div className="collection__media">
                <img
                  className="collection__img"
                  src={property.image}
                  alt={`${property.name}, ${property.location}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
              <div className="collection__info">
                <h3 className="collection__name">{property.name}</h3>
                <p className="collection__location">{property.location}</p>
                <p className="collection__desc">{property.description}</p>
                <div className="collection__rule" aria-hidden="true" />
                <div className="collection__foot">
                  <p className="collection__cat">{property.category}</p>
                  <p className="collection__meta">{property.metadata}</p>
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
