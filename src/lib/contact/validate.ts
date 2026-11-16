import type { FormField } from "../../content/types";
import {
    cleanText,
    countLinks,
    isValidEmail,
} from "../security/validation";

/**
 * Field rules for the contact form. The browser runs them first, so a visitor sees every problem at
 * once without a request being sent; the server runs the same rules again because the browser is not trusted.
 * This file has no server-only imports, so the form component can use it too.
 */

const LIMITS = { name: 100, email: 254, phone: 20, message: 5000, other: 200 };

export function limitFor(field: FormField): number {
    if (field.name === "message" || field.type === "textarea")
        return LIMITS.message;
    if (field.name === "name") return LIMITS.name;
    if (field.type === "email") return LIMITS.email;
    if (field.type === "tel") return LIMITS.phone;
    return LIMITS.other;
}

export type ContactValidation = {
    values: Record<string, string>;
    errors: Record<string, string>;
};

const REQUIRED_MESSAGE: Record<string, string> = {
    name: "Please enter your full name.",
    email: "Please enter your email address.",
    subject: "Please choose a subject.",
    message: "Please enter your message.",
};

export function validateContact(
    fields: FormField[],
    body: Record<string, unknown>,
): ContactValidation {
    const values: Record<string, string> = {};
    const errors: Record<string, string> = {};
    for (const field of fields) {
        // A conditional field (for example "Please specify") only counts while its trigger matches.
        // The trigger is checked against the cleaned value, never the browser's say-so.
        if (field.showWhen) {
            const trigger = fields.find(
                (item) => item.name === field.showWhen?.field,
            );
            const triggerValue = trigger
                ? cleanText(body[trigger.name], limitFor(trigger), false)
                : "";
            if (triggerValue !== field.showWhen.value) {
                values[field.name] = "";
                continue;
            }
        }
        const value = cleanText(
            body[field.name],
            limitFor(field),
            field.type === "textarea",
        );
        values[field.name] = value;
        const required = field.required === true || field.type === "email";
        if (!value) {
            if (required)
                errors[field.name] =
                    REQUIRED_MESSAGE[field.name] ?? "Please complete this field.";
            continue;
        }
        if (field.type === "email" && !isValidEmail(value))
            errors[field.name] =
                "Please enter a valid email address, for example name@example.com.";
        else if (field.type === "tel" && !/^[+()\-\d\s]{7,20}$/.test(value))
            errors[field.name] =
                "Please enter a valid phone number, or leave this blank.";
        else if (field.type === "select") {
            if (!field.options?.some((option) => option.value === value))
                errors[field.name] = "Please choose one of the options.";
        } else if (field.name === "name" && value.length < 2)
            errors[field.name] = "Please enter your full name.";
        else if (field.name === "message") {
            if (value.length < 10)
                errors[field.name] =
                    "Please write a little more (at least 10 characters).";
            else if (countLinks(value) > 3)
                errors[field.name] = "Please remove some of the links.";
        }
    }
    return { values, errors };
}
