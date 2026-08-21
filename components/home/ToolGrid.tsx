"use client";

import Link from "next/link";
import {
  FilePlus2, Scissors, PackageMinus, FileText,
  ScanLine, RefreshCw, ZoomOut, Eraser,
  Type, CaseSensitive, Code2, GitCompare,
  Braces, Binary, Link as LinkIcon, Search,
  ArrowLeftRight, Palette, Table,
  KeyRound, ShieldCheck,
  ChevronRight, Sparkles, TrendingUp, Hammer,
} from "lucide-react";
import type { Tool, ToolCategory } from "@/lib/tools";
import { groupToolsByCategory } from "@/lib/tools";
import { useLocale } from "@/lib/context/LocaleContext";

type ToolLocale = { title: string; description: string };

const TOOL_TRANSLATIONS: Record<string, Record<string, ToolLocale>> = {
  // PDF
  "pdf-merger":    { en: { title: "PDF Merge", description: "Combine multiple PDF files into a single document instantly." }, ko: { title: "PDF 합치기", description: "여러 PDF 파일을 하나의 문서로 즉시 합칩니다." }, ja: { title: "PDFマージ", description: "複数のPDFを即座に一つに結合します。" }, es: { title: "Combinar PDF", description: "Combina varios archivos PDF en un solo documento al instante." }, zh: { title: "PDF 合并", description: "立即将多个 PDF 文件合并为一个文档。" }, fr: { title: "Fusionner PDF", description: "Combinez plusieurs fichiers PDF en un seul document." } },
  "pdf-split":     { en: { title: "PDF Split", description: "Extract specific pages or split a PDF into separate files." }, ko: { title: "PDF 분할", description: "특정 페이지를 추출하거나 PDF를 여러 파일로 분할합니다." }, ja: { title: "PDF分割", description: "特定ページを抽出またはPDFを分割します。" }, es: { title: "Dividir PDF", description: "Extrae paginas especificas o divide un PDF en archivos separados." }, zh: { title: "PDF 拆分", description: "提取特定页面或将 PDF 拆分为独立文件。" }, fr: { title: "Diviser PDF", description: "Extrayez des pages specifiques ou divisez un PDF en fichiers distincts." } },
  "pdf-compress":  { en: { title: "PDF Compress", description: "Reduce PDF file size while maintaining visual quality." }, ko: { title: "PDF 압축", description: "눈에 띄는 품질 저하 없이 PDF 파일 크기를 줄입니다." }, ja: { title: "PDF圧縮", description: "品質を保ちつつPDFファイルサイズを圧縮します。" }, es: { title: "Comprimir PDF", description: "Reduce el tamano del archivo PDF manteniendo la calidad." }, zh: { title: "PDF 压缩", description: "在保持清晰度的同时降低 PDF 文件大小。" }, fr: { title: "Compresser PDF", description: "Reduisez la taille du fichier PDF tout en conservant la qualite." } },
  "pdf-to-word":   { en: { title: "PDF to Word", description: "Convert PDF documents to editable .docx format." }, ko: { title: "PDF → Word", description: "PDF 문서를 편집 가능한 .docx 형식으로 변환합니다." }, ja: { title: "PDF→Word", description: "PDFを 編集可能な.docx形式に変換します。" }, es: { title: "PDF a Word", description: "Convierte documentos PDF a formato .docx editable." }, zh: { title: "PDF 转 Word", description: "将 PDF 文档转换为可编辑的 .docx 格式。" }, fr: { title: "PDF en Word", description: "Convertissez des documents PDF au format .docx modifiable." } },
  // Image
  "image-resizer":    { en: { title: "Image Resizer", description: "Resize images to any dimension while preserving aspect ratio." }, ko: { title: "이미지 리사이즈", description: "비율을 유지하면서 이미지를 원하는 크기로 조절합니다." }, ja: { title: "画像リサイズ", description: "アスペクト比を保ちながら画像をリサイズします。" }, es: { title: "Redimensionar Imagen", description: "Cambia el tamano manteniendo la relacion de aspecto." }, zh: { title: "图片调整尺寸", description: "在保持宽高比的同时调整图片尺寸。" }, fr: { title: "Redimensionner Image", description: "Redimensionnez les images tout en conservant le ratio." } },
  "image-converter":  { en: { title: "Image Converter", description: "Convert between JPG, PNG, WebP, AVIF, GIF, and more formats." }, ko: { title: "이미지 변환기", description: "JPG, PNG, WebP, AVIF, GIF 등 다양한 형식으로 변환합니다." }, ja: { title: "画像変換", description: "JPG, PNG, WebP, AVIF, GIF間で変換します。" }, es: { title: "Convertidor de Imagen", description: "Convierte entre formatos JPG, PNG, WebP, AVIF y GIF." }, zh: { title: "图片格式转换器", description: "在 JPG, PNG, WebP, AVIF, GIF 等格式间转换。" }, fr: { title: "Convertisseur d'Image", description: "Convertissez entre les formats JPG, PNG, WebP, AVIF et GIF." } },
  "image-compress":   { en: { title: "Image Compress", description: "Shrink image file sizes for faster web loading." }, ko: { title: "이미지 압축", description: "웹 로딩 속도를 높이기 위해 이미지 파일 크기를 줄입니다." }, ja: { title: "画像圧縮", description: "ウェブ読み込みを速めるため画像を圧縮します。" }, es: { title: "Comprimir Imagen", description: "Reduce el tamano de la imagen para una carga web mas rapida." }, zh: { title: "图片压缩", description: "缩小图片文件体积，加快网页加载速度。" }, fr: { title: "Compresser Image", description: "Reduisez la taille des images pour un chargement web plus rapide." } },
  "background-remover": { en: { title: "Background Remover", description: "Automatically remove image backgrounds with AI precision." }, ko: { title: "배경 제거", description: "AI로 이미지 배경을 자동으로 정밀하게 제거합니다." }, ja: { title: "背景除去", description: "AIで画像の背景を自動で精密に除去します。" }, es: { title: "Eliminar Fondo", description: "Elimina fondos de imagen automaticamente con precision IA." }, zh: { title: "抠图去背景", description: "利用 AI 精准自动去除图片背景。" }, fr: { title: "Supprimer l'Arriere-Plan", description: "Supprimez l'arriere-plan des images automatiquement avec precision IA." } },
  // Text
  "word-count":       { en: { title: "Word Count", description: "Count words, characters, sentences, and reading time." }, ko: { title: "단어 수 세기", description: "단어, 글자, 문장 수 및 읽기 시간을 계산합니다." }, ja: { title: "文字数カウント", description: "単語数、文字数、文章数、読了時間を計測します。" }, es: { title: "Contador de Palabras", description: "Cuenta palabras, caracteres, oraciones y tiempo de lectura." }, zh: { title: "字数统计", description: "统计单词数、字符数、句子数及阅读时间。" }, fr: { title: "Compteur de Mots", description: "Comptez les mots, caracteres, phrases et temps de lecture." } },
  "text-case":        { en: { title: "Text Case Converter", description: "Convert text between UPPERCASE, lowercase, Title Case, camelCase, and more." }, ko: { title: "대소문자 / 표기법 변환기", description: "대문자, 소문자, 제목 형식, camelCase 등으로 변환합니다." }, ja: { title: "テキストケース変換", description: "大文字、小文字、タイトルケース、camelCaseに変換します。" }, es: { title: "Convertidor de Mayusculas", description: "Cambia entre MAYUSCULAS, minusculas, camelCase y mas." }, zh: { title: "文本大小写转换", description: "在 大写, 小写, camelCase, snake_case 间转换。" }, fr: { title: "Convertisseur de Casse", description: "Passez entre MAJUSCULES, minuscules, camelCase et plus." } },
  "markdown-preview": { en: { title: "Markdown Live Preview", description: "Write Markdown text and view instant rendered HTML side-by-side." }, ko: { title: "마크다운 실시간 미리보기", description: "마크다운을 작성하고 HTML 미리보기를 실시간으로 확인합니다." }, ja: { title: "マークダウンプレビュー", description: "マークダウンを書いてHTMLプレビューをリアルタイム表示します。" }, es: { title: "Vista Previa Markdown", description: "Escribe Markdown y mira la vista previa HTML en tiempo real." }, zh: { title: "Markdown 实时预览", description: "实时编写 Markdown 并分屏预览 HTML 效果。" }, fr: { title: "Apercu Markdown en Direct", description: "Ecrivez du Markdown et visualisez l'apercu HTML en temps reel." } },
  "text-diff":        { en: { title: "Text Diff Checker", description: "Compare two text blocks and highlight line-by-line differences." }, ko: { title: "텍스트 차이점 비교 (Diff Checker)", description: "두 텍스트 블록을 비교하고 차이점을 강조 표시합니다." }, ja: { title: "テキスト差分", description: "2つのテキストブロックを比較し差分をハイライトします。" }, es: { title: "Comparador de Texto", description: "Compara dos bloques de texto y resalta las diferencias." }, zh: { title: "文本差异对比", description: "对比两段文本并逐行高亮显示差异之处。" }, fr: { title: "Comparateur de Texte", description: "Comparez deux blocs de texte et mettez en surbrillance les differences." } },
  // Dev
  "json-formatter": { en: { title: "JSON Formatter & Validator", description: "Prettify, minify, and validate JSON data with instant syntax highlighting." }, ko: { title: "JSON 정렬 / 검증기", description: "JSON을 보기 좋게 정렬하거나 축소하고 유효성을 검사합니다." }, ja: { title: "JSONフォーマット", description: "JSONを整形、圧縮、検証します。" }, es: { title: "Formateador JSON", description: "Embellece, minifica y valida JSON al instante." }, zh: { title: "JSON 格式化与验证", description: "美化、压缩并校验 JSON 数据结构。" }, fr: { title: "Formateur JSON", description: "Embellissez, minifiez et validez les donnees JSON instantanement." } },
  "base64":         { en: { title: "Base64 Encode / Decode", description: "Convert plain text or binary files to Base64 strings and back." }, ko: { title: "Base64 인코딩/디코딩", description: "문자열이나 파일을 Base64로 인코딩하거나 디코딩합니다." }, ja: { title: "Base64エンコード/デコード", description: "文字列やファイルをBase64で変換します。" }, es: { title: "Base64 Codificar / Decodificar", description: "Convierte texto o archivos a Base64 y viceversa." }, zh: { title: "Base64 编码 / 解码", description: "在文本/文件与 Base64 字符串之间相互转换。" }, fr: { title: "Base64 Encodage / Decodage", description: "Convertissez du texte ou des fichiers en Base64 et inversement." } },
  "url-encoder":    { en: { title: "URL Encode & Decode", description: "Encode or decode special characters and parameters in URLs." }, ko: { title: "URL 인코더 / 디코더", description: "URL 문자열과 쿼리 파라미터를 인코딩하거나 디코딩합니다." }, ja: { title: "URLエンコード/デコード", description: "URL文字列とクエリパラメータを変換します。" }, es: { title: "Codificador URL", description: "Codifica o decodifica caracteres especiales en URL." }, zh: { title: "URL 编码 / 解码", description: "对 URL 中的特殊字符和参数进行编码或解码。" }, fr: { title: "Encodeur URL", description: "Encodez ou decodez les caracteres speciaux dans les URL." } },
  "regex-tester":   { en: { title: "Regex Tester & Debugger", description: "Test regular expressions with real-time match highlighting and capture groups." }, ko: { title: "정규표현식(Regex) 테스터", description: "실시간 매칭 강조로 정규표현식을 테스트하고 디버깅합니다." }, ja: { title: "正規表現テスター", description: "リアルタイムハイライトで正規表現をテストします。" }, es: { title: "Probador de Regex", description: "Prueba expresiones regulares con resalte en tiempo real." }, zh: { title: "正则表达式测试器", description: "实时高亮匹配并调试正则表达式。" }, fr: { title: "Testeur de Regex", description: "Testez les expressions regulieres avec surbrillance en temps reel." } },
  // Converter
  "csv-to-json":     { ko: { title: "CSV → JSON",   description: "CSV 파일을 업로드하고 구조화된 JSON 데이터로 변환합니다." }, ja: { title: "CSV→JSON", description: "CSVファイルを構造化JSONデータに変換します。" } },
  // Security
  "password-generator": { ko: { title: "비밀번호 생성기", description: "안전한 무작위 비밀번호를 암호학적으로 생성합니다." }, ja: { title: "パスワード生成", description: "暗号学的に安全なランダムパスワードを生成します。" } },
  "hash-generator":     { ko: { title: "해시 생성기",     description: "텍스트에서 MD5, SHA-1, SHA-256, SHA-512 해시를 생성합니다." }, ja: { title: "ハッシュ生成", description: "テキストからMD5、SHA-256などのハッシュを生成します。" } },
};

