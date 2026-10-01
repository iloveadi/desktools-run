"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { Locale } from "@/lib/i18n";
import { BLOG_POSTS, getLocalizedPost } from "@/lib/blog";

interface BlogSectionContent {
  badge: string;
  title: string;
  subtitle: string;
  viewAll: string;
  readArticle: string;
}

const CONTENT: Record<Locale, BlogSectionContent> = {
  ko: {
    badge: "기술 블로그 & 심층 가이드",
    title: "웹 엔지니어링 & 데이터 보안 최신 기술 아티클",
    subtitle:
      "브라우저 기반 WebAssembly 연산, 무손실 압축 기법, JWT 인증 보안 등 desktools.run 엔지니어링 팀이 작성한 기술 분석 글을 만나보세요.",
    viewAll: "블로그 아티클 전체 보기 (15개) →",
    readArticle: "아티클 읽기",
  },
  en: {
    badge: "Engineering Blog & Tech Insights",
    title: "Latest Technical Articles & Web Engineering Insights",
    subtitle:
      "Explore deep-dive technical breakdowns on WebAssembly, perceptual image compression, client-side cryptographic security, and performance optimizations.",
    viewAll: "View All 15 Articles →",
    readArticle: "Read Article",
  },
  ja: {
    badge: "技術ブログ＆詳細解説",
    title: "Webエンジニアリング＆データセキュリティ最新技術記事",
    subtitle:
      "WebAssemblyブラウザ演算、視覚的無損失圧縮アルゴリズム、JWT認証セキュリティなど、エンジニアリングチームによる技術解説をご覧ください。",
    viewAll: "技術記事をすべて見る（全15編）→",
    readArticle: "記事を読む",
  },
  es: {
    badge: "Blog Técnico y Guías de Ingeniería",
    title: "Artículos Técnicos de Ingeniería Web y Seguridad de Datos",
    subtitle:
      "Explore análisis exhaustivos sobre WebAssembly, compresión perceptiva de imágenes, criptografía en el navegador y optimización de rendimiento.",
    viewAll: "Ver los 15 Artículos Completos →",
    readArticle: "Leer Artículo",
  },
  zh: {
    badge: "技术博客与深度指南",
    title: "Web 工程架构与数据安全前沿技术专栏",
    subtitle:
      "深入探索由 desktools.run 技术团队撰写的 WebAssembly 浏览器运算、人眼感知无损压缩、JWT 鉴权安全与前端性能优化深度剖析。",
    viewAll: "查看全部 15 篇技术文章 →",
    readArticle: "阅读全文",
  },
  fr: {
    badge: "Blog Technique & Guides Ingénierie",
    title: "Articles Techniques sur l'Ingénierie Web et la Sécurité",
    subtitle:
      "Découvrez des analyses approfondies sur WebAssembly, la compression d'image sans perte visuelle, la cryptographie côté client et l'optimisation des performances.",
    viewAll: "Voir les 15 Articles Techniques →",
    readArticle: "Lire l'Article",
  },
};

export default function HomeBlogSection() {
  const { locale } = useLocale();
  const c = CONTENT[locale] || CONTENT.en;

  // Pick top 4 curated high-quality articles
  const featuredPosts = BLOG_POSTS.slice(0, 4);

  return (
    <section
      style={{
        backgroundColor: "var(--colors-canvas-soft)",
        borderTop: "1px solid var(--colors-hairline)",
        borderBottom: "1px solid var(--colors-hairline)",
        padding: "64px 24px",
      }}
      aria-labelledby="blog-section-heading"
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "100px",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                color: "#818cf8",
                fontSize: "12.5px",
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              <BookOpen size={14} />
              <span>{c.badge}</span>
            </div>
            <h2
              id="blog-section-heading"
              style={{
                fontSize: "clamp(24px, 3.5vw, 32px)",
                fontWeight: 800,
                color: "var(--colors-ink-strong)",
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              {c.title}
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "var(--colors-body)",
                marginTop: "8px",
                marginBottom: 0,
                maxWidth: "680px",
                lineHeight: 1.6,
              }}
            >
              {c.subtitle}
            </p>
          </div>

          <Link
            href="/blog/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--colors-primary)",
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "rgba(0, 217, 146, 0.08)",
              border: "1px solid rgba(0, 217, 146, 0.25)",
              transition: "all 0.15s ease",
            }}
          >
            <span>{c.viewAll}</span>
          </Link>
        </div>

        {/* 4 Article Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {featuredPosts.map((post) => {
            const localized = getLocalizedPost(post, locale);

            return (
              <Link
                key={post.id}
                href={`/blog/${post.id}/`}
                className="glass-card"
                style={{
                  padding: "26px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  gap: "16px",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      marginBottom: "12px",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "100px",
                        background: "rgba(99, 102, 241, 0.15)",
                        color: "#818cf8",
                        fontWeight: 700,
                      }}
                    >
                      {post.category}
                    </span>
                    <span
                      style={{
                        color: "var(--colors-mute)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: 500,
                      }}
                    >
                      <Calendar size={12} />
                      {post.date}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "var(--colors-ink-strong)",
                      lineHeight: 1.45,
                      marginBottom: "10px",
                    }}
                  >
                    {localized.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "var(--colors-body)",
                      lineHeight: 1.6,
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {localized.snippet}
                  </p>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--colors-primary)",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--colors-hairline)",
                  }}
                >
                  <span>{c.readArticle}</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
