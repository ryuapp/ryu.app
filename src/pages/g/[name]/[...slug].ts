import type { APIRoute } from "astro"

export const prerender = false

export const GET: APIRoute = ({ params, redirect }) => {
  const name = params.name as string
  const repo = name.split("@")[0]
  const branch = name.split("@")[1] ?? "main"
  const slug = (params.slug as string) ?? null

  if (!slug) return redirect("/")

  return redirect(`https://raw.githubusercontent.com/ryuapp/${repo}/${branch}/${slug}`, 301)
}
