"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { CLASS_MANAGER_BOOKING_URL } from "@/lib/class-calendar/utils";

type MembershipChoice = "existing" | "new" | "single";

const MEMBERSHIP_OPTIONS: { value: MembershipChoice; title: string; detail: string }[] = [
  {
    value: "existing",
    title: "I already have a membership card",
    detail: "Check eligible options in your ClassManager account.",
  },
  {
    value: "new",
    title: "I’d like a membership card",
    detail: "Ask about cards, prices and how to purchase first.",
  },
  {
    value: "single",
    title: "Continue without a membership card",
    detail: "Review available class bookings in ClassManager.",
  },
];

type BookingOptionsDialogProps = {
  sectionRef: RefObject<HTMLElement | null>;
};

export function BookingOptionsDialog({ sectionRef }: BookingOptionsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedRef = useRef("");
  const [selectedClassLine, setSelectedClassLine] = useState("");
  const [membershipChoice, setMembershipChoice] = useState<MembershipChoice | "">("");
  const [choiceDescription, setChoiceDescription] = useState("Select an option to continue.");
  const [continueHidden, setContinueHidden] = useState(true);
  const [continueText, setContinueText] = useState("Continue to ClassManager ↗");
  const [continueHref, setContinueHref] = useState<string | undefined>(undefined);
  const [continueTarget, setContinueTarget] = useState<string | undefined>(undefined);
  const [continueRel, setContinueRel] = useState<string | undefined>(undefined);

  const openBookingRef = useRef<(name: string, preset?: string) => void>(() => {});

  openBookingRef.current = (name: string, preset?: string) => {
    selectedRef.current = name;
    setSelectedClassLine(name);
    const presetChoice =
      preset === "existing" || preset === "new" || preset === "single" ? preset : "";
    setMembershipChoice(presetChoice);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  };

  useEffect(() => {
    const choice = membershipChoice;
    if (!choice) {
      setChoiceDescription("Select an option to continue.");
      setContinueHidden(true);
      setContinueHref(undefined);
      setContinueTarget(undefined);
      setContinueRel(undefined);
      return;
    }

    if (choice === "new") {
      setContinueText("Ask about membership cards ↗");
      setContinueHref(
        `mailto:info@countyhalldancecentre.com?subject=${encodeURIComponent("Membership card enquiry")}&body=${encodeURIComponent(`I am interested in ${selectedRef.current}. Please send membership card prices, validity, eligible classes and a purchase link.`)}`,
      );
      setContinueTarget(undefined);
      setContinueRel(undefined);
      setChoiceDescription(
        "Card purchases are not connected here yet. Contact the school for current card options before booking.",
      );
    } else {
      setContinueText("Continue to ClassManager ↗");
      setContinueHref(CLASS_MANAGER_BOOKING_URL);
      setContinueTarget("_blank");
      setContinueRel("noopener noreferrer");
      setChoiceDescription(
        choice === "existing"
          ? "Sign in to ClassManager and check the options available for your membership. No card or discount has been applied here."
          : "Choose an upcoming class and review the final price in ClassManager. Opens in a new tab.",
      );
    }
    setContinueHidden(false);
  }, [membershipChoice]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest("[data-book]");
      if (!trigger || !sectionRef.current?.contains(trigger)) return;
      const name = trigger.getAttribute("data-book");
      if (!name) return;
      const preset = trigger.getAttribute("data-member") ?? undefined;
      openBookingRef.current(name, preset);
    };

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [sectionRef]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onDialogClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      ) {
        dialog.close();
      }
    };

    dialog.addEventListener("click", onDialogClick);
    return () => dialog.removeEventListener("click", onDialogClick);
  }, []);

  const resetDialog = () => {
    setMembershipChoice("");
  };

  return (
    <dialog
      ref={dialogRef}
      id="booking-dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      onClose={resetDialog}
    >
      <form method="dialog">
        <button className="dialog-close" type="submit" aria-label="Close booking options">
          ×
        </button>
      </form>

      <p className="eyebrow">BEFORE YOU CONTINUE</p>
      <h2 id="dialog-title">Your booking options</h2>
      <p id="selected-class">{selectedClassLine}</p>
      <p id="dialog-description">
        Choose how you would like to book. Final dates, prices and payment are handled by ClassManager.
      </p>

      <fieldset>
        <legend>Membership card option</legend>
        {MEMBERSHIP_OPTIONS.map((option) => (
          <label className="choice" key={option.value}>
            <input
              type="radio"
              name="membership"
              value={option.value}
              checked={membershipChoice === option.value}
              onChange={() => setMembershipChoice(option.value)}
            />
            <span>
              <strong>{option.title}</strong>
              <small>{option.detail}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <p id="choice-description" className="choice-description" aria-live="polite">
        {choiceDescription}
      </p>
      <a
        id="booking-continue"
        className="button"
        hidden={continueHidden}
        href={continueHref}
        target={continueTarget}
        rel={continueRel}
      >
        {continueText}
      </a>
      <p className="handoff-note">
        This choice does not apply discounts or reserve a place. Select your upcoming class again in
        ClassManager.
      </p>
    </dialog>
  );
}
