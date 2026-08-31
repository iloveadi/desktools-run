"use client";

/**
 * app/tools/word-count/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Word Count & Text Analysis Tool
 */

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Type,
  FileText,
  Copy,
  Trash2,
  Check,
  Upload,
  Clock,
  Mic,
  AlignLeft,
  Hash,
  Sparkles,
  ArrowLeft,
  BarChart3,
  Wand2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { useLocale } from "@/lib/context/LocaleContext";

// ── Text Analysis Calculations ─────────────────────────────────
function analyzeText(text: string) {
  if (!text.trim()) {
    return {
      words: 0,
      charsWithSpace: 0,
      charsNoSpace: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTimeSec: 0,
      speakingTimeSec: 0,
      keywords: [] as { word: string; count: number; percentage: number }[],
    };
  }

  const charsWithSpace = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;

  const whitespaceWords = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const wordsCount = whitespaceWords.length;

  const sentences = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;

  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;

  const lines = text.split(/\r\n|\r|\n/).length;

  const wpm = 200;
  const spm = 130;
  const readingTimeSec = Math.ceil((wordsCount / wpm) * 60);
  const speakingTimeSec = Math.ceil((wordsCount / spm) * 60);

  const stopWords = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "is", "am", "are", "was", "were", "been", "being", "이", "그", "저",
    "것", "수", "등", "들", " 및", "를", "을", "가", "이", "은", "는", "에",
  ]);

  const wordMap: Record<string, number> = {};
  const cleanedWords = text
    .toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7A3]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w) && isNaN(Number(w)));

  cleanedWords.forEach((w) => {
    wordMap[w] = (wordMap[w] || 0) + 1;
  });

  const totalKeywords = cleanedWords.length || 1;
  const sortedKeywords = Object.entries(wordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([word, count]) => ({
      word,
      count,
      percentage: Math.round((count / totalKeywords) * 100),
    }));

  return {
    words: wordsCount,
    charsWithSpace,
    charsNoSpace,
    sentences,
    paragraphs,
    lines,
    readingTimeSec,
    speakingTimeSec,
    keywords: sortedKeywords,
  };
}

