import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STORIES = [
  {
    number: "01",
    eyebrow: "The Art of Arrival",
    title: "A residence begins before the front door.",
    body: "The approach is the first room. A screen of planting, a gate set back from the street, a drive that slows the pace — arrival is designed so that privacy begins long before the door opens, and the house reveals itself only when it is ready.",
    image: "/images/residences-coastal.webp",
    alt: "A residence set back from the road behind landscaping",
    align: "right",
  },
  {
    number: "02",
    eyebrow: "Living with the Landscape",
    title: "The best homes belong to their setting.",
    body: "A residence on the coast answers to the horizon. One in the hills follows the slope. Terraces, gardens and shaded rooms are planned around the sun, the wind and the view — so the landscape is lived, not looked at.",
    image: "/images/residences-city.webp",
    alt: "A hillside residence responding to its landscape",
    align: "left",
  },
  {
    number: "03",
    eyebrow: "Designed for Living",
    title: "Every room has a reason to exist.",
    body: "Materials that age honestly, rooms proportioned for quiet evenings as much as for entertaining, light that changes through the day. The measure of a home is not its size — it is whether each room earns its place in a life.",
    image: "/images/residences-bg.webp",
    alt: "A quiet interior room with natural light and considered materials",
    align: "right",
  },
];

// One pinned stage, three stories. Image layer and typography layer are
// separate systems coordinated by a single scrubbed master timeline —
// same editorial philosophy as Residences, but quieter: text out first,
// atmosphere peaks mid-crossfade, incoming text arrives after its image.
export default function Journal() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const imageRefs = useRef([]);
  const textRefs = useRef([]);
  const atmosphereRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMq.matches) {
      section.classList.add("journal--static");
      const frames = Array.from(stage.querySelectorAll(".journal__frame"));
      const texts = Array.from(stage.querySelectorAll(".journal__text"));
      const textsParent = stage.querySelector(".journal__texts");
      texts.forEach((t, i) => frames[i] && frames[i].appendChild(t));
      return () => {
        texts.forEach((t) => textsParent.appendChild(t));
        section.classList.remove("journal--static");
      };
    }

    const imgs = imageRefs.current.filter(Boolean);
    const texts = textRefs.current.filter(Boolean);
    const atm = atmosphereRef.current;
    let cleanupPtr = null;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => "+=" + window.innerHeight * 5.8,
          pin: true,
          anticipatePin: 1,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      // Exit: number → eyebrow → title (lifts back up through its mask) → body.
      // Enter: eyebrow/number → title (masked reveal) → body.
      const exitText = (t, at) => {
        const num = t.querySelector(".journal__number");
        const eye = t.querySelector(".journal__eyebrow");
        const body = t.querySelector(".journal__body");
        const title = t.querySelector(".journal__title-inner");
        tl.to(num, { opacity: 0, duration: 0.22, ease: "power2.in" }, at);
        tl.to(eye, { opacity: 0, duration: 0.22, ease: "power2.in" }, at + 0.05);
        tl.to(title, { yPercent: -115, duration: 0.3, ease: "power2.in" }, at + 0.08);
        tl.to(body, { opacity: 0, duration: 0.24, ease: "power2.in" }, at + 0.15);
      };
      const enterText = (t, at) => {
        const num = t.querySelector(".journal__number");
        const eye = t.querySelector(".journal__eyebrow");
        const body = t.querySelector(".journal__body");
        const title = t.querySelector(".journal__title-inner");
        tl.fromTo(num, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, at);
        tl.fromTo(eye, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, at + 0.04);
        tl.fromTo(title, { yPercent: 115 }, { yPercent: 0, duration: 0.5, ease: "power3.out" }, at + 0.1);
        tl.fromTo(body, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.34, ease: "power2.out" }, at + 0.22);
      };

      // Story 1 hold [0, 1.35]: gentle breathing only
      tl.fromTo(imgs[0], { scale: 1.02, yPercent: 0.5 }, { scale: 1.04, yPercent: -0.5, duration: 1.35, ease: "none" }, 0);

      // 01 → 02 over [1.35, 2.3]: outgoing drifts deeper and fades while the
      // incoming plate enters as a cropped window — scale, drift and clip-path
      // resolve together, so the story reads as one image transforming into
      // the next rather than two images crossfading.
      exitText(texts[0], 1.35);
      tl.to(imgs[0], { opacity: 0, scale: 1.09, xPercent: -2, duration: 0.95, ease: "none" }, 1.35);
      tl.fromTo(
        imgs[1],
        { opacity: 0, scale: 1.1, xPercent: 2, clipPath: "inset(18% 12% 26% 12% round 3px)" },
        { opacity: 1, scale: 1, xPercent: 0, clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.95, ease: "none" },
        1.35
      );
      tl.fromTo(atm, { opacity: 0 }, { opacity: 0.2, duration: 0.25, ease: "none" }, 1.45)
        .to(atm, { opacity: 0, duration: 0.3, ease: "none" }, 1.7);
      enterText(texts[1], 1.6);

      // Story 2 hold [2.3, 3.55]
      tl.to(imgs[1], { scale: 1.025, yPercent: -1, duration: 1.25, ease: "none" }, 2.3);

      // 02 → 03 over [3.55, 4.5]: vertical drift crossfade with the same
      // expanding-window treatment, mirrored top-to-bottom.
      exitText(texts[1], 3.55);
      tl.to(imgs[1], { opacity: 0, scale: 1.09, yPercent: -2.5, duration: 0.95, ease: "none" }, 3.55);
      tl.fromTo(
        imgs[2],
        { opacity: 0, scale: 1.1, yPercent: 2.5, clipPath: "inset(24% 12% 18% 12% round 3px)" },
        { opacity: 1, scale: 1, yPercent: 0, clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.95, ease: "none" },
        3.55
      );
      tl.fromTo(atm, { opacity: 0 }, { opacity: 0.18, duration: 0.25, ease: "none" }, 3.65)
        .to(atm, { opacity: 0, duration: 0.3, ease: "none" }, 3.9);
      enterText(texts[2], 3.8);

      // Story 3 hold [4.5, 5.8]
      tl.to(imgs[2], { scale: 1.02, yPercent: -1, duration: 1.3, ease: "none" }, 4.5);

      // Pointer parallax — frames carry it, inner img keeps the scrubbed transform.
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const wraps = Array.from(stage.querySelectorAll(".journal__frame"));
        const qx = wraps.map((w) => gsap.quickTo(w, "x", { duration: 1, ease: "power2.out" }));
        const qy = wraps.map((w) => gsap.quickTo(w, "y", { duration: 1, ease: "power2.out" }));
        const onMove = (e) => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          for (let j = 0; j < wraps.length; j++) {
            qx[j](nx * 7);
            qy[j](ny * 5);
          }
        };
        stage.addEventListener("pointermove", onMove);
        cleanupPtr = () => stage.removeEventListener("pointermove", onMove);
      }
    }, section);

    return () => {
      if (cleanupPtr) cleanupPtr();
      ctx.revert();
    };
  }, []);

  // Image warm-up (own lifecycle, independent of the animation effect and
  // valid under reduced motion too — the static gallery shows the same
  // frames). Stories 2–3 are `loading="lazy"` inside the pinned stage, where
  // all three frames live in the viewport at once: without warming, a 01→02
  // or 02→03 crossfade can fire while its image is still decoding and stutter
  // the pinned timeline. This mirrors the collection rail's strategy — one
  // image ahead of schedule, started only in idle time so it never competes
  // with the Hero's first paint: flip each lazy image to eager (its single
  // real fetch), wait for load+decode off the main thread, then chain.
  // Failures resolve rather than reject, so one broken plate can't stall the
  // queue (it simply isn't warm — the browser's own handling takes over).
  useLayoutEffect(() => {
    const imgs = imageRefs.current.filter(Boolean);
    if (!imgs.length) return;

    let cancelled = false;
    const queue = [...imgs];
    const idle =
      typeof window.requestIdleCallback === "function"
        ? (cb) => window.requestIdleCallback(cb, { timeout: 1200 })
        : (cb) => window.setTimeout(cb, 200);

    const warmNext = () => {
      if (cancelled) return;
      const img = queue.shift();
      if (!img) return;
      const advance = () => {
        if (!cancelled) idle(warmNext);
      };
      if (img.complete) {
        (img.decode ? img.decode() : Promise.resolve()).then(advance, advance);
        return;
      }
      img.loading = "eager"; // fetch this plate only when its turn comes
      const loaded = img.decode
        ? img.decode() // waits for load AND decode in one call
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          });
      loaded.then(advance, advance);
    };
    idle(warmNext);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section ref={sectionRef} className="journal" aria-label="Aurelis journal">
      <div className="journal__stage" ref={stageRef}>
        {/* Visual plate. The Home section-handoff owns this element's
            transform/clip; the pin trigger above stays untransformed so its
            start/end are measured against clean geometry. */}
        <div className="journal__plate">
          <div className="journal__enter">
            <div className="journal__atmosphere" ref={atmosphereRef} aria-hidden="true" />

            <div className="journal__images">
              {STORIES.map((s, i) => (
                <figure className={`journal__frame journal__frame--${s.align}`} key={s.title}>
                  <img
                    ref={(el) => (imageRefs.current[i] = el)}
                    className="journal__img"
                    src={s.image}
                    alt={s.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </figure>
              ))}
            </div>

            <div className="journal__texts">
              {STORIES.map((s, i) => (
                <div
                  key={s.title}
                  ref={(el) => (textRefs.current[i] = el)}
                  className={`journal__text journal__text--${s.align}`}
                >
                  <p className="journal__number">{s.number}</p>
                  <p className="journal__eyebrow">{s.eyebrow}</p>
                  <h3 className="journal__title">
                    <span className="journal__title-inner">{s.title}</span>
                  </h3>
                  <p className="journal__body">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
