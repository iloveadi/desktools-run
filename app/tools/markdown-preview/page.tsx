"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import { Code2, ArrowLeft, Copy, Check, Download } from "lucide-react";

export default function MarkdownPreviewPage() {
  const { t } = useLocale();
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Live Preview 👋

Write your **Markdown** on the left, and see the *instant rendered preview* on the right.

## Features
- **Bold**, *Italic*, ~~Strikethrough~~
- Code blocks \`const speed = "fast";\`
- Unordered & ordered lists
- Quotes & links [desktools.run](https://desktools.run)

> All Markdown parsing is done 100% locally in your browser memory!
`);
  const [copied, setCopied] = useState(false);

  // Simple clean markdown-to-html parser
  const renderHtml = (md: string) => {
    let html = md
      .replace(/^### (.*$)/gim, '<h3 style="font-size:18px;font-weight:700;margin:12px 0 6px;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size:22px;font-weight:800;margin:16px 0 8px;color:#818cf8;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size:26px;font-weight:800;margin:20px 0 10px;color:var(--text-primary);">$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote style="border-left:4px solid #818cf8;padding-left:12px;color:var(--text-secondary);margin:12px 0;font-style:italic;">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:#818cf8;text-decoration:underline;">$1</a>')
      .replace(/^\- (.*$)/gim, '<li style="margin-left:20px;list-style-type:disc;">$1</li>')
      .replace(/\n\n/g, '<br/><br/>');

    return html;
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(renderHtml(markdown));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <Code2 size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("markdownPreview.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("markdownPreview.subtitle")}</p>
        </section>

        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Editor */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Markdown Input</span>
                <button onClick={handleDownloadMd} style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Download size={13} /> Save .md
                </button>
              </div>
              <textarea
                rows={18}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                style={{ width: "100%", height: "480px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "14px", fontSize: "14px", fontFamily: "monospace", lineHeight: "1.6", resize: "none" }}
              />
            </div>

            {/* Preview */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8" }}>Rendered HTML Preview</span>
                <button onClick={handleCopyHtml} style={{ padding: "4px 10px", borderRadius: "6px", background: copied ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)", border: "none", color: copied ? "#4ade80" : "#818cf8", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "HTML Copied" : "Copy HTML"}
                </button>
              </div>
              <div
                style={{ width: "100%", height: "480px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "20px", overflowY: "auto", lineHeight: "1.7" }}
                dangerouslySetInnerHTML={{ __html: renderHtml(markdown) }}
              />
            </div>
          </div>
        </section>

        <ToolGuide
          badgeText="100% Client-Side & Live"
          aboutTitle="What is Markdown Live Preview?"
          aboutDesc="Write and preview Markdown documents in real-time with zero server uploads."
          howTitle="How to Use Markdown Preview"
          steps={["1. Type Markdown on the left panel.", "2. Watch live HTML render on the right panel.", "3. Export or copy rendered HTML with one click."]}
          faqs={[{ q: "Is Markdown parsed locally?", a: "Yes, all Markdown rendering happens 100% inside your browser." }]}
        />
      </main>
      <Footer />
    </>
  );
}
