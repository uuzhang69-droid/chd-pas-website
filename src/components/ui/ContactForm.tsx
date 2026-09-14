"use client";

import { useState } from "react";
import { siteContent } from "@/content/site";
import type { FormField } from "@/content/types";

type ContactFormProps = {
  fields: FormField[];
  submitLabel: string;
  successMessage: string;
  selectPlaceholder: string;
  action: string;
};

export function ContactForm({
  fields,
  submitLabel,
  successMessage,
  selectPlaceholder,
  action,
}: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const requiredMarker = siteContent.ui.form.requiredMarker;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-sm border border-rose/40 bg-ivory px-6 py-8">
        <p className="text-body-lg text-charcoal">{successMessage}</p>
      </div>
    );
  }

  return (
    <form action={action} method="post" onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="text-small font-semibold text-charcoal">
            {field.label}
            {field.required && <span className="text-rose">{requiredMarker}</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={field.name}
              name={field.name}
              rows={5}
              required={field.required}
              placeholder={field.placeholder}
              className="mt-2 w-full rounded-sm border border-taupe/50 bg-ivory px-4 py-3 text-body outline-none focus:border-rose"
            />
          ) : field.type === "select" ? (
            <select
              id={field.name}
              name={field.name}
              required={field.required}
              className="mt-2 w-full rounded-sm border border-taupe/50 bg-ivory px-4 py-3 text-body outline-none focus:border-rose"
              defaultValue=""
            >
              <option value="" disabled>
                {field.placeholder ?? selectPlaceholder}
              </option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              className="mt-2 w-full rounded-sm border border-taupe/50 bg-ivory px-4 py-3 text-body outline-none focus:border-rose"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="rounded-sm bg-burgundy px-6 py-3 text-small font-semibold text-ivory transition-colors hover:bg-burgundy/90"
      >
        {submitLabel}
      </button>
    </form>
  );
}
