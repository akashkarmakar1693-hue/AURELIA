import { useParams } from "react-router-dom";
import Section from "../components/Section";

export default function PropertyDetail() {
  const { slug } = useParams();

  return (
    <Section title={slug} lead="Property detail experience coming soon." />
  );
}
