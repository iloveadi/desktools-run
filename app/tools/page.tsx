"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { TOOLS, getLocalizedTool, getLocalizedCategory } from "@/lib/tools";
import { useLocale } from "@/lib/context/LocaleContext";
import { Search, Grid, ArrowRight } from "lucide-react";

export default function ToolsCatalogPage() {
  const { t, locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "PDF Tools", "Image Tools", "Dev Tools", "Converter", "Text & Formatting", "Security"];

  const activeTools = TOOLS.filter((tool) => !tool.isDev);

  const localizedTools = activeTools.map((tool) => getLocalizedTool(tool, locale));

  const filteredTools = localizedTools.filter((tool) => {
    const originalTool = activeTools.find((t) => t.id === tool.id);
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (originalTool && originalTool.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "All" || (originalTool && originalTool.category === selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(99,102,241,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
              }}
            >
              <Grid size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("pages.tools.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {t("pages.tools.subtitle")}
          </p>
        </section>

        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 32px" }}>
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "280px", flex: 1, maxWidth: "420px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder={
                  locale === "ko"
                    ? "도구 검색..."
                    : locale === "ja"
                    ? "ツールを検索..."
                    : locale === "es"
                    ? "Buscar herramientas..."
                    : locale === "zh"
                    ? "搜索实用工具..."
                    : locale === "fr"
                    ? "Rechercher un outil..."
                    : "Search all tools..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "10px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  padding: "0 14px 0 40px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "100px",
                    background:
                      selectedCategory === cat
                        ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                        : "rgba(255,255,255,0.05)",
                    border: selectedCategory === cat ? "none" : "1px solid var(--border-subtle)",
                    color: selectedCategory === cat ? "white" : "var(--text-secondary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {getLocalizedCategory(cat, locale)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {filteredTools.length === 0 ? (
            <div className="glass-card" style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
              {locale === "ko"
                ? "검색 조건에 맞는 도구가 없습니다."
                : locale === "ja"
                ? "検索条件に一致するツールが見つかりません。"
                : locale === "es"
                ? "No hay herramientas que coincidan con la búsqueda."
                : locale === "zh"
                ? "没有符合搜索条件的工具。"
                : locale === "fr"
                ? "Aucun outil ne correspond à votre recherche."
                : "No tools match your search criteria."}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {filteredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="glass-card"
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                    textDecoration: "none",
                    transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#818cf8",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "rgba(99,102,241,0.12)",
                        }}
                      >
                        {getLocalizedCategory(tool.category, locale)}
                      </span>
                      {tool.badge && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#f43f5e",
                            padding: "2px 8px",
                            borderRadius: "100px",
                            background: "rgba(244,63,94,0.12)",
                          }}
                        >
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                      {tool.title}
                    </h3>
                    <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                      {tool.description}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#818cf8" }}>
                    {locale === "ko"
                      ? "도구 열기"
                      : locale === "ja"
                      ? "ツールを開く"
                      : locale === "es"
                      ? "Abrir herramienta"
                      : locale === "zh"
                      ? "打开工具"
                      : locale === "fr"
                      ? "Ouvrir l'outil"
                      : "Open Tool"}{" "}
                    <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── SEO & Platform Deep-Dive Content for AdSense & Search Engines ── */}
        <section style={{ maxWidth: "1280px", margin: "48px auto 0", padding: "0 24px" }}>
          <div className="glass-card" style={{ padding: "36px", display: "flex", flexDirection: "column", gap: "28px" }}>
            <div>
              <div className="badge-pill" style={{ marginBottom: "12px" }}>
                100% Client-Side Privacy Guarantee
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
                {locale === "ko"
                  ? "설치 및 회원가입 없이 브라우저에서 즉시 실행되는 30+ 무료 웹 유틸리티"
                  : "30+ Free Browser Utilities Running 100% Inside Your Local Memory"}
              </h2>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
                {locale === "ko"
                  ? "desktools.run은 PDF 편집, 이미지 최적화, 개발자 디버깅, 암호화 및 텍스트 변환에 필요한 필수 도구들을 100% 웹 브라우저 메모리 안에서 실행할 수 있도록 설계된 차세대 웹 유틸리티 플랫폼입니다. 사용자의 파일과 텍스트 데이터를 원격 서버로 단 1바이트도 전송하지 않으므로, 기업 기밀 문서나 개인 일상 사진도 안심하고 안전하게 처리할 수 있습니다."
                  : "desktools.run provides high-performance browser utilities for PDF processing, image compression, developer workflows, and cryptographic utilities. Powered by WebAssembly and client-side APIs, zero file bytes are uploaded to remote servers."}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  📄 {locale === "ko" ? "PDF 유틸리티 (PDF Tools)" : "PDF Utilities"}
                </h3>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
                  {locale === "ko"
                    ? "pdf-lib 및 WebAssembly 기반으로 대용량 PDF 병합, 특정 페이지 분할, FlateDecode 스트림 재압축을 통한 무손실 용량 최적화, 비밀번호 암호화/해제를 지원합니다."
                    : "Merge, split, compress, and password-protect PDF documents directly inside your browser memory using WebAssembly."}
                </p>
              </div>

              <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  🖼️ {locale === "ko" ? "이미지 처리 도구 (Image Tools)" : "Image Processing"}
                </h3>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
                  {locale === "ko"
                    ? "ONNX Web AI 인공지능 기반 배경 제거(누끼 따기), HTML5 Canvas 고효율 WebP/PNG/JPG 상호 변환, 리사이징, 워터마크 합성 및 EXIF 개인정보 메타데이터 제거를 제공합니다."
                    : "Client-side AI background removal, WebP/PNG/JPG cross-conversion, image resizing, watermarking, and EXIF metadata scrubbing."}
                </p>
              </div>

              <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  🛠️ {locale === "ko" ? "개발자 및 보안 도구 (Dev & Security)" : "Developer & Security"}
                </h3>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
                  {locale === "ko"
                    ? "JWT 토큰 안전 검증, 정규식(Regex) 실시간 테스터, Cron 5자리 표현식 파서, JSON 포맷터, SHA-256/MD5 암호화 해시 계산 및 AES-GCM 대칭키 암호화를 완벽히 지원합니다."
                    : "Zero-network JWT decoding, real-time Regex tester, Cron expression parser, JSON formatter, and cryptographic hash generators."}
                </p>
              </div>
            </div>

            {/* Platform FAQ */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px" }}>
                {locale === "ko" ? "자주 묻는 질문 (FAQ)" : "Frequently Asked Questions"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                  <strong style={{ display: "block", color: "var(--text-primary)", fontSize: "14px", marginBottom: "6px" }}>
                    Q. {locale === "ko" ? "모든 기능이 정말 100% 무료인가요?" : "Are all tools truly 100% free?"}
                  </strong>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
                    {locale === "ko"
                      ? "네! desktools.run의 모든 유틸리티는 회원가입, 신용카드 등록, 파일 개수 제한 없이 누구나 영구적으로 완전 무료로 이용할 수 있습니다."
                      : "Yes! All tools on desktools.run are 100% free forever without registrations, credit cards, or daily usage caps."}
                  </p>
                </div>
                <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                  <strong style={{ display: "block", color: "var(--text-primary)", fontSize: "14px", marginBottom: "6px" }}>
                    Q. {locale === "ko" ? "내 파일이 서버에 저장되거나 유출될 위험은 없나요?" : "Is my data safe from server storage?"}
                  </strong>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
                    {locale === "ko"
                      ? "전혀 없습니다. 모든 연산은 사용자의 웹 브라우저(JavaScript/WebAssembly) 내부에서만 수행되며 파일이 외부 서버로 업로드되지 않습니다."
                      : "Zero risk. All computation runs purely in client browser memory (Wasm/Canvas). Files are never transferred across networks."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
