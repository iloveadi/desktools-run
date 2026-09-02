"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Briefcase,
  Zap,
  ArrowRight,
  Layers,
  Lock,
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

export interface RelatedToolItem {
  title: string;
  desc: string;
  href: string;
  badge?: string;
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
  relatedTools?: RelatedToolItem[];
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
  relatedTools,
}: ToolGuideProps) {
  const { t, locale } = useLocale();

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
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
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
              marginBottom: "16px",
            }}
          >
            {aboutTitle}
          </h2>

          {/* Trust & Local Processing Indicator Chip */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "100px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.28)",
              color: "#34d399",
              fontSize: "12.5px",
              fontWeight: 700,
              boxShadow: "0 2px 10px rgba(16, 185, 129, 0.08)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px #10b981",
              }}
            />
            <span>
              {locale === "ko"
                ? "100% 브라우저 로컬 안전 처리 (Zero Server Upload) · 파일이 외부로 전송되지 않습니다"
                : "100% Client-Side Local Processing (Zero Server Upload) · Files never leave your device"}
            </span>
          </div>
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={18} style={{ color: "#34d399" }} />
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {t("wordCount.guide.overviewTitle") || "도구 개요 & 개인정보 보호"}
              </h3>
            </div>
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {aboutDesc}
            </p>
          </div>

          {/* Right: Step-by-Step How to Use Card */}
          <div
            className="glass-card"
            style={{
              padding: "26px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} style={{ color: "#818cf8" }} />
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {howTitle}
              </h3>
            </div>
            <ol
              style={{
                margin: 0,
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {cleanSteps.map((step, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: "13.5px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── 2. Key Features Grid (Optional) ── */}
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
              <Zap size={18} style={{ color: "#f59e0b" }} />
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {featuresTitle || "주요 핵심 기능"}
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {features.map((feat, i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {feat.icon && (
                      <span style={{ color: "#818cf8", display: "flex" }}>
                        {feat.icon}
                      </span>
                    )}
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
                      lineHeight: 1.55,
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

        {/* ── 3. Real-world Use Cases (Optional) ── */}
        {useCases && useCases.length > 0 && (
          <div
            className="glass-card"
            style={{
              padding: "24px",
              marginBottom: "28px",
              background: "var(--bg-card)",
            }}
          >
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
                  margin: 0,
                }}
              >
                {useCasesTitle || "이런 상황에서 활용해보세요"}
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "14px",
              }}
            >
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
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
              marginBottom: "28px",
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

        {/* ── 6. Next Action: Related Tools Flow (Optional) ── */}
        {relatedTools && relatedTools.length > 0 && (
          <div
            className="glass-card"
            style={{
              padding: "24px 28px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.03))",
              border: "1px solid rgba(99, 102, 241, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} style={{ color: "#818cf8" }} />
                <h3 style={{ fontSize: "16.5px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {locale === "ko" ? "함께 쓰면 좋은 연관 도구" : "Related Utilities"}
                </h3>
              </div>
              <Link
                href="/tools/"
                style={{
                  fontSize: "12.5px",
                  color: "#818cf8",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                {locale === "ko" ? "전체 도구 보기" : "View all tools"}
                <ArrowRight size={13} />
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "14px",
              }}
            >
              {relatedTools.map((rt, i) => (
                <Link
                  key={i}
                  href={rt.href}
                  className="glass-card card-hover"
                  style={{
                    padding: "16px",
                    textDecoration: "none",
                    borderRadius: "10px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                      {rt.title}
                    </h4>
                    <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                      {rt.desc}
                    </p>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#818cf8", fontWeight: 700, paddingTop: "4px" }}>
                    <span>{locale === "ko" ? "도구 실행하기" : "Run tool"}</span>
                    <ArrowRight size={12} />
                  </div>
                </Link>
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
