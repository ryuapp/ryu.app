import { z, defineCollection } from "astro:content"
const devCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    breadcrumbs: z.array(
      z.object({
        name: z.string(),
        href: z.string(),
      }),
    ),
  }),
})

export const collections = {
  dev: devCollection,
}
