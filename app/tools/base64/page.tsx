"use client";

/**
 * app/tools/base64/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Base64 Encode & Decode Tool for desktools.run
 * 100% Client-Side with full i18n support
 */

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import { Binary, ArrowLeft, Copy, Check } from "lucide-react";

export default function Base64Page() {
  const { t } = useLocale();

  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputStr, setInputStr] = useState("Hello world! desktools.run");
  const [copied, setCopied] = useState(false);

  const getResult = () => {
    try {
      if (mode === "encode") {
        return btoa(unescape(encodeURIComponent(inputStr)));
      } else {
        return decodeURIComponent(escape(atob(inputStr.trim())));
      }
    } catch (err) {
      return t("base64.invalidFormat");
    }
  };

  const outputStr = getResult();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* ── Breadcrumb & Title ──────────────────────── */}
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "16px" }}>
            <ArrowLeft size={14} /> {t("base64.back")}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Binary size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("base64.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("base64.subtitle")}</p>
        </section>

        {/* ── Workspace ───────────────────────────────── */}
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Mode Switcher */}
          <div className="glass-card" style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setMode("encode")}
                style={{ padding: "8px 18px", borderRadius: "8px", background: mode === "encode" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)", border: "none", color: mode === "encode" ? "white" : "var(--text-secondary)", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}
              >
                {t("base64.modeEncode")}
              </button>
              <button
                onClick={() => setMode("decode")}
                style={{ padding: "8px 18px", borderRadius: "8px", background: mode === "decode" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)", border: "none", color: mode === "decode" ? "white" : "var(--text-secondary)", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}
              >
                {t("base64.modeDecode")}
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              style={{ padding: "8px 16px", borderRadius: "8px", background: copied ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)", border: "none", color: copied ? "#4ade80" : "#818cf8", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t("base64.copied") : t("base64.copyBtn")}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t("base64.inputLabel")}</span>
              <textarea
                rows={10}
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                placeholder={t("base64.placeholder")}
                style={{ width: "100%", height: "260px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "14px", fontSize: "13.5px", fontFamily: "monospace" }}
              />
            </div>

            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8" }}>{t("base64.outputLabel")}</span>
              <textarea
                readOnly
                rows={10}
                value={outputStr}
                style={{ width: "100%", height: "260px", borderRadius: "8px", background: "rgba(0,0,0,0.25)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "14px", fontSize: "13.5px", fontFamily: "monospace", wordBreak: "break-all" }}
              />
            </div>
          </div>
        </section>

        {/* ── Tool Guide ──────────────────────────────── */}
        <ToolGuide
          badgeText={t("base64.badge")}
          aboutTitle={t("base64.guide.aboutTitle")}
          aboutDesc={t("base64.guide.aboutDesc")}
          howTitle={t("base64.guide.howTitle")}
          steps={[
            t("base64.guide.step1"),
            t("base64.guide.step2"),
            t("base64.guide.step3"),
          ]}
          faqs={[
            { q: t("base64.guide.faq1Q"), a: t("base64.guide.faq1A") },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
