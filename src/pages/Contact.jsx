import { useEffect } from "react";
import ContactHero from "../components/contact/ContactHero";
import ContactEnquiry from "../components/contact/ContactEnquiry";
import ContactClosing from "../components/contact/ContactClosing";

// Contact — AURELIA's private enquiry destination. Three sections composed
// in order — opening statement, enquiry form, closing statement — each
// owning its own visual language and its own GSAP context, matching the
// About page's architecture. Navbar and Footer are supplied by RootLayout.
export default function Contact() {
  // The project has no route-wide document.title system, so the title is
  // set here and the previously observed title restored on unmount — other
  // routes (mounted after a Contact visit) keep whichever title they loaded
  // with, and direct loads of any route are unaffected.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Private Enquiries — AURELIA";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <article className="contact" aria-label="Contact AURELIA">
      <ContactHero />
      <ContactEnquiry />
      <ContactClosing />
    </article>
  );
}
