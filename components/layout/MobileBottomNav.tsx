"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, LayoutGrid, BookOpen, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";
import { useLocale } from "@/lib/context/LocaleContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent("desktools-open-search"));
  };

  const isHome = pathname === "/" || pathname === "";
  const isTools = pathname?.startsWith("/tools");
  const isBlog = pathname?.startsWith("/blog");

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        background: "var(--header-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border-subtle)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        paddingTop: "6px",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          maxWidth: "500px",
          margin: "0 auto",
          padding: "0 12px",
          height: "54px",
        }}
      >
        {/* 1. Home */}
        <Link
          href="/"
          className="mobile-nav-item"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            textDecoration: "none",
            color: isHome ? "#818cf8" : "var(--text-muted)",
            fontSize: "11px",
            fontWeight: isHome ? 700 : 500,
            transition: "all 0.15s",
            flex: 1,
            padding: "6px 0",
          }}
        >
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "100px",
              background: isHome ? "rgba(99, 102, 241, 0.15)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Home size={19} strokeWidth={isHome ? 2.3 : 1.8} />
          </div>
          <span>{locale === "ko" ? "홈" : "Home"}</span>
        </Link>

        {/* 2. Quick Search */}
        <button
          onClick={handleOpenSearch}
          className="mobile-nav-item"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            color: "var(--text-muted)",
            fontSize: "11px",
            fontWeight: 500,
            transition: "all 0.15s",
            flex: 1,
            padding: "6px 0",
          }}
          aria-label="빠른 검색"
        >
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "100px",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Search size={19} strokeWidth={1.8} />
          </div>
          <span>{locale === "ko" ? "검색" : "Search"}</span>
        </button>

        {/* 3. All Tools */}
        <Link
          href="/tools/"
          className="mobile-nav-item"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            textDecoration: "none",
            color: isTools ? "#818cf8" : "var(--text-muted)",
            fontSize: "11px",
            fontWeight: isTools ? 700 : 500,
            transition: "all 0.15s",
            flex: 1,
            padding: "6px 0",
          }}
        >
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "100px",
              background: isTools ? "rgba(99, 102, 241, 0.15)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LayoutGrid size={19} strokeWidth={isTools ? 2.3 : 1.8} />
          </div>
          <span>{locale === "ko" ? "도구 목록" : "Tools"}</span>
        </Link>

        {/* 4. Blog */}
        <Link
          href="/blog/"
          className="mobile-nav-item"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            textDecoration: "none",
            color: isBlog ? "#818cf8" : "var(--text-muted)",
            fontSize: "11px",
            fontWeight: isBlog ? 700 : 500,
            transition: "all 0.15s",
            flex: 1,
            padding: "6px 0",
          }}
        >
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "100px",
              background: isBlog ? "rgba(99, 102, 241, 0.15)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={19} strokeWidth={isBlog ? 2.3 : 1.8} />
          </div>
          <span>{locale === "ko" ? "블로그" : "Blog"}</span>
        </Link>

        {/* 5. Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="mobile-nav-item"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            color: isDark ? "#fbbf24" : "var(--text-muted)",
            fontSize: "11px",
            fontWeight: 500,
            transition: "all 0.15s",
            flex: 1,
            padding: "6px 0",
          }}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "100px",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isDark ? <Sun size={19} strokeWidth={1.8} /> : <Moon size={19} strokeWidth={1.8} />}
          </div>
          <span>{isDark ? (locale === "ko" ? "라이트" : "Light") : (locale === "ko" ? "다크" : "Dark")}</span>
        </button>
      </div>

      <style>{`
        .mobile-bottom-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: block !important;
          }
          body {
            padding-bottom: 64px !important;
          }
        }
      `}</style>
    </nav>
  );
}
