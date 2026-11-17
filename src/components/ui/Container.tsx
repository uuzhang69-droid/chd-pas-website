import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "nav";
  id?: string;
};

/**
 * The one outer content container of the public site: width from --page-width (globals.css), the same horizontal
 * padding everywhere. Header, footer, every section and every hero use it, so all left and right edges line up.
 */
export function Container({ children, className = "", as: Tag = "div", id }: ContainerProps) {
  return (
    <Tag id={id} className={`mx-auto w-full max-w-[var(--page-width)] px-5 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Tag>
  );
}
