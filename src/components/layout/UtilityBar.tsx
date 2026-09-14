import Link from "next/link";
import { siteContent } from "@/content/site";
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  SocialIcon,
} from "@/components/icons/SocialIcons";
import { Container } from "@/components/ui/Container";

export function UtilityBar() {
  const { utilityBar } = siteContent.global;

  return (
    <div className="hidden border-b border-taupe/30 bg-charcoal text-ivory md:block">
      <Container className="flex h-10 items-center justify-between text-small">
        <div className="flex items-center gap-6">
          <a
            href={utilityBar.phone.href}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <PhoneIcon className="h-3.5 w-3.5 text-rose" />
            <span>{utilityBar.phone.label}</span>
          </a>
          <a
            href={utilityBar.email.href}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <EnvelopeIcon className="h-3.5 w-3.5 text-rose" />
            <span>{utilityBar.email.label}</span>
          </a>
          <a
            href={utilityBar.findUs.href}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPinIcon className="h-3.5 w-3.5 text-rose" />
            <span>{utilityBar.findUs.label}</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          {utilityBar.social.map((item) => (
            <a
              key={item.platform}
              href={item.href}
              aria-label={item.label}
              className="text-ivory/80 transition-colors hover:text-rose"
              target="_blank"
              rel="noopener noreferrer"
            >
              <SocialIcon platform={item.platform} className="h-4 w-4" />
            </a>
          ))}
        </div>
      </Container>
    </div>
  );
}
