"use client";

/**
 * app/terms/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Terms of Service Page for desktools.run
 *
 * Features:
 *  - Clear legal terms & conditions for platform usage
 *  - 100% free license & service scope
 *  - Disclaimer of warranties (AS IS)
 *  - Acceptable use & intellectual property clauses
 *  - Full 6-language i18n & Dark/Light theme support
 */

import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Zap,
  Mail,
  Sparkles,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";

export default function TermsOfServicePage() {
  const { t } = useLocale();

  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* ── Breadcrumb & Header Summary ───────────────── */}
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px 24px" }}>
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
            Back to Home
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
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#818cf8",
                  }}
                >
                  <FileText size={20} />
                </div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "var(--text-primary)",
                  }}
                >
                  {t("terms.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
                {t("terms.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "100px",
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                fontSize: "12.5px",
                color: "#a5b4fc",
                fontWeight: 600,
              }}
            >
              <Sparkles size={13} />
              {t("terms.badge")}
            </div>
          </div>
        </section>

        {/* ── Main Terms Content Container ─────────────── */}
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Section 1: Acceptance of Terms */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
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
                  <CheckCircle2 size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("terms.sec1Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("terms.sec1Desc")}
              </p>
            </div>

            {/* Section 2: Service Scope & Free License */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(34,211,168,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#34d399",
                  }}
                >
                  <Zap size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("terms.sec2Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("terms.sec2Desc")}
              </p>
            </div>

            {/* Section 3: Disclaimer of Warranties */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(251,191,36,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fbbf24",
                  }}
                >
                  <AlertTriangle size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("terms.sec3Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("terms.sec3Desc")}
              </p>
            </div>

            {/* Section 4: Intellectual Property & Acceptable Use */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(168,85,247,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a855f7",
                  }}
                >
                  <Shield size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("terms.sec4Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("terms.sec4Desc")}
              </p>
            </div>

            {/* Section 5: Modifications & Contact */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(96,165,250,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#60a5fa",
                  }}
                >
                  <Mail size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("terms.sec5Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("terms.sec5Desc")}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
