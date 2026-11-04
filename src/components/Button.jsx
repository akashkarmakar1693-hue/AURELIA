export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = variant === "outline" ? "btn btn--outline" : "btn";
  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
