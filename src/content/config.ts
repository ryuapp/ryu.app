import { defineCollection, z } from "astro:content";

const defaultCollection = defineCollection({
  type: "content",
  schema: z.object({
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
  }),
});

export const collections = {
  site: defaultCollection,
  projects: defaultCollection,
};
