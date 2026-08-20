"use client";

/**
 * app/privacy/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Privacy Policy Page for desktools.run
 *
 * Features:
 *  - 100% Client-side privacy guarantee disclosure
 *  - GDPR & CCPA privacy declarations
 *  - Local storage & cookies usage disclosure
 *  - Contact information
 *  - Full 6-language i18n & Dark/Light theme support
 */

import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  HardDrive,
  Cookie,
  UserCheck,
  Mail,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";

export default function PrivacyPolicyPage() {
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
                    background: "rgba(34,211,168,0.15)",
                    border: "1px solid rgba(34,211,168,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#34d399",
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "var(--text-primary)",
                  }}
                >
                  {t("privacy.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
                {t("privacy.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "100px",
                background: "rgba(34,211,168,0.12)",
                border: "1px solid rgba(34,211,168,0.25)",
                fontSize: "12.5px",
                color: "#34d399",
                fontWeight: 600,
              }}
            >
              <Sparkles size={13} />
              {t("privacy.badge")}
            </div>
          </div>
        </section>

        {/* ── Main Policy Content Container ────────────── */}
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Section 1: Zero Server Transmission */}
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
                  <Lock size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("privacy.sec1Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("privacy.sec1Desc")}
              </p>
            </div>

            {/* Section 2: Information We Do Not Collect */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(248,113,113,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f87171",
                  }}
                >
                  <UserCheck size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("privacy.sec2Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("privacy.sec2Desc")}
              </p>
            </div>

            {/* Section 3: Local Storage Usage */}
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
                  <HardDrive size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("privacy.sec3Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("privacy.sec3Desc")}
              </p>
            </div>

            {/* Section 4: Cookies & Analytics */}
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
                  <Cookie size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("privacy.sec4Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("privacy.sec4Desc")}
              </p>
            </div>

            {/* Section 5: Your Data Rights & Contact */}
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
                  {t("privacy.sec5Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("privacy.sec5Desc")}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
