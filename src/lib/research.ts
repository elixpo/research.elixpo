import registry from "../../content/research.json";

export type ResearchRecord = (typeof registry.entries)[keyof typeof registry.entries] & { repository: string };
export const LAST_VERIFIED = registry.lastVerified;
export const RECORDS: ResearchRecord[] = Object.entries(registry.entries).map(([repository, record]) => ({ repository, ...record }));
export const getResearch = (slug: string) => RECORDS.find((record) => record.slug === slug);

export function scholarMetadata(record: ResearchRecord, canonical: string) {
  if (!record.paperUrl || !record.releasedAt || record.authors.length === 0) return {};
  const optional = record as ResearchRecord & Record<string, unknown>;
  return {
    citation_title: record.title,
    citation_author: record.authors.map((author) => author.name),
    citation_publication_date: record.releasedAt.replaceAll("-", "/"),
    citation_abstract_html_url: canonical,
    ...(typeof optional.doi === "string" ? { citation_doi: optional.doi } : {}),
    ...(typeof optional.pdfUrl === "string" ? { citation_pdf_url: optional.pdfUrl } : {}),
    ...(typeof optional.journalTitle === "string" ? { citation_journal_title: optional.journalTitle } : {}),
    ...(typeof optional.technicalReportInstitution === "string" ? { citation_technical_report_institution: optional.technicalReportInstitution } : {}),
    ...(typeof optional.technicalReportNumber === "string" ? { citation_technical_report_number: optional.technicalReportNumber } : {}),
  };
}
