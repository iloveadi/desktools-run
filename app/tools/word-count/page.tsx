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
  const { t, locale } = useLocale();
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

        {/* ── Unified Tool Guide & FAQ Section (6-Language) ───────────── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "단어 및 글자 수 세기 & 실시간 텍스트 분석기 소개",
              aboutDesc:
                "텍스트를 입력하거나 문서를 불러오는 즉시 공백 포함/제외 글자 수, 단어 수, 문장 수, 단락 수, 줄 수, 예상 묵독 및 낭독 시간, 상위 키워드 출현 빈도와 밀도를 100% 브라우저 메모리 안에서 실시간으로 정밀 계산해 주는 전문 텍스트 분석 도구입니다. 취업 자기소개서 분량 검증, 블로그/SNS SEO 콘텐츠 작성, 학술 과제 글자 수 제한 확인, 텍스트 공백 정리 및 대소문자 변환까지 안전하게 처리합니다.",
              howTitle: "글자 수 세기 및 원고 다듬기 방법",
              steps: [
                "텍스트 에디터에 원고를 직접 입력하거나 붙여넣습니다 (.txt, .md 파일 드래그 앤 드롭 지원).",
                "상단 실시간 통계 카드에서 공백 포함/제외 글자 수, 단어 수, 문장 수, 예상 낭독 시간을 확인합니다.",
                "우측 '키워드 밀도' 분석 패널에서 자주 반복된 핵심 단어의 출현 빈도와 점유율을 점검합니다.",
                "상단 툴바의 '대소문자 변환' 또는 '공백/줄바꿈 정리' 버튼을 눌러 문단을 깔끔하게 정돈합니다.",
                "'복사' 버튼을 눌러 완성된 텍스트를 클립보드에 담아 원하는 곳에 바로 붙여넣습니다."
              ],
              featuresTitle: "주요 분석 기능 및 편의성",
              features: [
                { title: "공백 포함/제외 실시간 이중 카운팅", desc: "한글, 영어, 특수문자, 이모지, 줄바꿈을 포함한 전체 문자 수와 순수 문자 수를 실시간으로 정확하게 분리 계산합니다." },
                { title: "묵독 & 낭독 예상 소요 시간 산출", desc: "평균 읽기 속도(200 WPM)와 발표/스피치 속도(130 WPM)를 기준으로 프레젠테이션 소요 시간을 예측합니다." },
                { title: "불용어 제외 상위 키워드 밀도 분석", desc: "조사와 일반 기능어를 필터링하고 실제 의미 있는 핵심 단어의 빈도 순위와 비율(%)을 차트로 제공합니다." },
                { title: "원클릭 텍스트 클리너 & 변환", desc: "연속된 다중 공백 제거, 불필요한 빈 줄 정리, 대문자/소문자/Title Case 변환을 원클릭으로 처리합니다." }
              ],
              useCasesTitle: "추천 활용 분야",
              useCases: [
                { title: "취업 자기소개서 & 이력서 분량 체크", desc: "500자/1000자 제한이 있는 기업 채용 사이트 제출 전 정확한 글자 수 및 단락 수 사전 검증" },
                { title: "블로그 포스팅 & SEO 콘텐츠 최적화", desc: "네이버 블로그, 티스토리, 워드프레스 검색엔진 최적화를 위한 1500~2000자 분량 및 키워드 반복률 점검" },
                { title: "스피치 & 프레젠테이션 대본 연습", desc: "발표 시간(3분, 5분, 10분)에 맞춘 발표 대본 길이 조절 및 말하기 시간 시뮬레이션" },
                { title: "학술 논문, 에세이 및 번역 원고 검수", desc: "학회 제출 기준 단어 수 제한(Word Count limit) 및 번역 분량 단가 산정용 단어 수 산출" }
              ],
              proTipsTitle: "글자 수 세기 전문가 활용 팁",
              proTips: [
                "공기업 및 대기업 자소서는 통상 '공백 포함' 기준으로 500자/1,000자 제한을 두는 경우가 많으므로 상단 첫 번째 지표를 확인하세요.",
                "블로그 검색 상위 노출을 위해서는 본문 1,500~2,500자 내외 및 핵심 타깃 키워드 밀도 2~3% 유지를 권장합니다.",
                "발표 대본 작성 시 1분당 한국어 약 300~350자(영어 약 130단어)를 기준으로 잡으면 시간에 쫓기지 않는 자연스러운 발표가 가능합니다.",
                "복사한 웹 문서에 섞인 불규칙한 빈 줄과 탭 공백은 툴바의 '공백/줄바꿈 정리' 버튼 한 번으로 말끔히 제거할 수 있습니다."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "입력한 자소서나 문서 내용이 외부 서버로 전송되거나 저장되나요?", a: "절대 전송되지 않습니다. 모든 텍스트 길이 측정과 키워드 분석은 100% 사용자의 PC/스마트폰 브라우저 메모리 내부에서 로컬 연산됩니다." },
                { q: "공백 포함 글자 수와 공백 제외 글자 수 중 어떤 것을 봐야 하나요?", a: "일반적인 한국 기업 채용 및 대입 자소서는 '공백 포함'을 기준으로 합니다. 다만 일부 과제나 출판 원고의 경우 '공백 제외'를 요구할 수 있으니 제출처 규정을 확인하세요." },
                { q: "한글 1글자와 영문 1글자는 어떻게 카운트되나요?", a: "글자 수(Characters)는 언어 구분 없이 모든 문자를 1자로 계산하며, 단어 수(Words)는 띄어쓰기 기준으로 구분된 어절 단위로 계산됩니다." },
                { q: "예상 읽기 시간(Reading Time)은 어떻게 계산되나요?", a: "일반 성인의 평균적인 눈으로 읽는 묵독 속도(분당 약 200단어)와 소리 내어 읽는 스피치 속도(분당 약 130단어)를 기준으로 자동 산출됩니다." },
                { q: "키워드 밀도 분석에서 '은/는/이/가' 같은 조사는 왜 빠지나요?", a: "의미 분석의 정확도를 높이기 위해 한국어 및 영어의 대표적인 불용어(Stopwords)를 자동으로 필터링하고 실제 핵심 단어의 빈도만 추려내기 때문입니다." },
                { q: "스마트폰이나 태블릿에서도 사용 가능한가요?", a: "네! 모바일 사파리, 크롬 브라우저에 완벽 대응하며 텍스트 선택 및 실시간 집계가 동일하게 작동합니다." }
              ],
              relatedTools: [
                { title: "대소문자 / 표기법 변환기", desc: "camelCase, snake_case, PascalCase, 대소문자 일괄 변환", href: "/tools/text-case/" },
                { title: "마크다운 실시간 미리보기", desc: "마크다운 문서를 작성하고 실시간 HTML 렌더링 결과 확인", href: "/tools/markdown-preview/" },
                { title: "텍스트 차이점 비교 (Diff)", desc: "두 텍스트 블록의 수정·추가·삭제된 줄 단위 차이점을 비교", href: "/tools/text-diff/" },
                { title: "QR 코드 생성기", desc: "텍스트와 웹 링크를 고화질 맞춤형 QR 코드로 즉시 생성", href: "/tools/qr-generator/" }
              ]
            },
            en: {
              aboutTitle: "About Word Counter & Text Analysis Tool",
              aboutDesc:
                "Analyze words, characters (with and without spaces), sentences, paragraphs, lines, estimated reading and speaking times, and keyword density in real-time. Built entirely with client-side browser technology, your confidential essays, resumes, and articles are calculated 100% locally with zero server uploads.",
              howTitle: "How to Count Words & Optimize Your Writing",
              steps: [
                "Type or paste your text directly into the main editor area (drag & drop .txt or .md files supported).",
                "Check the live dashboard metrics for words, characters, sentences, paragraphs, and reading duration.",
                "Review the Keyword Density panel on the right to audit word repetition frequencies and percentages.",
                "Use the toolbar buttons to convert letter cases or clean extra whitespace and empty lines.",
                "Click 'Copy' to immediately copy your refined, measured content to your clipboard."
              ],
              featuresTitle: "Key Text Analysis Features",
              features: [
                { title: "Real-Time Dual Character Counting", desc: "Calculates total characters with spaces and characters without spaces simultaneously as you type." },
                { title: "Reading & Speaking Time Estimation", desc: "Accurately estimates silent reading time (200 WPM) and speech delivery time (130 WPM)." },
                { title: "Smart Keyword Frequency & Density", desc: "Automatically filters common grammatical stop words to highlight top meaningful keyword densities." },
                { title: "1-Click Whitespace & Case Cleaner", desc: "Sanitize repeated spaces, collapse excessive blank lines, and toggle UPPERCASE or Title Case in one tap." }
              ],
              useCasesTitle: "Popular Use Cases",
              useCases: [
                { title: "College Essays & Academic Papers", desc: "Strictly adhere to word and character limits specified by academic journals and university portals." },
                { title: "SEO Articles & Content Marketing", desc: "Target optimal 1,500–2,500 word counts and 2–3% primary keyword density for search engines." },
                { title: "Speech & Presentation Rehearsal", desc: "Gauge exact presentation length and adjust speaking scripts for 3-minute, 5-minute, or 10-minute talks." },
                { title: "Social Media Character Limits", desc: "Ensure posts fit within limits for Twitter/X (280 chars), LinkedIn, and Instagram captions." }
              ],
              proTipsTitle: "Professional Writing & Word Count Tips",
              proTips: [
                "For public speeches, aim for roughly 130 to 150 words per minute to deliver a clear, well-paced address.",
                "Check character count without spaces when submitting freelance writing or publishing contracts that bill per raw character.",
                "Avoid keyword stuffing: maintain primary topic keywords under 3% density to prevent SEO search ranking penalties.",
                "Use the 'Clean Spaces' button to clean messy formatting when copying text out of PDFs or formatted web pages."
              ],
              faqTitle: "Frequently Asked Questions (FAQ)",
              faqs: [
                { q: "Is my text uploaded or stored on any server?", a: "No. All text parsing, word counting, and keyword calculations occur 100% inside your browser memory (Client-Side). No text data is ever transmitted." },
                { q: "What is the difference between characters with and without spaces?", a: "'With Spaces' counts every letter, punctuation mark, whitespace, and newline. 'No Spaces' only counts alphanumeric letters and symbols." },
                { q: "How are reading and speaking times estimated?", a: "Reading time uses an average silent reading rate of 200 words per minute. Speaking time is calculated based on a conversational presentation speed of 130 words per minute." },
                { q: "Does this counter support non-English languages?", a: "Yes! It fully supports Korean, Japanese, Chinese, Spanish, French, German, and special Unicode characters/emojis." },
                { q: "Why are words like 'the' or 'and' excluded from keyword density?", a: "Stop words (common grammatical articles and prepositions) are filtered out so you can focus on the actual thematic keywords of your text." },
                { q: "Is this tool completely free with no limits?", a: "Yes, 100% free with no daily limits, character quotas, or account sign-ups required." }
              ],
              relatedTools: [
                { title: "Text Case Converter", desc: "Convert text to UPPERCASE, camelCase, snake_case, PascalCase", href: "/tools/text-case/" },
                { title: "Markdown Live Preview", desc: "Write Markdown documents with live rendered HTML preview", href: "/tools/markdown-preview/" },
                { title: "Text Diff Checker", desc: "Compare two text snippets side-by-side and highlight differences", href: "/tools/text-diff/" },
                { title: "QR Code Generator", desc: "Create high-resolution custom QR codes from text and URLs", href: "/tools/qr-generator/" }
              ]
            },
            ja: {
              aboutTitle: "文字数カウント＆リアルタイム文章分析ツールについて",
              aboutDesc:
                "文章を入力・ペーストするだけで、文字数（空白込み・除外）、単語数、行数、段落数、文数、読了予想時間およびスピーチ時間をブラウザ内でリアルタイムに計測します。エントリーシート（ES）の文字数確認、ブログ記事のSEO最適化、プレゼン原稿の読み上げ時間シミュレーションを100%ローカル環境で安全に行えます。",
              howTitle: "文字数カウントツールの使い方",
              steps: [
                "エディタに直接テキストを入力するか、文章をコピー＆ペーストします（.txt、.mdファイルのドラッグ対応）。",
                "上部の統計ダッシュボードで、文字数、単語数、読了時間をリアルタイムに確認します。",
                "右側の「キーワード出現頻度」パネルで頻出単語の割合（密度）をチェックします。",
                "ツールバーの「大文字/小文字変換」や「余分な空白・改行の整理」で文章を素早く整形します。",
                "「コピー」ボタンをクリックして、整形済みのテキストをクリップボードに取得します。"
              ],
              featuresTitle: "主な分析機能と特徴",
              features: [
                { title: "空白込み・空白除外の同時計測", desc: "日本語・英語・記号・絵文字を含む総文字数と純粋な文字数をリアルタイムに別々でカウント。" },
                { title: "読了時間・スピーチ時間の高精度予測", desc: "一般的な黙読速度（約200WPM）とプレゼン朗読速度（約130WPM）を基準に所要時間を自動計算。" },
                { title: "助詞を除外したキーワード密度分析", desc: "一般的なストップワードを除外し、文章の主題となる重要キーワードの頻度と割合を可視化。" },
                { title: "ワンクリック文章整形＆大文字小文字変換", desc: "連続した空白の整理、不要な空行の削除、大文字・小文字変換をワンクリックで実行。" }
              ],
              useCasesTitle: "おすすめの活用シーン",
              useCases: [
                { title: "就活エントリーシート（ES）・履歴書", desc: "400字・800字・1000字などの制限文字数に対する正確な過不足チェック" },
                { title: "ブログ記事・SEOコンテンツ制作", desc: "検索上位を狙うための2000〜4000字の文字量管理とキーワード密度の点検" },
                { title: "プレゼン・スピーチ原稿の練習", desc: "3分・5分スピーチに合わせた原稿の文字量調整と発話時間の事前確認" },
                { title: "レポート・論文・翻訳文字数管理", desc: "大学の課題提出規定や翻訳文字数単価の計算に必要な文字数の算出" }
              ],
              proTipsTitle: "文字数カウントのプロのコツ",
              proTips: [
                "就活のエントリーシートは一般的に「空白込み」基準が多いため、左上の数値を基準に推敲してください。",
                "日本語のスピーチでは1分間に約300〜350文字を話すのが最も聞き取りやすいペースとされています。",
                "SEO記事では特定キーワードの詰め込み（5%以上）を避け、2〜3%の適切な密度を維持するのが効果的です。",
                "PDFなどからコピーしたテキストの崩れた改行は「空白整理」ボタンで一瞬で整えることができます。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "入力した文章がサーバーに送信されたり保存されますか？", a: "一切送信されません。すべての計測・解析処理はお使いのブラウザメモリ内（ローカル）で完結します。" },
                { q: "空白込みと空白除外のどちらを参考にすべきですか？", a: "一般的な就活や公募は「空白込み」が基準ですが、一部の学術論文や原稿執筆では「空白除外」を求められる場合があります。" },
                { q: "日本語と英数字はどのようにカウントされますか？", a: "文字数は言語を問わず1文字としてカウントされ、単語数はスペース区切りで計算されます。" },
                { q: "読了時間はどのように計算されていますか？", a: "大人の平均黙読速度（1分間に約200単語/日本語約500字）と朗読速度（約130単語/約300字）を基準に算出しています。" },
                { q: "スマホやタブレットでも使用できますか？", a: "はい！スマホのSafariやChromeブラウザでも快適にご利用いただけます。" },
                { q: "利用料金や文字数の制限はありますか？", a: "完全無料・無制限です。登録不要で長文も自由にカウント可能です。" }
              ],
              relatedTools: [
                { title: "大文字・小文字/命名規則変換", desc: "camelCase、snake_case、PascalCase、大文字小文字の一括変換", href: "/tools/text-case/" },
                { title: "Markdownリアルタイムプレビュー", desc: "マークダウンを記述しながらリアルタイムにHTML変換プレビュー", href: "/tools/markdown-preview/" },
                { title: "テキスト差分比較 (Diff)", desc: "2つの文章の修正・追加・削除箇所の違いを行単位で比較", href: "/tools/text-diff/" },
                { title: "QRコード作成", desc: "テキストやURLから高品質なQRコードを即座に生成", href: "/tools/qr-generator/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Contador de Palabras y Análisis de Texto",
              aboutDesc:
                "Analiza en tiempo real el número de palabras, caracteres (con y sin espacios), oraciones, párrafos, líneas, tiempo estimado de lectura y locución, y densidad de palabras clave. Ejecutado al 100% en la memoria de tu navegador de forma segura y confidencial.",
              howTitle: "Cómo Contar Palabras y Optimizar tu Redacción",
              steps: [
                "Escribe o pega tu texto en el editor principal (admite arrastrar archivos .txt o .md).",
                "Consulta las métricas en tiempo real: palabras, caracteres, oraciones y tiempo de lectura.",
                "Revisa el panel de Densidad de Palabras Clave para comprobar las frecuencias de repetición.",
                "Usa los botones de la barra de herramientas para cambiar mayúsculas o limpiar espacios.",
                "Haz clic en 'Copiar' para transferir el texto corregido directamente al portapapeles."
              ],
              featuresTitle: "Características Principales de Análisis",
              features: [
                { title: "Conteo Dual de Caracteres en Vivo", desc: "Calcula simultáneamente el total de caracteres con espacios y caracteres limpios sin espacios." },
                { title: "Estimación de Tiempo de Lectura y Locución", desc: "Estima con precisión el tiempo de lectura silenciosa (200 ppm) y locución oral (130 ppm)." },
                { title: "Densidad y Frecuencia de Palabras Clave", desc: "Filtra automáticamente preposiciones y artículos para resaltar los términos temáticos clave." },
                { title: "Limpiador de Espacios y Conversor de Mayúsculas", desc: "Elimina espacios duplicados, borra líneas vacías y alterna mayúsculas con un clic." }
              ],
              useCasesTitle: "Casos de Uso Populares",
              useCases: [
                { title: "Ensayos Universitarios y Tesis", desc: "Controla estrictamente los límites de palabras y caracteres exigidos en entregas académicas." },
                { title: "Artículos de Blog y Redacción SEO", desc: "Optimiza la extensión de 1.500 a 2.500 palabras y la repetición de palabras clave para Google." },
                { title: "Discursos y Presentaciones en Público", desc: "Ajusta la longitud de tus guiones para presentaciones de 3, 5 o 10 minutos exactos." },
                { title: "Límites en Redes Sociales", desc: "Adapta mensajes para Twitter/X (280 caracteres), LinkedIn e Instagram sin pasarte del límite." }
              ],
              proTipsTitle: "Consejos Profesionales de Redacción",
              proTips: [
                "Para discursos en público, calcula unas 130 a 140 palabras por minuto para mantener un ritmo claro y comprensible.",
                "Verifica los caracteres sin espacios si trabajas como redactor freelance con tarifas por carácter neto.",
                "Mantén la densidad de tus palabras clave principales entre el 2% y el 3% para evitar penalizaciones por sobreoptimización.",
                "Usa la función 'Limpiar espacios' para ordenar textos copiados desde PDFs con saltos de línea irregulares."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Se envían mis textos a algún servidor?", a: "No. Todo el análisis de texto se procesa localmente en la memoria de tu navegador (Client-Side)." },
                { q: "¿Qué diferencia hay entre caracteres con y sin espacios?", a: "'Con espacios' incluye todas las letras, signos y espacios. 'Sin espacios' solo contabiliza las letras y números puros." },
                { q: "¿Cómo se calcula el tiempo de lectura?", a: "Se basa en una velocidad media de 200 palabras por minuto para lectura visual y 130 ppm para lectura en voz alta." },
                { q: "¿Funciona en teléfonos móviles?", a: "Sí, es totalmente compatible con navegadores móviles en iOS y Android." },
                { q: "¿Por qué se omiten palabras como 'de' o 'el' en la densidad?", a: "Se filtran palabras funcionales (stop words) para mostrar únicamente los conceptos temáticos más relevantes." },
                { q: "¿Tiene algún coste o límite?", a: "Es 100% gratuito, ilimitado y no requiere registrarse." }
              ],
              relatedTools: [
                { title: "Conversor de Mayúsculas / Minúsculas", desc: "Convierte a camelCase, snake_case, PascalCase y Title Case", href: "/tools/text-case/" },
                { title: "Vista Previa de Markdown", desc: "Escribe en Markdown con renderizado HTML en tiempo real", href: "/tools/markdown-preview/" },
                { title: "Comparador de Textos (Diff)", desc: "Compara dos textos línea por línea y resalta las diferencias", href: "/tools/text-diff/" },
                { title: "Generador de Códigos QR", desc: "Crea códigos QR personalizados de alta resolución a partir de textos", href: "/tools/qr-generator/" }
              ]
            },
            zh: {
              aboutTitle: "关于字数统计与实时文本分析工具",
              aboutDesc:
                "支持在浏览器中实时统计文本的字符数（含/不含空格）、单词数、句子数、段落数、行数、预计默读与朗读时间，并对高频关键词密度进行智能图表分析。所有文本处理 100% 在本地浏览器内存中计算，绝不上传云端，严密保护求职简历与机密文档隐私。",
              howTitle: "字数统计与文本排版指南",
              steps: [
                "在编辑框中直接输入或粘贴文本（支持拖拽导入 .txt 或 .md 文件）。",
                "查看顶部仪表盘实时显示的字数、词数、句数及预计朗读耗时。",
                "在右侧“关键词密度”面板中分析核心词汇的出现频次与占比。",
                "利用顶部工具栏一键转换英文大小写或清理多余空格与空白行。",
                "点击“复制”按钮，将整理完毕的高质量文案直接带入剪贴板。"
              ],
              featuresTitle: "核心文本分析特性",
              features: [
                { title: "含/不含空格双重实时统计", desc: "实时精准区分统计包含空格与换行的总字符数以及纯净有效字符数。" },
                { title: "默读与演讲时长精确估算", desc: "基于成人平均默读速度（200 WPM）与演讲朗读速度（130 WPM）自动估算耗时。" },
                { title: "过滤虚词的高频关键词密度分析", desc: "自动过滤常见连词与语气助词，精准提取文章核心主题词的频次排行榜。" },
                { title: "一键排版净化与大小写转换", desc: "一键合并连续冗余空格、清除多余空行，支持大写、小写与驼峰命名转换。" }
              ],
              useCasesTitle: "实战推荐场景",
              useCases: [
                { title: "求职简历与自述信字数把控", desc: "严格对照招聘平台 500 字或 1000 字限制，提前核对字符数与段落分布" },
                { title: "公众号与 SEO 文章长文优化", desc: "把控 1500~2500 字黄金阅读篇幅，监控核心关键词 2%~3% 的健康密度" },
                { title: "演讲汇报与主持文稿排练", desc: "根据 3 分钟、5 分钟限时演讲要求，精准控制讲稿字数与语速节奏" },
                { title: "学术论文与翻译字数核算", desc: "快速核算期刊投稿 Word Count 限制及中英翻译计费字数" }
              ],
              proTipsTitle: "专家字数统计排版技巧",
              proTips: [
                "中文演讲一般按每分钟 250~300 字为宜，过快易导致听众无法吸收关键信息。",
                "SEO 文章应避免过度堆砌关键词，将主词出现频率控制在 2%~3% 最为理想。",
                "从 PDF 复制出来的文本常有大量断行与多余空格，点击“清理空格”即可瞬间排版整齐。",
                "国内企业自述信通常按“含空格”计算字数，请以第一项统计数据为准。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "我输入的文章内容会被上传到服务器吗？", a: "绝对不会！desktools.run 的所有文本分析算法 100% 在您本地浏览器中运行，无任何数据传输。" },
                { q: "含空格字符与不含空格字符有什么区别？", a: "“含空格”包含所有文字、标点、换行与空格；“不含空格”仅计算实际文字与标点符号。" },
                { q: "预计阅读时间是如何计算的？", a: "默读时间按每分钟 200 词（约 400~500 中文字）计算，朗读时间按每分钟 130 词（约 250~300 中文字）计算。" },
                { q: "手机或平板端可以使用吗？", a: "可以！完全适配移动端浏览器，支持触控操作与长文实时统计。" },
                { q: "为什么关键词统计中没有“的/了/在”等字？", a: "系统自动过滤了无实际语义的停用词（Stopwords），以便更清晰地呈现主题词分布。" },
                { q: "完全免费吗？每天有字数上限吗？", a: "100% 永久免费，无字数上限，无需注册即可使用。" }
              ],
              relatedTools: [
                { title: "英文大小写/命名规范转换", desc: "camelCase、snake_case、PascalCase、大小写一键互转", href: "/tools/text-case/" },
                { title: "Markdown 实时预览", desc: "编写 Markdown 文档并实时查看 HTML 渲染效果", href: "/tools/markdown-preview/" },
                { title: "文本差异比对 (Diff)", desc: "逐行比对两段文本的修改、新增与删除差异", href: "/tools/text-diff/" },
                { title: "QR 二维码生成器", desc: "将文本或网页链接即时生成为高清个性化二维码", href: "/tools/qr-generator/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Compteur de Mots et Analyseur de Texte",
              aboutDesc:
                "Analysez instantanément vos textes : nombre de mots, caractères (avec et sans espaces), phrases, paragraphes, lignes, temps de lecture et d'élocution, ainsi que la densité des mots-clés. Traitement 100% local dans la mémoire de votre navigateur sans aucun envoi vers des serveurs.",
              howTitle: "Comment Compter vos Mots et Peaufiner vos Textes",
              steps: [
                "Tapez ou collez votre texte dans l'éditeur (glisser-déposer de fichiers .txt ou .md accepté).",
                "Consultez les statistiques en temps réel : mots, caractères, phrases et durée de lecture.",
                "Examinez le volet de Densité des Mots-Clés pour repérer les répétitions fréquentes.",
                "Utilisez la barre d'outils pour basculer les majuscules ou nettoyer les espaces superflus.",
                "Cliquez sur 'Copier' pour récupérer immédiatement votre texte soigné dans le presse-papiers."
              ],
              featuresTitle: "Fonctionnalités Principales d'Analyse",
              features: [
                { title: "Double Comptage des Caractères en Direct", desc: "Calcule simultanément le nombre total de caractères avec espaces et sans espaces." },
                { title: "Estimation du Temps de Lecture et d'Élocution", desc: "Évalue la durée de lecture silencieuse (200 mots/min) et de prise de parole (130 mots/min)." },
                { title: "Analyse Intelligente de la Densité des Mots-Clés", desc: "Filtre les mots vides (articles, prépositions) pour mettre en valeur les termes essentiels." },
                { title: "Nettoyeur d'Espaces et Convertisseur de Casse", desc: "Supprime les espaces multiples, élimine les lignes vides et convertit la casse en 1 clic." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Dissertations et Devoirs Académiques", desc: "Respectez scrupuleusement les quotas de mots ou de signes exigés par vos professeurs." },
                { title: "Articles de Blog et Rédaction SEO", desc: "Visez 1 500 à 2 500 mots et surveillez la densité de vos mots-clés pour le référencement Google." },
                { title: "Répétition de Discours et Présentations", desc: "Calibrez précisément vos textes pour des prises de parole de 3, 5 ou 10 minutes." },
                { title: "Réseaux Sociaux et Micro-Blogging", desc: "Ajustez vos messages aux limites imposées par Twitter/X (280 signes), LinkedIn et Instagram." }
              ],
              proTipsTitle: "Conseils de Rédaction Professionnels",
              proTips: [
                "Pour une prise de parole en public, comptez environ 130 à 140 mots par minute pour conserver un débit agréable.",
                "Consultez les 'caractères sans espaces' pour les contrats de traduction ou de pige rémunérés au signe net.",
                "Maintenez la densité de vos mots-clés principaux sous la barre des 3% pour éviter toute sur-optimisation.",
                "Utilisez le bouton 'Nettoyer les espaces' pour supprimer les retours à la ligne parasites issus de PDF."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Mes textes sont-ils envoyés sur un serveur ?", a: "Non. Toute l'analyse textuelle s'exécute à 100% dans la mémoire de votre navigateur (Client-Side)." },
                { q: "Quelle est la différence entre caractères avec et sans espaces ?", a: "'Avec espaces' compte l'ensemble des lettres, ponctuations et espaces. 'Sans espaces' ne retient que les caractères typographiques." },
                { q: "Comment sont calculés les temps de lecture ?", a: "Ils reposent sur une vitesse moyenne de 200 mots/min pour la lecture silencieuse et 130 mots/min pour la lecture à voix haute." },
                { q: "L'outil fonctionne-t-il sur smartphone ?", a: "Oui, parfaitement accessible sur tous les navigateurs mobiles sans aucune application à installer." },
                { q: "Pourquoi certains mots comme 'le' ou 'de' n'apparaissent pas dans la densité ?", a: "Ces mots grammaticaux courants sont filtrés pour laisser place aux véritables concepts clés de votre texte." },
                { q: "Le service est-il gratuit et sans limite ?", a: "100% gratuit, illimité et sans inscription requise." }
              ],
              relatedTools: [
                { title: "Convertisseur de Casse (Text Case)", desc: "Convertissez en camelCase, snake_case, PascalCase ou majuscules", href: "/tools/text-case/" },
                { title: "Aperçu Markdown en Direct", desc: "Rédigez en Markdown avec rendu HTML instantané côte à côte", href: "/tools/markdown-preview/" },
                { title: "Comparateur de Textes (Diff)", desc: "Comparez deux textes ligne par ligne pour repérer les modifications", href: "/tools/text-diff/" },
                { title: "Générateur de QR Code", desc: "Créez des QR codes haute définition personnalisés à partir de textes", href: "/tools/qr-generator/" }
              ]
            }
          };

          const active = content[locale as keyof typeof content] || content.en;

          return (
            <ToolGuide
              badgeText="100% Free & Browser-Native"
              aboutTitle={active.aboutTitle}
              aboutDesc={active.aboutDesc}
              howTitle={active.howTitle}
              steps={active.steps}
              featuresTitle={active.featuresTitle}
              features={active.features}
              useCasesTitle={active.useCasesTitle}
              useCases={active.useCases}
              proTips={{
                title: active.proTipsTitle,
                tips: active.proTips,
              }}
              faqs={active.faqs}
              relatedTools={active.relatedTools}
            />
          );
        })()}
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
