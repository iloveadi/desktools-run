"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Search, Sun, Moon, ChevronDown, Zap, X, Activity, Command } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { useTheme } from "@/lib/context/ThemeContext";
import type { Locale } from "@/lib/i18n";
import { getTotalSiteUsageCount, formatCount } from "@/lib/stats";
import CommandPaletteModal from "@/components/common/CommandPaletteModal";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

// ── SVG Country Flag Components (Standard National Flag Specifications) ──
const FlagUS = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" style={{ borderRadius: "2px", flexShrink: 0, boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
    <path fill="#bd3d44" d="M0 0h640v480H0z"/>
    <path stroke="#fff" strokeWidth="37" d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640"/>
    <path fill="#192f5d" d="M0 0h285v259H0z"/>
    <g fill="#fff">
      <circle cx="28" cy="24" r="6"/><circle cx="85" cy="24" r="6"/><circle cx="142" cy="24" r="6"/><circle cx="199" cy="24" r="6"/><circle cx="256" cy="24" r="6"/>
      <circle cx="56" cy="48" r="6"/><circle cx="113" cy="48" r="6"/><circle cx="170" cy="48" r="6"/><circle cx="227" cy="48" r="6"/>
      <circle cx="28" cy="72" r="6"/><circle cx="85" cy="72" r="6"/><circle cx="142" cy="72" r="6"/><circle cx="199" cy="72" r="6"/><circle cx="256" cy="72" r="6"/>
      <circle cx="56" cy="96" r="6"/><circle cx="113" cy="96" r="6"/><circle cx="170" cy="96" r="6"/><circle cx="227" cy="96" r="6"/>
      <circle cx="28" cy="120" r="6"/><circle cx="85" cy="120" r="6"/><circle cx="142" cy="120" r="6"/><circle cx="199" cy="120" r="6"/><circle cx="256" cy="120" r="6"/>
      <circle cx="56" cy="144" r="6"/><circle cx="113" cy="144" r="6"/><circle cx="170" cy="144" r="6"/><circle cx="227" cy="144" r="6"/>
      <circle cx="28" cy="168" r="6"/><circle cx="85" cy="168" r="6"/><circle cx="142" cy="168" r="6"/><circle cx="199" cy="168" r="6"/><circle cx="256" cy="168" r="6"/>
      <circle cx="56" cy="192" r="6"/><circle cx="113" cy="192" r="6"/><circle cx="170" cy="192" r="6"/><circle cx="227" cy="192" r="6"/>
      <circle cx="28" cy="216" r="6"/><circle cx="85" cy="216" r="6"/><circle cx="142" cy="216" r="6"/><circle cx="199" cy="216" r="6"/><circle cx="256" cy="216" r="6"/>
    </g>
  </svg>
);

