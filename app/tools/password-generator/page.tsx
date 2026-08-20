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
  const { t } = useLocale();

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

        {/* ── Unified Tool Guide & FAQ Section ───────────── */}
        <ToolGuide
          badgeText="100% Free & Browser-Native"
          aboutTitle={t("passwordGen.guide.aboutTitle") || "무작위 비밀번호 생성기 도구란 무엇인가요?"}
          aboutDesc={t("passwordGen.guide.aboutDesc") || "웹 브라우저의 강력한 암호화 무작위 함수(window.crypto.getRandomValues)를 기반으로 그 누구도 추측할 수 없는 강력하고 안전한 무작위 암호를 100% 로컬에서 무료로 생성해 주는 유틸리티입니다."}
          howTitle={t("passwordGen.guide.howTitle") || "사용 방법"}
          steps={[
            t("passwordGen.guide.step1") || "슬라이더를 조절하여 생성할 비밀번호의 길이를 선택합니다 (권장 16자 이상).",
            t("passwordGen.guide.step2") || "대문자, 소문자, 숫자, 특수문자 및 유사 문자 제외 옵션을 자유롭게 선택합니다.",
            t("passwordGen.guide.step3") || "'비밀번호 복사' 버튼을 눌러 안전하게 생성된 암호를 클립보드에 복사합니다.",
          ]}
          faqs={[
            { q: t("passwordGen.guide.faq1Q") || "생성된 비밀번호가 서버로 전송되거나 저장되나요?", a: t("passwordGen.guide.faq1A") || "아닙니다! 모든 비밀번호는 100% 사용자의 브라우저 내에서만 생성되며 서버나 메모리에 일절 보관되지 않습니다." },
            { q: t("passwordGen.guide.faq2Q") || "Web Cryptography API 기반이란 무슨 뜻인가요?", a: t("passwordGen.guide.faq2A") || "일반 무작위 함수(Math.random)와 달리 보안에 극도로 강력한 난수를 생성하여 예측 가능성을 완전히 차단하는 암호학 표준 API입니다." },
            { q: t("passwordGen.guide.faq3Q") || "안전한 비밀번호 길이의 기준은 무엇인가요?", a: t("passwordGen.guide.faq3A") || "대소문자, 숫자, 특수문자가 모두 포함된 최소 16자 이상의 암호(엔트로피 80bits 이상)를 사용할 것을 권장합니다." },
          ]}
        />
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
