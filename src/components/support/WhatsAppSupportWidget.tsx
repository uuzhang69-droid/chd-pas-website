"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import "./whatsapp-support.css";

/** Support WhatsApp number — international digits only (no +, spaces, or punctuation). */
const WHATSAPP_SUPPORT_NUMBER = "447728617531";

function WhatsAppIcon() {
  return (
    <svg
      className="whatsapp-support__toggle-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function validatePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "Please enter your phone number.";
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return "Enter a valid phone number (10–15 digits). Include your country code if needed.";
  }
  return null;
}

export function WhatsAppSupportWidget() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const titleId = useId();
  const nameId = useId();
  const phoneId = useId();
  const nameErrorId = useId();
  const phoneErrorId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setNameError("");
    setPhoneError("");
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => nameInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nameTrim = name.trim();
    let valid = true;

    if (!nameTrim) {
      setNameError("Please enter your name.");
      valid = false;
    } else {
      setNameError("");
    }

    const phoneValidation = validatePhone(phone);
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!valid) return;

    const message = `Hi, my name is ${nameTrim}. My phone number is ${phone.trim()}. I'd like to chat with support.`;
    const url = `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setName("");
    setPhone("");
    close();
  };

  return (
    <div className="whatsapp-support">
      {open && (
        <div
          ref={panelRef}
          className="whatsapp-support__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="whatsapp-support__panel-header">
            <h2 className="whatsapp-support__title" id={titleId}>
              WhatsApp support
            </h2>
            <button
              type="button"
              className="whatsapp-support__close"
              aria-label="Close WhatsApp support form"
              onClick={() => {
                close();
                toggleRef.current?.focus();
              }}
            >
              ×
            </button>
          </div>
          <form className="whatsapp-support__form" onSubmit={handleSubmit} noValidate>
            <div className="whatsapp-support__field">
              <label className="whatsapp-support__label" htmlFor={nameId}>
                Your name
              </label>
              <input
                ref={nameInputRef}
                id={nameId}
                className="whatsapp-support__input"
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? nameErrorId : undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  if (nameError) setNameError("");
                }}
              />
              {nameError && (
                <p className="whatsapp-support__error" id={nameErrorId} role="alert">
                  {nameError}
                </p>
              )}
            </div>
            <div className="whatsapp-support__field">
              <label className="whatsapp-support__label" htmlFor={phoneId}>
                Phone number
              </label>
              <input
                id={phoneId}
                className="whatsapp-support__input"
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                aria-invalid={phoneError ? true : undefined}
                aria-describedby={phoneError ? phoneErrorId : undefined}
                onChange={(event) => {
                  setPhone(event.target.value);
                  if (phoneError) setPhoneError("");
                }}
              />
              {phoneError && (
                <p className="whatsapp-support__error" id={phoneErrorId} role="alert">
                  {phoneError}
                </p>
              )}
            </div>
            <button type="submit" className="whatsapp-support__submit">
              Start WhatsApp Chat
            </button>
          </form>
        </div>
      )}

      <button
        ref={toggleRef}
        type="button"
        className="whatsapp-support__toggle"
        aria-label={open ? "Close WhatsApp support" : "Open WhatsApp support"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        <WhatsAppIcon />
      </button>
    </div>
  );
}
