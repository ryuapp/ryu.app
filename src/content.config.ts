import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

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

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: defaultSchema.extend({
    publishedAt: z.string(),
  }),
});

export const collections = {
  site,
  blog,
};
