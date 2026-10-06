import type { APIRoute } from "astro";

export const prerender = true;

// Single-page site: list the root plus its in-page sections as anchors are not indexed, so root only.
export const GET: APIRoute = ({ site }) => {
  const loc = site ? new URL("/", site).href : "/";
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
