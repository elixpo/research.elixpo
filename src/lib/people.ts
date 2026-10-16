import people from "../../content/people.json";
import { RECORDS } from "@/lib/research";

const researchByAuthor = new Map<string, { slug: string; title: string }[]>();
for (const record of RECORDS) {
  for (const author of record.authors) {
    const records = researchByAuthor.get(author.name) ?? [];
    records.push({ slug: record.slug, title: record.title });
    researchByAuthor.set(author.name, records);
  }
}

const teamResearchers = people.currentTeam.flatMap((person) => {
  const research = researchByAuthor.get(person.name);
  return research?.length ? [{ ...person, research }] : [];
});

const researchContributors = people.researchContributors.map((person) => ({
  ...person,
  research: person.relatedResearch.flatMap((slug) => {
    const record = RECORDS.find((entry) => entry.slug === slug);
    return record ? [{ slug: record.slug, title: record.title }] : [];
  }),
}));

export const RESEARCH_PEOPLE = [...teamResearchers, ...researchContributors];
