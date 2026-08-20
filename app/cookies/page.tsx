"use client";

/**
 * app/cookies/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Cookie Policy Page for desktools.run
 *
 * Features:
 *  - Clear disclosure of zero tracking cookies policy
 *  - Essential local storage usage breakdown
 *  - Browser storage management guide
 *  - Full 6-language i18n & Dark/Light theme support
 */

import Link from "next/link";
import {
  Cookie,
  ArrowLeft,
  ShieldCheck,
  HardDrive,
  Sliders,
  Trash2,
  Mail,
  Sparkles,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";

export default function CookiePolicyPage() {
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
                    background: "rgba(168,85,247,0.15)",
                    border: "1px solid rgba(168,85,247,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a855f7",
                  }}
                >
                  <Cookie size={20} />
                </div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "var(--text-primary)",
                  }}
                >
                  {t("cookies.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
                {t("cookies.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "100px",
                background: "rgba(168,85,247,0.12)",
                border: "1px solid rgba(168,85,247,0.25)",
                fontSize: "12.5px",
                color: "#c084fc",
                fontWeight: 600,
              }}
            >
              <Sparkles size={13} />
              {t("cookies.badge")}
            </div>
          </div>
        </section>

        {/* ── Main Policy Content Container ────────────── */}
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Section 1: No Invasive Tracking Cookies */}
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
                  <ShieldCheck size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("cookies.sec1Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("cookies.sec1Desc")}
              </p>
            </div>

            {/* Section 2: What We Store (Essential Local Storage) */}
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
                  <HardDrive size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("cookies.sec2Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("cookies.sec2Desc")}
              </p>
            </div>

            {/* Section 3: How Cookies and Storage Work */}
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
                  <Sliders size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("cookies.sec3Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("cookies.sec3Desc")}
              </p>
            </div>

            {/* Section 4: How to Manage or Delete Browser Data */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(239,68,68,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f87171",
                  }}
                >
                  <Trash2 size={18} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("cookies.sec4Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("cookies.sec4Desc")}
              </p>
            </div>

            {/* Section 5: Policy Updates & Contact */}
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
                  {t("cookies.sec5Title")}
                </h2>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "42px" }}>
                {t("cookies.sec5Desc")}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
