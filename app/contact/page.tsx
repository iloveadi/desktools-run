"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { Mail, Send, CheckCircle2, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const { t } = useLocale();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsSent(true);
  };

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8" }}>
              <Mail size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("pages.contact.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {t("pages.contact.subtitle")}
          </p>
        </section>

        <section style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
          {isSent ? (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.3)" }}>
              <CheckCircle2 size={48} style={{ color: "#818cf8" }} />
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                  Message Sent Successfully!
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Thank you for reaching out. We will get back to you shortly via email.
                </p>
              </div>
              <button
                onClick={() => { setIsSent(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}
                style={{ padding: "10px 20px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", border: "none", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", marginTop: "8px" }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", height: "44px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "0 14px", fontSize: "14px" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", height: "44px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "0 14px", fontSize: "14px" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Bug report, feedback, inquiry..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: "100%", height: "44px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "0 14px", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Message *
                </label>
                <textarea
                  rows={6}
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: "100%", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "12px 14px", fontSize: "14px", fontFamily: "inherit" }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{ width: "100%", height: "48px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}
              >
                <Send size={16} />
                Send Message
              </button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
