"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import { GitCompare, ArrowLeft, RotateCcw } from "lucide-react";

export default function TextDiffPage() {
  const { t } = useLocale();

  const [textA, setTextA] = useState(`The quick brown fox jumps over the lazy dog.
Fast web tools running in browser.
Zero server uploads required.`);

  const [textB, setTextB] = useState(`The fast brown fox jumps over the lazy dog.
Fast web tools running in browser memory.
Zero server uploads required.`);

  const linesA = textA.split("\n");
  const linesB = textB.split("\n");
  const maxLines = Math.max(linesA.length, linesB.length);

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "16px" }}>
            <ArrowLeft size={14} /> {t("textDiff.back")}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitCompare size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("textDiff.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("textDiff.subtitle")}</p>
        </section>

        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Input A */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t("textDiff.originalText")}</span>
                <button onClick={() => setTextA("")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer" }}>{t("textDiff.clear")}</button>
              </div>
              <textarea
                rows={8}
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                style={{ width: "100%", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "12px", fontSize: "13.5px", fontFamily: "monospace" }}
              />
            </div>

            {/* Input B */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8" }}>{t("textDiff.modifiedText")}</span>
                <button onClick={() => setTextB("")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer" }}>{t("textDiff.clear")}</button>
              </div>
              <textarea
                rows={8}
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                style={{ width: "100%", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "12px", fontSize: "13.5px", fontFamily: "monospace" }}
              />
            </div>
          </div>

          {/* Diff Result */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{t("textDiff.comparisonDiff")}</h3>

            <div style={{ borderRadius: "8px", background: "rgba(0,0,0,0.25)", border: "1px solid var(--border-subtle)", padding: "16px", fontFamily: "monospace", fontSize: "13.5px", lineHeight: "1.7", overflowX: "auto" }}>
              {Array.from({ length: maxLines }).map((_, idx) => {
                const lineA = linesA[idx] ?? "";
                const lineB = linesB[idx] ?? "";
                const isDifferent = lineA !== lineB;

                return (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr", gap: "12px", padding: "4px 8px", borderRadius: "4px", background: isDifferent ? "rgba(239,68,68,0.12)" : "transparent", borderLeft: isDifferent ? "3px solid #ef4444" : "3px solid transparent", marginBottom: "2px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>L{idx + 1}</span>
                    <span style={{ color: isDifferent ? "#f87171" : "var(--text-secondary)", textDecoration: isDifferent ? "line-through" : "none" }}>{lineA || " "}</span>
                    <span style={{ color: isDifferent ? "#4ade80" : "var(--text-secondary)" }}>{lineB || " "}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <ToolGuide
          badgeText={t("textDiff.badge")}
          aboutTitle={t("textDiff.guide.aboutTitle")}
          aboutDesc={t("textDiff.guide.aboutDesc")}
          howTitle={t("textDiff.guide.howTitle")}
          steps={[
            t("textDiff.guide.step1"),
            t("textDiff.guide.step2"),
            t("textDiff.guide.step3"),
          ]}
          faqs={[
            { q: t("textDiff.guide.faq1Q"), a: t("textDiff.guide.faq1A") }
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
