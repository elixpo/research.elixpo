import { getResearch, RECORDS } from "@/lib/research";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return RECORDS.filter((record) => record.citation && record.paperUrl && record.releasedAt && record.authors.length).map((record) => ({ slug: record.slug })); }
const bib = (value: string) => value.replaceAll("\\", "\\textbackslash{}").replaceAll("{", "\\{").replaceAll("}", "\\}").replaceAll("&", "\\&").replaceAll("%", "\\%").replaceAll("#", "\\#").replaceAll("_", "\\_");
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const record = getResearch((await params).slug);
  if (!record?.citation || !record.paperUrl || !record.releasedAt || !record.authors.length) return new Response("Citation not found.\n", { status: 404 });
  const key = `${record.authors[0].name.split(/\s+/).at(-1)?.toLowerCase() ?? "elixpo"}${record.releasedAt.slice(0, 4)}${record.slug.replaceAll("-", "")}`;
  const body = `@misc{${key},\n  title = {${bib(record.title)}},\n  author = {${bib(record.authors.map((author) => author.name).join(" and "))}},\n  year = {${record.releasedAt.slice(0, 4)}},\n  url = {${bib(record.paperUrl)}},\n  note = {Elixpo Research; ${bib(record.reviewStatus.replaceAll("-", " "))}},\n}\n`;
  return new Response(body, { headers: { "Content-Type": "application/x-bibtex; charset=utf-8", "Content-Disposition": `inline; filename="${record.slug}.bib"` } });
}
