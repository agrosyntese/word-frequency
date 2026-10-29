export type WordCount = { word: string; count: number };

export type Summary = { total: number; unique: number };

// Response of /api/fetch-text, shared by the serverless function and the browser.
export type FetchedPage = { url: string; title: string; text: string; truncated: boolean };
