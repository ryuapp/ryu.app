import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://ryu.app",
  output: "static",
  integrations: [mdx()],
  build: {
    format: "file",
  },
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwind()],
  },
});
