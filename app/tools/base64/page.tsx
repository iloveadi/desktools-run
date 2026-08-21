"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import { Binary, ArrowLeft, Copy, Check, ArrowRightLeft } from "lucide-react";

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
      return "Invalid Base64 format for decoding.";
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
            <ArrowLeft size={14} /> Back to All Tools
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Binary size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("base64.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("base64.subtitle")}</p>
        </section>

        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Mode Switcher */}
          <div className="glass-card" style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setMode("encode")}
                style={{ padding: "8px 18px", borderRadius: "8px", background: mode === "encode" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)", border: "none", color: mode === "encode" ? "white" : "var(--text-secondary)", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}
              >
                Encode (Text ➔ Base64)
              </button>
              <button
                onClick={() => setMode("decode")}
                style={{ padding: "8px 18px", borderRadius: "8px", background: mode === "decode" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)", border: "none", color: mode === "decode" ? "white" : "var(--text-secondary)", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}
              >
                Decode (Base64 ➔ Text)
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              style={{ padding: "8px 16px", borderRadius: "8px", background: copied ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)", border: "none", color: copied ? "#4ade80" : "#818cf8", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Output"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Input {mode === "encode" ? "Text" : "Base64"}</span>
              <textarea
                rows={10}
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                style={{ width: "100%", height: "260px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "14px", fontSize: "13.5px", fontFamily: "monospace" }}
              />
            </div>

            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8" }}>Output {mode === "encode" ? "Base64" : "Text"}</span>
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
          badgeText="100% Client-Side & Private"
          aboutTitle="What is Base64 Encode & Decode?"
          aboutDesc="Convert text to Base64 format and decode Base64 strings back to text instantly in browser."
          howTitle="How to Use Base64 Tool"
          steps={["1. Select Encode or Decode mode.", "2. Type or paste your input.", "3. Copy converted Base64 output instantly."]}
          faqs={[{ q: "Is Base64 conversion secure?", a: "Yes, all conversion operations happen 100% locally in browser JS." }]}
        />
      </main>
      <Footer />
    </>
  );
}
