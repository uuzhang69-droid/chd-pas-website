"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
    render: (
        element: HTMLElement,
        options: {
            sitekey: string;
            callback: (token: string) => void;
            "expired-callback"?: () => void;
            "error-callback"?: () => void;
        },
    ) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId?: string) => void;
};

declare global {
    interface Window {
        turnstileApi?: TurnstileApi;
    }
}

let loader: Promise<TurnstileApi | undefined> | undefined;

function loadTurnstile(): Promise<TurnstileApi | undefined> {
    if (typeof window === "undefined") return Promise.resolve(undefined);
    const existing = (window as unknown as { turnstile?: TurnstileApi })
        .turnstile;
    if (existing) return Promise.resolve(existing);
    loader ??= new Promise((resolve) => {
        const script = document.createElement("script");
        script.src =
            "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.onload = () =>
            resolve(
                (window as unknown as { turnstile?: TurnstileApi }).turnstile,
            );
        script.onerror = () => resolve(undefined);
        document.head.appendChild(script);
    });
    return loader;
}

/**
 * One Turnstile widget with its own token, so several forms on a page never share a challenge.
 * Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set. Bump `resetKey` to get a new challenge.
 */
export function TurnstileField({
    onToken,
    resetKey = 0,
}: {
    onToken: (token: string) => void;
    resetKey?: number;
}) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const container = useRef<HTMLDivElement>(null);
    const widget = useRef<string | undefined>(undefined);
    const api = useRef<TurnstileApi | undefined>(undefined);

    useEffect(() => {
        if (!siteKey || !container.current) return;
        let cancelled = false;
        loadTurnstile().then((turnstile) => {
            if (cancelled || !turnstile || !container.current) return;
            api.current = turnstile;
            widget.current = turnstile.render(container.current, {
                sitekey: siteKey,
                callback: onToken,
                "expired-callback": () => onToken(""),
                "error-callback": () => onToken(""),
            });
        });
        return () => {
            cancelled = true;
            if (widget.current) api.current?.remove(widget.current);
            widget.current = undefined;
        };
    }, [siteKey, onToken]);

    useEffect(() => {
        if (resetKey > 0 && widget.current) {
            onToken("");
            api.current?.reset(widget.current);
        }
    }, [resetKey, onToken]);

    if (!siteKey) return null;
    return <div ref={container} className="mt-3" />;
}
