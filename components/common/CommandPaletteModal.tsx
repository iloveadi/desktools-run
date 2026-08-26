"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Star, ArrowRight, Zap, Command } from "lucide-react";
import { TOOLS, getLocalizedTool, Tool } from "@/lib/tools";
import { useLocale } from "@/lib/context/LocaleContext";
import { getFavorites, toggleFavorite } from "@/lib/favorites";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFavorites(getFavorites());
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or event dispatcher
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = TOOLS.filter((tool) => {
    if (tool.isDev) return false;
    const localized = getLocalizedTool(tool, locale);
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      localized.title.toLowerCase().includes(q) ||
      localized.description.toLowerCase().includes(q) ||
      tool.id.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDownModal = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredTools.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % (filteredTools.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        router.push(filteredTools[selectedIndex].href);
        onClose();
      }
    }
  };

  const handleToggleFav = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    const updated = toggleFavorite(toolId);
    setFavorites([...updated]);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 12, 20, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px 16px 20px",
        animation: "fadeIn 0.15s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownModal}
        style={{
          width: "100%",
          maxWidth: "640px",
          borderRadius: "16px",
          background: "#121624",
          border: "1px solid rgba(129, 140, 248, 0.35)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          color: "#ffffff",
        }}
      >
        {/* Input Bar */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            background: "rgba(255, 255, 255, 0.03)",
          }}
        >
          <Search size={20} style={{ color: "#818cf8", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={
              locale === "ko"
                ? "도구 검색... (예: PDF, 이미지, JSON, 비밀번호)"
                : "Search tools... (e.g., PDF, Image, JSON, Password)"
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 600,
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={13} />
            </button>
          ) : (
            <kbd
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#cbd5e1",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "3px 7px",
                borderRadius: "5px",
                userSelect: "none",
              }}
            >
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "12px 10px" }}>
          {filteredTools.length === 0 ? (
            <div style={{ padding: "36px", textAlign: "center", color: "#cbd5e1", fontSize: "14px" }}>
              검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const localized = getLocalizedTool(tool, locale);
              const isSelected = idx === selectedIndex;
              const isFav = favorites.includes(tool.id);

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    router.push(tool.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: isSelected ? "rgba(99, 102, 241, 0.2)" : "transparent",
                    border: isSelected ? "1px solid rgba(129, 140, 248, 0.4)" : "1px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    cursor: "pointer",
                    transition: "background 0.1s",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <button
                      onClick={(e) => handleToggleFav(e, tool.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        color: isFav ? "#facc15" : "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                    >
                      <Star size={17} fill={isFav ? "#facc15" : "none"} />
                    </button>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14.5px", fontWeight: 700, color: "#ffffff" }}>
                          {localized.title}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#a5b4fc",
                            background: "rgba(99,102,241,0.15)",
                            padding: "1px 7px",
                            borderRadius: "100px",
                            border: "1px solid rgba(99,102,241,0.3)",
                          }}
                        >
                          {tool.category}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "12.5px",
                          color: "#cbd5e1",
                          margin: "2px 0 0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {localized.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isSelected ? "#818cf8" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>{locale === "ko" ? "이동" : "Go"}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div
          style={{
            padding: "10px 20px",
            background: "rgba(0, 0, 0, 0.3)",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#94a3b8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span>↑↓ 선택</span>
            <span>↵ 이동</span>
            <span>★ 즐겨찾기 고정</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Zap size={13} style={{ color: "#818cf8" }} />
            <span>desktools.run Fast Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
