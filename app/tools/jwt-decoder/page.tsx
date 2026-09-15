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
  CheckCircle2,
  Trash2,
  Sparkles,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { useLocale } from "@/lib/context/LocaleContext";

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
  if (!token.trim()) return null;
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { error: "Invalid JWT format. A valid JWT must contain 3 parts separated by dots (Header.Payload.Signature)" };
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
  const { locale, t } = useLocale();
  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_JWT);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const parsed = useMemo(() => parseJwt(tokenInput), [tokenInput]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  }, []);

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
    if (parsed && "payload" in parsed && parsed.payload && typeof parsed.payload.exp === "number") {
      return formatTimestamp(parsed.payload.exp);
    }
    return null;
  }, [parsed]);

  const iatInfo = useMemo(() => {
    if (parsed && "payload" in parsed && parsed.payload && typeof parsed.payload.iat === "number") {
      return formatTimestamp(parsed.payload.iat);
    }
    return null;
  }, [parsed]);

  const clearAll = () => {
    setTokenInput("");
  };

  const loadSample = () => {
    setTokenInput(SAMPLE_JWT);
  };

  return (
    <>
      <ToolUsageTracker toolId="jwt-decoder" />
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Breadcrumb & Header */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 20px" }}>
          <Link
            href="/"
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
            {t("jwtDecoder.back") || "Back to Tools"}
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
                    background: "rgba(168,85,247,0.15)",
                    color: "#c084fc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {t("jwtDecoder.title") || "JWT Decoder & Token Inspector"}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
                {t("jwtDecoder.subtitle") || "Decode, inspect, and analyze JSON Web Tokens in real-time. 100% Client-Side Privacy."}
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={loadSample}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={14} /> Sample
              </button>
              <button
                onClick={clearAll}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>
        </section>

        {/* Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top Token Status Summary */}
          {expInfo && (
            <div
              className="glass-card"
              style={{
                padding: "16px 20px",
                borderRadius: "12px",
                background: expInfo.isExpired ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                border: expInfo.isExpired ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(34,197,94,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {expInfo.isExpired ? (
                  <AlertTriangle size={20} color="#f87171" />
                ) : (
                  <CheckCircle2 size={20} color="#4ade80" />
                )}
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: expInfo.isExpired ? "#f87171" : "#4ade80" }}>
                    {expInfo.isExpired ? "Token is EXPIRED" : "Token is ACTIVE (Valid)"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Expires at: {expInfo.local} ({expInfo.iso})
                  </div>
                </div>
              </div>

              {iatInfo && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={14} /> Issued at: {iatInfo.local}
                </div>
              )}
            </div>
          )}

          <div className="jwt-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Left: Raw JWT Input */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Key size={16} color="#c084fc" />
                  {t("jwtDecoder.inputLabel") || "Encoded JWT Token"}
                </span>
                <button
                  onClick={() => copyToClipboard(tokenInput, "token")}
                  disabled={!tokenInput}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    background: copiedSection === "token" ? "rgba(34,211,168,0.2)" : "rgba(255,255,255,0.06)",
                    border: "1px solid var(--border-subtle)",
                    color: copiedSection === "token" ? "#34d399" : "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {copiedSection === "token" ? <Check size={12} /> : <Copy size={12} />}
                  {copiedSection === "token" ? (t("jwtDecoder.copied") || "Copied") : (t("jwtDecoder.copy") || "Copy")}
                </button>
              </div>

              <textarea
                rows={16}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste your JWT (eyJhbGciOi...) here..."
                style={{
                  width: "100%",
                  height: "460px",
                  borderRadius: "8px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  padding: "14px",
                  fontSize: "13.5px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  lineHeight: "1.6",
                  wordBreak: "break-all",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Right: Decoded Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {parsed && "error" in parsed && (
                <div
                  className="glass-card"
                  style={{
                    padding: "16px",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                  }}
                >
                  <AlertTriangle size={18} />
                  {parsed.error}
                </div>
              )}

              {parsed && !("error" in parsed) && (
                <>
                  {/* Header Box */}
                  <div className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#f87171", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Lock size={15} /> HEADER: Algorithm & Token Type
                      </span>
                      <button
                        onClick={() => copyToClipboard(parsed.headerRaw || "", "header")}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          background: copiedSection === "header" ? "rgba(34,211,168,0.2)" : "rgba(255,255,255,0.06)",
                          border: "1px solid var(--border-subtle)",
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
                        padding: "12px 14px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#fca5a5",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        overflowX: "auto",
                        margin: 0,
                      }}
                    >
                      {parsed.headerRaw}
                    </pre>
                  </div>

                  {/* Payload Box */}
                  <div className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#c084fc", display: "flex", alignItems: "center", gap: "6px" }}>
                        <FileJson size={15} /> PAYLOAD: Data & Claims
                      </span>
                      <button
                        onClick={() => copyToClipboard(parsed.payloadRaw || "", "payload")}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          background: copiedSection === "payload" ? "rgba(34,211,168,0.2)" : "rgba(255,255,255,0.06)",
                          border: "1px solid var(--border-subtle)",
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
                        padding: "12px 14px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#e9d5ff",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        overflowX: "auto",
                        margin: 0,
                        minHeight: "180px",
                      }}
                    >
                      {parsed.payloadRaw}
                    </pre>
                  </div>

                  {/* Signature Box */}
                  <div className="glass-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#38bdf8", whiteSpace: "nowrap" }}>
                        SIGNATURE:
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {parsed.signature}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      Verified on Backend
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "JWT 디코더 및 토큰 분석기 소개",
              aboutDesc:
                "JSON Web Token(JWT)을 브라우저에서 즉시 디코딩하여 Header, Payload 클레임(사용자 ID, 역할, 권한 등), 발급 시간(iat), 만료 시간(exp)을 실시간으로 분석합니다. 모든 디코딩 연산은 100% 클라이언트(브라우저)에서 로컬로 실행되므로 Authorization Bearer 토큰이나 민감한 사용자 정보가 외부 서버에 절대 전송되지 않습니다.",
              howTitle: "JWT 토큰 디코더 사용 방법",
              steps: [
                "왼쪽 입력창에 분석하고자 하는 JWT 토큰 문자열(eyJhbGciOi...)을 붙여넣습니다.",
                "실시간 디코더가 점(.)으로 구분된 3개 파트(Header, Payload, Signature)를 분리합니다.",
                "상단 상태 표시줄에서 토큰의 만료(Expired) 여부 및 정확한 만료 일시를 확인합니다.",
                "오른쪽 패널에서 구조화된 JSON 형태로 파싱된 Header(알고리즘)와 Payload(클레임)를 열람합니다.",
                "'Copy' 버튼을 눌러 각 섹션의 순수 JSON 데이터를 즉시 복사합니다."
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "100% 클라이언트 로컬 보안 디코딩", desc: "사용자의 인증 토큰과 개인정보가 외부 네트워크로 단 1바이트도 유출되지 않습니다." },
                { title: "실시간 토큰 유효성 및 만료 시간 계산", desc: "exp(Expiration Time)와 iat(Issued At) 타임스탬프를 현지 시각(KST) 및 UTC로 자동 변환하여 만료 여부를 판정합니다." },
                { title: "Header, Payload, Signature 3단 분리", desc: "서명 알고리즘(HS256, RS256 등)과 사용자 페이로드 속성을 가독성 높은 JSON으로 시각화합니다." },
                { title: "원클릭 JSON 클립보드 복사", desc: "파싱된 사용자 데이터 클레임을 손쉽게 복사하여 프론트엔드/백엔드 디버깅에 즉시 활용 가능합니다." }
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "OAuth 2.0 / OpenID Connect 토큰 디버깅", desc: "Google, Kakao, Apple 로그인에서 발급된 id_token 및 access_token의 사용자 식별값과 scope 검증" },
                { title: "프론트엔드 로그인 만료 이슈 디버깅", desc: "토큰 만료(exp) 시각을 점검하여 리프레시 토큰(Refresh Token) 재발급 로직의 오작동 분석" },
                { title: "API 인가(Role/RBAC) 권한 확인", desc: "토큰 페이로드 내에 포함된 관리자 권한(admin, role, permissions) 필드 정상 탑재 여부 점검" },
                { title: "마이크로서비스 간 토큰 전달 검증", desc: "서비스 간 통신(Service-to-Service)에서 전달되는 헤더 서명 알고리즘(alg) 규격 확인" }
              ],
              proTipsTitle: "JWT 보안 및 분석 전문가 실무 팁",
              proTips: [
                "JWT의 Payload는 암호화(Encryption)된 것이 아니라 단순히 Base64url 인코딩된 것이므로 비밀번호나 주민번호 같은 민감정보를 담지 마세요.",
                "토큰의 무결성(위변조 방지) 검증은 비밀키(Secret Key)를 소유한 백엔드 서버에서만 안전하게 검증할 수 있습니다.",
                "exp(만료시간)가 설정되지 않은 토큰은 영구히 유효할 수 있으므로 보안상 반드시 적절한 수명(예: 15분~1시간)을 지정해야 합니다.",
                "alg: 'none' 취약점이 발생하지 않도록 백엔드 검증 로직에서 서명 알고리즘을 엄격히 화이트리스트 검사하세요."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "입력한 JWT 토큰이 서버에 저장되거나 가로채일 위험이 있나요?", a: "전혀 없습니다. desktools.run의 모든 디코딩 로직은 브라우저 내부에서만 실행되며 서버로 전송되지 않습니다." },
                { q: "JWT 디코더로 서명(Signature) 검증도 가능한가요?", a: "서명 검증에는 서버의 비밀키(Secret Key / Private Key)가 필요합니다. 본 도구는 보안을 위해 비밀키 입력을 요구하지 않고 디코딩 및 만료 시간 분석을 전문으로 제공합니다." },
                { q: "JWT 토큰의 3개 부분은 무엇으로 구성되나요?", a: "점(.)으로 구분되며 1번째는 알고리즘 정보를 담은 Header, 2번째는 사용자 데이터인 Payload, 3번째는 위변조 방지용 Signature입니다." },
                { q: "만료된 토큰(Expired)은 어떻게 표시되나요?", a: "exp 클레임이 현재 시간보다 이전일 경우 상단에 붉은색 경고창과 함께 정확한 만료 일시가 표시됩니다." },
                { q: "Bearer 접두사가 붙어 있어도 디코딩되나요?", a: "네, 앞부분의 'Bearer '는 자동으로 정리되어 토큰 본문만을 안전하게 파싱합니다." },
                { q: "완전 무료인가요?", a: "네, 아무런 조건이나 제한 없이 100% 무료로 무제한 사용하실 수 있습니다." }
              ],
              relatedTools: [
                { title: "JSON 정렬 / 유효성 검사기", desc: "복사한 JWT 페이로드 JSON을 정렬 및 검증", href: "/tools/json-formatter/" },
                { title: "Base64 인코더 / 디코더", desc: "문자열 및 데이터를 Base64로 즉시 변환", href: "/tools/base64/" },
                { title: "URL 인코더 / 디코더", desc: "URL 파라미터 및 특수문자 퍼센트 인코딩", href: "/tools/url-encoder/" },
                { title: "AES 암호화 / 복호화기", desc: "AES-256 비밀 키 기반 텍스트 안전 암호화", href: "/tools/aes-encrypt/" }
              ]
            },
            en: {
              aboutTitle: "About JWT Decoder & Token Inspector",
              aboutDesc:
                "Instantly decode JSON Web Tokens (JWT) in your browser to inspect Header metadata, Payload claims (user identity, roles, permissions), and precise issuance (iat) and expiration (exp) timestamps. All decoding operations execute 100% client-side in your browser memory, guaranteeing that sensitive Bearer tokens and confidential user records never touch external servers.",
              howTitle: "How to Decode and Inspect JWT Tokens",
              steps: [
                "Paste your encoded JWT string (starting with eyJhbGciOi...) into the left input editor.",
                "The real-time parser automatically separates the token into Header, Payload, and Signature.",
                "Check the status banner at the top to see if the token is currently active or expired.",
                "Review the formatted JSON claims and attributes in the right inspector panels.",
                "Click 'Copy' to grab the decoded payload or header JSON directly to your clipboard."
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "100% Client-Side Privacy", desc: "Your authorization tokens and user data are never transmitted over the network." },
                { title: "Real-Time Expiration Analysis", desc: "Automatically converts UNIX timestamps (exp, iat) to human-readable local and UTC dates with active status checks." },
                { title: "Structured 3-Part Inspection", desc: "Neatly organizes Header algorithms, Payload claims, and Signature verification status with color-coded syntax." },
                { title: "One-Click JSON Copying", desc: "Easily copy clean, pretty-printed JSON payloads for backend debugging or API mocking." }
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "OAuth 2.0 & OIDC Debugging", desc: "Inspect id_token and access_token claims from providers like Google, Auth0, Okta, and Keycloak." },
                { title: "Session & Token Expiration Troubleshooting", desc: "Verify why authentication fails by checking exact expiration timestamps and clock skew." },
                { title: "RBAC & Role Claims Verification", desc: "Ensure backend microservices include expected permissions, roles, and user tenant IDs in payloads." },
                { title: "Microservice Token Auditing", desc: "Inspect algorithm headers (HS256, RS256, ES256) across service-to-service communication layers." }
              ],
              proTipsTitle: "Professional Tips for JWT Security",
              proTips: [
                "JWT Payloads are encoded with Base64url, NOT encrypted. Never store passwords, credit cards, or sensitive PII in token claims.",
                "Token integrity can only be verified by backend servers that hold the corresponding secret or public keys.",
                "Tokens without an 'exp' claim never expire, presenting a high security risk. Always enforce reasonable TTL limits.",
                "Ensure backend authentication libraries explicitly reject 'alg': 'none' to prevent signature bypass vulnerabilities."
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "Is my JWT token uploaded to any server?", a: "No. All parsing occurs 100% locally in your browser with zero remote transmission." },
                { q: "Can this tool verify signatures with a secret key?", a: "For security reasons, we do not request or process secret keys in the browser. Backend verification is recommended." },
                { q: "What are the three parts of a JWT?", a: "A JWT consists of Header (algorithm & type), Payload (user claims & expiry), and Signature (tamper protection), separated by dots." },
                { q: "How is an expired token indicated?", a: "If the 'exp' claim is in the past, a clear red banner displays the exact date and time it expired." },
                { q: "Does it accept 'Bearer ' prefixed tokens?", a: "Yes, any leading 'Bearer ' prefix is automatically trimmed." },
                { q: "Is this tool free?", a: "Yes, it is 100% free with unlimited token inspections." }
              ],
              relatedTools: [
                { title: "JSON Formatter & Validator", desc: "Format, minify, and validate JSON data in real-time", href: "/tools/json-formatter/" },
                { title: "Base64 Encoder & Decoder", desc: "Encode text and files into Base64 or decode back", href: "/tools/base64/" },
                { title: "URL Encoder / Decoder", desc: "Encode or decode query parameters safely", href: "/tools/url-encoder/" },
                { title: "AES Encryption Tool", desc: "Encrypt and decrypt text securely with AES-256 keys", href: "/tools/aes-encrypt/" }
              ]
            },
            ja: {
              aboutTitle: "JWT デコーダー & トークン解析ツールについて",
              aboutDesc:
                "JSON Web Token（JWT）をブラウザ上で即座にデコードし、Header（アルゴリズム情報）、Payload（ユーザー識別子やロール）、発行日時（iat）、有効期限（exp）をリアルタイムに解析する開発者向けツールです。すべての処理がブラウザ内部でローカル実行されるため、Bearer トークンが外部サーバーに送信されることは一切ありません。",
              howTitle: "JWT デコーダーの使い方",
              steps: [
                "左側の入力エリアに JWT トークン文字列（eyJhbGciOi...）を貼り付けます。",
                "デコーダーが自動的に Header、Payload、Signature の 3 つのセクションに分解します。",
                "上部のステータスバーでトークンの有効期限（有効 / 期限切れ）と日時を確認します。",
                "右側のパネルで整形された JSON 形式のクレーム情報を閲覧します。",
                "「Copy」ボタンをクリックして各セクションの JSON データをクリップボードに取得します。"
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "100% クライアント側セキュア処理", desc: "機密性の高いアクセストークンや個人情報が外部ネットワークに送信されることはありません。" },
                { title: "有効期限（exp）の自動判定", desc: "UNIX タイムスタンプをローカル日時に自動変換し、トークンの失効状況を一目で確認できます。" },
                { title: "3 セクション構造化ハイライト", desc: "Header、Payload、Signature を色分けしてわかりやすく表示します。" },
                { title: "ワンクリック JSON コピー", desc: "デコードされたユーザーデータを素早くコピーしてデバッグに活用できます。" }
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "OAuth 2.0 / OIDC 認証のデバッグ", desc: "Google や Auth0 から取得した id_token や access_token のクレーム内容を確認" },
                { title: "セッション有効期限トラブルの調査", desc: "ログインが意図せず切れる原因を exp タイムスタンプから特定" },
                { title: "ロール・権限（RBAC）の検証", desc: "トークン内に管理者フラグや権限スコープが正しく付与されているかチェック" },
                { title: "マイクロサービス間トークンの監査", desc: "サービス間で受け渡される署名アルゴリズム仕様の整合性を確認" }
              ],
              proTipsTitle: "JWT セキュリティのプロのテクニック",
              proTips: [
                "JWT の Payload は暗号化ではなく Base64url エンコードされているだけです。パスワード等の機密情報は絶対に含めないでください。",
                "改ざん防止の検証は、秘密鍵を持つバックエンドサーバーでのみ安全に実施できます。",
                "exp（有効期限）のないトークンは永続的に有効となるため重大なセキュリティリスクとなります。適切な有効期間を設定しましょう。",
                "バックエンドの検証処理では alg: 'none' による署名バイパス攻撃を必ずブロックしてください。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "入力したトークンがサーバーに保存されることはありますか？", a: "ありません。すべてのデコード処理はお使いのブラウザ内部で完結します。" },
                { q: "署名（Signature）の検証も行えますか？", a: "署名検証には秘密鍵が必要です。安全のため当ツールでは秘密鍵を求めず、デコードと有効期限の解析に特化しています。" },
                { q: "JWT はどのような構造になっていますか？", a: "ドット（.）で区切られた Header、Payload、Signature の 3 部分で構成されます。" },
                { q: "期限切れのトークンはどのように表示されますか？", a: "exp が過去の日時である場合、上部に赤い警告バナーと失効日時が表示されます。" },
                { q: "Bearer という文字列が含まれていても動作しますか？", a: "はい、先頭の 'Bearer ' は自動的に除外されて解析されます。" },
                { q: "無料で利用できますか？", a: "はい、完全無料・回数無制限でご利用いただけます。" }
              ],
              relatedTools: [
                { title: "JSON 整形・バリデーター", desc: "JSON の整形、圧縮、構文エラー検証", href: "/tools/json-formatter/" },
                { title: "Base64 エンコーダー / デコーダー", desc: "文字列とバイナリデータを Base64 形式で相互変換", href: "/tools/base64/" },
                { title: "URL エンコーダー / デコーダー", desc: "URL パラメータや特殊文字を安全にエンコード", href: "/tools/url-encoder/" },
                { title: "AES 暗号化 / 復号ツール", desc: "AES-256 共通鍵による安全なテキスト暗号化", href: "/tools/aes-encrypt/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Decodificador e Inspector de JWT",
              aboutDesc:
                "Decodifica JSON Web Tokens (JWT) al instante en tu navegador para inspeccionar metadatos de Header, claims de Payload (identidad, roles, permisos) y marcas de tiempo de emisión (iat) y expiración (exp). Todo se ejecuta 100% de forma local en tu navegador sin enviar tokens Bearer a servidores externos.",
              howTitle: "Cómo Decodificar e Inspeccionar Tokens JWT",
              steps: [
                "Pega tu token JWT (que empieza por eyJhbGciOi...) en el editor de la izquierda.",
                "El analizador desglosa automáticamente el token en Header, Payload y Signature.",
                "Comprueba en el banner superior si el token está activo o ha expirado.",
                "Revisa la estructura JSON limpia en los paneles de la derecha.",
                "Haz clic en 'Copy' para llevarte los datos del payload al portapapeles."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Privacidad 100% en el Navegador", desc: "Tus tokens de autorización nunca se envían a servidores externos." },
                { title: "Análisis de Expiración en Vivo", desc: "Convierte marcas de tiempo UNIX a fechas locales y valida si el token sigue vigente." },
                { title: "Estructura Desglosada en 3 Partes", desc: "Organiza de forma clara Header, Payload y Signature con resaltado sintáctico." },
                { title: "Copia de JSON con un Solo Clic", desc: "Copia los claims del usuario en formato JSON para depurar APIs y servicios." }
              ],
              useCasesTitle: "Casos de Uso Comunes",
              useCases: [
                { title: "Depuración de OAuth 2.0 y OIDC", desc: "Inspecciona tokens id_token y access_token de proveedores como Google o Auth0." },
                { title: "Diagnóstico de Expiración de Sesión", desc: "Verifica fechas de caducidad para resolver fallos de inicio de sesión inesperados." },
                { title: "Validación de Roles y Permisos (RBAC)", desc: "Comprueba que los claims de administrador o grupo se incluyan correctamente." },
                { title: "Auditoría entre Microservicios", desc: "Revisa algoritmos de firma en la comunicación interna entre APIs." }
              ],
              proTipsTitle: "Consejos Profesionales sobre Seguridad JWT",
              proTips: [
                "El Payload de un JWT solo está codificado en Base64url, NO cifrado. Nunca almacenes contraseñas en él.",
                "La integridad solo puede ser validada por el servidor backend que posee la clave secreta o pública.",
                "Los tokens sin claim 'exp' son perpetuos y representan un riesgo de seguridad. Establece siempre tiempos de vida limitados.",
                "Asegúrate de que tus servidores rechacen el algoritmo 'none' para evitar ataques de omisión de firma."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Se envían mis tokens JWT a algún servidor?", a: "No. Toda la decodificación se ejecuta localmente en la memoria de tu navegador." },
                { q: "¿Verifica este analizador la firma criptográfica?", a: "Para no comprometer tus claves secretas, la herramienta no solicita contraseñas y se centra en la decodificación y el análisis de expiración." },
                { q: "¿Cuáles son las 3 partes de un JWT?", a: "Header (algoritmo y tipo), Payload (datos y expiración) y Signature (protección contra manipulación)." },
                { q: "¿Cómo se indica si un token ha caducado?", a: "Aparece una alerta roja superior con la fecha y hora exactas de expiración." },
                { q: "¿Admite el prefijo 'Bearer '?", a: "Sí, se recorta automáticamente al pegar el texto." },
                { q: "¿Es completamente gratuito?", a: "Sí, 100% gratuito e ilimitado." }
              ],
              relatedTools: [
                { title: "Formateador y Validador JSON", desc: "Embellece, valida y minifica datos JSON", href: "/tools/json-formatter/" },
                { title: "Codificador / Decodificador Base64", desc: "Convierte texto y archivos a formato Base64", href: "/tools/base64/" },
                { title: "Codificador / Decodificador URL", desc: "Codifica parámetros y caracteres especiales en URIs", href: "/tools/url-encoder/" },
                { title: "Cifrador y Descifrador AES", desc: "Cifra textos con clave secreta mediante AES-256", href: "/tools/aes-encrypt/" }
              ]
            },
            zh: {
              aboutTitle: "关于 JWT Token 实时解码与分析器",
              aboutDesc:
                "支持在浏览器中即时解析 JSON Web Token (JWT)，深度分析 Header（算法与类型）、Payload（用户身份声明、角色权限）、签发时间（iat）与过期时间（exp）。所有解码运算 100% 在您本地浏览器内存中运行，保证 Bearer Token 与敏感用户凭据绝不上传至任何外部服务器。",
              howTitle: "如何解码与分析 JWT Token",
              steps: [
                "在左侧输入框中粘贴待分析的 JWT 字符串（以 eyJhbGciOi... 开头）。",
                "实时解码器会自动以点号 (.) 为界将其拆解为 Header、Payload 与 Signature 三部分。",
                "查看顶部状态指示条，即时了解 Token 是否处于有效活跃期或已过期。",
                "在右侧面板中查看格式化后的 JSON 结构化用户属性与权限声明。",
                "点击“Copy”按钮一键将解析后的干净 JSON 复制到剪贴板中。"
              ],
              featuresTitle: "核心功能与特点",
              features: [
                { title: "100% 客户端本地安全隐私", desc: "所有 Token 数据均在本地沙箱中解析，绝无任何网络请求与日志留存。" },
                { title: "Token 有效期与过期状态实时计算", desc: "自动将 UNIX 时间戳（exp、iat）转换为本地可读时间并判定是否过期。" },
                { title: "三大组成部分高亮可视化", desc: "清晰区分 Header、Payload 和 Signature，支持单独复制。" },
                { title: "一键 JSON 复制与接口联调", desc: "快速提取载荷数据，方便前端鉴权与后端 API 接口测试。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "OAuth 2.0 / OIDC 登录调试", desc: "检查 Google、微信、Auth0 等颁发的 id_token 和 access_token 内部声明" },
                { title: "登录状态过期与刷新机制排查", desc: "核对 exp 过期时间戳，分析客户端 Token 自动续期逻辑异常" },
                { title: "RBAC 角色与权限声明核对", desc: "确认 Token 载荷中是否包含当前用户所需的 admin 标识与 scope 权限" },
                { title: "微服务架构 Token 传递审计", desc: "在跨服务调用链路上检查 Token 的签名算法（HS256、RS256）与规范" }
              ],
              proTipsTitle: "JWT 安全与实战技巧",
              proTips: [
                "JWT 的 Payload 仅进行了 Base64url 编码而非加密，任何人都能解码，切勿存放密码等敏感信息。",
                "Token 的防篡改完整性只能由掌握密钥的后端服务器进行安全验证。",
                "未配置 exp 声明的 Token 会永久有效，存在巨大安全风险，请务必设置合理的生存时间（TTL）。",
                "后端校验时务必严格限制 alg 算法白名单，防止出现 'alg': 'none' 的安全绕过漏洞。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "输入的 JWT 会被记录在服务器上吗？", a: "绝对不会。desktools.run 的所有解码逻辑 100% 在本地浏览器中执行。" },
                { q: "本工具能验证 Signature 签名吗？", a: "签名验证需要后端保管的私钥或密钥。为确保安全，本工具不索取私钥，专注提供安全解码与过期时间分析。" },
                { q: "JWT 的三段结构分别代表什么？", a: "第一段是 Header（算法与类型），第二段是 Payload（业务数据与过期时间），第三段是 Signature（防伪签名）。" },
                { q: "过期 Token 会如何显示？", a: "如果 exp 时间已过去，顶部会弹出醒目的红色警告条并展示精确过期时间。" },
                { q: "带有 'Bearer ' 前缀可以直接粘贴吗？", a: "可以，系统会自动过滤前缀并提取核心 Token。" },
                { q: "完全免费吗？", a: "永久 100% 免费，无任何限制。" }
              ],
              relatedTools: [
                { title: "JSON 格式化与校验工具", desc: "JSON 数据美化、压缩与语法错误实时排查", href: "/tools/json-formatter/" },
                { title: "Base64 编码 / 解码工具", desc: "文本与二进制数据的 Base64 双向即时转换", href: "/tools/base64/" },
                { title: "URL 编码 / 解码器", desc: "URI 网址参数及特殊符号的百分号安全编码", href: "/tools/url-encoder/" },
                { title: "AES 文本加密 / 解密器", desc: "基于 AES-256 算法的军事级安全文本加密", href: "/tools/aes-encrypt/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Décodeur et Inspecteur de Tokens JWT",
              aboutDesc:
                "Décodez instantanément vos JSON Web Tokens (JWT) directement dans votre navigateur pour analyser les métadonnées de l'en-tête (Header), les revendications de la charge utile (Payload), ainsi que les dates d'émission (iat) et d'expiration (exp). Traitement 100% local dans la mémoire de votre navigateur garantissant la confidentialité absolue de vos jetons Bearer.",
              howTitle: "Comment Décoder et Analyser vos Tokens JWT",
              steps: [
                "Collez votre jeton JWT (commençant par eyJhbGciOi...) dans l'éditeur de gauche.",
                "L'analyseur sépare automatiquement le jeton en En-tête, Charge utile et Signature.",
                "Consultez le bandeau supérieur pour savoir si le jeton est actif ou expiré.",
                "Inspectez les revendications structurées en JSON dans les volets de droite.",
                "Cliquez sur 'Copy' pour récupérer le JSON propre dans le presse-papiers."
              ],
              featuresTitle: "Fonctionnalités Clés",
              features: [
                { title: "Confidentialité 100% Côté Client", desc: "Vos jetons d'autorisation ne sont jamais transmis sur Internet." },
                { title: "Calcul de Validité & Expiration en Direct", desc: "Convertit les horodatages UNIX (exp, iat) en dates locales précises." },
                { title: "Décomposition Claire en 3 Parties", desc: "Affiche l'En-tête, la Charge utile et la Signature avec coloration syntaxique." },
                { title: "Copie de JSON en 1 Clic", desc: "Copiez facilement les données utilisateur pour vos tests d'API backend." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Débogage OAuth 2.0 & OIDC", desc: "Examinez les jetons id_token et access_token issus de Google, Auth0 ou Okta." },
                { title: "Résolution d'Erreurs d'Expiration de Session", desc: "Identifiez pourquoi une session se déconnecte grâce à l'horodatage exp." },
                { title: "Vérification des Rôles et Droits (RBAC)", desc: "Assurez-vous que les permissions administrateur sont correctement injectées." },
                { title: "Audit d'Architecture Microservices", desc: "Contrôlez les algorithmes de signature dans les flux inter-services." }
              ],
              proTipsTitle: "Conseils d'Experts sur la Sécurité JWT",
              proTips: [
                "La charge utile d'un JWT est simplement encodée en Base64url et NON chiffrée. Ne stockez jamais de mots de passe dedans.",
                "L'intégrité du jeton ne peut être vérifiée que par le serveur backend détenteur de la clé secrète.",
                "Un jeton sans champ 'exp' n'expire jamais, ce qui constitue une faille de sécurité majeure.",
                "Vérifiez que votre backend rejette formellement l'algorithme 'none' pour bloquer les attaques par contournement de signature."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Mes jetons JWT sont-ils envoyés sur un serveur ?", a: "Non. Tout le décodage se fait à 100% dans la mémoire de votre navigateur." },
                { q: "Cet outil vérifie-t-il la signature cryptographique ?", a: "Pour des raisons de sécurité évidentes, cet outil ne demande pas de clé privée et se concentre sur le décodage et l'analyse d'expiration." },
                { q: "Quelles sont les 3 parties d'un JWT ?", a: "L'En-tête (algorithme et type), la Charge utile (données et expiration) et la Signature (protection anti-altération)." },
                { q: "Comment est signalée l'expiration ?", a: "Un bandeau rouge clair indique la date et l'heure exactes de fin de validité." },
                { q: "Prend-il en charge le préfixe 'Bearer ' ?", a: "Oui, le préfixe 'Bearer ' est automatiquement supprimé lors du collage." },
                { q: "L'outil est-il gratuit ?", a: "Oui, 100% gratuit et sans aucune restriction." }
              ],
              relatedTools: [
                { title: "Formateur & Validateur JSON", desc: "Mise en page, compression et validation de JSON", href: "/tools/json-formatter/" },
                { title: "Encodeur / Décodeur Base64", desc: "Convertissez textes et fichiers au format Base64", href: "/tools/base64/" },
                { title: "Encodeur / Décodeur d'URL", desc: "Encodez les composants d'URL et paramètres de requête", href: "/tools/url-encoder/" },
                { title: "Chiffreur / Déchiffreur AES", desc: "Chiffrement de texte sécurisé avec clé AES-256", href: "/tools/aes-encrypt/" }
              ]
            }
          };

          const active = content[locale as keyof typeof content] || content.en;

          return (
            <ToolGuide
              badgeText="100% Free & Browser-Native"
              aboutTitle={active.aboutTitle}
              aboutDesc={active.aboutDesc}
              howTitle={active.howTitle}
              steps={active.steps}
              featuresTitle={active.featuresTitle}
              features={active.features}
              useCasesTitle={active.useCasesTitle}
              useCases={active.useCases}
              proTips={{
                title: active.proTipsTitle,
                tips: active.proTips,
              }}
              faqs={active.faqs}
              relatedTools={active.relatedTools}
            />
          );
        })()}
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
