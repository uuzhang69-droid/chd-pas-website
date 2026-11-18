import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "nav";
  id?: string;
  /** Follow the Header: no maximum width and the Header's own side gutters (20, 24, 32, then 40 px). For the timetable and membership. */
  wide?: boolean;
};

/**
 * The one outer content container of the public site: width from --page-width (globals.css), the same horizontal
 * padding everywhere. Header, footer, every section and every hero use it, so all left and right edges line up.
 */
export function Container({ children, className = "", as: Tag = "div", id, wide = false }: ContainerProps) {
  // The Header (components/layout/Header.tsx) is full width with pl/pr of 5, 6, 8 and 10 (xl). The wide variant uses exactly those.
  const frame = wide ? "px-5 sm:px-6 lg:px-8 xl:px-10" : "max-w-[var(--page-width)] px-5 sm:px-6 lg:px-8";
  return (
    <Tag id={id} className={`mx-auto w-full ${frame} ${className}`}>
      {children}
    </Tag>
  );
}
