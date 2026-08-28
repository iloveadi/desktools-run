"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VisitorCounter from "@/components/admin/VisitorCounter";
import {
  ShieldCheck,
  Lock,
  Mail,
  ExternalLink,
  Zap,
  Globe,
  Sparkles,
  ArrowRight,
  BarChart3,
  Layers,
  Inbox
} from "lucide-react";

export default function AdminRequestsPage() {
  const [pinInput, setPinInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const ADMIN_PIN = "1212";
  const ADMIN_EMAIL = "iloveadi@gmail.com";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {!isAuthenticated ? (
          /* Password Protection Screen */
          <section style={{ maxWidth: "420px", margin: "80px auto", padding: "0 24px" }}>
            <div
              style={{
                padding: "36px 28px",
                borderRadius: "16px",
                background: "var(--card-bg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "rgba(99, 102, 241, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "#818cf8",
                }}
              >
                <Lock size={28} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                관리자 인증
              </h2>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                관리자 관제 센터에 접속하려면 PIN 번호를 입력하세요.
              </p>

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="password"
                  placeholder="PIN 번호 4자리 입력"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setAuthError("");
                  }}
                  style={{
                    height: "46px",
                    padding: "0 14px",
                    borderRadius: "10px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    color: "var(--text-primary)",
                    fontSize: "16px",
                    outline: "none",
                    letterSpacing: "4px",
                    textAlign: "center",
                  }}
                  autoFocus
                />
                {authError && (
                  <span style={{ fontSize: "12.5px", color: "#f87171" }}>{authError}</span>
                )}
                <button
                  type="submit"
                  className="btn-glow"
                  style={{
                    width: "100%",
                    height: "46px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "14.5px",
                    cursor: "pointer",
                  }}
                >
                  관제 센터 열기
                </button>
              </form>
            </div>
          </section>
        ) : (
          /* Admin Dashboard Content */
          <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "40px 24px" }}>
            {/* Header Title Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                      desktools.run 통합 관리자 관제 센터
                    </h1>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        background: "rgba(99, 102, 241, 0.15)",
                        border: "1px solid rgba(99, 102, 241, 0.35)",
                        color: "#818cf8",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      ADMIN ACTIVE
                    </span>
                  </div>
                  <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginTop: "4px", margin: 0 }}>
                    실시간 사용자 요청 이메일 수신함 및 Google Analytics 4 실시간 접속자 현황을 모니터링합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time Email Delivery Hub Card */}
            <div
              style={{
                padding: "24px 28px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(99, 102, 241, 0.08))",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "20px",
                marginBottom: "32px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", maxWidth: "680px" }}>
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#34d399",
                    flexShrink: 0,
                  }}
                >
                  <Inbox size={24} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "16.5px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                      📩 실시간 도구 요청 및 문의 메일 수신함
                    </h3>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#34d399" }}>
                      ● {ADMIN_EMAIL}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", margin: 0, lineHeight: 1.5 }}>
                    전 세계 사용자가 제출하는 모든 <strong>신규 도구 요청 및 문의사항</strong>은 관리자 이메일(<code>{ADMIN_EMAIL}</code>)로 1초 만에 즉시 자동 발송됩니다.
                  </p>
                </div>
              </div>

              <a
                href="https://mail.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow"
                style={{
                  padding: "10px 20px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
              >
                <Mail size={15} />
                지메일(Gmail) 수신함 열기
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Google Analytics 4 Realtime Monitoring & Looker Studio Embed */}
            <VisitorCounter />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
