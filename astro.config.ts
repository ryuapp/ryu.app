import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://ryu.app",
  output: "static",
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
