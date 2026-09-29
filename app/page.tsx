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

        <section className="product-tile-light" aria-label={t("grid.allTools")}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            {/* Active search header */}
            {isSearching && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
                <h2 className="apple-body-strong" style={{ color: "var(--colors-ink)" }}>
                  {t("grid.searchLabel")} &quot;{searchQuery}&quot;
                </h2>
                <button
                  onClick={() => handleSearch("")}
                  className="button-secondary-pill"
                  style={{ padding: "6px 16px", fontSize: "14px" }}
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
          </div>
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
