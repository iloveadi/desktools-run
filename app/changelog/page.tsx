"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { History, CheckCircle2, Sparkles } from "lucide-react";

interface ReleaseItem {
  version: string;
  date: string;
  title: Record<string, string>;
  changes: Record<string, string[]>;
}

export default function ChangelogPage() {
  const { t, locale } = useLocale();

  const releases: ReleaseItem[] = [
    {
      version: "v1.3.0",
      date: "August 24, 2026",
      title: {
        ko: "신규 개발자 도구 3종 출시 & 6개 국어 다국어(i18n) 시스템 완성",
        en: "3 New Dev Tools Released & Complete 6-Language i18n System",
        ja: "新規開発者ツール3種追加＆6言語対応マルチリンガルシステム完成",
        es: "3 Nuevas herramientas dev y soporte multilingüe en 6 idiomas",
        zh: "新增 3 款开发者工具与 6 种语言多语言支持",
        fr: "3 Nouveaux outils dev et support multilingue en 6 langues",
      },
      changes: {
        ko: [
          "JWT 디코더 & 토큰 분석기 (/tools/jwt-decoder) 출시: Header & Payload 실시간 클라이언트 디코딩 및 만료 시간 검증.",
          "고해상도 QR 코드 생성기 (/tools/qr-generator) 출시: URL, 텍스트, Wi-Fi 정보 기반 PNG/SVG 다운로드 지원.",
          "Cron 표현식 파서 & 생성기 (/tools/cron-parser) 출시: 5자리 Cron 표현식 자연어 번역 및 다음 실행 시각 계산.",
          "한국어, 영어, 일본어, 스페인어, 중국어, 프랑스어 6개 국어 전체 페이지 실시간 다국어 지원 연동.",
        ],
        en: [
          "Released JWT Decoder & Inspector (/tools/jwt-decoder): 100% client-side Header & Payload decoding.",
          "Released QR Code Generator (/tools/qr-generator): Create custom high-res QR codes with PNG/SVG export.",
          "Released Cron Expression Parser (/tools/cron-parser): Human-readable cron translation & schedule calculation.",
          "Integrated full 6-language i18n support across all tool catalog pages, blog, and footer.",
        ],
        ja: [
          "JWT デコーダー＆解析 (/tools/jwt-decoder) リリース: クライアント側で即座にトークンを解析。",
          "高解像度 QR コード作成 (/tools/qr-generator) リリース: URL、テキスト、Wi-Fi情報からPNG/SVG保存。",
          "Cron 表現式解析 (/tools/cron-parser) リリース: 5桁のCronを自然言語に翻訳し次回実行日時を計算。",
          "日本語、英語、韓国語、スペイン語、中国語、フランス語の6言語リアルタイム切り替え対応。",
        ],
        es: [
          "Lanzamiento de JWT Decoder (/tools/jwt-decoder): Decodificación de tokens 100% en el cliente.",
          "Lanzamiento de QR Code Generator (/tools/qr-generator): Generación de códigos QR con exportación PNG/SVG.",
          "Lanzamiento de Cron Expression Parser (/tools/cron-parser): Traducción de expresiones cron a lenguaje natural.",
          "Soporte multilingüe en tiempo real para 6 idiomas en todo el sitio web.",
        ],
        zh: [
          "发布 JWT 解码与解析工具 (/tools/jwt-decoder): 100% 浏览器本地解析 Header 与 Payload 载荷。",
          "发布 高清 QR 二维码生成器 (/tools/qr-generator): 支持生成网址、文本与 Wi-Fi 二维码，支持 PNG/SVG 下载。",
          "发布 Cron 表达式解析器 (/tools/cron-parser): 将 Cron 定时表达式转换为自然语言并计算执行时刻。",
          "全站集成中文、英文、韩文、日文、西班牙文、法文 6 种语言实时切换支持。",
        ],
        fr: [
          "Lancement de Décodeur JWT (/tools/jwt-decoder): Décodage 100% local des jetons JWT.",
          "Lancement de Générateur de Code QR (/tools/qr-generator): Exportation PNG/SVG pour URL, texte et Wi-Fi.",
          "Lancement de Analyseur Cron (/tools/cron-parser): Traduction des expressions cron en langage clair.",
          "Support multilingue en direct dans 6 langues sur l'ensemble de la plateforme.",
        ],
      },
    },
    {
      version: "v1.2.0",
      date: "August 21, 2026",
      title: {
        ko: "PDF 분할기 출시 & Web AI 배경 제거 (누끼 따기) 엔진 업그레이드",
        en: "PDF Splitter Released & Web AI Background Remover Neural Engine Upgrade",
        ja: "PDF 分割ツール追加＆Web AI背景除去エンジンアップグレード",
        es: "Lanzamiento de PDF Splitter y actualización del motor Web AI",
        zh: "PDF 拆分器上线与 Web AI 抠图神经网络引擎升级",
        fr: "Lancement de PDF Splitter et mise à jour du moteur Web AI",
      },
      changes: {
        ko: [
          "PDF 분할기 출시: 원하는 페이지 범위 추출 및 시각적 썸네일 클릭 분할 기능 지원.",
          "Web AI 배경 제거 엔진 업그레이드: 브라우저 온디바이스 ONNX 신경망 기반 투명 배경 누끼 따기.",
          "다크 및 글래스모피즘 프리미엄 UI 반응형 레이아웃 도입.",
        ],
        en: [
          "Added PDF Splitter tool for extracting custom page ranges & visual thumbnail selection.",
          "Upgraded Background Remover with Web AI ONNX Neural Network and client-side processing.",
          "Implemented high-contrast dark theme and glassmorphic UI layout.",
        ],
        ja: [
          "PDF分割ツールを追加: カスタムページ範囲抽出およびサムネイル選択機能。",
          "Web AI背景除去エンジンを強化: ブラウザ内ONNXモデルによるリアルタイム透過処理。",
        ],
        es: [
          "Herramienta PDF Splitter añadida para extraer páginas específicas.",
          "Motor de IA Web mejorado para la eliminación de fondos sin servidor.",
        ],
        zh: [
          "新增 PDF 拆分工具: 支持自定义页码范围提取与可视缩略图点击选择。",
          "升级 Web AI 抠图引擎: 基于浏览器端 ONNX 神经网络实现一键背景透明化。",
        ],
        fr: [
          "Ajout de l'outil PDF Splitter pour l'extraction de pages personnalisées.",
          "Mise à niveau du moteur Web AI pour la suppression d'arrière-plan.",
        ],
      },
    },
    {
      version: "v1.1.0",
      date: "August 15, 2026",
      title: {
        ko: "PDF 병합, PDF 압축 & 이미지 리사이즈 도구 출시",
        en: "PDF Merger, PDF Compress & Image Resizer Released",
        ja: "PDF 結合、PDF 圧縮＆画像リサイズツールリリース",
        es: "Lanzamiento de PDF Merger, PDF Compress y Image Resizer",
        zh: "PDF 合并、PDF 压缩与图像尺寸调整工具上线",
        fr: "Lancement de PDF Merger, PDF Compress et Image Resizer",
      },
      changes: {
        ko: [
          "100% 브라우저 메모리 기반 무서버 PDF 병합 및 압축 유틸리티 출시.",
          "이미지 리사이즈 및 포맷 변환기(JPG, PNG, WebP) 도입.",
          "글로벌 폰트 및 모바일 터치 가속 인터페이스 적용.",
        ],
        en: [
          "Released 100% Client-Side PDF Merger & PDF Compression utilities.",
          "Added Image Resizer and Format Converter supporting PNG, JPG, and WEBP.",
          "Optimized high-speed Canvas rendering pipeline.",
        ],
        ja: [
          "100%ブラウザメモリベースのPDF結合および圧縮ツールをリリース。",
          "PNG、JPG、WEBPをサポートする画像リサイズおよびフォーマット変換機能を追加。",
        ],
        es: [
          "Utilidades de combinación y compresión de PDF 100% en el cliente.",
          "Conversor y redimensionador de imágenes JPG, PNG y WebP.",
        ],
        zh: [
          "发布 100% 浏览器内存无服务器 PDF 合并与 PDF 无损压缩工具。",
          "新增支持 PNG、JPG、WebP 格式的图像尺寸调整与格式转换器。",
        ],
        fr: [
          "Utilitaires de fusion et de compression PDF 100% côté client.",
          "Redimensionneur et convertisseur d'images PNG, JPG et WebP.",
        ],
      },
    },
    {
      version: "v1.0.0",
      date: "August 01, 2026",
      title: {
        ko: "desktools.run 정식 런칭 (Zero-Server Upload)",
        en: "Initial Official Launch of desktools.run",
        ja: "desktools.run 正式リリース (Zero-Server Upload)",
        es: "Lanzamiento oficial de desktools.run",
        zh: "desktools.run 正式上线 (零服务器上传)",
        fr: "Lancement officiel de desktools.run",
      },
      changes: {
        ko: [
          "비밀번호 생성기, 해시 생성기, 색상 변환기, 글자 수 세기 등 핵심 도구 정식 출시.",
          "서버 업로드 없는 100% 브라우저 로컬 개인정보 보호 아키텍처 구축.",
        ],
        en: [
          "Launched core platform with Password Generator, Hash Generator, Color Converter, and Text utilities.",
          "100% Zero-Server upload privacy architecture.",
        ],
        ja: [
          "パスワード生成、ハッシュ生成、カラー変換、文字数カウントなどの核心ツールをリリース。",
          "サーバー送信なしの100%ローカルプライバシーアーキテクチャを構築。",
        ],
        es: [
          "Lanzamiento de la plataforma con generador de contraseñas, hashes y utilidades de texto.",
          "Arquitectura de privacidad 100% sin subidas al servidor.",
        ],
        zh: [
          "正式上线密码生成器、哈希值计算、颜色转换、字数统计等核心实用工具。",
          "建立 100% 无服务器上传的浏览器端本地隐私保护架构。",
        ],
        fr: [
          "Lancement de la plateforme avec générateur de mots de passe, hachages et outils de texte.",
          "Architecture de confidentialité 100% sans envoi sur serveur.",
        ],
      },
    },
  ];

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "840px", margin: "0 auto", padding: "40px 24px 20px" }}>
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
              <History size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("pages.changelog.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {t("pages.changelog.subtitle")}
          </p>
        </section>

        <section style={{ maxWidth: "840px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {releases.map((rel) => {
              const releaseTitle = rel.title[locale] || rel.title.en;
              const releaseChanges = rel.changes[locale] || rel.changes.en;

              return (
                <div
                  key={rel.version}
                  className="glass-card"
                  style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "100px",
                          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                          color: "white",
                          fontSize: "13px",
                          fontWeight: 800,
                        }}
                      >
                        {rel.version}
                      </span>
                      <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {releaseTitle}
                      </h3>
                    </div>
                    <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{rel.date}</span>
                  </div>

                  <ul
                    style={{
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      paddingLeft: "4px",
                    }}
                  >
                    {releaseChanges.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          fontSize: "13.5px",
                          color: "var(--text-secondary)",
                          lineHeight: "1.6",
                        }}
                      >
                        <CheckCircle2 size={15} style={{ color: "#818cf8", flexShrink: 0, marginTop: "3px" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
