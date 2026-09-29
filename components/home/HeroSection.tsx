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
    <section
      className="product-tile-parchment"
      style={{
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Apple Pill Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "9999px",
            backgroundColor: "var(--colors-surface-pearl)",
            border: "1px solid var(--colors-hairline)",
            color: "var(--colors-primary)",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34c759", display: "inline-block" }} />
          <span>{t("hero.badge")}</span>
        </div>

        {/* Hero Headline ("Apple tight" tracking) */}
        <h1
          className="apple-hero-display"
          style={{
            color: "var(--colors-ink)",
            marginBottom: "16px",
          }}
        >
          <span>{t("hero.title1")}</span>
          <br />
          <span style={{ color: "var(--colors-primary)" }}>{t("hero.title2")}</span>
        </h1>

        {/* One-Line Tagline */}
        <p
          className="apple-lead"
          style={{
            color: "var(--colors-ink-muted-80)",
            maxWidth: "680px",
            margin: "0 auto 36px",
          }}
        >
          {t("hero.subtitle")}
        </p>

        {/* Full-Pill Search Input */}
        <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto 24px" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "18px",
                color: "var(--colors-ink-muted-48)",
                pointerEvents: "none",
              }}
            />
            <input
              id="hero-search"
              type="search"
              className="apple-search-input"
              placeholder={t("hero.search.placeholder")}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              aria-label={t("hero.search.placeholder")}
            />
            <button
              className="button-primary"
              onClick={() => onSearch(query)}
              style={{
                position: "absolute",
                right: "5px",
                padding: "8px 18px",
                fontSize: "14px",
              }}
              aria-label={t("hero.search.button")}
            >
              <span>{t("hero.search.button")}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Popular Tags */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "56px",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--colors-ink-muted-48)", fontWeight: 600, marginRight: "4px" }}>
            {t("hero.popular")}:
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
                  borderRadius: "9999px",
                  backgroundColor: isSelected ? "var(--colors-primary)" : "var(--colors-canvas)",
                  border: isSelected ? "1px solid var(--colors-primary)" : "1px solid var(--colors-hairline)",
                  color: isSelected ? "#ffffff" : "var(--colors-ink)",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Clean Apple Utility Grid Dock */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            backgroundColor: "var(--colors-canvas)",
            border: "1px solid var(--colors-hairline)",
            borderRadius: "18px",
            padding: "24px",
          }}
        >
          {STATS_ITEMS.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <StatIcon size={18} color="#0066cc" />
                  <span style={{ fontSize: "28px", fontWeight: 600, color: "var(--colors-ink)", letterSpacing: "-0.02em" }}>
                    {stat.value}
                  </span>
                </div>
                <div className="apple-caption" style={{ color: "var(--colors-ink-muted-48)" }}>
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

