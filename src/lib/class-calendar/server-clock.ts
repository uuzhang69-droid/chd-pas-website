/** A server timestamp advanced only by a monotonic timer, never the device wall clock. */
export class ServerClock {
    private anchor: { epoch: number; monotonic: number } | null = null;

    set(epoch: number, monotonic: number) {
        if (!Number.isFinite(epoch) || !Number.isFinite(monotonic)) return;
        this.anchor = { epoch, monotonic };
    }

    read(monotonic: number): number | null {
        return this.anchor
            ? this.anchor.epoch + Math.max(0, monotonic - this.anchor.monotonic)
            : null;
    }
}
