import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getResearch, LAST_VERIFIED, RECORDS, scholarMetadata } from "@/lib/research";
import { jsonLd, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return RECORDS.map((record) => ({ slug: record.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = getResearch((await params).slug);
  if (!record) return {};

  const path = `/${record.slug}`;
  const canonical = `https://research.elixpo.com${path}`;
  return {
    ...pageMetadata(record.title, record.abstract, path),
    authors: record.authors.map((author) => ({ name: author.name })),
    keywords: [
      "Elixpo Research",
      record.title,
      record.slug,
      record.researchStatus.replaceAll("-", " "),
      "open research",
      "reproducible research",
      "research source code",
    ],
    other: scholarMetadata(record, canonical),
  };
}

function displayDate(value: string | null) {
  if (!value) return "Not released";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function ResearchRecord({ params }: Props) {
  const record = getResearch((await params).slug);
  if (!record) notFound();

  const optional = record as typeof record & Record<string, unknown>;
  const doi = typeof optional.doi === "string" ? optional.doi : null;
  const journalTitle = typeof optional.journalTitle === "string" ? optional.journalTitle : null;
  const pdfUrl = typeof optional.pdfUrl === "string" ? optional.pdfUrl : null;
  const reportInstitution =
    typeof optional.technicalReportInstitution === "string"
      ? optional.technicalReportInstitution
      : null;
  const reportNumber =
    typeof optional.technicalReportNumber === "string"
      ? optional.technicalReportNumber
      : null;
  const canonical = `https://research.elixpo.com/${record.slug}`;
  const type =
    record.researchStatus === "technical-report"
      ? "TechArticle"
      : record.paperUrl
        ? "ScholarlyArticle"
        : "ResearchProject";
  const publicationVenue = journalTitle ?? reportInstitution;
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": type,
        "@id": `${canonical}#research`,
        name: record.title,
        headline: record.title,
        description: record.abstract,
        abstract: record.abstract,
        url: canonical,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        codeRepository: record.codeUrl,
        isAccessibleForFree: true,
        inLanguage: "en",
        publisher: { "@id": "https://elixpo.com/#organization" },
        ...(record.paperUrl ? { sameAs: record.paperUrl } : {}),
        ...(record.releasedAt ? { datePublished: record.releasedAt } : {}),
        dateModified: LAST_VERIFIED,
        ...(doi
          ? {
              identifier: {
                "@type": "PropertyValue",
                propertyID: "DOI",
                value: doi,
                url: `https://doi.org/${doi}`,
              },
            }
          : {}),
        ...(publicationVenue
          ? {
              isPartOf: {
                "@type": journalTitle ? "Periodical" : "CreativeWorkSeries",
                name: publicationVenue,
              },
            }
          : {}),
        ...(pdfUrl
          ? {
              encoding: {
                "@type": "MediaObject",
                contentUrl: pdfUrl,
                encodingFormat: "application/pdf",
              },
            }
          : {}),
        author: record.authors.map((author) => ({
          "@type": "Person",
          name: author.name,
          ...(author.affiliation
            ? {
                affiliation: {
                  "@type": "Organization",
                  name: author.affiliation,
                },
              }
            : {}),
        })),
      },
      {
        "@type": "Organization",
        "@id": "https://elixpo.com/#organization",
        name: "Elixpo",
        url: "https://elixpo.com",
        logo: "https://elixpo.com/logos/logo.webp",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Elixpo", item: "https://elixpo.com" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Elixpo Research",
            item: "https://research.elixpo.com",
          },
          { "@type": "ListItem", position: 3, name: record.title, item: canonical },
        ],
      },
    ],
  };

  return (
    <main className="record-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structured) }}
      />
      <Link className="back" href="/">
        ← Research index
      </Link>

      <section
        className={`record-geometry record-geometry-${record.slug}`}
        aria-hidden="true"
      >
        <div className="record-geometry-label">
          <span>Elixpo / research record</span>
          <b>
            {String(RECORDS.findIndex((item) => item.slug === record.slug) + 1).padStart(2, "0")}
          </b>
        </div>
        <i className="geometry-ring" />
        <i className="geometry-disc" />
        <i className="geometry-pill" />
        <i className="geometry-tile" />
        <i className="geometry-axis" />
        <i className="geometry-node" />
      </section>

      <header className="record-hero">
        <div className="record-heading">
          <p className="eyebrow">
            {record.researchStatus.replaceAll("-", " ")} /{" "}
            {record.reviewStatus.replaceAll("-", " ")}
          </p>
          <h1 className="citation_title">{record.title}</h1>

          {record.authors.length > 0 ? (
            <div className="record-byline" aria-label="Authors">
              <span>By</span>
              <p>
                {record.authors.map((author, index) => (
                  <span className="citation_author" key={author.name}>
                    {author.name}
                    {index < record.authors.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <p className="record-byline-empty">No verified author list is published.</p>
          )}

          <p className="record-publication">
            {record.releasedAt ? (
              <>
                Published <time dateTime={record.releasedAt}>{displayDate(record.releasedAt)}</time>
              </>
            ) : (
              "Publication date not recorded"
            )}
            {reportNumber ? ` · ${reportNumber}` : ""}
            {doi ? (
              <>
                {" · "}
                <a href={`https://doi.org/${doi}`}>doi:{doi}</a>
              </>
            ) : null}
          </p>

          <section className="record-abstract" aria-labelledby="abstract-heading">
            <h2 id="abstract-heading">Abstract</h2>
            <p>{record.abstract}</p>
          </section>

          <div className="actions">
            <a href={record.codeUrl}>Source code ↗</a>
            {record.paperUrl && <a href={record.paperUrl}>Publication record ↗</a>}
            {pdfUrl && <a href={pdfUrl}>Read PDF ↗</a>}
            {record.citation && <a href={`/${record.slug}/citation.bib`}>BibTeX ↓</a>}
          </div>
        </div>

        <aside className="record-summary" aria-label="Research record summary">
          <p className="eyebrow">Publication record</p>
          <dl>
            <div>
              <dt>Published</dt>
              <dd>{displayDate(record.releasedAt)}</dd>
            </div>
            <div>
              <dt>Review</dt>
              <dd>{record.reviewStatus.replaceAll("-", " ")}</dd>
            </div>
            <div>
              <dt>Reproduction</dt>
              <dd>{record.reproducibility.status.replaceAll("-", " ")}</dd>
            </div>
            <div>
              <dt>Metadata</dt>
              <dd>{record.metadataCompleteness.replaceAll("-", " ")}</dd>
            </div>
            {doi && (
              <div>
                <dt>DOI</dt>
                <dd>
                  <a href={`https://doi.org/${doi}`}>{doi}</a>
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </header>

      <section className="record-grid">
        <article>
          <p className="eyebrow">Reproducibility</p>
          <h2>Evidence available for inspection</h2>
          <p>{record.reproducibility.summary}</p>

          <h3>Authors and affiliations</h3>
          <ul>
            {record.authors.length ? (
              record.authors.map((author) => (
                <li key={author.name}>
                  <b>{author.name}</b>
                  {author.affiliation && <span>{author.affiliation}</span>}
                </li>
              ))
            ) : (
              <li>No verified author list is published.</li>
            )}
          </ul>

          <h3>Artifact licenses</h3>
          <ul>
            {record.licenses.length ? (
              record.licenses.map((license) => (
                <li key={`${license.artifact}-${license.url}`}>
                  <b>{license.artifact}</b>
                  <a href={license.url}>{license.license} ↗</a>
                </li>
              ))
            ) : (
              <li>No artifact license has been verified.</li>
            )}
          </ul>
        </article>

        <aside className="released-material">
          <p className="eyebrow">Released material</p>
          <a href={record.codeUrl}>
            <b>Source repository</b>
            <span>Implementation and repository history</span>
          </a>
          {record.paperUrl && (
            <a href={record.paperUrl}>
              <b>Publication record</b>
              <span>{journalTitle ?? reportNumber ?? "Paper or technical report"}</span>
            </a>
          )}
          {pdfUrl && (
            <a href={pdfUrl}>
              <b>Full-text PDF</b>
              <span>Read the released manuscript</span>
            </a>
          )}
          {record.artifacts.map((artifact) => (
            <a href={artifact.url} key={artifact.url}>
              <b>{artifact.label}</b>
              <span>
                {artifact.kind} · {artifact.license ?? "license not recorded"}
              </span>
            </a>
          ))}
          {record.liveDemos.map((demo) => (
            <a href={demo.url} key={demo.url}>
              <b>{demo.name}</b>
              <span>Interactive demonstration</span>
            </a>
          ))}
        </aside>
      </section>

      <section className="citation">
        <div>
          <p className="eyebrow">Citation record</p>
          <h2>{record.citation ? "Citation and persistent identifiers" : "Citation pending"}</h2>
        </div>
        <div className="citation-copy">
          <p>{record.citation?.text ?? "Use the source repository as the current technical reference."}</p>
          {record.citation && <a href={`/${record.slug}/citation.bib`}>Download BibTeX →</a>}
          {doi && <a href={`https://doi.org/${doi}`}>Open DOI record →</a>}
        </div>
      </section>
    </main>
  );
}
