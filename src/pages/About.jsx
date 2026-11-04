import AboutHero from "../components/about/AboutHero";
import AboutPhilosophy from "../components/about/AboutPhilosophy";
import AboutCuration from "../components/about/AboutCuration";
import AboutCollection from "../components/about/AboutCollection";

// About — an editorial publication for an independent curator. Four
// numbered sections, each owning its own visual language and its own GSAP
// context, composed in order: perspective, philosophy, curation, collection.
export default function About() {
  return (
    <article className="about" aria-label="About AURELIA">
      <AboutHero />
      <AboutPhilosophy />
      <AboutCuration />
      <AboutCollection />
    </article>
  );
}
