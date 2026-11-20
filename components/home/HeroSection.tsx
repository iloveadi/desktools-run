"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Search,
  Zap,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Type,
  Code2,
  ArrowLeftRight,
} from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { getTotalSiteUsageCount, formatCount } from "@/lib/stats";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onSelectCategory?: (category: string) => void;
}

const CATEGORY_SHORTCUTS = [
  {
    id: "PDF Tools",
    icon: FileText,
    label: { ko: "PDF 도구", en: "PDF Tools", ja: "PDFツール", es: "Herramientas PDF", zh: "PDF工具", fr: "Outils PDF" },
    count: 6,
  },
  {
    id: "Image Tools",
    icon: ImageIcon,
    label: { ko: "이미지 도구", en: "Image Tools", ja: "画像ツール", es: "Herramientas Imagen", zh: "图像工具", fr: "Outils Image" },
    count: 7,
  },
  {
    id: "Text & Formatting",
    icon: Type,
    label: { ko: "텍스트 & 서식", en: "Text & Formatting", ja: "テキスト整形", es: "Texto & Formato", zh: "文本&格式", fr: "Texte & Format" },
    count: 4,
  },
  {
    id: "Dev Tools",
    icon: Code2,
    label: { ko: "개발자 도구", en: "Dev Tools", ja: "開発者ツール", es: "Herramientas Dev", zh: "开发工具", fr: "Outils Dev" },
    count: 8,
  },
  {
    id: "Converter",
    icon: ArrowLeftRight,
    label: { ko: "변환기", en: "Converter", ja: "コンバーター", es: "Conversor", zh: "转换器", fr: "Convertisseur" },
    count: 3,
  },
  {
    id: "Security",
    icon: ShieldCheck,
    label: { ko: "보안", en: "Security", ja: "セキュリティ", es: "Seguridad", zh: "安全", fr: "Sécurité" },
    count: 2,
  },
];

const POPULAR_TAGS = [
  { en: "PDF Merge",          ko: "PDF 합치기",       ja: "PDFマージ",         es: "Unir PDF",         zh: "合并PDF",   fr: "Fusionner PDF",  query: "PDF Merge" },
  { en: "Word Count",         ko: "단어 및 글자 수 세기", ja: "単語・文字数",     es: "Contar Palabras",  zh: "字数统计",  fr: "Compter Mots",   query: "Word Count" },
  { en: "JSON Formatter",     ko: "JSON 포매터",       ja: "JSONフォーマット",  es: "Formato JSON",     zh: "JSON格式",  fr: "Format JSON",    query: "JSON Formatter" },
  { en: "Image Resizer",      ko: "이미지 리사이즈",   ja: "画像リ사이ズ",      es: "Redimensionar",    zh: "调整图片",  fr: "Redimensionner", query: "Image Resizer" },
  { en: "Password Generator", ko: "비밀번호 생성기",   ja: "パスワード生成",    es: "Contraseña",       zh: "密码生成",  fr: "Mot de Passe",   query: "Password Generator" },
  { en: "Base64",             ko: "Base64",            ja: "Base64",            es: "Base64",           zh: "Base64",   fr: "Base64",          query: "Base64" },
];

export default function HeroSection({ onSearch, onSelectCategory }: HeroSectionProps) {
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

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      if (onSelectCategory) {
        onSelectCategory(categoryId);
      } else {
        onSearch("");
        const target = document.getElementById("tools");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [onSelectCategory, onSearch]
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
        padding: "64px 24px 48px",
        textAlign: "center",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Studio Eyebrow Tag */}
        <div style={{ marginBottom: "18px" }}>
          <span className="eyebrow-pill font-mono">
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--colors-primary)",
                display: "inline-block",
              }}
            />
            {t("hero.badge")}
          </span>
        </div>

        {/* Hero Headline: Studio Warm Gradient + Amber Accent */}
        <h1
          className="display-xl"
          style={{
            marginBottom: "16px",
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
            margin: "0 auto 34px",
            color: "var(--colors-body)",
          }}
        >
          {t("hero.subtitle")}
        </p>

        {/* Studio Precision Search Bar */}
        <div style={{ maxWidth: "660px", margin: "0 auto 28px", position: "relative" }}>
          <div className="raycast-search-bar">
            <div style={{ display: "flex", alignItems: "center", color: "var(--colors-primary)", marginRight: "12px", flexShrink: 0 }}>
              <Search size={18} strokeWidth={2.2} />
            </div>
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={locale === "ko" ? "도구 검색 — PDF 합치기, 이미지 압축, JSON 포매터..." : "Search tools — PDF merge, Image compress, JSON..."}
              className="text-input"
              style={{
                fontSize: "15px",
                minWidth: 0,
              }}
              aria-label={t("hero.search.placeholder")}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <span className="code-text hidden sm:inline-block" style={{ fontSize: "11px", color: "var(--colors-mute)", padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
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

        {/* 6 Category Quick Navigation Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "10px",
            maxWidth: "880px",
            margin: "0 auto 28px",
          }}
          className="hero-categories-grid"
        >
          {CATEGORY_SHORTCUTS.map((cat) => {
            const Icon = cat.icon;
            const catName = cat.label[locale as keyof typeof cat.label] || cat.label.en;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="hero-category-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 10px",
                  borderRadius: "10px",
                  background: "var(--colors-card-surface)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.18s ease",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(217, 119, 6, 0.08)",
                    border: "1px solid rgba(217, 119, 6, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--colors-primary)",
                    transition: "all 0.18s ease",
                  }}
                  className="hero-category-icon"
                >
                  <Icon size={18} />
                </div>
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--colors-ink-strong)",
                      lineHeight: 1.25,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {catName}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--colors-mute)",
                      marginTop: "2px",
                    }}
                  >
                    {cat.count} {locale === "ko" ? "개 도구" : "tools"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Popular Tags: Clean minimalist row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "36px",
          }}
        >
          <span className="caption font-mono" style={{ color: "var(--colors-mute)", marginRight: "4px", fontSize: "11.5px" }}>
            {locale === "ko" ? "인기:" : "POPULAR:"}
          </span>
          {POPULAR_TAGS.map((tag) => {
            const label = tag[locale as keyof typeof tag] || tag.en;
            const isSelected = query.toLowerCase() === tag.query.toLowerCase();
            return (
              <button
                key={tag.query}
                onClick={() => handleTagClick(tag.query)}
                style={{
                  background: isSelected ? "var(--colors-primary)" : "transparent",
                  color: isSelected ? "var(--colors-on-primary)" : "var(--colors-body)",
                  border: isSelected ? "1px solid var(--colors-primary)" : "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  padding: "3px 10px",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "var(--colors-primary)";
                    e.currentTarget.style.color = "var(--colors-ink-strong)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.color = "var(--colors-body)";
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 4-Item Studio Metric Counters */}
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
                  <Icon size={14} color="var(--colors-primary)" />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "var(--colors-ink-strong)",
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
