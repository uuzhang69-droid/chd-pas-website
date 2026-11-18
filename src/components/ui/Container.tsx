import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "nav";
  id?: string;
  /** For data-dense blocks (the timetable calendar, the membership cards): same gutters and centring, a wider maximum. */
  wide?: boolean;
};

/**
 * The one outer content container of the public site: width from --page-width (globals.css), the same horizontal
 * padding everywhere. Header, footer, every section and every hero use it, so all left and right edges line up.
 */
export function Container({ children, className = "", as: Tag = "div", id, wide = false }: ContainerProps) {
  const width = wide ? "max-w-[var(--page-width-wide)]" : "max-w-[var(--page-width)]";
  return (
    <Tag id={id} className={`mx-auto w-full ${width} px-5 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Tag>
  );
}
