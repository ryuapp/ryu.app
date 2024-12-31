import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://ryu.app",
  output: "server",
  adapter: cloudflare(),
  integrations: [tailwind(), svelte(), mdx()],
  build: {
    format: "file",
  },
  devToolbar: {
    enabled: false,
  },
  prefetch: {
    defaultStrategy: "viewport",
  },
});
