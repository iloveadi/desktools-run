"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import { Braces, ArrowLeft, Copy, Check, Minimize2, Maximize2, AlertCircle } from "lucide-react";

export default function JsonFormatterPage() {
  const { t } = useLocale();

  const [inputJson, setInputJson] = useState(`{"name":"desktools.run","version":1.0,"features":["PDF","Image","JSON"],"active":true}`);
  const [outputJson, setOutputJson] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatJson = (indent: number) => {
    try {
      setErrorMsg(null);
      const parsed = JSON.parse(inputJson);
      setOutputJson(JSON.stringify(parsed, null, indent));
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid JSON syntax.");
      setOutputJson("");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputJson || inputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "16px" }}>
            <ArrowLeft size={14} /> Back to All Tools
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Braces size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("jsonFormatter.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("jsonFormatter.subtitle")}</p>
        </section>

        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Action Toolbar */}
          <div className="glass-card" style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => formatJson(2)}
                style={{ padding: "8px 16px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Maximize2 size={14} /> Prettify (2 Spaces)
              </button>
              <button
                onClick={() => formatJson(0)}
                style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Minimize2 size={14} /> Minify (Compact)
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              style={{ padding: "8px 16px", borderRadius: "8px", background: copied ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)", border: "none", color: copied ? "#4ade80" : "#818cf8", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Result"}
            </button>
          </div>

          {errorMsg && (
            <div className="glass-card" style={{ padding: "16px 20px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", fontWeight: 600 }}>
              <AlertCircle size={18} />
              JSON Syntax Error: {errorMsg}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Input JSON</span>
              <textarea
                rows={16}
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                style={{ width: "100%", height: "420px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "14px", fontSize: "13.5px", fontFamily: "monospace", lineHeight: "1.6", resize: "none" }}
              />
            </div>

            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8" }}>Formatted Output</span>
              <textarea
                readOnly
                rows={16}
                value={outputJson || inputJson}
                style={{ width: "100%", height: "420px", borderRadius: "8px", background: "rgba(0,0,0,0.25)", border: "1px solid var(--border-subtle)", color: "#4ade80", padding: "14px", fontSize: "13.5px", fontFamily: "monospace", lineHeight: "1.6", resize: "none" }}
              />
            </div>
          </div>
        </section>

        <ToolGuide
          badgeText="100% Client-Side & Fast"
          aboutTitle="What is JSON Formatter?"
          aboutDesc="Format, validate, prettify, and minify JSON data instantly in your browser."
          howTitle="How to Use JSON Formatter"
          steps={["1. Paste raw JSON into the Input box.", "2. Click 'Prettify' or 'Minify'.", "3. Copy formatted output with one click."]}
          faqs={[{ q: "Is JSON sent to any server?", a: "No, all JSON parsing runs 100% locally inside browser JS memory." }]}
        />
      </main>
      <Footer />
    </>
  );
}
