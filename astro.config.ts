import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://ryu.app",
  output: "static",
  integrations: [],
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
