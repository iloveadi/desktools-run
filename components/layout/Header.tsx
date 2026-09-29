"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown, Zap, Terminal, Activity } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import type { Locale } from "@/lib/i18n";
import { getTotalSiteUsageCount, formatCount } from "@/lib/stats";
import CommandPaletteModal from "@/components/common/CommandPaletteModal";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

// Country flags
const FlagUS = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" style={{ borderRadius: "2px", flexShrink: 0 }}>
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

const FlagKR = () => (
  <svg width="18" height="13" viewBox="0 0 36 24" style={{ borderRadius: "2px", flexShrink: 0, background: "#ffffff" }}>
    <rect width="36" height="24" fill="#ffffff"/>
    <g transform="translate(18 12)">
      <g transform="rotate(-33.69)">
        <path fill="#cd2e3a" d="M 0,-6 A 6,6 0 0,1 0,6 A 3,3 0 0,1 0,0 A 3,3 0 0,0 0,-6 Z"/>
        <path fill="#0047a0" d="M 0,6 A 6,6 0 0,1 0,-6 A 3,3 0 0,1 0,0 A 3,3 0 0,0 0,6 Z"/>
      </g>
      <g transform="rotate(-33.69) translate(-9.5 0)" fill="#000000">
        <rect x="-0.4" y="-3" width="0.5" height="6"/><rect x="-1.2" y="-3" width="0.5" height="6"/><rect x="-2.0" y="-3" width="0.5" height="6"/>
      </g>
      <g transform="rotate(-33.69) translate(9.5 0)" fill="#000000">
        <path d="M0.4-3h0.5v2.7H0.4zm0 3.3h0.5v2.7H0.4z"/><path d="M1.2-3h0.5v2.7H1.2zm0 3.3h0.5v2.7H1.2z"/><path d="M2.0-3h0.5v2.7H2.0zm0 3.3h0.5v2.7H2.0z"/>
      </g>
      <g transform="rotate(33.69) translate(9.5 0)" fill="#000000">
        <path d="M0.4-3h0.5v2.7H0.4zm0 3.3h0.5v2.7H0.4z"/><rect x="1.2" y="-3" width="0.5" height="6"/><path d="M2.0-3h0.5v2.7H2.0zm0 3.3h0.5v2.7H2.0z"/>
      </g>
      <g transform="rotate(33.69) translate(-9.5 0)" fill="#000000">
        <rect x="-0.4" y="-3" width="0.5" height="6"/><path d="M-1.2-3h0.5v2.7h-0.5zm0 3.3h0.5v2.7h-0.5z"/><rect x="-2.0" y="-3" width="0.5" height="6"/>
      </g>
    </g>
  </svg>
);

const FlagJP = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" style={{ borderRadius: "2px", flexShrink: 0 }}>
    <path fill="#fff" d="M0 0h640v480H0z"/>
    <circle cx="320" cy="240" r="144" fill="#bc002d"/>
  </svg>
);

const FlagES = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" style={{ borderRadius: "2px", flexShrink: 0 }}>
    <path fill="#c60b1e" d="M0 0h640v480H0z"/>
    <path fill="#ffc400" d="M0 120h640v240H0z"/>
  </svg>
);

const FlagCN = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" style={{ borderRadius: "2px", flexShrink: 0 }}>
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
  <svg width="18" height="13" viewBox="0 0 640 480" style={{ borderRadius: "2px", flexShrink: 0 }}>
    <path fill="#002654" d="M0 0h213.3v480H0z"/>
    <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
    <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
  </svg>
);

const LANGUAGES: { code: Locale; label: string; Flag: () => React.JSX.Element }[] = [
  { code: "ko", label: "한국어", Flag: FlagKR },
  { code: "en", label: "English", Flag: FlagUS },
  { code: "ja", label: "日本語", Flag: FlagJP },
  { code: "es", label: "Español", Flag: FlagES },
  { code: "zh", label: "中文", Flag: FlagCN },
  { code: "fr", label: "Français", Flag: FlagFR },
];

