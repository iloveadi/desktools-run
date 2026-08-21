"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { BookOpen, Calendar, ArrowRight, Sparkles } from "lucide-react";

export default function BlogPage() {
  const { t } = useLocale();

  const articles = [
    {
      id: "client-side-ai-background-removal",
      title: "How Client-Side Web AI Neural Networks Remove Image Backgrounds in Browser",
      date: "August 21, 2026",
      category: "Web AI",
      snippet: "Explore how ONNX WebAssembly models perform 100% local image background removal without server APIs.",
    },
    {
      id: "pdf-lib-zero-server-processing",
      title: "Zero-Server PDF Manipulation using WebAssembly and pdf-lib",
      date: "August 15, 2026",
      category: "WebAssembly",
      snippet: "Learn how to merge, split, and compress PDF documents directly inside browser memory without cloud servers.",
    },
    {
      id: "html5-canvas-high-speed-image-resizing",
      title: "High-Speed Browser Image Resizing & Format Conversion with Canvas API",
      date: "August 08, 2026",
      category: "Performance",
      snippet: "A deep dive into HTML5 Canvas 2D context optimization for crisp, fast PNG, JPG, and WEBP encoding.",
    },
  ];

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8" }}>
              <BookOpen size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("pages.blog.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {t("pages.blog.subtitle")}
          </p>
        </section>

        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {articles.map((post) => (
              <div
                key={post.id}
                className="glass-card"
                style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "12px", transition: "transform 0.2s, border-color 0.2s" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12.5px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "100px", background: "rgba(99,102,241,0.15)", color: "#818cf8", fontWeight: 700 }}>
                    {post.category}
                  </span>
                  <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={13} />
                    {post.date}
                  </span>
                </div>

                <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", cursor: "pointer" }}>
                  {post.title}
                </h2>

                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {post.snippet}
                </p>

                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#818cf8", marginTop: "4px", cursor: "pointer" }}>
                  Read Article <ArrowRight size={14} />
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
