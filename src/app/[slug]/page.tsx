import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getResearch, RECORDS, scholarMetadata } from "@/lib/research";
import { jsonLd, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return RECORDS.map((record) => ({ slug: record.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = getResearch((await params).slug); if (!record) return {};
  const path = `/${record.slug}`;
  return { ...pageMetadata(record.title, record.abstract, path), other: scholarMetadata(record, `https://research.elixpo.com${path}`) };
}

export default async function ResearchRecord({ params }: Props) {
  const record = getResearch((await params).slug); if (!record) notFound();
  const type = record.researchStatus === "technical-report" ? "TechArticle" : record.paperUrl ? "ScholarlyArticle" : "ResearchProject";
  const structured = { "@context": "https://schema.org", "@type": type, name: record.title, description: record.abstract, url: `https://research.elixpo.com/${record.slug}`, codeRepository: record.codeUrl, ...(record.paperUrl ? { sameAs: record.paperUrl } : {}), ...(record.releasedAt ? { datePublished: record.releasedAt } : {}), author: record.authors.map((author) => ({ "@type": "Person", name: author.name, ...(author.affiliation ? { affiliation: { "@type": "Organization", name: author.affiliation } } : {}) })) };
  return <main className="record-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} /><Link className="back" href="/">← Research index</Link><header className="record-hero"><div><p className="eyebrow">{record.researchStatus.replaceAll("-", " ")} / {record.reviewStatus.replaceAll("-", " ")}</p><h1>{record.title}</h1><p>{record.abstract}</p><div className="actions"><a href={record.codeUrl}>Source code ↗</a>{record.paperUrl && <a href={record.paperUrl}>Read paper ↗</a>}{record.citation && <a href={`/${record.slug}/citation.bib`}>BibTeX ↓</a>}</div></div><aside><dl><div><dt>Released</dt><dd>{record.releasedAt ?? "Not released"}</dd></div><div><dt>Review</dt><dd>{record.reviewStatus.replaceAll("-", " ")}</dd></div><div><dt>Reproduction</dt><dd>{record.reproducibility.status.replaceAll("-", " ")}</dd></div></dl></aside></header>
    <section className="record-grid"><article><p className="eyebrow">Reproducibility</p><h2>What the public record supports.</h2><p>{record.reproducibility.summary}</p><h3>Authors</h3><ul>{record.authors.length ? record.authors.map((author) => <li key={author.name}><b>{author.name}</b>{author.affiliation && <span>{author.affiliation}</span>}</li>) : <li>No verified author list is published.</li>}</ul></article><aside><p className="eyebrow">Released artifacts</p>{record.artifacts.length ? record.artifacts.map((artifact) => <a href={artifact.url} key={artifact.url}><b>{artifact.label}</b><span>{artifact.kind} · {artifact.license ?? "license not recorded"}</span></a>) : <p>No separate artifact is recorded.</p>}{record.liveDemos.map((demo) => <a href={demo.url} key={demo.url}><b>{demo.name}</b><span>Interactive demonstration</span></a>)}</aside></section>
    <section className="citation"><div><p className="eyebrow">Citation record</p><h2>{record.citation ? "Cite the released work." : "No formal citation is published."}</h2></div><p>{record.citation?.text ?? "Use the owning repository as the current technical reference."}</p></section></main>;
}
