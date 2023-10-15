import { defineConfig } from "astro/config"
import cloudflare from "@astrojs/cloudflare"
import tailwind from "@astrojs/tailwind"

import react from "@astrojs/react"

// https://astro.build/config
export default defineConfig({
  site: "https://www.ryu.app",
  output: "server",
  adapter: cloudflare(),
  integrations: [tailwind(), react()],
  build: {
    format: "file",
  },
})
