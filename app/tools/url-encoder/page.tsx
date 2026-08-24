"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import { Link as LinkIcon, ArrowLeft, Copy, Check } from "lucide-react";

export default function UrlEncoderPage() {
  const { t } = useLocale();

  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputStr, setInputStr] = useState("https://desktools.run/search?query=한글 유틸리티&category=PDF 도구");
  const [copied, setCopied] = useState(false);

  const getResult = () => {
    try {
      if (mode === "encode") {
        return encodeURIComponent(inputStr);
      } else {
        return decodeURIComponent(inputStr.trim());
      }
    } catch (err) {
      return t("urlEncoder.invalidFormat");
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
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "16px" }}>
            <ArrowLeft size={14} /> {t("urlEncoder.back")}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LinkIcon size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("urlEncoder.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("urlEncoder.subtitle")}</p>
        </section>

        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="glass-card" style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setMode("encode")}
                style={{ padding: "8px 18px", borderRadius: "8px", background: mode === "encode" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)", border: "none", color: mode === "encode" ? "white" : "var(--text-secondary)", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}
              >
                {t("urlEncoder.encodeMode")}
              </button>
              <button
                onClick={() => setMode("decode")}
                style={{ padding: "8px 18px", borderRadius: "8px", background: mode === "decode" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)", border: "none", color: mode === "decode" ? "white" : "var(--text-secondary)", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}
              >
                {t("urlEncoder.decodeMode")}
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              style={{ padding: "8px 16px", borderRadius: "8px", background: copied ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)", border: "none", color: copied ? "#4ade80" : "#818cf8", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t("urlEncoder.copied") : t("urlEncoder.copyResult")}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t("urlEncoder.inputLabel")}</span>
              <textarea
                rows={10}
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                style={{ width: "100%", height: "260px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "14px", fontSize: "13.5px", fontFamily: "monospace" }}
              />
            </div>

            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8" }}>{t("urlEncoder.outputLabel")}</span>
              <textarea
                readOnly
                rows={10}
                value={outputStr}
                style={{ width: "100%", height: "260px", borderRadius: "8px", background: "rgba(0,0,0,0.25)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "14px", fontSize: "13.5px", fontFamily: "monospace", wordBreak: "break-all" }}
              />
            </div>
          </div>
        </section>

        <ToolGuide
          badgeText={t("urlEncoder.guideBadge")}
          aboutTitle={t("urlEncoder.guide.aboutTitle")}
          aboutDesc={t("urlEncoder.guide.aboutDesc")}
          howTitle={t("urlEncoder.guide.howTitle")}
          steps={[
            t("urlEncoder.guide.step1"),
            t("urlEncoder.guide.step2"),
            t("urlEncoder.guide.step3"),
          ]}
          faqs={[
            { q: t("urlEncoder.guide.faq1Q"), a: t("urlEncoder.guide.faq1A") }
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
