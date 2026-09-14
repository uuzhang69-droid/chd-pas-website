import Link from "next/link";
import type { CtaButton } from "@/content/types";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 text-small font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy";

const variants = {
  primary:
    "bg-burgundy text-ivory hover:bg-burgundy/90 shadow-sm hover:shadow-md",
  secondary:
    "bg-rose text-charcoal hover:bg-rose/85 border border-taupe/40",
  text: "bg-transparent text-rose hover:text-rose/80 underline-offset-4 hover:underline px-0 py-0",
};

type ButtonProps = CtaButton & {
  className?: string;
};

export function Button({
  label,
  href,
  variant = "primary",
  external,
  className = "",
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}
