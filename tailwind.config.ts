import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        brand: "#39b54a",
        github: "#181717",
      },
      fontFamily: {
        sans: "Poppins",
      },
    },
  },
  plugins: [],
} satisfies Config;
