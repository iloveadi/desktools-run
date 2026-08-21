"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { Lightbulb, Send, CheckCircle2 } from "lucide-react";

export default function RequestToolPage() {
  const { t } = useLocale();

  const [toolTitle, setToolTitle] = useState("");
  const [category, setCategory] = useState("PDF Tools");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolTitle.trim() || !description.trim()) {
      alert("Please fill in both tool name and description.");
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8" }}>
              <Lightbulb size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("pages.request.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {t("pages.request.subtitle")}
          </p>
        </section>

        <section style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
          {isSubmitted ? (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.3)" }}>
              <CheckCircle2 size={48} style={{ color: "#818cf8" }} />
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                  Thank you for your suggestion!
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Our development team will review your tool request for future release.
                </p>
              </div>
              <button
                onClick={() => { setIsSubmitted(false); setToolTitle(""); setDescription(""); }}
                style={{ padding: "10px 20px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", border: "none", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", marginTop: "8px" }}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Tool Name / Concept *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SVG to PNG Converter, CSV Column Filter"
                  value={toolTitle}
                  onChange={(e) => setToolTitle(e.target.value)}
                  style={{ width: "100%", height: "44px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "0 14px", fontSize: "14px" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Tool Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: "100%", height: "44px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "0 14px", fontSize: "14px" }}
                >
                  <option value="PDF Tools">PDF Tools</option>
                  <option value="Image Tools">Image Tools</option>
                  <option value="Dev Tools">Dev Tools</option>
                  <option value="Converter Tools">Converter Tools</option>
                  <option value="Text Tools">Text Tools</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Detailed Features & Description *
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe how this tool should work, input/output formats, and your use case..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "12px 14px", fontSize: "14px", fontFamily: "inherit" }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{ width: "100%", height: "48px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}
              >
                <Send size={16} />
                Submit Tool Request
              </button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
