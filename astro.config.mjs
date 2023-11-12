import { defineConfig } from "astro/config"
import cloudflare from "@astrojs/cloudflare"
import svelte from "@astrojs/svelte"
import tailwind from "@astrojs/tailwind"
import swup from "@swup/astro"

// https://astro.build/config
export default defineConfig({
  site: "https://ryu.app",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    tailwind(),
    swup({
      theme: false,
      containers: ["#main-content"],
      accessibility: false,
    }),
    svelte(),
  ],
  build: {
    format: "file",
  },
})
