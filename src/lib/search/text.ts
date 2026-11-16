/**
 * Small, dependency-free text helpers for site search: normalising, tokenising, a light stemmer
 * (plurals and "-ing"), stop words and a short synonym table. Nothing here talks to a network.
 */

/** Words that carry no meaning on their own. They are dropped unless nothing else is left. */
const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "of", "to", "in", "on", "at", "for", "with", "by", "from",
    "is", "are", "be", "do", "does", "i", "you", "me", "my", "we", "us", "our", "your", "it",
    "can", "how", "what", "whats", "where", "when", "which", "who", "any", "there", "about",
]);

/** Lower case, no accents, no apostrophes, everything else that is not a letter or digit becomes a space. */
export function normalise(input: string): string {
    return input
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/['’`]/g, "")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
}

/** Reduces simple plurals and "-ing" forms so "classes", "class", "dancing" and "dance" can meet. */
export function stem(word: string): string {
    let w = word;
    if (w.length > 4 && w.endsWith("ies")) w = `${w.slice(0, -3)}y`;
    else if (w.length > 4 && /(sses|ches|shes|xes|zes)$/.test(w)) w = w.slice(0, -2);
    else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us"))
        w = w.slice(0, -1);
    if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
    if (w.length > 3 && w.endsWith("e")) w = w.slice(0, -1);
    return w;
}

export function tokenise(input: string): string[] {
    return normalise(input).split(" ").filter(Boolean);
}

/** True when every word is a stop word, such as "what's on". */
export function onlyStopWords(input: string): boolean {
    const all = tokenise(input);
    return all.length > 0 && all.every((word) => STOP_WORDS.has(word));
}

/** Query terms: stop words removed (unless that would leave nothing), then stemmed, without repeats. */
export function queryTerms(input: string): string[] {
    const all = tokenise(input);
    const meaningful = all.filter((word) => !STOP_WORDS.has(word));
    const words = meaningful.length > 0 ? meaningful : all;
    return [...new Set(words.map(stem))];
}

/** Groups of stems that mean nearly the same thing on this site. Kept deliberately short. */
const SYNONYM_GROUPS: string[][] = [
    ["event", "activity", "happening"],
    ["class", "lesson"],
    ["hire", "rental", "rent"],
    ["venue", "space", "studio", "room"],
    ["schedule", "timetable"],
    ["contact", "phone", "email", "call", "enquiry", "enquire"],
    ["teacher", "instructor", "tutor", "coach"],
    ["price", "cost", "fee", "fees"],
    ["member", "membership"],
    ["performance", "show"],
    ["course", "term"],
].map((group) => group.map(stem));

const SYNONYMS = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS)
    for (const term of group)
        SYNONYMS.set(term, [
            ...new Set([...(SYNONYMS.get(term) ?? []), ...group.filter((other) => other !== term)]),
        ]);

export function synonymsOf(term: string): string[] {
    return SYNONYMS.get(term) ?? [];
}
