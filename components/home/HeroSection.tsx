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
    { icon: CheckCircle2, value: "FREE", label: t("hero.stats.signup") },
  ];

  return (
    <section
      style={{
        position: "relative",
        padding: "72px 24px 52px",
        textAlign: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Uppercase Eyebrow Glow Pill */}
        <div style={{ marginBottom: "22px" }}>
          <span className="eyebrow-pill font-mono">
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#00d992",
                boxShadow: "0 0 8px #00d992",
                display: "inline-block",
              }}
            />
            {t("hero.badge")}
          </span>
        </div>

        {/* Hero Headline: Gradient White + Electric Neon Glow */}
        <h1
          className="display-xl"
          style={{
            marginBottom: "20px",
          }}
        >
          <span className="hero-gradient-title">{t("hero.title1")}</span>{" "}
          <span className="hero-neon-accent">{t("hero.title2")}</span>
        </h1>

        {/* Lead Body Copy */}
        <p
          className="body-lg"
          style={{
            maxWidth: "680px",
            margin: "0 auto 38px",
          }}
        >
          {t("hero.subtitle")}
        </p>

        {/* Raycast-Style Command Search Box */}
        <div style={{ maxWidth: "660px", margin: "0 auto 28px", position: "relative" }}>
          <div className="raycast-search-bar">
            <div style={{ display: "flex", alignItems: "center", color: "#00d992", marginRight: "12px", flexShrink: 0 }}>
              <Search size={18} strokeWidth={2.2} />
            </div>
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={locale === "ko" ? "도구 검색 — PDF 합치기, 리사이즈, JSON 포매터..." : "Search tools — PDF merge, Resize, JSON..."}
              className="text-input"
              style={{
                fontSize: "15px",
                minWidth: 0,
              }}
              aria-label={t("hero.search.placeholder")}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <span className="code-text hidden sm:inline-block" style={{ fontSize: "11px", color: "var(--colors-mute)", padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.08)" }}>
                /
              </span>
              <button
                onClick={() => onSearch(query)}
                className="button-primary"
                style={{
                  padding: "9px 18px",
                  fontSize: "13.5px",
                }}
                aria-label={t("hero.search.button")}
              >
                <span>{t("hero.search.button")}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Popular Tags Cluster (Pill Tags) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "44px",
          }}
        >
          <span className="caption font-mono" style={{ color: "var(--colors-mute)", marginRight: "4px", fontSize: "11.5px" }}>
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
                style={{ fontSize: "12px", padding: "4px 12px" }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 4-Item Glassmorphic Metric Counters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            maxWidth: "880px",
            margin: "0 auto",
          }}
          className="hero-stats-grid-mobile"
        >
          {STATS_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="metric-card-neo"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <Icon size={14} color="#00d992" />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
                <span className="caption font-mono" style={{ textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "11px", color: "var(--colors-mute)" }}>
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
