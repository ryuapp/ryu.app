import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ params, redirect }) => {
  const [repo, branch] = params?.name!.split("@", 2);
  const slug = params.slug;

  if (!slug) return redirect("/");
  const path = `${repo}/${branch ?? "main"}/${slug}`;
  const url = `https://raw.githubusercontent.com/ryuapp/${path}`;

  return redirect(url);
};
