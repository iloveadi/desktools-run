"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { BLOG_POSTS, getLocalizedPost } from "@/lib/blog";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const { t, locale } = useLocale();

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(99,102,241,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
              }}
            >
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
            {BLOG_POSTS.map((post) => {
              const localized = getLocalizedPost(post, locale);

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="glass-card"
                  style={{
                    padding: "28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    textDecoration: "none",
                    transition: "transform 0.2s, border-color 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12.5px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "100px",
                        background: "rgba(99,102,241,0.15)",
                        color: "#818cf8",
                        fontWeight: 700,
                      }}
                    >
                      {post.category}
                    </span>
                    <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} />
                      {post.date}
                    </span>
                  </div>

                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {localized.title}
                  </h2>

                  <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    {localized.snippet}
                  </p>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      color: "#818cf8",
                      marginTop: "4px",
                    }}
                  >
                    {locale === "ko"
                      ? "아티클 읽기"
                      : locale === "ja"
                      ? "記事を読む"
                      : locale === "es"
                      ? "Leer artículo"
                      : locale === "zh"
                      ? "阅读文章"
                      : locale === "fr"
                      ? "Lire l'article"
                      : "Read Article"}{" "}
                    <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
