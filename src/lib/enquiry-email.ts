import { siteContent } from "@/content/site";
import type { FormField } from "@/content/types";

export function getEnquiryRecipientEmail(): string {
  return siteContent.pages.contact.details.email;
}

export function buildEnquiryMailtoUrl(
  recipient: string,
  fields: FormField[],
  formData: FormData,
): string {
  const lines: string[] = [];
  let subject = "Website enquiry";

  for (const field of fields) {
    const raw = formData.get(field.name);
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) continue;

    if (field.type === "select" && field.options) {
      const option = field.options.find((entry) => entry.value === value);
      const display = option?.label ?? value;
      if (field.name === "subject" || field.name === "about") {
        subject = display;
      }
      lines.push(`${field.label}: ${display}`);
    } else {
      lines.push(`${field.label}: ${value}`);
    }
  }

  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", lines.join("\n\n"));

  return `mailto:${recipient}?${params.toString()}`;
}

export function buildSimpleMailtoUrl(
  recipient: string,
  subject: string,
  body: string,
): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);
  return `mailto:${recipient}?${params.toString()}`;
}
