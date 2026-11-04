export default function Section({ children, className = "", eyebrow, title, lead }) {
  return (
    <section className={`section ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && <h2 className="h2 mt-2">{title}</h2>}
      {lead && <p className="lead">{lead}</p>}
      {children}
    </section>
  );
}
