import type { Metadata } from "next";
import Link from "next/link";
import { LAST_VERIFIED, LIVE_DEMOS, RECORDS } from "@/lib/research";
import Image from "next/image";
import { RESEARCH_PEOPLE } from "@/lib/people";
import { jsonLd, pageMetadata } from "@/lib/seo";

const researchMetadata = pageMetadata("Open research, papers, experiments, and reproducibility", "Explore Elixpo research with papers, source code, lifecycle status, public demonstrations, released artifacts, citations, and reproducibility records.", "/");
export const metadata: Metadata = {
  ...researchMetadata,
  openGraph: { ...researchMetadata.openGraph, type: "website" },
  alternates: { canonical: "/", types: { "application/atom+xml": "/feed.xml" } },
};

const leadingSlugs = ["octabit", "oreolook", "monodiffuse"];
const ordered = [...RECORDS].sort((a, b) => {
  const ai = leadingSlugs.indexOf(a.slug); const bi = leadingSlugs.indexOf(b.slug);
  return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.title.localeCompare(b.title);
});
const leading = leadingSlugs.map((slug) => RECORDS.find((record) => record.slug === slug)).filter((record): record is NonNullable<typeof record> => Boolean(record));

export default function Home() {
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": "https://elixpo.com/#organization", name: "Elixpo", url: "https://elixpo.com", logo: "https://elixpo.com/logos/logo.webp", sameAs: ["https://github.com/elixpo", "https://huggingface.co/Elixpo"] },
    { "@type": "CollectionPage", "@id": "https://research.elixpo.com/#collection", name: "Elixpo Research", description: metadata.description, url: "https://research.elixpo.com", publisher: { "@id": "https://elixpo.com/#organization" }, mainEntity: { "@type": "ItemList", itemListElement: ordered.map((record, index) => ({ "@type": "ListItem", position: index + 1, name: record.title, url: `https://research.elixpo.com/${record.slug}` })) } },
    { "@type": "WebSite", "@id": "https://research.elixpo.com/#website", name: "Elixpo Research", url: "https://research.elixpo.com", publisher: { "@id": "https://elixpo.com/#organization" }, inLanguage: "en" },
    ...RESEARCH_PEOPLE.map((person) => ({ "@type": "Person", name: person.name, ...(person.portfolio ? { url: person.portfolio } : {}), sameAs: person.github, affiliation: { "@id": "https://elixpo.com/#organization" }, subjectOf: person.research.map((record) => ({ "@type": "CreativeWork", name: record.title, url: `https://research.elixpo.com/${record.slug}` })) })),
  ] };
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(graph) }} />
    <header className="research-hero"><div className="research-hero-copy"><p className="eyebrow">Elixpo Research</p><h1>We publish research with its code, evidence, and <em>current status.</em></h1><p>This publication surface connects each investigation to its implementation, paper, released artifacts, public demonstrations, citation record, and reproducibility notes. It also states clearly what has—and has not—been reviewed.</p><div className="actions"><a href="#leading">Explore leading work</a><a href="#standard">Read the publication standard</a></div></div><div className="research-hero-objects" aria-hidden="true"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><div className="object object-code"><i/><i/><i/><b>001101</b></div><div className="object object-model"><span>MODEL</span><b>W1A32</b></div><div className="object object-paper"><span>PAPER</span><b>SOURCE + EVIDENCE</b></div></div><div className="research-hero-note"><strong>{RECORDS.length}</strong><span>documented research records</span><small>Verified {LAST_VERIFIED}</small></div></header>

    <section className="section leading" id="leading"><header><div><p className="eyebrow">Leading research</p><h2>Current work with the strongest public record.</h2></div><p>These projects combine a defined question with public implementation evidence, publication material, or runnable artifacts.</p></header><div className="leading-grid">{leading.map((record, index) => <Link href={`/${record.slug}`} key={record.slug} className={`feature feature-${index + 1}`}><div className="feature-art"><span>0{index + 1}</span><i/><i/><b>{record.slug.slice(0, 2).toUpperCase()}</b></div><div className="feature-copy"><small>{record.researchStatus.replaceAll("-", " ")} · {record.reviewStatus.replaceAll("-", " ")}</small><h3>{record.title}</h3><p>{record.abstract}</p><b>Open publication record →</b></div></Link>)}</div></section>

    <section className="section researchers" id="researchers"><header><div><p className="eyebrow">Research team</p><h2>The people connecting research to implementation.</h2></div><p>These people have a verified Elixpo research role, authorship record, or attributable repository work. The section is not a ranking of researchers.</p></header><div className="researcher-grid">{RESEARCH_PEOPLE.map((person, index) => <article key={person.handle}><div className={`researcher-mark researcher-mark-${index + 1}`} aria-hidden="true"><i/><i/><Image src={`https://github.com/${person.handle}.png`} width={128} height={128} alt="" unoptimized /></div><div className="researcher-copy"><p className="eyebrow">{person.role}</p><h3>{person.name}</h3><p>{person.summary}</p><div className="researcher-work"><span>Related research</span>{person.research.map((record) => <Link href={`/${record.slug}`} key={record.slug}>{record.title} →</Link>)}</div><div className="researcher-links">{person.portfolio && <a href={person.portfolio}>Portfolio ↗</a>}<a href={person.github}>GitHub ↗</a></div></div></article>)}</div></section>

    {LIVE_DEMOS.length > 0 && <section className="section experiments" id="experiments"><header><div><p className="eyebrow">Live experiments</p><h2>Run the public demonstrations.</h2></div><p>Interactive artifacts let readers inspect current behaviour directly. Each demonstration remains linked to its research record and owning platform.</p></header><div className="experiment-grid">{LIVE_DEMOS.map((demo, index) => <article key={demo.url}><div className={`experiment-art experiment-art-${index + 1}`} aria-hidden="true"><span>0{index + 1}</span><i/><i/><i/></div><div><p className="eyebrow">Interactive research artifact</p><h3>{demo.name}</h3><p>Public demonstration related to {demo.researchTitle}.</p><div className="experiment-actions"><a href={demo.url}>Launch demonstration ↗</a><Link href={`/${demo.relatedSlug}`}>Research record →</Link></div></div></article>)}</div></section>}

    <section className="section index" id="index"><header><div><p className="eyebrow">Complete index</p><h2>Every record and its current lifecycle.</h2></div><p>Active investigations, completed studies, paused work, and historical experiments remain visible. Status describes current activity, not importance.</p></header><div className="index-list">{ordered.map((record, index) => <Link href={`/${record.slug}`} key={record.slug}><span>{String(index + 1).padStart(2,"0")}</span><div><small>{record.researchStatus.replaceAll("-", " ")} · {record.reviewStatus.replaceAll("-", " ")}</small><h3>{record.title}</h3><p>{record.abstract}</p></div><b>→</b></Link>)}</div><a className="feed-link" href="/feed.xml">Subscribe to the research Atom feed ↗</a></section>

    <section className="section standard" id="standard"><header><div><p className="eyebrow">Publication standard</p><h2>The record travels with the work.</h2></div><p>Elixpo Research is a publication and discovery surface. Owning repositories remain authoritative for their source, evidence, releases, and artifact licenses.</p></header><div>{[["01","Source","The implementation and important revisions remain in the owning repository."],["02","Evidence","Papers, datasets, models, hardware, and evaluations are linked when released."],["03","Reproduction","Every record states what can be reproduced and which material is still missing."],["04","Review","Editorial, external, and peer-review status remain separate and explicit."]].map(([n,t,p]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{p}</p></article>)}</div></section>
  </main>;
}
