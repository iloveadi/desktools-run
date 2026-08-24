"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { BlogPost, getLocalizedPost } from "@/lib/blog";
import { ArrowLeft, Calendar, Share2, Check, Sparkles } from "lucide-react";

// Helper to parse inline **bold** text
function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function BlogDetailClient({ post }: { post: BlogPost }) {
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);

  const localized = getLocalizedPost(post, locale);

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <article style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px" }}>
          {/* Breadcrumb Back */}
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13.5px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              marginBottom: "24px",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={15} />
            {locale === "ko"
              ? "블로그 목록으로 돌아가기"
              : locale === "ja"
              ? "ブログ一覧に戻る"
              : locale === "es"
              ? "Volver al blog"
              : locale === "zh"
              ? "返回博客列表"
              : locale === "fr"
              ? "Retour au blog"
              : "Back to Blog Overview"}
          </Link>

          {/* Article Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "100px",
                  background: "rgba(99,102,241,0.15)",
                  color: "#818cf8",
                  fontSize: "12.5px",
                  fontWeight: 700,
                }}
              >
                {post.category}
              </span>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Calendar size={14} />
                {post.date}
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(26px, 4vw, 36px)",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "var(--text-primary)",
                lineHeight: "1.3",
                marginBottom: "16px",
              }}
            >
              {localized.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "100px",
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  fontSize: "12px",
                  color: "#4ade80",
                  fontWeight: 600,
                }}
              >
                <Sparkles size={13} />
                Official desktools.run Article
              </div>

              <button
                onClick={copyLink}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  background: copied ? "rgba(34,211,168,0.2)" : "rgba(255,255,255,0.06)",
                  border: copied ? "1px solid rgba(34,211,168,0.4)" : "1px solid rgba(255,255,255,0.12)",
                  color: copied ? "#34d399" : "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                {copied ? "Link Copied!" : "Share Article"}
              </button>
            </div>
          </div>

          <hr style={{ borderColor: "rgba(255,255,255,0.08)", marginBottom: "40px" }} />

          {/* Article Body */}
          <div
            className="glass-card article-content"
            style={{
              padding: "36px",
              fontSize: "15.5px",
              color: "var(--text-secondary)",
              lineHeight: "1.85",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {localized.content.split("\n\n").map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (trimmed === "---") {
                return (
                  <hr
                    key={index}
                    style={{
                      border: "none",
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      margin: "8px 0",
                    }}
                  />
                );
              }

              if (trimmed.startsWith("# ")) {
                return (
                  <h1
                    key={index}
                    style={{
                      fontSize: "24px",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      marginTop: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    {parseInlineMarkdown(trimmed.replace("# ", ""))}
                  </h1>
                );
              }

              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={index}
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      marginTop: "16px",
                      marginBottom: "4px",
                    }}
                  >
                    {parseInlineMarkdown(trimmed.replace("## ", ""))}
                  </h2>
                );
              }

              if (/^\d+\.\s/.test(trimmed) || trimmed.startsWith("- ")) {
                const lines = trimmed.split("\n");
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      paddingLeft: "4px",
                    }}
                  >
                    {lines.map((line, lIdx) => {
                      const isNum = /^\d+\.\s/.test(line.trim());
                      const cleanLine = line.trim().replace(/^(\d+\.|\-)\s+/, "");
                      return (
                        <div key={lIdx} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ color: "#818cf8", fontWeight: 700, flexShrink: 0 }}>
                            {isNum ? line.trim().split(" ")[0] : "•"}
                          </span>
                          <div style={{ flex: 1 }}>{parseInlineMarkdown(cleanLine)}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              return <p key={index}>{parseInlineMarkdown(trimmed)}</p>;
            })}
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
