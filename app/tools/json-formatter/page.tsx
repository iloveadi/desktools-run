"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { useLocale } from "@/lib/context/LocaleContext";
import {
  Braces,
  ArrowLeft,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  AlertCircle,
  Trash2,
  Upload,
  FileCode,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const SAMPLE_JSON = JSON.stringify(
  {
    service: "desktools.run",
    version: "2.5.0",
    features: ["JSON Formatter", "Base64", "URL Encoder", "Regex Tester", "JWT Decoder"],
    security: {
      clientSideOnly: true,
      dataTransmission: "none",
      encryption: "AES-256 / SHA-256",
    },
    metrics: {
      activeUsers: 14200,
      rating: 4.95,
      isFree: true,
    },
  },
  null,
  2
);

export default function JsonFormatterPage() {
  const { locale, t } = useLocale();

  const [inputJson, setInputJson] = useState<string>(SAMPLE_JSON);
  const [outputJson, setOutputJson] = useState<string>(SAMPLE_JSON);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeIndent, setActiveIndent] = useState<number>(2);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatJson = (indent: number, targetText?: string) => {
    setActiveIndent(indent);
    const source = targetText !== undefined ? targetText : inputJson;
    if (!source.trim()) {
      setOutputJson("");
      setErrorMsg(null);
      return;
    }
    try {
      setErrorMsg(null);
      const parsed = JSON.parse(source);
      const formatted = indent === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
      setOutputJson(formatted);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid JSON syntax.");
      setOutputJson("");
    }
  };

  const handleInputChange = (val: string) => {
    setInputJson(val);
    if (!val.trim()) {
      setOutputJson("");
      setErrorMsg(null);
      return;
    }
    try {
      const parsed = JSON.parse(val);
      setErrorMsg(null);
      setOutputJson(activeIndent === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, activeIndent));
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid JSON syntax.");
    }
  };

  const copyToClipboard = () => {
    const textToCopy = outputJson || inputJson;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputJson("");
    setOutputJson("");
    setErrorMsg(null);
  };

  const loadSample = () => {
    setInputJson(SAMPLE_JSON);
    setOutputJson(SAMPLE_JSON);
    setErrorMsg(null);
    setActiveIndent(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputJson(content);
        formatJson(activeIndent, content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <ToolUsageTracker toolId="json-formatter" />
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Breadcrumb & Header */}
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
            <ArrowLeft size={14} /> {t("jsonFormatter.back") || "Back to Tools"}
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
              <Braces size={22} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("jsonFormatter.title") || "JSON Formatter & Validator"}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {t("jsonFormatter.subtitle") || "Prettify, minify, validate, and debug JSON data instantly with 100% client-side privacy."}
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
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => formatJson(2)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeIndent === 2 ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.06)",
                  border: activeIndent === 2 ? "none" : "1px solid var(--border-subtle)",
                  color: activeIndent === 2 ? "white" : "var(--text-primary)",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Maximize2 size={14} /> 2 Spaces
              </button>
              <button
                onClick={() => formatJson(4)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeIndent === 4 ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.06)",
                  border: activeIndent === 4 ? "none" : "1px solid var(--border-subtle)",
                  color: activeIndent === 4 ? "white" : "var(--text-primary)",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Maximize2 size={14} /> 4 Spaces
              </button>
              <button
                onClick={() => formatJson(0)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeIndent === 0 ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.06)",
                  border: activeIndent === 0 ? "none" : "1px solid var(--border-subtle)",
                  color: activeIndent === 0 ? "white" : "var(--text-primary)",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Minimize2 size={14} /> Minify (Compact)
              </button>

              <div style={{ width: "1px", height: "24px", background: "var(--border-subtle)", margin: "0 4px" }} />

              <button
                onClick={loadSample}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)",
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
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)",
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
                <Upload size={14} /> Load .json
              </button>
              <input ref={fileInputRef} type="file" accept=".json,.txt" style={{ display: "none" }} onChange={handleFileUpload} />
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
                disabled={!outputJson && !inputJson}
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
                {copied ? (t("jsonFormatter.copied") || "Copied!") : (t("jsonFormatter.copyResult") || "Copy Result")}
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {errorMsg ? (
            <div
              className="glass-card"
              style={{
                padding: "14px 18px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13.5px",
                fontWeight: 600,
                borderRadius: "10px",
              }}
            >
              <AlertCircle size={18} />
              <div>
                <strong>Syntax Error:</strong> {errorMsg}
              </div>
            </div>
          ) : (
            inputJson.trim() && (
              <div
                className="glass-card"
                style={{
                  padding: "10px 18px",
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#4ade80",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "10px",
                }}
              >
                <CheckCircle2 size={16} /> Valid JSON structure
              </div>
            )
          )}

          {/* Editors Grid */}
          <div className="editor-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Input Editor */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileCode size={16} color="#818cf8" />
                  {t("jsonFormatter.inputJson") || "Input Raw JSON"}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {inputJson.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                rows={18}
                value={inputJson}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste or type JSON string here..."
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
                  resize: "vertical",
                }}
              />
            </div>

            {/* Formatted Output Editor */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} color="#818cf8" />
                  {t("jsonFormatter.formattedOutput") || "Formatted & Validated Output"}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {outputJson.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                readOnly
                rows={18}
                value={outputJson}
                placeholder="Formatted JSON will appear here..."
                style={{
                  width: "100%",
                  height: "460px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--border-subtle)",
                  color: errorMsg ? "#f87171" : "#4ade80",
                  padding: "14px",
                  fontSize: "13.5px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
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
              aboutTitle: "JSON 정렬 및 실시간 유효성 검사기 소개",
              aboutDesc:
                "복잡하고 압축되어 읽기 힘든 JSON 데이터를 2칸, 4칸 들여쓰기로 보기 쉽게 정렬(Prettify)하거나, 공백을 완전히 제거하여 네트워크 전송량을 줄이는 압축(Minify)을 실시간으로 수행합니다. 브라우저 내부 자바스크립트 엔진에서 100% 로컬 연산되므로 API 토큰, 사용자 DB 덤프, 비밀번호가 포함된 데이터도 서버 전송 없이 절대적으로 안전합니다.",
              howTitle: "JSON 정렬 및 검증기 사용 방법",
              steps: [
                "왼쪽 입력창에 JSON 텍스트를 직접 붙여넣거나 'Load .json' 버튼을 눌러 파일을 불러옵니다.",
                "실시간 문법 검사기가 작동하여 쉼표 누락, 따옴표 에러, 괄호 불일치 등 문법 오류를 즉시 탐지합니다.",
                "상단 툴바에서 '2 Spaces', '4 Spaces' 또는 공백 제거용 'Minify' 버튼을 선택합니다.",
                "우측 결과창에 즉시 포맷팅된 깨끗한 JSON 코드가 하이라이트와 함께 출력됩니다.",
                "'결과 복사' 버튼을 눌러 클립보드에 복사하거나 프로젝트 소스코드/API 요청에 바로 활용하세요."
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "100% 클라이언트 로컬 연산", desc: "모든 파싱과 검증이 사용자의 브라우저 내에서만 실행되며 서버로 단 1바이트도 전송되지 않습니다." },
                { title: "실시간 구문 오류(Syntax Error) 진단", desc: "잘못된 콤마(Trailing Comma), 홑따옴표 사용, 닫히지 않은 괄호를 실시간으로 찾아 에러 메시지를 표시합니다." },
                { title: "2칸 / 4칸 들여쓰기 & 원클릭 Minify", desc: "개발 환경 및 코드 컨벤션에 맞춰 들여쓰기 간격을 조절하거나 프로덕션용 최소화 코드를 생성합니다." },
                { title: "대용량 JSON 파일 불러오기 지원", desc: "수 메가바이트(MB) 단위의 대용량 JSON 파일도 버벅임 없이 즉시 로드하여 정렬합니다." }
              ],
              useCasesTitle: "주요 활용 분야",
              useCases: [
                { title: "REST API 응답 디버깅", desc: "한 줄로 압축되어 전달되는 백엔드 API 응답 페이로드를 구조화하여 필드값과 중첩 객체를 분석합니다." },
                { title: "설정 파일 및 패키지 관리", desc: "package.json, tsconfig.json, settings.json 등 프로젝트 설정 파일의 문법 유효성을 검사합니다." },
                { title: "웹 서비스 네트워크 최적화", desc: "웹 앱 번들에 포함할 데이터셋의 모든 불필요한 줄바꿈과 공백을 Minify하여 전송 속도를 극대화합니다." },
                { title: "데이터베이스 덤프 데이터 분석", desc: "MongoDB, DynamoDB, PostgreSQL JSONB 필드에서 추출한 비구조화 데이터를 정렬해 가독성을 확보합니다." }
              ],
              proTipsTitle: "JSON 다루기 전문가 실무 팁",
              proTips: [
                "JSON 표준 사양(RFC 8259)에서는 작은따옴표(') 대신 반드시 큰따옴표(\")만을 Key와 String 값에 허용합니다.",
                "마지막 속성 뒤에 쉼표가 붙는 Trailing Comma는 JSON 파싱 에러의 가장 흔한 원인이므로 유의하세요.",
                "undefined나 함수(Function), Symbol은 JSON.stringify 변환 시 자동으로 누락되거나 null로 치환됩니다.",
                "대용량 데이터를 전송할 때는 2칸 들여쓰기 대신 Minify 압축 모드를 사용하면 페이로드 크기를 20~40% 줄일 수 있습니다."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "입력한 JSON 데이터가 외부 서버에 저장되거나 유출될 위험이 있나요?", a: "전혀 없습니다. desktools.run의 모든 처리는 브라우저 내부 V8 엔진에서 로컬로 실행되므로 외부 통신이 일체 발생하지 않습니다." },
                { q: "JSON 파일(.json)을 직접 업로드하여 정렬할 수 있나요?", a: "네, 상단 툴바의 'Load .json' 버튼을 눌러 로컬 컴퓨터의 JSON 파일을 즉시 읽어올 수 있습니다." },
                { q: "Prettify와 Minify는 무엇이 다른가요?", a: "Prettify는 들여쓰기와 줄바꿈을 추가해 사람이 읽기 쉽게 정렬하는 것이고, Minify는 모든 공백을 제거해 파일 크기를 최소화하는 것입니다." },
                { q: "문법 오류가 발생했을 때 어떻게 찾나요?", a: "JSON 문법 오류가 감지되면 상단에 붉은색 경고창과 함께 오류 원인(구문 불일치, 위치 등)이 실시간 표시됩니다." },
                { q: "키(Key)에 따옴표가 없는 JavaScript 객체도 변환되나요?", a: "엄격한 JSON 표준에 따라 키에 큰따옴표가 감싸져 있어야 정상 파싱됩니다." },
                { q: "이용료나 사용량 제한이 있나요?", a: "완전 무료이며 횟수나 용량 제한 없이 무제한으로 사용하실 수 있습니다." }
              ],
              relatedTools: [
                { title: "Base64 인코더 / 디코더", desc: "문자열 및 데이터를 Base64로 즉시 변환", href: "/tools/base64/" },
                { title: "JWT 디코더 & 분석기", desc: "JSON Web Token(JWT)의 Header와 Payload 실시간 디코딩", href: "/tools/jwt-decoder/" },
                { title: "URL 인코더 / 디코더", desc: "URI 쿼리 파라미터 및 특수문자 퍼센트 인코딩", href: "/tools/url-encoder/" },
                { title: "정규표현식(Regex) 테스터", desc: "실시간 매칭 및 하이라이트로 Regex 디버깅", href: "/tools/regex-tester/" }
              ]
            },
            en: {
              aboutTitle: "About JSON Formatter, Prettifier & Validator",
              aboutDesc:
                "Easily prettify, minify, and validate JSON data in real-time. Whether analyzing complex API responses, debugging configurations, or compressing data for production, desktools.run provides blazing-fast processing directly within your browser. 100% client-side execution ensures your API keys, credentials, and confidential database records are never uploaded to any server.",
              howTitle: "How to Format and Validate JSON",
              steps: [
                "Paste your raw JSON text into the left input editor or click 'Load .json' to open a local file.",
                "The real-time parser automatically validates your JSON syntax and alerts you to any errors instantly.",
                "Choose your preferred indentation: '2 Spaces', '4 Spaces', or 'Minify' (compact single line).",
                "Review the cleanly formatted, syntax-validated output on the right pane.",
                "Click 'Copy Result' to save the output to your clipboard for your codebases or API payloads."
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "100% Client-Side Privacy", desc: "All JSON formatting runs locally in your browser memory with zero network uploads or logging." },
                { title: "Instant Syntax Error Diagnostics", desc: "Pinpoints syntax mistakes such as unquoted keys, trailing commas, and missing braces." },
                { title: "Flexible Indentation & Minification", desc: "Quickly switch between 2-space, 4-space indentations, or production-ready minified output." },
                { title: "File Import & Large Dataset Support", desc: "Easily load and format multi-megabyte JSON configuration files smoothly." }
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "API Response Inspection", desc: "Prettify compact JSON responses from REST or GraphQL endpoints for rapid debugging." },
                { title: "Config File Management", desc: "Validate and beautify package.json, tsconfig.json, and CI/CD pipelines configuration files." },
                { title: "Payload Size Optimization", desc: "Minify JSON structures before embedding them into client bundles to boost web performance." },
                { title: "NoSQL Database Analysis", desc: "Inspect document models and JSONB exports from MongoDB, PostgreSQL, or DynamoDB with clarity." }
              ],
              proTipsTitle: "Professional Tips for Handling JSON",
              proTips: [
                "Standard JSON (RFC 8259) strictly requires double quotes (\") for both keys and string values. Single quotes are invalid.",
                "Trailing commas after the last property in an object or array are invalid in standard JSON and will cause parse errors.",
                "undefined values and functions are omitted by standard JSON serialization, while NaN and Infinity become null.",
                "Use Minification for high-throughput production network payloads to reduce bandwidth by up to 40%."
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "Is my JSON data sent to any remote server?", a: "No. All parsing and formatting occur 100% locally in your browser with complete privacy." },
                { q: "Can I upload a .json file directly?", a: "Yes, use the 'Load .json' button to select and format files from your local storage." },
                { q: "What is the difference between Prettify and Minify?", a: "Prettify adds indentation and newlines for human readability, while Minify strips all unnecessary whitespace to minimize payload size." },
                { q: "How does error detection work?", a: "The tool actively checks JSON syntax in real-time and displays precise error details when issues arise." },
                { q: "Does it support JavaScript Object literals with unquoted keys?", a: "Standard JSON requires keys to be enclosed in double quotes. Ensure quotes are present for valid JSON." },
                { q: "Is this tool completely free?", a: "Yes, it is 100% free with no limits on usage or file sizes." }
              ],
              relatedTools: [
                { title: "Base64 Encoder & Decoder", desc: "Convert text and binary payloads to and from Base64", href: "/tools/base64/" },
                { title: "JWT Token Decoder", desc: "Decode and inspect JSON Web Token header and payload claims", href: "/tools/jwt-decoder/" },
                { title: "URL Percent Encoder / Decoder", desc: "Encode query parameters and URI components safely", href: "/tools/url-encoder/" },
                { title: "Regex Tester & Debugger", desc: "Test regular expressions in real-time with match highlighting", href: "/tools/regex-tester/" }
              ]
            },
            ja: {
              aboutTitle: "JSON 整形・バリデーター（検証ツール）について",
              aboutDesc:
                "圧縮されて読みにくい JSON データをワンクリックで 2 スペース / 4 スペースにインデント整形（Prettify）したり、余分な空白を削除して軽量化（Minify）する高速開発者ツールです。すべての処理がブラウザローカル（クライアント側）で実行されるため、API キーや機密データが外部サーバーに送信される心配はありません。",
              howTitle: "JSON 整形・検証ツールの使い方",
              steps: [
                "左側の入力エリアに JSON 文字列を貼り付けるか、「Load .json」ボタンでファイルを読み込みます。",
                "リアルタイム構文チェッカーが不正なカンマや引用符の誤りを即座に検出します。",
                "ツールバーから「2 Spaces」「4 Spaces」または「Minify」を選択します。",
                "右側の結果エリアに整形済みの綺麗な JSON がハイライト付きで出力されます。",
                "「結果をコピー」ボタンをクリックして、クリップボード経由で開発環境に貼り付けます。"
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "100% ブラウザ内ローカル処理", desc: "データは一切外部サーバーに送信されず、機密性の高いトークンや顧客データも安全に扱えます。" },
                { title: "リアルタイム構文エラー診断", desc: "末尾カンマやシングルクォートなどの文法エラー箇所を即座に特定・表示します。" },
                { title: "2/4 スペースインデント & 最小化", desc: "開発チームのコーディング規約に合わせた整形や本番用圧縮が瞬時に完了します。" },
                { title: "ローカル JSON ファイル読み込み対応", desc: "ファイル選択から大容量の JSON 設定ファイルも高速にロードして整形します。" }
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "REST / GraphQL API のレスポンス解析", desc: "1行に圧縮された API レスポンスを整形してオブジェクト階層を直感的に把握" },
                { title: "package.json や tsconfig の検証", desc: "プロジェクト設定ファイルの文法ミスや記述漏れを素早く確認" },
                { title: "データ転送量の最適化 (Minify)", desc: "Web アプリにバンドルする JSON データを圧縮して読み込み速度を向上" },
                { title: "NoSQL / JSONB データのデバッグ", desc: "MongoDB や PostgreSQL の JSON 出力を可読性の高いフォーマットに変換" }
              ],
              proTipsTitle: "JSON 取り扱いのプロのテクニック",
              proTips: [
                "JSON 標準（RFC 8259）ではキーと文字列値に必ずダブルクォーテーション（\"）を使用する必要があります。",
                "末尾の余分なカンマ（Trailing Comma）は構文エラーの原因となるため注意しましょう。",
                "undefined や関数は JSON 変換時に除外され、NaN や Infinity は null に変換されます。",
                "本番通信では Minify 圧縮を行うことでデータサイズを最大 40% 削減できます。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "入力したデータがサーバーに送信されることはありますか？", a: "ありません。すべての処理はブラウザの JavaScript エンジン内で完結します。" },
                { q: "ファイルを直接アップロードして整形できますか？", a: "はい、「Load .json」ボタンからお手元のファイルを読み込めます。" },
                { q: "Prettify と Minify の違いは何ですか？", a: "Prettify はインデントを入れて読みやすくする機能、Minify は空白を除去してサイズを小さくする機能です。" },
                { q: "構文エラーはどのように通知されますか？", a: "構文ミスがある場合、上部に赤い警告ボックスと具体的なエラー理由が表示されます。" },
                { q: "キーに引用符がない JS オブジェクトも扱えますか？", a: "標準 JSON 仕様に準拠するため、キーはダブルクォートで囲む必要があります。" },
                { q: "無料で利用できますか？", a: "はい、回数無制限で完全無料にてご利用いただけます。" }
              ],
              relatedTools: [
                { title: "Base64 エンコーダー / デコーダー", desc: "文字列とバイナリデータを Base64 形式で相互変換", href: "/tools/base64/" },
                { title: "JWT デコーダー & トークン解析", desc: "JSON Web Token のヘッダーとペイロードをリアルタイム解析", href: "/tools/jwt-decoder/" },
                { title: "URL エンコーダー / デコーダー", desc: "URL パラメータや特殊文字を安全にパーセントエンコード", href: "/tools/url-encoder/" },
                { title: "正規表現 (Regex) テスター", desc: "リアルタイムマッチングとハイライトで Regex をデバッグ", href: "/tools/regex-tester/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Formateador y Validador JSON",
              aboutDesc:
                "Embellece (Prettify), minifica y valida datos JSON en tiempo real con sangrías de 2 o 4 espacios. Ideal para depurar respuestas de API, verificar archivos de configuración y reducir tamaños de payload. Todo se procesa 100% en la memoria local de tu navegador, garantizando total privacidad sin enviar datos a servidores externos.",
              howTitle: "Cómo Formatear y Validar JSON",
              steps: [
                "Pega tu texto JSON en el editor izquierdo o pulsa 'Load .json' para cargar un archivo local.",
                "El analizador detecta en tiempo real cualquier error de sintaxis, comas sobrantes o comillas erróneas.",
                "Selecciona la sangría deseada: '2 Spaces', '4 Spaces' o 'Minify' para compactar.",
                "Revisa la salida estructurada y formateada en el panel derecho.",
                "Haz clic en 'Copiar Resultado' para pegar el JSON limpio en tu código o herramienta de pruebas."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Privacidad 100% en el Navegador", desc: "La validación y el formateo se ejecutan en tu dispositivo sin transmitir información a servidores." },
                { title: "Detección de Errores en Tiempo Real", desc: "Identifica comas finales, comillas simples y corchetes no cerrados al instante." },
                { title: "Sangrías Configurables y Minificación", desc: "Alterna fácilmente entre 2 espacios, 4 espacios o formato compacto para producción." },
                { title: "Carga de Archivos JSON Grandes", desc: "Importa archivos de configuración de varios megabytes de forma fluida." }
              ],
              useCasesTitle: "Casos de Uso Comunes",
              useCases: [
                { title: "Depuración de Respuestas de API", desc: "Formatea payloads compactos de servicios REST o GraphQL para analizar objetos anidados." },
                { title: "Validación de Archivos de Configuración", desc: "Revisa la sintaxis de package.json, tsconfig.json y archivos de despliegue." },
                { title: "Optimización de Ancho de Banda", desc: "Minifica estructuras JSON antes de transmitirlas por la red para reducir la latencia." },
                { title: "Análisis de Bases de Datos NoSQL", desc: "Visualiza documentos exportados de MongoDB, PostgreSQL JSONB o DynamoDB con claridad." }
              ],
              proTipsTitle: "Consejos Profesionales para Trabajar con JSON",
              proTips: [
                "El estándar JSON (RFC 8259) requiere estrictamente comillas dobles (\") tanto en claves como en valores de texto.",
                "Las comas sobrantes (Trailing Commas) al final de listas u objetos provocan errores de sintaxis en JSON.",
                "Los valores undefined y funciones se omiten al convertir a JSON, mientras que NaN e Infinity pasan a ser null.",
                "Utiliza Minify para reducir el tamaño de tus payloads hasta en un 40% antes del envío en entornos de producción."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Se envían mis datos JSON a algún servidor?", a: "No. Todo el análisis y formateo se realiza localmente en tu navegador sin transferencias externas." },
                { q: "¿Puedo cargar un archivo .json directamente?", a: "Sí, utiliza el botón 'Load .json' para seleccionar archivos desde tu equipo." },
                { q: "¿Cuál es la diferencia entre Prettify y Minify?", a: "Prettify añade sangrías y saltos de línea para lectura humana; Minify elimina espacios para reducir el tamaño." },
                { q: "¿Cómo se muestran los errores?", a: "Si hay un error sintáctico, aparece un aviso rojo detallando la causa exacta del fallo." },
                { q: "¿Se admiten claves sin comillas?", a: "El estándar JSON estricto requiere que todas las claves estén delimitadas por comillas dobles." },
                { q: "¿Tiene algún coste o límite?", a: "Es 100% gratuito, ilimitado y no requiere registro." }
              ],
              relatedTools: [
                { title: "Codificador / Decodificador Base64", desc: "Convierte texto y archivos a formato Base64", href: "/tools/base64/" },
                { title: "Decodificador de Tokens JWT", desc: "Decodifica headers y payloads de JSON Web Tokens al instante", href: "/tools/jwt-decoder/" },
                { title: "Codificador / Decodificador URL", desc: "Codifica caracteres especiales y parámetros de consulta", href: "/tools/url-encoder/" },
                { title: "Probador de Expresiones Regulares", desc: "Prueba y depura expresiones Regex con resaltado en vivo", href: "/tools/regex-tester/" }
              ]
            },
            zh: {
              aboutTitle: "关于 JSON 格式化与实时语法校验工具",
              aboutDesc:
                "快速将混乱、单行压缩的 JSON 数据格式化为排版优美、层次分明的 2 空格或 4 空格缩进（Prettify），或一键清除所有冗余空格进行极限压缩（Minify）。所有解析与校验算法 100% 在您本地浏览器内存中运行，无需担心 API 密钥、数据库凭据或用户隐私数据上传泄露。",
              howTitle: "如何格式化与校验 JSON 数据",
              steps: [
                "在左侧输入框中粘贴原始 JSON 文本，或点击“Load .json”按钮导入本地文件。",
                "实时语法引擎会自动检测语法错误、末尾多余逗号或引号不匹配等问题。",
                "在顶部工具栏选择缩进格式：“2 Spaces”、“4 Spaces”或用于压缩的“Minify”。",
                "在右侧输出框中即时获取格式化完毕、语法正确的标准 JSON 结构。",
                "点击“复制结果”将整理好的 JSON 一键带入剪贴板或项目中。"
              ],
              featuresTitle: "核心功能与优势",
              features: [
                { title: "100% 浏览器本地安全处理", desc: "完全依靠客户端 JavaScript 引擎计算，零网络上传，绝对保护机密数据隐私。" },
                { title: "实时语法错误精准定位", desc: "即时检测未加双引号的键名、末尾冗余逗号、缺少括号等常见 JSON 语法错误。" },
                { title: "多级缩进与单行压缩自由切换", desc: "支持 2 空格、4 空格规范排版及生产环境极致体积压缩 (Minify)。" },
                { title: "支持大容量 JSON 文件加载", desc: "轻松解析并美化数兆字节（MB）级别的大型数据接口与配置文件。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "REST / GraphQL API 接口调试", desc: "将后端返回的紧凑型 JSON 响应一键展开为清晰的树形对象结构。" },
                { title: "配置文件检查与美化", desc: "验证 package.json、tsconfig.json 以及各类部署脚本的正确性。" },
                { title: "网络传输体积极致优化", desc: "发布前去除 JSON 数据集中的所有空白换行，大幅削减网络流量消耗。" },
                { title: "NoSQL 数据库导出分析", desc: "清晰查看与分析 MongoDB、PostgreSQL JSONB 导出的非结构化数据。" }
              ],
              proTipsTitle: "JSON 处理专业技巧",
              proTips: [
                "根据标准 JSON 规范 (RFC 8259)，键名和字符串值必须使用双引号 (\")，单引号属于非法语法。",
                "对象或数组最后一项后面的逗号 (Trailing Comma) 是导致 JSON 解析失败的高频原因。",
                "undefined 和函数在 JSON 序列化时会被自动忽略，NaN 和 Infinity 会转换为 null。",
                "对于大流量生产环境接口，采用 Minify 压缩能够缩减 20%~40% 的传输体积。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "我的 JSON 数据会被上传到服务器吗？", a: "绝对不会。desktools.run 的所有操作 100% 在本地浏览器中完成，没有任何后端传输。" },
                { q: "可以直接上传 .json 文件进行排版吗？", a: "可以，点击顶部“Load .json”按钮即可直接读取本地计算机上的 JSON 文件。" },
                { q: "Prettify 与 Minify 的区别是什么？", a: "Prettify 是添加缩进换行方便人类阅读；Minify 是删除所有空格换行以减小文件体积。" },
                { q: "语法出错时如何提示？", a: "如果 JSON 存在语法问题，顶部会立即弹出红色警告框并明确指出错误原因。" },
                { q: "支持无引号键名的 JS 对象字面量吗？", a: "标准 JSON 格式要求键名必须使用双引号包裹，建议修正为标准语法后再解析。" },
                { q: "使用该工具收费吗？", a: "完全免费，无任何次数或文件大小限制。" }
              ],
              relatedTools: [
                { title: "Base64 编码 / 解码工具", desc: "文本与二进制数据的 Base64 双向即时转换", href: "/tools/base64/" },
                { title: "JWT Token 实时解码器", desc: "快速解析 JSON Web Token 的 Header 和 Payload 声明", href: "/tools/jwt-decoder/" },
                { title: "URL 编码 / 解码器", desc: "对 URI 网址参数与特殊字符进行百分号安全编码", href: "/tools/url-encoder/" },
                { title: "正则表达式 (Regex) 测试器", desc: "实时高亮匹配与正则语法快速调试", href: "/tools/regex-tester/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Formateur et Validateur JSON",
              aboutDesc:
                "Formatez (Prettify), minifiez et validez vos données JSON instantanément avec une indentation à 2 ou 4 espaces. Idéal pour déboguer des API REST, inspecter des fichiers de configuration et optimiser les charges utiles réseau. Traitement 100% local dans la mémoire de votre navigateur sans aucun envoi vers des serveurs distants.",
              howTitle: "Comment Formater et Valider votre JSON",
              steps: [
                "Collez votre JSON brut dans l'éditeur de gauche ou cliquez sur 'Load .json' pour charger un fichier local.",
                "L'analyseur syntaxique examine en temps réel le code et signale toute anomalie ou virgule superflue.",
                "Choisissez l'indentation souhaitée : '2 Spaces', '4 Spaces' ou 'Minify' pour compacter.",
                "Consultez le résultat parfaitement indenté et vérifié dans le volet de droite.",
                "Cliquez sur 'Copier le résultat' pour utiliser le JSON propre dans vos projets ou requêtes API."
              ],
              featuresTitle: "Fonctionnalités Clés",
              features: [
                { title: "Confidentialité 100% Côté Client", desc: "Tout s'exécute dans votre navigateur sans le moindre transfert vers un serveur externe." },
                { title: "Diagnostic d'Erreurs en Direct", desc: "Détecte immédiatement les virgules finales, guillemets simples ou accolades manquantes." },
                { title: "Indentations Multiples & Minification", desc: "Passez en un clic d'une mise en page aérée à une compression compacte pour la production." },
                { title: "Prise en Charge de Fichiers Volumineux", desc: "Chargez des fichiers JSON de plusieurs mégaoctets de manière fluide et rapide." }
              ],
              useCasesTitle: "Cas d'Usage Fréquents",
              useCases: [
                { title: "Débogage d'API REST & GraphQL", desc: "Rendez lisibles les réponses JSON compactées renvoyées par vos serveurs backend." },
                { title: "Vérification de Fichiers de Configuration", desc: "Contrôlez la conformité syntaxique de vos fichiers package.json et tsconfig.json." },
                { title: "Optimisation de Bande Passante Réseau", desc: "Minifiez les structures de données avant envoi pour réduire le temps de chargement." },
                { title: "Inspection de Bases de Données NoSQL", desc: "Analysez les exports de documents MongoDB, PostgreSQL JSONB ou DynamoDB." }
              ],
              proTipsTitle: "Conseils d'Experts pour vos Données JSON",
              proTips: [
                "La spécification JSON officielle (RFC 8259) exige des guillemets doubles (\") pour toutes les clés et chaînes.",
                "Les virgules en fin d'objet ou de tableau (Trailing Commas) sont interdites et provoquent des erreurs de parsing.",
                "Les valeurs undefined et fonctions sont ignorées lors de la conversion, tandis que NaN et Infinity deviennent null.",
                "Utilisez le mode Minify pour réduire le poids de vos données réseau jusqu'à 40% en production."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Mes données JSON sont-elles envoyées sur un serveur ?", a: "Non. Toute l'opération est effectuée localement dans votre navigateur en totale confidentialité." },
                { q: "Puis-je charger directement un fichier .json ?", a: "Oui, utilisez le bouton 'Load .json' pour importer et formater vos fichiers locaux." },
                { q: "Quelle est la différence entre Prettify et Minify ?", a: "Prettify ajoute des espaces et retours à la ligne pour la lecture humaine ; Minify supprime tous les espaces pour réduire la taille." },
                { q: "Comment les erreurs de syntaxe sont-elles affichées ?", a: "Un bandeau d'alerte rouge apparaît en cas d'erreur avec le détail précis du problème rencontré." },
                { q: "Les clés sans guillemets sont-elles acceptées ?", a: "La norme JSON standard requiert des guillemets doubles pour chaque clé." },
                { q: "L'outil est-il gratuit ?", a: "Oui, 100% gratuit, sans inscription ni limite d'utilisation." }
              ],
              relatedTools: [
                { title: "Encodeur / Décodeur Base64", desc: "Convertissez textes et fichiers au format Base64", href: "/tools/base64/" },
                { title: "Décodeur de Tokens JWT", desc: "Décodez et inspectez les en-têtes et charges utiles de JSON Web Tokens", href: "/tools/jwt-decoder/" },
                { title: "Encodeur / Décodeur d'URL", desc: "Encodez les composants URI et paramètres de requête", href: "/tools/url-encoder/" },
                { title: "Testeur d'Expressions Régulières (Regex)", desc: "Testez et déboguez vos regex avec coloration syntaxique en direct", href: "/tools/regex-tester/" }
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
