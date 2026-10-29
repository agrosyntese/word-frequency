const SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i;

// Accepts what people type ("exemplo.com/artigo") and returns a full http(s) URL, or null.
export function toHttpUrl(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  const withScheme = SCHEME_PATTERN.test(trimmed) && !/^[^/]+:\d/.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!url.hostname.includes('.') && !url.hostname.startsWith('[')) return null;
  return url.href;
}
