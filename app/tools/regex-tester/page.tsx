"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { useLocale } from "@/lib/context/LocaleContext";
import {
  Search,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Layers,
  FileText,
  Trash2,
} from "lucide-react";

interface RegexPreset {
  name: string;
  pattern: string;
  flags: string;
  sample: string;
}

const PRESETS: RegexPreset[] = [
  {
    name: "Email Address",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "g",
    sample: "Contact support at hello@desktools.run or developer.alex@gmail.com. Invalid: test@domain, admin@.com",
  },
  {
    name: "HTTP/HTTPS URLs",
    pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)",
    flags: "g",
    sample: "Visit https://desktools.run or https://sub.example.com/api?id=123#anchor. Plain: ftp://invalid",
  },
  {
    name: "Phone Number (Intl / KR)",
    pattern: "(?:\\+?\\d{1,3}[- ]?)?\\(?\\d{2,4}\\)?[- ]?\\d{3,4}[- ]?\\d{4}",
    flags: "g",
    sample: "Call 010-1234-5678 or +1-800-555-0199 or (02) 123-4567. Office line: 031-987-6543.",
  },
  {
    name: "IPv4 Address",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    sample: "Server nodes: 192.168.1.1, 10.0.0.254, 127.0.0.1. Out of range: 999.999.1.1, 256.0.0.1",
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b",
    flags: "g",
    sample: "Release date: 2026-09-15. Milestone target: 2026-12-31. Invalid formats: 2026-13-40, 26-9-15.",
  },
  {
    name: "Strong Password Policy",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    flags: "",
    sample: "P@ssw0rd2026!",
  },
];

