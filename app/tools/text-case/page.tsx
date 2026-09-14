"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import { CaseSensitive, Copy, Check, ArrowLeft, RotateCcw } from "lucide-react";

export default function TextCasePage() {
  const { t, locale } = useLocale();
  const [text, setText] = useState("Hello world! Welcome to desktools.run web utilities.");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const convertCases = (input: string) => {
    const words = input.trim().split(/[\s_\-]+/).filter(Boolean);

    return {
      upper: input.toUpperCase(),
      lower: input.toLowerCase(),
      title: input.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()),
      camel: words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(""),
      pascal: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(""),
      snake: words.map((w) => w.toLowerCase()).join("_"),
      kebab: words.map((w) => w.toLowerCase()).join("-"),
      constant: words.map((w) => w.toUpperCase()).join("_"),
    };
  };

  const results = convertCases(text);

  const copyToClipboard = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "16px" }}>
            <ArrowLeft size={14} /> {t("textCase.back")}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CaseSensitive size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("textCase.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("textCase.subtitle")}</p>
        </section>

        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t("textCase.inputLabel")}</label>
              <button onClick={() => setText("")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "12.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                <RotateCcw size={13} /> {t("textCase.clear")}
              </button>
            </div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("textCase.placeholder")}
              style={{ width: "100%", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "12px", fontSize: "14px", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {[
              { label: t("textCase.style.upper"), value: results.upper, key: "upper" },
              { label: t("textCase.style.lower"), value: results.lower, key: "lower" },
              { label: t("textCase.style.title"), value: results.title, key: "title" },
              { label: t("textCase.style.camel"), value: results.camel, key: "camel" },
              { label: t("textCase.style.pascal"), value: results.pascal, key: "pascal" },
              { label: t("textCase.style.snake"), value: results.snake, key: "snake" },
              { label: t("textCase.style.kebab"), value: results.kebab, key: "kebab" },
              { label: t("textCase.style.constant"), value: results.constant, key: "constant" },
            ].map((item) => (
              <div key={item.key} className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#818cf8" }}>{item.label}</span>
                  <button
                    onClick={() => copyToClipboard(item.value, item.key)}
                    style={{ padding: "4px 8px", borderRadius: "6px", background: copiedKey === item.key ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)", border: "none", color: copiedKey === item.key ? "#4ade80" : "var(--text-secondary)", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    {copiedKey === item.key ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === item.key ? t("textCase.copied") : t("textCase.copy")}
                  </button>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", wordBreak: "break-all", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "6px", minHeight: "42px" }}>
                  {item.value || <span style={{ color: "var(--text-muted)" }}>{t("textCase.empty")}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6-Language Tool Guide & SEO Section ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "대소문자 & 프로그래밍 명명 표기법 일괄 변환기 소개",
              aboutDesc:
                "영어 문장이나 단어를 입력하면 대문자(UPPERCASE), 소문자(lowercase), 단어 첫 글자 대문자(Title Case), 자바스크립트 변수용 camelCase, 클래스/컴포넌트용 PascalCase, 파이썬/데이터베이스용 snake_case, CSS/URL용 kebab-case, 상수용 CONSTANT_CASE 등 총 8가지 주요 표기법으로 1초 만에 동시 변환해 주는 실시간 텍스트 변환 도구입니다. 모든 변환은 100% 브라우저 메모리 안에서 로컬 처리됩니다.",
              howTitle: "텍스트 표기법 변환 및 원클릭 복사 방법",
              steps: [
                "입력창에 변환하고자 하는 영문 텍스트나 문장, 변수명을 입력하거나 붙여넣습니다.",
                "입력 즉시 하단에 8가지 표기법 스타일로 실시간 변환된 결과 카드를 확인합니다.",
                "원하는 표기법 카드의 우측 '복사' 버튼을 클릭합니다.",
                "변환된 텍스트가 클립보드에 복사되며, 소스 코드나 문서에 바로 붙여넣어 사용합니다.",
                "새로운 텍스트를 입력하려면 '입력 초기화' 버튼을 눌러 에디터를 비웁니다."
              ],
              featuresTitle: "주요 핵심 변환 기능",
              features: [
                { title: "8종 표준 표기법 실시간 동시 렌더링", desc: "단 한 번의 입력으로 대문자, 소문자, Title Case부터 개발자 필수 네이밍 규칙(camel, snake, kebab, pascal, constant)까지 실시간 동시 생성합니다." },
                { title: "스마트 단어 분리 및 구분자 정규화", desc: "공백, 언더스코어(_), 하이픈(-) 등 다양한 기존 구분자를 지능적으로 감지하여 깔끔한 새 표기법으로 재구성합니다." },
                { title: "개별 카드 원클릭 클립보드 복사", desc: "각 변환 결과마다 독립적인 복사 버튼을 제공하여 필요한 스타일만 빠르게 가져갈 수 있습니다." },
                { title: "100% 브라우저 로컬 안전 처리", desc: "서버 통신 없이 순수 자바스크립트 엔진으로 즉각 연산되어 속도가 빠르고 텍스트 보안이 철저합니다." }
              ],
              useCasesTitle: "추천 활용 분야",
              useCases: [
                { title: "개발자 변수 & 함수 & DB 컬럼 명명", desc: "JS/TS camelCase, Python/SQL snake_case, React 컴포넌트 PascalCase 변환" },
                { title: "REST API & URL 슬러그 & CSS 클래스명", desc: "URL 경로 및 CSS 클래스에 적합한 소문자 하이픈(kebab-case) 생성" },
                { title: "영문 기사 및 리포트 헤드라인 교정", desc: "영문 제목 작성 시 각 단어의 첫 글자를 대문자로 정렬하는 Title Case 적용" },
                { title: "환경 변수 & 글로벌 상수 정의", desc: ".env 파일 및 프로그래밍 전역 상수를 위한 대문자 언더스코어(CONSTANT_CASE) 변환" }
              ],
              proTipsTitle: "표기법 변환 전문가 팁",
              proTips: [
                "자바스크립트와 타입스크립트 변수 및 함수명은 소문자로 시작하는 camelCase를 사용하는 것이 공식 표준입니다.",
                "React, Vue 컴포넌트나 TypeScript 인터페이스, 클래스명은 대문자로 시작하는 PascalCase를 사용하세요.",
                "RESTful API 엔드포인트와 CSS 클래스명은 단어 구분에 kebab-case(하이픈)를 사용하는 것이 SEO와 웹 표준에 가장 유리합니다.",
                "여러 단어가 섞인 복잡한 문자열도 공백이나 특수기호 상관없이 자동으로 단어 단위를 인식하여 변환합니다."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "camelCase와 PascalCase의 차이는 무엇인가요?", a: "camelCase는 첫 단어가 소문자로 시작하고 이후 단어 첫 글자만 대문자(예: myVariableName)인 반면, PascalCase는 첫 단어부터 대문자로 시작(예: MyComponentName)합니다." },
                { q: "kebab-case와 snake_case는 주로 어디에 쓰이나요?", a: "kebab-case(예: blog-post-title)는 웹 URL 슬러그와 CSS 클래스명에 주로 쓰이며, snake_case(예: user_account_id)는 Python 변수명과 데이터베이스 SQL 테이블/컬럼명에 널리 쓰입니다." },
                { q: "입력한 텍스트가 서버로 전송되나요?", a: "전혀 전송되지 않습니다. 모든 텍스트 변환은 100% 브라우저 메모리 내에서 즉시 처리됩니다." },
                { q: "한글이나 특수문자가 섞여 있어도 동작하나요?", a: "영문 알파벳을 기준으로 대소문자 및 단어 결합이 처리되며, 한글이나 특수기호는 단어 구분자로 처리되거나 안전하게 유지됩니다." },
                { q: "CONSTANT_CASE는 언제 사용하나요?", a: "프로그래밍에서 값이 변경되지 않는 상수(예: MAX_RETRY_COUNT, API_SECRET_KEY)나 .env 환경변수를 정의할 때 표준으로 사용됩니다." },
                { q: "이용 요금이나 변환 글자 수 제한이 있나요?", a: "100% 무료이며 이용 횟수나 글자 수에 어떠한 제한도 없습니다." }
              ],
              relatedTools: [
                { title: "단어 및 글자 수 세기", desc: "공백 포함/제외 글자 수, 단어 수, 문장 수 및 읽기 시간 계산", href: "/tools/word-count/" },
                { title: "마크다운 실시간 미리보기", desc: "마크다운 문서를 작성하고 실시간 HTML 렌더링 결과 확인", href: "/tools/markdown-preview/" },
                { title: "텍스트 차이점 비교 (Diff)", desc: "두 텍스트의 줄 단위 추가/삭제 차이점을 실시간 비교", href: "/tools/text-diff/" },
                { title: "URL 인코더 / 디코더", desc: "특수문자 및 한글 URL을 안전한 웹 표준으로 상호 변환", href: "/tools/url-encoder/" }
              ]
            },
            en: {
              aboutTitle: "About Text Case & Naming Convention Converter",
              aboutDesc:
                "Convert English text and phrases simultaneously into 8 standard casing formats: UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE. Essential for frontend developers, backend engineers, and technical copywriters.",
              howTitle: "How to Convert & Copy Text Cases",
              steps: [
                "Type or paste your text or variable name into the input text box.",
                "Instantly inspect the 8 live-generated cards below displaying your converted text in each standard case.",
                "Click the 'Copy' button on your desired casing format card.",
                "Paste the converted string directly into your source code, configuration file, or article.",
                "Use the 'Clear' button whenever you need to start fresh."
              ],
              featuresTitle: "Key Converter Features",
              features: [
                { title: "8 Standard Casing Styles at Once", desc: "Generates UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE in parallel." },
                { title: "Smart Delimiter Parsing", desc: "Intelligently handles spaces, hyphens, underscores, and mixed-case inputs to reformat words cleanly." },
                { title: "1-Click Card Clipboard Copy", desc: "Copy any specific naming format with a single click with instant visual feedback." },
                { title: "100% Client-Side Privacy", desc: "All string manipulations occur locally inside your browser with zero network requests." }
              ],
              useCasesTitle: "Popular Use Cases",
              useCases: [
                { title: "Code Variables & Function Names", desc: "Convert phrases to JS/TS camelCase, Python/Rust snake_case, and React PascalCase" },
                { title: "REST URLs & CSS Selectors", desc: "Generate clean hyphen-separated kebab-case strings for URL slugs and CSS class names" },
                { title: "Headline & Title Formatting", desc: "Capitalize the first letter of each word in articles, essays, and documentation headers" },
                { title: "Environment Variables & Constants", desc: "Format global variables into UPPERCASE_SNAKE_CASE (CONSTANT_CASE) for .env configs" }
              ],
              proTipsTitle: "Naming Convention Pro Tips",
              proTips: [
                "Use camelCase for JavaScript and TypeScript variable and function names as the language convention.",
                "Use PascalCase for React/Vue component names, TypeScript classes, and type aliases.",
                "Use kebab-case for clean, human-readable REST API endpoints and CSS class selectors.",
                "Input text containing mixed punctuation will be automatically tokenized and reformatted properly."
              ],
              faqTitle: "Frequently Asked Questions (FAQ)",
              faqs: [
                { q: "What is the difference between camelCase and PascalCase?", a: "camelCase starts with a lowercase letter (e.g. myVariableName), while PascalCase capitalizes the first letter of every word including the first (e.g. MyComponentName)." },
                { q: "Where should I use snake_case vs kebab-case?", a: "snake_case (e.g. user_profile_id) is standard in Python, Ruby, and SQL databases. kebab-case (e.g. blog-post-slug) is standard for web URLs and CSS styling." },
                { q: "Is my text sent to any server?", a: "No! All string transformations are executed 100% locally in your browser memory." },
                { q: "What is CONSTANT_CASE used for?", a: "It is standard for immutable global values, API secret variable keys, and .env configuration definitions." },
                { q: "Can I convert full sentences?", a: "Yes, you can convert full sentences, bullet lists, or multiline strings into all 8 case styles seamlessly." },
                { q: "Is this tool completely free?", a: "Yes, 100% free with no usage limits or sign-up requirements." }
              ],
              relatedTools: [
                { title: "Word & Character Counter", desc: "Calculate words, characters with/without spaces, and reading times", href: "/tools/word-count/" },
                { title: "Markdown Live Preview", desc: "Write Markdown documents with live rendered HTML preview", href: "/tools/markdown-preview/" },
                { title: "Text Diff Checker", desc: "Compare two text snippets side-by-side and highlight differences", href: "/tools/text-diff/" },
                { title: "URL Encoder / Decoder", desc: "Encode and decode special characters and web URLs safely", href: "/tools/url-encoder/" }
              ]
            },
            ja: {
              aboutTitle: "大文字・小文字＆プログラミング命名規則変換ツールについて",
              aboutDesc:
                "英語テキストを入力するだけで、大文字（UPPERCASE）、小文字（lowercase）、タイトル形式（Title Case）、camelCase、PascalCase、snake_case、kebab-case、CONSTANT_CASEの全8種類の主要な表記スタイルに一括変換します。ブラウザ内で100%ローカルに高速処理されます。",
              howTitle: "表記形式の変換手順",
              steps: [
                "入力ボックスに変換したい英単語、文章、変数名を入力または貼り付けます。",
                "入力と同時に、下部に生成された8種類の表記スタイルの結果カードを確認します。",
                "利用したい表記スタイルのカードの「コピー」ボタンをクリックします。",
                "クリップボードにコピーされたテキストを、ソースコードやドキュメントに貼り付けて使用します。",
                "新しいテキストを入力する際は「クリア」ボタンで入力欄をリセットします。"
              ],
              featuresTitle: "主な変換機能と特徴",
              features: [
                { title: "8種類の標準表記スタイルを同時生成", desc: "大文字・小文字・Title Caseから開発必須のキャメルケース・スネークケースまで一括作成。" },
                { title: "柔軟な区切り文字の自動認識", desc: "空白、アンダースコア、ハイフンなどの区切り文字を自動検出してきれいに整形。" },
                { title: "カードごとのワンクリックコピー", desc: "必要な命名スタイルだけをワンタップで素早くクリップボードに取得可能。" },
                { title: "完全ローカル・セキュア処理", desc: "外部サーバーへデータを送信せず、ブラウザ内JavaScriptで高速・安全に変換。" }
              ],
              useCasesTitle: "おすすめの活用シーン",
              useCases: [
                { title: "プログラム変数・関数・DBカラムの命名", desc: "JS/TSのcamelCase、Python/SQLのsnake_case、ReactコンポーネントのPascalCase" },
                { title: "Web URLスラッグ＆CSSクラス名", desc: "URLやCSSセレクタに適したハイフン区切りのkebab-case生成" },
                { title: "英語の見出し・タイトルの大文字揃え", desc: "各単語の頭文字を大文字にするTitle Caseによるドキュメント見出し作成" },
                { title: "環境変数＆定数（CONST）の定義", desc: ".envファイルやグローバル定数用の大文字スネークケース（CONSTANT_CASE）" }
              ],
              proTipsTitle: "命名規則のプロのコツ",
              proTips: [
                "JavaScriptやTypeScriptの変数・関数名にはcamelCaseを用いるのが標準的な規約です。",
                "ReactやVueのコンポーネント名、TypeScriptのクラスや型エイリアスにはPascalCaseを使用してください。",
                "REST APIのエンドポイントやCSSのクラス名にはkebab-caseが広く推奨されます。",
                "空白や記号が混ざった文字列も、自動的に単語ごとに分割されて正しく変換されます。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "camelCaseとPascalCaseの違いは何ですか？", a: "camelCaseは先頭小文字（例：myVariableName）、PascalCaseは先頭も大文字（例：MyComponentName）になります。" },
                { q: "kebab-caseとsnake_caseの使い分けは？", a: "kebab-caseはURLスラッグやCSSクラス名、snake_caseはPythonの変数やデータベースのカラム名に広く使われます。" },
                { q: "入力した文字列はサーバーに送信されますか？", a: "一切送信されません。すべての変換処理はお使いのブラウザ内メモリでのみ実行されます。" },
                { q: "CONSTANT_CASEはいつ使いますか？", a: "プログラム中の定数や.env設定ファイルのキー名を定義する際に使われます。" },
                { q: "長い文章も変換できますか？", a: "はい、文章全体を一括で大文字・小文字・Title Caseなどに変換可能です。" },
                { q: "利用料金はかかりますか？", a: "完全無料・登録不要でどなたでもご利用いただけます。" }
              ],
              relatedTools: [
                { title: "文字数カウント", desc: "文字数（空白込み/除外）、単語数、行数、読了時間をリアルタイム計測", href: "/tools/word-count/" },
                { title: "Markdownリアルタイムプレビュー", desc: "マークダウンを記述しながらリアルタイムにHTML変換プレビュー", href: "/tools/markdown-preview/" },
                { title: "テキスト差分比較 (Diff)", desc: "2つの文章の修正・追加・削除箇所の違いを行単位で比較", href: "/tools/text-diff/" },
                { title: "URLエンコード・デコード", desc: "特殊文字や日本語URLを安全なWeb標準に相互変換", href: "/tools/url-encoder/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Conversor de Mayúsculas / Minúsculas y Nomenclaturas",
              aboutDesc:
                "Convierte al instante cualquier texto en 8 formatos estándar: MAYÚSCULAS, minúsculas, Title Case, camelCase, PascalCase, snake_case, kebab-case y CONSTANT_CASE. Herramienta esencial para programadores y redactores.",
              howTitle: "Cómo Convertir y Copiar los Formatos",
              steps: [
                "Escribe o pega tu texto o nombre de variable en el cuadro de entrada.",
                "Observa los 8 estilos de nomenclatura generados en tiempo real en las tarjetas inferiores.",
                "Haz clic en el botón 'Copiar' de la tarjeta con el formato deseado.",
                "Pega el texto convertido directamente en tu código fuente o documento.",
                "Usa el botón 'Limpiar' para reiniciar el editor."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "8 Estilos de Nomenclatura en Paralelo", desc: "Genera mayúsculas, minúsculas, Title Case, camelCase, PascalCase, snake_case, kebab-case y CONSTANT_CASE simultáneamente." },
                { title: "Detección Inteligente de Separadores", desc: "Identifica espacios, guiones y barras bajas para reconstruir las palabras con total precisión." },
                { title: "Copia Rápida con 1 Clic", desc: "Botón de copiado independiente en cada tarjeta con confirmación visual instantánea." },
                { title: "100% Seguro y en Navegador", desc: "Conversión ultrarrápida en memoria local sin enviar datos a servidores externos." }
              ],
              useCasesTitle: "Casos de Uso Populares",
              useCases: [
                { title: "Variables y Funciones de Código", desc: "camelCase para JS/TS, snake_case para Python/SQL y PascalCase para componentes React" },
                { title: "Slugs de URLs y Clases CSS", desc: "kebab-case para rutas web amigables y selectores CSS limpios" },
                { title: "Titulares y Encabezados de Documentos", desc: "Title Case para poner en mayúscula la inicial de cada palabra en artículos" },
                { title: "Variables de Entorno y Constantes", desc: "CONSTANT_CASE para archivos .env y constantes globales en programación" }
              ],
              proTipsTitle: "Consejos Profesionales de Nomenclatura",
              proTips: [
                "Usa camelCase para variables y funciones en JavaScript y TypeScript.",
                "Usa PascalCase para componentes en React/Vue e interfaces en TypeScript.",
                "Usa kebab-case para nombres de rutas URL y clases en CSS para optimizar el SEO.",
                "Puedes ingresar textos con puntuación variada y el conversor los tokenizará automáticamente."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Cuál es la diferencia entre camelCase y PascalCase?", a: "camelCase empieza en minúscula (ej. miVariable), mientras que PascalCase empieza siempre con mayúscula (ej. MiComponente)." },
                { q: "¿Dónde se utiliza snake_case y kebab-case?", a: "snake_case se usa en Python y bases de datos SQL; kebab-case se usa en URLs y estilos CSS." },
                { q: "¿Se envía el texto a algún servidor?", a: "No, todo el procesamiento se realiza localmente en la memoria de tu navegador." },
                { q: "¿Para qué sirve CONSTANT_CASE?", a: "Es la convención habitual para constantes globales y variables de configuración en archivos .env." },
                { q: "¿Puedo convertir frases completas?", a: "Sí, puedes convertir frases largas o listas de palabras completas sin problema." },
                { q: "¿Es gratis?", a: "Sí, 100% gratuito e ilimitado sin necesidad de registro." }
              ],
              relatedTools: [
                { title: "Contador de Palabras y Caracteres", desc: "Mide palabras, caracteres y tiempo de lectura estimado en tiempo real", href: "/tools/word-count/" },
                { title: "Vista Previa de Markdown", desc: "Escribe en Markdown con renderizado HTML en tiempo real", href: "/tools/markdown-preview/" },
                { title: "Comparador de Textos (Diff)", desc: "Compara dos textos línea por línea y resalta las diferencias", href: "/tools/text-diff/" },
                { title: "Codificador / Decodificador URL", desc: "Codifica y decodifica URLs con caracteres especiales de forma segura", href: "/tools/url-encoder/" }
              ]
            },
            zh: {
              aboutTitle: "关于英文大小写与编程命名规范转换器",
              aboutDesc:
                "输入英文文本或变量名，即可在 1 秒内同时生成 8 种主流大小写与命名格式：大写（UPPERCASE）、小写（lowercase）、首字母大写（Title Case）、驼峰命名（camelCase）、帕斯卡命名（PascalCase）、下划线命名（snake_case）、短横线命名（kebab-case）及常量全大写（CONSTANT_CASE）。100% 本地浏览器极速计算，安全可靠。",
              howTitle: "命名规范转换与复制步骤",
              steps: [
                "在上方输入框中输入或粘贴需要转换的英文单词、句子或变量名。",
                "在下方卡片中实时查看 8 种命名风格的转换结果。",
                "点击目标格式卡片右侧的“复制”按钮。",
                "将转换好的字符串直接粘贴至源代码、配置文件或文档中。",
                "点击“清空”按钮可重置输入框以开始新的转换。"
              ],
              featuresTitle: "核心转换功能",
              features: [
                { title: "8 种标准命名风格同步呈现", desc: "一次输入即可同时生成开发必需的大小写与代码命名规范。" },
                { title: "智能分词与分隔符识别", desc: "自动识别空格、下划线、短横线及大小写分词，实现精准规整重组。" },
                { title: "单卡片独立一键复制", desc: "每种格式配备独立的复制按键，带即时成功提示，操作极速。" },
                { title: "100% 浏览器本地运算", desc: "完全依靠本地 JS 引擎执行，零网络请求，保证机密代码与文案安全。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "代码变量与函数命名", desc: "JS/TS camelCase、Python/SQL snake_case 与 React 组件 PascalCase 转换" },
                { title: "RESTful URL 与 CSS 类名", desc: "生成符合 SEO 与 Web 标准的短横线命名（kebab-case）" },
                { title: "英文文章与报告标题美化", desc: "使用 Title Case 将英文文章标题各单词首字母统一转为大写" },
                { title: "环境变量与全局常量定义", desc: "为 .env 配置文件和全局常量生成大写下划线（CONSTANT_CASE）" }
              ],
              proTipsTitle: "命名规范专业建议",
              proTips: [
                "JavaScript 与 TypeScript 中的变量与函数名推荐统一使用 camelCase 小驼峰命名。",
                "React 组件名、Vue 单文件组件及 TypeScript 类型接口请使用 PascalCase 大驼峰命名。",
                "Web API 路由与 CSS 类名推荐使用 kebab-case 短横线命名，更易于搜索引擎索引与可读性。",
                "即使输入混杂特殊符号与不规则空格的字符串，工具也会自动清洗并正确分词转换。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "camelCase 与 PascalCase 有什么区别？", a: "camelCase 首字母为小写（例如 myVariableName），而 PascalCase 首字母为大写（例如 MyComponentName）。" },
                { q: "snake_case 与 kebab-case 通常用于何处？", a: "snake_case 常用于 Python 变量和 SQL 数据库字段；kebab-case 常用于网页 URL 路径和 CSS 样式类名。" },
                { q: "我输入的文本会被上传到服务器吗？", a: "绝无可能。所有字符转换逻辑 100% 在您本地电脑的浏览器内存中完成。" },
                { q: "CONSTANT_CASE 适合用在哪里？", a: "适用于定义不可变的全局常量和 .env 配置文件中的环境变量键名。" },
                { q: "支持整段长句转换吗？", a: "支持。您可以直接粘贴完整的英文段落或标题进行一键转换。" },
                { q: "使用有次数限制吗？", a: "100% 永久免费，无任何转换次数或字符长度限制。" }
              ],
              relatedTools: [
                { title: "字数与字符统计工具", desc: "实时统计字符数（含/不含空格）、词数及预计阅读时间", href: "/tools/word-count/" },
                { title: "Markdown 实时预览", desc: "编写 Markdown 文档并实时查看 HTML 渲染效果", href: "/tools/markdown-preview/" },
                { title: "文本差异比对 (Diff)", desc: "逐行比对两段文本的修改、新增与删除差异", href: "/tools/text-diff/" },
                { title: "URL 编码与解码", desc: "安全转换特殊字符及中文网址为标准 Web 编码", href: "/tools/url-encoder/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Convertisseur de Casse et Conventions de Nommage",
              aboutDesc:
                "Convertissez instantanément vos textes et noms de variables en 8 formats standards : MAJUSCULES, minuscules, Title Case, camelCase, PascalCase, snake_case, kebab-case et CONSTANT_CASE. Outil indispensable pour développeurs et rédacteurs.",
              howTitle: "Comment Convertir et Copier vos Textes",
              steps: [
                "Saisissez ou collez votre texte ou nom de variable dans le champ de saisie.",
                "Consultez les 8 cartes de résultats générées instantanément en dessous.",
                "Cliquez sur le bouton 'Copier' de la carte correspondant au style souhaité.",
                "Collez la chaîne convertie directement dans votre code source ou document.",
                "Cliquez sur 'Effacer' pour réinitialiser le champ."
              ],
              featuresTitle: "Fonctionnalités Principales",
              features: [
                { title: "8 Formats Standards Simultanés", desc: "Générez simultanément majuscules, minuscules, Title Case, camelCase, PascalCase, snake_case, kebab-case et CONSTANT_CASE." },
                { title: "Analyse Intelligente des Séparateurs", desc: "Détecte automatiquement les espaces, tirets et underscores pour restructurer vos mots." },
                { title: "Copie Indépendante en 1 Clic", desc: "Bouton de copie rapide avec confirmation visuelle sur chaque carte." },
                { title: "100% Local et Sécurisé", desc: "Conversion immédiate dans la mémoire de votre navigateur sans aucun envoi réseau." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Variables et Fonctions de Code", desc: "camelCase pour JS/TS, snake_case pour Python/SQL et PascalCase pour composants React" },
                { title: "Slugs d'URL et Classes CSS", desc: "Génération de kebab-case lisible et optimisé pour le SEO et les feuilles de style" },
                { title: "Titres et En-têtes d'Articles", desc: "Title Case pour mettre en majuscule chaque mot de vos titres de documents" },
                { title: "Variables d'Environnement et Constantes", desc: "Formatage en CONSTANT_CASE pour fichiers .env et constantes globales" }
              ],
              proTipsTitle: "Conseils Professionnels de Nommage",
              proTips: [
                "Utilisez camelCase pour les variables et fonctions en JavaScript et TypeScript.",
                "Utilisez PascalCase pour les composants React/Vue et les types TypeScript.",
                "Utilisez kebab-case pour les URLs et les sélecteurs CSS afin de maximiser la lisibilité.",
                "Le convertisseur gère automatiquement les chaînes contenant des ponctuations variées."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Quelle est la différence entre camelCase et PascalCase ?", a: "camelCase débute par une minuscule (ex. maVariable), tandis que PascalCase commence par une majuscule (ex. MonComposant)." },
                { q: "Quand utiliser snake_case et kebab-case ?", a: "snake_case est la norme en Python et SQL ; kebab-case est recommandé pour les URLs et le CSS." },
                { q: "Mes textes sont-ils envoyés sur un serveur ?", a: "Non, tout est exécuté localement dans votre navigateur." },
                { q: "À quoi sert CONSTANT_CASE ?", a: "Il est utilisé pour les constantes globales et les variables de configuration dans les fichiers .env." },
                { q: "Puis-je convertir des phrases entières ?", a: "Oui, vous pouvez convertir des phrases complètes ou des listes de mots." },
                { q: "Le service est-il gratuit ?", a: "100% gratuit, illimité et sans inscription requise." }
              ],
              relatedTools: [
                { title: "Compteur de Mots et Caractères", desc: "Mesurez mots, caractères et temps de lecture en direct", href: "/tools/word-count/" },
                { title: "Aperçu Markdown en Direct", desc: "Rédigez en Markdown avec rendu HTML instantané côte à côte", href: "/tools/markdown-preview/" },
                { title: "Comparateur de Textes (Diff)", desc: "Comparez deux textes ligne par ligne pour repérer les modifications", href: "/tools/text-diff/" },
                { title: "Encodeur / Décodeur d'URL", desc: "Encodez et décodez les URLs avec caractères spéciaux en toute sécurité", href: "/tools/url-encoder/" }
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
