import ContactHero from "../components/contact/ContactHero";
import ContactEnquiry from "../components/contact/ContactEnquiry";
import ContactClosing from "../components/contact/ContactClosing";

// Contact — AURELIS's private enquiry destination. Three sections composed
// in order — opening statement, enquiry form, closing statement — each
// owning its own visual language and its own GSAP context, matching the
// About page's architecture. Navbar and Footer are supplied by RootLayout.
export default function Contact() {
  return (
    <article className="contact" aria-label="Contact AURELIS">
      <ContactHero />
      <ContactEnquiry />
      <ContactClosing />
    </article>
  );
}
