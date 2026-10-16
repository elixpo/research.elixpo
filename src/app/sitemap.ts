import type { MetadataRoute } from "next";
import { RECORDS } from "@/lib/research";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 }, ...RECORDS.map((record) => ({ url: absoluteUrl(`/${record.slug}`), changeFrequency: record.researchStatus === "archived" ? "yearly" as const : "monthly" as const, priority: record.researchStatus === "archived" ? 0.5 : 0.8 }))];
}
