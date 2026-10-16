"""Validate the exported research site's crawl and scholarly metadata contract."""

from __future__ import annotations

import argparse
import json
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

SITE_URL = "https://research.elixpo.com"
SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


class HeadParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.meta: dict[str, list[str]] = {}
        self.links: dict[str, str] = {}
        self.title = ""
        self._in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "meta":
            key = attributes.get("name") or attributes.get("property")
            if key:
                self.meta.setdefault(key, []).append(attributes.get("content") or "")
        elif tag == "link" and attributes.get("rel"):
            self.links[attributes["rel"]] = attributes.get("href") or ""
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data


def first(meta: dict[str, list[str]], name: str) -> str:
    return meta.get(name, [""])[0]


def check_site(site: Path) -> None:
    registry = json.loads(Path("content/research.json").read_text(encoding="utf-8"))
    records = list(registry["entries"].values())

    robots = (site / "robots.txt").read_text(encoding="utf-8").casefold()
    assert "user-agent: *" in robots, "robots.txt has no wildcard user-agent"
    assert "allow: /" in robots, "robots.txt does not allow the public site"
    assert "disallow: /" not in robots, "robots.txt blocks the public site"
    assert f"sitemap: {SITE_URL}/sitemap.xml" in robots, "robots.txt omits the sitemap"

    sitemap = ET.parse(site / "sitemap.xml")
    urls = {
        node.text
        for node in sitemap.findall(f"{SITEMAP_NS}url/{SITEMAP_NS}loc")
        if node.text
    }
    expected = {SITE_URL, *(f"{SITE_URL}/{record['slug']}" for record in records)}
    assert urls == expected, f"Unexpected sitemap URLs: {sorted(urls)}"

    for record in records:
        path = site / f"{record['slug']}.html"
        head = HeadParser()
        head.feed(path.read_text(encoding="utf-8"))
        canonical = f"{SITE_URL}/{record['slug']}"
        assert head.title.strip(), f"Missing title in {path}"
        assert head.links.get("canonical") == canonical, f"Bad canonical in {path}"
        assert first(head.meta, "description"), f"Missing description in {path}"
        assert first(head.meta, "og:url") == canonical, f"Bad Open Graph URL in {path}"
        assert first(head.meta, "og:image"), f"Missing Open Graph image in {path}"
        assert first(head.meta, "twitter:card") == "summary_large_image", (
            f"Missing large Twitter card in {path}"
        )

        if record.get("paperUrl") and record.get("releasedAt") and record.get("authors"):
            assert first(head.meta, "citation_title") == record["title"], (
                f"Bad citation_title in {path}"
            )
            assert head.meta.get("citation_author") == [
                author["name"] for author in record["authors"]
            ], f"Bad citation_author list in {path}"
            assert first(head.meta, "citation_publication_date") == record[
                "releasedAt"
            ].replace("-", "/"), f"Bad citation date in {path}"
            assert first(head.meta, "citation_abstract_html_url") == canonical, (
                f"Bad citation abstract URL in {path}"
            )
            if record.get("doi"):
                assert first(head.meta, "citation_doi") == record["doi"], (
                    f"Bad citation DOI in {path}"
                )
            if record.get("pdfUrl"):
                assert first(head.meta, "citation_pdf_url") == record["pdfUrl"], (
                    f"Bad citation PDF URL in {path}"
                )

    for name in ("favicon.ico", "feed.xml", "robots.txt", "sitemap.xml", "_headers"):
        assert (site / name).is_file(), f"Missing public file: {name}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path, help="Exported Next.js site directory")
    args = parser.parse_args()
    try:
        check_site(args.site)
    except (AssertionError, OSError, ET.ParseError, KeyError) as error:
        print(f"Research crawl check failed: {error}", file=sys.stderr)
        return 1
    print("Research crawl and scholarly metadata are consistent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
