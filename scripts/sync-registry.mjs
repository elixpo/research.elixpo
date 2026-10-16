import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const check = process.argv.includes("--check");
const root = process.cwd();
const repository = "elixpo/elixpo";
const branch = "main";
const apiHeaders = { Accept: "application/vnd.github+json", "User-Agent": "Elixpo-Research-Registry-Sync/1.0" };

async function fetchJson(url, headers = apiHeaders) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Unable to fetch ${url}: HTTP ${response.status}`);
  return response.json();
}

const commit = await fetchJson(`https://api.github.com/repos/${repository}/commits/${branch}`);
const sourceUrl = `https://raw.githubusercontent.com/${repository}/${commit.sha}/content/research.json`;
const research = await fetchJson(sourceUrl, { "User-Agent": apiHeaders["User-Agent"] });

if (research?.$schema !== "./schemas/research.schema.json" || !research.entries || typeof research.entries !== "object") {
  throw new Error("Canonical research registry does not satisfy the expected publication contract.");
}

const provenance = {
  sourceRepository: `https://github.com/${repository}`,
  sourcePath: "content/research.json",
  sourceCommit: commit.sha,
  sourceCommittedAt: commit.commit.committer.date,
};
const outputs = new Map([
  ["content/research.json", `${JSON.stringify(research, null, 2)}\n`],
  ["content/registry-source.json", `${JSON.stringify(provenance, null, 2)}\n`],
]);

for (const [path, expected] of outputs) {
  const absolute = resolve(root, path);
  if (check) {
    const current = await readFile(absolute, "utf8").catch(() => "");
    if (current !== expected) {
      console.error(`${path} is stale; run npm run registry:sync and review the canonical changes.`);
      process.exitCode = 1;
    }
  } else {
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, expected);
    console.log(`Synchronized ${path} from ${commit.sha.slice(0, 12)}.`);
  }
}
