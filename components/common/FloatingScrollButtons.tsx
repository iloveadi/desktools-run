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

      // Show top button if scrolled down more than 180px
      setShowTop(scrollY > 180);

      // Show bottom button if there is more than 200px remaining
      setShowBottom(scrollHeight - (scrollY + clientHeight) > 200);
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

  if (!showTop && !showBottom) return null;

  return (
    <div
      aria-label="페이지 스크롤 제어"
      style={{
        position: "fixed",
        right: "24px",
        bottom: "28px",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: "9999px",
        background: "rgba(14, 15, 23, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(99, 102, 241, 0.25)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(99, 102, 241, 0.2)",
        padding: "4px",
        gap: "2px",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Scroll to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        disabled={!showTop}
        aria-label="맨 위로 이동 (Scroll to Top)"
        title="맨 위로 이동"
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          border: "none",
          background: "transparent",
          color: showTop ? "#f8fafc" : "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: showTop ? "pointer" : "default",
          opacity: showTop ? 1 : 0.25,
          transition: "all 0.2s ease",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          if (showTop) {
            e.currentTarget.style.background = "linear-gradient(135deg, #4f46e5, #6366f1)";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.boxShadow = "0 0 14px rgba(99, 102, 241, 0.6)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = showTop ? "#f8fafc" : "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <ChevronUp size={20} strokeWidth={2.4} />
      </button>

      {/* Subtle Divider */}
      <div
        style={{
          width: "20px",
          height: "1px",
          background: "rgba(255, 255, 255, 0.1)",
          margin: "1px 0",
        }}
      />

      {/* Scroll to Bottom Button */}
      <button
        type="button"
        onClick={scrollToBottom}
        disabled={!showBottom}
        aria-label="맨 아래로 이동 (Scroll to Bottom)"
        title="맨 아래로 이동"
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          border: "none",
          background: "transparent",
          color: showBottom ? "#f8fafc" : "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: showBottom ? "pointer" : "default",
          opacity: showBottom ? 1 : 0.25,
          transition: "all 0.2s ease",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          if (showBottom) {
            e.currentTarget.style.background = "linear-gradient(135deg, #4f46e5, #6366f1)";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.boxShadow = "0 0 14px rgba(99, 102, 241, 0.6)";
            e.currentTarget.style.transform = "translateY(1px)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = showBottom ? "#f8fafc" : "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <ChevronDown size={20} strokeWidth={2.4} />
      </button>
    </div>
  );
}