const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  "PDF Tools":         { ko: "PDF 도구",        ja: "PDFツール",      es: "Herramientas PDF",    zh: "PDF工具",      fr: "Outils PDF" },
  "Image Tools":       { ko: "이미지 도구",      ja: "画像ツール",     es: "Herramientas Imagen", zh: "图像工具",     fr: "Outils Image" },
  "Text & Formatting": { ko: "텍스트 & 서식",    ja: "텍스트整形",   es: "Texto & Formato",     zh: "文本&格式",    fr: "Texte & Format" },
  "Dev Tools":         { ko: "개발자 도구",      ja: "開発者ツール",   es: "Herramientas Dev",    zh: "开发工具",     fr: "Outils Dev" },
  "Converter":         { ko: "변환기",           ja: "コンバーター",   es: "Conversor",           zh: "转换器",       fr: "Convertisseur" },
  "Security":          { ko: "보안",             ja: "セキュリティ",   es: "Seguridad",           zh: "安全",         fr: "Sécurité" },
};

const CAT_NAV_TRANSLATIONS: Record<string, Record<string, string>> = {
  "PDF":       { ko: "PDF",    ja: "PDF",    es: "PDF",       zh: "PDF",   fr: "PDF" },
  "Image":     { ko: "이미지", ja: "画像",   es: "Imagen",    zh: "图像",  fr: "Image" },
  "Text":      { ko: "텍스트", ja: "テキスト", es: "Texto",   zh: "文本",  fr: "Texte" },
  "Dev":       { ko: "개발",   ja: "開発",   es: "Dev",       zh: "开发",  fr: "Dev" },
  "Converter": { ko: "변환기", ja: "変換",   es: "Conversor", zh: "转换器", fr: "Conv." },
  "Security":  { ko: "보안",   ja: "セキュリティ", es: "Seguridad", zh: "安全", fr: "Sécu." },
};

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  FilePlus2, Scissors, PackageMinus, FileText,
  ScanLine, RefreshCw, ZoomOut, Eraser,
  Type, CaseSensitive, Code2, GitCompare,
  Braces, Binary, Link: LinkIcon, Search,
  ArrowLeftRight, Palette, Table,
  KeyRound, ShieldCheck,
};

