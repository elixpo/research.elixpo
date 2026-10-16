import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { SITE_URL } from "@/lib/seo";

const description = "Elixpo Research publishes open research with its papers, source code, artifacts, reproducibility evidence, and explicit review status.";

export const viewport: Viewport = { themeColor: "#f7f7f2", colorScheme: "light" };
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Elixpo Research", template: "%s | Elixpo Research" },
  description,
  applicationName: "Elixpo Research",
  creator: "Elixpo",
  publisher: "Elixpo",
  category: "research",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "https://elixpo.com/logos/logo.webp", type: "image/webp" }],
    shortcut: ["/favicon.ico"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "en_US", siteName: "Elixpo Research", title: "Elixpo Research", description, url: SITE_URL, images: [{ url: "/social/index", width: 1200, height: 630, alt: "Elixpo Research — open research with source and evidence" }] },
  twitter: { card: "summary_large_image", title: "Elixpo Research", description, images: ["/social/index"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header className="site-header"><Link className="brand" href="/"><Image src="/favicon.ico" width="34" height="34" alt="" priority /><span><b>Elixpo</b><small>Research</small></span></Link><nav aria-label="Primary navigation"><Link href="/#leading">Leading work</Link><Link href="/#researchers">Researchers</Link><Link href="/#experiments">Live experiments</Link><Link href="/#index">Research index</Link><a className="portal-link" href="https://elixpo.com/research">Elixpo.com ↗</a></nav></header>
    {children}
    <footer><div className="footer-brand"><Image src="/favicon.ico" width="42" height="42" alt="" /><div><strong>Elixpo Research</strong><p>Open research presented with the material needed to inspect it.</p></div></div><nav><a href="https://github.com/elixpo">GitHub</a><a href="https://elixpo.com/research">Organization directory</a><a href="/feed.xml">Atom feed</a></nav></footer>
  </body></html>;
}
