export function json(
    status: number,
    body: Record<string, unknown>,
    retryAfter?: number,
): Response {
    return Response.json(body, {
        status,
        headers: {
            "Cache-Control": "no-store",
            ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
        },
    });
}
