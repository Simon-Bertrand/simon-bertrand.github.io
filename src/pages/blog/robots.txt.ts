export function GET() {
  return new Response(`User-agent: *\nAllow: /\nSitemap: /sitemap-index.xml\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}