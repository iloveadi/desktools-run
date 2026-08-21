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
              Privacy-First & High Performance
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
              { icon: ShieldCheck, title: "100% Client-Side Privacy", desc: "Your files and data never touch any remote server. Everything is processed 100% inside your Web Browser memory." },
              { icon: Zap, title: "Instant Performance", desc: "Zero upload delays or queue times. Get instant results using WebAssembly and HTML5 Canvas APIs." },
              { icon: Lock, title: "Zero Account Needed", desc: "No registration, no subscriptions, no ads, and no hidden fees. Just open and use." },
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

          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
              Why We Built desktools.run
            </h2>
            <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
              Traditional online converters require you to upload your sensitive PDFs, private images, and confidential documents to remote cloud servers. At desktools.run, we believe your personal data belongs strictly on your personal device.
            </p>
            <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
              By leveraging cutting-edge web technologies like WebAssembly, HTML5 Canvas, and modern Web APIs, we bring desktop-class performance directly to your Web Browser—without compromising your privacy.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