const CATEGORY_META: Record<ToolCategory, { iconClass: string; badgeClass: string; accent: string }> = {
  "PDF Tools":         { iconClass: "icon-pdf",       badgeClass: "badge-pdf",       accent: "#f87171" },
  "Image Tools":       { iconClass: "icon-image",     badgeClass: "badge-image",     accent: "#34d399" },
  "Text & Formatting": { iconClass: "icon-text",      badgeClass: "badge-text",      accent: "#60a5fa" },
  "Dev Tools":         { iconClass: "icon-dev",       badgeClass: "badge-dev",       accent: "#818cf8" },
  "Converter":         { iconClass: "icon-converter", badgeClass: "badge-converter", accent: "#fbbf24" },
  "Security":          { iconClass: "icon-security",  badgeClass: "badge-security",  accent: "#38bdf8" },
};

const BADGE_TRANSLATIONS: Record<string, Record<string, string>> = {
  Popular: { ko: "인기",   ja: "人気",     es: "Popular",  zh: "热门",  fr: "Populaire" },
  New:     { ko: "신규",   ja: "新着",     es: "Nuevo",    zh: "新品",  fr: "Nouveau" },
};

const DEV_LABEL: Record<string, string> = {
  ko: "개발 중",
  ja: "開発中",
  es: "En Dev",
  zh: "开发中",
  fr: "En Dev",
  en: "In Dev",
};

