import { defineConfig } from "astro/config"
import cloudflare from "@astrojs/cloudflare"
import tailwind from "@astrojs/tailwind"
import react from "@astrojs/react"
import swup from "@swup/astro"

// https://astro.build/config
export default defineConfig({
  site: "https://ryu.app",
  output: "server",
  adapter: cloudflare(),
  integrations: [tailwind(), react(), swup({ theme: false })],
  build: {
    format: "file",
  },
})
