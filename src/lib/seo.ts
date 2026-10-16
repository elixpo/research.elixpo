import type { Metadata } from "next";

export const SITE_URL = "https://research.elixpo.com";
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
export const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", siteName: "Elixpo Research", title, description, url: path },
    twitter: { card: "summary_large_image", title, description },
  };
}
