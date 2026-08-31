"use client";

import React from "react";
import {
  ShieldCheck,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Briefcase,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";

export interface ToolFeature {
  icon?: React.ReactNode;
  title: string;
  desc: string;
}

export interface ToolUseCase {
  icon?: React.ReactNode;
  title: string;
  desc: string;
}

export interface ToolProTips {
  title?: string;
  tips: string[];
}

export interface ToolGuideProps {
  badgeText?: string;
  aboutTitle: string;
  aboutDesc: string;
  howTitle?: string;
  steps: string[];
  features?: ToolFeature[];
  featuresTitle?: string;
  useCases?: ToolUseCase[];
  useCasesTitle?: string;
  proTips?: ToolProTips;
  faqs: { q: string; a: string }[];
}

export default function ToolGuide({
  badgeText = "100% Free & Browser-Native",
  aboutTitle,
  aboutDesc,
  howTitle = "사용 방법",
  steps,
  features,
  featuresTitle,
  useCases,
  useCasesTitle,
  proTips,
  faqs,
}: ToolGuideProps) {
  const { t } = useLocale();

  // Strip accidental leading numbering e.g. "1. ", "1) " from step text
  const cleanSteps = steps.map((s) => s.replace(/^\d+[\.\)]\s*/, ""));

  // Generate FAQ Schema JSON-LD for rich snippet SEO
  const faqSchema =
    faqs && faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        }
      : null;

  return (
    <section
      style={{
        maxWidth: "1280px",
        margin: "56px auto 0",
        padding: "0 24px",
      }}
    >
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "48px",
        }}
      >
        {/* Top Header & Badge */}
        <div style={{ marginBottom: "36px", textAlign: "center" }}>
          <div className="badge-pill" style={{ marginBottom: "14px" }}>
            <BookOpen size={13} />
            {t("wordCount.guide.title") || "도구 소개 및 사용 가이드"}
          </div>
          <h2
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.4px",
            }}
          >
            {aboutTitle}
          </h2>
        </div>

        {/* ── 1. About Overview & How to Use Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: features || useCases || proTips ? "28px" : "32px",
          }}
          className="guide-grid"
        >
          {/* Left: About Overview Card */}
          <div
            className="glass-card"
            style={{
              padding: "26px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "rgba(99,102,241,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand-mid)",
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {badgeText}
              </h3>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              {aboutDesc}
            </p>
          </div>

          {/* Right: How to Use Steps Card */}
          <div
            className="glass-card"
            style={{
              padding: "26px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              {howTitle}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {cleanSteps.map((stepText, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "rgba(79,70,229,0.18)",
                      color: "var(--brand-mid)",
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

        {/* ── 2. Key Features & Highlights (Optional) ── */}
        {features && features.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <Zap size={18} style={{ color: "var(--brand-mid)" }} />
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {featuresTitle || "주요 특징 및 강점"}
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="glass-card"
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: "rgba(99,102,241,0.12)",
                        color: "var(--brand-mid)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                        flexShrink: 0,
                      }}
                    >
                      {feat.icon || <Sparkles size={16} />}
                    </div>
                    <h4
                      style={{
                        fontSize: "14.5px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      {feat.title}
                    </h4>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. Practical Use Cases (Optional) ── */}
        {useCases && useCases.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <Briefcase size={18} style={{ color: "#38bdf8" }} />
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {useCasesTitle || "실무 및 일상 활용 시나리오"}
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {useCases.map((uc, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "18px 20px",
                    borderRadius: "12px",
                    background: "var(--btn-secondary-bg)",
                    border: "1px solid var(--btn-secondary-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {uc.icon && (
                      <span style={{ fontSize: "16px", lineHeight: 1 }}>{uc.icon}</span>
                    )}
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      {uc.title}
                    </h4>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {uc.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. Pro Tips Callout Box (Optional) ── */}
        {proTips && proTips.tips && proTips.tips.length > 0 && (
          <div
            className="glass-card"
            style={{
              padding: "22px 24px",
              marginBottom: "28px",
              background:
                "linear-gradient(135deg, rgba(234,179,8,0.06), rgba(249,115,22,0.04))",
              border: "1px solid rgba(234,179,8,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                color: "#eab308",
              }}
            >
              <Lightbulb size={18} />
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {proTips.title || "알아두면 좋은 전문가 활용 팁"}
              </h3>
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {proTips.tips.map((tip, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: "13.5px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── 5. FAQ Section ── */}
        {faqs && faqs.length > 0 && (
          <div
            className="glass-card"
            style={{
              padding: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <HelpCircle size={18} style={{ color: "#fbbf24" }} />
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {t("wordCount.guide.faqTitle") || "자주 묻는 질문 (FAQ)"}
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
              }}
            >
              {faqs.map(({ q, a }, i) => (
                <div
                  key={i}
                  style={{
                    padding: "18px",
                    borderRadius: "12px",
                    background: "var(--btn-secondary-bg)",
                    border: "1px solid var(--btn-secondary-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{ color: "#34d399", marginTop: "2px", flexShrink: 0 }}
                    />
                    <span>{q}</span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      paddingLeft: "24px",
                      margin: 0,
                    }}
                  >
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .guide-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
