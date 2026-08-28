"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Globe,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Users,
  Search,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  Settings
} from "lucide-react";

const GA_MEASUREMENT_ID = "G-VTHH5397MR";
const STREAM_ID = "15518420037";

export default function VisitorCounter() {
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [isEditingEmbed, setIsEditingEmbed] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("desktools_ga_looker_embed_url");
    if (saved) {
      setEmbedUrl(saved);
      setInputUrl(saved);
    }
  }, []);

  const handleSaveEmbed = () => {
    localStorage.setItem("desktools_ga_looker_embed_url", inputUrl.trim());
    setEmbedUrl(inputUrl.trim());
    setIsEditingEmbed(false);
  };

  const ga4RealtimeUrl = "https://analytics.google.com/analytics/web/";
  const ga4AcquisitionUrl = "https://analytics.google.com/analytics/web/";

  return (
    <section style={{ marginTop: "48px", width: "100%" }}>
      <div
        style={{
          padding: "32px 28px",
          borderRadius: "16px",
          background: "#0d111e",
          border: "1px solid rgba(99, 102, 241, 0.35)",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(99, 102, 241, 0.12)",
          position: "relative",
          overflow: "hidden",
          color: "#ffffff",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 16px rgba(245, 158, 11, 0.35)",
              }}
            >
              <BarChart3 size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#f8fafc", margin: 0, letterSpacing: "-0.4px" }}>
                  Google Analytics 4 실시간 방문자 관제 센터
                </h2>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    color: "#34d399",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#10b981",
                      boxShadow: "0 0 8px #10b981",
                    }}
                  />
                  LIVE TRACKING • {GA_MEASUREMENT_ID}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", margin: 0 }}>
                전 세계 모든 사용자의 실제 접속자 수, 국가별 유입, 인기 도구 순위가 구글 공식 엔진으로 실시간 집계됩니다.
              </p>
            </div>
          </div>

          {/* Direct GA4 Open Button */}
          <a
            href={ga4RealtimeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow"
            style={{
              padding: "10px 20px",
              fontSize: "13.5px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
            }}
          >
            <Zap size={16} />
            GA4 실시간 콘솔 바로가기
            <ExternalLink size={14} />
          </a>
        </div>

        {/* 4 Quick Launch Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {/* Card 1: Real-time Live */}
          <a
            href={ga4RealtimeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "18px 20px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--brand-mid)";
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.16)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.25)";
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#818cf8" }}>⚡ 실시간 접속자 & 지도</span>
              <ExternalLink size={14} color="#818cf8" />
            </div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff" }}>
              Real-Time Active
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              현재 전 세계 동시 접속자 수 및 위치 실시간 확인
            </div>
          </a>

          {/* Card 2: Acquisition */}
          <a
            href={ga4AcquisitionUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "18px 20px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#10b981";
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.16)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.25)";
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#34d399" }}>🔍 트래픽 유입 경로</span>
              <ExternalLink size={14} color="#34d399" />
            </div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff" }}>
              Traffic Sources
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              구글 검색, 네이버, 직접 입력 등 유입 채널 분석
            </div>
          </a>

          {/* Card 3: Cloudflare Analytics */}
          <a
            href="https://dash.cloudflare.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "18px 20px",
              borderRadius: "12px",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f59e0b";
              e.currentTarget.style.background = "rgba(245, 158, 11, 0.16)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.25)";
              e.currentTarget.style.background = "rgba(245, 158, 11, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#fbbf24" }}>☁️ Cloudflare 웹로그</span>
              <ExternalLink size={14} color="#fbbf24" />
            </div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff" }}>
              CDN Server Logs
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              광고 차단기 우회 100% 서버단 실제 방문자 집계
            </div>
          </a>

          {/* Card 4: Search Console */}
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "18px 20px",
              borderRadius: "12px",
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#38bdf8";
              e.currentTarget.style.background = "rgba(56, 189, 248, 0.16)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.25)";
              e.currentTarget.style.background = "rgba(56, 189, 248, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#38bdf8" }}>📈 구글 서치 콘솔</span>
              <ExternalLink size={14} color="#38bdf8" />
            </div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff" }}>
              Search Keywords
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              검색 노출수, 클릭수 및 유입 키워드 순위 분석
            </div>
          </a>
        </div>

        {/* Looker Studio Embedded Dashboard Area */}
        <div
          style={{
            borderRadius: "12px",
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <LayoutDashboard size={18} color="#818cf8" />
              <span style={{ fontSize: "14.5px", fontWeight: 700, color: "#f8fafc" }}>
                대시보드 화면 내 실시간 통계 차트 (Looker Studio Embed)
              </span>
            </div>

            <button
              onClick={() => setIsEditingEmbed(!isEditingEmbed)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#cbd5e1",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12.5px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Settings size={14} />
              {embedUrl ? "임베드 링크 수정" : "임베드 링크 등록"}
            </button>
          </div>

          {/* Embed Setup Box (when editing or not set) */}
          {isEditingEmbed && (
            <div style={{ padding: "20px", background: "rgba(99, 102, 241, 0.05)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <p style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "10px" }}>
                💡 <strong>Looker Studio 링크 넣는 법</strong>: [Looker Studio(lookerstudio.google.com)]에서 GA4 보고서 생성 ➔ [공유] ➔ [보고서 삽입]에서 <strong>삽입 URL (https://lookerstudio.google.com/embed/reporting/...)</strong>을 복사하여 아래에 붙여넣으시면 이 화면 안에 실시간 인터랙티브 차트가 바로 뜹니다!
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://lookerstudio.google.com/embed/reporting/..."
                  style={{
                    flex: 1,
                    minWidth: "260px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleSaveEmbed}
                  className="btn-glow"
                  style={{ padding: "10px 20px", fontSize: "13px", fontWeight: 700 }}
                >
                  저장하기
                </button>
              </div>
            </div>
          )}

          {/* Live View */}
          {embedUrl ? (
            <div style={{ width: "100%", height: "600px" }}>
              <iframe
                src={embedUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                allowFullScreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          ) : (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "rgba(99, 102, 241, 0.12)",
                  color: "#818cf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <BarChart3 size={28} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>
                실시간 GA4 데이터가 정상 수집 중입니다
              </h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", maxWidth: "520px", margin: "0 auto 20px", lineHeight: 1.6 }}>
                상단의 <strong>[GA4 실시간 콘솔 바로가기]</strong> 버튼을 누르시면 구글 공식 실시간 관제 화면에서 전 세계 동시 접속자와 지도를 1초 만에 확인하실 수 있습니다.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                <a
                  href={ga4RealtimeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glow"
                  style={{ padding: "10px 22px", fontSize: "13.5px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <Zap size={15} />
                  구글 실시간 관제화면 열기
                  <ExternalLink size={14} />
                </a>
                <a
                  href="https://lookerstudio.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#f8fafc",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <LayoutDashboard size={15} />
                  Looker Studio 차트 만들기
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
