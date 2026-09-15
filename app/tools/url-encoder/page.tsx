"use client";

/**
 * app/tools/url-encoder/page.tsx
 * ─────────────────────────────────────────────────────────────
 * URL / Percent Encoder & Decoder Tool for desktools.run
 * 100% Client-Side with 6-language SEO support
 */

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { useLocale } from "@/lib/context/LocaleContext";
import {
  Link as LinkIcon,
  ArrowLeft,
  Copy,
  Check,
  ArrowRightLeft,
  Trash2,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";

type EncodeType = "component" | "full";

export default function UrlEncoderPage() {
  const { locale, t } = useLocale();

  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeType, setEncodeType] = useState<EncodeType>("component");
  const [inputStr, setInputStr] = useState("https://desktools.run/search?query=한글 유틸리티&category=PDF 도구 & sort=최신순");
  const [copied, setCopied] = useState(false);

  const getResult = () => {
    if (!inputStr.trim()) return "";
    try {
      if (mode === "encode") {
        return encodeType === "component"
          ? encodeURIComponent(inputStr)
          : encodeURI(inputStr);
      } else {
        return decodeURIComponent(inputStr.trim());
      }
    } catch (err) {
      return "⚠️ Invalid URL / URI percent-encoded format. Please check for malformed '%' escape sequences.";
    }
  };

  const outputStr = getResult();

  const copyToClipboard = () => {
    if (!outputStr) return;
    navigator.clipboard.writeText(outputStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputStr("");
  };

  const swapData = () => {
    if (outputStr && !outputStr.startsWith("⚠️")) {
      setInputStr(outputStr);
    }
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
  };

  const loadSample = () => {
    if (mode === "encode") {
      setInputStr("https://api.example.com/v1/search?term=프론트엔드 개발자&filter=경력 3년 이상&tag=React#page=1");
    } else {
      setInputStr("https%3A%2F%2Fapi.example.com%2Fv1%2Fsearch%3Fterm%3D%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C%20%EA%B0%9C%EB%B0%9C%EC%9E%90%26filter%3D%EA%B2%BD%EB%A0%A5%203%EB%85%84%20%EC%9D%B4%EC%83%81");
    }
  };

  return (
    <>
      <ToolUsageTracker toolId="url-encoder" />
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Breadcrumb & Title */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 16px" }}>
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
            }}
          >
            <ArrowLeft size={14} /> {t("urlEncoder.back") || "Back to Tools"}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LinkIcon size={22} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("urlEncoder.title") || "URL Encoder & Decoder"}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {t("urlEncoder.subtitle") || "Encode query parameters, spaces, and multilingual characters safely or decode URL strings back."}
          </p>
        </section>

        {/* Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Action Toolbar */}
          <div
            className="glass-card"
            style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => setMode("encode")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  background: mode === "encode" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)",
                  border: mode === "encode" ? "none" : "1px solid var(--border-subtle)",
                  color: mode === "encode" ? "white" : "var(--text-secondary)",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t("urlEncoder.encodeMode") || "Encode URL"}
              </button>
              <button
                onClick={() => setMode("decode")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  background: mode === "decode" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)",
                  border: mode === "decode" ? "none" : "1px solid var(--border-subtle)",
                  color: mode === "decode" ? "white" : "var(--text-secondary)",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t("urlEncoder.decodeMode") || "Decode URL"}
              </button>

              {mode === "encode" && (
                <div style={{ display: "flex", gap: "6px", marginLeft: "6px" }}>
                  <button
                    onClick={() => setEncodeType("component")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: encodeType === "component" ? "rgba(99,102,241,0.2)" : "transparent",
                      border: encodeType === "component" ? "1px solid rgba(99,102,241,0.5)" : "1px solid var(--border-subtle)",
                      color: encodeType === "component" ? "#a5b4fc" : "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    encodeURIComponent (Params)
                  </button>
                  <button
                    onClick={() => setEncodeType("full")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: encodeType === "full" ? "rgba(99,102,241,0.2)" : "transparent",
                      border: encodeType === "full" ? "1px solid rgba(99,102,241,0.5)" : "1px solid var(--border-subtle)",
                      color: encodeType === "full" ? "#a5b4fc" : "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    encodeURI (Full URL)
                  </button>
                </div>
              )}

              <button
                onClick={swapData}
                title="Swap input & output"
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ArrowRightLeft size={14} /> Swap
              </button>

              <button
                onClick={loadSample}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={14} /> Sample
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
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

              <button
                onClick={copyToClipboard}
                disabled={!outputStr || outputStr.startsWith("⚠️")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  background: copied ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.2)",
                  border: "1px solid rgba(99,102,241,0.4)",
                  color: copied ? "#4ade80" : "#a5b4fc",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? (t("urlEncoder.copied") || "Copied!") : (t("urlEncoder.copyResult") || "Copy Result")}
              </button>
            </div>
          </div>

          <div className="editor-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Input Box */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={16} color="#818cf8" />
                  {mode === "encode" ? (t("urlEncoder.inputLabel") || "URL / Plain String to Encode") : "Encoded URL / Percent String"}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {inputStr.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                rows={12}
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                placeholder="Paste URL or text to encode/decode..."
                style={{
                  width: "100%",
                  height: "360px",
                  borderRadius: "8px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  padding: "14px",
                  fontSize: "13.5px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  lineHeight: "1.6",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Output Box */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} color="#818cf8" />
                  {mode === "encode" ? (t("urlEncoder.outputLabel") || "Percent-Encoded Result") : "Decoded Plain URL"}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {outputStr.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                readOnly
                rows={12}
                value={outputStr}
                placeholder="Result will appear here..."
                style={{
                  width: "100%",
                  height: "360px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--border-subtle)",
                  color: outputStr.startsWith("⚠️") ? "#f87171" : "#4ade80",
                  padding: "14px",
                  fontSize: "13.5px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  wordBreak: "break-all",
                  lineHeight: "1.6",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "URL 인코더 / 디코더 (퍼센트 인코딩) 소개",
              aboutDesc:
                "웹 주소(URI)에 포함될 수 없는 한글, 공백, 특수문자(&, ?, =, # 등)를 인터넷 표준 규격인 RFC 3986 퍼센트 인코딩(%XX) 형식으로 변환하거나 역으로 해독하는 온라인 변환 도구입니다. 쿼리 파라미터 값만 인코딩하는 encodeURIComponent와 전체 URL 구조를 보존하는 encodeURI 모드를 완벽 지원합니다. 모든 변환은 브라우저 내부에서 100% 로컬 처리됩니다.",
              howTitle: "URL 인코딩 및 디코딩 사용 방법",
              steps: [
                "상단 툴바에서 'URL 인코딩' 또는 'URL 디코딩' 모드를 선택합니다.",
                "인코딩 시 용도에 따라 'encodeURIComponent(파라미터용)' 또는 'encodeURI(전체 주소용)'를 지정합니다.",
                "왼쪽 입력창에 변환할 URL이나 문자열을 붙여넣습니다.",
                "오른쪽 결과창에 실시간으로 퍼센트 인코딩(%XX) 또는 원문 해독 결과가 출력됩니다.",
                "'결과 복사' 버튼을 눌러 API 요청 주소나 웹 링크에 즉시 적용하세요."
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "RFC 3986 표준 퍼센트 인코딩 준수", desc: "웹 표준에 정확히 부합하는 UTF-8 바이트 기반 %-Escape 변환 알고리즘을 적용합니다." },
                { title: "encodeURIComponent vs encodeURI 듀얼 모드", desc: "특정 쿼리 파라미터만 안전하게 인코딩할지, 프로토콜/도메인을 포함한 전체 링크를 보존할지 선택 가능합니다." },
                { title: "100% 브라우저 로컬 안전 실행", desc: "검색어, 인증 파라미터, 내부 API 엔드포인트가 외부 서버로 절대 유출되지 않습니다." },
                { title: "원클릭 스왑(Swap) & 샘플 제공", desc: "인코딩 결과를 디코딩으로 역전환하여 양방향 검증을 1초 만에 완료할 수 있습니다." }
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "REST API GET 쿼리스트링 조합", desc: "공백, 앰퍼샌드(&), 슬래시(/)가 포함된 검색어나 필터 값을 안전하게 URL 파라미터로 전송" },
                { title: "리다이렉트 URL (Next/Return URL) 전달", desc: "로그인 후 이동할 redirect_url=https://example.com/callback 전체를 파라미터에 안전하게 캡슐화" },
                { title: "한글 및 다국어 웹 링크 복사", desc: "메신저나 이메일에 한글 URL을 깨짐 없이 전송할 수 있도록 퍼센트 인코딩 변환" },
                { title: "웹 서버 접근 로그(%XX) 디코딩", desc: "Nginx, Apache 서버 로그에 기록된 %20, %EC%9D%B4 등의 인코딩 문자열을 사람이 읽을 수 있는 한글로 분석" }
              ],
              proTipsTitle: "URL 인코딩 전문가 실무 팁",
              proTips: [
                "쿼리 파라미터(value)로 넘길 때는 &, =, ? 문자까지 모두 변환해주는 encodeURIComponent를 사용해야 파라미터가 쪼개지지 않습니다.",
                "전체 URL 주소(https://...)를 그대로 브라우저에 연결할 때는 프로토콜 구분자(:, //)를 보존하는 encodeURI를 사용하세요.",
                "공백 문자는 퍼센트 인코딩 시 %20 또는 +(application/x-www-form-urlencoded)로 변환될 수 있습니다.",
                "해시(#) 뒤의 프래그먼트 식별자는 서버로 전송되지 않으므로 파라미터로 넘길 때는 반드시 인코딩해야 합니다."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "encodeURIComponent와 encodeURI의 차이는 무엇인가요?", a: "encodeURIComponent는 &, =, /, ? 등 URL 예약 문자까지 모두 %XX로 인코딩하여 파라미터 값에 적합하고, encodeURI는 http://, /, ? 등 URL 기본 구조는 보존합니다." },
                { q: "한글이 %EA%B0%80 처럼 바뀌는 이유는 무엇인가요?", a: "인터넷 표준(RFC 3986)에서 URL은 ASCII 문자만 허용하므로, UTF-8 한글 바이트를 16진수 퍼센트 기호(%XX)로 표현하기 때문입니다." },
                { q: "입력한 URL이 서버에 저장되거나 추적되나요?", a: "아닙니다. 100% 클라이언트(브라우저) 환경에서만 작동하며 외부 네트워크 통신이 전혀 발생하지 않습니다." },
                { q: "디코딩 시 에러가 발생하는 이유는 무엇인가요?", a: "% 다음에 올바른 16진수 2자리가 오지 않거나 불완전하게 잘린 문자열이 있을 경우 발생합니다." },
                { q: "모바일 브라우저에서도 사용 가능한가요?", a: "네! 스마트폰과 태블릿의 모든 모바일 웹 브라우저에서 동일하게 편리하게 작동합니다." },
                { q: "완전 무료인가요?", a: "네, 아무런 제한 없이 영구적으로 완전 무료로 제공됩니다." }
              ],
              relatedTools: [
                { title: "Base64 인코더 / 디코더", desc: "텍스트 및 파일 데이터를 Base64로 즉시 변환", href: "/tools/base64/" },
                { title: "JSON 정렬 / 유효성 검사기", desc: "JSON 포맷팅 및 문법 오류 실시간 진단", href: "/tools/json-formatter/" },
                { title: "JWT 디코더 & 토큰 분석기", desc: "JWT Header, Payload 실시간 복호화 및 만료 시간 확인", href: "/tools/jwt-decoder/" },
                { title: "QR 코드 생성기", desc: "인코딩된 URL이나 텍스트로 고해상도 QR 코드 생성", href: "/tools/qr-generator/" }
              ]
            },
            en: {
              aboutTitle: "About URL / Percent Encoder & Decoder",
              aboutDesc:
                "Safely convert reserved characters, spaces, and international Unicode text into RFC 3986 compliant percent-encoded strings (%XX) or decode them back into human-readable text. Built with dual-mode support for both encodeURIComponent (query values) and encodeURI (full URLs). 100% client-side execution guarantees your query strings and API keys never leave your browser.",
              howTitle: "How to Encode and Decode URLs",
              steps: [
                "Select either 'Encode URL' or 'Decode URL' from the top toolbar.",
                "When encoding, choose 'encodeURIComponent' for query parameters or 'encodeURI' for complete URLs.",
                "Paste or type your URL / string into the left input editor.",
                "The percent-encoded or decoded string will appear instantly in real-time on the right.",
                "Click 'Copy Result' to paste the URL safely into your code or web requests."
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "RFC 3986 Standard Compliance", desc: "Converts characters to accurate UTF-8 percent-encoded (%XX) escape sequences." },
                { title: "Dual Encoding Modes", desc: "Switch seamlessly between encodeURIComponent for parameters and encodeURI for whole web links." },
                { title: "100% Client-Side Processing", desc: "Zero server uploads. Your confidential URLs, tokens, and endpoints remain completely private." },
                { title: "Instant Swap & Sample Testing", desc: "Swap inputs and outputs in one click to verify round-trip URL encoding accuracy." }
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "REST API Query Parameter Construction", desc: "Ensure spaces, ampersands (&), and quotes in search parameters do not break HTTP requests." },
                { title: "OAuth / SSO Redirect URL Passing", desc: "Safely wrap callback destination URLs (e.g. redirect_uri=https%3A%2F%2F...) as query params." },
                { title: "International Unicode URL Formatting", desc: "Format Asian, Cyrillic, or emoji-containing URLs for universal web sharing." },
                { title: "Web Server Log Inspection", desc: "Decode %20, %2F, and percent-encoded paths in Apache, Nginx, or Cloudflare logs." }
              ],
              proTipsTitle: "Professional Tips for URL Encoding",
              proTips: [
                "Always use encodeURIComponent when passing values for specific query parameters like '?query=...'.",
                "Use encodeURI only when you want to preserve protocol symbols (https://) and path delimiters (/).",
                "Spaces can be encoded as '%20' (standard) or '+' (form data application/x-www-form-urlencoded).",
                "Hash fragments (#) must be encoded if they need to reach backend servers as parameter values."
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "What is the difference between encodeURI and encodeURIComponent?", a: "encodeURI preserves protocol and domain syntax (http://, /, ?), whereas encodeURIComponent encodes all reserved characters for query parameter values." },
                { q: "Why do international characters turn into %XX?", a: "The HTTP/URI standard only permits ASCII characters. Non-ASCII characters are represented by UTF-8 bytes prefixed with '%'." },
                { q: "Is any data recorded on your server?", a: "No. All operations run 100% inside your local browser with no external requests." },
                { q: "Why did I get an 'Invalid URL format' error during decoding?", a: "This happens if the input has an incomplete percent sequence like '%' without two valid hex digits." },
                { q: "Does this tool work on mobile devices?", a: "Yes, it is fully responsive and optimized for touch screens on iOS and Android." },
                { q: "Is this tool completely free?", a: "Yes, it is 100% free with unlimited conversions." }
              ],
              relatedTools: [
                { title: "Base64 Encoder & Decoder", desc: "Convert text and binary payloads to and from Base64", href: "/tools/base64/" },
                { title: "JSON Formatter & Validator", desc: "Prettify, minify, and validate JSON data in real-time", href: "/tools/json-formatter/" },
                { title: "JWT Token Decoder", desc: "Decode and inspect JSON Web Token header and payload claims", href: "/tools/jwt-decoder/" },
                { title: "QR Code Generator", desc: "Generate customizable high-resolution QR codes from URLs", href: "/tools/qr-generator/" }
              ]
            },
            ja: {
              aboutTitle: "URL エンコーダー / デコーダー（パーセントエンコード）について",
              aboutDesc:
                "Web アドレス（URI）に直接含めることができない日本語、スペース、特殊記号（&、?、=、# など）をインターネット標準（RFC 3986）に準拠したパーセントエンコード（%XX）形式に変換または復元するオンラインツールです。クエリパラメータ用の encodeURIComponent と URL 全体用の encodeURI の両方に完全対応。100% ブラウザローカル処理で安全にご利用いただけます。",
              howTitle: "URL エンコード・デコードの使い方",
              steps: [
                "上部のツールバーで「URL エンコード」または「URL デコード」を選択します。",
                "エンコード時は目的に応じて「encodeURIComponent (パラメータ用)」または「encodeURI (URL 全体)」を指定します。",
                "左側の入力エリアに変換したい文字列や URL を入力します。",
                "右側の結果エリアにリアルタイムでパーセントエンコード文字列または復元 URL が出力されます。",
                "「結果をコピー」ボタンをクリックして開発コードやリンクに適用します。"
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "RFC 3986 標準パーセントエンコード準拠", desc: "Web 標準に正確に準拠した UTF-8 バイト列ベースのエスケープ変換を実施します。" },
                { title: "encodeURIComponent & encodeURI 切り替え", desc: "個別パラメータのみを変換するか、http:// 構造を維持するかをワンタップで切り替え可能です。" },
                { title: "100% ブラウザ内ローカル処理", desc: "検索キーワードやトークン情報が外部サーバーへ送信されることは一切ありません。" },
                { title: "ワンクリック双方向スワップ", desc: "結果を入力に反映させ、エンコードとデコードの整合性を素早く検証できます。" }
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "REST API GET クエリ文字列の作成", desc: "スペースや & を含む検索パラメータを安全に API へ送信" },
                { title: "リダイレクト先 URL のパラメータ化", desc: "redirect_uri に渡す URL 文字列を安全にエスケープ処理" },
                { title: "日本語 URL の安全な共有", desc: "チャットツールやメールでリンク切れを防ぐためにパーセントエンコード化" },
                { title: "Web サーバーログ（%XX）の解析", desc: "Apache や Nginx のアクセスログに記録されたエンコード文字列を日本語にデコード" }
              ],
              proTipsTitle: "URL エンコードのプロのテクニック",
              proTips: [
                "クエリパラメータ（?key=value）の value には、& や = も変換する encodeURIComponent を使用してください。",
                "URL 全体をそのままリンクにする場合は、プロトコル区切り（://）を残す encodeURI を使用します。",
                "スペースは通常 %20 に変換されますが、フォーム送信仕様では + に変換される場合もあります。",
                "ハッシュタグ（#）はサーバーに送信されないため、パラメータとして渡す場合は必ずエンコードが必要です。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "encodeURI と encodeURIComponent の違いは何ですか？", a: "encodeURI は http:// や / などの URL 構造を保持し、encodeURIComponent はそれらも含めてすべて %XX に変換します。" },
                { q: "日本語が %E3%81... になる理由は何ですか？", a: "URL 規格では ASCII 文字のみが許可されているため、UTF-8 日本語を 16 進数パーセント形式で表現しているためです。" },
                { q: "入力したデータがサーバーに記録されることはありますか？", a: "ありません。すべてお使いのブラウザ内部で安全に処理されます。" },
                { q: "デコード時にエラーが出る原因は何ですか？", a: "% の後ろに正しい 16 進数が 2 桁続いていない場合にエラーとなります。" },
                { q: "スマートフォンでも使えますか？", a: "はい、iOS / Android のモバイルブラウザでも快適に動作します。" },
                { q: "無料で利用できますか？", a: "はい、回数無制限で完全無料にてご利用いただけます。" }
              ],
              relatedTools: [
                { title: "Base64 エンコーダー / デコーダー", desc: "文字列とバイナリデータを Base64 形式で相互変換", href: "/tools/base64/" },
                { title: "JSON 整形・バリデーター", desc: "JSON の整形、圧縮、構文エラー検証", href: "/tools/json-formatter/" },
                { title: "JWT デコーダー & トークン解析", desc: "JWT のヘッダーとペイロードをリアルタイム解析", href: "/tools/jwt-decoder/" },
                { title: "QR コード生成器", desc: "URL やテキストから高解像度 QR コードを即座に作成", href: "/tools/qr-generator/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Codificador y Decodificador de URL",
              aboutDesc:
                "Convierte caracteres especiales, espacios y texto internacional en formato seguro de codificación por porcentaje (%XX) según la norma RFC 3986 o decodifícalos de nuevo a texto legible. Ofrece soporte para encodeURIComponent (parámetros de consulta) y encodeURI (URLs completas). Procesamiento 100% en el navegador que garantiza total confidencialidad.",
              howTitle: "Cómo Codificar y Decodificar URLs",
              steps: [
                "Selecciona el modo 'Codificar URL' o 'Decodificar URL' en la barra superior.",
                "Al codificar, elige 'encodeURIComponent' para valores o 'encodeURI' para enlaces enteros.",
                "Escribe o pega la dirección URL en el editor de la izquierda.",
                "El resultado codificado o decodificado se mostrará de forma instantánea a la derecha.",
                "Haz clic en 'Copiar Resultado' para utilizar la URL limpia en tus proyectos."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Estándar RFC 3986 Oficial", desc: "Garantiza secuencias de escape porcentual UTF-8 exactas y universalmente compatibles." },
                { title: "Doble Modo encodeURIComponent / encodeURI", desc: "Decide si proteger solo los valores de los parámetros o preservar la estructura http://." },
                { title: "Privacidad 100% en el Navegador", desc: "Ninguna dirección URL o token se envía a servidores externos." },
                { title: "Intercambio Rápido (Swap)", desc: "Invierte el sentido de la conversión en un solo clic para verificar la integridad." }
              ],
              useCasesTitle: "Casos de Uso Comunes",
              useCases: [
                { title: "Parámetros de Consulta en APIs REST", desc: "Evita que caracteres como & o = rompan las cadenas de consulta en solicitudes HTTP." },
                { title: "Paso de URLs de Redirección (OAuth / SSO)", desc: "Empaqueta URLs de destino completas como parámetros de retorno seguros." },
                { title: "Enlaces Web con Tildes y Acentos", desc: "Formatea direcciones en español para compartirlas sin enlaces rotos en mensajería." },
                { title: "Análisis de Registros de Servidor (%XX)", desc: "Decodifica peticiones registradas en logs de Apache o Nginx a texto legible." }
              ],
              proTipsTitle: "Consejos Profesionales sobre URLs",
              proTips: [
                "Utiliza encodeURIComponent para valores individuales dentro de la query (?param=valor).",
                "Usa encodeURI si necesitas mantener la estructura completa de un enlace (https://...).",
                "Los espacios pueden representarse como %20 o como + en formularios web.",
                "El identificador de fragmento (#) debe codificarse si se desea enviar al servidor backend."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Cuál es la diferencia entre encodeURI y encodeURIComponent?", a: "encodeURI preserva la estructura de protocolo y ruta (http://, /, ?), mientras que encodeURIComponent codifica todo para valores de parámetros." },
                { q: "¿Por qué los acentos se convierten en %XX?", a: "Las URLs solo admiten caracteres ASCII básicos. Los caracteres Unicode se representan mediante bytes UTF-8 precedidos por '%'." },
                { q: "¿Se guardan mis URLs en algún servidor?", a: "No. Todo el procesamiento se realiza localmente en tu navegador." },
                { q: "¿Por qué aparece un error al decodificar?", a: "Ocurre cuando la cadena contiene un símbolo '%' que no va seguido de dos dígitos hexadecimales válidos." },
                { q: "¿Funciona en móviles?", a: "Sí, es totalmente compatible con smartphones y tablets." },
                { q: "¿Es completamente gratuito?", a: "Sí, 100% gratuito e ilimitado." }
              ],
              relatedTools: [
                { title: "Codificador / Decodificador Base64", desc: "Convierte texto y archivos a formato Base64", href: "/tools/base64/" },
                { title: "Formateador y Validador JSON", desc: "Embellece, valida y minifica datos JSON", href: "/tools/json-formatter/" },
                { title: "Decodificador de Tokens JWT", desc: "Inspecciona el contenido de tokens web JSON en vivo", href: "/tools/jwt-decoder/" },
                { title: "Generador de Códigos QR", desc: "Crea códigos QR personalizados a partir de URLs", href: "/tools/qr-generator/" }
              ]
            },
            zh: {
              aboutTitle: "关于 URL 编码 / 解码器（百分号编码）",
              aboutDesc:
                "支持将网址中的中文、空格及特殊保留字符（&, ?, =, # 等）转换为符合 RFC 3986 国际标准的百分号编码（%XX）格式，或将乱码般的 URL 还原为人类可读的原始文本。完美支持 encodeURIComponent（针对参数值）与 encodeURI（针对完整链接）双模式。所有计算 100% 在本地浏览器完成，绝不泄露任何接口与敏感参数。",
              howTitle: "如何使用 URL 编码与解码",
              steps: [
                "在顶部工具栏切换“URL 编码”或“URL 解码”模式。",
                "编码时根据需求选择“encodeURIComponent (参数专用)”或“encodeURI (保留完整结构)”。",
                "在左侧输入框中粘贴待处理的 URL 链接或文本。",
                "右侧结果窗口将即时显示百分号编码或解码还原后的清晰文本。",
                "点击“复制结果”一键将转换后的链接应用到项目或接口调试中。"
              ],
              featuresTitle: "核心功能与特点",
              features: [
                { title: "严格符合 RFC 3986 编码标准", desc: "基于 UTF-8 字节流生成标准 %-Escape 转义字符，兼容所有现代 Web 服务器。" },
                { title: "encodeURIComponent / encodeURI 自由切换", desc: "既可转义所有保留字符保护参数，也可保留 http:// 结构生成有效超链接。" },
                { title: "100% 客户端本地安全计算", desc: "查询词、Token 与私有 API 绝无外部上传风险，安全私密。" },
                { title: "一键反向互转 (Swap)", desc: "轻松反转输入输出，秒级校验编码与解码的完整性。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "REST API GET 请求参数拼接", desc: "将带有空格、&、= 的搜索关键词与过滤条件安全转义为 URL 쿼리 파라미터。" },
                { title: "OAuth / SSO 回调 Redirect URL 传递", desc: "将完整的回调地址（redirect_uri）作为参数安全嵌套在登录请求中。" },
                { title: "中文网址安全分享与传播", desc: "对包含中文字符的网页链接进行规范化编码，防止聊天软件中断链接。" },
                { title: "服务器访问日志 (%XX) 还原", desc: "将 Nginx 或 Apache 日志中的 %E4%BD... 百分号编码一键还原为中文路径。" }
              ],
              proTipsTitle: "URL 编码专业技巧",
              proTips: [
                "拼接查询参数值（value）时务必使用 encodeURIComponent，防止 & 或 = 将参数错误截断。",
                "分享整个网页地址时建议使用 encodeURI，以保留协议（https://）与路径斜杠（/）。",
                "空格字符在标准 URL 中编码为 %20，在表单提交（x-www-form-urlencoded）中常被转换为 '+'。",
                "锚点标识符（#）后的内容不会被发送到后端服务器，如需作为参数传递必须先行编码。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "encodeURI 与 encodeURIComponent 有何区别？", a: "encodeURI 会保留 http://、/、? 等基础网址结构；encodeURIComponent 会把所有特殊字符转为 %XX，专用于参数值。" },
                { q: "为什么中文字符会变成 %XX？", a: "因为 URL 标准仅支持基础 ASCII 字符，中文等多字节字符必须通过 UTF-8 字节并以十六进制百分号格式传输。" },
                { q: "输入的 URL 会被记录在服务器上吗？", a: "绝对不会。所有编解码操作 100% 在您本地浏览器中计算。" },
                { q: "解码时报错是什么原因？", a: "通常是因为输入的字符串中存在不完整的百分号（如 '%' 后面没有紧随 2 位有效的十六进制数字）。" },
                { q: "手机端可以使用吗？", a: "可以，完全兼容移动端浏览器。" },
                { q: "完全免费吗？", a: "100% 永久免费，无任何限制。" }
              ],
              relatedTools: [
                { title: "Base64 编码 / 解码工具", desc: "文本与二进制数据的 Base64 双向即时转换", href: "/tools/base64/" },
                { title: "JSON 格式化与校验工具", desc: "JSON 数据美化、压缩与语法错误实时排查", href: "/tools/json-formatter/" },
                { title: "JWT Token 实时解码器", desc: "解析 JSON Web Token 的 Header 与 Payload 声明", href: "/tools/jwt-decoder/" },
                { title: "QR 二维码生成器", desc: "将 URL 或文本生成为高清可自定义的二维码", href: "/tools/qr-generator/" }
              ]
            },
            fr: {
              aboutTitle: "À propos de l'Encodeur et Décodeur d'URL",
              aboutDesc:
                "Convertissez les caractères spéciaux, espaces et textes internationaux en séquences d'échappement conformes à la norme RFC 3986 (%XX) ou décodez des URL encodées en clair. Prend en charge les modes encodeURIComponent (pour les valeurs de paramètres) et encodeURI (pour les URL complètes). Traitement 100% local dans votre navigateur sans fuite de données.",
              howTitle: "Comment Encoder et Décoder vos URL",
              steps: [
                "Sélectionnez le mode 'Encoder URL' ou 'Décoder URL' dans la barre supérieure.",
                "Choisissez 'encodeURIComponent' pour les paramètres ou 'encodeURI' pour les URL complètes.",
                "Tapez ou collez votre chaîne dans l'éditeur de gauche.",
                "Le résultat s'affiche instantanément en temps réel dans le volet de droite.",
                "Cliquez sur 'Copier le résultat' pour intégrer votre URL propre dans votre code."
              ],
              featuresTitle: "Fonctionnalités Clés",
              features: [
                { title: "Conformité Stricte RFC 3986", desc: "Encode précisément vos caractères en octets UTF-8 précédés du symbole pourcentage." },
                { title: "Double Mode encodeURIComponent / encodeURI", desc: "Choisissez d'échapper tous les séparateurs ou de préserver la structure http://." },
                { title: "Confidentialité 100% Côté Client", desc: "Aucun paramètre ni jeton n'est envoyé sur un serveur externe." },
                { title: "Permutation Instantanée (Swap)", desc: "Inversez entrée et sortie en un clic pour tester la réversibilité." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Paramètres de Requêtes d'API REST", desc: "Évitez que des caractères comme &, = ou ? ne faussent vos requêtes HTTP." },
                { title: "Transmission d'URL de Redirection (OAuth)", desc: "Encapsulez des adresses de retour complètes dans vos paramètres de connexion." },
                { title: "Partage d'URL avec Caractères Accentués", desc: "Formatez vos liens français pour éviter les erreurs de navigation." },
                { title: "Analyse de Logs de Serveur Web", desc: "Décodez les chaînes %XX enregistrées dans les journaux Apache ou Nginx." }
              ],
              proTipsTitle: "Conseils d'Experts sur les URL",
              proTips: [
                "Utilisez toujours encodeURIComponent pour les valeurs associées aux clés de requête (?search=valeur).",
                "Utilisez encodeURI si vous souhaitez préserver la structure complète d'un lien (https://...).",
                "Les espaces peuvent être codés en %20 ou en + dans les formulaires web.",
                "Les identifiants d'ancre (#) doivent être encodés s'ils doivent être envoyés au serveur."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Quelle est la différence entre encodeURI et encodeURIComponent ?", a: "encodeURI conserve la syntaxe du protocole (http://, /, ?), tandis que encodeURIComponent convertit tous les caractères réservés pour les paramètres." },
                { q: "Pourquoi les accents se transforment-ils en %XX ?", a: "La norme URL n'autorise que les caractères ASCII. Les caractères Unicode sont donc transcrits en octets hexadécimaux précédés de '%'." },
                { q: "Mes données sont-elles enregistrées ?", a: "Non. Tout le traitement s'exécute à 100% dans la mémoire de votre navigateur." },
                { q: "Pourquoi le décodage échoue-t-il parfois ?", a: "Une erreur survient si la chaîne contient un caractère '%' non suivi de deux chiffres hexadécimaux valides." },
                { q: "L'outil est-il disponible sur mobile ?", a: "Oui, parfaitement accessible sur tous les navigateurs mobiles." },
                { q: "L'outil est-il gratuit ?", a: "Oui, 100% gratuit et sans limite." }
              ],
              relatedTools: [
                { title: "Encodeur / Décodeur Base64", desc: "Convertissez textes et fichiers au format Base64", href: "/tools/base64/" },
                { title: "Formateur & Validateur JSON", desc: "Mise en page, compression et validation de JSON", href: "/tools/json-formatter/" },
                { title: "Décodeur de Tokens JWT", desc: "Décodez les en-têtes et charges utiles de JSON Web Tokens", href: "/tools/jwt-decoder/" },
                { title: "Générateur de QR Code", desc: "Créez des QR codes personnalisés haute résolution à partir d'URL", href: "/tools/qr-generator/" }
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
        @media (max-width: 900px) {
          .editor-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
