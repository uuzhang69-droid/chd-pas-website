"use client";

import {
    createContext,
    createElement,
    useCallback,
    useContext,
    useMemo,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import { ServerClock } from "./server-clock";

const InitialServerTime = createContext<number | null>(null);
const clock = new ServerClock();
const listeners = new Set<() => void>();
let snapshot: number | null = null;
let stop: (() => void) | null = null;
let pending: Promise<void> | null = null;
let lastSync = -Infinity;
const RESYNC_MS = 15 * 60 * 1000;

export function ServerTimeProvider({
    initialTime,
    children,
}: {
    initialTime: number;
    children: ReactNode;
}) {
    return createElement(
        InitialServerTime.Provider,
        { value: initialTime },
        children,
    );
}

export function serverNow(): Date | null {
    const value = clock.read(performance.now());
    return value === null ? null : new Date(value);
}

function publish() {
    snapshot = clock.read(performance.now());
    listeners.forEach((listener) => listener());
}

async function sync(force = false) {
    if (pending) return pending;
    if (!force && performance.now() - lastSync < RESYNC_MS) return;
    pending = (async () => {
        const started = performance.now();
        try {
            const response = await fetch("/api/time", {
                cache: "no-store",
                signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) return;
            const data: { now?: unknown } = await response.json();
            const finished = performance.now();
            if (typeof data.now !== "number" || !Number.isFinite(data.now))
                return;
            clock.set(data.now + (finished - started) / 2, finished);
            lastSync = finished;
            publish();
        } catch {
            // Continue from the last server anchor; never substitute the device clock.
        }
    })().finally(() => {
        pending = null;
    });
    return pending;
}

function subscribe(listener: () => void, initialTime: number | null) {
    listeners.add(listener);
    if (!stop) {
        if (
            initialTime !== null &&
            (snapshot === null || initialTime > snapshot)
        ) {
            clock.set(initialTime, performance.now());
            publish();
        }
        void sync(true);
        const tick = window.setInterval(publish, 1000);
        const resync = window.setInterval(() => {
            void sync();
        }, RESYNC_MS);
        let hidden = document.visibilityState === "hidden";
        const onVisibility = () => {
            if (document.visibilityState === "hidden") {
                hidden = true;
            } else if (hidden) {
                hidden = false;
                void sync(true);
            }
        };
        const onFocus = () => {
            publish();
            if (performance.now() - lastSync > 60_000) void sync(true);
        };
        const onOnline = () => {
            void sync(true);
        };
        const onPageShow = (event: PageTransitionEvent) => {
            if (event.persisted) void sync(true);
        };
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("focus", onFocus);
        window.addEventListener("online", onOnline);
        window.addEventListener("pageshow", onPageShow);
        stop = () => {
            window.clearInterval(tick);
            window.clearInterval(resync);
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("online", onOnline);
            window.removeEventListener("pageshow", onPageShow);
        };
    }
    return () => {
        listeners.delete(listener);
        if (!listeners.size) {
            stop?.();
            stop = null;
        }
    };
}

export function useNow(): Date | null {
    const initialTime = useContext(InitialServerTime);
    const subscribeToClock = useCallback(
        (listener: () => void) => subscribe(listener, initialTime),
        [initialTime],
    );
    const getServerSnapshot = useCallback(() => initialTime, [initialTime]);
    const getSnapshot = useCallback(
        () =>
            snapshot === null
                ? initialTime
                : initialTime === null
                  ? snapshot
                  : Math.max(snapshot, initialTime),
        [initialTime],
    );
    const value = useSyncExternalStore(
        subscribeToClock,
        getSnapshot,
        getServerSnapshot,
    );
    return useMemo(() => (value === null ? null : new Date(value)), [value]);
}
