"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Zap, Boxes, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { getTotalSiteUsageCount, formatCount } from "@/lib/stats";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const POPULAR_TAGS = [
  { en: "PDF Merge",          ko: "PDF 합치기",       ja: "PDFマージ",         es: "Unir PDF",         zh: "合并PDF",   fr: "Fusionner PDF",  query: "PDF Merge" },
  { en: "Word Count",         ko: "단어 및 글자 수 세기", ja: "単語・文字数",     es: "Contar Palabras",  zh: "字数统计",  fr: "Compter Mots",   query: "Word Count" },
  { en: "JSON Formatter",     ko: "JSON 포매터",       ja: "JSONフォーマット",  es: "Formato JSON",     zh: "JSON格式",  fr: "Format JSON",    query: "JSON Formatter" },
  { en: "Image Resizer",      ko: "이미지 리사이즈",   ja: "画像リ사이ズ",      es: "Redimensionar",    zh: "调整图片",  fr: "Redimensionner", query: "Image Resizer" },
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
    { icon: Zap,          value: `${formatCount(totalUsage, locale)}+`, label: locale === "ko" ? "누적 도구 실행" : "Total Uses" },
    { icon: Boxes,        value: "30+",   label: t("hero.stats.tools") },
    { icon: ShieldCheck,  value: "100%",  label: t("hero.stats.browser") },
    { icon: CheckCircle2, value: "0",     label: t("hero.stats.signup") },
  ];

  return (
    <section
      style={{
        backgroundColor: "var(--colors-canvas)",
        padding: "64px 24px 48px",
        textAlign: "center",
        borderBottom: "1px solid var(--colors-hairline)",
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        {/* Uppercase Eyebrow Tag (Tracking 2.52px, Electric Green) */}
        <div style={{ marginBottom: "18px" }}>
          <span className="eyebrow-mono font-mono">
            {t("hero.badge")}
          </span>
        </div>

        {/* Hero Headline: 60px / 400 regular / -0.65px tracking */}
        <h1
          className="display-xl"
          style={{
            marginBottom: "20px",
          }}
        >
          <span>{t("hero.title1")}</span>{" "}
          <span style={{ color: "var(--colors-primary)" }}>{t("hero.title2")}</span>
        </h1>

        {/* Lead Body Copy */}
        <p
          className="body-lg"
          style={{
            maxWidth: "680px",
            margin: "0 auto 36px",
          }}
        >
          {t("hero.subtitle")}
        </p>

        {/* Command Search Box (6px radius, Electric Green CTA) */}
        <div style={{ maxWidth: "640px", margin: "0 auto 28px", position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--colors-canvas-soft)",
              border: "1px solid var(--colors-hairline)",
              borderRadius: "6px",
              padding: "4px",
              transition: "border-color 0.15s ease",
            }}
          >
            <div style={{ padding: "0 12px", display: "flex", alignItems: "center", color: "var(--colors-primary)" }}>
              <Search size={18} />
            </div>
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={t("hero.search.placeholder")}
              className="text-input"
              style={{
                border: "none",
                background: "transparent",
                padding: "10px 8px",
                fontSize: "15px",
                color: "var(--colors-ink-strong)",
              }}
              aria-label={t("hero.search.placeholder")}
            />
            <button
              onClick={() => onSearch(query)}
              className="button-primary"
              style={{
                padding: "9px 18px",
                fontSize: "14px",
                flexShrink: 0,
              }}
              aria-label={t("hero.search.button")}
            >
              <span>{t("hero.search.button")}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Popular Tags Cluster (Pill Tags with 9999px radius) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "48px",
          }}
        >
          <span className="caption font-mono" style={{ color: "var(--colors-mute)", marginRight: "4px" }}>
            POPULAR:
          </span>
          {POPULAR_TAGS.map((tag) => {
            const label = tag[locale as keyof typeof tag] || tag.en;
            const isSelected = query.toLowerCase() === tag.query.toLowerCase();
            return (
              <button
                key={tag.query}
                onClick={() => handleTagClick(tag.query)}
                className={`button-pill-tag ${isSelected ? "active" : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 4-Item Engineering Metric Counters (8px radius hairline cards) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            maxWidth: "880px",
            margin: "0 auto",
          }}
        >
          {STATS_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card-feature"
                style={{
                  padding: "16px 20px",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <Icon size={16} color="var(--colors-primary)" />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "var(--colors-ink-strong)",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
                <span className="caption font-mono" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
