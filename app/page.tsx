"use client";

import { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import ToolGrid from "@/components/home/ToolGrid";
import HomeFeatureHighlights from "@/components/home/HomeFeatureHighlights";
import HomeCategoryOverview from "@/components/home/HomeCategoryOverview";
import HomeBlogSection from "@/components/home/HomeBlogSection";
import HomeFaqSection from "@/components/home/HomeFaqSection";
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

        <section
          style={{
            backgroundColor: "var(--colors-canvas)",
            padding: "48px 24px 80px",
          }}
          aria-label={t("grid.allTools")}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            {/* Active search header */}
            {isSearching && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "32px",
                }}
              >
                <h2 className="display-sm" style={{ color: "var(--colors-ink-strong)" }}>
                  {t("grid.searchLabel")} &quot;{searchQuery}&quot;
                </h2>
                <button
                  onClick={() => handleSearch("")}
                  className="button-outline-on-dark"
                  style={{ padding: "6px 14px", fontSize: "13px" }}
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

        {/* Rich Editorial & SEO Content Sections for AdSense & Organic Authority */}
        <HomeFeatureHighlights />
        <HomeCategoryOverview />
        <HomeBlogSection />
        <HomeFaqSection />
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
