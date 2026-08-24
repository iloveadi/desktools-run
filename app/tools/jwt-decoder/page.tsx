"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Clock,
  Key,
  Lock,
  FileJson,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";

// Sample JWT for testing
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJuYW1lIjoiQWxleCBKdW5nIiwic3ViIjoiMTIzNDU2Nzg5MCIsImFkbWluIjp0cnVlLCJyb2xlIjoiRGV2ZWxvcGVyIiwiaWF0IjoxNzE1MDAwMDAwLCJleHAiOjE5OTk5OTk5OTl9." +
  "4zWq6O8zC8k1vG6yX7wR_9L4mN2bV0qS-8pD5fE3hI0";

// Helper: base64url decode
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  try {
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return jsonPayload;
  } catch (e) {
    throw new Error("Invalid base64url format");
  }
}

function parseJwt(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { error: "Invalid JWT format. A valid JWT must contain 3 parts separated by dots (.)" };
  }

  try {
    const headerStr = base64UrlDecode(parts[0]);
    const payloadStr = base64UrlDecode(parts[1]);

    const header = JSON.parse(headerStr);
    const payload = JSON.parse(payloadStr);

    return {
      header,
      payload,
      signature: parts[2],
      headerRaw: JSON.stringify(header, null, 2),
      payloadRaw: JSON.stringify(payload, null, 2),
    };
  } catch (e: any) {
    return { error: "Failed to parse JWT payload/header: " + (e?.message || "Invalid JSON encoding") };
  }
}

