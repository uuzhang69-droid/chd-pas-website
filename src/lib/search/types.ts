export type SearchDocType =
    | "Page"
    | "Class"
    | "Course"
    | "Event"
    | "Workshop"
    | "Masterclass"
    | "Venue hire";

/** One public page that can be found by search. */
export type SearchDoc = {
    /** Site path, always one of the public pages in the sitemap. */
    url: string;
    title: string;
    type: SearchDocType;
    summary: string;
    /** Category, tags, teacher and similar short facts. */
    keywords: string;
    /** The rest of the public text on the page. */
    body: string;
    /** Phrases that mean this page (for example "what's on"). Used for ranking only. */
    aliases?: string[];
    /** A main section page that can be offered as a suggested destination. */
    hub?: boolean;
};

export type SearchResult = {
    doc: SearchDoc;
    score: number;
    /** Share of the query terms found on the page, 0 to 1. */
    coverage: number;
    snippet: string;
    /** The query names this main page: a title word, or all words of one of its intent phrases. */
    suggestable: boolean;
};

export type SearchOutcome = {
    query: string;
    terms: string[];
    /** A main page that clearly matches what was typed. Also left out of `results`. */
    suggested?: SearchResult;
    results: SearchResult[];
    total: number;
    page: number;
    pageCount: number;
};
