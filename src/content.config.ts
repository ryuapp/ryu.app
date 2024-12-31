import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const defaultSchema = z.object({
  title: z.string(),
  description: z.string(),
  breadcrumbs: z
    .array(
      z.object({
        name: z.string(),
        href: z.string(),
      }),
    )
    .optional(),
});

const site = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/site" }),
  schema: defaultSchema,
});

const projects = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "**/*.mdx"],
    base: "./src/content/projects",
  }),
  schema: defaultSchema,
});

export const collections = {
  site,
  projects,
};
