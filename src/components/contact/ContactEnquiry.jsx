import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { properties } from "../../data/properties";

gsap.registerPlugin(ScrollTrigger);

const ENQUIRY_TYPES = ["Property information", "Private viewing", "General enquiry"];

const INITIAL_VALUES = {
  name: "",
  email: "",
  phone: "",
  property: "general",
  type: "General enquiry",
  message: "",
};

// Field order drives both validation checks and the focus jump to the first
// invalid control, so a failed submit always lands the keyboard somewhere
// useful. "property" and "type" have no validation today; they stay in order
// so a future required-state change slots straight into the focus chain.
const FIELD_ORDER = ["name", "email", "phone", "property", "type", "message"];

// Submission is deliberately not connected: there is no backend or email
// service yet. When a verified transport exists (e.g. a future src/services
// module), replace the seam in handleSubmit — validate, send, then confirm.
// Until then this form never pretends an enquiry was sent, and never
// persists personal data.
const READY_MESSAGE =
  "Your details are ready, but online enquiry submission is not connected yet. Your enquiry has not been sent.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your full name.";
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  const phone = values.phone.trim();
  if (phone) {
    const digits = (phone.match(/\d/g) || []).length;
    const isWellFormed = /^[\d\s()+.\-]+$/.test(phone) && digits >= 7 && phone.length <= 20;
    if (!isWellFormed) {
      errors.phone = "Please enter a valid phone number, or leave it blank.";
    }
  }

  if (!values.message.trim()) {
    errors.message = "Please enter your message.";
  }

  return errors;
}

// Section 02 — the enquiry destination. The intro column holds the section's
// editorial voice; the form carries every control. The entrance is a single
// viewport-triggered timeline (the Enquiries chapter's pattern): it plays
// once when the section approaches, reverses on re-entry, and is never bound
// to scroll. Reduced motion gets no trigger and no hidden initial states, so
// the form renders fully visible — and nothing is ever animated again after
// the entrance, while the user types.
export default function ContactEnquiry() {
  const sectionRef = useRef(null);
  const formRef = useRef(null);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | { kind: "error" | "ready", text: string }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    // A corrected field clears its own error so the inline message never goes stale.
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
    // Stale "review the fields" guidance has served its purpose once editing resumes.
    setStatus((previous) => (previous && previous.kind === "error" ? null : previous));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate(values);
    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);

    if (firstInvalid) {
      setErrors(nextErrors);
      setStatus({
        kind: "error",
        text: "Please review the highlighted fields. Your enquiry has not been sent.",
      });
      const invalidControl = formRef.current?.elements.namedItem(firstInvalid);
      if (invalidControl && typeof invalidControl.focus === "function") {
        invalidControl.focus();
      }
      return;
    }

    // Submission seam — see the note above READY_MESSAGE. The form is left
    // intact so the visitor's details remain in hand for the real channel.
    setStatus({ kind: "ready", text: READY_MESSAGE });
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        })
        .fromTo(
          ".contact-enquiry__eyebrow",
          { opacity: 0, y: 14, letterSpacing: "0.5em" },
          { opacity: 1, y: 0, letterSpacing: "0.35em", duration: 1, ease: "power3.out" },
          0
        )
        .fromTo(
          ".contact-enquiry__title .contact__title-line > span",
          { yPercent: 112 },
          { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.14 },
          0.15
        )
        .fromTo(
          ".contact-enquiry__rule-gold",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: "expo.out" },
          0.5
        )
        .fromTo(
          ".contact-enquiry__support",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" },
          0.65
        )
        // Fields rise in a small stagger; the actions row lands last.
        .fromTo(
          ".contact-form__field",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09 },
          0.55
        )
        .fromTo(
          ".contact-form__actions",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
          1.15
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="contact-enquiry"
      aria-labelledby="contact-enquiry-title"
    >
      <div className="contact-enquiry__grid">
        <div className="contact-enquiry__intro">
          <p className="contact__eyebrow contact-enquiry__eyebrow">A Private Conversation</p>
          <h2 id="contact-enquiry-title" className="contact-enquiry__title">
            <span className="contact__title-line">
              <span>Tell us what</span>
            </span>
            <span className="contact__title-line">
              <span>brings you here.</span>
            </span>
          </h2>
          <div className="contact__rule-gold contact-enquiry__rule-gold" aria-hidden="true" />
          <p className="contact-enquiry__support">
            Share a few details and your area of interest.
          </p>
        </div>

        <form ref={formRef} className="contact-form" noValidate onSubmit={handleSubmit}>
          <div className="contact-form__row contact-form__row--pair">
            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="contact-name">
                Full name <span className="contact-form__req" aria-hidden="true">*</span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={values.name}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={errors.name ? "true" : undefined}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                className={`contact-form__control${errors.name ? " contact-form__control--invalid" : ""}`}
              />
              {errors.name && (
                <p className="contact-form__error" id="contact-name-error">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="contact-email">
                Email address <span className="contact-form__req" aria-hidden="true">*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={values.email}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={errors.email ? "true" : undefined}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                className={`contact-form__control${errors.email ? " contact-form__control--invalid" : ""}`}
              />
              {errors.email && (
                <p className="contact-form__error" id="contact-email-error">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="contact-form__row contact-form__row--pair">
            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="contact-phone">
                Phone number <span className="contact-form__optional">Optional</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={handleChange}
                aria-invalid={errors.phone ? "true" : undefined}
                aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                className={`contact-form__control${errors.phone ? " contact-form__control--invalid" : ""}`}
              />
              {errors.phone && (
                <p className="contact-form__error" id="contact-phone-error">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="contact-type">
                Enquiry type
              </label>
              <select
                id="contact-type"
                name="type"
                value={values.type}
                onChange={handleChange}
                className="contact-form__control contact-form__control--select"
              >
                {ENQUIRY_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="contact-form__row">
            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="contact-property">
                Property of interest
              </label>
              <select
                id="contact-property"
                name="property"
                value={values.property}
                onChange={handleChange}
                className="contact-form__control contact-form__control--select"
              >
                <option value="general">No specific property</option>
                {properties.map((property) => (
                  <option key={property.slug} value={property.slug}>
                    {property.name} — {property.location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="contact-form__row">
            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="contact-message">
                Message <span className="contact-form__req" aria-hidden="true">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                value={values.message}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={errors.message ? "true" : undefined}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                className={`contact-form__control contact-form__control--textarea${
                  errors.message ? " contact-form__control--invalid" : ""
                }`}
              />
              {errors.message && (
                <p className="contact-form__error" id="contact-message-error">
                  {errors.message}
                </p>
              )}
            </div>
          </div>

          <div className="contact-form__actions">
            <div>
              <button type="submit" className="contact-form__submit">
                Submit Enquiry
                <span className="contact-form__submit-arrow" aria-hidden="true">→</span>
              </button>
              <p className="contact-form__note">
                Online submission is not yet connected. Your details remain in
                this form only — nothing is saved or sent.
              </p>
            </div>
            <p
              // Live status region: mounted permanently so the first
              // announcement is never skipped (a hidden→visible live region
              // can be silently ignored by some screen reader/browser
              // combinations). With no message it renders empty and takes no
              // space; role="status" alone carries the polite live semantics.
              className={`contact-form__status${
                status ? ` contact-form__status--${status.kind}` : ""
              }`}
              role="status"
            >
              {status ? status.text : ""}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
