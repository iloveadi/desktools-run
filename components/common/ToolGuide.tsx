"use client";

import { ShieldCheck, BookOpen, HelpCircle, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";

export interface ToolGuideProps {
  badgeText?: string;
  aboutTitle: string;
  aboutDesc: string;
  howTitle?: string;
  steps: string[];
  faqs: { q: string; a: string }[];
}

export default function ToolGuide({
  badgeText = "100% Free & Browser-Native",
  aboutTitle,
  aboutDesc,
  howTitle = "사용 방법",
  steps,
  faqs,
}: ToolGuideProps) {
  const { t } = useLocale();

  return (
    <section
      style={{
        maxWidth: "1280px",
        margin: "56px auto 0",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "48px",
        }}
      >
        {/* Top Header & Badge */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <div
            className="badge-pill"
            style={{ marginBottom: "14px" }}
          >
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

        {/* About Box & How to Use Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "32px",
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
              {steps.map((stepText, idx) => (
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

        {/* FAQ Section */}
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
                gap: "20px",
              }}
            >
              {faqs.map(({ q, a }, i) => (
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
                    <CheckCircle2 size={16} style={{ color: "#34d399", marginTop: "2px", flexShrink: 0 }} />
                    <span>{q}</span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      paddingLeft: "24px",
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
