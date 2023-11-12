/** @type {import('prettier').Config} */
module.exports = {
  plugins: [
    require.resolve("prettier-plugin-astro"),
    require.resolve("prettier-plugin-svelte"),
    require.resolve("prettier-plugin-tailwindcss"),
  ],
  overrides: [
    {
      files: [".*", "*.json", "*.md", "*.toml", "*.yml"],
      options: {
        useTabs: false,
      },
    },
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
  printWidth: 120,
  semi: false,
  trailingComma: "all",
  useTabs: false,
}
