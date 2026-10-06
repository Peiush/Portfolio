import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// Canonical origin: set PUBLIC_SITE_URL (custom domain) or rely on Vercel's production URL.
const site =
  process.env.PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export default defineConfig({
  site,
  adapter: vercel(),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
