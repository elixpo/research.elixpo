import type { MetadataRoute } from "next";
import { LAST_VERIFIED, RECORDS } from "@/lib/research";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: LAST_VERIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...RECORDS.map((record) => ({
      url: absoluteUrl(`/${record.slug}`),
      lastModified: record.releasedAt ?? LAST_VERIFIED,
      changeFrequency: record.researchStatus === "archived" ? ("yearly" as const) : ("monthly" as const),
      priority: record.paperUrl ? 0.9 : record.researchStatus === "archived" ? 0.5 : 0.75,
    })),
  ];
}