interface ToolGridProps {
  tools: Tool[];
  isSearching: boolean;
  onCategorySearch: (query: string) => void;
}

// ── Single Tool Card ───────────────────────────────────────────
function ToolCard({ tool }: { tool: Tool }) {
  const { locale, t } = useLocale();
  const meta = CATEGORY_META[tool.category];
  const IconComponent = ICON_MAP[tool.icon];

  const localeData = TOOL_TRANSLATIONS[tool.id]?.[locale];
  const title = localeData?.title ?? tool.title;
  const description = localeData?.description ?? tool.description;

  const badgeLabel = tool.isDev
    ? (DEV_LABEL[locale] ?? "In Dev")
    : tool.badge
    ? (BADGE_TRANSLATIONS[tool.badge]?.[locale] ?? tool.badge)
    : null;

  return (
    <div
      className="glass-card tool-card"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        opacity: tool.isDev ? 0.88 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <div className={meta.iconClass} style={{ width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden="true">
          {IconComponent && <IconComponent size={18} strokeWidth={1.8} />}
        </div>

        {badgeLabel && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "100px",
              letterSpacing: "0.04em",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              flexShrink: 0,
              background: tool.isDev ? "rgba(245, 158, 11, 0.15)" : tool.badge === "Popular" ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 102, 241, 0.15)",
              color: tool.isDev ? "#fbbf24" : tool.badge === "Popular" ? "#f87171" : "#818cf8",
              border: tool.isDev ? "1px solid rgba(245, 158, 11, 0.3)" : tool.badge === "Popular" ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(99, 102, 241, 0.25)",
            }}
          >
            {tool.isDev ? <Hammer size={9} /> : tool.badge === "Popular" ? <TrendingUp size={9} /> : <Sparkles size={9} />}
            {badgeLabel}
          </span>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "5px", letterSpacing: "-0.2px" }}>
          {title}
        </h3>
        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
          {description}
        </p>
      </div>

      <div style={{ marginTop: "auto" }}>
        <Link
          href={tool.href}
          id={`tool-${tool.id}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "7px 14px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 600,
            color: tool.isDev ? "#fbbf24" : meta.accent,
            background: tool.isDev ? "rgba(245, 158, 11, 0.08)" : "var(--btn-secondary-bg)",
            border: tool.isDev ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid var(--btn-secondary-border)",
            textDecoration: "none", transition: "all 0.2s", fontFamily: "Inter, sans-serif",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = tool.isDev ? "rgba(245, 158, 11, 0.15)" : "var(--btn-secondary-hover)";
            el.style.borderColor = tool.isDev ? "rgba(245, 158, 11, 0.4)" : `${meta.accent}33`;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = tool.isDev ? "rgba(245, 158, 11, 0.08)" : "var(--btn-secondary-bg)";
            el.style.borderColor = tool.isDev ? "rgba(245, 158, 11, 0.25)" : "var(--btn-secondary-border)";
          }}
          aria-label={`${tool.isDev ? DEV_LABEL[locale] : t("grid.runTool")} — ${title}`}
        >
          {tool.isDev ? (DEV_LABEL[locale] ?? "In Dev") : t("grid.runTool")}
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}

// ── Category Section ───────────────────────────────────────────
function CategorySection({ category, tools }: { category: ToolCategory; tools: Tool[] }) {
  const { locale, t } = useLocale();
  const meta = CATEGORY_META[category];
  const catLabel = CATEGORY_TRANSLATIONS[category]?.[locale] ?? category;

  return (
    <section style={{ marginBottom: "56px" }} aria-labelledby={`cat-${category.replace(/\s/g, "-")}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: `linear-gradient(to bottom, ${meta.accent}, transparent)` }} aria-hidden="true" />
        <h2 id={`cat-${category.replace(/\s/g, "-")}`} style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
          {catLabel}
        </h2>
        <span className={meta.badgeClass} style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "100px" }}>
          {tools.length} {t("grid.tools")}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
        {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
      </div>
    </section>
  );
}

