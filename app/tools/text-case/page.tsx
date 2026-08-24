"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import { CaseSensitive, Copy, Check, ArrowLeft, RotateCcw } from "lucide-react";

export default function TextCasePage() {
  const { t } = useLocale();
  const [text, setText] = useState("Hello world! Welcome to desktools.run web utilities.");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const convertCases = (input: string) => {
    const words = input.trim().split(/[\s_\-]+/).filter(Boolean);

    return {
      upper: input.toUpperCase(),
      lower: input.toLowerCase(),
      title: input.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()),
      camel: words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(""),
      pascal: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(""),
      snake: words.map((w) => w.toLowerCase()).join("_"),
      kebab: words.map((w) => w.toLowerCase()).join("-"),
      constant: words.map((w) => w.toUpperCase()).join("_"),
    };
  };

  const results = convertCases(text);

  const copyToClipboard = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "16px" }}>
            <ArrowLeft size={14} /> {t("textCase.back")}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CaseSensitive size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("textCase.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("textCase.subtitle")}</p>
        </section>

        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t("textCase.inputLabel")}</label>
              <button onClick={() => setText("")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "12.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                <RotateCcw size={13} /> {t("textCase.clear")}
              </button>
            </div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("textCase.placeholder")}
              style={{ width: "100%", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "12px", fontSize: "14px", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {[
              { label: "UPPERCASE", value: results.upper, key: "upper" },
              { label: "lowercase", value: results.lower, key: "lower" },
              { label: "Title Case", value: results.title, key: "title" },
              { label: "camelCase", value: results.camel, key: "camel" },
              { label: "PascalCase", value: results.pascal, key: "pascal" },
              { label: "snake_case", value: results.snake, key: "snake" },
              { label: "kebab-case", value: results.kebab, key: "kebab" },
              { label: "CONSTANT_CASE", value: results.constant, key: "constant" },
            ].map((item) => (
              <div key={item.key} className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#818cf8" }}>{item.label}</span>
                  <button
                    onClick={() => copyToClipboard(item.value, item.key)}
                    style={{ padding: "4px 8px", borderRadius: "6px", background: copiedKey === item.key ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)", border: "none", color: copiedKey === item.key ? "#4ade80" : "var(--text-secondary)", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    {copiedKey === item.key ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === item.key ? t("textCase.copied") : t("textCase.copy")}
                  </button>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", wordBreak: "break-all", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "6px", minHeight: "42px" }}>
                  {item.value || <span style={{ color: "var(--text-muted)" }}>{t("textCase.empty")}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <ToolGuide
          badgeText={t("textCase.guideBadge")}
          aboutTitle={t("textCase.guide.aboutTitle")}
          aboutDesc={t("textCase.guide.aboutDesc")}
          howTitle={t("textCase.guide.howTitle")}
          steps={[
            t("textCase.guide.step1"),
            t("textCase.guide.step2"),
            t("textCase.guide.step3"),
          ]}
          faqs={[
            { q: t("textCase.guide.faq1Q"), a: t("textCase.guide.faq1A") }
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
