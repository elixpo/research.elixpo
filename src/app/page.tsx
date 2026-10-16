import Link from "next/link";
import { LAST_VERIFIED, RECORDS } from "@/lib/research";
import { jsonLd } from "@/lib/seo";

const leadingSlugs = ["octabit", "oreolook", "monodiffuse"];
const ordered = [...RECORDS].sort((a, b) => {
  const ai = leadingSlugs.indexOf(a.slug); const bi = leadingSlugs.indexOf(b.slug);
  return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.title.localeCompare(b.title);
});
const leading = leadingSlugs.map((slug) => RECORDS.find((record) => record.slug === slug)).filter((record): record is NonNullable<typeof record> => Boolean(record));

export default function Home() {
  const graph = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Elixpo Research",
    url: "https://research.elixpo.com",
    mainEntity: { "@type": "ItemList", itemListElement: ordered.map((record, index) => ({ "@type": "ListItem", position: index + 1, name: record.title, url: `https://research.elixpo.com/${record.slug}` })) },
  };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(graph) }} />
    <section className="hero"><div className="hero-copy"><p className="eyebrow">Research / source / evidence</p><h1>Open research,<br/><em>made inspectable.</em></h1><p>Elixpo Research connects each claim to its paper, implementation, released artifacts, demonstrations, and reproducibility record. Every page states what has—and has not—been reviewed.</p><div className="actions"><a href="#leading">Explore leading work</a><a href="#standard">Publication standard</a></div></div><div className="hero-art" aria-hidden="true"><i/><i/><i/><span>CODE</span><span>DATA</span><span>PAPER</span></div><aside><strong>{RECORDS.length}</strong><span>documented records</span><small>Verified {LAST_VERIFIED}</small></aside></section>

    <section className="section" id="leading"><header><p className="eyebrow">Leading research</p><h2>Current work with the strongest public record.</h2><p>These projects combine a defined question with public implementation evidence, publication material, or runnable artifacts.</p></header><div className="leading-grid">{leading.map((record, index) => <Link href={`/${record.slug}`} key={record.slug} className={`feature feature-${index + 1}`}><span>0{index + 1}</span><div className="feature-shape"/><small>{record.researchStatus.replaceAll("-", " ")} · {record.reviewStatus.replaceAll("-", " ")}</small><h3>{record.title}</h3><p>{record.abstract}</p><b>Open publication record →</b></Link>)}</div></section>

    <section className="section standard" id="standard"><header><p className="eyebrow">Publication standard</p><h2>The record travels with the work.</h2></header><div>{[["01","Source","The implementation and important revisions remain in the owning repository."],["02","Evidence","Papers, datasets, models, hardware, and evaluations are linked when released."],["03","Reproduction","Every record states what can be reproduced and which material is still missing."],["04","Review","Editorial, external, and peer-review status remain separate and explicit."]].map(([n,t,p]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{p}</p></article>)}</div></section>

    <section className="section" id="index"><header><p className="eyebrow">Complete index</p><h2>Every record, including paused and archived work.</h2><p>Lifecycle communicates current activity. It is not a ranking of importance or quality.</p></header><div className="index-list">{ordered.map((record, index) => <Link href={`/${record.slug}`} key={record.slug}><span>{String(index + 1).padStart(2,"0")}</span><div><small>{record.researchStatus.replaceAll("-", " ")} · {record.reviewStatus.replaceAll("-", " ")}</small><h3>{record.title}</h3><p>{record.abstract}</p></div><b>→</b></Link>)}</div></section>
  </main>;
}
