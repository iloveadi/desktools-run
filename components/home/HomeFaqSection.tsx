"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { Locale } from "@/lib/i18n";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqContent {
  badge: string;
  title: string;
  subtitle: string;
  faqs: FaqItem[];
}

const CONTENT: Record<Locale, FaqContent> = {
  ko: {
    badge: "자주 묻는 질문 & 답변",
    title: "서비스 이용 및 브라우저 보안에 대해 궁금하신 점이 있나요?",
    subtitle:
      "desktools.run의 제로 서버 철학, 브라우저 연산 원리, 기업 보안 환경 적용에 대해 가장 자주 묻는 질문들을 모았습니다.",
    faqs: [
      {
        q: "정말로 업로드한 파일이 외부 서버에 저장되거나 전송되지 않나요?",
        a: "네, 100% 사실입니다. 브라우저 개발자 도구(F12)의 Network 탭을 열어두고 PDF 병합이나 이미지 압축을 실행해 보시면, 외부 원격 서버로 어떠한 파일 페이로드도 전송되지 않는 것을 기술적으로 직접 검증하실 수 있습니다. 모든 파일 연산은 귀하의 브라우저 메모리(JavaScript & WebAssembly 샌드박스) 내부에서만 즉시 처리됩니다.",
      },
      {
        q: "파일 크기나 하루에 사용할 수 있는 횟수에 제한이 있나요?",
        a: "어떠한 인위적인 제한도 없습니다. desktools.run은 원격 서버의 컴퓨팅 파워나 대역폭을 소모하지 않기 때문에 하루 사용 횟수 제한, 파일당 용량 한도(예: 10MB 제한 등), 일일 변환 쿼터가 일절 없습니다. 사용 중인 컴퓨터나 스마트폰의 가용 메모리(RAM) 범위 내에서 수백 MB 단위의 파일도 자유롭게 처리하실 수 있습니다.",
      },
      {
        q: "기업의 사내 기밀 문서나 법적 계약서도 안전하게 처리할 수 있나요?",
        a: "네, 매우 안전하며 오히려 기존 클라우드 변환 사이트보다 훨씬 더 높은 수준의 프라이버시를 보장합니다. 클라우드 서버에 데이터가 저장되거나 로그(Log)가 남지 않으므로, 기업 보안 지침(Security Compliance), GDPR 및 개인정보보호법상 외부 클라우드 유출이 엄격히 금지된 NDA 계약서, 회계 서류, 인사 자료 등을 완벽하게 안전하게 편집할 수 있습니다.",
      },
      {
        q: "AI 배경 제거(누끼 따기)는 서버 없이 어떻게 브라우저에서 동작하나요?",
        a: "desktools.run은 최신 WebAssembly(WASM) 및 ONNX 브라우저 런타임을 통해 경량화된 AI 세그멘테이션 신경망 모델을 클라이언트 브라우저로 한 번만 다운로드하여 로컬 캐싱합니다. 이후 사진을 드래그하면 사용자의 기기 CPU 및 WebGL 그래픽 가속을 통해 장치 내부에서 직접 딥러닝 추론을 수행하므로 사진이 외부 AI 서버로 단 1바이트도 나가지 않습니다.",
      },
      {
        q: "아이폰(iOS Safari)이나 안드로이드(Chrome) 모바일에서도 사용할 수 있나요?",
        a: "네, 완벽하게 지원됩니다. 모든 도구는 최신 모바일 웹 표준과 반응형 터치 인터페이스로 개발되어 별도의 앱스토어 앱 설치 없이도 스마트폰과 태블릿 브라우저에서 데스크톱과 동일한 고성능 로컬 연산을 경험하실 수 있습니다.",
      },
      {
        q: "desktools.run은 정말로 평생 100% 무료인가요?",
        a: "네, 모든 유틸리티 도구는 완전 무료입니다. 복잡한 회원가입, 신용카드 등록, 워터마크 강제 삽입, 유료 플랜 유도가 전혀 없습니다. 언제든 필요할 때 즐겨찾기(북마크)해 두고 책상 위에서 바로 실행하세요.",
      },
    ],
  },

  en: {
    badge: "Frequently Asked Questions",
    title: "Questions About In-Browser Privacy & Platform Architecture?",
    subtitle:
      "Discover how our zero-server philosophy protects your data, eliminates latency, and ensures total operational transparency.",
    faqs: [
      {
        q: "Are uploaded files genuinely never sent or stored on remote servers?",
        a: "Yes, 100% verified. You can open your browser Developer Tools (F12) Network tab to inspect all traffic while merging PDFs or compressing images; zero file payloads leave your machine. Everything executes entirely inside local browser RAM via WebAssembly and JavaScript sandboxing.",
      },
      {
        q: "Are there any file size caps or daily usage limitations?",
        a: "No artificial limits exist. Because operations run locally without consuming backend cloud compute or bandwidth, there are no file size caps, daily quotas, or speed throttles. You can process as many files as your device RAM permits.",
      },
      {
        q: "Is desktools.run safe for proprietary enterprise documents and legal contracts?",
        a: "Yes, desktools.run delivers superior privacy compared to legacy SaaS converters. Because data never lands on third-party servers, it complies with strict enterprise information security policies, GDPR, and NDA confidentiality agreements.",
      },
      {
        q: "How does AI background removal work in-browser without cloud GPUs?",
        a: "We leverage WebAssembly and ONNX client-side runtimes to load a neural segmentation model into your browser cache once. Image inference executes on your local hardware via CPU/WebGL acceleration without external AI servers.",
      },
      {
        q: "Can I use desktools.run on mobile devices (iOS Safari & Android Chrome)?",
        a: "Yes, fully responsive across mobile browsers including Safari on iOS and Chrome on Android. No app installation or permission grants required.",
      },
      {
        q: "Is desktools.run truly 100% free with no hidden charges?",
        a: "Yes, completely free forever. No registrations, subscriptions, watermarks, or hidden paywalls. Bookmark it and use it whenever you need fast, private utility tools.",
      },
    ],
  },

  ja: {
    badge: "よくあるご質問と回答",
    title: "セキュリティやブラウザ処理に関するよくある質問",
    subtitle:
      "desktools.runのゼロサーバー哲学、ブラウザ内演算の仕組み、企業での安全性について詳しく解説します。",
    faqs: [
      {
        q: "ファイルは本当に外部サーバーへ送信・保存されませんか？",
        a: "はい、100%真実です。ブラウザの開発者ツール（F12）の「Network」タブを開いて処理を実行していただければ、外部サーバーへのファイル送信が一切発生しないことを技術的にご確認いただけます。すべての演算はお手元のブラウザメモリ（JavaScriptおよびWebAssembly）内のみで完結します。",
      },
      {
        q: "ファイルサイズや1日の利用回数に制限はありますか？",
        a: "人工的な制限は一切ありません。クラウドサーバーのリソースを消費しないため、1日あたりの回数制限やファイルサイズ上限（例：10MB制限など）はありません。お使いのPCやスマートフォンのメモリ（RAM）が許す限り、大容量ファイルも自由に処理可能です。",
      },
      {
        q: "企業の機密文書や法的な契約書も安心して処理できますか？",
        a: "はい、極めて安全です。クラウドサーバーにデータが記録されたりログが残ることがないため、社内セキュリティ基準、GDPR、個人情報保護法によりクラウド送信が制限されている秘密保持契約書（NDA）や財務資料も安全に取り扱えます。",
      },
      {
        q: "AI背景削除（切り抜き）はサーバーなしでどうやって動くのですか？",
        a: "desktools.runはWebAssembly（Wasm）とONNXランタイムを用いて、軽量化されたAI推論モデルを初回のみブラウザにダウンロード・キャッシュします。その後はお使いの端末のCPUやWebGLグラフィックアクセラレーションを活用して端末内部で直接AI推論を行います。",
      },
      {
        q: "スマートフォン（iPhone SafariやAndroid Chrome）でも使えますか？",
        a: "はい、完全対応しています。最新のモバイルWeb標準とタッチUIに最適化されており、専用アプリをインストールすることなく、スマホやタブレットのブラウザ上ですぐに高機能ツールをご利用いただけます。",
      },
      {
        q: "本当にずっと無料で利用できますか？",
        a: "はい、全ツールが完全無料です。煩わしい会員登録、クレジットカード登録、透かし（ウォーターマーク）の追加、有料プランへの強制誘導などは一切ありません。いつでも手軽にブックマークしてご利用ください。",
      },
    ],
  },

  es: {
    badge: "Preguntas Frecuentes",
    title: "¿Preguntas Sobre la Privacidad en el Navegador y la Arquitectura?",
    subtitle:
      "Descubra cómo nuestra filosofía de cero servidores protege sus datos, elimina retrasos y garantiza una transparencia absoluta.",
    faqs: [
      {
        q: "¿Realmente nunca se envían ni almacenan mis archivos en servidores remotos?",
        a: "Sí, verificado al 100%. Puede abrir las Herramientas de Desarrollo de su navegador (F12) en la pestaña Network para comprobar que no sale ningún byte de datos. Todo el procesamiento se realiza en la memoria local mediante WebAssembly y JavaScript.",
      },
      {
        q: "¿Existe un límite de tamaño de archivo o de usos por día?",
        a: "No existe ninguna restricción artificial. Al no consumir recursos en servidores remotos, no imponemos cuotas diarias ni límites de megabytes. Puede procesar archivos tan grandes como la memoria RAM de su dispositivo permita.",
      },
      {
        q: "¿Es seguro desktools.run para documentos comerciales confidenciales y contratos?",
        a: "Absolutamente. Dado que los datos nunca se envían a servidores de terceros, cumple plenamente con las políticas corporativas de ciberseguridad más estrictas, acuerdos de confidencialidad (NDA) y la normativa europea RGPD.",
      },
      {
        q: "¿Cómo funciona el borrador de fondos con IA sin servidores en la nube?",
        a: "Utilizamos WebAssembly y el entorno de ejecución ONNX para descargar una vez el modelo de IA en la caché de su navegador. La inferencia visual se ejecuta directamente en su hardware mediante aceleración CPU y WebGL local.",
      },
      {
        q: "¿Puedo usar desktools.run en teléfonos móviles (iPhone y Android)?",
        a: "Sí, es totalmente compatible y receptivo en navegadores móviles como Safari en iOS y Chrome en Android, sin necesidad de instalar ninguna aplicación de tiendas externas.",
      },
      {
        q: "¿desktools.run es verdaderamente 100% gratuito sin pagos ocultos?",
        a: "Sí, totalmente gratuito para siempre. Sin registros obligatorios, suscripciones, marcas de agua ni muros de pago. Guárdelo en sus marcadores y úselo cuando lo necesite.",
      },
    ],
  },

  zh: {
    badge: "常见问题解答",
    title: "关于纯前端浏览器本地处理与安全架构的疑问",
    subtitle:
      "了解 desktools.run 的零服务器安全哲学，探索我们如何彻底保护您的隐私，消除网络延迟并确保透明运行。",
    faqs: [
      {
        q: "上传的文件真的完全不会传输或保存到远程服务器吗？",
        a: "是的，绝对100%真实。您可以随时在浏览器中按下F12打开“网络 (Network)”面板进行全流程抓包验证：在合并PDF或压缩图片时，没有任何文件载荷发往外部。所有操作纯粹在您本地浏览器的JavaScript与WebAssembly沙箱内存中独立完成。",
      },
      {
        q: "每天的处理次数或单个文件大小有上限限制吗？",
        a: "没有任何人为限制。由于 desktools.run 依赖您本地的设备算力而非云端服务器带宽，因此不存在单日配额、文件大小断崖限制（如常见10MB门槛）或排队限速。只要您计算机或手机的可用内存（RAM）足够，数百兆文件亦可自由处理。",
      },
      {
        q: "用于企业商业机密合同或敏感法律凭证是否足够安全合规？",
        a: "非常安全，其安全性远优于传统云端SaaS工具。因数据完全不经过第三方云服务器，不留存任何日志，完全满足严苛的企业信息安全规范、商业保密协议（NDA）及个人信息保护法（GDPR）的合规要求。",
      },
      {
        q: "AI一键抠图背景移除在没有云端显卡服务器的情况下是如何运行的？",
        a: "desktools.run 基于 WebAssembly (Wasm) 与 ONNX 浏览器推理运行时，仅在首次使用时将精简版神经网络模型下载并缓存在浏览器中。随后，所有的图像特征分割运算直接调用您本机的CPU或WebGL图形加速就地推理，图片绝不外传。",
      },
      {
        q: "在手机移动端（iPhone Safari / Android Chrome）上可以使用吗？",
        a: "完全支持。所有工具均基于现代移动端Web标准与响应式触控界面开发，无需前往应用商店下载安装任何App，直接在移动端浏览器中即可享受桌面级的强悍工具体验。",
      },
      {
        q: "desktools.run 真的永久100%免费且无隐藏收费吗？",
        a: "是的，所有工具完全免费。绝无繁琐注册、绑定信用卡、强制打水印或引导购买高级版套路。欢迎添加至书签收藏，随时高效开工。",
      },
    ],
  },

  fr: {
    badge: "Foire Aux Questions",
    title: "Des Questions sur la Confidentialité Locale et l'Architecture ?",
    subtitle:
      "Découvrez comment notre principe de zéro serveur protège vos fichiers, élimine la latence et offre une transparence technique totale.",
    faqs: [
      {
        q: "Mes fichiers ne sont-ils vraiment jamais envoyés sur des serveurs distants ?",
        a: "Oui, vérifiable à 100%. Vous pouvez ouvrir les Outils de Développement de votre navigateur (F12) dans l'onglet Réseau pour constater qu'aucune donnée de fichier ne quitte votre machine. Toutes les opérations s'exécutent dans la mémoire locale de votre navigateur via WebAssembly et JavaScript.",
      },
      {
        q: "Y a-t-il une limite de taille de fichier ou un quota quotidien ?",
        a: "Aucune limite artificielle. Comme les calculs ne sollicitent pas de serveurs distants, il n'y a pas de plafond de 10 Mo ni de quota journalier. Vous pouvez traiter autant de fichiers volumineux que la mémoire vive (RAM) de votre appareil le permet.",
      },
      {
        q: "Puis-je traiter des contrats juridiques confidentiels en toute sécurité ?",
        a: "Absolument. Vos documents ne transitant jamais sur un serveur tiers et ne générant aucun journal distant, desktools.run respecte les normes d'entreprise les plus strictes, les accords de confidentialité (NDA) et le RGPD.",
      },
      {
        q: "Comment le détourage d'image par IA fonctionne-t-il sans serveur distant ?",
        a: "Nous utilisons WebAssembly et l'environnement d'exécution ONNX pour télécharger et mettre en cache le modèle d'IA une seule fois dans votre navigateur. L'analyse s'effectue ensuite directement sur votre matériel grâce à l'accélération CPU/WebGL locale.",
      },
      {
        q: "desktools.run est-il utilisable sur mobile (iPhone Safari et Android Chrome) ?",
        a: "Oui, notre interface est entièrement responsive et optimisée pour le tactile sur tous les navigateurs mobiles modernes, sans téléchargement d'application sur les stores.",
      },
      {
        q: "desktools.run est-il réellement 100% gratuit sans frais cachés ?",
        a: "Oui, totalement gratuit et sans engagement. Pas d'inscription, pas de carte bancaire, pas de filigrane imposé ni d'abonnement payant. Ajoutez-le à vos favoris et utilisez-le en toute liberté.",
      },
    ],
  },
};