export default function Header({ onSearch }: HeaderProps) {
  const { locale, setLocale, t } = useLocale();
  const [langOpen, setLangOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [liveUsers, setLiveUsers] = useState(38);
  const [totalUsage, setTotalUsage] = useState(5417);

  useEffect(() => {
    setTotalUsage(getTotalSiteUsageCount());
    const interval = setInterval(() => {
      setLiveUsers((prev) => Math.min(65, Math.max(25, prev + Math.floor(Math.random() * 5) - 2)));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];
  const ActiveFlag = currentLang.Flag;

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(9, 10, 15, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          height: "60px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            width: "100%",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          {/* Brand Logo with Electric Green Glow Lightning */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "17.5px",
              letterSpacing: "-0.4px",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, rgba(0, 217, 146, 0.25) 0%, rgba(0, 217, 146, 0.05) 100%)",
                border: "1px solid rgba(0, 217, 146, 0.4)",
                boxShadow: "0 0 12px rgba(0, 217, 146, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={15} color="#00d992" fill="#00d992" />
            </div>
            <span>desktools<span style={{ color: "#00d992" }}>.run</span></span>
          </Link>

          {/* Navigation links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            <Link
              href="/tools"
              style={{ color: "var(--colors-body)", textDecoration: "none", fontSize: "14px", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--colors-ink-strong)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--colors-body)")}
            >
              All Utilities
            </Link>
            <Link
              href="/blog"
              style={{ color: "var(--colors-body)", textDecoration: "none", fontSize: "14px", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--colors-ink-strong)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--colors-body)")}
            >
              Blog
            </Link>
            <Link
              href="/about"
              style={{ color: "var(--colors-body)", textDecoration: "none", fontSize: "14px", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--colors-ink-strong)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--colors-body)")}
            >
              About
            </Link>
          </nav>

          {/* Right Utility Cluster */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Live Indicator Status Pill (Hidden on mobile) */}
            <div
              className="button-pill-tag hidden md:inline-flex"
              style={{ cursor: "default", padding: "4px 10px", fontSize: "12px" }}
              title={`Total ${totalUsage.toLocaleString()} executions`}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--colors-primary)",
                  display: "inline-block",
                  boxShadow: "0 0 8px var(--colors-primary)",
                }}
              />
              <span style={{ color: "var(--colors-body)" }}>{liveUsers} live</span>
            </div>

            {/* Quick Command / Search Button */}
            <button
              onClick={() => setCmdOpen(true)}
              className="button-outline-on-dark"
              style={{ padding: "6px 10px", fontSize: "13px" }}
              aria-label="Search tools"
            >
              <Search size={14} color="var(--colors-primary)" />
              <span className="hidden sm:inline">Search</span>
              <span className="code-text hidden sm:inline" style={{ fontSize: "11px", color: "var(--colors-mute)", marginLeft: "4px" }}>⌘K</span>
            </button>

            {/* Language Selector Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                id="lang-toggle"
                onClick={() => setLangOpen((o) => !o)}
                className="button-outline-on-dark"
                style={{ padding: "6px 8px" }}
                aria-label="Select language"
                aria-expanded={langOpen}
              >
                <ActiveFlag />
                <ChevronDown
                  size={11}
                  color="var(--colors-mute)"
                  style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                />
              </button>

              {langOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 6px)",
                    backgroundColor: "var(--colors-canvas-soft)",
                    border: "1px solid var(--colors-hairline)",
                    borderRadius: "6px",
                    padding: "4px",
                    minWidth: "140px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    zIndex: 100,
                  }}
                  role="listbox"
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
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          background: isSelected ? "rgba(0, 217, 146, 0.15)" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: isSelected ? "var(--colors-primary)" : "var(--colors-ink)",
                          fontSize: "13px",
                          textAlign: "left",
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

            {/* Primary Action Button (Compact on mobile) */}
            <Link
              href="/request"
              className="button-primary"
              style={{ padding: "6px 12px", fontSize: "12.5px" }}
            >
              <span className="hidden sm:inline">Request Tool</span>
              <span className="sm:hidden">Request</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPaletteModal isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