export default function RegexTesterPage() {
  const { locale, t } = useLocale();

  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState(
    "Contact support at hello@desktools.run or developer.alex@gmail.com for help!\nInvalid emails: test@domain, user@.com"
  );
  const [copied, setCopied] = useState(false);

  // Toggle flag helper
  const toggleFlag = (f: string) => {
    if (flags.includes(f)) {
      setFlags(flags.replace(f, ""));
    } else {
      setFlags(flags + f);
    }
  };

  const applyPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestText(preset.sample);
  };

  const { matches, isValidRegex, errorMsg } = useMemo(() => {
    if (!pattern.trim()) {
      return { matches: [], isValidRegex: true, errorMsg: null };
    }
    try {
      const regex = new RegExp(pattern, flags);
      const list: { match: string; index: number; groups: string[] }[] = [];
      let m: RegExpExecArray | null;

      if (flags.includes("g")) {
        let count = 0;
        while ((m = regex.exec(testText)) !== null && count < 500) {
          list.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (m.index === regex.lastIndex) regex.lastIndex++;
          count++;
        }
      } else {
        m = regex.exec(testText);
        if (m) {
          list.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }
      return { matches: list, isValidRegex: true, errorMsg: null };
    } catch (err: any) {
      return { matches: [], isValidRegex: false, errorMsg: err.message };
    }
  }, [pattern, flags, testText]);

  const copyMatches = () => {
    if (!matches || matches.length === 0) return;
    const text = matches.map((m) => m.match).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <ToolUsageTracker toolId="regex-tester" />
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
            <ArrowLeft size={14} /> {t("regexTester.back") || "Back to Tools"}
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
              <Search size={22} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("regexTester.title") || "Regex Tester & Debugger"}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {t("regexTester.subtitle") || "Test, debug, and inspect regular expressions with real-time match highlighting and capture groups."}
          </p>
        </section>

        {/* Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Preset Buttons */}
          <div className="glass-card" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginRight: "4px" }}>Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: pattern === p.pattern ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.04)",
                  border: pattern === p.pattern ? "1px solid rgba(99,102,241,0.6)" : "1px solid var(--border-subtle)",
                  color: pattern === p.pattern ? "#a5b4fc" : "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Regex Input & Flags Bar */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-muted)", fontFamily: "monospace" }}>/</span>
              <input
                type="text"
                value={pattern}
                placeholder="Type regex pattern here (e.g. [a-z]+)..."
                onChange={(e) => setPattern(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "220px",
                  height: "46px",
                  borderRadius: "8px",
                  background: "var(--input-bg)",
                  border: isValidRegex ? "1px solid var(--border-subtle)" : "1px solid #ef4444",
                  color: "var(--text-primary)",
                  padding: "0 14px",
                  fontSize: "15px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontWeight: 600,
                }}
              />
              <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-muted)", fontFamily: "monospace" }}>/</span>

              {/* Flag Quick Toggles */}
              <div style={{ display: "flex", gap: "4px", background: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                {[
                  { flag: "g", label: "Global (g)" },
                  { flag: "i", label: "Case Insensitive (i)" },
                  { flag: "m", label: "Multiline (m)" },
                  { flag: "s", label: "DotAll (s)" },
                ].map(({ flag, label }) => {
                  const active = flags.includes(flag);
                  return (
                    <button
                      key={flag}
                      onClick={() => toggleFlag(flag)}
                      title={label}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        background: active ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
                        border: "none",
                        color: active ? "white" : "var(--text-muted)",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "monospace",
                      }}
                    >
                      {flag}
                    </button>
                  );
                })}
              </div>
            </div>

            {!isValidRegex && (
              <div
                style={{
                  color: "#f87171",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 600,
                  background: "rgba(239,68,68,0.1)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <AlertCircle size={16} /> Invalid Regular Expression: {errorMsg}
              </div>
            )}
          </div>

          <div className="editor-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px" }}>
            {/* Test Text */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={16} color="#818cf8" />
                  {t("regexTester.testString") || "Test String / Corpus"}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {testText.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                rows={14}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter test string here to check pattern matches..."
                style={{
                  width: "100%",
                  height: "380px",
                  borderRadius: "8px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  padding: "14px",
                  fontSize: "14px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  lineHeight: "1.6",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Match Results & Inspector */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} color="#818cf8" />
                  {t("regexTester.matchResults") || "Match Results"}
                </span>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "100px",
                      background: matches.length > 0 ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                      color: matches.length > 0 ? "#4ade80" : "var(--text-muted)",
                    }}
                  >
                    {matches.length} {matches.length === 1 ? "match" : "matches"}
                  </span>
                  {matches.length > 0 && (
                    <button
                      onClick={copyMatches}
                      title="Copy all matches"
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: copied ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)",
                        border: "none",
                        color: copied ? "#4ade80" : "#818cf8",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "330px", overflowY: "auto" }}>
                {matches.length > 0 ? (
                  matches.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "13px",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ color: "#818cf8", fontSize: "11px", fontWeight: 700 }}>Match #{i + 1}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>pos: {m.index}</span>
                      </div>
                      <div style={{ color: "#4ade80", fontWeight: 700 }}>{m.match}</div>
                      {m.groups.length > 0 && (
                        <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed var(--border-subtle)", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {m.groups.map((g, gi) => (
                            <div key={gi} style={{ display: "flex", gap: "6px" }}>
                              <span style={{ color: "var(--text-muted)" }}>Group {gi + 1}:</span>
                              <span style={{ color: "#a5b4fc" }}>{g || "undefined"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    {pattern.trim() ? "No matches found in the test text." : "Enter a regex pattern to see matches."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "정규표현식(Regex) 테스터 및 디버거 소개",
              aboutDesc:
                "자바스크립트 정규표현식(RegExp)을 실시간으로 테스트하고 매칭 결과, 캡처 그룹(Capture Groups), 일치 인덱스를 즉시 분석할 수 있는 웹 기반 개발자 도구입니다. 이메일, URL, 전화번호, IP 주소 등 자주 쓰이는 정규식 프리셋과 플래그(g, i, m, s) 토글을 지원합니다. 모든 텍스트는 브라우저 내부에서 100% 로컬 연산되어 보안 문서나 테스트용 고객 데이터가 절대 외부 서버로 전송되지 않습니다.",
              howTitle: "정규표현식 테스터 사용 방법",
              steps: [
                "상단 프리셋 버튼(이메일, URL, 전화번호 등)을 클릭하거나 직접 정규식 패턴을 입력합니다.",
                "우측 플래그 버튼(g: 전체 매칭, i: 대소문자 무시, m: 다중행, s: DotAll)을 눌러 동작 방식을 설정합니다.",
                "하단 왼쪽 입력창에 테스트할 문자열이나 원문 텍스트를 입력합니다.",
                "오른쪽 결과 패널에서 실시간으로 탐지된 매칭 개수와 각 매칭의 위치(pos), 캡처 그룹을 확인합니다.",
                "'Copy' 버튼을 눌러 추출된 매칭 결과 목록을 클립보드로 복사합니다."
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "실시간 문법 검증 및 에러 진단", desc: "닫히지 않은 괄호나 잘못된 수량자(Quantifier) 등 정규식 문법 오류를 즉각 붉은색 경고로 알립니다." },
                { title: "캡처 그룹(Capture Groups) 분석", desc: "괄호()로 묶인 서브 패턴 그룹들의 매칭 결과와 undefined 여부를 세부적으로 파악합니다." },
                { title: "원클릭 실무 프리셋 제공", desc: "이메일, IPv4, 강력한 비밀번호 규칙, 날짜, URL 등 검증된 정규식 패턴을 즉시 로드합니다." },
                { title: "100% 브라우저 로컬 안전 실행", desc: "개인정보나 로그 파일이 서버로 전송되지 않아 보안 감사에 적합합니다." }
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "회원가입 폼 유효성 검사 규칙 설계", desc: "이메일 형식, 8자 이상 특수문자 포함 비밀번호 강도 검증 로직 검증" },
                { title: "서버 로그 데이터 파싱 및 파라미터 추출", desc: "Nginx/Apache 로그 라인에서 IP 주소, HTTP 상태 코드, 요청 URL 파싱" },
                { title: "문서 내 특정 패턴 대량 추출", desc: "긴 텍스트나 소스코드에서 특정 함수명, 해시태그(#), 전화번호 목록 일괄 추출" },
                { title: "데이터 클렌징 및 마스킹 전 사전 검증", desc: "주민등록번호나 카드번호 등 민감정보 마스킹 정규식의 오탐/미탐 여부 사전 테스트" }
              ],
              proTipsTitle: "정규표현식 전문가 실무 팁",
              proTips: [
                "g(Global) 플래그를 켜지 않으면 첫 번째 일치 항목(Match #1)만 찾고 검색이 중단됩니다.",
                "점(.)은 기본적으로 줄바꿈(\\n)과 일치하지 않으므로, 여러 줄에 걸친 매칭 시에는 s(DotAll) 플래그를 활성화하세요.",
                "욕심 많은 매칭(Greedy Match: .*) 대신 게으른 매칭(Lazy Match: .*?)을 활용하면 원하는 태그 단위로 정확히 자를 수 있습니다.",
                "특수문자(., ?, +, *, ^, $, (, ), [, ], {, }, |, \\) 자체를 검색할 때는 반드시 역슬래시(\\)로 이스케이프해야 합니다."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "입력한 테스트 데이터가 외부 서버로 전송되나요?", a: "아닙니다. 모든 정규식 연산은 사용자 브라우저의 JavaScript RegExp 엔진에서 100% 로컬 처리됩니다." },
                { q: "g, i, m, s 플래그는 각각 무엇을 의미하나요?", a: "g는 전체 탐색(Global), i는 대소문자 무시(Ignore case), m은 각 줄 시작/끝 일치(^, $), s는 점(.)이 줄바꿈까지 포함하도록 하는 플래그입니다." },
                { q: "캡처 그룹(Capture Group)은 무엇인가요?", a: "패턴 내에서 괄호 ()로 묶은 하위 표현식으로, 매칭된 텍스트 중 특정 부분만을 개별적으로 추출할 때 사용됩니다." },
                { q: "정규식 문법 오류가 발생하면 어떻게 되나요?", a: "패턴 입력창 테두리가 붉은색으로 바뀌며 하단에 구체적인 오류 원인이 표시됩니다." },
                { q: "모바일 환경에서도 사용할 수 있나요?", a: "네, 스마트폰 및 태블릿 모바일 브라우저에서도 완전한 반응형 인터페이스를 지원합니다." },
                { q: "완전 무료인가요?", a: "네, 아무런 조건이나 제한 없이 완전 무료로 제공됩니다." }
              ],
              relatedTools: [
                { title: "JSON 정렬 / 검증기", desc: "JSON 포맷팅 및 문법 오류 실시간 진단", href: "/tools/json-formatter/" },
                { title: "Base64 인코더 / 디코더", desc: "문자열 및 데이터를 Base64로 즉시 변환", href: "/tools/base64/" },
                { title: "URL 인코더 / 디코더", desc: "URL 파라미터 및 특수문자 퍼센트 인코딩", href: "/tools/url-encoder/" },
                { title: "텍스트 비교 (Diff)", desc: "두 텍스트의 차이점을 라인별로 비교 분석", href: "/tools/text-diff/" }
              ]
            },
            en: {
              aboutTitle: "About Regex Tester & Debugger",
              aboutDesc:
                "Test, inspect, and debug JavaScript regular expressions in real-time with instant match counts, positional indices, and capture group breakdowns. Includes built-in presets for common patterns like email addresses, URLs, IPv4 addresses, and dates. All processing runs 100% locally inside your browser, ensuring confidential logs and private credentials remain completely secure.",
              howTitle: "How to Test and Debug Regular Expressions",
              steps: [
                "Select a preset (Email, URL, IP, etc.) or enter your custom regex pattern in the top bar.",
                "Toggle necessary flags such as 'g' (Global), 'i' (Case Insensitive), 'm' (Multiline), or 's' (DotAll).",
                "Paste or type your test corpus in the left textarea.",
                "Review matching snippets, positions, and capture groups in the right inspector panel in real-time.",
                "Click 'Copy' to copy all matched results directly into your clipboard."
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "Real-Time Syntax Validation", desc: "Catches unmatched parentheses and invalid quantifiers instantly with actionable error messages." },
                { title: "Capture Group Inspection", desc: "Examines sub-match groups extracted by parentheses () to verify extraction accuracy." },
                { title: "One-Click Production Presets", desc: "Quickly loads pre-tested patterns for emails, URLs, dates, phone numbers, and strong passwords." },
                { title: "100% Client-Side Privacy", desc: "All regex evaluations happen within your local browser engine with zero network uploads." }
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "Form Validation Rule Design", desc: "Validate user input formats like email addresses, phone numbers, and password requirements." },
                { title: "Server Log Parsing", desc: "Extract IP addresses, HTTP status codes, and user agent strings from Apache or Nginx access logs." },
                { title: "Text Extraction & Scraping", desc: "Extract specific identifiers, hashtags, or phone numbers from large text documents." },
                { title: "Data Masking & Redaction Testing", desc: "Test regular expressions designed to mask credit card numbers or social security IDs before production rollout." }
              ],
              proTipsTitle: "Professional Tips for Regex",
              proTips: [
                "Always enable the 'g' (global) flag if you want to find all occurrences in the text rather than stopping after the first match.",
                "By default, '.' does not match newlines. Enable the 's' (dotAll) flag if you want to match across multiple lines.",
                "Use non-greedy quantifiers (e.g. .*? instead of .*) to prevent matching unintended large blocks of text.",
                "Remember to escape special regex metacharacters (., ?, +, *, ^, $, (, ), [, ], {, }, |, \\) with a backslash (\\)."
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "Is my test text uploaded to any server?", a: "No. All regular expression matching is evaluated 100% locally in your browser's JavaScript engine." },
                { q: "What do the g, i, m, and s flags mean?", a: "g searches globally for all matches, i ignores case sensitivity, m makes ^ and $ match line boundaries, and s allows '.' to match newline characters." },
                { q: "What is a capture group?", a: "Parentheses () define sub-expressions whose matched text is saved and displayed individually in the inspector panel." },
                { q: "How are syntax errors handled?", a: "If the pattern is malformed, a red warning box appears with the specific syntax error description." },
                { q: "Does it support mobile browsers?", a: "Yes, the interface is fully responsive and optimized for touch devices on iOS and Android." },
                { q: "Is this tool completely free?", a: "Yes, 100% free with unlimited usage." }
              ],
              relatedTools: [
                { title: "JSON Formatter & Validator", desc: "Format, minify, and validate JSON data with syntax highlighting", href: "/tools/json-formatter/" },
                { title: "Base64 Encoder & Decoder", desc: "Encode text and files into Base64 or decode back", href: "/tools/base64/" },
                { title: "URL Encoder / Decoder", desc: "Encode or decode query parameters and URI strings safely", href: "/tools/url-encoder/" },
                { title: "Text Diff Checker", desc: "Compare two texts and highlight differences line by line", href: "/tools/text-diff/" }
              ]
            },
            ja: {
              aboutTitle: "正規表現 (Regex) テスター＆デバッガーについて",
              aboutDesc:
                "JavaScript の正規表現（RegExp）をリアルタイムでテストし、マッチ件数、マッチ位置、キャプチャグループ（Capture Groups）を即座に検証できる開発者向けツールです。メールアドレス、URL、IP アドレスなどの定番プリセットとフラグ（g、i、m、s）の切り替えに対応。すべての処理がブラウザ内で安全に実行されます。",
              howTitle: "正規表現テスターの使い方",
              steps: [
                "上部のプリセットボタン（メール、URL 等）をクリックするか、独自の正規表現を入力します。",
                "「g」(全検索)、「i」(大文字小文字無視)、「m」(複数行)、「s」(改行を含む) などのフラグを設定します。",
                "左側のテキストエリアにテスト対象の文字列を入力します。",
                "右側の結果パネルでマッチ件数、出現位置、キャプチャグループの内容をリアルタイムで確認します。",
                "「Copy」ボタンをクリックしてマッチした一覧をクリップボードにコピーします。"
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "リアルタイム構文エラー検証", desc: "閉じられていない括弧などの文法ミスを即座に検知し、赤いエラー通知でお知らせします。" },
                { title: "キャプチャグループ詳細表示", desc: "丸括弧 () でグループ化した部分文字列の抽出結果を個別リストで視覚化します。" },
                { title: "実用的なプリセット搭載", desc: "メール、IPv4、強力なパスワードルール、日付などの定番パターンをワンタップで読み込めます。" },
                { title: "100% ブラウザ内ローカル処理", desc: "社内ログや機密テキストが外部サーバーへ送信される心配は一切ありません。" }
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "フォーム入力バリデーションの設計", desc: "メールアドレス形式やパスワード複雑度要件のチェックパターンを事前検証" },
                { title: "サーバーアクセスログのパース", desc: "Nginx や Apache のログから IP アドレスやステータスコードを抽出" },
                { title: "ドキュメントからの特定文字列一括抽出", desc: "長文テキストからハッシュタグや電話番号などをリストアップ" },
                { title: "機密データマスキングパターンの検証", desc: "クレジットカード番号や個人情報の置換処理前に誤検出・検知漏れがないか確認" }
              ],
              proTipsTitle: "正規表現のプロのテクニック",
              proTips: [
                "すべての出現箇所を検索したい場合は、必ず「g (Global)」フラグを有効にしてください。",
                "ドット（.）は通常改行にマッチしません。複数行にわたるマッチングには「s (DotAll)」フラグを使います。",
                "最長一致（.*）ではなく最短一致（.*?）を使うことで、意図しない大きな塊のマッチを防げます。",
                "正規表現のメタ文字（.、?、+、*、^、$、(、)、[、]、{、}、|、\\）自体を検索する場合は、必ずバックスラッシュ（\\）でエスケープしてください。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "入力したテキストがサーバーに送信されることはありますか？", a: "ありません。すべての正規表現処理はブラウザの JavaScript エンジン内で完結します。" },
                { q: "フラグ (g, i, m, s) の意味は何ですか？", a: "g は全件検索、i は大文字小文字の区別なし、m は行単位の先頭/末尾一致、s は改行を含む全文字マッチです。" },
                { q: "キャプチャグループとは何ですか？", a: "正規表現内で () で囲まれた部分のことで、マッチした文字列から特定の部分だけを取り出す機能です。" },
                { q: "構文エラーはどのように表示されますか？", a: "入力枠が赤くなり、具体的なエラー内容が下に表示されます。" },
                { q: "スマートフォンでも利用できますか？", a: "はい、iOS / Android のモバイルブラウザに完全対応しています。" },
                { q: "無料で利用できますか？", a: "はい、回数無制限で完全無料にてご利用いただけます。" }
              ],
              relatedTools: [
                { title: "JSON 整形・バリデーター", desc: "JSON の整形、圧縮、構文エラー検証", href: "/tools/json-formatter/" },
                { title: "Base64 エンコーダー / デコーダー", desc: "文字列とバイナリデータを Base64 形式で相互変換", href: "/tools/base64/" },
                { title: "URL エンコーダー / デコーダー", desc: "URL パラメータや特殊文字を安全にエンコード", href: "/tools/url-encoder/" },
                { title: "テキスト比較 (Diff)", desc: "2つのテキストの差異を行単位で視覚的に比較", href: "/tools/text-diff/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Probador y Depurador de Regex",
              aboutDesc:
                "Prueba, depura e inspecciona expresiones regulares de JavaScript en tiempo real con recuento de coincidencias, índices de posición y desglose de grupos de captura. Incluye preajustes para correos electrónicos, URLs, direcciones IPv4 y fechas. Todo el procesamiento se realiza de forma 100% local en tu navegador para proteger tus datos confidenciales.",
              howTitle: "Cómo Probar y Depurar Expresiones Regulares",
              steps: [
                "Selecciona un preajuste (Email, URL, IP, etc.) o escribe tu patrón regex en la barra superior.",
                "Activa o desactiva flags como 'g' (Global), 'i' (Ignorar mayúsculas), 'm' (Multilínea) o 's' (DotAll).",
                "Pega el texto de prueba en el área de texto izquierda.",
                "Examina las coincidencias y grupos de captura en el panel derecho en tiempo real.",
                "Haz clic en 'Copy' para llevarte la lista de coincidencias al portapapeles."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Validación Sintáctica en Vivo", desc: "Detecta paréntesis no cerrados y cuantificadores inválidos al instante." },
                { title: "Inspección de Grupos de Captura", desc: "Visualiza claramente los subpatrones delimitados por paréntesis ()." },
                { title: "Preajustes Listos para Producción", desc: "Carga patrones comprobados para emails, URLs, teléfonos y contraseñas seguras." },
                { title: "Privacidad 100% en el Navegador", desc: "Tus textos y registros de servidor nunca salen de tu dispositivo." }
              ],
              useCasesTitle: "Casos de Uso Comunes",
              useCases: [
                { title: "Validación de Formularios Web", desc: "Verifica patrones de entrada como correos, números de teléfono y requisitos de contraseña." },
                { title: "Procesamiento de Registros de Servidor", desc: "Extrae direcciones IP, códigos de respuesta y rutas desde logs de Apache o Nginx." },
                { title: "Extracción Masiva de Cadenas", desc: "Obtén listas de hashtags, identificadores o números en textos extensos." },
                { title: "Pruebas de Enmascaramiento de Datos", desc: "Comprueba expresiones para ocultar números de tarjeta antes de su implementación." }
              ],
              proTipsTitle: "Consejos Profesionales de Regex",
              proTips: [
                "Activa la flag 'g' si deseas encontrar todas las coincidencias en lugar de detenerte en la primera.",
                "El punto '.' no coincide con saltos de línea por defecto; usa la flag 's' para abarcar múltiples líneas.",
                "Utiliza cuantificadores no codiciosos (.*? en lugar de .*) para evitar capturar bloques excesivos.",
                "Escapa los caracteres especiales (., ?, +, *, ^, $, (, ), [, ], {, }, |, \\) con una barra invertida (\\)."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Se envían mis textos a algún servidor?", a: "No. Todas las expresiones regulares se evalúan localmente en tu navegador." },
                { q: "¿Qué significan las flags g, i, m, s?", a: "g busca todas las coincidencias, i ignora mayúsculas/minúsculas, m habilita anclajes por línea y s hace que el punto coincida con saltos de línea." },
                { q: "¿Qué es un grupo de captura?", a: "Es una subexpresión encerrada entre paréntesis () cuyo valor coincidente se guarda por separado." },
                { q: "¿Cómo se muestran los errores?", a: "Si el patrón tiene un error sintáctico, aparece un aviso rojo detallando el problema." },
                { q: "¿Funciona en móviles?", a: "Sí, es completamente compatible con navegadores en iOS y Android." },
                { q: "¿Es gratuito?", a: "Sí, 100% gratuito y sin límites de uso." }
              ],
              relatedTools: [
                { title: "Formateador y Validador JSON", desc: "Embellece, valida y minifica datos JSON", href: "/tools/json-formatter/" },
                { title: "Codificador / Decodificador Base64", desc: "Convierte texto y archivos a formato Base64", href: "/tools/base64/" },
                { title: "Codificador / Decodificador URL", desc: "Codifica parámetros y caracteres especiales en URIs", href: "/tools/url-encoder/" },
                { title: "Comparador de Textos (Diff)", desc: "Compara dos textos línea por línea para hallar diferencias", href: "/tools/text-diff/" }
              ]
            },
            zh: {
              aboutTitle: "关于正则表达式 (Regex) 测试与调试器",
              aboutDesc:
                "支持在浏览器中实时测试与调试 JavaScript 正则表达式 (RegExp)，即刻呈现匹配项数量、字符索引位置以及各捕获分组 (Capture Groups)。内置邮箱、URL、IPv4 地址、日期和强密码等常用预设，支持一键切换常用标志位 (g, i, m, s)。所有计算 100% 在本地完成，保护敏感日志与测试数据隐私。",
              howTitle: "如何测试与调试正则表达式",
              steps: [
                "点击上方预设按钮（如邮箱、URL 等）或在顶部输入框编写您的正则表达式。",
                "按需切换修饰符：'g'（全局）、'i'（忽略大小写）、'm'（多行匹配）、's'（包含换行符）。",
                "在左侧输入框中粘贴待测试的文本或日志语料。",
                "在右侧实时结果面板中查看匹配结果详情、位置信息及各括号捕获分组。",
                "点击“Copy”按钮一键将所有匹配项复制到剪贴板。"
              ],
              featuresTitle: "核心功能与特点",
              features: [
                { title: "实时语法错误即时诊断", desc: "精准拦截未闭合的括号与非法量词，以醒目红色警告提示错误原因。" },
                { title: "深度捕获分组 (Groups) 拆解", desc: "清晰展示由圆括号 () 定义的各个子表达式匹配结果及其对应序号。" },
                { title: "内置高频实战预设库", desc: "集成经过严格测试的邮箱、URL、手机号、日期与 IPv4 地址匹配模板。" },
                { title: "100% 浏览器客户端安全运行", desc: "无需担心将业务日志或包含个人信息的敏感数据上传至第三方服务器。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "前端表单输入格式校验", desc: "快速构建并校验手机号、电子邮箱及 8 位以上强密码规则。" },
                { title: "服务器访问日志清洗与提取", desc: "从 Nginx / Apache 访问日志中批量提取客户端 IP、请求路径与响应状态码。" },
                { title: "长文本批量关键词抓取", desc: "从大型文本或源码中精准批量提取特定格式标签、链接或电话号码。" },
                { title: "敏感数据脱敏规则测试", desc: "在正式上线前测试身份证号、银行卡号的掩码匹配规则，防止误伤与漏检。" }
              ],
              proTipsTitle: "正则表达式专业实战技巧",
              proTips: [
                "务必开启 'g' (Global) 修饰符，否则正则引擎在找到第一个匹配项后就会停止搜索。",
                "默认情况下点号 (.) 不匹配换行符，如需跨行匹配请开启 's' (DotAll) 修饰符。",
                "使用非贪婪量词 (.*? 代替 .*) 可以避免过度匹配，精准锁定最小闭合标签。",
                "若要匹配正则特殊字符本身（如 . ? + * ^ $ ( ) [ ] { } | \\），请务必在前面加上反斜杠 (\\) 转义。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "测试的文本数据会被上传到云端吗？", a: "不会。所有正则匹配计算 100% 在您本机的浏览器 JavaScript 引擎中运行。" },
                { q: "g, i, m, s 修饰符分别代表什么？", a: "g 为全局搜索，i 为忽略字母大小写，m 为多行模式（^ 和 $ 匹配每一行），s 为单行模式（点号匹配换行符）。" },
                { q: "什么是捕获分组 (Capture Group)？", a: "用圆括号 () 括起来的子表达式，引擎会把匹配到的局部文本单独记录在分组列表中。" },
                { q: "正则表达式写错了会怎样？", a: "输入框会立即呈现红色警告边框，并在下方展示具体的语法错误提示。" },
                { q: "手机端可以使用吗？", a: "可以，完全适配移动端触控操作。" },
                { q: "完全免费吗？", a: "100% 永久免费，无任何限制。" }
              ],
              relatedTools: [
                { title: "JSON 格式化与校验工具", desc: "JSON 数据美化、压缩与语法错误实时排查", href: "/tools/json-formatter/" },
                { title: "Base64 编码 / 解码工具", desc: "文本与二进制数据的 Base64 双向即时转换", href: "/tools/base64/" },
                { title: "URL 编码 / 解码器", desc: "URI 网址参数及特殊符号的百分号安全编码", href: "/tools/url-encoder/" },
                { title: "文本差异比对 (Diff)", desc: "逐行比对两段文本的修改与新增差异", href: "/tools/text-diff/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Testeur et Débogueur d'Expressions Régulières (Regex)",
              aboutDesc:
                "Testez et déboguez vos expressions régulières JavaScript en temps réel. Visualisez le nombre de correspondances, les positions d'index et le détail de chaque groupe de capture. Fourni avec des préréglages prêts à l'emploi (e-mails, URL, adresses IP, dates) et bascule rapide des indicateurs (flags g, i, m, s). Traitement 100% local dans votre navigateur.",
              howTitle: "Comment Tester vos Expressions Régulières",
              steps: [
                "Sélectionnez un modèle prédéfini (Email, URL, IP...) ou saisissez votre motif regex personnalisé.",
                "Activez les indicateurs requis : 'g' (global), 'i' (insensible à la casse), 'm' (multiligne) ou 's' (dotAll).",
                "Collez le texte à analyser dans l'éditeur de gauche.",
                "Consultez les résultats, positions et groupes de capture dans le panneau de droite.",
                "Cliquez sur 'Copy' pour récupérer toutes les correspondances dans le presse-papiers."
              ],
              featuresTitle: "Fonctionnalités Principales",
              features: [
                { title: "Validation Syntaxique en Direct", desc: "Alerte instantanément en cas d'erreur de parenthèses ou de quantificateurs invalides." },
                { title: "Inspection des Groupes de Capture", desc: "Affiche le détail de chaque sous-groupe défini par des parenthèses ()." },
                { title: "Bibliothèque de Modèles Prêts à l'Emploi", desc: "Chargez rapidement des motifs éprouvés pour e-mails, adresses IPv4, dates et mots de passe." },
                { title: "Confidentialité 100% Côté Client", desc: "Vos journaux et données de test ne sont jamais envoyés vers des serveurs tiers." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Validation de Formulaires Web", desc: "Vérifiez les règles pour adresses e-mail, numéros de téléphone et mots de passe robustes." },
                { title: "Analyse de Logs de Serveurs Web", desc: "Extrayez adresses IP, codes HTTP et agents utilisateurs depuis des journaux Apache ou Nginx." },
                { title: "Extraction Ciblée de Données", desc: "Isolez des mots-clés, hashtags ou numéros spécifiques dans de longs documents." },
                { title: "Test de Masquage de Données Confidentielles", desc: "Vérifiez vos motifs de masquage de cartes bancaires avant déploiement en production." }
              ],
              proTipsTitle: "Conseils d'Experts sur les Expressions Régulières",
              proTips: [
                "Activez toujours le drapeau 'g' pour trouver l'ensemble des correspondances au lieu de vous arrêter à la première.",
                "Par défaut, le point '.' n'inclut pas les retours à la ligne. Utilisez le drapeau 's' (dotAll) pour franchir les lignes.",
                "Préférez les quantificateurs paresseux (.*? au lieu de .*) pour éviter de capturer des blocs de texte trop larges.",
                "Échappez systématiquement les métacaractères spéciaux (., ?, +, *, ^, $, (, ), [, ], {, }, |, \\) avec une barre oblique inverse (\\)."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Mes textes sont-ils envoyés sur un serveur ?", a: "Non. Toute l'évaluation regex s'exécute à 100% dans le moteur JavaScript de votre navigateur." },
                { q: "Que signifient les indicateurs g, i, m, s ?", a: "g recherche toutes les occurrences, i ignore la casse, m permet à ^ et $ de cibler chaque ligne, et s autorise le point à matcher les retours à la ligne." },
                { q: "Qu'est-ce qu'un groupe de capture ?", a: "Une sous-expression entre parenthèses () dont la valeur extraite est isolée dans la liste des résultats." },
                { q: "Comment les erreurs de syntaxe sont-elles signalées ?", a: "Un bandeau rouge s'affiche avec la description précise de l'erreur rencontrée." },
                { q: "L'outil fonctionne-t-il sur smartphone ?", a: "Oui, interface responsive optimisée pour tous les navigateurs mobiles." },
                { q: "L'outil est-il gratuit ?", a: "Oui, 100% gratuit et sans aucune limite." }
              ],
              relatedTools: [
                { title: "Formateur & Validateur JSON", desc: "Mise en page, compression et validation de JSON", href: "/tools/json-formatter/" },
                { title: "Encodeur / Décodeur Base64", desc: "Convertissez textes et fichiers au format Base64", href: "/tools/base64/" },
                { title: "Encodeur / Décodeur d'URL", desc: "Encodez les composants d'URL et paramètres de requête", href: "/tools/url-encoder/" },
                { title: "Comparateur de Textes (Diff)", desc: "Comparez deux textes ligne par ligne pour repérer les différences", href: "/tools/text-diff/" }
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