export default function HomeFaqSection() {
  const { locale } = useLocale();
  const c = CONTENT[locale] || CONTENT.en;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <section
      style={{
        backgroundColor: "var(--colors-canvas)",
        padding: "64px 24px 80px",
      }}
      aria-labelledby="faq-section-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />

      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "100px",
              background: "rgba(251, 191, 36, 0.1)",
              border: "1px solid rgba(251, 191, 36, 0.25)",
              color: "#fbbf24",
              fontSize: "12.5px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            <HelpCircle size={15} />
            <span>{c.badge}</span>
          </div>
          <h2
            id="faq-section-heading"
            style={{
              fontSize: "clamp(24px, 3.5vw, 32px)",
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
              fontSize: "15px",
              color: "var(--colors-body)",
              maxWidth: "680px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {c.subtitle}
          </p>
        </div>

        {/* Accordion FAQ List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {c.faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  border: isOpen ? "1px solid var(--colors-primary)" : "1px solid var(--colors-hairline)",
                  transition: "border-color 0.2s ease",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggle(idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "16px",
                  }}
                  aria-expanded={isOpen}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: isOpen ? "var(--colors-primary)" : "var(--colors-ink-strong)",
                      lineHeight: 1.45,
                    }}
                  >
                    {faq.q}
                  </span>
                  <div
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: isOpen ? "var(--colors-primary)" : "var(--colors-mute)",
                      flexShrink: 0,
                    }}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 24px 22px",
                      fontSize: "14.5px",
                      color: "var(--colors-body)",
                      lineHeight: 1.75,
                      borderTop: "1px dashed var(--colors-hairline)",
                      paddingTop: "16px",
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
