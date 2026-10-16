import { getResearch, RECORDS } from "@/lib/research";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return RECORDS.filter(
    (record) => record.citation && record.paperUrl && record.releasedAt && record.authors.length,
  ).map((record) => ({ slug: record.slug }));
}

const bib = (value: string) =>
  value
    .replaceAll("\\", "\\textbackslash{}")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("&", "\\&")
    .replaceAll("%", "\\%")
    .replaceAll("#", "\\#")
    .replaceAll("_", "\\_");

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const record = getResearch((await params).slug);
  if (!record?.citation || !record.paperUrl || !record.releasedAt || !record.authors.length) {
    return new Response("Citation not found.\n", { status: 404 });
  }

  const optional = record as typeof record & Record<string, unknown>;
  const doi = typeof optional.doi === "string" ? optional.doi : undefined;
  const pdfUrl = typeof optional.pdfUrl === "string" ? optional.pdfUrl : undefined;
  const key = `${record.authors[0].name.split(/\s+/).at(-1)?.toLowerCase() ?? "elixpo"}${record.releasedAt.slice(0, 4)}${record.slug.replaceAll("-", "")}`;
  const fields = [
    `  title = {${bib(record.title)}}`,
    `  author = {${bib(record.authors.map((author) => author.name).join(" and "))}}`,
    `  year = {${record.releasedAt.slice(0, 4)}}`,
    `  month = {${Number(record.releasedAt.slice(5, 7))}}`,
    `  url = {${bib(record.paperUrl)}}`,
    ...(doi ? [`  doi = {${bib(doi)}}`] : []),
    ...(pdfUrl ? [`  howpublished = {${bib(pdfUrl)}}`] : []),
    `  note = {Elixpo Research; ${bib(record.reviewStatus.replaceAll("-", " "))}}`,
  ];
  const body = `@misc{${key},\n${fields.join(",\n")}\n}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/x-bibtex; charset=utf-8",
      "Content-Disposition": `inline; filename="${record.slug}.bib"`,
    },
  });
}
