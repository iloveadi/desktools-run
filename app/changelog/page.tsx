"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { History, Sparkles, CheckCircle2, Package } from "lucide-react";

export default function ChangelogPage() {
  const { t } = useLocale();

  const releases = [
    {
      version: "v1.2.0",
      date: "August 21, 2026",
      title: "PDF Splitter & Background Remover Neural Engine Upgrade",
      changes: [
        "Added PDF Splitter tool for extracting custom page ranges & visual thumbnail selection.",
        "Upgraded Background Remover with Web AI ONNX Neural Network and automatic hole filling engine.",
        "Added multi-language i18n support across all tool pages.",
      ],
    },
    {
      version: "v1.1.0",
      date: "August 15, 2026",
      title: "PDF Merger, Compress & Image Resizer",
      changes: [
        "Released 100% Client-Side PDF Merger & PDF Compression utilities.",
        "Added Image Resizer and Format Converter supporting PNG, JPG, and WEBP.",
        "Implemented high-contrast dark theme and glassmorphic UI system.",
      ],
    },
    {
      version: "v1.0.0",
      date: "August 01, 2026",
      title: "Initial Launch of desktools.run",
      changes: [
        "Launched core platform with Password Generator, Hash Generator, Color Converter, and Text utilities.",
        "100% Zero-Server upload privacy architecture.",
      ],
    },
  ];

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "840px", margin: "0 auto", padding: "40px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8" }}>
              <History size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("pages.changelog.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {t("pages.changelog.subtitle")}
          </p>
        </section>

        <section style={{ maxWidth: "840px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {releases.map((rel) => (
              <div key={rel.version} className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ padding: "4px 12px", borderRadius: "100px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", fontSize: "13px", fontWeight: 800 }}>
                      {rel.version}
                    </span>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {rel.title}
                    </h3>
                  </div>
                  <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{rel.date}</span>
                </div>

                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "4px" }}>
                  {rel.changes.map((item, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13.5px", color: "var(--text-secondary)" }}>
                      <CheckCircle2 size={15} style={{ color: "#818cf8", flexShrink: 0, marginTop: "2px" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