export default function JwtDecoderPage() {
  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_JWT);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const parsed = useMemo(() => parseJwt(tokenInput), [tokenInput]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  }, []);

  // Format timestamp helper
  const formatTimestamp = (ts: any) => {
    if (typeof ts !== "number") return null;
    const date = new Date(ts * 1000);
    return {
      iso: date.toISOString(),
      local: date.toLocaleString(),
      isExpired: date.getTime() < Date.now(),
    };
  };

  const expInfo = useMemo(() => {
    if (parsed.payload && typeof parsed.payload.exp === "number") {
      return formatTimestamp(parsed.payload.exp);
    }
    return null;
  }, [parsed]);

  const iatInfo = useMemo(() => {
    if (parsed.payload && typeof parsed.payload.iat === "number") {
      return formatTimestamp(parsed.payload.iat);
    }
    return null;
  }, [parsed]);

  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Breadcrumb & Header */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 24px" }}>
          <Link
            href="/tools"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} />
            Back to All Tools
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: "rgba(99,102,241,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#818cf8",
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "var(--text-primary)",
                  }}
                >
                  JWT Decoder & Inspector
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
                JSON Web Token(JWT)을 실시간 디코딩하고 Header, Payload, Claim 및 만료 상태를 100% 브라우저에서 안전하게 확인하세요.
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.3)",
                fontSize: "12px",
                color: "#4ade80",
                fontWeight: 600,
              }}
            >
              <Lock size={12} />
              100% Client-Side Processing (Zero Data Sent)
            </div>
          </div>
        </section>

        {/* Main Grid Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="jwt-grid">
            {/* Left Column: JWT Input */}
            <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Key size={16} style={{ color: "#818cf8" }} />
                  Encoded Token Input
                </label>

                <button
                  onClick={() => setTokenInput(SAMPLE_JWT)}
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#818cf8",
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <RefreshCw size={12} />
                  Load Sample JWT
                </button>
              </div>

              <textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste your JWT token here (eyJhbGciOi...)"
                rows={14}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  background: "var(--input-bg, rgba(0,0,0,0.3))",
                  border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                  padding: "14px",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "13.5px",
                  lineHeight: "1.6",
                  resize: "vertical",
                  outline: "none",
                  wordBreak: "break-all",
                }}
              />

              {tokenInput && (
                <button
                  onClick={() => setTokenInput("")}
                  style={{
                    alignSelf: "flex-end",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Clear Input
                </button>
              )}
            </div>

            {/* Right Column: Parsed Token Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {parsed.error ? (
                <div
                  className="glass-card"
                  style={{
                    padding: "24px",
                    borderLeft: "4px solid #ef4444",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <AlertTriangle size={20} style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#f87171", marginBottom: "4px" }}>
                      Invalid JWT
                    </h4>
                    <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                      {parsed.error}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Status Banner */}
                  <div
                    className="glass-card"
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderLeft: expInfo ? (expInfo.isExpired ? "4px solid #ef4444" : "4px solid #10b981") : "4px solid #6366f1",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Clock size={18} style={{ color: expInfo ? (expInfo.isExpired ? "#f87171" : "#34d399") : "#818cf8" }} />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                          Token Expiration Status
                        </div>
                        <div style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {expInfo
                            ? expInfo.isExpired
                              ? `Expired at ${expInfo.local}`
                              : `Expires at ${expInfo.local}`
                            : "No expiration ('exp') claim specified"}
                        </div>
                      </div>
                    </div>

                    {expInfo && (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "100px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: expInfo.isExpired ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
                          color: expInfo.isExpired ? "#f87171" : "#34d399",
                          border: expInfo.isExpired ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(16,185,129,0.3)",
                        }}
                      >
                        {expInfo.isExpired ? "EXPIRED" : "VALID"}
                      </span>
                    )}
                  </div>

                  {/* Header Card */}
                  <div className="glass-card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#f43f5e", display: "flex", alignItems: "center", gap: "6px" }}>
                        <FileJson size={16} /> Header: Algorithm & Token Type
                      </span>
                      <button
                        onClick={() => copyToClipboard(parsed.headerRaw || "", "header")}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          background: copiedSection === "header" ? "rgba(34,211,168,0.2)" : "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: copiedSection === "header" ? "#34d399" : "var(--text-secondary)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {copiedSection === "header" ? <Check size={12} /> : <Copy size={12} />}
                        {copiedSection === "header" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#fda4af",
                        fontFamily: "var(--font-mono), monospace",
                        overflowX: "auto",
                        margin: 0,
                      }}
                    >
                      {parsed.headerRaw}
                    </pre>
                  </div>

                  {/* Payload Card */}
                  <div className="glass-card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#c084fc", display: "flex", alignItems: "center", gap: "6px" }}>
                        <FileJson size={16} /> Payload: Claims & Data
                      </span>
                      <button
                        onClick={() => copyToClipboard(parsed.payloadRaw || "", "payload")}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          background: copiedSection === "payload" ? "rgba(34,211,168,0.2)" : "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: copiedSection === "payload" ? "#34d399" : "var(--text-secondary)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {copiedSection === "payload" ? <Check size={12} /> : <Copy size={12} />}
                        {copiedSection === "payload" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#e9d5ff",
                        fontFamily: "var(--font-mono), monospace",
                        overflowX: "auto",
                        margin: 0,
                      }}
                    >
                      {parsed.payloadRaw}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Tool Guide */}
        <ToolGuide
          badgeText="Safe & Client-Side"
          aboutTitle="JWT 디코더 도구란 무엇인가요?"
          aboutDesc="웹 기반 인증에 광범위하게 사용되는 JSON Web Token(JWT)을 서버 전송 없이 브라우저 내에서 즉시 디코딩하여, 토큰 내부의 Header, Payload 클레임 정보 및 만료 시간(exp)을 한눈에 확인할 수 있는 도구입니다."
          howTitle="사용 방법"
          steps={[
            "분석하고자 하는 JWT 토큰 문자열(eyJhbGci...)을 왼쪽 입력창에 붙여넣습니다.",
            "오른쪽 결과 창에서 Header(알고리즘 및 유형)와 Payload(클레임 데이터)를 실시간으로 확인합니다.",
            "토큰의 만료 시간(exp) 및 발급 시간(iat) 상태와 토큰의 유효성을 체크합니다.",
          ]}
          faqs={[
            { q: "입력한 토큰이 외부 서버로 전송되나요?", a: "전혀 전송되지 않습니다! 본 도구는 모든 디코딩 작업을 100% 사용자의 브라우저(JavaScript)에서만 수행합니다." },
            { q: "비밀키(Secret Key) 없이 디코딩이 가능한가요?", a: "네, 가능합니다. JWT의 Header와 Payload는 Base64URL로 암호화가 아닌 단순 인코딩만 되어 있으므로 누구든지 읽을 수 있습니다. 비밀키는 서명(Signature) 검증 시에만 필요합니다." },
          ]}
        />
      </main>

      <Footer />

      <style>{`
        @media (max-width: 868px) {
          .jwt-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