function formatTime(seconds: number) {
  if (seconds <= 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function WordCountPage() {
  const { t } = useLocale();
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => analyzeText(text), [text]);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleClear = useCallback(() => {
    setText("");
  }, []);

  const handleUppercase = useCallback(() => {
    setText((prev) => prev.toUpperCase());
  }, []);

  const handleLowercase = useCallback(() => {
    setText((prev) => prev.toLowerCase());
  }, []);

  const handleTitlecase = useCallback(() => {
    setText((prev) =>
      prev.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    );
  }, []);

  const handleCleanSpaces = useCallback(() => {
    setText((prev) =>
      prev
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s*\n/g, "\n\n")
        .trim()
    );
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target?.result as string;
        if (content) setText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target?.result as string;
        if (content) setText(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <ToolUsageTracker toolId="word-count" />
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* ── Breadcrumb & Header ───────────────────────── */}
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "32px 24px 24px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} />
            {t("wordCount.back") || "Back to All Tools"}
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div
                  className="icon-text"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Type size={20} />
                </div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "var(--text-primary)",
                  }}
                >
                  {t("wordCount.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
                {t("wordCount.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "var(--btn-secondary-bg)",
                border: "1px solid var(--btn-secondary-border)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              <Sparkles size={12} style={{ color: "#6366f1" }} />
              {t("wordCount.badge") || "100% Client-side Processing"}
            </div>
          </div>
        </section>

        {/* ── Main Tool Workspace ───────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {/* ── Stats Dashboard Grid ────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {[
              { label: t("wordCount.words"), value: stats.words.toLocaleString(), icon: Type, color: "#6366f1" },
              { label: t("wordCount.chars"), value: stats.charsWithSpace.toLocaleString(), icon: Hash, color: "#34d399" },
              { label: t("wordCount.charsNoSpace"), value: stats.charsNoSpace.toLocaleString(), icon: AlignLeft, color: "#60a5fa" },
              { label: t("wordCount.sentences"), value: stats.sentences.toLocaleString(), icon: FileText, color: "#fbbf24" },
              { label: t("wordCount.paragraphs"), value: stats.paragraphs.toLocaleString(), icon: FileText, color: "#e879f9" },
              { label: t("wordCount.readTime"), value: formatTime(stats.readingTimeSec), icon: Clock, color: "#38bdf8" },
              { label: t("wordCount.speakTime"), value: formatTime(stats.speakingTimeSec), icon: Mic, color: "#f87171" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="glass-card"
                style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                    {label}
                  </span>
                  <Icon size={14} style={{ color }} />
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Action Toolbar ──────────────────────────── */}
          <div
            className="glass-card"
            style={{
              padding: "10px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <button
                onClick={handleUppercase}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "var(--btn-secondary-bg)",
                  border: "1px solid var(--btn-secondary-border)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {t("wordCount.uppercase")}
              </button>
              <button
                onClick={handleLowercase}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "var(--btn-secondary-bg)",
                  border: "1px solid var(--btn-secondary-border)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {t("wordCount.lowercase")}
              </button>
              <button
                onClick={handleTitlecase}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "var(--btn-secondary-bg)",
                  border: "1px solid var(--btn-secondary-border)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {t("wordCount.titlecase")}
              </button>
              <button
                onClick={handleCleanSpaces}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "var(--btn-secondary-bg)",
                  border: "1px solid var(--btn-secondary-border)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Wand2 size={12} />
                {t("wordCount.cleanSpaces")}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,.log,.js,.ts,.json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  background: "var(--btn-secondary-bg)",
                  border: "1px solid var(--btn-secondary-border)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Upload size={13} />
                Import File
              </button>

              <button
                onClick={handleCopy}
                disabled={!text}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  background: copied ? "rgba(34,211,168,0.2)" : "rgba(99,102,241,0.15)",
                  border: copied ? "1px solid rgba(34,211,168,0.4)" : "1px solid rgba(99,102,241,0.3)",
                  color: copied ? "#34d399" : "#a5b4fc",
                  cursor: text ? "pointer" : "not-allowed",
                  opacity: text ? 1 : 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? t("wordCount.copied") : t("wordCount.copy")}
              </button>

              <button
                onClick={handleClear}
                disabled={!text}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                  cursor: text ? "pointer" : "not-allowed",
                  opacity: text ? 1 : 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Trash2 size={13} />
                {t("wordCount.clear")}
              </button>
            </div>
          </div>

          {/* ── Textarea + Keyword Density Layout ──────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: "16px",
              alignItems: "start",
            }}
            className="editor-grid"
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{ position: "relative" }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("wordCount.placeholder")}
                style={{
                  width: "100%",
                  minHeight: "420px",
                  padding: "20px",
                  borderRadius: "16px",
                  background: "var(--glass-bg)",
                  border: isDragging ? "2px dashed #6366f1" : "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  resize: "vertical",
                  boxShadow: "var(--shadow-card)",
                }}
                aria-label="Text editor input"
              />

              {isDragging && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "16px",
                    background: "rgba(99,102,241,0.15)",
                    backdropFilter: "blur(4px)",
                    border: "2px dashed #6366f1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "#a5b4fc",
                    fontWeight: 600,
                    pointerEvents: "none",
                  }}
                >
                  <Upload size={32} />
                  <span>{t("wordCount.dropPrompt")}</span>
                </div>
              )}
            </div>

            {/* Keyword Density Sidebar */}
            <div
              className="glass-card"
              style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BarChart3 size={16} style={{ color: "#8b5cf6" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("wordCount.density")}
                </h3>
              </div>

              {stats.keywords.length === 0 ? (
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Type text in the editor to view top keyword frequencies and density analysis.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {stats.keywords.map(({ word, count, percentage }) => (
                    <div key={word} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12.5px",
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{word}</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          borderRadius: "3px",
                          background: "var(--btn-secondary-bg)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            borderRadius: "3px",
                            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────────── */}
        <ToolGuide
          badgeText="100% Free & Browser-Native"
          aboutTitle={t("wordCount.guide.aboutTitle") || "단어 및 글자 수 세기 도구란 무엇인가요?"}
          aboutDesc={t("wordCount.guide.aboutDesc") || "desktools.run의 글자수 세기 도구는 웹 브라우저에서 바로 사용할 수 있는 무료 텍스트 분석 도구입니다. 텍스트를 입력하는 즉시 공백 포함/제외 글자 수, 단어 수, 문장 수, 단락 수, 예상 읽기/말하기 시간 및 주요 키워드 빈도를 실시간으로 계산해 드립니다."}
          howTitle={t("wordCount.guide.howTitle") || "사용 방법"}
          steps={[
            t("wordCount.guide.step1") || "에디터에 텍스트를 직접 입력하거나 붙여넣고, 또는 .txt / .md 텍스트 파일을 드래그하여 불러옵니다.",
            t("wordCount.guide.step2") || "상단 통계 카드에서 단어 수, 글자 수, 문장 수 및 예상 읽기 시간을 실시간으로 확인합니다.",
            t("wordCount.guide.step3") || "대소문자 변환, 공백/줄바꿈 정리 및 텍스트 복사 기능으로 효율적으로 원고를 다듬으세요.",
          ]}
          faqs={[
            { q: t("wordCount.guide.faq1Q") || "작성한 텍스트가 서버에 저장되거나 전송되나요?", a: t("wordCount.guide.faq1A") || "아닙니다. 모든 텍스트 계산 및 분석은 100% 사용자의 웹 브라우저 내부에서 로컬로 처리됩니다." },
            { q: t("wordCount.guide.faq2Q") || "예상 읽기 및 말하기 시간은 어떻게 계산되나요?", a: t("wordCount.guide.faq2A") || "일반적인 성인의 평균 묵독 속도(분당 약 200단어)와 낭독/스피치 속도(분당 약 130단어)를 기준으로 자동 산출됩니다." },
            { q: t("wordCount.guide.faq3Q") || "공백 포함 글자 수와 공백 제외 글자 수의 차이는 무엇인가요?", a: t("wordCount.guide.faq3A") || "'공백 포함'은 띄어쓰기 및 줄바꿈을 포함한 전체 입력 글자 수를 의미하며, '공백 제외'는 순수한 문자 및 기호 수만을 의미합니다." },
          ]}
        />
      </main>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .editor-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
