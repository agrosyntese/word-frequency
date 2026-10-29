import { fetchPage } from '../server/fetchPage.js';
import { FetchPageError } from '../server/urlPolicy.js';

// Vercel serverless function: GET /api/fetch-text?url=<page> → FetchedPage | { error }.
export async function GET(request: Request): Promise<Response> {
  const target = new URL(request.url).searchParams.get('url');
  if (!target) return json({ error: 'Informe a URL da página.' }, 400);

  try {
    return json(await fetchPage(target), 200);
  } catch (error) {
    const { message, status } =
      error instanceof FetchPageError ? error : new FetchPageError('Erro inesperado ao buscar a página.', 500);
    return json({ error: message }, status);
  }
}

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
