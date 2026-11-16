import { getSearchIndex } from "./build-index";
import { normalise, onlyStopWords, queryTerms, stem, synonymsOf, tokenise } from "./text";
import type { SearchDoc, SearchOutcome, SearchResult } from "./types";

export const PAGE_SIZE = 10;
const MAX_QUERY_LENGTH = 100;
const MAX_TERMS = 8;

/**
 * Weight of the best place a term is found. Higher is better:
 * title, then the page's own intent words (aliases), then category/tags/teacher, then the summary, then the body.
 */
const WEIGHT = {
    title: { exact: 30, prefix: 18 },
    alias: { exact: 25, prefix: 12 },
    keywords: { exact: 15, prefix: 9 },
    summary: { exact: 8, prefix: 4 },
    body: { exact: 3, prefix: 1.5 },
} as const;
const SYNONYM_FACTOR = 0.7;
const MIN_PREFIX_LENGTH = 3;

type Prepared = {
    doc: SearchDoc;
    titleNorm: string;
    title: string[];
    alias: string[];
    aliasNorm: string[];
    aliasPhrases: string[][];
    keywords: string[];
    summary: string[];
    body: string[];
};

const stems = (text: string) => tokenise(text).map(stem);
const prepared = new WeakMap<SearchDoc, Prepared>();

function prepare(doc: SearchDoc): Prepared {
    let entry = prepared.get(doc);
    if (!entry) {
        entry = {
            doc,
            titleNorm: normalise(doc.title),
            title: stems(doc.title),
            alias: (doc.aliases ?? []).flatMap(stems),
            aliasNorm: (doc.aliases ?? []).map(normalise),
            aliasPhrases: (doc.aliases ?? []).map(stems),
            keywords: stems(doc.keywords),
            summary: stems(doc.summary),
            body: stems(doc.body),
        };
        prepared.set(doc, entry);
    }
    return entry;
}

function fieldScore(
    tokens: string[],
    term: string,
    weight: { exact: number; prefix: number },
): number {
    if (tokens.includes(term)) return weight.exact;
    if (term.length >= MIN_PREFIX_LENGTH && tokens.some((token) => token.startsWith(term)))
        return weight.prefix;
    return 0;
}

/** Best score for one term on one page. */
function termScore(page: Prepared, term: string): number {
    const candidates = (t: string) => {
        return Math.max(
            fieldScore(page.title, t, WEIGHT.title),
            fieldScore(page.alias, t, WEIGHT.alias),
            fieldScore(page.keywords, t, WEIGHT.keywords),
            fieldScore(page.summary, t, WEIGHT.summary),
            fieldScore(page.body, t, WEIGHT.body),
        );
    };
    let best = candidates(term);
    for (const synonym of synonymsOf(term)) best = Math.max(best, candidates(synonym) * SYNONYM_FACTOR);
    return best;
}

function snippetFor(doc: SearchDoc, terms: string[]): string {
    const wanted = new Set(terms);
    const hit = (sentence: string) => stems(sentence).some((token) => wanted.has(token));
    // Whole sentences only: short list items such as "Yoga" make poor snippets.
    const sentences = [doc.summary, ...doc.body.split(/\n|(?<=[.!?])\s+/)].filter((text) => text.length >= 25);
    const found = sentences.find(hit) ?? doc.summary ?? "";
    return found.length > 180 ? `${found.slice(0, 177).trimEnd()}…` : found;
}

function scoreDoc(page: Prepared, terms: string[], queryNorm: string): SearchResult | undefined {
    let sum = 0;
    let matched = 0;
    for (const term of terms) {
        const score = termScore(page, term);
        if (score > 0) {
            sum += score;
            matched += 1;
        }
    }
    if (matched === 0) return undefined;

    const coverage = matched / terms.length;
    let score = sum * (0.4 + 0.6 * coverage) + (coverage === 1 ? 20 : 0);
    if (page.titleNorm === queryNorm) score += 100;
    else if (terms.length > 1 && page.titleNorm.includes(queryNorm)) score += 40;
    if (page.aliasNorm.includes(queryNorm)) score += 40;
    // "Suggested destination": the query names this page by a title word, or contains a whole intent phrase.
    const suggestable =
        !!page.doc.hub &&
        (terms.some((term) => page.title.includes(term)) ||
            page.aliasPhrases.some((phrase) => phrase.length > 0 && phrase.every((word) => terms.includes(word))));
    return { doc: page.doc, score, coverage, snippet: "", suggestable };
}

/** Pure search over a list of documents. Used by the page and by the tests. */
export function searchDocs(
    docs: SearchDoc[],
    rawQuery: string,
    pageNumber = 1,
    pageSize = PAGE_SIZE,
): SearchOutcome {
    const query = rawQuery.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
    const terms = queryTerms(query).slice(0, MAX_TERMS);
    const empty: SearchOutcome = {
        query,
        terms,
        results: [],
        total: 0,
        page: 1,
        pageCount: 1,
    };
    if (terms.length === 0) return empty;

    const queryNorm = normalise(query);
    const seen = new Set<string>();
    // A query made only of filler words ("what's on") must name a page; it is not matched in body text.
    const mustBeIntent = onlyStopWords(query);
    const scored: SearchResult[] = [];
    for (const doc of docs) {
        if (seen.has(doc.url)) continue; // one result per URL
        seen.add(doc.url);
        const result = scoreDoc(prepare(doc), terms, queryNorm);
        if (result && (!mustBeIntent || result.suggestable)) scored.push(result);
    }
    scored.sort(
        (a, b) =>
            b.score - a.score ||
            Number(b.doc.hub ?? false) - Number(a.doc.hub ?? false) ||
            a.doc.title.localeCompare(b.doc.title),
    );

    // A main page is offered as the suggested destination when its title or intent words match
    // at least half of what was typed. It is still an ordinary result; it is only shown first.
    const suggested = scored.find(
        (result) => result.suggestable && result.coverage >= 0.5,
    );
    const rest = scored.filter((result) => result !== suggested);
    const pageCount = Math.max(1, Math.ceil(rest.length / pageSize));
    const page = Math.min(Math.max(1, Math.floor(pageNumber) || 1), pageCount);
    const slice = rest.slice((page - 1) * pageSize, page * pageSize);
    for (const result of [...slice, ...(suggested ? [suggested] : [])])
        result.snippet = snippetFor(result.doc, terms);

    return {
        query,
        terms,
        suggested,
        results: slice,
        total: scored.length,
        page,
        pageCount,
    };
}

export function searchSite(rawQuery: string, pageNumber = 1): SearchOutcome {
    return searchDocs(getSearchIndex(), rawQuery, pageNumber);
}
