"use client";

import {
  buildSimpleMailtoUrl,
  getEnquiryRecipientEmail,
} from "@/lib/enquiry-email";

type NewsletterSignupFormProps = {
  inputId: string;
  placeholder: string;
  submitLabel: string;
  inputClassName: string;
  buttonClassName: string;
  formClassName?: string;
};

export function NewsletterSignupForm({
  inputId,
  placeholder,
  submitLabel,
  inputClassName,
  buttonClassName,
  formClassName = "flex flex-col gap-2 sm:flex-row",
}: NewsletterSignupFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    if (typeof email !== "string" || !email.trim()) return;

    const url = buildSimpleMailtoUrl(
      getEnquiryRecipientEmail(),
      "Newsletter signup",
      `Please add me to the newsletter mailing list.\n\nEmail: ${email.trim()}`,
    );
    window.location.href = url;
  }

  return (
    <form className={formClassName} onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="sr-only">
        {placeholder}
      </label>
      <input
        id={inputId}
        type="email"
        name="email"
        required
        placeholder={placeholder}
        className={inputClassName}
      />
      <button type="submit" className={buttonClassName}>
        {submitLabel}
      </button>
    </form>
  );
}
