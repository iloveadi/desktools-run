"use client";

/**
 * app/tools/base64/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Base64 Encode & Decode Tool for desktools.run
 * 100% Client-Side with full 6-language SEO support
 */

import { useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { useLocale } from "@/lib/context/LocaleContext";
import {
  Binary,
  ArrowLeft,
  Copy,
  Check,
  Upload,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function Base64Page() {
  const { locale, t } = useLocale();

  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputStr, setInputStr] = useState("Hello world! desktools.run - Safe & Fast Web Tools 🚀");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // UTF-8 safe encode & decode
  const getResult = () => {
    if (!inputStr.trim()) return "";
    try {
      if (mode === "encode") {
        return btoa(unescape(encodeURIComponent(inputStr)));
      } else {
        return decodeURIComponent(escape(atob(inputStr.trim())));
      }
    } catch (err) {
      return mode === "decode"
        ? "⚠️ Invalid Base64 format. Please ensure your string contains valid Base64 characters without invalid padding."
        : "Error during encoding.";
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

  const switchMode = () => {
    if (outputStr && !outputStr.startsWith("⚠️")) {
      setInputStr(outputStr);
    }
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    if (mode === "encode") {
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          // If binary/image, extract base64 data url or raw text
          if (result.includes(";base64,")) {
            setInputStr(result.split(";base64,")[1]);
          } else {
            setInputStr(result);
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) setInputStr(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <ToolUsageTracker toolId="base64" />
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
            <ArrowLeft size={14} /> {t("base64.back") || "Back to Tools"}
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
              <Binary size={22} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("base64.title") || "Base64 Encoder & Decoder"}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {t("base64.subtitle") || "Encode plain text & binary files to Base64 or decode Base64 back with full UTF-8 support."}
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
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
                {t("base64.modeEncode") || "Encode (Text ➔ Base64)"}
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
                {t("base64.modeDecode") || "Decode (Base64 ➔ Text)"}
              </button>

              <button
                onClick={switchMode}
                title="Swap input & output mode"
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
                <Upload size={14} /> Load File
              </button>
              <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileUpload} />
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
                {copied ? (t("base64.copied") || "Copied!") : (t("base64.copyBtn") || "Copy Result")}
              </button>
            </div>
          </div>

          <div className="editor-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Input Box */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={16} color="#818cf8" />
                  {mode === "encode" ? (t("base64.inputLabel") || "Plain Text / Input") : "Base64 Encoded String"}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {inputStr.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                rows={12}
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                placeholder={mode === "encode" ? "Enter text to encode into Base64..." : "Paste Base64 string to decode..."}
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
                  {mode === "encode" ? (t("base64.outputLabel") || "Base64 Encoded Result") : "Decoded Plain Text"}
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
              aboutTitle: "Base64 인코더 / 디코더 소개",
              aboutDesc:
                "텍스트, 이모지, 특수문자 및 바이너리 데이터를 64개의 안전한 ASCII 문자 집합(A-Z, a-z, 0-9, +, /)으로 인코딩하거나 원래 상태로 복원하는 브라우저 기반 실시간 변환 도구입니다. 한국어와 UTF-8 다국어를 깨짐 없이 완벽 지원하며, 모든 연산이 브라우저 로컬에서 이루어져 개인정보와 비밀번호가 외부 서버로 전송되지 않습니다.",
              howTitle: "Base64 인코딩 및 디코딩 사용 방법",
              steps: [
                "상단에서 '인코딩(Text ➔ Base64)' 또는 '디코딩(Base64 ➔ Text)' 모드를 선택합니다.",
                "왼쪽 입력창에 변환할 텍스트를 입력하거나 'Load File' 버튼으로 로컬 파일을 불러옵니다.",
                "입력 즉시 실시간으로 우측 결과창에 Base64 또는 디코딩된 원문 텍스트가 생성됩니다.",
                "'Swap' 버튼을 클릭하면 결과값을 입력값으로 전환하여 즉시 반대 방향으로 재검증할 수 있습니다.",
                "'결과 복사' 버튼을 눌러 변환된 텍스트를 클립보드에 복사해 코드나 설정에 바로 사용하세요."
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "완벽한 UTF-8 & 한글 인코딩 지원", desc: "기본 atob/btoa의 다국어 깨짐 현상을 방지하는 UTF-8 인코딩 레이어가 적용되어 한글과 이모지가 완벽 변환됩니다." },
                { title: "100% 브라우저 로컬 안전 연산", desc: "API 키, 토큰, 기밀 문자열이 외부 서버로 전송되지 않고 브라우저 내부 메모리에서 즉시 처리됩니다." },
                { title: "양방향 원클릭 스왑(Swap) 지원", desc: "인코딩 결과를 즉시 디코딩 입력으로 넘겨 원문과 일치하는지 1초 만에 검증할 수 있습니다." },
                { title: "파일 및 이미지 Data URL 로드", desc: "로컬 이미지나 텍스트 파일을 불러와 Base64 문자열로 즉시 변환할 수 있습니다." }
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "웹 이미지 인라인 임베딩 (Data URL)", desc: "작은 아이콘이나 로고 이미지를 Base64로 인코딩하여 HTML/CSS 내부에 직접 삽입해 HTTP 요청 수를 줄입니다." },
                { title: "Basic Auth 인증 헤더 생성", desc: "HTTP Authorization 헤더에 필요한 'username:password' 포맷을 Base64로 변환하여 API 인증에 사용합니다." },
                { title: "이메일 첨부파일 및 MIME 데이터 처리", desc: "바이너리 첨부파일을 텍스트 기반 이메일 프로토콜(SMTP)에서 안전하게 전송할 수 있도록 포맷팅합니다." },
                { title: "JWT 토큰 페이로드 디코딩", desc: "웹 토큰(JWT)의 Header 및 Payload 섹션을 Base64url 디코딩하여 내부 클레임을 확인합니다." }
              ],
              proTipsTitle: "Base64 전문가 실무 팁",
              proTips: [
                "Base64는 암호화(Encryption) 기술이 아닌 데이터 전송용 인코딩(Encoding)이므로 민감 정보 보안용으로 단독 사용해서는 안 됩니다.",
                "Base64로 변환하면 원본 바이너리 크기 대비 약 33% 용량이 증가하므로 대용량 파일보다는 소형 에셋 처리에 적합합니다.",
                "문자열 끝의 패딩 문자('=')는 전체 길이를 4의 배수로 맞추기 위한 규격입니다.",
                "URL 쿼리스트링에 포함할 때는 '+'와 '/'가 깨질 수 있으므로 URL Safe Base64(-, _) 방식을 확인하세요."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "한글이나 이모지가 깨지지 않고 정상 인코딩되나요?", a: "네! desktools.run은 UTF-8 바이트 스트림 변환을 거치므로 한글, 일본어, 중국어, 이모지가 완벽하게 지원됩니다." },
                { q: "입력한 텍스트가 서버로 전송되나요?", a: "전혀 전송되지 않습니다. 모든 변환 로직은 100% 사용자의 웹 브라우저 메모리 안에서만 실행됩니다." },
                { q: "Base64는 암호화인가요?", a: "아닙니다. Base64는 누구나 원문으로 되돌릴 수 있는 데이터 표현 방식(인코딩)이며, 보안을 위해서는 AES 등 암호화가 필요합니다." },
                { q: "유효하지 않은 Base64 문자열을 입력하면 어떻게 되나요?", a: "디코딩 실패 시 에러 경고 메시지가 표시되며 잘못된 패딩이나 문자를 점검할 수 있습니다." },
                { q: "이미지 파일도 Base64로 변환할 수 있나요?", a: "'Load File' 버튼으로 이미지를 불러오면 Base64 Data URL 문자열을 즉시 추출할 수 있습니다." },
                { q: "사용료나 글자 수 제한이 있나요?", a: "100% 무료이며 어떠한 글자 수 제한 없이 무제한으로 사용하실 수 있습니다." }
              ],
              relatedTools: [
                { title: "JSON 정렬 / 유효성 검사기", desc: "JSON 포맷팅 및 문법 오류 실시간 진단", href: "/tools/json-formatter/" },
                { title: "JWT 디코더 & 토큰 분석기", desc: "JWT Header, Payload 실시간 복호화 및 만료 시간 확인", href: "/tools/jwt-decoder/" },
                { title: "URL 인코더 / 디코더", desc: "URL 파라미터 및 특수문자 퍼센트 인코딩", href: "/tools/url-encoder/" },
                { title: "AES 암호화 / 복호화기", desc: "AES-256 비밀 키 기반 텍스트 안전 암호화", href: "/tools/aes-encrypt/" }
              ]
            },
            en: {
              aboutTitle: "About Base64 Encoder & Decoder",
              aboutDesc:
                "Easily convert plain text, emojis, foreign characters, and binary payloads into 64 safe ASCII characters (A-Z, a-z, 0-9, +, /) or decode Base64 strings back to their original text. Built with full UTF-8 support to prevent character corruption. 100% browser-native execution guarantees your credentials, API tokens, and private data never touch remote servers.",
              howTitle: "How to Encode & Decode Base64",
              steps: [
                "Select either 'Encode (Text ➔ Base64)' or 'Decode (Base64 ➔ Text)' at the top toolbar.",
                "Type or paste your text into the left pane, or click 'Load File' to import a local file.",
                "The result is generated instantly in real-time in the right pane with syntax styling.",
                "Use the 'Swap' button to quickly switch directions and verify round-trip integrity.",
                "Click 'Copy Result' to copy the transformed string directly to your clipboard."
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "Full UTF-8 & Multilingual Encoding", desc: "Properly handles non-ASCII characters, Asian scripts, and modern emojis without character corruption." },
                { title: "100% Client-Side Privacy", desc: "All data processing happens entirely in your local browser sandbox with zero network requests." },
                { title: "One-Click Bidirectional Swap", desc: "Instantly swap input and output strings to verify encoding and decoding accuracy." },
                { title: "File & Image Data URL Support", desc: "Load local text files or images to convert them directly into Base64 strings." }
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "Data URL Inline Images", desc: "Embed small icons or SVG logos directly into CSS and HTML to minimize extra HTTP round-trips." },
                { title: "HTTP Basic Authentication", desc: "Generate Base64 encoded credentials in 'username:password' format for Authorization headers." },
                { title: "Email MIME Attachments", desc: "Format binary files for safe transmission across text-based SMTP email protocols." },
                { title: "JWT Payload Inspection", desc: "Inspect Base64url encoded parts of JSON Web Tokens during API authentication debugging." }
              ],
              proTipsTitle: "Professional Tips for Base64",
              proTips: [
                "Base64 is an encoding format, NOT encryption. Anyone can decode it back; never rely on it alone to secure secrets.",
                "Base64 strings are approximately 33% larger in payload size than raw binary data.",
                "Padding characters ('=') at the end of a Base64 string align the total string length to a multiple of 4.",
                "For query strings, replace '+' with '-' and '/' with '_' to construct URL-safe Base64."
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "Does this tool support international characters and emojis?", a: "Yes. Our encoder implements UTF-8 byte stream conversion so Korean, Japanese, Chinese, and emojis are decoded perfectly." },
                { q: "Is any of my data uploaded to a server?", a: "No. All computations run 100% locally in your browser memory for absolute data privacy." },
                { q: "Is Base64 secure for encrypting passwords?", a: "No. Base64 is merely a data representation format, not cryptography. Use AES-256 for secure encryption." },
                { q: "What happens if I input invalid Base64 string?", a: "An error warning will appear in the output window alerting you to formatting or padding errors." },
                { q: "Can I convert images to Base64?", a: "Yes, use 'Load File' to import images and generate their Base64 string representation." },
                { q: "Is this service free to use?", a: "Yes, it is 100% free with unlimited conversions and no registration required." }
              ],
              relatedTools: [
                { title: "JSON Formatter & Validator", desc: "Format, validate, and minify JSON data with syntax check", href: "/tools/json-formatter/" },
                { title: "JWT Token Decoder", desc: "Decode and inspect JSON Web Token header and payload claims", href: "/tools/jwt-decoder/" },
                { title: "URL Percent Encoder / Decoder", desc: "Encode query parameters and URI components safely", href: "/tools/url-encoder/" },
                { title: "AES Encryption Tool", desc: "Encrypt and decrypt text securely using AES-256 keys", href: "/tools/aes-encrypt/" }
              ]
            },
            ja: {
              aboutTitle: "Base64 エンコーダー / デコーダーについて",
              aboutDesc:
                "テキスト、絵文字、マルチバイト文字、バイナリデータを 64 種類の ASCII 文字列（A-Z、a-z、0-9、+、/）に変換（エンコード）したり、元の文字列に復元（デコード）する高速ツールです。UTF-8 に完全対応しており文字化けの心配はありません。すべての処理がブラウザローカルで実行されるため、API キーやパスワードも安全に変換できます。",
              howTitle: "Base64 エンコード・デコードの使い方",
              steps: [
                "上部で「Encode (Text ➔ Base64)」または「Decode (Base64 ➔ Text)」を選択します。",
                "左側の入力エリアに変換したい文字列を入力するか、「Load File」でファイルを読み込みます。",
                "リアルタイムに右側の結果エリアへ Base64 文字列または復元テキストが出力されます。",
                "「Swap」ボタンをクリックして、エンコード結果を即座に再デコードして検証できます。",
                "「結果をコピー」ボタンをクリックしてクリップボードに保存します。"
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "UTF-8 & 多言語完全対応", desc: "日本語や絵文字のバイト列を正確に処理し、文字化けのない正確な変換を実現します。" },
                { title: "100% ブラウザ内ローカル処理", desc: "データは一切サーバーへ送信されず、機密データも安心して取り扱えます。" },
                { title: "ワンクリック双方向スワップ", desc: "入力と出力をワンタップで入れ替え、変換精度の確認を瞬時に行えます。" },
                { title: "ファイル・画像 Data URL 読み込み", desc: "ローカルの画像やテキストファイルを読み込んで Base64 文字列化できます。" }
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "CSS / HTML 内への画像インライン埋め込み", desc: "アイコン画像を Base64 Data URL 化して HTTP リクエスト数を削減" },
                { title: "Basic 認証用ヘッダーの生成", desc: "Authorization ヘッダーに必要な 'ユーザー名:パスワード' の Base64 変換" },
                { title: "メール MIME 添付データのデバッグ", desc: "SMTP プロトコルで送受信される添付ファイルのフォーマット検証" },
                { title: "JWT ペイロードのデコード", desc: "トークンの各セクションを展開して内部クレームを解析" }
              ],
              proTipsTitle: "Base64 取り扱いのプロのテクニック",
              proTips: [
                "Base64 は暗号化ではなく単なるデータ表現形式です。機密保護には別途暗号化を行ってください。",
                "Base64 化すると元データより約 33% データサイズが増加します。",
                "末尾のイコール記号（=）は全体の長さを 4 の倍数に揃えるパディングです。",
                "URL 内で使用する場合は URL Safe Base64（+ を -、/ を _ に置換）を活用しましょう。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "日本語や絵文字が文字化けすることはありませんか？", a: "ありません。UTF-8 バイト変換を適用しているため日本語や特殊文字も綺麗に変換されます。" },
                { q: "入力データがサーバーに送信されることはありますか？", a: "ありません。すべての変換処理はお手元のブラウザ内（クライアント側）で完結します。" },
                { q: "Base64 は暗号化ですか？", a: "いいえ、Base64 は誰でも復元可能なエンコード方式であり、暗号化ではありません。" },
                { q: "不正な Base64 文字列を入力した場合はどうなりますか？", a: "デコード失敗時にエラー警告が表示され、無効な文字やパディングを確認できます。" },
                { q: "画像ファイルも Base64 に変換できますか？", a: "「Load File」ボタンから画像を読み込むことで Base64 文字列を生成可能です。" },
                { q: "無料で利用できますか？", a: "はい、回数無制限・完全無料でご利用いただけます。" }
              ],
              relatedTools: [
                { title: "JSON 整形・バリデーター", desc: "JSON の整形、圧縮、構文エラー検証", href: "/tools/json-formatter/" },
                { title: "JWT デコーダー & トークン解析", desc: "JWT のヘッダーとペイロードをリアルタイム解析", href: "/tools/jwt-decoder/" },
                { title: "URL エンコーダー / デコーダー", desc: "URL パラメータや特殊文字を安全にエンコード", href: "/tools/url-encoder/" },
                { title: "AES 暗号化 / 復号ツール", desc: "AES-256 共通鍵による安全なテキスト暗号化", href: "/tools/aes-encrypt/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Codificador y Decodificador Base64",
              aboutDesc:
                "Convierte texto plano, emojis, caracteres especiales y archivos binarios al formato seguro ASCII Base64 (A-Z, a-z, 0-9, +, /) o decodifica cadenas Base64 a su estado original en tiempo real. Cuenta con soporte integral para codificación UTF-8. Procesamiento 100% en el navegador que garantiza total privacidad sin subidas a servidores.",
              howTitle: "Cómo Codificar y Decodificar Base64",
              steps: [
                "Selecciona el modo 'Encode' (Texto a Base64) o 'Decode' (Base64 a Texto) en la barra superior.",
                "Introduce el texto en el editor de la izquierda o pulsa 'Load File' para cargar un archivo local.",
                "El resultado se genera de forma instantánea en el panel de la derecha.",
                "Pulsa 'Swap' para intercambiar la entrada y la salida y verificar la conversión.",
                "Haz clic en 'Copiar Resultado' para llevarte el texto al portapapeles."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Compatibilidad Total con UTF-8", desc: "Maneja acentos, tildes, caracteres internacionales y emojis sin pérdida de datos." },
                { title: "Privacidad 100% en el Navegador", desc: "Ningún dato o contraseña se transmite a servidores; todo corre en tu memoria local." },
                { title: "Intercambio Bidireccional (Swap)", desc: "Comprueba en un solo clic la reversibilidad de la codificación y decodificación." },
                { title: "Soporte de Archivos e Imágenes Data URL", desc: "Carga archivos locales para generar cadenas Base64 listas para incrustar." }
              ],
              useCasesTitle: "Casos de Uso Comunes",
              useCases: [
                { title: "Imágenes Incrustadas en HTML / CSS", desc: "Convierte iconos pequeños a Data URL Base64 para reducir peticiones HTTP." },
                { title: "Autenticación HTTP Basic Auth", desc: "Codifica credenciales en formato 'usuario:contraseña' para cabeceras de autorización." },
                { title: "Adjuntos en Protocolos MIME de Correo", desc: "Prepara datos binarios para su transporte seguro mediante servidores SMTP." },
                { title: "Inspección de Tokens JWT", desc: "Decodifica fragmentos Base64url para comprobar claims y firmas." }
              ],
              proTipsTitle: "Consejos Profesionales sobre Base64",
              proTips: [
                "Base64 es una técnica de codificación, NO de cifrado. Cualquier persona puede decodificarlo.",
                "La codificación Base64 incrementa el tamaño del archivo binario original en torno a un 33%.",
                "El carácter '=' al final sirve como relleno para completar bloques de 4 caracteres.",
                "Para parámetros de URL, utiliza URL-safe Base64 cambiando '+' por '-' y '/' por '_'."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Se admiten acentos, eñes y emojis?", a: "Sí. Nuestra herramienta utiliza flujos de bytes UTF-8 para garantizar que todo el texto se procese correctamente." },
                { q: "¿Se envían mis textos a algún servidor?", a: "No. Todo se procesa de forma 100% local en tu navegador." },
                { q: "¿Es seguro Base64 para guardar contraseñas?", a: "No. Base64 es reversible y no ofrece seguridad criptográfica." },
                { q: "¿Qué ocurre si la cadena Base64 no es válida?", a: "Aparecerá un mensaje de advertencia indicando el error de formato o de relleno." },
                { q: "¿Puedo convertir imágenes a Base64?", a: "Sí, utiliza el botón 'Load File' para seleccionar tu imagen y extraer la cadena Base64." },
                { q: "¿Es completamente gratuito?", a: "Sí, es 100% gratuito y sin límite de uso." }
              ],
              relatedTools: [
                { title: "Formateador y Validador JSON", desc: "Embellece, valida y minifica datos JSON", href: "/tools/json-formatter/" },
                { title: "Decodificador de Tokens JWT", desc: "Inspecciona el contenido de tokens web JSON en vivo", href: "/tools/jwt-decoder/" },
                { title: "Codificador / Decodificador URL", desc: "Codifica parámetros y caracteres especiales en URIs", href: "/tools/url-encoder/" },
                { title: "Cifrador y Descifrador AES", desc: "Cifra textos con clave secreta mediante AES-256", href: "/tools/aes-encrypt/" }
              ]
            },
            zh: {
              aboutTitle: "关于 Base64 编码 / 解码工具",
              aboutDesc:
                "支持将任意纯文本、多语言字符、Emoji 表情及二进制数据快速编码为 64 个安全 ASCII 字符集（A-Z, a-z, 0-9, +, /），或将 Base64 字符串逆向还原为原始文本。深度优化 UTF-8 多字节处理，彻底告别中文乱码。100% 浏览器客户端本地运行，密钥与敏感数据永不上传网络。",
              howTitle: "如何使用 Base64 编码与解码",
              steps: [
                "在顶部工具栏切换“编码 (Text ➔ Base64)”或“解码 (Base64 ➔ Text)”模式。",
                "在左侧输入框输入文本，或点击“Load File”载入本地文件。",
                "右侧结果窗口将即时呈现转换后的 Base64 字符串或解码原文。",
                "点击“Swap”按钮可快速反转输入输出，双向验证转换的准确性。",
                "点击“复制结果”将生成的文本一键带入剪贴板。"
              ],
              featuresTitle: "核心功能与特点",
              features: [
                { title: "完整 UTF-8 中文与表情支持", desc: "内置标准 UTF-8 字节流转换，杜绝原生 btoa 导致的中文乱码与报错。" },
                { title: "100% 本地浏览器沙箱运行", desc: "数据无需经过任何外部服务器，绝对保护 API 秘钥及企业机密。" },
                { title: "一键双向互转 (Swap)", desc: "支持将输出结果一键转为输入，秒级完成正反向双向校验。" },
                { title: "支持图片与本地文件读取", desc: "读取本地图片或文本文件，一键提取为 Base64 Data URL 字符串。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "网页内嵌图片 (Data URL)", desc: "将小图标、Logo 转为 Base64 内嵌至 CSS/HTML，减少 HTTP 请求数量。" },
                { title: "HTTP Basic 认证头生成", desc: "将 '用户名:密码' 编码为 Base64 用于 API Authorization 认证请求。" },
                { title: "邮件 MIME 协议附件传输", desc: "在纯文本的 SMTP 邮件协议中安全传输二进制附件与特殊格式数据。" },
                { title: "JWT Token 各段解析", desc: "在调试认证流程时解析 JWT 的 Base64url 编码段并读取 Payload。" }
              ],
              proTipsTitle: "Base64 专业实战技巧",
              proTips: [
                "Base64 是一种数据编码格式而非加密技术，任何人均可逆向还原，切勿单独用于保密。",
                "经 Base64 编码后，数据体积会比原始二进制增加约 33%。",
                "末尾的等号 ('=') 为填充字符，用于确保总字符长度为 4 的整数倍。",
                "用于 URL 查询参数时，需将 '+' 替换为 '-'，'/' 替换为 '_'（URL Safe Base64）。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "中文或 Emoji 会发生乱码吗？", a: "不会！desktools.run 采用 UTF-8 编码流，中文、日韩文及 Emoji 均可完美双向转换。" },
                { q: "我的数据会被上传到云端吗？", a: "绝对不会。所有编解码计算 100% 在您本机的浏览器内存中运行。" },
                { q: "Base64 可以作为密码加密手段吗？", a: "不可以。Base64 只是数据表示方式，请使用 AES-256 或 SHA-256 进行真正的安全加密与哈希。" },
                { q: "输入了错误的 Base64 字符会怎样？", a: "解码器会立即捕获异常并在输出框给出格式错误警告提示。" },
                { q: "可以直接把图片转成 Base64 吗？", a: "可以，点击“Load File”按钮选中图片，即可快速生成对应的 Base64 Data URL 字符串。" },
                { q: "完全免费吗？", a: "永久 100% 免费，无任何转换次数或长度限制。" }
              ],
              relatedTools: [
                { title: "JSON 格式化与校验工具", desc: "JSON 数据美化、压缩与语法错误实时排查", href: "/tools/json-formatter/" },
                { title: "JWT Token 实时解码器", desc: "解析 JSON Web Token 的 Header 与 Payload 声明", href: "/tools/jwt-decoder/" },
                { title: "URL 编码 / 解码器", desc: "URI 网址参数及特殊符号的百分号安全编码", href: "/tools/url-encoder/" },
                { title: "AES 文本加密 / 解密器", desc: "基于 AES-256 算法的军事级安全文本加密", href: "/tools/aes-encrypt/" }
              ]
            },
            fr: {
              aboutTitle: "À propos de l'Encodeur et Décodeur Base64",
              aboutDesc:
                "Convertissez vos textes, emojis, caractères accentués et données binaires en une chaîne de 64 caractères ASCII sûrs (A-Z, a-z, 0-9, +, /) ou décodez des chaînes Base64 vers leur format d'origine. Prise en charge native complète de l'UTF-8. Traitement 100% local dans votre navigateur sans aucun envoi vers des serveurs distants.",
              howTitle: "Comment Encoder et Décoder en Base64",
              steps: [
                "Sélectionnez le mode 'Encode' (Texte ➔ Base64) ou 'Decode' (Base64 ➔ Texte) en haut.",
                "Tapez ou collez votre texte à gauche ou cliquez sur 'Load File' pour ouvrir un fichier local.",
                "Le résultat s'affiche instantanément dans le volet de droite en temps réel.",
                "Cliquez sur 'Swap' pour inverser entrée et sortie et vérifier la fidélité de conversion.",
                "Cliquez sur 'Copier le résultat' pour récupérer la chaîne dans le presse-papiers."
              ],
              featuresTitle: "Fonctionnalités Principales",
              features: [
                { title: "Support Complet de l'UTF-8 & Accents", desc: "Traite parfaitement les caractères accentués, alphabets non-latins et emojis sans aucune altération." },
                { title: "Confidentialité 100% Côté Client", desc: "Aucun jeton ni mot de passe n'est transmis sur Internet ; tout s'exécute localement." },
                { title: "Permutation Bidirectionnelle (Swap)", desc: "Basculez le flux de travail en un clic pour valider la réversibilité." },
                { title: "Prise en Charge de Fichiers & Images", desc: "Importez vos fichiers locaux pour en extraire directement une Data URL Base64." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Images Intégrées en Data URL (HTML / CSS)", desc: "Incorporez de petites icônes directement dans vos feuilles de style pour réduire les requêtes HTTP." },
                { title: "Authentification HTTP Basic Auth", desc: "Encodez les identifiants au format 'utilisateur:motdepasse' pour les en-têtes Authorization." },
                { title: "Pièces Jointes de Messagerie (MIME)", desc: "Formatez des contenus binaires pour leur transfert sécurisé via le protocole SMTP." },
                { title: "Décodage de Jetons JWT", desc: "Examinez les sections Base64url d'un JSON Web Token pour auditer les revendications." }
              ],
              proTipsTitle: "Conseils d'Experts sur Base64",
              proTips: [
                "Base64 est un format d'encodage et NON un chiffrement. Ne l'utilisez jamais seul pour protéger des secrets.",
                "La conversion en Base64 augmente le poids des données binaires d'environ 33%.",
                "Le symbole '=' final sert de bourrage pour aligner la taille sur un multiple de 4 caractères.",
                "Pour les paramètres d'URL, utilisez la variante URL-Safe en remplaçant '+' par '-' et '/' par '_'."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Les accents français et les emojis sont-ils préservés ?", a: "Oui. Grâce à notre gestion UTF-8 par flux d'octets, tous les caractères spéciaux sont traités sans défaut." },
                { q: "Mes données sont-elles envoyées sur un serveur ?", a: "Non. Tout l'encodage et décodage se fait à 100% dans la mémoire de votre navigateur." },
                { q: "Base64 est-il sécurisé pour protéger des mots de passe ?", a: "Non. N'importe qui peut décoder du Base64. Utilisez un chiffrement AES-256 pour sécuriser vos données." },
                { q: "Que se passe-t-il si la chaîne Base64 est invalide ?", a: "Un message d'alerte explicite s'affiche pour vous inviter à vérifier les caractères et le padding." },
                { q: "Puis-je convertir des images en Base64 ?", a: "Oui, le bouton 'Load File' permet de charger une image et d'en obtenir la Data URL Base64." },
                { q: "L'outil est-il gratuit ?", a: "Oui, 100% gratuit, sans inscription ni limite d'utilisation." }
              ],
              relatedTools: [
                { title: "Formateur & Validateur JSON", desc: "Mise en page, compression et validation de JSON", href: "/tools/json-formatter/" },
                { title: "Décodeur de Tokens JWT", desc: "Décodez les en-têtes et charges utiles de JSON Web Tokens", href: "/tools/jwt-decoder/" },
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
        @media (max-width: 900px) {
          .editor-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
