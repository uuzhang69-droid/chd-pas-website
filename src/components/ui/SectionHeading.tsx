type SectionHeadingProps = {
  overline?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  overline,
  title,
  subtitle,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <header className={`mb-10 md:mb-14 max-w-2xl ${alignClass} ${className}`}>
      {overline && (
        <p className="text-overline text-rose mb-3">{overline}</p>
      )}
      <h2 className="text-h2 text-charcoal">{title}</h2>
      {subtitle && (
        <p className="text-body-lg text-charcoal/75 mt-4">{subtitle}</p>
      )}
    </header>
  );
}