// 대한민국 국기법 규격 표준 정밀 태극기 (대한민국 태극기 표준 비율 & 건곤감리 괘)
const FlagKR = () => (
  <svg width="18" height="13" viewBox="0 0 36 24" style={{ borderRadius: "2px", flexShrink: 0, border: "1px solid rgba(0,0,0,0.15)", background: "#ffffff" }}>
    <rect width="36" height="24" fill="#ffffff"/>
    <g transform="translate(18 12)">
      {/* 태극문양: 상단 빨강(#cd2e3a), 하단 파랑(#0047a0) 대각선 -33.69도 기울임 */}
      <g transform="rotate(-33.69)">
        <path fill="#cd2e3a" d="M 0,-6 A 6,6 0 0,1 0,6 A 3,3 0 0,1 0,0 A 3,3 0 0,0 0,-6 Z"/>
        <path fill="#0047a0" d="M 0,6 A 6,6 0 0,1 0,-6 A 3,3 0 0,1 0,0 A 3,3 0 0,0 0,6 Z"/>
      </g>
      
      {/* 4괘: 건(☰ 11시), 곤(☷ 5시), 감(☵ 1시), 리(☲ 7시) */}
      <g transform="rotate(-33.69) translate(-9.5 0)" fill="#000000">
        <rect x="-0.4" y="-3" width="0.5" height="6"/>
        <rect x="-1.2" y="-3" width="0.5" height="6"/>
        <rect x="-2.0" y="-3" width="0.5" height="6"/>
      </g>
      
      <g transform="rotate(-33.69) translate(9.5 0)" fill="#000000">
        <path d="M0.4-3h0.5v2.7H0.4zm0 3.3h0.5v2.7H0.4z"/>
        <path d="M1.2-3h0.5v2.7H1.2zm0 3.3h0.5v2.7H1.2z"/>
        <path d="M2.0-3h0.5v2.7H2.0zm0 3.3h0.5v2.7H2.0z"/>
      </g>

      <g transform="rotate(33.69) translate(9.5 0)" fill="#000000">
        <path d="M0.4-3h0.5v2.7H0.4zm0 3.3h0.5v2.7H0.4z"/>
        <rect x="1.2" y="-3" width="0.5" height="6"/>
        <path d="M2.0-3h0.5v2.7H2.0zm0 3.3h0.5v2.7H2.0z"/>
      </g>

      <g transform="rotate(33.69) translate(-9.5 0)" fill="#000000">
        <rect x="-0.4" y="-3" width="0.5" height="6"/>
        <path d="M-1.2-3h0.5v2.7h-0.5zm0 3.3h0.5v2.7h-0.5z"/>
        <rect x="-2.0" y="-3" width="0.5" height="6"/>
      </g>
    </g>
  </svg>
);

const FlagJP = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" style={{ borderRadius: "2px", flexShrink: 0, boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
    <path fill="#fff" d="M0 0h640v480H0z"/>
    <circle cx="320" cy="240" r="144" fill="#bc002d"/>
  </svg>
);

const FlagES = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" style={{ borderRadius: "2px", flexShrink: 0, boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
    <path fill="#c60b1e" d="M0 0h640v480H0z"/>
    <path fill="#ffc400" d="M0 120h640v240H0z"/>
  </svg>
);

const FlagCN = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" style={{ borderRadius: "2px", flexShrink: 0, boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
    <path fill="#ee1c25" d="M0 0h640v480H0z"/>
    <g fill="#ffde00">
      <polygon points="100,60 112,96 150,96 119,118 131,154 100,132 69,154 81,118 50,96 88,96"/>
      <polygon points="166,32 173,46 188,44 177,54 182,68 170,59 157,67 163,53 152,43 167,44"/>
      <polygon points="200,70 203,85 218,87 205,95 208,110 197,100 183,107 191,93 181,83 196,85"/>
      <polygon points="200,130 208,143 223,141 212,151 217,165 205,156 192,164 198,150 187,140 202,141"/>
      <polygon points="166,170 167,185 182,189 169,196 171,211 160,200 146,206 155,193 145,182 160,185"/>
    </g>
  </svg>
);

const FlagFR = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" style={{ borderRadius: "2px", flexShrink: 0, boxShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
    <path fill="#002395" d="M0 0h213.3v480H0z"/>
    <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
    <path fill="#ed2939" d="M426.7 0H640v480H426.7z"/>
  </svg>
);

const LANGUAGES: { code: Locale; label: string; Flag: React.FC }[] = [
  { code: "ko", label: "한국어",   Flag: FlagKR },
  { code: "en", label: "English",  Flag: FlagUS },
  { code: "ja", label: "日本語",   Flag: FlagJP },
  { code: "es", label: "Español",  Flag: FlagES },
  { code: "zh", label: "中文",     Flag: FlagCN },
  { code: "fr", label: "Français", Flag: FlagFR },
];

