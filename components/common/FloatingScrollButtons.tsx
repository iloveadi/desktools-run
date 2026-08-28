"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function FloatingScrollButtons() {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Show top button if scrolled down more than 200px
      setShowTop(scrollY > 200);

      // Show bottom button if there is more than 300px to scroll down
      setShowBottom(scrollHeight - (scrollY + clientHeight) > 250);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  // If page is too short to scroll at all, don't render
  if (!showTop && !showBottom) return null;

  return (
    <aside
      aria-label="페이지 스크롤 제어"
      style={{
        position: "fixed",
        right: "24px",
        bottom: "28px",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        pointerEvents: "none", // Let container be click-through, buttons clickable
      }}
    >
      {/* Scroll to Top */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로 이동 (Scroll to Top)"
        title="맨 위로 이동"
        style={{
          pointerEvents: showTop ? "auto" : "none",
          opacity: showTop ? 1 : 0,
          transform: showTop ? "scale(1) translateY(0)" : "scale(0.8) translateY(10px)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "var(--bg-glass-card, rgba(30, 41, 59, 0.85))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--border-hover, rgba(255, 255, 255, 0.15))",
          color: "var(--text-primary, #ffffff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--brand-mid, #6366f1)";
          e.currentTarget.style.color = "var(--brand-mid, #6366f1)";
          e.currentTarget.style.transform = "scale(1.08) translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-hover, rgba(255, 255, 255, 0.15))";
          e.currentTarget.style.color = "var(--text-primary, #ffffff)";
          e.currentTarget.style.transform = "scale(1) translateY(0)";
        }}
      >
        <ChevronUp size={22} strokeWidth={2.5} />
      </button>

      {/* Scroll to Bottom */}
      <button
        type="button"
        onClick={scrollToBottom}
        aria-label="맨 아래로 이동 (Scroll to Bottom)"
        title="맨 아래로 이동"
        style={{
          pointerEvents: showBottom ? "auto" : "none",
          opacity: showBottom ? 1 : 0,
          transform: showBottom ? "scale(1) translateY(0)" : "scale(0.8) translateY(-10px)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "var(--bg-glass-card, rgba(30, 41, 59, 0.85))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--border-hover, rgba(255, 255, 255, 0.15))",
          color: "var(--text-primary, #ffffff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--brand-mid, #6366f1)";
          e.currentTarget.style.color = "var(--brand-mid, #6366f1)";
          e.currentTarget.style.transform = "scale(1.08) translateY(2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-hover, rgba(255, 255, 255, 0.15))";
          e.currentTarget.style.color = "var(--text-primary, #ffffff)";
          e.currentTarget.style.transform = "scale(1) translateY(0)";
        }}
      >
        <ChevronDown size={22} strokeWidth={2.5} />
      </button>
    </aside>
  );
}
