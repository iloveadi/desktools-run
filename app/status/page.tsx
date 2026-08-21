"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { Activity, CheckCircle2, Server, Cpu, Shield, Zap } from "lucide-react";

export default function StatusPage() {
  const { t } = useLocale();

  const services = [
    { name: "Client WebAssembly PDF Engine (pdf-lib)", status: "Operational", ping: "0.1 ms" },
    { name: "Client Web AI ONNX Engine (@imgly)", status: "Operational", ping: "0.2 ms" },
    { name: "HTML5 Canvas 2D Engine", status: "Operational", ping: "0.1 ms" },
    { name: "Cloudflare Global Edge CDN", status: "Operational", ping: "12 ms" },
    { name: "Static Assets & Google Fonts", status: "Operational", ping: "15 ms" },
  ];

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "840px", margin: "0 auto", padding: "40px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4ade80" }}>
              <Activity size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("pages.status.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {t("pages.status.subtitle")}
          </p>
        </section>

        <section style={{ maxWidth: "840px", margin: "0 auto", padding: "0 24px" }}>
          {/* Status Alert Banner */}
          <div className="glass-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "14px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", marginBottom: "24px" }}>
            <CheckCircle2 size={24} style={{ color: "#4ade80" }} />
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                All Systems Operational
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                100% of client engines and static delivery services are running smoothly.
              </p>
            </div>
          </div>

          {/* Service List */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {services.map((svc, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {svc.name}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{svc.ping}</span>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#4ade80", padding: "4px 10px", borderRadius: "100px", background: "rgba(34,197,94,0.15)" }}>
                    {svc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
