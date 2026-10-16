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
  const base = pageMetadata(record.title, record.abstract, path);
  return {
    ...base,
    authors: record.authors.map((author) => ({ name: author.name })),
    keywords: ["Elixpo Research", record.title, record.slug, "open research", "reproducibility", "source code"],
    other: scholarMetadata(record, `https://research.elixpo.com${path}`),
  };
}

export default async function ResearchRecord({ params }: Props) {
  const record = getResearch((await params).slug); if (!record) notFound();
  const doi = "doi" in record ? record.doi : null;
  const journalTitle = "journalTitle" in record ? record.journalTitle : null;
  const pdfUrl = "pdfUrl" in record ? record.pdfUrl : null;
  const type = record.researchStatus === "technical-report" ? "TechArticle" : record.paperUrl ? "ScholarlyArticle" : "ResearchProject";
  const canonical = `https://research.elixpo.com/${record.slug}`;
  const structured = { "@context": "https://schema.org", "@graph": [
    { "@type": type, "@id": `${canonical}#research`, name: record.title, headline: record.title, description: record.abstract, url: canonical, codeRepository: record.codeUrl, publisher: { "@id": "https://elixpo.com/#organization" }, ...(record.paperUrl ? { sameAs: record.paperUrl } : {}), ...(record.releasedAt ? { datePublished: record.releasedAt } : {}), ...(doi ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: doi } } : {}), author: record.authors.map((author) => ({ "@type": "Person", name: author.name, ...(author.affiliation ? { affiliation: { "@type": "Organization", name: author.affiliation } } : {}) })) },
    { "@type": "Organization", "@id": "https://elixpo.com/#organization", name: "Elixpo", url: "https://elixpo.com", logo: "https://elixpo.com/logos/logo.webp" },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Elixpo", item: "https://elixpo.com" }, { "@type": "ListItem", position: 2, name: "Elixpo Research", item: "https://research.elixpo.com" }, { "@type": "ListItem", position: 3, name: record.title, item: canonical }] },
  ] };
  return <main className="record-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} /><Link className="back" href="/">← Research index</Link><header className="record-hero"><div><p className="eyebrow">{record.researchStatus.replaceAll("-", " ")} / {record.reviewStatus.replaceAll("-", " ")}</p><h1>{record.title}</h1><p>{record.abstract}</p><div className="actions"><a href={record.codeUrl}>Source code ↗</a>{record.paperUrl && <a href={record.paperUrl}>Read paper ↗</a>}{record.citation && <a href={`/${record.slug}/citation.bib`}>BibTeX ↓</a>}</div></div><aside><dl><div><dt>Released</dt><dd>{record.releasedAt ?? "Not released"}</dd></div><div><dt>Review</dt><dd>{record.reviewStatus.replaceAll("-", " ")}</dd></div><div><dt>Reproduction</dt><dd>{record.reproducibility.status.replaceAll("-", " ")}</dd></div><div><dt>Metadata</dt><dd>{record.metadataCompleteness.replaceAll("-", " ")}</dd></div>{doi && <div><dt>DOI</dt><dd>{doi}</dd></div>}</dl></aside></header>
    <section className="record-grid"><article><p className="eyebrow">Reproducibility</p><h2>What the public record supports.</h2><p>{record.reproducibility.summary}</p><h3>Authors and affiliations</h3><ul>{record.authors.length ? record.authors.map((author) => <li key={author.name}><b>{author.name}</b>{author.affiliation && <span>{author.affiliation}</span>}</li>) : <li>No verified author list is published.</li>}</ul><h3>Artifact licenses</h3><ul>{record.licenses.length ? record.licenses.map((license) => <li key={`${license.artifact}-${license.url}`}><b>{license.artifact}</b><a href={license.url}>{license.license} ↗</a></li>) : <li>No artifact license has been verified.</li>}</ul></article><aside><p className="eyebrow">Released material</p><a href={record.codeUrl}><b>Source repository</b><span>Implementation and repository history</span></a>{record.paperUrl && <a href={record.paperUrl}><b>Research paper</b><span>{journalTitle ?? "Published paper or technical report"}</span></a>}{pdfUrl && pdfUrl !== record.paperUrl && <a href={pdfUrl}><b>PDF</b><span>Full-text publication</span></a>}{record.artifacts.map((artifact) => <a href={artifact.url} key={artifact.url}><b>{artifact.label}</b><span>{artifact.kind} · {artifact.license ?? "license not recorded"}</span></a>)}{record.liveDemos.map((demo) => <a href={demo.url} key={demo.url}><b>{demo.name}</b><span>Interactive demonstration</span></a>)}</aside></section>
    <section className="citation"><div><p className="eyebrow">Citation record</p><h2>{record.citation ? "Cite the released work." : "No formal citation is published."}</h2></div><p>{record.citation?.text ?? "Use the owning repository as the current technical reference."}{record.citation && <><br/><br/><a href={`/${record.slug}/citation.bib`}>Download BibTeX →</a></>}</p></section></main>;
}
