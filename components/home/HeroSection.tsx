"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Sparkles, ArrowRight, Zap, Boxes, ShieldCheck, CheckCircle2, Command } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { getTotalSiteUsageCount, formatCount } from "@/lib/stats";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const POPULAR_TAGS = [
  { en: "PDF Merge",          ko: "PDF 합치기",       ja: "PDFマージ",         es: "Unir PDF",         zh: "合并PDF",   fr: "Fusionner PDF",  query: "PDF Merge" },
  { en: "Word Count",         ko: "단어 및 글자 수 세기", ja: "単語・文字数",     es: "Contar Palabras",  zh: "字数统计",  fr: "Compter Mots",   query: "Word Count" },
  { en: "JSON Formatter",     ko: "JSON 포매터",       ja: "JSONフォーマット",  es: "Formato JSON",     zh: "JSON格式",  fr: "Format JSON",    query: "JSON Formatter" },
  { en: "Image Resizer",      ko: "이미지 리사이즈",   ja: "画像リ사이즈",      es: "Redimensionar",    zh: "调整图片",  fr: "Redimensionner", query: "Image Resizer" },
  { en: "Password Generator", ko: "비밀번호 생성기",   ja: "パスワード生成",    es: "Contraseña",       zh: "密码生成",  fr: "Mot de Passe",   query: "Password Generator" },
  { en: "Base64",             ko: "Base64",            ja: "Base64",            es: "Base64",           zh: "Base64",   fr: "Base64",          query: "Base64" },
];

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState("");
  const [totalUsage, setTotalUsage] = useState<number>(5417);

  useEffect(() => {
    setTotalUsage(getTotalSiteUsageCount());
  }, []);

  const handleChange = useCallback(
    (val: string) => {
      setQuery(val);
      onSearch(val);
    },
    [onSearch]
  );

  const handleTagClick = useCallback(
    (tagQuery: string) => {
      setQuery(tagQuery);
      onSearch(tagQuery);
    },
    [onSearch]
  );

  const STATS_ITEMS = [
    { icon: Zap,          value: `${formatCount(totalUsage, locale)}+`, label: locale === "ko" ? "누적 도구 이용" : "Total Uses" },
    { icon: Boxes,        value: "30+",   label: t("hero.stats.tools") },
    { icon: ShieldCheck,  value: "100%",  label: t("hero.stats.browser") },
    { icon: CheckCircle2, value: "0",     label: t("hero.stats.signup") },
  ];

  return (
    <section className="hero-section-container" style={{ position: "relative", overflow: "hidden", textAlign: "center" }}>
      {/* Background grid */}
      <div className="bg-grid" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.4 }} aria-hidden="true" />

      {/* Modern Linear / Vercel Aurora Glow */}
      <div
        className="orb"
        style={{
          width: "720px",
          height: "450px",
          background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.22) 0%, rgba(6, 182, 212, 0.12) 45%, transparent 70%)",
          top: "-160px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 0,
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />
      <div
        className="orb"
        style={{
          width: "360px",
          height: "360px",
          background: "radial-gradient(circle, rgba(79, 70, 229, 0.14) 0%, transparent 70%)",
          top: "60px",
          left: "8%",
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        className="orb"
        style={{
          width: "360px",
          height: "360px",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, transparent 70%)",
          top: "40px",
          right: "8%",
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
        {/* Glowing Badge */}
        <div
          className="animate-fade-in-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "100px",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.28)",
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
            color: "var(--text-primary)",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          <span style={{ position: "relative", display: "flex", width: "8px", height: "8px" }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10b981", opacity: 0.75, animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
            <span style={{ position: "relative", borderRadius: "50%", width: "8px", height: "8px", background: "#10b981" }} />
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={12} className="text-indigo-400" />
            {t("hero.badge")}
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(32px, 5.8vw, 62px)",
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: "-0.04em",
            marginBottom: "18px",
          }}
        >
          <span style={{ color: "var(--text-primary)" }}>{t("hero.title1")}</span>
          <br />
          <span className="gradient-text">{t("hero.title2")}</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(15px, 2vw, 17.5px)",
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            maxWidth: "580px",
            margin: "0 auto 36px",
            fontWeight: 400,
          }}
        >
          {t("hero.subtitle")}
        </p>

        {/* Command-Bar Search Input */}
        <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto 22px" }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              background: "var(--glass-bg)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), 0 0 24px rgba(99, 102, 241, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ padding: "0 4px 0 16px", display: "flex", alignItems: "center", color: "#818cf8", flexShrink: 0 }}>
              <Search size={20} strokeWidth={2.2} />
            </div>
            <input
              id="hero-search"
              type="search"
              placeholder={t("hero.search.placeholder")}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "16px 12px",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "15px",
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 500,
              }}
              aria-label={t("hero.search.placeholder")}
            />
            {/* Keyboard shortcut hint */}
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                fontSize: "11px",
                fontWeight: 600,
                marginRight: "8px",
              }}
            >
              <Command size={11} />
              <span>K</span>
            </div>
            <button
              className="btn-glow"
              style={{
                margin: "6px",
                padding: "10px 18px",
                fontSize: "13.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
                borderRadius: "11px",
              }}
              aria-label={t("hero.search.button")}
            >
              <span className="hidden sm:inline">{t("hero.search.button")}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Popular Tags */}
        <div
          className="animate-fade-in-up animation-delay-300"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "52px",
          }}
        >
          <span style={{ fontSize: "12.5px", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
            <Sparkles size={13} className="text-indigo-400" />
            {t("hero.popular")}
          </span>
          {POPULAR_TAGS.map((tag) => {
            const label = (tag as Record<string, string>)[locale] ?? tag.en;
            const isSelected = query === tag.query;
            return (
              <button
                key={tag.query}
                onClick={() => handleTagClick(tag.query)}
                style={{
                  padding: "6px 14px",
                  minHeight: "32px",
                  borderRadius: "100px",
                  background: isSelected ? "rgba(99, 102, 241, 0.22)" : "var(--tag-bg)",
                  border: isSelected ? "1px solid rgba(99, 102, 241, 0.5)" : "1px solid var(--tag-border)",
                  boxShadow: isSelected ? "0 0 12px rgba(99, 102, 241, 0.25)" : "none",
                  color: isSelected ? "#a5b4fc" : "var(--text-secondary)",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: isSelected ? 700 : 500,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Floating Glass Stats Dock */}
        <div
          className="hero-stats-grid"
          style={{
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {STATS_ITEMS.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className="hero-stats-item"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <StatIcon size={16} className="text-indigo-400 opacity-85" />
                  <span
                    style={{ fontSize: "25px", fontWeight: 900, letterSpacing: "-0.5px" }}
                    className="gradient-text"
                  >
                    {stat.value}
                  </span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