// ── ToolGrid ───────────────────────────────────────────────────
export default function ToolGrid({ tools, isSearching, onCategorySearch }: ToolGridProps) {
  const { locale, t } = useLocale();

  if (tools.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--text-muted)" }}>
          <Search size={24} />
        </div>
        <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
          {t("grid.noResults.title")}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{t("grid.noResults.body")}</p>
      </div>
    );
  }

  const CAT_NAVS = [
    { label: "PDF",       query: "PDF Tools" },
    { label: "Image",     query: "Image" },
    { label: "Text",      query: "Text" },
    { label: "Dev",       query: "Dev" },
    { label: "Converter", query: "Converter" },
    { label: "Security",  query: "Security" },
  ];

  if (isSearching) {
    const count = tools.length;
    return (
      <div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
          {count} {count === 1 ? t("grid.search.result") : t("grid.search.results")}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
          {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </div>
    );
  }

  const groups = groupToolsByCategory(tools);
  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", marginBottom: "4px" }}>
            {t("grid.allTools")}
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>{t("grid.subtitle")}</p>
        </div>

        {/* Category quick nav */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }} className="cat-nav">
          {CAT_NAVS.map((c) => (
            <button
              key={c.label}
              onClick={() => onCategorySearch(c.query)}
              style={{
                padding: "5px 12px", borderRadius: "100px",
                background: "var(--btn-secondary-bg)", border: "1px solid var(--btn-secondary-border)",
                color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500,
                cursor: "pointer", transition: "all 0.15s", fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--btn-secondary-hover)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-active)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--btn-secondary-bg)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--btn-secondary-border)";
              }}
            >
              {CAT_NAV_TRANSLATIONS[c.label]?.[locale] ?? c.label}
            </button>
          ))}
        </div>
      </div>

      {groups.map(({ category, tools: catTools }) => (
        <CategorySection key={category} category={category} tools={catTools} />
      ))}
    </div>
  );
}
