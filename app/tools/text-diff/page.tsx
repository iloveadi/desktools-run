"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import { GitCompare, ArrowLeft } from "lucide-react";

export default function TextDiffPage() {
  const { t, locale } = useLocale();

  const [textA, setTextA] = useState(`The quick brown fox jumps over the lazy dog.
Fast web tools running in browser.
Zero server uploads required.`);

  const [textB, setTextB] = useState(`The fast brown fox jumps over the lazy dog.
Fast web tools running in browser memory.
Zero server uploads required.`);

  const linesA = textA.split("\n");
  const linesB = textB.split("\n");
  const maxLines = Math.max(linesA.length, linesB.length);

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "16px" }}>
            <ArrowLeft size={14} /> {t("textDiff.back")}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitCompare size={20} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>{t("textDiff.title")}</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{t("textDiff.subtitle")}</p>
        </section>

        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Input A */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{t("textDiff.originalText")}</span>
                <button onClick={() => setTextA("")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer" }}>{t("textDiff.clear")}</button>
              </div>
              <textarea
                rows={8}
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                style={{ width: "100%", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "12px", fontSize: "13.5px", fontFamily: "monospace" }}
              />
            </div>

            {/* Input B */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#818cf8" }}>{t("textDiff.modifiedText")}</span>
                <button onClick={() => setTextB("")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer" }}>{t("textDiff.clear")}</button>
              </div>
              <textarea
                rows={8}
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                style={{ width: "100%", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "12px", fontSize: "13.5px", fontFamily: "monospace" }}
              />
            </div>
          </div>

          {/* Diff Result */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{t("textDiff.comparisonDiff")}</h3>

            <div style={{ borderRadius: "8px", background: "rgba(0,0,0,0.25)", border: "1px solid var(--border-subtle)", padding: "16px", fontFamily: "monospace", fontSize: "13.5px", lineHeight: "1.7", overflowX: "auto" }}>
              {Array.from({ length: maxLines }).map((_, idx) => {
                const lineA = linesA[idx] ?? "";
                const lineB = linesB[idx] ?? "";
                const isDifferent = lineA !== lineB;

                return (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr", gap: "12px", padding: "4px 8px", borderRadius: "4px", background: isDifferent ? "rgba(239,68,68,0.12)" : "transparent", borderLeft: isDifferent ? "3px solid #ef4444" : "3px solid transparent", marginBottom: "2px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>L{idx + 1}</span>
                    <span style={{ color: isDifferent ? "#f87171" : "var(--text-secondary)", textDecoration: isDifferent ? "line-through" : "none" }}>{lineA || " "}</span>
                    <span style={{ color: isDifferent ? "#4ade80" : "var(--text-secondary)" }}>{lineB || " "}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6-Language Tool Guide & SEO Section ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "텍스트 차이점 비교 (Diff Checker) 도구 소개",
              aboutDesc:
                "원본 텍스트(Text A)와 수정본 텍스트(Text B)를 나란히 입력하면 변경·추가·삭제된 줄 단위의 차이점을 실시간으로 분석하고 직관적인 컬러 하이라이트로 시각화해 주는 전문 텍스트 비교 도구입니다. 소스 코드 수정 내역 검토, 법률 계약서 및 약관 개정안 대조, 기사 및 원고 초안 퇴고, JSON/설정 파일 변경사항 비교 등 다양한 업무에서 오탈자와 변경점을 1초 만에 찾아낼 수 있습니다. 모든 텍스트 비교 연산은 100% 사용자의 브라우저 메모리 내에서 실행되어 기밀 데이터 유출 위험이 없습니다.",
              howTitle: "텍스트 및 코드 차이점 비교 방법",
              steps: [
                "좌측 '원본 텍스트' 상자에 기준이 되는 텍스트를 입력하거나 붙여넣습니다.",
                "우측 '수정된 텍스트' 상자에 비교할 새로운 텍스트를 입력하거나 붙여넣습니다.",
                "하단 '비교 결과' 패널에서 라인 번호와 함께 실시간으로 변경된 줄을 확인합니다.",
                "삭제되거나 변경 전인 줄은 취소선과 붉은색, 새로 추가되거나 변경 후인 줄은 녹색으로 표시됩니다.",
                "새로운 비교를 시작하려면 각 상자의 '지우기' 버튼을 눌러 내용을 초기화합니다."
              ],
              featuresTitle: "주요 차이점 비교 기능",
              features: [
                { title: "실시간 줄 단위(Line-by-Line) 정밀 대조", desc: "텍스트를 입력하거나 수정하는 즉시 두 문장 간의 라인별 차이점을 딜레이 없이 실시간 렌더링합니다." },
                { title: "직관적인 듀얼 컬러 하이라이트", desc: "변경된 이전 내용은 취소선과 레드 배경, 새로운 내용은 그린 배경으로 강조하여 가독성을 극대화합니다." },
                { title: "코드 & 일반 문서 범용 지원", desc: "프로그래밍 소스 코드(JS, Python, HTML), JSON 데이터, 일반 국문/영문 텍스트 모두 완벽 지원합니다." },
                { title: "100% 브라우저 메모리 안전 처리", desc: "텍스트 데이터가 외부 서버로 전송되지 않아 기업 기밀 계약서나 보안 코드도 안심하고 대조할 수 있습니다." }
              ],
              useCasesTitle: "추천 활용 분야",
              useCases: [
                { title: "소스 코드 변경 내역 및 리팩터링 검토", desc: "Git 커밋 전후의 코드 스니펫 차이점 및 버그 수정 내용 즉시 확인" },
                { title: "법률 계약서 & 이용약관 개정안 대조", desc: "수정된 계약 조항, 삭제된 단어, 신설된 조항의 오탈자 및 변경 내역 정밀 검수" },
                { title: "기사 원고 및 블로그 초안 퇴고", desc: "초안과 교정본 사이의 수정 사항 및 삭제된 문장 이력 추적" },
                { title: "서버 설정 파일 & 환경 변수 비교", desc: ".env 파일, yaml, nginx 설정 간의 파라미터 값 변경점 대조" }
              ],
              proTipsTitle: "텍스트 비교 전문가 팁",
              proTips: [
                "줄 바꿈(Enter) 단위로 비교가 이루어지므로, 문단 비교 시 문장 단위로 줄 바꿈을 넣어주면 훨씬 정밀한 비교가 가능합니다.",
                "프로그래밍 코드 비교 시 들여쓰기 공백이 일치하는지 확인하면 더 정확한 변경점 파악이 가능합니다.",
                "긴 계약서나 논문은 핵심 의심 단락별로 복사하여 나누어 대조하면 수정된 단어를 빠르게 발견할 수 있습니다.",
                "JSON 데이터 비교 시 Desktools의 'JSON 포맷터'로 양쪽을 먼저 정렬한 뒤 비교하면 가독성이 극대화됩니다."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "입력한 텍스트나 기밀 계약서가 서버로 전송되나요?", a: "절대 전송되지 않습니다! desktools.run의 모든 텍스트 비교 연산은 100% 사용자의 브라우저 메모리 내부에서 로컬로 처리됩니다." },
                { q: "차이점 색상은 어떤 의미인가요?", a: "빨간색 배경과 취소선은 원본(Text A)에서 삭제되거나 변경된 내용이며, 녹색 배경은 수정본(Text B)에 새로 반영된 내용입니다." },
                { q: "코드 파일이나 JSON도 비교할 수 있나요?", a: "네! JavaScript, Python, CSS, JSON, SQL 등 모든 프로그래밍 언어 및 마크다운, 일반 텍스트를 완벽하게 비교할 수 있습니다." },
                { q: "비교 가능한 텍스트 길이에 제한이 있나요?", a: "브라우저 메모리가 허용하는 한 수천 줄의 텍스트도 제한 없이 자유롭게 비교하실 수 있습니다." },
                { q: "스마트폰이나 태블릿에서도 사용 가능한가요?", a: "네! 모바일 사파리, 크롬 브라우저에서도 분할 화면과 반응형 diff 결과를 완벽히 지원합니다." },
                { q: "이용 요금이 있나요?", a: "완전 100% 무료이며 회원가입이나 로그인 없이 즉시 사용하실 수 있습니다." }
              ],
              relatedTools: [
                { title: "단어 및 글자 수 세기", desc: "공백 포함/제외 글자 수, 단어 수, 문장 수 및 읽기 시간 계산", href: "/tools/word-count/" },
                { title: "대소문자 / 표기법 변환기", desc: "camelCase, snake_case, PascalCase, 대소문자 일괄 변환", href: "/tools/text-case/" },
                { title: "마크다운 실시간 미리보기", desc: "마크다운 문서를 작성하고 실시간 HTML 렌더링 결과 확인", href: "/tools/markdown-preview/" },
                { title: "JSON 포맷터 & 검증기", desc: "지저분한 JSON 데이터를 읽기 쉽게 들여쓰기 정렬 및 유효성 검사", href: "/tools/json-formatter/" }
              ]
            },
            en: {
              aboutTitle: "About Text Diff Checker & Comparison Tool",
              aboutDesc:
                "Compare original and modified text blocks side-by-side with real-time line-by-line difference detection. Highlight added, deleted, and modified lines with color-coded markers. Ideal for auditing code diffs, legal contracts, editorial drafts, and configuration files with 100% browser-based security.",
              howTitle: "How to Compare Text & Code Differences",
              steps: [
                "Paste your base original content into the left 'Original Text' box.",
                "Paste your updated or edited content into the right 'Modified Text' box.",
                "Instantly inspect the Comparison Diff panel below showing corresponding line numbers.",
                "Notice deleted/previous lines highlighted in red strikethrough and new lines highlighted in green.",
                "Use the 'Clear' buttons to reset either side and begin a new text comparison."
              ],
              featuresTitle: "Key Diff Checker Features",
              features: [
                { title: "Real-Time Line-by-Line Comparison", desc: "Live comparison rendering with zero latency as you type or adjust text snippets." },
                { title: "Intuitive Color Highlighting", desc: "Clear visual demarcation using red strikethrough for removals and green for additions." },
                { title: "Universal Text & Code Support", desc: "Compatible with programming languages (JS, Python, C++, HTML), JSON structures, and plain text." },
                { title: "100% Client-Side Privacy", desc: "Zero bytes of your confidential documents or proprietary code ever leave your browser." }
              ],
              useCasesTitle: "Popular Use Cases",
              useCases: [
                { title: "Code Refactoring & Snippet Comparison", desc: "Verify bug fixes and review code differences prior to committing git changes" },
                { title: "Legal Contracts & Policy Updates", desc: "Audit clauses, amended terms, and subtle wording changes in corporate agreements" },
                { title: "Editorial Drafts & Proofreading", desc: "Track editing revisions and deletions between article drafts and finalized copy" },
                { title: "Config & Environment Files", desc: "Compare parameters and keys across staging and production .env configurations" }
              ],
              proTipsTitle: "Text Comparison Pro Tips",
              proTips: [
                "Because diffing works line-by-line, inserting line breaks at sentence boundaries allows for more granular textual comparison.",
                "Keep indentation spaces consistent when comparing source code to isolate meaningful semantic changes.",
                "Break large multi-page contracts into smaller sections for faster visual auditing of modified wording.",
                "For JSON data, format both sides with the JSON Formatter tool first before running a diff comparison."
              ],
              faqTitle: "Frequently Asked Questions (FAQ)",
              faqs: [
                { q: "Is my confidential text or code uploaded to a server?", a: "No! All text comparison logic executes 100% locally inside your client browser memory." },
                { q: "What do the different colors signify?", a: "Red with strikethrough indicates lines present in Text A that were modified or removed; Green indicates new or updated lines in Text B." },
                { q: "Can I compare code files and JSON data?", a: "Yes! The tool works flawlessly across all programming code, JSON, Markdown, and plain text." },
                { q: "Is there a limit on text length?", a: "You can compare thousands of lines of text as long as your device's browser memory accommodates it." },
                { q: "Does it work on mobile browsers?", a: "Yes, the responsive design adapts smoothly to mobile Safari and Chrome screens." },
                { q: "Is this tool free?", a: "Yes, 100% free with no subscriptions or account registrations needed." }
              ],
              relatedTools: [
                { title: "Word & Character Counter", desc: "Calculate words, characters with/without spaces, and reading times", href: "/tools/word-count/" },
                { title: "Text Case Converter", desc: "Convert text to UPPERCASE, camelCase, snake_case, PascalCase", href: "/tools/text-case/" },
                { title: "Markdown Live Preview", desc: "Write Markdown documents with live rendered HTML preview", href: "/tools/markdown-preview/" },
                { title: "JSON Formatter & Validator", desc: "Format, beautify, and validate complex JSON data structures", href: "/tools/json-formatter/" }
              ]
            },
            ja: {
              aboutTitle: "テキスト差分比較（Diff Checker）ツールについて",
              aboutDesc:
                "元の文章（Text A）と変更後の文章（Text B）を左右に入力するだけで、追加・削除・変更された行の差分をリアルタイムに比較し、わかりやすく色分け表示します。プログラムのコード変更確認、契約書の改定箇所の点検、原稿の校正履歴の確認など、あらゆるテキスト照合作業を100%ローカルで安全に行えます。",
              howTitle: "テキスト・コードの差分比較手順",
              steps: [
                "左側の「元のテキスト」枠に比較元となる文章やコードを貼り付けます。",
                "右側の「変更後のテキスト」枠に変更を加えた文章を貼り付けます。",
                "下部の「比較結果」パネルに行番号とともに行単位の差分がリアルタイムに表示されます。",
                "変更前の内容は赤色（打ち消し線）、新しく変更された内容は緑色で強調表示されます。",
                "新しい比較を行う際は、各枠の「クリア」ボタンでリセットします。"
              ],
              featuresTitle: "主なテキスト比較機能",
              features: [
                { title: "行単位（Line-by-Line）のリアルタイム比較", desc: "テキストを入力・編集すると同時に遅延なく差分を即時レンダリング。" },
                { title: "直感的なカラーハイライト表示", desc: "削除・変更前を赤色、追加・変更後を緑色で色分けし、変更箇所が一目で分かります。" },
                { title: "プログラムコード＆文章の万能サポート", desc: "JavaScript、Python、HTML、JSON、契約書、一般文章などあらゆるテキストに対応。" },
                { title: "完全ローカル・セキュア処理", desc: "外部サーバーへテキストを一切送信しないため、機密契約書やコードも安全に比較可能。" }
              ],
              useCasesTitle: "おすすめの活用シーン",
              useCases: [
                { title: "ソースコードの修正箇所・バグ修正の確認", desc: "Gitコミット前後の変更点やリファクタリング内容の素早いチェック" },
                { title: "契約書・利用規約・約款の改定点チェック", desc: "更新された条文、削除された語句、新設された項目の綿密な照合" },
                { title: "記事原稿・ブログ下書きの推敲履歴確認", desc: "初稿と推敲後の原稿を比較し、修正した表現や削除文をトラッキング" },
                { title: "設定ファイル・環境変数（.env）の差分調査", desc: "本番環境と開発環境の設定値の違いをミスなく確認" }
              ],
              proTipsTitle: "テキスト比較のプロのコツ",
              proTips: [
                "比較は改行単位で行われるため、長い文章は文末ごとに改行を入れるとより細かな差分が確認しやすくなります。",
                "コードを比較する際はインデントのスペース数を統一しておくと、純粋なロジックの変更点を見失いません。",
                "長大な契約書は重要な条項ごとに小分けにして比較すると、細かな文言変更を見落としません。",
                "JSONデータを比較する際は、先にJSONフォーマッターで両方を整形してから比較すると効果的です。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "入力した機密テキストがサーバーに送信されますか？", a: "一切送信されません！すべての差分計算はお使いのブラウザメモリ内でのみ実行されます。" },
                { q: "色分けの意味を教えてください。", a: "赤色（取り消し線）は変更前（Text A）で削除された行、緑色は変更後（Text B）に新しく追加された行を表します。" },
                { q: "プログラミングコードやJSONも比較できますか？", a: "はい！あらゆるプログラミング言語、マークダウン、JSON、プレーンテキストを正確に比較できます。" },
                { q: "比較できるテキストの長さに制限はありますか？", a: "ブラウザのメモリが許す限り、数千行の長大なテキストでも無制限に比較可能です。" },
                { q: "スマホでも使えますか？", a: "はい！スマートフォンやタブレットのブラウザでもレスポンシブにご利用いただけます。" },
                { q: "利用料金はかかりますか？", a: "完全無料・登録不要でどなたでもご利用いただけます。" }
              ],
              relatedTools: [
                { title: "文字数カウント", desc: "文字数（空白込み/除外）、単語数、行数、読了時間をリアルタイム計測", href: "/tools/word-count/" },
                { title: "大文字・小文字/命名規則変換", desc: "camelCase、snake_case、PascalCase、大文字小文字の一括変換", href: "/tools/text-case/" },
                { title: "Markdownリアルタイムプレビュー", desc: "マークダウンを記述しながらリアルタイムにHTML変換プレビュー", href: "/tools/markdown-preview/" },
                { title: "JSONフォーマッター＆検証", desc: "JSONデータの整形、インデント調整、構文エラーチェック", href: "/tools/json-formatter/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Comparador de Textos (Diff Checker)",
              aboutDesc:
                "Compara dos bloques de texto lado a lado y resalta en tiempo real las diferencias línea por línea. Identifica líneas añadidas, eliminadas o modificadas con una clara distinción por colores. Ideal para auditar código fuente, contratos legales, borradores editoriales y archivos de configuración de forma 100% segura en tu navegador.",
              howTitle: "Cómo Comparar Diferencias entre Textos",
              steps: [
                "Pega el texto original de referencia en el cuadro izquierdo 'Texto Original'.",
                "Pega el texto editado o revisado en el cuadro derecho 'Texto Modificado'.",
                "Observa en el panel inferior 'Resultado de la Comparación' las líneas modificadas.",
                "Las líneas eliminadas o anteriores se mostrarán en rojo tachado, y las nuevas en verde.",
                "Usa los botones de 'Limpiar' para reiniciar la comparación en cualquier momento."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Comparación Línea por Línea en Vivo", desc: "Detección instantánea de diferencias en tiempo real sin latencia." },
                { title: "Resaltado de Colores Intuitivo", desc: "Fácil identificación visual con rojo tachado para eliminaciones y verde para adiciones." },
                { title: "Soporte Universal de Texto y Código", desc: "Compatible con lenguajes de programación, archivos JSON, contratos y textos generales." },
                { title: "100% Local y Privado", desc: "Tus contratos confidenciales o código propietario nunca salen de tu ordenador." }
              ],
              useCasesTitle: "Casos de Uso Populares",
              useCases: [
                { title: "Revisión de Código y Refactorización", desc: "Comprueba cambios y correcciones de bugs antes de realizar commits en Git" },
                { title: "Contratos Legales y Términos de Servicio", desc: "Audita cláusulas modificadas, párrafos eliminados y cambios sutiles de redacción" },
                { title: "Borradores Editoriales y Corrección de Textos", desc: "Rastrea las correcciones aplicadas entre el borrador inicial y la versión final" },
                { title: "Archivos de Configuración (.env, YAML)", desc: "Compara parámetros y variables entre entornos de desarrollo y producción" }
              ],
              proTipsTitle: "Consejos Profesionales de Comparación",
              proTips: [
                "Como la comparación se efectúa por líneas, separar los párrafos por oraciones facilita una revisión mucho más detallada.",
                "Mantén la misma sangría de espacios al comparar código fuente para detectar cambios semánticos reales.",
                "En contratos extensos, compara sección por sección para no pasar por alto modificaciones pequeñas.",
                "Para comparar JSON, formatea ambos bloques con el Formateador JSON antes de realizar la comparación."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Se envían mis textos confidenciales a algún servidor?", a: "No. Toda la lógica de comparación se procesa localmente en la memoria de tu navegador." },
                { q: "¿Qué significan los colores de la comparación?", a: "El rojo tachado indica líneas del texto original que han sido modificadas o eliminadas; el verde indica las nuevas líneas del texto modificado." },
                { q: "¿Puedo comparar código de programación?", a: "Sí, es perfectamente compatible con JavaScript, Python, HTML, JSON, SQL y cualquier lenguaje." },
                { q: "¿Hay límite de longitud de texto?", a: "Puedes comparar miles de líneas siempre que la memoria de tu navegador lo admita." },
                { q: "¿Funciona en dispositivos móviles?", a: "Sí, la interfaz responsiva se adapta a pantallas de teléfonos móviles y tabletas." },
                { q: "¿Tiene algún coste?", a: "Es 100% gratuito e ilimitado, sin necesidad de registro." }
              ],
              relatedTools: [
                { title: "Contador de Palabras y Caracteres", desc: "Mide palabras, caracteres y tiempo de lectura estimado en tiempo real", href: "/tools/word-count/" },
                { title: "Conversor de Mayúsculas / Minúsculas", desc: "Convierte a camelCase, snake_case, PascalCase y Title Case", href: "/tools/text-case/" },
                { title: "Vista Previa de Markdown", desc: "Escribe en Markdown con renderizado HTML en tiempo real", href: "/tools/markdown-preview/" },
                { title: "Formateador JSON", desc: "Formatea, embellece y valida estructuras de datos JSON", href: "/tools/json-formatter/" }
              ]
            },
            zh: {
              aboutTitle: "关于文本差异比对 (Diff Checker) 工具",
              aboutDesc:
                "将原文（Text A）与修改后的文本（Text B）左右并排输入，即可实时比对并高亮呈现逐行的增、删、改差异。删除与修改前内容以红色加删除线标识，新增与修改后内容以绿色清晰呈现。适用于源代码审核、法律合同修改核对、文章草稿校对及配置文件比对，100% 本地浏览器内存极速计算，安全保密。",
              howTitle: "文本与代码差异比对步骤",
              steps: [
                "在左侧“原文”框中粘贴基准文本或原始代码。",
                "在右侧“修改后的文本”框中粘贴需要对比的新版本内容。",
                "在下方“对比结果”面板中实时查看带有行号的逐行比对详情。",
                "被修改或删除的行将以红色删除线显示，新添加的行将以绿色高亮显示。",
                "点击各输入框右上方的“清空”按钮即可随时重置文本开始新的比对。"
              ],
              featuresTitle: "核心比对功能",
              features: [
                { title: "逐行（Line-by-Line）零延迟实时比对", desc: "文本输入与修改时即刻同步更新比对结果，无需手动点击提交按钮。" },
                { title: "直观的红绿双色高亮显示", desc: "红色删除线醒目标识历史删除内容，绿色背景清晰呈现最新修改。" },
                { title: "全通用文本与代码语法兼容", desc: "支持各类编程代码（JS、Python、HTML）、JSON 数据、法律文书及普通文本。" },
                { title: "100% 浏览器本地安全沙箱", desc: "绝不向服务器传输任何字节，严密保障企业商业机密合同与核心代码安全。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "代码重构与 Bug 修复改动审核", desc: "在提交代码版本控制前快速比对补丁改动与逻辑变动" },
                { title: "法律合同与协议条款修订比对", desc: "精准审核法务合同中修改的词句、删除的条款及新设的责任条款" },
                { title: "文案编辑与长文修改痕迹跟踪", desc: "追踪初稿与审校稿之间的润色细节与删减内容" },
                { title: "服务器配置文件与环境变量比对", desc: "排查测试环境与生产环境 .env 或 nginx 配置文件中的参数差异" }
              ],
              proTipsTitle: "文本比对专业技巧",
              proTips: [
                "比对算法以换行符为基础单位，长段落若按句子适当换行可获得更精细的文字比对粒度。",
                "比对编程代码时保持一致的缩进空格有助于更准确地识别核心代码逻辑变动。",
                "比对复杂长篇合同时，建议分章节分段比对，能更快速发现细微的词汇修改。",
                "对于 JSON 数据，建议先使用本站的“JSON 格式化工具”排版后再进行 Diff 比对。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "我输入的机密文本或代码会被上传到服务器吗？", a: "绝对不会！所有文本比对算法 100% 在您本地电脑的浏览器内存中运行。" },
                { q: "对比结果中的颜色代表什么？", a: "红色加删除线代表在原文（Text A）中被删除或修改的内容；绿色代表在修改版（Text B）中新增的内容。" },
                { q: "支持比对代码文件和 JSON 数据吗？", a: "支持！全面兼容各类编程语言代码、Markdown、JSON 以及纯文本。" },
                { q: "比对的文本长度有上限吗？", a: "只要您的电脑浏览器内存允许，即使是数千行的长篇文本也能顺畅比对。" },
                { q: "手机端浏览器支持吗？", a: "支持！完全适配移动端，提供自适应并排比对视图。" },
                { q: "完全免费吗？", a: "100% 永久免费，无任何功能限制，无需注册登录。" }
              ],
              relatedTools: [
                { title: "字数与字符统计工具", desc: "实时统计字符数（含/不含空格）、词数及预计阅读时间", href: "/tools/word-count/" },
                { title: "英文大小写/命名规范转换", desc: "camelCase、snake_case、PascalCase、大小写一键互转", href: "/tools/text-case/" },
                { title: "Markdown 实时预览", desc: "编写 Markdown 文档并实时查看 HTML 渲染效果", href: "/tools/markdown-preview/" },
                { title: "JSON 格式化与校验工具", desc: "格式化、美化及校验复杂 JSON 数据结构", href: "/tools/json-formatter/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Comparateur de Textes (Diff Checker)",
              aboutDesc:
                "Comparez deux textes côte à côte et visualisez instantanément les différences ligne par ligne. Les suppressions et modifications antérieures apparaissent en rouge barré, et les ajouts en vert. Outil parfait pour auditer du code, des contrats juridiques, des épreuves éditoriales et des fichiers de configuration en toute sécurité dans votre navigateur.",
              howTitle: "Comment Comparer les Différences entre Textes",
              steps: [
                "Collez le texte original de référence dans le champ gauche 'Texte Original'.",
                "Collez le texte modifié dans le champ droit 'Texte Modifié'.",
                "Consultez dans le panneau inférieur 'Résultat de la Comparaison' les lignes modifiées.",
                "Les lignes supprimées s'affichent en rouge barré et les nouvelles lignes en vert.",
                "Cliquez sur 'Effacer' pour réinitialiser les champs et démarrer une nouvelle comparaison."
              ],
              featuresTitle: "Fonctionnalités Principales",
              features: [
                { title: "Comparaison Ligne par Ligne en Direct", desc: "Détection instantanée des écarts textuels sans aucun temps de chargement." },
                { title: "Mise en Évidence Visuelle Bicolore", desc: "Repérage clair : rouge barré pour les retraits, vert pour les ajouts." },
                { title: "Compatibilité Universelle Texte & Code", desc: "Prend en charge tous les langages de programmation, le JSON, les contrats et les textes classiques." },
                { title: "100% Local et Confidentiel", desc: "Vos documents sensibles et codes propriétaires ne quittent jamais votre appareil." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Revue de Code et Refactorisation", desc: "Contrôlez vos modifications et corrections avant de valider un commit Git" },
                { title: "Contrats Juridiques et Conditions Générales", desc: "Auditez les clauses révisées, les termes supprimés et les ajustements de formulation" },
                { title: "Épreuves Éditoriales et Relecture", desc: "Suivez les corrections apportées entre le premier jet et la version finale" },
                { title: "Fichiers de Configuration (.env, YAML)", desc: "Comparez les paramètres entre environnements de développement et de production" }
              ],
              proTipsTitle: "Conseils Professionnels de Comparaison",
              proTips: [
                "La comparaison s'effectuant par ligne, insérer des sauts de ligne à la fin des phrases affine grandement la précision.",
                "Conservez une indentation identique lors de la comparaison de code pour isoler les changements sémantiques.",
                "Pour les contrats volumineux, procédez par sections pour ne manquer aucune modification subtile.",
                "Pour le JSON, formatez les deux blocs avec l'outil Formateur JSON avant d'effectuer la comparaison."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Mes textes confidentiels sont-ils envoyés sur un serveur ?", a: "Non ! Tout le traitement s'exécute à 100% dans la mémoire de votre navigateur." },
                { q: "Que signifient les couleurs de la comparaison ?", a: "Le rouge barré signale les lignes du texte original supprimées ou modifiées ; le vert indique les nouveaux ajouts." },
                { q: "Puis-je comparer du code de programmation ?", a: "Oui, compatible avec JavaScript, Python, HTML, JSON, SQL et n'importe quel texte." },
                { q: "Y a-t-il une limite de taille de texte ?", a: "Vous pouvez comparer des milliers de lignes de texte sans aucune restriction." },
                { q: "L'outil fonctionne-t-il sur mobile ?", a: "Oui, parfaitement adapté aux écrans mobiles sur iOS et Android." },
                { q: "Le service est-il gratuit ?", a: "100% gratuit, illimité et sans inscription requise." }
              ],
              relatedTools: [
                { title: "Compteur de Mots et Caractères", desc: "Mesurez mots, caractères et temps de lecture en direct", href: "/tools/word-count/" },
                { title: "Convertisseur de Casse (Text Case)", desc: "Convertissez en camelCase, snake_case, PascalCase ou majuscules", href: "/tools/text-case/" },
                { title: "Aperçu Markdown en Direct", desc: "Rédigez en Markdown avec rendu HTML instantané côte à côte", href: "/tools/markdown-preview/" },
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
