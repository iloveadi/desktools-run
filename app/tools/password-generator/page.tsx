"use client";

/**
 * app/tools/password-generator/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Password Generator Tool for desktools.run
 *
 * Features:
 *  - Cryptographically secure generation (window.crypto.getRandomValues)
 *  - Adjustable length (4-64 chars) with real-time slider
 *  - Toggles for Uppercase, Lowercase, Numbers, Symbols & Ambiguous filter
 *  - Real-time Strength & Entropy meter (in bits)
 *  - Batch generation (5 passwords at once)
 *  - 1-click Copy with toast notification feedback
 *  - Full 6-language i18n & Dark/Light theme support
 *  - 100% Client-side local processing
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  KeyRound,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Sliders,
  Layers,
  Lock,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";

// ── Character Sets ─────────────────────────────────────────────
const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
const NUMBER_CHARS = "0123456789";
const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS_CHARS = new Set(["0", "O", "o", "1", "l", "I", "i"]);

// Cryptographically secure single password generator
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

  // Fallback if no sets selected
  if (!pool) pool = LOWERCASE_CHARS;

  const poolSize = pool.length;
  let result = "";

  // Cryptographically secure random selection using window.crypto
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const randomBuffer = new Uint32Array(length);
    window.crypto.getRandomValues(randomBuffer);
    for (let i = 0; i < length; i++) {
      result += pool[randomBuffer[i] % poolSize];
    }
  } else {
    // Fallback Math.random
    for (let i = 0; i < length; i++) {
      result += pool[Math.floor(Math.random() * poolSize)];
    }
  }

  return { password: result, poolSize };
}

// Compute entropy in bits: E = L * log2(N)
function calculateEntropy(length: number, poolSize: number): number {
  if (poolSize <= 1 || length <= 0) return 0;
  return Math.round(length * Math.log2(poolSize));
}

// Determine strength tier
function getStrengthTier(entropy: number) {
  if (entropy < 28) return { labelKey: "passwordGen.strength.veryWeak", color: "#ef4444", percent: 20 };
  if (entropy < 45) return { labelKey: "passwordGen.strength.weak", color: "#f59e0b", percent: 40 };
  if (entropy < 60) return { labelKey: "passwordGen.strength.medium", color: "#eab308", percent: 60 };
  if (entropy < 80) return { labelKey: "passwordGen.strength.strong", color: "#10b981", percent: 80 };
  return { labelKey: "passwordGen.strength.veryStrong", color: "#6366f1", percent: 100 };
}

// ─────────────────────────────────────────────────────────────
export default function PasswordGeneratorPage() {
  const { t } = useLocale();

  // Generator Options
  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNums, setUseNums] = useState<boolean>(true);
  const [useSyms, setUseSyms] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  // Active Password State
  const [password, setPassword] = useState<string>("");
  const [poolSize, setPoolSize] = useState<number>(62);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Bulk Passwords List
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);

  // Generate password on option change or manual click
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

    // Generate 5 bulk passwords as well
    const list: string[] = [];
    for (let i = 0; i < 5; i++) {
      list.push(
        generatePassword(length, useUpper, useLower, useNums, useSyms, excludeAmbiguous).password
      );
    }
    setBulkPasswords(list);
  }, [length, useUpper, useLower, useNums, useSyms, excludeAmbiguous]);

  // Initial generation on mount
  useEffect(() => {
    handleRegenerate();
  }, [handleRegenerate]);

  // Entropy & Strength Tier
  const entropyBits = useMemo(() => calculateEntropy(length, poolSize), [length, poolSize]);
  const strengthTier = useMemo(() => getStrengthTier(entropyBits), [entropyBits]);

  // Copy handler
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
            {/* Display Area */}
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
                {/* Regenerate Button */}
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

                {/* Primary Copy Button */}
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

              {/* Progress bar */}
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

            {/* Length Slider */}
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

            {/* Checkboxes Grid */}
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

        {/* ── Tool Guide & FAQ Section ────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "48px" }}>
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "100px",
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "#a5b4fc",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                <BookOpen size={12} />
                {t("passwordGen.guide.title")}
              </div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.4px",
                }}
              >
                {t("passwordGen.guide.aboutTitle")}
              </h2>
            </div>

            {/* About & Steps Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "32px",
              }}
              className="guide-grid"
            >
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(99,102,241,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#818cf8",
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Cryptographically Unbiased
                  </h3>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {t("passwordGen.guide.aboutDesc")}
                </p>
              </div>

              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {t("passwordGen.guide.howTitle")}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    t("passwordGen.guide.step1"),
                    t("passwordGen.guide.step2"),
                    t("passwordGen.guide.step3"),
                  ].map((stepText, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "rgba(99,102,241,0.2)",
                          color: "#a5b4fc",
                          fontSize: "12px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        {idx + 1}
                      </div>
                      <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {stepText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <HelpCircle size={18} style={{ color: "#fbbf24" }} />
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("passwordGen.guide.faqTitle")}
                </h3>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {[
                  { q: t("passwordGen.guide.faq1Q"), a: t("passwordGen.guide.faq1A") },
                  { q: t("passwordGen.guide.faq2Q"), a: t("passwordGen.guide.faq2A") },
                  { q: t("passwordGen.guide.faq3Q"), a: t("passwordGen.guide.faq3A") },
                ].map(({ q, a }, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: "var(--btn-secondary-bg)",
                      border: "1px solid var(--btn-secondary-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                      <CheckCircle2 size={15} style={{ color: "#34d399", marginTop: "3px", flexShrink: 0 }} />
                      <span>{q}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "21px" }}>
                      {a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
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
