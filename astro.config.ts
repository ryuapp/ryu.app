import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://ryu.app",
  output: "hybrid",
  adapter: cloudflare(),
  integrations: [tailwind(), svelte()],
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
