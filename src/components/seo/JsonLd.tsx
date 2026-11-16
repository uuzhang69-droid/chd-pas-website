type JsonLdProps = { data: Record<string, unknown> | undefined };

/** Renders one JSON-LD block. "<" is escaped so content can never close the script tag early. */
export function JsonLd({ data }: JsonLdProps) {
    if (!data) return null;
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, "\\u003c"),
            }}
        />
    );
}
