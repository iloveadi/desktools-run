"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import { Search, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegexTesterPage() {
  const { t } = useLocale();

  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState(`Contact us at iloveadi@gmail.com or sales@example.com for help!
Invalid emails: test@domain, user@.com`);

  const getMatches = () => {
    if (!pattern.trim()) return [];
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { match: string; index: number }[] = [];
      let match: RegExpExecArray | null;

      if (flags.includes("g")) {
        while ((match = regex.exec(testText)) !== null) {
          matches.push({ match: match[0], index: match.index });
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testText);
        if (match) matches.push({ match: match[0], index: match.index });
      }
      return matches;
    } catch (err) {
      return null;
    }
  };

  const matches = getMatches();
  const isValidRegex = matches !== null;

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "16px" }}>
            <ArrowLeft size={14} /> {t("regexTester.back")}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Search size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("regexTester.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("regexTester.subtitle")}</p>
        </section>

        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Regex Input Box */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-muted)" }}>/</span>
              <input
                type="text"
                value={pattern}
                placeholder={t("regexTester.placeholderPattern")}
                onChange={(e) => setPattern(e.target.value)}
                style={{ flex: 1, height: "46px", borderRadius: "8px", background: "var(--input-bg)", border: isValidRegex ? "1px solid var(--border-subtle)" : "1px solid #ef4444", color: "var(--text-primary)", padding: "0 14px", fontSize: "15px", fontFamily: "monospace", fontWeight: 600 }}
              />
              <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-muted)" }}>/</span>
              <input
                type="text"
                value={flags}
                placeholder={t("regexTester.placeholderFlags")}
                onChange={(e) => setFlags(e.target.value)}
                style={{ width: "90px", height: "46px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "#818cf8", padding: "0 10px", fontSize: "14px", fontFamily: "monospace", fontWeight: 700 }}
              />
            </div>

            {!isValidRegex && (
              <div style={{ color: "#f87171", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                <AlertCircle size={15} /> {t("regexTester.invalidRegex")}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
            {/* Test Text */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t("regexTester.testString")}</span>
              <textarea
                rows={12}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                style={{ width: "100%", height: "300px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "14px", fontSize: "14px", fontFamily: "monospace", lineHeight: "1.6" }}
              />
            </div>

            {/* Match Results */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", height: "fit-content" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8" }}>{t("regexTester.matchResults")}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                  {matches ? `${matches.length} ${t("regexTester.matches")}` : `0 ${t("regexTester.matches")}`}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto" }}>
                {matches && matches.length > 0 ? (
                  matches.map((m, i) => (
                    <div key={i} style={{ padding: "8px 12px", borderRadius: "6px", background: "rgba(0,0,0,0.25)", border: "1px solid var(--border-subtle)", fontSize: "13px", fontFamily: "monospace", wordBreak: "break-all" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "11px", marginRight: "8px" }}>#{i + 1}</span>
                      <span style={{ color: "#4ade80", fontWeight: 700 }}>{m.match}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    {t("regexTester.noMatches")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <ToolGuide
          badgeText={t("regexTester.badge")}
          aboutTitle={t("regexTester.guide.aboutTitle")}
          aboutDesc={t("regexTester.guide.aboutDesc")}
          howTitle={t("regexTester.guide.howTitle")}
          steps={[
            t("regexTester.guide.step1"),
            t("regexTester.guide.step2"),
            t("regexTester.guide.step3"),
          ]}
          faqs={[
            { q: t("regexTester.guide.faq1Q"), a: t("regexTester.guide.faq1A") }
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
