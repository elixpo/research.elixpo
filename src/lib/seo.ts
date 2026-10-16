import type { Metadata } from "next";

export const SITE_URL = "https://research.elixpo.com";
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
export const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const socialImage = path === "/" ? "/social/index" : `/social${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", siteName: "Elixpo Research", title, description, url: path, images: [{ url: socialImage, width: 1200, height: 630, alt: `${title} — Elixpo Research` }] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}
