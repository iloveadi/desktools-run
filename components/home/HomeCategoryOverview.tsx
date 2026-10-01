"use client";

import React from "react";
import Link from "next/link";
import { FileText, Image as ImageIcon, Code2, Type, ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { Locale } from "@/lib/i18n";

interface CategoryData {
  title: string;
  badge: string;
  desc: string;
  tools: { name: string; href: string }[];
}

interface OverviewContent {
  badge: string;
  title: string;
  subtitle: string;
  featuredLabel: string;
  categories: CategoryData[];
}

const CONTENT: Record<Locale, OverviewContent> = {
  ko: {
    badge: "카테고리별 기술 가이드",
    title: "현대적인 업무 환경을 위한 4대 핵심 유틸리티 영역",
    subtitle:
      "일상적인 개발 및 문서 편집 과정에서 반복되는 번거로운 작업을 간결하고 직관적인 브라우저 도구로 해결하세요. 모든 도구는 즉시 실행 가능한 독립형 아키텍처로 설계되었습니다.",
    featuredLabel: "대표 도구 바로가기",
    categories: [
      {
        title: "PDF & 문서 처리 도구 모음",
        badge: "pdf-lib 기반 로컬 파이프라인",
        desc: "대용량 PDF 문서의 병합, 분할, 무손실 압축, 암호 설정 및 해제 작업을 브라우저 메모리 안에서 직접 수행합니다. 외부 서버로 문서를 전송하지 않으므로 사내 기밀 보고서, 개인 계약서, 금융 증명서를 가장 안전하게 처리할 수 있습니다.",
        tools: [
          { name: "PDF 합치기", href: "/tools/pdf-merger/" },
          { name: "PDF 분할", href: "/tools/pdf-split/" },
          { name: "PDF 용량 압축", href: "/tools/pdf-compress/" },
          { name: "PDF 암호 잠금", href: "/tools/pdf-protect/" },
        ],
      },
      {
        title: "이미지 & 그래픽 최적화 엔진",
        badge: "HTML5 Canvas & WebP",
        desc: "스마트 양자화(Perceptual Quantization) 알고리즘을 적용한 무손실 압축, WebP/PNG/JPG 상호 변환, 브라우저 로컬 AI 기반 배경 투명화(누끼 따기), EXIF 메타데이터 제거 기능을 제공합니다. 대용량 그래픽 애셋도 즉각적인 하드웨어 가속으로 처리됩니다.",
        tools: [
          { name: "이미지 압축", href: "/tools/image-compress/" },
          { name: "포맷 변환", href: "/tools/image-converter/" },
          { name: "AI 배경 제거", href: "/tools/background-remover/" },
          { name: "EXIF 정보 제거", href: "/tools/exif-remover/" },
        ],
      },
      {
        title: "개발자 & 암호학 유틸리티",
        badge: "Web Crypto API & 실시간 분석",
        desc: "프로덕션 환경의 실무 개발자를 위해 JWT 토큰의 실시간 서명 분석 및 페이로드 디코딩, Cron 스케줄 표현식 시각화, SHA-256 해시 생성, AES-256 대칭키 암복호화, Base64/URL 인코딩 및 디코딩을 제공합니다. 디버깅 세션 중에도 토큰 정보가 외부로 노출되지 않습니다.",
        tools: [
          { name: "JWT 디코더", href: "/tools/jwt-decoder/" },
          { name: "Cron 표현식 파서", href: "/tools/cron-parser/" },
          { name: "JSON 포매터", href: "/tools/json-formatter/" },
          { name: "AES 암호화", href: "/tools/aes-encrypt/" },
        ],
      },
      {
        title: "텍스트 & 생산성 에디터",
        badge: "초고속 텍스트 엔진",
        desc: "실시간 한글/영문 글자 수·단어 수·공백 제외 글자 수 계산기, 두 텍스트 블록 간의 변경 내역을 시각적으로 대조하는 Diff 비교기, 마크다운 실시간 렌더링 뷰어, 카멜케이스/스네이크케이스 변환기 등을 갖추고 있어 일상적인 문서 작성 및 교정 업무를 신속하게 돕습니다.",
        tools: [
          { name: "글자수 세기", href: "/tools/word-count/" },
          { name: "텍스트 차이점 비교", href: "/tools/text-diff/" },
          { name: "마크다운 미리보기", href: "/tools/markdown-preview/" },
          { name: "텍스트 케이스 변환", href: "/tools/text-case/" },
        ],
      },
    ],
  },

  en: {
    badge: "Category Engineering Guide",
    title: "Four Foundational Toolkits for High-Velocity Modern Workflows",
    subtitle:
      "Streamline daily developer and digital office workflows with purpose-built utilities designed for zero latency and privacy-first execution.",
    featuredLabel: "Featured Utilities",
    categories: [
      {
        title: "PDF & Document Suite",
        badge: "pdf-lib Stream Engine",
        desc: "Merge, split, compress, and password-protect heavy PDF documents directly inside your browser memory with zero network uploads. Perfect for legal agreements and financial statements.",
        tools: [
          { name: "PDF Merge", href: "/tools/pdf-merger/" },
          { name: "PDF Split", href: "/tools/pdf-split/" },
          { name: "PDF Compress", href: "/tools/pdf-compress/" },
          { name: "PDF Protect", href: "/tools/pdf-protect/" },
        ],
      },
      {
        title: "Image & Visual Optimization",
        badge: "HTML5 Canvas & WebP Engine",
        desc: "Compress PNG, JPG, and WebP assets with perceptual lossless quantization, convert formats in batch, eliminate tracking EXIF metadata, and remove photo backgrounds via client-side AI.",
        tools: [
          { name: "Image Compress", href: "/tools/image-compress/" },
          { name: "Image Converter", href: "/tools/image-converter/" },
          { name: "Background Remover", href: "/tools/background-remover/" },
          { name: "EXIF Remover", href: "/tools/exif-remover/" },
        ],
      },
      {
        title: "Developer & Cryptography Tools",
        badge: "Web Crypto API & Real-time",
        desc: "Inspect and decode JWT authentication tokens, parse Cron expressions with human-readable next-run schedules, calculate SHA-256 hashes, and perform AES-256 encryption in total privacy.",
        tools: [
          { name: "JWT Decoder", href: "/tools/jwt-decoder/" },
          { name: "Cron Parser", href: "/tools/cron-parser/" },
          { name: "JSON Formatter", href: "/tools/json-formatter/" },
          { name: "AES Encrypt", href: "/tools/aes-encrypt/" },
        ],
      },
      {
        title: "Text & Productivity Suite",
        badge: "Instant Text Engine",
        desc: "Compute live word, character, and byte metrics, compare paragraph differences with visual syntax diffing, preview Markdown in real-time, and batch-transform casing formats effortlessly.",
        tools: [
          { name: "Word Count", href: "/tools/word-count/" },
          { name: "Text Diff", href: "/tools/text-diff/" },
          { name: "Markdown Preview", href: "/tools/markdown-preview/" },
          { name: "Text Case", href: "/tools/text-case/" },
        ],
      },
    ],
  },

  ja: {
    badge: "カテゴリ別技術ガイド",
    title: "日々の業務と開発を加速する4大コアユーティリティ",
    subtitle:
      "日常的なプログラミングや文書作成における煩雑な作業を、直感的かつ高速なブラウザツールで解決します。全ツールが外部送信のない独立型アーキテクチャで設計されています。",
    featuredLabel: "注目のユーティリティ",
    categories: [
      {
        title: "PDF・ドキュメント処理スイート",
        badge: "pdf-lib ネイティブ処理",
        desc: "大容量PDFの結合・分割・無損失圧縮・暗号化ロックをブラウザメモリ内で直接処理。外部サーバーに送信されないため、社内機密書や個人契約書も最高水準の安全性で扱えます。",
        tools: [
          { name: "PDF結合", href: "/tools/pdf-merger/" },
          { name: "PDF分割", href: "/tools/pdf-split/" },
          { name: "PDF圧縮", href: "/tools/pdf-compress/" },
          { name: "PDFパスワード保護", href: "/tools/pdf-protect/" },
        ],
      },
      {
        title: "画像・グラフィック最適化エンジン",
        badge: "HTML5 Canvas & WebP",
        desc: "視覚的無損失圧縮、WebP/PNG/JPGの一括相互変換、ブラウザ完結型AI背景削除（切り抜き）、EXIF個人情報消去に対応。グラフィック作業を高速化します。",
        tools: [
          { name: "画像圧縮", href: "/tools/image-compress/" },
          { name: "画像変換", href: "/tools/image-converter/" },
          { name: "AI背景透過", href: "/tools/background-remover/" },
          { name: "EXIF削除", href: "/tools/exif-remover/" },
        ],
      },
      {
        title: "開発者・セキュリティツール",
        badge: "Web Crypto API リアルタイム解析",
        desc: "現場の開発者のためにJWTトークンの即時デコード、Cronスケジュール解析、SHA-256ハッシュ生成、AES-256暗号化、Base64相互変換を提供。トークン漏洩の心配なくデバッグできます。",
        tools: [
          { name: "JWTデコーダー", href: "/tools/jwt-decoder/" },
          { name: "Cronパーサー", href: "/tools/cron-parser/" },
          { name: "JSONフォーマッター", href: "/tools/json-formatter/" },
          { name: "AES暗号化", href: "/tools/aes-encrypt/" },
        ],
      },
      {
        title: "テキスト・文書生産性エディタ",
        badge: "超高速テキスト処理エンジン",
        desc: "文字数・単語数・バイト数のリアルタイム計測、2つのテキストの変更箇所を可視化するDiff比較、Markdownプレビュー、大文字小文字変換など、執筆・校正を迅速にサポートします。",
        tools: [
          { name: "文字数カウント", href: "/tools/word-count/" },
          { name: "テキスト差分比較", href: "/tools/text-diff/" },
          { name: "Markdownプレビュー", href: "/tools/markdown-preview/" },
          { name: "テキストケース変換", href: "/tools/text-case/" },
        ],
      },
    ],
  },

  es: {
    badge: "Guía Técnica por Categoría",
    title: "Cuatro Suites Fundamentales para Flujos de Trabajo Modernos",
    subtitle:
      "Optimice tareas repetitivas de desarrollo y oficina digital con herramientas diseñadas específicamente para ofrecer cero latencia y máxima privacidad.",
    featuredLabel: "Herramientas Destacadas",
    categories: [
      {
        title: "Suite de Documentos PDF",
        badge: "Motor de Flujo pdf-lib",
        desc: "Una, divida, comprima y proteja con contraseña documentos PDF pesados directamente en su navegador sin subirlos a la red. Ideal para contratos confidenciales y estados financieros.",
        tools: [
          { name: "Unir PDF", href: "/tools/pdf-merger/" },
          { name: "Dividir PDF", href: "/tools/pdf-split/" },
          { name: "Comprimir PDF", href: "/tools/pdf-compress/" },
          { name: "Proteger PDF", href: "/tools/pdf-protect/" },
        ],
      },
      {
        title: "Optimización Visual e Imágenes",
        badge: "Motor HTML5 Canvas y WebP",
        desc: "Comprima archivos PNG, JPG y WebP mediante cuantización perceptiva sin pérdida, convierta formatos por lotes, elimine metadatos EXIF y borre fondos fotográficos con IA local.",
        tools: [
          { name: "Comprimir Imagen", href: "/tools/image-compress/" },
          { name: "Convertir Formato", href: "/tools/image-converter/" },
          { name: "Eliminar Fondo IA", href: "/tools/background-remover/" },
          { name: "Eliminar EXIF", href: "/tools/exif-remover/" },
        ],
      },
      {
        title: "Desarrollo y Criptografía",
        badge: "Web Crypto API en Tiempo Real",
        desc: "Inspeccione y decodifique tokens JWT, analice expresiones Cron con calendarios legibles, calcule hashes criptográficos SHA-256 y ejecute cifrado AES-256 con privacidad absoluta.",
        tools: [
          { name: "Decodificador JWT", href: "/tools/jwt-decoder/" },
          { name: "Analizador Cron", href: "/tools/cron-parser/" },
          { name: "Formateador JSON", href: "/tools/json-formatter/" },
          { name: "Cifrado AES", href: "/tools/aes-encrypt/" },
        ],
      },
      {
        title: "Productividad y Texto",
        badge: "Motor de Texto Instantáneo",
        desc: "Cuente palabras, caracteres y bytes en vivo, compare diferencias entre párrafos con marcado de sintaxis, previsualice Markdown y cambie mayúsculas/minúsculas sin esfuerzo.",
        tools: [
          { name: "Contador de Palabras", href: "/tools/word-count/" },
          { name: "Comparador Diff", href: "/tools/text-diff/" },
          { name: "Vista Markdown", href: "/tools/markdown-preview/" },
          { name: "Cambiar Caja de Texto", href: "/tools/text-case/" },
        ],
      },
    ],
  },

  zh: {
    badge: "分类技术深度指南",
    title: "专为现代高效工作流打造的四大核心工具套件",
    subtitle:
      "利用直观高效的纯前端浏览器工具，轻松化解日常开发与文档编辑中的繁琐任务。所有工具均采用零上传沙箱架构设计，打开即用。",
    featuredLabel: "核心工具快速访问",
    categories: [
      {
        title: "PDF 与文档处理套件",
        badge: "基于 pdf-lib 本地流引擎",
        desc: "在浏览器内存中直接完成大体积PDF文件的合并、拆分、无损压缩、密码加密与解除。绝不上传外部服务器，让保密合同与财务凭据的处理更加安全合规。",
        tools: [
          { name: "合并 PDF", href: "/tools/pdf-merger/" },
          { name: "拆分 PDF", href: "/tools/pdf-split/" },
          { name: "压缩 PDF", href: "/tools/pdf-compress/" },
          { name: "加密保护 PDF", href: "/tools/pdf-protect/" },
        ],
      },
      {
        title: "图像与图形优化引擎",
        badge: "HTML5 Canvas 与 WebP 引擎",
        desc: "支持基于人眼视觉特性的智能无损压缩、WebP/PNG/JPG批量互转、浏览器本地AI抠图（背景透明化）及EXIF隐私元数据清除，全方位提升视觉资源加载性能。",
        tools: [
          { name: "图片压缩", href: "/tools/image-compress/" },
          { name: "格式转换", href: "/tools/image-converter/" },
          { name: "AI 一键抠图", href: "/tools/background-remover/" },
          { name: "清除 EXIF 元数据", href: "/tools/exif-remover/" },
        ],
      },
      {
        title: "开发者与密码学实用工具",
        badge: "Web Crypto API 实时解析",
        desc: "面向生产环境工程师提供JWT令牌实时签名核对与载荷解码、Cron定时调度表达式可视化、SHA-256安全哈希、AES-256对称加密及Base64编解码，调试中无惧凭据外泄。",
        tools: [
          { name: "JWT 解码器", href: "/tools/jwt-decoder/" },
          { name: "Cron 表达式解析", href: "/tools/cron-parser/" },
          { name: "JSON 格式化", href: "/tools/json-formatter/" },
          { name: "AES 加密解密", href: "/tools/aes-encrypt/" },
        ],
      },
      {
        title: "文本与文档生产力编辑器",
        badge: "即时文本计算引擎",
        desc: "提供实时中英文汉字/词数/字节数统计、双文本段落变更直观Diff高亮对照、Markdown实时渲染预览及多重英文大小写规范转换，全方位辅助内容校对与文案撰写。",
        tools: [
          { name: "字数统计", href: "/tools/word-count/" },
          { name: "文本比对 (Diff)", href: "/tools/text-diff/" },
          { name: "Markdown 预览", href: "/tools/markdown-preview/" },
          { name: "大小写格式转换", href: "/tools/text-case/" },
        ],
      },
    ],
  },

  fr: {
    badge: "Guide Technique par Catégorie",
    title: "Quatre Suites Majeures pour Accélérer Vos Projets Numériques",
    subtitle:
      "Simplifiez vos tâches récurrentes de développement et de bureautique grâce à des outils conçus pour une exécution ultra-rapide et respectueuse de vos données.",
    featuredLabel: "Outils Recommandés",
    categories: [
      {
        title: "Suite de Traitement PDF",
        badge: "Moteur de Flux pdf-lib",
        desc: "Fusionnez, découpez, compressez et protégez vos documents PDF volumineux directement dans la mémoire de votre navigateur sans aucun transfert distant. Idéal pour les documents légaux et financiers.",
        tools: [
          { name: "Fusionner PDF", href: "/tools/pdf-merger/" },
          { name: "Diviser PDF", href: "/tools/pdf-split/" },
          { name: "Compresser PDF", href: "/tools/pdf-compress/" },
          { name: "Protéger PDF", href: "/tools/pdf-protect/" },
        ],
      },
      {
        title: "Optimisation d'Images et Graphismes",
        badge: "Moteur HTML5 Canvas & WebP",
        desc: "Compressez vos fichiers PNG, JPG et WebP sans perte visuelle, convertissez des lots d'images, supprimez les métadonnées EXIF et détourez vos photos avec l'intelligence artificielle locale.",
        tools: [
          { name: "Compresser Image", href: "/tools/image-compress/" },
          { name: "Convertir Image", href: "/tools/image-converter/" },
          { name: "Détourage Photo IA", href: "/tools/background-remover/" },
          { name: "Supprimer EXIF", href: "/tools/exif-remover/" },
        ],
      },
      {
        title: "Outils Développeur et Cryptographie",
        badge: "Web Crypto API en Temps Réel",
        desc: "Décodez vos jetons JWT, visualisez les expressions Cron avec planning clair, générez des empreintes SHA-256 et chiffrez en AES-256 dans une confidentialité absolue.",
        tools: [
          { name: "Décodeur JWT", href: "/tools/jwt-decoder/" },
          { name: "Analyseur Cron", href: "/tools/cron-parser/" },
          { name: "Formateur JSON", href: "/tools/json-formatter/" },
          { name: "Chiffrement AES", href: "/tools/aes-encrypt/" },
        ],
      },
      {
        title: "Productivité et Édition de Texte",
        badge: "Moteur de Texte Instantané",
        desc: "Comptez mots, caractères et octets en direct, comparez deux versions de texte avec coloration différentielle (Diff), visualisez du Markdown et convertissez la casse en un clic.",
        tools: [
          { name: "Compteur de Mots", href: "/tools/word-count/" },
          { name: "Comparateur Diff", href: "/tools/text-diff/" },
          { name: "Aperçu Markdown", href: "/tools/markdown-preview/" },
          { name: "Changer la Casse", href: "/tools/text-case/" },
        ],
      },
    ],
  },
};

const CATEGORY_ICONS = [FileText, ImageIcon, Code2, Type];
const CATEGORY_COLORS = ["#ef4444", "#10b981", "#818cf8", "#f59e0b"];
const CATEGORY_BGS = [
  "rgba(239, 68, 68, 0.12)",
  "rgba(16, 185, 129, 0.12)",
  "rgba(99, 102, 241, 0.12)",
  "rgba(245, 158, 11, 0.12)",
];

export default function HomeCategoryOverview() {
  const { locale } = useLocale();
  const c = CONTENT[locale] || CONTENT.en;

  return (
    <section
      style={{
        backgroundColor: "var(--colors-canvas)",
        padding: "64px 24px",
      }}
      aria-labelledby="category-guide-heading"
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
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
              marginBottom: "16px",
            }}
          >
            <Sparkles size={15} />
            <span>{c.badge}</span>
          </div>
          <h2
            id="category-guide-heading"
            style={{
              fontSize: "clamp(24px, 3.5vw, 34px)",
              fontWeight: 800,
              color: "var(--colors-ink-strong)",
              letterSpacing: "-0.5px",
              marginBottom: "14px",
            }}
          >
            {c.title}
          </h2>
          <p
            style={{
              fontSize: "15.5px",
              color: "var(--colors-body)",
              maxWidth: "760px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            {c.subtitle}
          </p>
        </div>

        {/* 4 Category Deep-Dive Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: "24px",
          }}
        >
          {c.categories.map((cat, i) => {
            const Icon = CATEGORY_ICONS[i];
            const color = CATEGORY_COLORS[i];
            const bg = CATEGORY_BGS[i];

            return (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: "30px 26px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: bg,
                        color: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      style={{
                        fontSize: "11.5px",
                        padding: "4px 10px",
                        borderRadius: "100px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--colors-hairline)",
                        color: "var(--colors-body)",
                        fontWeight: 600,
                      }}
                    >
                      {cat.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "19px", fontWeight: 700, color: "var(--colors-ink-strong)", marginBottom: "12px" }}>
                    {cat.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--colors-body)", lineHeight: 1.65, margin: 0 }}>
                    {cat.desc}
                  </p>
                </div>

                {/* Tool Links */}
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--colors-mute)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "10px",
                    }}
                  >
                    {c.featuredLabel}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {cat.tools.map((t, idx) => (
                      <Link
                        key={idx}
                        href={t.href}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "var(--colors-ink)",
                          textDecoration: "none",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid var(--colors-hairline)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--colors-primary)";
                          e.currentTarget.style.color = "var(--colors-primary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--colors-hairline)";
                          e.currentTarget.style.color = "var(--colors-ink)";
                        }}
                      >
                        <span>{t.name}</span>
                        <ArrowRight size={12} />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
