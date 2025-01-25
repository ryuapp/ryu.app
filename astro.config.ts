import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";
import tailwind from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://ryu.app",
  output: "static",
  adapter: cloudflare(),
  integrations: [svelte(), mdx()],
  build: {
    format: "file",
  },
  devToolbar: {
    enabled: false,
  },
  prefetch: {
    defaultStrategy: "viewport",
  },
  vite: {
    plugins: [tailwind()],
  },
});
