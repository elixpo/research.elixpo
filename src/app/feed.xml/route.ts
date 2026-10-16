import { RECORDS } from "@/lib/research";

export const dynamic = "force-static";
const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
export function GET() {
  const released = RECORDS.filter((record) => record.releasedAt).sort((a, b) => String(b.releasedAt).localeCompare(String(a.releasedAt)));
  const updated = released[0]?.releasedAt ? new Date(`${released[0].releasedAt}T00:00:00Z`).toISOString() : "2026-10-16T00:00:00.000Z";
  const entries = released.map((record) => `<entry><id>https://research.elixpo.com/${record.slug}</id><title>${escape(record.title)}</title><link href="https://research.elixpo.com/${record.slug}"/><updated>${new Date(`${record.releasedAt}T00:00:00Z`).toISOString()}</updated><summary>${escape(record.abstract)}</summary></entry>`).join("");
  return new Response(`<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><id>https://research.elixpo.com/</id><title>Elixpo Research</title><link href="https://research.elixpo.com/feed.xml" rel="self"/><link href="https://research.elixpo.com/"/><updated>${updated}</updated>${entries}</feed>`, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}
