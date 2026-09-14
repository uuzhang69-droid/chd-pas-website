import Image from "next/image";
import Link from "next/link";
import { siteContent } from "@/content/site";

type BrandMarkProps = {
  variant?: "header" | "footer";
  priority?: boolean;
};

export function BrandMark({ variant = "header", priority = false }: BrandMarkProps) {
  const { logo } = siteContent.global;
  const isFooter = variant === "footer";
  const imageSrc = isFooter
    ? (logo.footerSrc ?? logo.src)
    : (logo.headerSrc ?? logo.src);
  const logoSize = logo.minHeight;

  return (
    <Link
      href="/"
      className="group flex w-max shrink-0 items-center gap-2.5 py-0.5 sm:gap-3"
      aria-label={logo.alt}
    >
      {isFooter ? (
        <span
          className="inline-block shrink-0 bg-charcoal"
          style={{
            width: logoSize,
            height: logoSize,
            WebkitMaskImage: `url('${imageSrc}')`,
            maskImage: `url('${imageSrc}')`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
          aria-hidden
        />
      ) : (
        <Image
          src={imageSrc}
          alt=""
          width={logoSize}
          height={logoSize}
          className="w-auto object-contain"
          style={{ height: logoSize, maxWidth: logoSize }}
          priority={priority}
          aria-hidden
        />
      )}
      <span
        className={`flex flex-col leading-tight ${
          isFooter ? "max-w-[10rem] sm:max-w-[12rem] md:max-w-none" : ""
        }`}
      >
        <span
          className={`font-[family-name:var(--font-cormorant)] text-xl font-bold leading-none tracking-wide sm:text-2xl md:text-[1.75rem] ${
            isFooter ? "text-ivory" : "text-burgundy"
          }`}
        >
          {logo.nameLine1}
        </span>
        <span
          className={`mt-1 font-[family-name:var(--font-montserrat)] text-[0.7rem] font-normal normal-case leading-snug sm:text-xs md:text-sm ${
            isFooter ? "text-ivory/80" : "text-charcoal/75"
          }`}
        >
          {logo.nameLine2}
        </span>
      </span>
    </Link>
  );
}
