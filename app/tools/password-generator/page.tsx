"use client";

/**
 * app/tools/password-generator/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Password Generator Tool for desktools.run
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  KeyRound,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Layers,
  Lock,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { useLocale } from "@/lib/context/LocaleContext";

// ── Character Sets ─────────────────────────────────────────────
const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
const NUMBER_CHARS = "0123456789";
const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS_CHARS = new Set(["0", "O", "o", "1", "l", "I", "i"]);

function generatePassword(
  length: number,
  useUpper: boolean,
  useLower: boolean,
  useNums: boolean,
  useSyms: boolean,
  excludeAmbiguous: boolean
): { password: string; poolSize: number } {
  let pool = "";
  if (useUpper) pool += UPPERCASE_CHARS;
  if (useLower) pool += LOWERCASE_CHARS;
  if (useNums) pool += NUMBER_CHARS;
  if (useSyms) pool += SYMBOL_CHARS;

  if (excludeAmbiguous && pool.length > 0) {
    pool = pool
      .split("")
      .filter((ch) => !AMBIGUOUS_CHARS.has(ch))
      .join("");
  }

  if (!pool) pool = LOWERCASE_CHARS;

  const poolSize = pool.length;
  let result = "";

  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const randomBuffer = new Uint32Array(length);
    window.crypto.getRandomValues(randomBuffer);
    for (let i = 0; i < length; i++) {
      result += pool[randomBuffer[i] % poolSize];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += pool[Math.floor(Math.random() * poolSize)];
    }
  }

  return { password: result, poolSize };
}

function calculateEntropy(length: number, poolSize: number): number {
  if (poolSize <= 1 || length <= 0) return 0;
  return Math.round(length * Math.log2(poolSize));
}

function getStrengthTier(entropy: number) {
  if (entropy < 28) return { labelKey: "passwordGen.strength.veryWeak", color: "#ef4444", percent: 20 };
  if (entropy < 45) return { labelKey: "passwordGen.strength.weak", color: "#f59e0b", percent: 40 };
  if (entropy < 60) return { labelKey: "passwordGen.strength.medium", color: "#eab308", percent: 60 };
  if (entropy < 80) return { labelKey: "passwordGen.strength.strong", color: "#10b981", percent: 80 };
  return { labelKey: "passwordGen.strength.veryStrong", color: "#6366f1", percent: 100 };
}

export default function PasswordGeneratorPage() {
  const { locale, t } = useLocale();

  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNums, setUseNums] = useState<boolean>(true);
  const [useSyms, setUseSyms] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  const [password, setPassword] = useState<string>("");
  const [poolSize, setPoolSize] = useState<number>(62);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);

  const handleRegenerate = useCallback(() => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 300);

    const { password: newPass, poolSize: pool } = generatePassword(
      length,
      useUpper,
      useLower,
      useNums,
      useSyms,
      excludeAmbiguous
    );
    setPassword(newPass);
    setPoolSize(pool);

    const list: string[] = [];
    for (let i = 0; i < 5; i++) {
      list.push(
        generatePassword(length, useUpper, useLower, useNums, useSyms, excludeAmbiguous).password
      );
    }
    setBulkPasswords(list);
  }, [length, useUpper, useLower, useNums, useSyms, excludeAmbiguous]);

  useEffect(() => {
    handleRegenerate();
  }, [handleRegenerate]);

  const entropyBits = useMemo(() => calculateEntropy(length, poolSize), [length, poolSize]);
  const strengthTier = useMemo(() => getStrengthTier(entropyBits), [entropyBits]);

  const handleCopy = useCallback((textToCopy: string, index: number) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  return (
    <>
      <ToolUsageTracker toolId="password-generator" />
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* ── Breadcrumb & Header Summary ───────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 24px" }}>
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
                  className="icon-security"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <KeyRound size={20} />
                </div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "var(--text-primary)",
                  }}
                >
                  {t("passwordGen.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
                {t("passwordGen.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "var(--btn-secondary-bg)",
                border: "1px solid var(--btn-secondary-border)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              <Lock size={12} style={{ color: "#e879f9" }} />
              Web Cryptography API (`window.crypto`)
            </div>
          </div>
        </section>

        {/* ── Main Tool Workspace ───────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {/* ── Password Output Banner Box ───────────────── */}
          <div
            className="glass-card"
            style={{
              padding: "24px",
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                background: "rgba(0,0,0,0.2)",
                padding: "16px 20px",
                borderRadius: "12px",
                border: "1px solid var(--border-hover)",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(18px, 3.5vw, 28px)",
                  fontWeight: 800,
                  fontFamily: "var(--font-mono), monospace",
                  letterSpacing: "1px",
                  color: "var(--text-primary)",
                  wordBreak: "break-all",
                }}
              >
                {password}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <button
                  onClick={handleRegenerate}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "var(--btn-secondary-bg)",
                    border: "1px solid var(--btn-secondary-border)",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  title={t("passwordGen.generate")}
                  aria-label={t("passwordGen.generate")}
                >
                  <RefreshCw
                    size={18}
                    style={{
                      transform: isSpinning ? "rotate(360deg)" : "none",
                      transition: "transform 0.3s ease",
                    }}
                  />
                </button>

                <button
                  onClick={() => handleCopy(password, -1)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    background: copiedIndex === -1 ? "rgba(34,211,168,0.2)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: copiedIndex === -1 ? "1px solid rgba(34,211,168,0.4)" : "none",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  {copiedIndex === -1 ? <Check size={16} /> : <Copy size={16} />}
                  {copiedIndex === -1 ? t("passwordGen.copied") : t("passwordGen.copy")}
                </button>
              </div>
            </div>

            {/* Strength Meter Bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                  {t("passwordGen.strength")}:{" "}
                  <strong style={{ color: strengthTier.color, fontWeight: 700 }}>
                    {t(strengthTier.labelKey as any)}
                  </strong>
                </span>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                  {entropyBits} bits entropy
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "8px",
                  borderRadius: "4px",
                  background: "var(--btn-secondary-bg)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${strengthTier.percent}%`,
                    height: "100%",
                    borderRadius: "4px",
                    background: strengthTier.color,
                    transition: "width 0.3s ease, background-color 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Generator Options Controls Card ─────────── */}
          <div
            className="glass-card"
            style={{
              padding: "28px",
              marginBottom: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sliders size={18} style={{ color: "#8b5cf6" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                Customization Options
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {t("passwordGen.length")}
                </label>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#a5b4fc",
                    padding: "2px 10px",
                    borderRadius: "6px",
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  {length}
                </span>
              </div>

              <input
                type="range"
                min={4}
                max={64}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "#6366f1",
                  cursor: "pointer",
                  height: "6px",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                <span>4 chars</span>
                <span>16 chars (rec.)</span>
                <span>32 chars</span>
                <span>64 chars</span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "14px",
              }}
            >
              {[
                { label: t("passwordGen.uppercase"), state: useUpper, setter: setUseUpper },
                { label: t("passwordGen.lowercase"), state: useLower, setter: setUseLower },
                { label: t("passwordGen.numbers"), state: useNums, setter: setUseNums },
                { label: t("passwordGen.symbols"), state: useSyms, setter: setUseSyms },
                { label: t("passwordGen.excludeAmbiguous"), state: excludeAmbiguous, setter: setExcludeAmbiguous },
              ].map(({ label, state, setter }) => (
                <label
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: state ? "rgba(99,102,241,0.12)" : "var(--btn-secondary-bg)",
                    border: state ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--btn-secondary-border)",
                    color: state ? "var(--text-primary)" : "var(--text-secondary)",
                    fontSize: "13.5px",
                    fontWeight: state ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={state}
                    onChange={(e) => setter(e.target.checked)}
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: "#6366f1",
                      cursor: "pointer",
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Batch Passwords Section ───────────────────── */}
          <div className="glass-card" style={{ padding: "24px", marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={16} style={{ color: "#34d399" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("passwordGen.bulk")}
                </h3>
              </div>

              <button
                onClick={handleRegenerate}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "var(--btn-secondary-bg)",
                  border: "1px solid var(--btn-secondary-border)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <RefreshCw size={12} />
                Regenerate All
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {bulkPasswords.map((passItem, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "var(--btn-secondary-bg)",
                    border: "1px solid var(--btn-secondary-border)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "14.5px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {passItem}
                  </span>
                  <button
                    onClick={() => handleCopy(passItem, idx)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: copiedIndex === idx ? "rgba(34,211,168,0.2)" : "rgba(255,255,255,0.05)",
                      border: copiedIndex === idx ? "1px solid rgba(34,211,168,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      color: copiedIndex === idx ? "#34d399" : "var(--text-secondary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copiedIndex === idx ? <Check size={13} /> : <Copy size={13} />}
                    {copiedIndex === idx ? t("passwordGen.copied") : t("passwordGen.copy")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "무작위 비밀번호 생성기 및 보안 강도 분석기 소개",
              aboutDesc:
                "웹 브라우저의 암호학적 난수 생성 엔진(window.crypto.getRandomValues)을 기반으로 그 누구도 추측할 수 없는 최고 보안 수준의 무작위 비밀번호를 생성하는 전문 보안 도구입니다. 비밀번호의 엔트로피(Entropy bits) 및 강도를 실시간 측정하고, 유사 문자(0/O, 1/l/I) 제외 및 대량 비밀번호 생성 기능을 100% 브라우저 로컬에서 안전하게 제공합니다.",
              howTitle: "강력한 비밀번호 생성 및 관리 방법",
              steps: [
                "슬라이더를 조절하여 생성할 비밀번호의 길이를 지정합니다 (최소 16자 이상 권장).",
                "대문자(A-Z), 소문자(a-z), 숫자(0-9), 특수문자(!@#$ 등) 체크박스를 선택합니다.",
                "가독성을 높이고 오타를 방지하려면 '유사 문자(0, O, 1, l, I) 제외' 옵션을 활성화합니다.",
                "상단 박스에서 실시간 생성된 비밀번호와 엔트로피 강도 게이지를 확인합니다.",
                "'비밀번호 복사' 버튼을 눌러 클립보드에 복사하거나 하단 대량 생성 목록에서 후보 암호를 선택합니다.",
              ],
              featuresTitle: "핵심 보안 기능 및 특징",
              features: [
                { title: "암호학적 안전 난수 (CSPRNG)", desc: "Math.random 대신 W3C WebCrypto API를 사용하여 패턴 추측이 원천 불가능한 진정한 난수를 생성합니다." },
                { title: "실시간 정보 엔트로피(Entropy) 산출", desc: "문자 풀(Pool) 크기와 길이를 기반으로 비트 단위 엔트로피를 계산하여 보안 강도를 정확히 안내합니다." },
                { title: "유사/혼동 문자(Ambiguous) 스마트 배제", desc: "입력 실수와 시각적 혼동을 유발하는 0/O/o, 1/l/I 문자를 필터링하여 실용성을 극대화합니다." },
                { title: "5개 동시 대량 생성 (Bulk Passwords)", desc: "여러 계정의 비밀번호를 한 번에 설정하거나 마음에 드는 구조를 고를 수 있는 멀티 뷰를 제공합니다." },
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "신규 웹 서비스 및 금융 계정 생성", desc: "온라인 뱅킹, 포털 사이트, 소셜 미디어의 해킹 방지용 강력한 초기 비밀번호 발급" },
                { title: "서버 SSH 및 데이터베이스 루트 비밀번호 설정", desc: "Linux 서버 루트 계정, MySQL/PostgreSQL 데이터베이스 마스터 패스워드 생성" },
                { title: "Wi-Fi 공유기 WPA3 보안 키 설정", desc: "가정 및 사무실 무선 공유기 접속용 초강력 WPA2/WPA3 사전 공유 키(PSK) 발급" },
                { title: "사내 임시 직원 및 프로젝트 계정 일괄 발급", desc: "하단 대량 생성기를 활용하여 신규 팀원들의 초기 임시 비밀번호를 빠르게 생성" },
              ],
              proTipsTitle: "비밀번호 보안 전문가 실무 팁",
              proTips: [
                "여러 웹사이트에서 동일한 비밀번호를 재사용하지 마세요. 한 곳이 유출되면 모든 계정이 위험해집니다.",
                "비밀번호 길이는 16자 이상을 유지하세요. 16자 이상의 무작위 암호는 슈퍼컴퓨터로도 해독에 수천만 년이 소요됩니다.",
                "생성된 복잡한 암호는 1Password, Bitwarden, Apple 키체인 등 신뢰할 수 있는 패스워드 관리자에 저장하세요.",
                "가능한 모든 중요 계정(구글, 금융, 이메일)에 2단계 인증(2FA/MFA)을 필수로 연동하세요.",
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "생성된 비밀번호가 서버로 전송되거나 저장되나요?", a: "아닙니다! 모든 비밀번호는 브라우저의 window.crypto API를 통해 100% 사용자 PC/스마트폰 메모리에서만 생성되며 외부 서버로 일절 전송되지 않습니다." },
                { q: "Web Cryptography API 난수는 왜 안전한가요?", a: "운영체제의 하드웨어 엔트로피 소스(마우스 움직임, CPU 타이머 등)를 활용한 암호학적 난수 생성기(CSPRNG)이므로 다음 난수를 예측할 수 없습니다." },
                { q: "안전한 비밀번호 길이의 기준은 무엇인가요?", a: "대소문자, 숫자, 특수문자가 포함된 16자 이상(엔트로피 80bits 이상)을 권장합니다." },
                { q: "유사 문자 제외 옵션은 어떤 문자를 빼주나요?", a: "글꼴에 따라 구분이 어려운 숫자 '0'과 알파벳 'O/o', 숫자 '1'과 소문자 'l', 대문자 'I/i'를 안전하게 제외합니다." },
                { q: "스마트폰이나 태블릿에서도 사용 가능한가요?", a: "네! iOS Safari, Android Chrome 등 모든 최신 모바일 브라우저에서 완벽히 작동합니다." },
                { q: "완전 무료인가요?", a: "네, 로그인이나 결제 없이 영구적으로 완전 무료로 무제한 이용하실 수 있습니다." },
              ],
              relatedTools: [
                { title: "AES 텍스트 암호화 / 복호화기", desc: "생성한 비밀번호로 중요한 텍스트와 메모를 군사급 AES-256으로 암호화", href: "/tools/aes-encrypt/" },
                { title: "해시 생성기 (MD5 / SHA-256)", desc: "비밀번호 및 데이터의 SHA-256 / SHA-512 해시값 계산", href: "/tools/hash-generator/" },
                { title: "JWT 토큰 디코더", desc: "인증 토큰(JWT)의 헤더와 페이로드 정보 실시간 분석", href: "/tools/jwt-decoder/" },
                { title: "QR 코드 생성기", desc: "Wi-Fi 접속 정보나 링크를 고화질 QR 코드로 제작", href: "/tools/qr-generator/" },
              ],
            },
            en: {
              aboutTitle: "About Strong Random Password Generator",
              aboutDesc:
                "A client-side cryptographic utility for generating unpredictable, high-entropy random passwords using the native W3C Web Cryptography API (window.crypto.getRandomValues). Measure information entropy in real-time, customize character sets, eliminate ambiguous characters (0/O, 1/l/I), and generate batch passwords locally with zero server transmissions.",
              howTitle: "How to Generate Strong Passwords",
              steps: [
                "Adjust the length slider to your desired password length (16+ characters recommended).",
                "Toggle uppercase (A-Z), lowercase (a-z), numbers (0-9), and symbols (!@#$).",
                "Optionally enable 'Exclude Ambiguous Characters' to avoid confusing characters like 0/O or 1/l/I.",
                "Review the generated password and real-time entropy strength meter.",
                "Click 'Copy' to copy to your clipboard, or select from the bulk password candidates below.",
              ],
              featuresTitle: "Key Security Features",
              features: [
                { title: "CSPRNG Cryptographic Randomness", desc: "Uses browser-native window.crypto rather than predictable Math.random for true cryptographic unpredictability." },
                { title: "Real-Time Entropy Calculation", desc: "Calculates exact bit-level entropy based on pool size and length to evaluate brute-force resistance." },
                { title: "Smart Ambiguous Character Filtering", desc: "Eliminates visually identical glyphs (0, O, o, 1, l, I, i) to prevent human typing errors." },
                { title: "Bulk Batch Password Generation", desc: "Instantly outputs 5 additional high-security password variations for multi-account provisioning." },
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "New Account Registration", desc: "Create uncrackable master credentials for banking, corporate logins, and email accounts." },
                { title: "Server Root & Database Passwords", desc: "Generate robust master passphrases for SSH access, MySQL, and PostgreSQL servers." },
                { title: "Wi-Fi WPA2/WPA3 Pre-Shared Keys", desc: "Deploy secure router passphrases to defend against wireless deauthentication attacks." },
                { title: "Employee Onboarding & Temporary Passwords", desc: "Produce batches of unique initial passwords for incoming team members." },
              ],
              proTipsTitle: "Professional Password Security Tips",
              proTips: [
                "Never reuse passwords across different online services; a single breach compromises all accounts.",
                "Aim for at least 16 characters. 16-character random passwords take millions of years to crack with modern GPUs.",
                "Store your complex passwords in a reputable password manager like 1Password, Bitwarden, or Apple Keychain.",
                "Enable Multi-Factor Authentication (2FA/MFA) on all critical services for defense-in-depth.",
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "Is the generated password sent to or saved on a server?", a: "No! All passwords are generated 100% locally in your browser memory via window.crypto. Nothing is ever sent across the network." },
                { q: "Why is the Web Cryptography API more secure?", a: "It leverages hardware entropy from your OS (CPU interrupts, mouse jitter) to ensure true cryptographic unpredictability (CSPRNG)." },
                { q: "What length makes a password secure?", a: "We recommend at least 16 characters containing mixed character types, providing over 80 bits of cryptographic entropy." },
                { q: "What does the 'Exclude Ambiguous' option do?", a: "It removes characters that look similar in standard fonts: 0, O, o, 1, l, I, and i." },
                { q: "Does this work offline and on mobile devices?", a: "Yes! It functions completely offline on all modern mobile and desktop browsers." },
                { q: "Is this tool completely free?", a: "Yes, 100% free with no limits, registration, or hidden fees." },
              ],
              relatedTools: [
                { title: "AES Text Encryptor", desc: "Encrypt text and notes with military-grade AES-256 WebCrypto", href: "/tools/aes-encrypt/" },
                { title: "Hash Generator (MD5 / SHA-256)", desc: "Compute cryptographic hashes for passwords and files", href: "/tools/hash-generator/" },
                { title: "JWT Token Decoder", desc: "Decode and inspect authentication tokens in real-time", href: "/tools/jwt-decoder/" },
                { title: "QR Code Generator", desc: "Create high-resolution QR codes for Wi-Fi credentials or links", href: "/tools/qr-generator/" },
              ],
            },
            ja: {
              aboutTitle: "強力ランダムパスワード生成器について",
              aboutDesc:
                "Web ブラウザ標準の暗号論的乱数生成器（window.crypto.getRandomValues）を採用した高セキュリティ・パスワード作成ツールです。パスワードのエントロピー（情報量）と強度をリアルタイムに診断し、紛らわしい類似文字の除外や一括複数生成を 100% ローカル環境で安全に実行します。",
              howTitle: "安全なパスワードの作成方法",
              steps: [
                "スライダーでパスワードの文字数を設定します（16文字以上を推奨）。",
                "大文字（A-Z）、小文字（a-z）、数字（0-9）、記号（!@#$ 等）の組み合わせを選択します。",
                "誤読を防ぐため「類似文字（0, O, 1, l, I）の除外」オプションを有効にします。",
                "画面上部に生成されたパスワードと強度メーター（エントロピー）を確認します。",
                "「パスワードをコピー」をクリックしてクリップボードに保存します。",
              ],
              featuresTitle: "主なセキュリティ機能と特徴",
              features: [
                { title: "暗号論的疑似乱数生成器 (CSPRNG)", desc: "Math.random ではなく WebCrypto API を使用し、推測不能な真の乱数を生成します。" },
                { title: "リアルタイム・エントロピー強度計算", desc: "文字プールと長さからビット単位の安全度を算出し、総当たり耐性を評価します。" },
                { title: "視覚的類似文字（0/O, 1/l/I）の除外", desc: "フォントによって見分けにくい文字を自動排除し、手入力時の誤入力を防ぎます。" },
                { title: "5件一括生成 (Bulk Passwords)", desc: "複数アカウント用や候補選定のために、ワンクリックで複数のパスワードを同時作成します。" },
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "Web サービスや金融機関の新規登録", desc: "オンラインバンキングやSNS乗っ取りを防ぐ強固な初期パスワードの設定" },
                { title: "サーバー SSH・データベースの管理者鍵", desc: "Linux サーバーや MySQL/PostgreSQL のルートパスワード作成" },
                { title: "Wi-Fi ルーターの WPA2/WPA3 暗号キー", desc: "オフィスや家庭用無線LANのセキュリティ強化キー設定" },
                { title: "新規社員・プロジェクト用の一括アカウント発行", desc: "一括生成機能を利用した初期パスワードの効率的な配布" },
              ],
              proTipsTitle: "パスワード管理のプロのアドバイス",
              proTips: [
                "複数のサービスで同じパスワードを使い回さないでください。1箇所の漏洩が全アカウントの危険につながります。",
                "文字数は16文字以上を維持してください。16文字以上の乱数は現在のスーパーコンピュータでも解読に数千万年かかります。",
                "複雑なパスワードは 1Password や Bitwarden などのパスワード管理ツールに安全に保管してください。",
                "二段階認証（2FA/MFA）が利用可能なサービスでは必ず有効にしてください。",
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "生成されたパスワードがサーバーに送信されますか？", a: "一切送信されません。すべての処理はお手元のブラウザメモリ内で完結します。" },
                { q: "Web Cryptography API はなぜ安全なのですか？", a: "OSのハードウェアエントロピーを利用した暗号論的乱数生成器のため、規則性や予測が一切不可能です。" },
                { q: "推奨されるパスワードの長さは何文字ですか？", a: "大文字・小文字・数字・記号を組み合わせた16文字以上（エントロピー80bits以上）を推奨します。" },
                { q: "類似文字除外機能とは何ですか？", a: "見分けがつきにくい数字の「0」と英字の「O/o」、数字の「1」と英小文字「l」、英大文字「I」を除外する機能です。" },
                { q: "スマートフォンでも利用できますか？", a: "はい、iOS Safari や Android Chrome など各種モバイルブラウザで問題なく動作します。" },
                { q: "無料で利用できますか？", a: "はい、登録不要・制限なしで完全無料にてご利用いただけます。" },
              ],
              relatedTools: [
                { title: "AES テキスト暗号化 / 復号化", desc: "軍用規格 AES-256 で機密メッセージやメモを安全に暗号化", href: "/tools/aes-encrypt/" },
                { title: "ハッシュ生成器 (MD5 / SHA-256)", desc: "パスワードやファイルのハッシュ値を即時算出", href: "/tools/hash-generator/" },
                { title: "JWT デコーダー", desc: "認証トークンのヘッダーとペイロードを瞬時に解析", href: "/tools/jwt-decoder/" },
                { title: "QR コード生成器", desc: "Wi-Fi 設定やリンクをカスタム QR コード化", href: "/tools/qr-generator/" },
              ],
            },
            es: {
              aboutTitle: "Acerca del Generador de Contraseñas Seguras",
              aboutDesc:
                "Herramienta de seguridad para generar contraseñas aleatorias e impredecibles utilizando la Web Cryptography API nativa del navegador (window.crypto.getRandomValues). Analiza la entropía de información en tiempo real, personaliza juegos de caracteres, excluye caracteres ambiguos y genera lotes de contraseñas de forma 100% local.",
              howTitle: "Cómo generar contraseñas robustas",
              steps: [
                "Ajusta el control deslizante a la longitud deseada (se recomiendan 16 o más caracteres).",
                "Selecciona mayúsculas, minúsculas, números y caracteres especiales.",
                "Activa 'Excluir caracteres ambiguos' para evitar confusiones como 0/O o 1/l/I.",
                "Revisa la contraseña generada y el indicador de entropía en tiempo real.",
                "Haz clic en 'Copiar' para guardar la contraseña en tu portapapeles.",
              ],
              featuresTitle: "Características principales de seguridad",
              features: [
                { title: "Aleatoriedad criptográfica CSPRNG", desc: "Utiliza window.crypto en lugar de Math.random para garantizar una total imprevisibilidad." },
                { title: "Cálculo de entropía en tiempo real", desc: "Mide la resistencia frente a ataques de fuerza bruta en bits de información." },
                { title: "Filtrado de caracteres ambiguos", desc: "Elimina caracteres visualmente similares (0, O, o, 1, l, I) para evitar errores de tipeo." },
                { title: "Generación en lote (5 contraseñas)", desc: "Produce múltiples alternativas simultáneas para gestionar varias cuentas a la vez." },
              ],
              useCasesTitle: "Casos de uso frecuentes",
              useCases: [
                { title: "Registro de nuevas cuentas", desc: "Crea credenciales maestras inviolables para banca online y redes sociales." },
                { title: "Contraseñas de servidor y base de datos", desc: "Define claves seguras para acceso SSH, MySQL y PostgreSQL." },
                { title: "Claves de red Wi-Fi WPA2/WPA3", desc: "Protege tu router inalámbrico frente a intrusos y ataques de fuerza bruta." },
                { title: "Asignación masiva de claves de equipo", desc: "Genera contraseñas temporales únicas para nuevos empleados." },
              ],
              proTipsTitle: "Consejos profesionales de seguridad",
              proTips: [
                "Nunca reutilices la misma contraseña en diferentes servicios; un fallo en uno compromete todos los demás.",
                "Utiliza al menos 16 caracteres. Las contraseñas aleatorias de 16 caracteres tardan millones de años en descifrarse.",
                "Almacena tus contraseñas complejas en un gestor de confianza como 1Password, Bitwarden o Apple Keychain.",
                "Activa la autenticación en dos pasos (2FA) en todas las cuentas críticas.",
              ],
              faqTitle: "Preguntas frecuentes (FAQ)",
              faqs: [
                { q: "¿Se envían o guardan las contraseñas en un servidor?", a: "¡No! Todo se genera 100% localmente en la memoria de tu navegador mediante window.crypto." },
                { q: "¿Por qué es más segura la Web Cryptography API?", a: "Porque utiliza fuentes de entropía del hardware del sistema operativo para generar números verdaderamente impredecibles." },
                { q: "¿Cuál es la longitud recomendada para una contraseña?", a: "Se recomiendan al menos 16 caracteres con todos los tipos de caracteres (más de 80 bits de entropía)." },
                { q: "¿Qué hace la opción de caracteres ambiguos?", a: "Elimina los caracteres confusos como 0, O, o, 1, l, I, i." },
                { q: "¿Funciona en teléfonos móviles?", a: "Sí, es 100% compatible con todos los navegadores modernos móviles y de escritorio." },
                { q: "¿Es totalmente gratuito?", a: "Sí, 100% gratuito e ilimitado." },
              ],
              relatedTools: [
                { title: "Cifrado AES de Texto", desc: "Cifra textos y notas confidenciales con AES-256", href: "/tools/aes-encrypt/" },
                { title: "Generador de Hash (MD5 / SHA-256)", desc: "Calcula hashes criptográficos para contraseñas y archivos", href: "/tools/hash-generator/" },
                { title: "Decodificador JWT", desc: "Inspecciona tokens de autenticación en tiempo real", href: "/tools/jwt-decoder/" },
                { title: "Generador de Códigos QR", desc: "Crea códigos QR personalizados para Wi-Fi o enlaces", href: "/tools/qr-generator/" },
              ],
            },
            zh: {
              aboutTitle: "强随机密码生成器与熵值分析工具介绍",
              aboutDesc:
                "基于浏览器原生密码学安全随机数引擎（window.crypto.getRandomValues）的专业安全密码生成工具。实时评估信息熵（Entropy bits）与安全等级，支持排除易混淆字符（0/O, 1/l/I）与批量多密码生成，100% 在客户端浏览器本地独立运行，绝不向任何服务器发送密码数据。",
              howTitle: "如何生成高强度安全密码",
              steps: [
                "拖动滑块设置所需的密码长度（强烈推荐 16 位以上）。",
                "自由勾选大写字母 (A-Z)、小写字母 (a-z)、数字 (0-9) 及特殊符号 (!@#$ 等)。",
                "可开启“排除易混淆字符”选项以过滤容易看错输错的 0/O 与 1/l/I。",
                "在顶部区域查看即时生成的强密码与熵值安全度进度条。",
                "点击“复制密码”存入剪贴板，或从下方批量列表中挑选满意的备选密码。",
              ],
              featuresTitle: "核心安全特性与优势",
              features: [
                { title: "密码学安全伪随机数 (CSPRNG)", desc: "采用 WebCrypto API 硬件熵源，彻底杜绝 Math.random 可预测性漏洞。" },
                { title: "实时信息熵 (Entropy) 计算", desc: "根据字符集大小与长度精确计算位熵，科学评估抗暴力破解能力。" },
                { title: "易混淆字符智能过滤", desc: "自动剔除易辨析错误的 0/O/o 与 1/l/I/i，大幅降低人工输入出错率。" },
                { title: "批量 5 组密码同时生成", desc: "一键生成多组高强度候选密码，方便为多个系统批量配置账户。" },
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "注册新网站与重要金融账户", desc: "为网上银行、社交媒体及政务平台创建无法被字典破解的初始密码" },
                { title: "服务器 Root 与数据库管理员密码", desc: "为 Linux SSH、MySQL、PostgreSQL 数据库配置高强度主密钥" },
                { title: "Wi-Fi 路由器 WPA2/WPA3 密钥", desc: "生成超长防蹭网无线网络预共享密钥 (PSK)" },
                { title: "企业新员工入职初始密码批量分配", desc: "利用批量生成功能高效分配互不相同的强临时密码" },
              ],
              proTipsTitle: "密码安全专家实用建议",
              proTips: [
                "切勿在多个网站重复使用相同密码，单点泄露可能导致全部关联账户沦陷。",
                "密码长度建议保持在 16 位以上，现代 GPU 破解 16 位完全随机密码需要上千万年。",
                "请将生成的复杂密码妥善保存在 1Password、Bitwarden、Apple 钥匙串等专业密码管理器中。",
                "在所有支持的平台（Google、邮箱、银行）上务必开启双重身份验证 (2FA/MFA)。",
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "生成的密码会上传或保存在服务器上吗？", a: "绝对不会！所有密码均通过浏览器的 window.crypto 引擎 100% 在您本地内存中独立生成，无任何网络传输。" },
                { q: "为什么 Web Cryptography API 的随机数更安全？", a: "因为它调用操作系统的硬件级熵源（如 CPU 中断、鼠标微移动），生成的随机数在密码学上完全不可预测。" },
                { q: "安全的密码长度标准是多少？", a: "建议至少 16 位并混合大小写、数字与符号（熵值达到 80 bits 以上）。" },
                { q: "排除易混淆字符选项有什么作用？", a: "它会自动去掉容易视觉混淆的字符：0、O、o、1、l、I、i。" },
                { q: "手机或平板电脑可以使用吗？", a: "可以！完全适配 iOS Safari 与 Android Chrome 等所有主流移动浏览器。" },
                { q: "完全免费吗？", a: "是的，永久 100% 免费且无任何次数或功能限制。" },
              ],
              relatedTools: [
                { title: "AES 文本加密与解密", desc: "使用生成的强密码对机密文本进行 AES-256 军工级加密", href: "/tools/aes-encrypt/" },
                { title: "哈希生成器 (MD5 / SHA-256)", desc: "计算密码与数据的单向哈希值", href: "/tools/hash-generator/" },
                { title: "JWT 令牌解析器", desc: "实时解码并检查身份验证令牌", href: "/tools/jwt-decoder/" },
                { title: "QR 代码生成器", desc: "将 Wi-Fi 密码或链接制作成高清二维码", href: "/tools/qr-generator/" },
              ],
            },
            fr: {
              aboutTitle: "À propos du Générateur de Mots de Passe Aléatoires",
              aboutDesc:
                "Outil cryptographique côté client pour générer des mots de passe ultra-sécurisés et imprévisibles via l'API native W3C Web Cryptography (window.crypto.getRandomValues). Évaluez l'entropie en temps réel, personnalisez les jeux de caractères, filtrez les caractères ambigus et créez des listes de mots de passe 100% localement sans aucune communication serveur.",
              howTitle: "Comment générer des mots de passe robustes",
              steps: [
                "Ajustez le curseur sur la longueur souhaitée (16 caractères ou plus recommandés).",
                "Sélectionnez majuscules (A-Z), minuscules (a-z), chiffres (0-9) et symboles (!@#$).",
                "Activez 'Exclure les caractères ambigus' pour éliminer les confusions visuelles (0/O, 1/l/I).",
                "Vérifiez le mot de passe généré et la jauge d'entropie en temps réel.",
                "Cliquez sur 'Copier' pour l'ajouter à votre presse-papiers.",
              ],
              featuresTitle: "Fonctionnalités de sécurité clés",
              features: [
                { title: "Aléatoire cryptographique CSPRNG", desc: "Utilise window.crypto pour une imprévisibilité totale, bien supérieure à Math.random." },
                { title: "Calcul d'entropie en temps réel", desc: "Mesure la résistance exacte aux attaques par force brute en bits d'information." },
                { title: "Filtrage des caractères ambigus", desc: "Supprime les glyphes similaires (0, O, o, 1, l, I) pour éviter les erreurs de frappe." },
                { title: "Génération par lot (5 mots de passe)", desc: "Produit simultanément plusieurs options pour configurer plusieurs comptes." },
              ],
              useCasesTitle: "Cas d'utilisation courants",
              useCases: [
                { title: "Création de nouveaux comptes", desc: "Générez des identifiants maîtres inviolables pour les banques et services en ligne." },
                { title: "Mots de passe serveurs et bases de données", desc: "Définissez des clés robustes pour l'accès SSH, MySQL et PostgreSQL." },
                { title: "Clés Wi-Fi WPA2/WPA3", desc: "Protégez vos réseaux sans fil contre les intrusions et attaques par dictionnaire." },
                { title: "Intégration d'employés", desc: "Attribuez rapidement des mots de passe temporaires uniques pour les nouveaux arrivants." },
              ],
              proTipsTitle: "Conseils de sécurité pour vos mots de passe",
              proTips: [
                "Ne réutilisez jamais un même mot de passe sur plusieurs services différents.",
                "Visez au moins 16 caractères pour rendre toute tentative de piratage impossible.",
                "Enregistrez vos mots de passe complexes dans un gestionnaire réputé (1Password, Bitwarden, Apple Trousseau).",
                "Activez l'authentification à deux facteurs (2FA) sur tous vos comptes critiques.",
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Le mot de passe est-il envoyé ou stocké sur un serveur ?", a: "Non ! Tout est calculé 100% localement dans la mémoire de votre navigateur via window.crypto." },
                { q: "Pourquoi l'API Web Cryptography est-elle plus sûre ?", a: "Elle exploite l'entropie matérielle de votre système pour garantir des nombres imprévisibles (CSPRNG)." },
                { q: "Quelle est la longueur idéale pour un mot de passe ?", a: "Nous recommandons au moins 16 caractères combinant plusieurs types de symboles (> 80 bits d'entropie)." },
                { q: "Que fait l'option 'Exclure les caractères ambigus' ?", a: "Elle retire les caractères visuellement confus comme 0, O, o, 1, l, I et i." },
                { q: "Fonctionne-t-il sur mobile et hors ligne ?", a: "Oui, parfaitement compatible sur tous les navigateurs mobiles et desktop récents." },
                { q: "Est-ce totalement gratuit ?", a: "Oui, 100% gratuit et sans aucune limitation." },
              ],
              relatedTools: [
                { title: "Chiffrement de Texte AES-256", desc: "Chiffrez vos textes et notes sensibles avec AES-256", href: "/tools/aes-encrypt/" },
                { title: "Générateur de Hash (MD5 / SHA-256)", desc: "Calculez des empreintes pour vos mots de passe et fichiers", href: "/tools/hash-generator/" },
                { title: "Décodeur JWT", desc: "Inspectez les tokens d'authentification en direct", href: "/tools/jwt-decoder/" },
                { title: "Générateur de QR Code", desc: "Créez des QR codes pour vos clés Wi-Fi ou liens", href: "/tools/qr-generator/" },
              ],
            },
          };

          const g = content[locale as keyof typeof content] || content.ko;

          return (
            <ToolGuide
              badgeText="100% Free & Browser-Native"
              aboutTitle={g.aboutTitle}
              aboutDesc={g.aboutDesc}
              howTitle={g.howTitle}
              steps={g.steps}
              featuresTitle={g.featuresTitle}
              features={g.features}
              useCasesTitle={g.useCasesTitle}
              useCases={g.useCases}
              proTips={{
              title: g.proTipsTitle,
              tips: g.proTips,
            }}
              faqTitle={g.faqTitle}
              faqs={g.faqs}
              relatedTools={g.relatedTools}
            />
          );
        })()}
      </main>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .guide-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
