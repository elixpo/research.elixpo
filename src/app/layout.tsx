import type { Metadata, Viewport } from "next";
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
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", siteName: "Elixpo Research", title: "Elixpo Research", description, url: SITE_URL },
  twitter: { card: "summary_large_image", title: "Elixpo Research", description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header className="site-header"><Link className="brand" href="/"><span>ER</span><b>Elixpo Research</b></Link><nav aria-label="Primary navigation"><Link href="/#leading">Leading work</Link><Link href="/#index">Research index</Link><a href="https://elixpo.com">Elixpo.com ↗</a></nav></header>
    {children}
    <footer><div><strong>Elixpo Research</strong><p>Open research presented with the material needed to inspect it.</p></div><nav><a href="https://github.com/elixpo">GitHub</a><a href="https://elixpo.com/research">Portal record</a><a href="/feed.xml">Atom feed</a></nav></footer>
  </body></html>;
}
