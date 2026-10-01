"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { ShieldCheck, Zap, Lock, Cpu, Globe2, Sparkles } from "lucide-react";

export default function AboutPage() {
  const { t } = useLocale();

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "100px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", fontSize: "12.5px", color: "#818cf8", fontWeight: 600, marginBottom: "16px" }}>
              <Sparkles size={14} />
              {t("pages.about.badge")}
            </div>
            <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)", marginBottom: "12px" }}>
              {t("pages.about.title")}
            </h1>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", maxWidth: "680px", margin: "0 auto" }}>
              {t("pages.about.subtitle")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "40px" }}>
            {[
              { icon: ShieldCheck, title: t("pages.about.card1.title"), desc: t("pages.about.card1.desc") },
              { icon: Zap, title: t("pages.about.card2.title"), desc: t("pages.about.card2.desc") },
              { icon: Lock, title: t("pages.about.card3.title"), desc: t("pages.about.card3.desc") },
            ].map((card, idx) => (
              <div key={idx} className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <card.icon size={22} />
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>{card.title}</h3>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("pages.about.why.title")}
            </h2>
            <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
              {t("pages.about.why.p1")}
            </p>
            <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
              {t("pages.about.why.p2")}
            </p>
          </div>

          {/* Technology Architecture Section */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "18px", marginBottom: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Cpu size={20} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                {t("pages.about.tech.title")}
              </h2>
            </div>
            <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
              {t("pages.about.tech.desc")}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginTop: "8px" }}>
              <div style={{ padding: "16px", borderRadius: "10px", background: "var(--btn-secondary-bg)", border: "1px solid var(--btn-secondary-border)" }}>
                <strong style={{ display: "block", color: "var(--text-primary)", fontSize: "14px", marginBottom: "4px" }}>
                  {t("pages.about.tech.item1.title")}
                </strong>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {t("pages.about.tech.item1.desc")}
                </span>
              </div>
              <div style={{ padding: "16px", borderRadius: "10px", background: "var(--btn-secondary-bg)", border: "1px solid var(--btn-secondary-border)" }}>
                <strong style={{ display: "block", color: "var(--text-primary)", fontSize: "14px", marginBottom: "4px" }}>
                  {t("pages.about.tech.item2.title")}
                </strong>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {t("pages.about.tech.item2.desc")}
                </span>
              </div>
              <div style={{ padding: "16px", borderRadius: "10px", background: "var(--btn-secondary-bg)", border: "1px solid var(--btn-secondary-border)" }}>
                <strong style={{ display: "block", color: "var(--text-primary)", fontSize: "14px", marginBottom: "4px" }}>
                  {t("pages.about.tech.item3.title")}
                </strong>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {t("pages.about.tech.item3.desc")}
                </span>
              </div>
            </div>
          </div>

          {/* Team & Contact Information */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(34,211,168,0.15)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Globe2 size={20} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                {t("pages.about.contact.title")}
              </h2>
            </div>
            <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
              {t("pages.about.contact.desc")}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px", fontSize: "14px", color: "var(--text-secondary)" }}>
              <span>{t("pages.about.contact.official")}</span>
              <a href="mailto:iloveadi@gmail.com" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "underline" }}>
                iloveadi@gmail.com
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
