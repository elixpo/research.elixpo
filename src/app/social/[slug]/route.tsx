/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getResearch, RECORDS } from "@/lib/research";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return [{ slug: "index" }, ...RECORDS.map(({ slug }) => ({ slug }))]; }

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = slug === "index" ? undefined : getResearch(slug);
  if (slug !== "index" && !record) return new Response("Social card not found.\n", { status: 404 });
  const title = record?.title ?? "Open research with its source, evidence, and current status.";
  const description = record?.abstract ?? "Papers, experiments, released artifacts, public demonstrations, citations, and reproducibility records from Elixpo.";
  const status = record ? `${record.researchStatus.replaceAll("-", " ")} · ${record.reviewStatus.replaceAll("-", " ")}` : `${RECORDS.length} documented records`;
  const titleSize = title.length > 100 ? 48 : title.length > 66 ? 58 : 72;
  const summary = description.length > 190 ? `${description.slice(0, 187).trimEnd()}…` : description;
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", background: "#f7f7f2", color: "#111714", fontFamily: "Arial, sans-serif", padding: "64px 72px" }}><div style={{ position: "absolute", width: 650, height: 650, borderRadius: 999, right: -170, top: -230, background: "#dce7ff" }}/><div style={{ position: "absolute", width: 440, height: 440, borderRadius: 999, right: 35, top: 55, border: "2px solid rgba(17,23,20,.18)" }}/><div style={{ position: "absolute", width: 235, height: 235, borderRadius: 999, right: 135, top: 150, background: "#315fca" }}/><div style={{ position: "relative", width: 850, display: "flex", flexDirection: "column" }}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><img src="https://elixpo.com/logos/logo.png" style={{ width: 38, height: 38 }} alt=""/><span style={{ color: "#315fca", fontSize: 17, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Elixpo Research</span></div><div style={{ display: "flex", marginTop: 48, fontSize: titleSize, fontWeight: 700, lineHeight: .95, letterSpacing: -3.5 }}>{title}</div><div style={{ display: "flex", marginTop: 26, maxWidth: 760, color: "#5e6862", fontSize: 21, lineHeight: 1.4 }}>{summary}</div><div style={{ display: "flex", marginTop: "auto", alignItems: "center", gap: 16 }}><span style={{ display: "flex", padding: "10px 16px", borderRadius: 999, background: "#111714", color: "white", fontSize: 14, textTransform: "uppercase", letterSpacing: 2 }}>{status}</span><span style={{ color: "#5e6862", fontSize: 17 }}>research.elixpo.com</span></div></div></div>, { width: 1200, height: 630 });
}
