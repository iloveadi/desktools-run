"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { Code2, ArrowLeft, Copy, Check, Download } from "lucide-react";

export default function MarkdownPreviewPage() {
  const { t, locale } = useLocale();
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Live Preview 👋

Write your **Markdown** on the left, and see the *instant rendered preview* on the right.

## Features
- **Bold**, *Italic*, ~~Strikethrough~~
- Code blocks \`const speed = "fast";\`
- Unordered & ordered lists
- Quotes & links [desktools.run](https://desktools.run)

> All Markdown parsing is done 100% locally in your browser memory!
`);
  const [copied, setCopied] = useState(false);

  // Simple clean markdown-to-html parser
  const renderHtml = (md: string) => {
    let html = md
      .replace(/^### (.*$)/gim, '<h3 style="font-size:18px;font-weight:700;margin:12px 0 6px;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size:22px;font-weight:800;margin:16px 0 8px;color:#818cf8;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size:26px;font-weight:800;margin:20px 0 10px;color:var(--text-primary);">$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote style="border-left:4px solid #818cf8;padding-left:12px;color:var(--text-secondary);margin:12px 0;font-style:italic;">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:#818cf8;text-decoration:underline;">$1</a>')
      .replace(/^\- (.*$)/gim, '<li style="margin-left:20px;list-style-type:disc;">$1</li>')
      .replace(/\n\n/g, '<br/><br/>');

    return html;
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(renderHtml(markdown));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <ToolUsageTracker toolId="markdown-preview" />
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "16px" }}>
            <ArrowLeft size={14} /> {t("markdownPreview.backLink") || "Back to All Tools"}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Code2 size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("markdownPreview.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("markdownPreview.subtitle")}</p>
        </section>

        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Editor */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t("markdownPreview.inputTitle") || "Markdown Input"}</span>
                <button onClick={handleDownloadMd} style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Download size={13} /> {t("markdownPreview.saveMd") || "Save .md"}
                </button>
              </div>
              <textarea
                rows={18}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                style={{ width: "100%", height: "480px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "14px", fontSize: "14px", fontFamily: "monospace", lineHeight: "1.6", resize: "none" }}
              />
            </div>

            {/* Preview */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8" }}>{t("markdownPreview.previewTitle") || "Rendered HTML Preview"}</span>
                <button onClick={handleCopyHtml} style={{ padding: "4px 10px", borderRadius: "6px", background: copied ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)", border: "none", color: copied ? "#4ade80" : "#818cf8", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? (t("markdownPreview.copiedHtml") || "HTML Copied") : (t("markdownPreview.copyHtml") || "Copy HTML")}
                </button>
              </div>
              <div
                style={{ width: "100%", height: "480px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "20px", overflowY: "auto", lineHeight: "1.7" }}
                dangerouslySetInnerHTML={{ __html: renderHtml(markdown) }}
              />
            </div>
          </div>
        </section>

        {/* ── 6-Language Tool Guide & SEO Section ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "마크다운 실시간 미리보기 & 웹 에디터 소개",
              aboutDesc:
                "좌측 에디터에서 Markdown 문법으로 글을 작성하면 우측 화면에서 실시간 렌더링된 서식화 HTML 문서를 즉시 확인할 수 있는 분할형 마크다운 프리뷰 도구입니다. 제목(#, ##, ###), 굵게, 기울임, 취소선, 인용구, 인라인 코드, 리스트, 하이퍼링크 등 필수 마크다운 문법을 완벽히 지원하며, 작성된 문서를 .md 파일로 즉시 다운로드하거나 변환된 HTML 코드를 클립보드로 1클릭 복사할 수 있습니다. 100% 브라우저 메모리 안에서 로컬 렌더링되어 소중한 글과 기밀 문서가 외부로 유출되지 않습니다.",
              howTitle: "마크다운 작성 및 HTML 추출 방법",
              steps: [
                "좌측 에디터 패널에 마크다운 텍스트를 직접 입력하거나 기존 .md 파일 내용을 붙여넣습니다.",
                "입력과 동시에 우측 미리보기 화면에서 실시간 렌더링되는 서식과 디자인을 확인합니다.",
                "서식이 마음에 들면 상단 'HTML 복사' 버튼을 눌러 렌더링된 HTML 소스 코드를 복사합니다.",
                "원본 마크다운 문서를 파일로 보관하려면 '.md 저장' 버튼을 클릭하여 다운로드합니다.",
                "블로그, 깃허브 README, 노션, 기술 문서 사이트에 바로 적용하여 사용합니다."
              ],
              featuresTitle: "주요 마크다운 편집 기능",
              features: [
                { title: "2분할 실시간 렌더링 엔진", desc: "타이핑과 동시에 지연 없이 즉각적으로 HTML 서식 결과를 실시간 렌더링합니다." },
                { title: "HTML 소스 원클릭 추출", desc: "파싱된 완성형 HTML 태그 코드를 복사하여 웹사이트나 CMS 에디터에 바로 붙여넣을 수 있습니다." },
                { title: ".md 파일 즉시 내보내기", desc: "작성한 마크다운 문서를 로컬 디바이스에 표준 document.md 파일로 즉시 저장합니다." },
                { title: "100% 브라우저 메모리 보안", desc: "서버 저장이나 데이터 전송 없이 브라우저 내부에서만 파싱되므로 문서 보안이 완벽합니다." }
              ],
              useCasesTitle: "추천 활용 분야",
              useCases: [
                { title: "GitHub README & 개발 기술 문서 작성", desc: "오픈소스 프로젝트 README.md 및 개발 위키 문서를 작성하며 시각적 레이아웃 사전 검증" },
                { title: "기술 블로그 포스팅 (Velog, Tistory, Hexo)", desc: "마크다운 기반 개발 블로그에 글을 올리기 전 가독성과 서식 깨짐 유무 실시간 확인" },
                { title: "노션 & 옵시디언 메모 마크다운 서식 검증", desc: "지식 관리 도구에서 추출한 마크다운 문서의 렌더링 호환성 점검" },
                { title: "마크다운 to HTML 변환기", desc: "이메일 템플릿이나 일반 웹페이지에 삽입할 서식화된 HTML 코드를 마크다운으로 손쉽게 제작" }
              ],
              proTipsTitle: "마크다운 작성 전문가 팁",
              proTips: [
                "인용구(>)를 활용하면 중요한 팁이나 주의사항을 시각적으로 강조하는 콜아웃 박스를 손쉽게 구성할 수 있습니다.",
                "단락과 단락 사이에는 빈 줄(엔터 2번)을 넣어야 웹 표준에서 단락 구분이 깔끔하게 유지됩니다.",
                "변환된 HTML 코드를 복사하여 워드프레스나 티스토리의 HTML 모드에 붙여넣으면 마크다운 서식이 그대로 반영됩니다.",
                "복잡한 문서를 작성할 때는 .md 저장 버튼을 자주 눌러 로컬에 백업을 남겨두는 것을 권장합니다."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "어떤 마크다운 문법들이 지원되나요?", a: "제목(#, ##, ###), 텍스트 스타일(굵게 **, 기울임 *, 취소선 ~~), 인라인 코드(`), 인용구(>), 순서 없는 목록(-), 하이퍼링크([텍스트](링크)) 등 표준 문법을 지원합니다." },
                { q: "작성한 마크다운 내용이 서버에 저장되나요?", a: "아닙니다. 모든 마크다운 파싱과 HTML 렌더링은 100% 사용자의 웹 브라우저 메모리 내부에서 로컬 처리됩니다." },
                { q: "작성한 글을 마크다운 파일(.md)로 다운로드할 수 있나요?", a: "네! 상단 좌측의 '.md 저장' 버튼을 클릭하면 UTF-8 인코딩의 document.md 파일로 즉시 저장됩니다." },
                { q: "렌더링된 HTML 코드를 복사해서 어디에 쓸 수 있나요?", a: "블로그 CMS(워드프레스, 티스토리 등)의 HTML 편집 모드나 이메일 뉴스레터 본문, 웹 퍼블리싱 등에 그대로 복사해 사용하실 수 있습니다." },
                { q: "모바일 스마트폰에서도 작동하나요?", a: "네! 모바일 사파리, 크롬 브라우저에서도 분할 화면으로 마크다운 작성 및 실시간 미리보기가 완벽히 지원됩니다." },
                { q: "이용 요금이나 글자 수 제한이 있나요?", a: "100% 무료이며 이용 횟수나 문서 길이에 어떠한 제한도 없습니다." }
              ],
              relatedTools: [
                { title: "단어 및 글자 수 세기", desc: "공백 포함/제외 글자 수, 단어 수, 문장 수 및 읽기 시간 계산", href: "/tools/word-count/" },
                { title: "대소문자 / 표기법 변환기", desc: "camelCase, snake_case, PascalCase, 대소문자 일괄 변환", href: "/tools/text-case/" },
                { title: "텍스트 차이점 비교 (Diff)", desc: "두 텍스트의 줄 단위 추가/삭제 차이점을 실시간 비교", href: "/tools/text-diff/" },
                { title: "JSON 포맷터 & 검증기", desc: "지저분한 JSON 데이터를 읽기 쉽게 들여쓰기 정렬 및 유효성 검사", href: "/tools/json-formatter/" }
              ]
            },
            en: {
              aboutTitle: "About Markdown Live Preview & Editor",
              aboutDesc:
                "Write Markdown text on the left editor and inspect instant live-rendered HTML formatting side-by-side on the right. Supports headings, bold, italics, strikethrough, blockquotes, inline code, lists, and hyperlinks. Easily export your work to a .md file or copy clean converted HTML tags in one click with 100% client-side privacy.",
              howTitle: "How to Write Markdown & Export HTML",
              steps: [
                "Type or paste your Markdown content into the left editor panel.",
                "Watch the right preview panel render your headings, lists, and styled text in real-time.",
                "Click 'Copy HTML' to grab the formatted HTML source code directly onto your clipboard.",
                "Click 'Save .md' to download your original text as a document.md file.",
                "Integrate your rendered output seamlessly into GitHub READMEs, static blogs, or CMS platforms."
              ],
              featuresTitle: "Key Editor Features",
              features: [
                { title: "Split-Screen Live HTML Rendering", desc: "Zero-latency real-time preview updates as fast as you type." },
                { title: "1-Click HTML Code Copy", desc: "Instantly copy formatted HTML markup ready to paste into web pages, emails, or CMS editors." },
                { title: "Direct .md File Export", desc: "Save your work locally as a standard Markdown (.md) file with a single tap." },
                { title: "100% Client-Side Memory Processing", desc: "Your sensitive notes and documents are never sent over the network." }
              ],
              useCasesTitle: "Popular Use Cases",
              useCases: [
                { title: "GitHub README & Wiki Documentation", desc: "Preview and format open-source repository documentation before committing" },
                { title: "Technical Blogging (Dev.to, Medium, Hexo)", desc: "Draft and polish Markdown blog posts with immediate visual feedback" },
                { title: "Notion & Obsidian Note Verification", desc: "Validate exported Markdown formatting and check cross-platform rendering" },
                { title: "Markdown-to-HTML Conversion", desc: "Quickly convert rich formatted text into clean HTML snippets for emails and web templates" }
              ],
              proTipsTitle: "Markdown Writing Pro Tips",
              proTips: [
                "Use blockquotes (>) to create stylish visual callout notes and highlight important warnings.",
                "Leave a blank line (double Enter) between paragraphs to ensure proper standard paragraph separation.",
                "Paste copied HTML directly into WordPress or static site generators for instant styled layouts.",
                "Download regular .md backups when drafting extensive long-form documentation."
              ],
              faqTitle: "Frequently Asked Questions (FAQ)",
              faqs: [
                { q: "What Markdown syntax is supported?", a: "It supports standard headings (# to ###), bold (**text**), italics (*text*), strikethrough (~~text~~), inline code (`code`), blockquotes (>), bullet lists (-), and hyperlinks." },
                { q: "Is my Markdown document stored on any server?", a: "No! 100% of parsing and HTML rendering runs locally inside your browser memory." },
                { q: "Can I download the written document as a .md file?", a: "Yes! Click 'Save .md' in the top editor bar to download a UTF-8 encoded document.md file." },
                { q: "Where can I paste the copied HTML code?", a: "You can paste the generated HTML directly into web editors, email campaign builders, or WordPress HTML view." },
                { q: "Does this tool work on mobile devices?", a: "Yes, it is fully responsive on mobile Safari and Chrome browsers." },
                { q: "Is it completely free with no limits?", a: "Yes, 100% free with no length limits or account registrations required." }
              ],
              relatedTools: [
                { title: "Word & Character Counter", desc: "Calculate words, characters with/without spaces, and reading times", href: "/tools/word-count/" },
                { title: "Text Case Converter", desc: "Convert text to UPPERCASE, camelCase, snake_case, PascalCase", href: "/tools/text-case/" },
                { title: "Text Diff Checker", desc: "Compare two text snippets side-by-side and highlight differences", href: "/tools/text-diff/" },
                { title: "JSON Formatter & Validator", desc: "Format, beautify, and validate complex JSON data structures", href: "/tools/json-formatter/" }
              ]
            },
            ja: {
              aboutTitle: "Markdownリアルタイムプレビュー＆Webエディタについて",
              aboutDesc:
                "左側でマークダウンを入力すると、右側に整形されたHTMLプレビューが即座に描画される2画面分割エディタです。見出し（#）、太字、斜体、打ち消し線、引用、コード、リスト、リンク記法に対応。書いた文章はワンクリックで.mdファイルとしてダウンロードしたり、HTMLコードをクリップボードにコピーできます。100%ブラウザ内ローカル処理で安全です。",
              howTitle: "マークダウンの作成とHTML変換手順",
              steps: [
                "左側のエディタにマークダウンを直接入力するか、既存の.mdテキストを貼り付けます。",
                "右側のプレビュー画面でリアルタイムに変換されるHTMLデザインを確認します。",
                "「HTMLコピー」ボタンをクリックして、整形済みのHTMLソースコードを取得します。",
                "元のマークダウンを保存する場合は「.md保存」ボタンをクリックしてダウンロードします。",
                "GitHubのREADMEやブログ記事、ドキュメントにそのまま貼り付けて活用します。"
              ],
              featuresTitle: "主なマークダウン編集機能",
              features: [
                { title: "2分割リアルタイムレンダリング", desc: "タイピングと同時に遅延なく美しいHTML装飾をリアルタイムプレビュー。" },
                { title: "HTMLソースのワンクリック抽出", desc: "パース済みのHTMLコードをコピーしてWebページやCMSに即座に配置可能。" },
                { title: ".mdファイルの直接ダウンロード", desc: "作成したドキュメントをUTF-8形式の標準document.mdファイルとして即座に保存。" },
                { title: "100%ブラウザローカル完結", desc: "外部サーバーへテキストを送信せず、ブラウザ内のみで安全にパース処理。" }
              ],
              useCasesTitle: "おすすめの活用シーン",
              useCases: [
                { title: "GitHub README・技術ドキュメントの作成", desc: "オープンソースのリポジトリ説明文やWikiをコミット前に視覚的に確認" },
                { title: "技術ブログ（Qiita、Zenn、はてなブログ）の下書き", desc: "記事投稿前の文字装飾やレイアウト崩れをリアルタイムに事前チェック" },
                { title: "NotionやObsidianのメモ互換性確認", desc: "マークダウンエクスポートされたメモの表示崩れを素早く点検" },
                { title: "MarkdownからHTMLへの変換", desc: "HTMLメルマガやWebサイトに挿入するタグ付きコードをマークダウンから簡単作成" }
              ],
              proTipsTitle: "マークダウン記述のプロのコツ",
              proTips: [
                "引用記法（>）を使うと、重要な注意点や補足をコールアウト風に強調表示できます。",
                "段落を分ける際は必ず空行（Enter 2回）を挟むことで、Web標準に準拠した表示になります。",
                "コピーしたHTMLをWordPressのカスタムHTMLブロックに貼り付ければ、マークダウンの装飾がそのまま反映されます。",
                "長文を書く際は定期的に「.md保存」を押してローカルにバックアップを保存することをおすすめします。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "どのようなマークダウン記法に対応していますか？", a: "見出し（#〜###）、太字（**）、斜体（*）、打ち消し線（~~）、インラインコード（`）、引用（>）、箇条書き（-）、リンク（[テキスト](URL)）に対応しています。" },
                { q: "入力した文章がサーバーに送信されますか？", a: "一切送信されません。すべてのパース処理とHTML描画はお使いのブラウザ内（ローカル）でのみ実行されます。" },
                { q: ".mdファイルとして保存できますか？", a: "はい！上部の「.md保存」ボタンを押すだけで即座にローカルに保存されます。" },
                { q: "コピーしたHTMLコードはどこで使えますか？", a: "WordPressや各種ブログのHTMLモード、メールマガジン、Webサイト制作などでそのままご利用いただけます。" },
                { q: "スマホでも使えますか？", a: "はい！スマートフォンやタブレットのブラウザでもリアルタイムプレビューをご利用いただけます。" },
                { q: "利用料金や文字制限はありますか？", a: "完全無料・登録不要で、文字数の制限もありません。" }
              ],
              relatedTools: [
                { title: "文字数カウント", desc: "文字数（空白込み/除外）、単語数、行数、読了時間をリアルタイム計測", href: "/tools/word-count/" },
                { title: "大文字・小文字/命名規則変換", desc: "camelCase、snake_case、PascalCase、大文字小文字の一括変換", href: "/tools/text-case/" },
                { title: "テキスト差分比較 (Diff)", desc: "2つの文章の修正・追加・削除箇所の違いを行単位で比較", href: "/tools/text-diff/" },
                { title: "JSONフォーマッター＆検証", desc: "JSONデータの整形、インデント調整、構文エラーチェック", href: "/tools/json-formatter/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Visor y Editor de Markdown en Vivo",
              aboutDesc:
                "Escribe en Markdown en el editor de la izquierda y visualiza el documento HTML renderizado en tiempo real a la derecha. Compatible con encabezados (#, ##, ###), negrita, cursiva, tachado, citas, código en línea, listas y enlaces. Exporta tu trabajo como archivo .md o copia el código HTML generado en 1 clic de forma 100% local en tu navegador.",
              howTitle: "Cómo Escribir en Markdown y Exportar HTML",
              steps: [
                "Escribe o pega tu texto en Markdown en el panel de edición izquierdo.",
                "Observa en el panel derecho cómo se renderizan tus encabezados, listas y estilos al instante.",
                "Haz clic en 'Copiar HTML' para transferir el código HTML formateado al portapapeles.",
                "Haz clic en 'Guardar .md' para descargar el archivo document.md original.",
                "Aplica el resultado en tus repositorios de GitHub, blogs estáticos o sistemas CMS."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Renderizado HTML en Vivo a Doble Pantalla", desc: "Previsualización instantánea sin latencia mientras escribes." },
                { title: "Extracción de Código HTML en 1 Clic", desc: "Copia directamente el código generado para pegarlo en páginas web o newsletters." },
                { title: "Exportación Directa a Archivo .md", desc: "Guarda tu documento en tu dispositivo local como archivo Markdown estándar." },
                { title: "100% Local y Confidencial", desc: "Tus notas y documentos nunca se envían a través de la red." }
              ],
              useCasesTitle: "Casos de Uso Populares",
              useCases: [
                { title: "README de GitHub y Documentación Técnica", desc: "Previsualiza archivos de repositorios y wikis antes de hacer commit" },
                { title: "Blogs Técnicos y Artículos Web", desc: "Redacta posts para plataformas Markdown con verificación visual inmediata" },
                { title: "Notas de Notion y Obsidian", desc: "Comprueba la compatibilidad y el formato de tus notas exportadas" },
                { title: "Conversión de Markdown a HTML", desc: "Genera rápidamente código HTML limpio para plantillas de correo y páginas web" }
              ],
              proTipsTitle: "Consejos Profesionales de Markdown",
              proTips: [
                "Usa citas (>) para destacar advertencias o notas importantes en recuadros llamativos.",
                "Deja una línea en blanco (doble Enter) entre párrafos para asegurar una separación limpia en la web.",
                "Pega el HTML copiado en WordPress o gestores de contenido para conservar el diseño exacto.",
                "Descarga copias de seguridad en .md regularmente al redactar textos extensos."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Qué sintaxis de Markdown es compatible?", a: "Soporta encabezados (# a ###), negrita (**texto**), cursiva (*texto*), tachado (~~texto~~), código (`código`), citas (>), listas (-) y enlaces." },
                { q: "¿Se guardan mis documentos en algún servidor?", a: "No. El análisis y renderizado se ejecutan 100% en la memoria de tu navegador." },
                { q: "¿Puedo descargar el archivo como .md?", a: "Sí, haz clic en 'Guardar .md' para descargar tu archivo document.md en UTF-8." },
                { q: "¿Dónde puedo usar el HTML copiado?", a: "Puedes pegarlo directamente en editores web, campañas de correo electrónico o en el editor HTML de WordPress." },
                { q: "¿Funciona en móviles?", a: "Sí, es completamente compatible con navegadores móviles en iOS y Android." },
                { q: "¿Tiene algún coste o límite?", a: "Es 100% gratuito e ilimitado, sin necesidad de registro." }
              ],
              relatedTools: [
                { title: "Contador de Palabras y Caracteres", desc: "Mide palabras, caracteres y tiempo de lectura estimado en tiempo real", href: "/tools/word-count/" },
                { title: "Conversor de Mayúsculas / Minúsculas", desc: "Convierte a camelCase, snake_case, PascalCase y Title Case", href: "/tools/text-case/" },
                { title: "Comparador de Textos (Diff)", desc: "Compara dos textos línea por línea y resalta las diferencias", href: "/tools/text-diff/" },
                { title: "Formateador JSON", desc: "Formatea, embellece y valida estructuras de datos JSON", href: "/tools/json-formatter/" }
              ]
            },
            zh: {
              aboutTitle: "关于 Markdown 实时预览与 Web 编辑器",
              aboutDesc:
                "左侧输入 Markdown 源码，右侧即刻同步渲染出精美的 HTML 格式化预览。完美支持标题（#、##、###）、加粗、斜体、删除线、引用块、行内代码、无序列表及超链接。支持一键导出 .md 文件或一键复制转换后的 HTML 代码。100% 在本地浏览器内存中即时渲染，保障私密文章零泄露。",
              howTitle: "Markdown 编写与 HTML 提取指南",
              steps: [
                "在左侧编辑面板中直接输入 Markdown 文本或粘贴现有 .md 文档内容。",
                "在右侧预览面板中实时观察标题、排版及样式的实时渲染效果。",
                "排版满意后，点击“复制 HTML”按钮即可提取标准的 HTML 源码。",
                "若需保存原文，点击“保存 .md”按钮即可一键下载 Markdown 文件。",
                "将生成的代码与文本轻松应用至 GitHub README、技术博客或 Notion 中。"
              ],
              featuresTitle: "核心编辑与渲染功能",
              features: [
                { title: "双栏分屏零延迟实时渲染", desc: "随着键盘输入同步即时更新右侧 HTML 视图，排版直观流畅。" },
                { title: "HTML 源代码一键提取", desc: "一键复制标准 HTML 标签，方便直接嵌入网站后台、邮件模板或 CMS 编辑器。" },
                { title: "一键本地导出 .md 文件", desc: "将编辑好的内容直接保存为 UTF-8 编码的标准 document.md 文件。" },
                { title: "100% 浏览器本地计算", desc: "无需上传至云端服务器，完全在本地内存解析，私密笔记安全无忧。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "GitHub README 与开源技术文档撰写", desc: "在代码提交前实时核验 README.md 与 Wiki 文档的视觉排版效果" },
                { title: "技术博客排版（知乎、CSDN、掘金、Hexo）", desc: "在发布前实时排查格式错位、标题层级与代码高亮显示" },
                { title: "Notion 与 Obsidian 笔记格式校验", desc: "检验从知识库导出的 Markdown 语法兼容性与渲染效果" },
                { title: "Markdown 转 HTML 格式化器", desc: "轻松利用 Markdown 快速生成包含精美排版的邮件正文与网页片段" }
              ],
              proTipsTitle: "Markdown 写作专业建议",
              proTips: [
                "善用引用块（>）可以制作出醒目的提示框和重要警告说明。",
                "段落与段落之间请务必保留一个空行（按两次回车），符合标准 Web 换行规范。",
                "将复制的 HTML 代码直接粘贴至富文本编辑器的 HTML 源码模式下即可完美还原样式。",
                "编写长篇文档时建议经常点击“保存 .md”以便在本地保留实时备份。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "支持哪些主流 Markdown 语法？", a: "支持标题（# 到 ###）、加粗（**文字**）、斜体（*文字*）、删除线（~~文字~~）、行内代码（`代码`）、引用块（>）、列表（-）以及超链接（[名称](链接)）。" },
                { q: "我输入的文章内容会被上传到服务器吗？", a: "绝对不会！所有 Markdown 解析与 HTML 渲染逻辑 100% 在您的本地浏览器中完成。" },
                { q: "可以直接下载保存为 .md 文件吗？", a: "可以！点击左上方的“保存 .md”按钮即可瞬间将内容下载至电脑本地。" },
                { q: "复制出来的 HTML 代码可以用在哪里？", a: "可直接粘贴至各类博客 CMS 的 HTML 源码模式、邮件群发模板或静态网页代码中。" },
                { q: "手机端浏览器支持吗？", a: "支持！完全适配移动端浏览器，支持分屏编写与双向预览。" },
                { q: "完全免费吗？有字数限制吗？", a: "100% 永久免费，无任何字数上限，无需注册账号。" }
              ],
              relatedTools: [
                { title: "字数与字符统计工具", desc: "实时统计字符数（含/不含空格）、词数及预计阅读时间", href: "/tools/word-count/" },
                { title: "英文大小写/命名规范转换", desc: "camelCase、snake_case、PascalCase、大小写一键互转", href: "/tools/text-case/" },
                { title: "文本差异比对 (Diff)", desc: "逐行比对两段文本的修改、新增与删除差异", href: "/tools/text-diff/" },
                { title: "JSON 格式化与校验工具", desc: "格式化、美化及校验复杂 JSON 数据结构", href: "/tools/json-formatter/" }
              ]
            },
            fr: {
              aboutTitle: "À propos de l'Aperçu Markdown en Direct & Éditeur Web",
              aboutDesc:
                "Rédigez en Markdown dans l'éditeur de gauche et visualisez instantanément le document HTML mis en forme à droite. Prend en charge les titres (#, ##, ###), le gras, l'italique, le barré, les citations, le code en ligne, les listes et les hyperliens. Exportez votre texte en fichier .md ou copiez le code HTML généré en 1 clic en toute confidentialité.",
              howTitle: "Comment Rédiger en Markdown et Exporter le HTML",
              steps: [
                "Saisissez ou collez votre texte Markdown dans le volet d'édition gauche.",
                "Observez en direct sur le panneau droit le rendu de vos titres et mises en forme.",
                "Cliquez sur 'Copier HTML' pour récupérer le code source formaté dans votre presse-papiers.",
                "Cliquez sur 'Enregistrer .md' pour télécharger votre fichier document.md original.",
                "Intégrez vos textes dans vos README GitHub, blogs ou systèmes CMS."
              ],
              featuresTitle: "Fonctionnalités Principales",
              features: [
                { title: "Rendu HTML Instantané à Double Écran", desc: "Aperçu en temps réel sans aucun délai au fil de votre frappe." },
                { title: "Extraction du Code HTML en 1 Clic", desc: "Copiez le balisage HTML généré pour l'insérer dans vos pages ou newsletters." },
                { title: "Export Direct en Fichier .md", desc: "Enregistrez vos documents localement au format Markdown standard." },
                { title: "100% Local et Sécurisé", desc: "Vos écrits et notes confidentielles ne quittent jamais votre navigateur." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "README GitHub et Documentation Technique", desc: "Prévisualisez vos descriptions de dépôts avant de valider vos commits" },
                { title: "Articles de Blog et Rédaction Web", desc: "Rédigez pour des plateformes Markdown avec contrôle visuel immédiat" },
                { title: "Vérification de Notes Notion et Obsidian", desc: "Validez la compatibilité des notes exportées en Markdown" },
                { title: "Convertisseur Markdown vers HTML", desc: "Générez rapidement du code HTML propre pour vos emails et gabarits web" }
              ],
              proTipsTitle: "Conseils Professionnels de Rédaction Markdown",
              proTips: [
                "Utilisez les citations (>) pour créer des encadrés d'avertissement percutants.",
                "Laissez une ligne vide (double Entrée) entre les paragraphes pour garantir une séparation nette.",
                "Collez le code HTML dans WordPress pour conserver exactement la mise en page voulue.",
                "Téléchargez des sauvegardes .md régulières lors de la rédaction de longs documents."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Quelles syntaxes Markdown sont prises en charge ?", a: "Prend en charge les titres (# à ###), le gras (**texte**), l'italique (*texte*), le barré (~~texte~~), le code (`code`), les citations (>), les listes (-) et les liens." },
                { q: "Mes écrits sont-ils enregistrés sur un serveur ?", a: "Non ! Toute l'analyse et le rendu HTML s'exécutent 100% localement dans votre navigateur." },
                { q: "Puis-je télécharger le fichier en .md ?", a: "Oui, cliquez sur 'Enregistrer .md' pour télécharger votre fichier document.md encodé en UTF-8." },
                { q: "Où puis-je utiliser le HTML copié ?", a: "Vous pouvez le coller dans vos éditeurs de blogs CMS, outils d'emailing ou pages web." },
                { q: "L'outil fonctionne-t-il sur mobile ?", a: "Oui, parfaitement compatible avec les navigateurs mobiles sur iOS et Android." },
                { q: "Le service est-il gratuit ?", a: "100% gratuit, sans limite de longueur et sans inscription requise." }
              ],
              relatedTools: [
                { title: "Compteur de Mots et Caractères", desc: "Mesurez mots, caractères et temps de lecture en direct", href: "/tools/word-count/" },
                { title: "Convertisseur de Casse (Text Case)", desc: "Convertissez en camelCase, snake_case, PascalCase ou majuscules", href: "/tools/text-case/" },
                { title: "Comparateur de Textes (Diff)", desc: "Comparez deux textes ligne par ligne pour repérer les modifications", href: "/tools/text-diff/" },
                { title: "Formateur & Validateur JSON", desc: "Formatez, embellissez et validez vos structures de données JSON", href: "/tools/json-formatter/" }
              ]
            }
          };

          const active = content[locale as keyof typeof content] || content.en;

          return (
            <ToolGuide
              badgeText="100% Free & Browser-Native"
              aboutTitle={active.aboutTitle}
              aboutDesc={active.aboutDesc}
              howTitle={active.howTitle}
              steps={active.steps}
              featuresTitle={active.featuresTitle}
              features={active.features}
              useCasesTitle={active.useCasesTitle}
              useCases={active.useCases}
              proTips={{
                title: active.proTipsTitle,
                tips: active.proTips,
              }}
              faqs={active.faqs}
              relatedTools={active.relatedTools}
            />
          );
        })()}
      </main>
      <Footer />
    </>
  );
}
