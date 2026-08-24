"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { TOOLS, getLocalizedTool, getLocalizedCategory } from "@/lib/tools";
import { useLocale } from "@/lib/context/LocaleContext";
import { Search, Grid, ArrowRight } from "lucide-react";

export default function ToolsCatalogPage() {
  const { t, locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "PDF Tools", "Image Tools", "Dev Tools", "Converter", "Text & Formatting", "Security"];

  const activeTools = TOOLS.filter((tool) => !tool.isDev);

  const localizedTools = activeTools.map((tool) => getLocalizedTool(tool, locale));

  const filteredTools = localizedTools.filter((tool) => {
    const originalTool = activeTools.find((t) => t.id === tool.id);
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (originalTool && originalTool.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "All" || (originalTool && originalTool.category === selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(99,102,241,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
              }}
            >
              <Grid size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("pages.tools.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {t("pages.tools.subtitle")}
          </p>
        </section>

        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 32px" }}>
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "280px", flex: 1, maxWidth: "420px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder={
                  locale === "ko"
                    ? "도구 검색..."
                    : locale === "ja"
                    ? "ツールを検索..."
                    : locale === "es"
                    ? "Buscar herramientas..."
                    : locale === "zh"
                    ? "搜索实用工具..."
                    : locale === "fr"
                    ? "Rechercher un outil..."
                    : "Search all tools..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "10px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  padding: "0 14px 0 40px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "100px",
                    background:
                      selectedCategory === cat
                        ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                        : "rgba(255,255,255,0.05)",
                    border: selectedCategory === cat ? "none" : "1px solid var(--border-subtle)",
                    color: selectedCategory === cat ? "white" : "var(--text-secondary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {getLocalizedCategory(cat, locale)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {filteredTools.length === 0 ? (
            <div className="glass-card" style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
              {locale === "ko"
                ? "검색 조건에 맞는 도구가 없습니다."
                : locale === "ja"
                ? "検索条件に一致するツールが見つかりません。"
                : locale === "es"
                ? "No hay herramientas que coincidan con la búsqueda."
                : locale === "zh"
                ? "没有符合搜索条件的工具。"
                : locale === "fr"
                ? "Aucun outil ne correspond à votre recherche."
                : "No tools match your search criteria."}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {filteredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="glass-card"
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                    textDecoration: "none",
                    transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#818cf8",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "rgba(99,102,241,0.12)",
                        }}
                      >
                        {getLocalizedCategory(tool.category, locale)}
                      </span>
                      {tool.badge && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#f43f5e",
                            padding: "2px 8px",
                            borderRadius: "100px",
                            background: "rgba(244,63,94,0.12)",
                          }}
                        >
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                      {tool.title}
                    </h3>
                    <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                      {tool.description}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#818cf8" }}>
                    {locale === "ko"
                      ? "도구 열기"
                      : locale === "ja"
                      ? "ツールを開く"
                      : locale === "es"
                      ? "Abrir herramienta"
                      : locale === "zh"
                      ? "打开工具"
                      : locale === "fr"
                      ? "Ouvrir l'outil"
                      : "Open Tool"}{" "}
                    <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
