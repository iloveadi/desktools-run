"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { getTotalSiteUsageCount, formatCount } from "@/lib/stats";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const POPULAR_TAGS = [
  { en: "PDF Merge",          ko: "PDF 합치기",       ja: "PDFマージ",         es: "Unir PDF",         zh: "合并PDF",   fr: "Fusionner PDF",  query: "PDF Merge" },
  { en: "Word Count",         ko: "단어 수 세기",      ja: "文字数カウント",     es: "Contar Palabras",  zh: "字数统计",  fr: "Compter Mots",   query: "Word Count" },
  { en: "JSON Formatter",     ko: "JSON 포매터",       ja: "JSONフォーマット",  es: "Formato JSON",     zh: "JSON格式",  fr: "Format JSON",    query: "JSON Formatter" },
  { en: "Image Resizer",      ko: "이미지 리사이즈",   ja: "画像リサイズ",      es: "Redimensionar",    zh: "调整图片",  fr: "Redimensionner", query: "Image Resizer" },
  { en: "Password Generator", ko: "비밀번호 생성기",   ja: "パスワード生成",    es: "Contraseña",       zh: "密码生成",  fr: "Mot de Passe",   query: "Password Generator" },
  { en: "Base64",             ko: "Base64",            ja: "Base64",            es: "Base64",           zh: "Base64",   fr: "Base64",          query: "Base64" },
];

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState("");
  const [totalUsage, setTotalUsage] = useState<number>(2042);

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
    { value: `${formatCount(totalUsage, locale)}+`, label: locale === "ko" ? "누적 도구 이용" : "Total Uses" },
    { value: "21+",   label: t("hero.stats.tools") },
    { value: "100%",  label: t("hero.stats.browser") },
    { value: "0",     label: t("hero.stats.signup") },
  ];

  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "100px 24px 80px", textAlign: "center" }}>
      {/* Background grid */}
      <div className="bg-grid" style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.5 }} aria-hidden="true" />

      {/* Subtle Floating orbs */}
      <div className="orb" style={{ width: "600px", height: "600px", background: "radial-gradient(circle, rgba(79, 70, 229, 0.16) 0%, transparent 70%)", top: "-220px", left: "50%", transform: "translateX(-50%)", zIndex: 0 }} aria-hidden="true" />
      <div className="orb" style={{ width: "320px", height: "320px", background: "radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)", top: "20px", right: "12%", zIndex: 0 }} aria-hidden="true" />
      <div className="orb" style={{ width: "280px", height: "280px", background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)", top: "80px", left: "6%", zIndex: 0 }} aria-hidden="true" />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "760px", margin: "0 auto" }}>
        {/* Badge */}
        <div
          className="animate-fade-in-up badge-pill"
          style={{ marginBottom: "24px" }}
        >
          <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(79, 70, 229, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={10} />
          </div>
          {t("hero.badge")}
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-up animation-delay-100"
          style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px", marginBottom: "20px" }}
        >
          <span style={{ color: "var(--text-primary)" }}>{t("hero.title1")}</span>
          <br />
          <span className="gradient-text">{t("hero.title2")}</span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in-up animation-delay-200"
          style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "40px", maxWidth: "540px", margin: "0 auto 40px" }}
        >
          {t("hero.subtitle")}
        </p>

        {/* Search Bar */}
        <div style={{ position: "relative", maxWidth: "580px", margin: "0 auto 24px" }}>
          <div style={{
            position: "relative", display: "flex", alignItems: "center",
            background: "var(--glass-bg)", border: "1.5px solid var(--border-hover)",
            borderRadius: "14px", overflow: "hidden", transition: "all 0.25s ease",
            boxShadow: "var(--shadow-card)",
          }}>
            <div style={{ padding: "0 4px 0 18px", display: "flex", alignItems: "center", color: "var(--text-muted)", flexShrink: 0 }}>
              <Search size={18} />
            </div>
            <input
              id="hero-search"
              type="search"
              placeholder={t("hero.search.placeholder")}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              style={{ flex: 1, padding: "17px 8px", background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "15.5px", fontFamily: "Inter, sans-serif" }}
              aria-label={t("hero.search.placeholder")}
            />
            <button
              className="btn-glow"
              style={{ margin: "7px", padding: "10px 20px", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}
              aria-label={t("hero.search.button")}
            >
              <span>{t("hero.search.button")}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="animate-fade-in-up animation-delay-300" style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "64px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
            {t("hero.popular")}
          </span>
          {POPULAR_TAGS.map((tag) => {
            const label = (tag as Record<string, string>)[locale] ?? tag.en;
            return (
              <button
                key={tag.query}
                onClick={() => handleTagClick(tag.query)}
                style={{
                  padding: "4px 12px", borderRadius: "100px",
                  background: query === tag.query ? "rgba(79, 70, 229, 0.2)" : "var(--tag-bg)",
                  border: query === tag.query ? "1px solid rgba(79, 70, 229, 0.4)" : "1px solid var(--tag-border)",
                  color: query === tag.query ? "#a5b4fc" : "var(--text-secondary)",
                  fontSize: "12.5px", cursor: "pointer", transition: "all 0.15s",
                  fontFamily: "Inter, sans-serif", fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  if (query !== tag.query) {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--tag-bg-hover)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (query !== tag.query) {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--tag-bg)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Stats Strip */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "0", flexWrap: "wrap",
          background: "var(--stats-bg)", border: "1px solid var(--stats-border)",
          borderRadius: "14px", padding: "0", overflow: "hidden",
        }}>
          {STATS_ITEMS.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                flex: "1 1 120px", padding: "20px 24px", textAlign: "center",
                borderRight: i < STATS_ITEMS.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "2px" }} className="gradient-text">
                {stat.value}
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
