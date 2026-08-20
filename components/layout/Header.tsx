"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, Globe, Sun, Moon, ChevronDown, Zap, X } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { useTheme } from "@/lib/context/ThemeContext";
import type { Locale } from "@/lib/i18n";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English",  flag: "🇺🇸" },
  { code: "ko", label: "한국어",   flag: "🇰🇷" },
  { code: "ja", label: "日本語",   flag: "🇯🇵" },
  { code: "es", label: "Español",  flag: "🇪🇸" },
  { code: "zh", label: "中文",     flag: "🇨🇳" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export default function Header({ onSearch }: HeaderProps) {
  const { locale, setLocale, t } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const handleSearch = useCallback(
    (val: string) => {
      setSearchQuery(val);
      onSearch?.(val);
    },
    [onSearch]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    onSearch?.("");
  }, [onSearch]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--header-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* ── Logo ──────────────────────────────────────── */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}
          aria-label="desktools.run home"
        >
          <div
            style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <Zap size={16} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.3px" }}>
            <span className="gradient-text">desktools</span>
            <span style={{ color: "var(--text-muted)" }}>.run</span>
          </span>
        </Link>

        {/* ── Center Search (desktop) ───────────────────── */}
        <div style={{ flex: 1, maxWidth: "480px", margin: "0 auto" }} className="hidden-mobile">
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={15}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
            />
            <input
              id="header-search"
              type="search"
              placeholder={t("header.search.placeholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
              style={{ width: "100%", padding: "8px 36px 8px 36px", fontSize: "13.5px" }}
              aria-label={t("header.search.placeholder")}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "2px" }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Right Controls ────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto", flexShrink: 0 }}>
          {/* Language Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              id="lang-toggle"
              onClick={() => setLangOpen((o) => !o)}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                background: "var(--btn-secondary-bg)", border: "1px solid var(--btn-secondary-border)",
                borderRadius: "8px", padding: "6px 10px", cursor: "pointer",
                color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, transition: "all 0.2s",
              }}
              aria-label="Select language"
              aria-expanded={langOpen}
            >
              <Globe size={14} />
              <span>{activeLang.flag} {activeLang.code.toUpperCase()}</span>
              <ChevronDown size={12} style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>

            {langOpen && (
              <div
                style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                  borderRadius: "12px", padding: "6px", minWidth: "160px",
                  boxShadow: "var(--shadow-card)", zIndex: 100,
                }}
                role="listbox"
                aria-label="Language options"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code); // ← 전역 언어 변경
                      setLangOpen(false);
                    }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "8px",
                      padding: "8px 10px", borderRadius: "8px",
                      background: locale === lang.code ? "rgba(99,102,241,0.15)" : "transparent",
                      border: "none", cursor: "pointer",
                      color: locale === lang.code ? "#a5b4fc" : "var(--text-secondary)",
                      fontSize: "13px", fontWeight: locale === lang.code ? 600 : 400,
                      textAlign: "left", transition: "background 0.15s",
                    }}
                    role="option"
                    aria-selected={locale === lang.code}
                  >
                    <span style={{ fontSize: "16px" }}>{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark/Light Toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            style={{
              width: "36px", height: "36px", borderRadius: "8px",
              background: "var(--btn-secondary-bg)", border: "1px solid var(--btn-secondary-border)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: isDark ? "#fbbf24" : "#818cf8", transition: "all 0.2s",
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* ── Mobile search bar ─────────────────────────── */}
      <div className="mobile-search" style={{ display: "none", padding: "0 16px 12px" }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            type="search"
            placeholder={t("header.search.placeholder")}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
            style={{ width: "100%", padding: "9px 36px", fontSize: "14px" }}
            aria-label="Search tools mobile"
          />
        </div>
      </div>

      {langOpen && (
        <div onClick={() => setLangOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} aria-hidden="true" />
      )}

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .mobile-search { display: block !important; }
        }
      `}</style>
    </header>
  );
}
