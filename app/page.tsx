"use client";

import { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import ToolGrid from "@/components/home/ToolGrid";
import { TOOLS, searchTools } from "@/lib/tools";
import { useLocale } from "@/lib/context/LocaleContext";

export default function Home() {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredTools = searchQuery.trim() ? searchTools(searchQuery) : TOOLS;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <>
      <Header onSearch={handleSearch} />

      <main style={{ flex: 1 }}>
        <HeroSection onSearch={handleSearch} />

        <section className="main-tools-section" style={{ maxWidth: "1280px", margin: "0 auto" }} aria-label={t("grid.allTools")}>
          {/* Active search header */}
          {isSearching && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                {t("grid.searchLabel")} &quot;{searchQuery}&quot;
              </h2>
              <button
                onClick={() => handleSearch("")}
                style={{ padding: "6px 14px", borderRadius: "8px", background: "var(--btn-secondary-bg)", border: "1px solid var(--btn-secondary-border)", color: "var(--text-secondary)", fontSize: "12.5px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: 500, transition: "all 0.15s" }}
                aria-label="Clear search"
              >
                {t("grid.showAll")}
              </button>
            </div>
          )}

          <ToolGrid
            tools={filteredTools}
            isSearching={isSearching}
            onCategorySearch={handleSearch}
          />
        </section>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 640px) {
          .cat-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