export default function Header({ onSearch }: HeaderProps) {
  const { locale, setLocale, t } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [totalUsage, setTotalUsage] = useState<number>(5417);
  const [liveUsers, setLiveUsers] = useState<number>(35);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    setTotalUsage(getTotalSiteUsageCount());

    const interval = setInterval(() => {
      setLiveUsers(32 + Math.floor(Math.random() * 8));
      setTotalUsage(getTotalSiteUsageCount());
    }, 4000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activeLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];
  const ActiveFlag = activeLang.Flag;

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
              background: "linear-gradient(135deg, #4f46e5, #6366f1, #06b6d4)",
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

        {/* ── Live Usage & Visitor Counter Pill ──────────── */}
        <div
          className="header-stats-pill"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 12px",
            borderRadius: "100px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.22)",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginLeft: "8px",
            cursor: "default",
            userSelect: "none",
          }}
          title={locale === "ko" ? `전체 ${totalUsage.toLocaleString()}회 이용됨` : `Total ${totalUsage.toLocaleString()} uses`}
        >
          <span style={{ display: "inline-flex", position: "relative", width: "7px", height: "7px" }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10b981", opacity: 0.75, animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
            <span style={{ position: "relative", width: "7px", height: "7px", borderRadius: "50%", background: "#10b981" }} />
          </span>
          <span style={{ color: "var(--text-secondary)", fontSize: "11.5px" }}>
            {liveUsers} {locale === "ko" ? "명 접속 중" : "live"}
          </span>
          <span style={{ color: "rgba(255,255,255,0.18)" }}>|</span>
          <span style={{ fontWeight: 700, color: "#34d399", display: "flex", alignItems: "center", gap: "3px" }}>
            <Activity size={12} color="#34d399" />
            {formatCount(totalUsage, locale)} {locale === "ko" ? "회 이용" : "uses"}
          </span>
        </div>

        {/* ── Right Controls ────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto", flexShrink: 0 }}>
          {/* Quick Search Shortcut Trigger Button (Ctrl + K) */}
          <button
            onClick={() => setCmdOpen(true)}
            className="header-search-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--btn-secondary-bg)",
              border: "1px solid var(--btn-secondary-border)",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
              color: "var(--text-primary)",
              fontSize: "12.5px",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            title="도구 빠른 검색 (Ctrl + K / ⌘K)"
          >
            <Search size={14} style={{ color: "#818cf8" }} />
            <span style={{ display: "none" }} className="sm-inline">검색</span>
            <kbd
              className="header-search-kbd"
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                color: "var(--text-secondary)",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid var(--border-subtle)",
                padding: "1px 5px",
                borderRadius: "4px",
              }}
            >
              Ctrl K
            </kbd>
          </button>

          {/* Language Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              id="lang-toggle"
              className="header-lang-btn"
              onClick={() => setLangOpen((o) => !o)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "var(--btn-secondary-bg)", border: "1px solid var(--btn-secondary-border)",
                borderRadius: "8px", padding: "6px 10px", cursor: "pointer",
                color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, transition: "all 0.2s",
              }}
              aria-label="Select language"
              aria-expanded={langOpen}
            >
              <ActiveFlag />
              <span className="hidden sm:inline">{activeLang.label}</span>
              <ChevronDown size={12} style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>

            {langOpen && (
              <div
                style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                  borderRadius: "12px", padding: "6px", minWidth: "150px",
                  boxShadow: "var(--shadow-card)", zIndex: 100,
                }}
                role="listbox"
                aria-label="Language options"
              >
                {LANGUAGES.map((lang) => {
                  const ItemFlag = lang.Flag;
                  const isSelected = locale === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code);
                        setLangOpen(false);
                      }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 12px", borderRadius: "8px",
                        background: isSelected ? "rgba(99,102,241,0.15)" : "transparent",
                        border: "none", cursor: "pointer",
                        color: isSelected ? "var(--brand-mid)" : "var(--text-primary)",
                        fontSize: "13px", fontWeight: isSelected ? 700 : 500,
                        textAlign: "left", transition: "background 0.15s",
                      }}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <ItemFlag />
                      <span>{lang.label}</span>
                    </button>
                  );
                })}
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
              color: isDark ? "#fbbf24" : "#4f46e5", transition: "all 0.2s",
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {langOpen && (
        <div onClick={() => setLangOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} aria-hidden="true" />
      )}

      {/* Global Command Palette Modal */}
      <CommandPaletteModal isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </header>
  );
}
