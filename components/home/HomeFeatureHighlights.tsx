"use client";

import React from "react";
import { ShieldCheck, Cpu, ServerOff, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";
import { Locale } from "@/lib/i18n";

interface FeatureContent {
  badge: string;
  title: string;
  subtitle: string;
  cloudBadge: string;
  cloudTitle: string;
  cloudPoints: { title: string; desc: string }[];
  deskBadge: string;
  deskTitle: string;
  deskPoints: { title: string; desc: string }[];
  pillars: { title: string; desc: string }[];
}

const CONTENT: Record<Locale, FeatureContent> = {
  ko: {
    badge: "보안 & 프라이버시 아키텍처",
    title: "서버 전송 0바이트: 100% 브라우저 메모리 격리 실행",
    subtitle:
      "기존 온라인 변환 도구들은 소중한 파일과 토큰을 원격 서버로 전송합니다. desktools.run은 WebAssembly와 브라우저 네이티브 API를 활용하여 사용자의 기기 내부에서만 모든 작업을 완결합니다.",
    cloudBadge: "기존 클라우드 변환 사이트의 방식",
    cloudTitle: "원격 서버 업로드 기반 처리",
    cloudPoints: [
      {
        title: "데이터 유출 위험",
        desc: "계약서, 금융 서류, 개인 사진이 외부 데이터센터 서버에 임시 저장 및 캐싱됩니다.",
      },
      {
        title: "네트워크 지연 및 대기열",
        desc: "업로드 시간 + 서버 대기열 대기 + 변환 후 다시 다운로드하는 3단계 지연이 발생합니다.",
      },
      {
        title: "파일 용량 제한 및 결제 유도",
        desc: "서버 트래픽 비용 때문에 파일당 10MB 제한을 걸고 유료 회원가입을 유도합니다.",
      },
    ],
    deskBadge: "desktools.run 브라우저 엔진",
    deskTitle: "100% 클라이언트 로컬 샌드박스",
    deskPoints: [
      {
        title: "서버 전송 0바이트 보증",
        desc: "브라우저 메모리 안에서 JavaScript 및 Wasm 엔진으로 실행되어 외부 네트워크 유출이 물리적으로 불가능합니다.",
      },
      {
        title: "초고속 무지연 즉시 연산",
        desc: "내 컴퓨터의 CPU/GPU 자원을 직접 활용하므로 업로드 대기 없이 실시간으로 변환 결과가 출력됩니다.",
      },
      {
        title: "용량 무제한 & 평생 무료",
        desc: "기기 RAM이 허용하는 한 수백 MB 문서도 제한 없이 무료로 처리할 수 있으며 가입 절차가 없습니다.",
      },
    ],
    pillars: [
      {
        title: "WebAssembly & Canvas 하드웨어 가속",
        desc: "고성능 Wasm 바이트코드와 HTML5 Canvas 그래픽 파이프라인을 통해 초당 수십 메가바이트의 이미지를 손실 없이 압축하고 변환합니다.",
      },
      {
        title: "완벽한 오프라인 작동 가능성",
        desc: "페이지 로드 후 인터넷 연결이 끊겨도 브라우저에 이미 로드된 스크립트만으로 모든 파일 편집과 디코딩이 완벽하게 동작합니다.",
      },
      {
        title: "기업 규정(Compliance) 및 GDPR 부합",
        desc: "사내 보안 정책상 외부 클라우드 업로드가 금지된 비밀유지 계약서(NDA), 소스코드, 고객 식별 정보가 포함된 민감한 데이터를 안심하고 처리할 수 있습니다.",
      },
    ],
  },

  en: {
    badge: "Security & Zero-Server Architecture",
    title: "Zero Server Uploads: 100% In-Browser Memory Isolation",
    subtitle:
      "Traditional online utilities transmit confidential files and credentials to remote cloud servers. desktools.run executes entirely inside your client browser using WebAssembly and native web APIs.",
    cloudBadge: "Traditional Cloud Web Utilities",
    cloudTitle: "Remote Server-Side Processing",
    cloudPoints: [
      {
        title: "Privacy & Data Leak Risks",
        desc: "Confidential contracts, financial sheets, and photos are uploaded to external cloud data centers.",
      },
      {
        title: "Network Latency & Server Queues",
        desc: "Suffers from upload delays, cloud queue processing wait times, and redundant download bandwidth.",
      },
      {
        title: "Arbitrary Limits & Paywalls",
        desc: "Imposes 10MB file caps and daily conversion quotas to coerce users into paid subscription tiers.",
      },
    ],
    deskBadge: "desktools.run Architecture",
    deskTitle: "100% Client-Side Local Sandbox",
    deskPoints: [
      {
        title: "Zero Server Transmission",
        desc: "Runs purely inside browser memory via JavaScript and Wasm engines; network exfiltration is physically impossible.",
      },
      {
        title: "Zero-Latency Instant Compute",
        desc: "Leverages your device's native CPU/GPU hardware with zero round-trip network transmission time.",
      },
      {
        title: "Unlimited File Sizes & 100% Free",
        desc: "Process files bounded only by your RAM, without sign-ups, subscriptions, or intrusive paywalls.",
      },
    ],
    pillars: [
      {
        title: "WebAssembly & Canvas Acceleration",
        desc: "Compiled high-speed WebAssembly binaries and HTML5 Canvas render pipelines enable fast multi-megabyte image compression and batch format shifts.",
      },
      {
        title: "Zero Backend Footprint",
        desc: "Once loaded, scripts execute locally even if disconnected from the internet, completely eliminating man-in-the-middle network interception risks.",
      },
      {
        title: "Enterprise & GDPR Compliance",
        desc: "Ideal for strict compliance environments where uploading proprietary source code, NDA agreements, or PII to external cloud services is prohibited.",
      },
    ],
  },

  ja: {
    badge: "セキュリティ＆ゼロサーバー設計",
    title: "サーバー送信ゼロ：100%ブラウザメモリ内隔離実行",
    subtitle:
      "一般的なオンライン変換ツールは機密ファイルやトークンを遠隔サーバーに送信します。desktools.runはWebAssemblyとブラウザネイティブAPIを活用し、端末内のみで全処理を完結します。",
    cloudBadge: "一般的なクラウド変換ツールの仕組み",
    cloudTitle: "リモートサーバー依存処理",
    cloudPoints: [
      {
        title: "データ漏洩リスク",
        desc: "契約書や個人写真などの重要データが外部データセンターに一時保存・キャッシュされます。",
      },
      {
        title: "ネットワーク遅延と処理待ち",
        desc: "アップロード待ち、サーバーキュー待ち、再ダウンロードという3重の遅延が発生します。",
      },
      {
        title: "ファイルサイズ制限と課金誘導",
        desc: "サーバー通信費の都合により10MB制限や回数制限を設け、有料プランへ誘導されます。",
      },
    ],
    deskBadge: "desktools.run ブラウザエンジン",
    deskTitle: "100% クライアント完結サンドボックス",
    deskPoints: [
      {
        title: "サーバー送信0バイト保証",
        desc: "ブラウザメモリ内でWasm及びJSエンジンにより動作するため、外部ネットワークへの流出が物理的に発生しません。",
      },
      {
        title: "待機時間ゼロの高速即時処理",
        desc: "お使いの端末のCPU/GPU性能を直接活用し、アップロードのタイムラグなしに即時変換されます。",
      },
      {
        title: "容量無制限＆永久完全無料",
        desc: "端末のメモリ（RAM）が許す限り、大容量ファイルも無制限に処理可能。会員登録も不要です。",
      },
    ],
    pillars: [
      {
        title: "WebAssembly＆Canvas ハードウェア高速化",
        desc: "高速WasmバイナリとCanvasグラフィックAPIにより、大容量画像も無損失で瞬時に圧縮・変換します。",
      },
      {
        title: "完全オフライン動作対応",
        desc: "一度読み込めばオフライン環境でも動作可能。中間者攻撃やパケット傍受リスクを根絶します。",
      },
      {
        title: "企業コンプライアンス＆GDPR準拠",
        desc: "社内規定でクラウド送信が禁止されている機密契約書（NDA）や個人情報も安心して処理できます。",
      },
    ],
  },

  es: {
    badge: "Seguridad y Arquitectura Sin Servidor",
    title: "Cero Cargas al Servidor: Aislamiento 100% en Memoria Local",
    subtitle:
      "Las herramientas web tradicionales envían archivos confidenciales a servidores en la nube. desktools.run ejecuta todo en su navegador mediante WebAssembly y APIs nativas.",
    cloudBadge: "Convertidores en la Nube Tradicionales",
    cloudTitle: "Procesamiento Remoto en el Servidor",
    cloudPoints: [
      {
        title: "Riesgos de Fuga de Datos",
        desc: "Contratos confidenciales y fotos privadas se cargan y almacenan en centros de datos remotos.",
      },
      {
        title: "Latencia de Red y Colas",
        desc: "Demoras provocadas por tiempo de subida, colas en el servidor y descarga redundante.",
      },
      {
        title: "Límites Arbitrarios y Pagos",
        desc: "Restricciones de 10MB y límites diarios diseñados para forzar suscripciones de pago.",
      },
    ],
    deskBadge: "Arquitectura desktools.run",
    deskTitle: "Sandbox 100% en el Navegador",
    deskPoints: [
      {
        title: "Garantía de Cero Envío al Servidor",
        desc: "Se procesa en la memoria del navegador vía JavaScript y Wasm; la fuga de datos es técnicamente imposible.",
      },
      {
        title: "Cálculo Instantáneo Sin Latencia",
        desc: "Aprovecha la CPU/GPU de su propio dispositivo con cero tiempo de retardo en la red.",
      },
      {
        title: "Archivos Ilimitados y 100% Gratis",
        desc: "Procese archivos sin límites artificiales, sin registros, suscripciones ni barreras de pago.",
      },
    ],
    pillars: [
      {
        title: "Aceleración con WebAssembly y Canvas",
        desc: "Binarios Wasm de alto rendimiento y pipelines HTML5 Canvas para optimizar imágenes y documentos velozmente.",
      },
      {
        title: "Capacidad de Funcionamiento Offline",
        desc: "Una vez cargada la página, funciona incluso sin internet, eliminando riesgos de intercepción en la red.",
      },
      {
        title: "Cumplimiento Corporativo y GDPR",
        desc: "Ideal para políticas de seguridad empresarial donde está prohibido subir acuerdos de confidencialidad a la nube.",
      },
    ],
  },

  zh: {
    badge: "安全与零服务器架构",
    title: "零服务器上传：100% 浏览器内存沙箱隔离运行",
    subtitle:
      "传统在线工具往往将您的敏感文档和个人凭据上传至远程云端服务器。desktools.run利用WebAssembly与现代Web原生API，全部计算仅在您的本地设备内部完成。",
    cloudBadge: "传统云端转换网站的处理方式",
    cloudTitle: "依赖远程服务器的后端处理",
    cloudPoints: [
      {
        title: "隐私泄露与数据留存风险",
        desc: "保密合同、财务报表和个人相片被上传并在外部数据中心服务器中临时缓存与记录。",
      },
      {
        title: "网络传输延迟与排队等待",
        desc: "经历上传耗时、云端排队等待与二次下载的三重网络往返延迟。",
      },
      {
        title: "限制文件大小并引导付费",
        desc: "因承担服务器带宽成本，通常设置10MB上限并强制引导用户注册开通付费会员。",
      },
    ],
    deskBadge: "desktools.run 浏览器引擎",
    deskTitle: "100% 纯客户端本地计算沙箱",
    deskPoints: [
      {
        title: "0字节服务器传输绝对保证",
        desc: "完全在浏览器内存中通过JavaScript与Wasm引擎解析运算，物理层面杜绝任何数据外泄。",
      },
      {
        title: "超高速零延迟即时运算",
        desc: "直接调用本地设备的CPU/GPU硬件算力，无需漫长的网络上传等待，毫秒级得出处理结果。",
      },
      {
        title: "容量不受限＆永久完全免费",
        desc: "只要您的设备内存（RAM）充足，几百兆的大文件亦可随心处理，无账户体系与隐形收费。",
      },
    ],
    pillars: [
      {
        title: "WebAssembly 与 Canvas 硬件加速",
        desc: "编译型高性能Wasm字节码与HTML5 Canvas图形流水线，每秒无损压缩与批处理数十兆图像资源。",
      },
      {
        title: "离线独立运行能力",
        desc: "页面加载完毕后，即使断开网络连接亦可稳定运行，从根源上杜绝任何网络抓包与窃听风险。",
      },
      {
        title: "满足企业信息合规与GDPR标准",
        desc: "完美符合严苛的企业合规要求，让严禁上传公有云的商业保密协议（NDA）及敏感数据处理高枕无忧。",
      },
    ],
  },

  fr: {
    badge: "Sécurité & Architecture Zéro Serveur",
    title: "Zéro Envoi Serveur : Isolation 100% en Mémoire Navigateur",
    subtitle:
      "Les convertisseurs en ligne traditionnels envoient vos documents sensibles sur des serveurs distants. desktools.run traite tout en local dans votre navigateur grâce à WebAssembly et aux API natives.",
    cloudBadge: "Fonctionnement des Outils Cloud Classiques",
    cloudTitle: "Traitement Dépendant d'un Serveur Distant",
    cloudPoints: [
      {
        title: "Risques de Fuite de Données",
        desc: "Vos contrats confidentiels et photos personnelles sont téléversés et stockés sur des serveurs distants.",
      },
      {
        title: "Latence Réseau et Files d'Attente",
        desc: "Temps d'envoi, file d'attente serveur et re-téléchargement génèrent des délais importants.",
      },
      {
        title: "Limites de Taille et Incitation au Paiement",
        desc: "Limitation arbitraire à 10 Mo par fichier pour vous forcer à souscrire un abonnement payant.",
      },
    ],
    deskBadge: "Moteur de Navigateur desktools.run",
    deskTitle: "Bac à Sable 100% Local Côté Client",
    deskPoints: [
      {
        title: "Garantie Zéro Envoi de Données",
        desc: "Exécution exclusive dans la mémoire du navigateur via JS et Wasm ; aucune fuite réseau possible.",
      },
      {
        title: "Calcul Immédiat Sans Latence",
        desc: "Exploite directement le processeur et la carte graphique de votre appareil sans délai réseau.",
      },
      {
        title: "Fichiers Illimités et 100% Gratuit",
        desc: "Traitez des fichiers volumineux sans inscription, sans abonnement et sans limite artificielle.",
      },
    ],
    pillars: [
      {
        title: "Accélération WebAssembly et Canvas",
        desc: "Binaire Wasm haute performance et pipeline HTML5 Canvas pour compresser et convertir rapidement vos médias.",
      },
      {
        title: "Fonctionnement Hors-Ligne Possible",
        desc: "Une fois la page ouverte, elle fonctionne même sans connexion Internet, éliminant tout risque d'interception.",
      },
      {
        title: "Conformité Entreprise et RGPD",
        desc: "Idéal pour les entreprises soumises à des règles strictes interdisant l'envoi de contrats NDA vers le cloud.",
      },
    ],
  },
};

export default function HomeFeatureHighlights() {
  const { locale } = useLocale();
  const c = CONTENT[locale] || CONTENT.en;

  return (
    <section
      style={{
        backgroundColor: "var(--colors-canvas-soft)",
        borderTop: "1px solid var(--colors-hairline)",
        borderBottom: "1px solid var(--colors-hairline)",
        padding: "64px 24px",
      }}
      aria-labelledby="architecture-heading"
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
              background: "rgba(0, 217, 146, 0.1)",
              border: "1px solid rgba(0, 217, 146, 0.25)",
              color: "var(--colors-primary)",
              fontSize: "12.5px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            <ShieldCheck size={15} />
            <span>{c.badge}</span>
          </div>
          <h2
            id="architecture-heading"
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

        {/* Architecture Comparison Flow */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {/* Legacy Cloud Way */}
          <div
            className="glass-card"
            style={{
              padding: "32px 28px",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              background: "linear-gradient(180deg, rgba(239, 68, 68, 0.04) 0%, rgba(18, 21, 31, 0.7) 100%)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              <AlertTriangle size={13} />
              <span>{c.cloudBadge}</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--colors-ink-strong)", marginBottom: "14px" }}>
              {c.cloudTitle}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px", color: "var(--colors-body)", lineHeight: 1.6 }}>
              {c.cloudPoints.map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ color: "#f87171", fontWeight: 800 }}>•</span>
                  <div>
                    <strong style={{ color: "var(--colors-ink)" }}>{pt.title}:</strong> {pt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* desktools.run Way */}
          <div
            className="glass-card"
            style={{
              padding: "32px 28px",
              border: "1px solid rgba(0, 217, 146, 0.4)",
              background: "linear-gradient(180deg, rgba(0, 217, 146, 0.06) 0%, rgba(18, 21, 31, 0.7) 100%)",
              boxShadow: "0 8px 32px -8px rgba(0, 217, 146, 0.15)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "rgba(0, 217, 146, 0.15)",
                color: "var(--colors-primary)",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              <CheckCircle2 size={13} />
              <span>{c.deskBadge}</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--colors-ink-strong)", marginBottom: "14px" }}>
              {c.deskTitle}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px", color: "var(--colors-body)", lineHeight: 1.6 }}>
              {c.deskPoints.map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--colors-primary)", fontWeight: 800 }}>✓</span>
                  <div>
                    <strong style={{ color: "var(--colors-ink)" }}>{pt.title}:</strong> {pt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Core Tech Pillars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(0, 217, 146, 0.12)",
                color: "var(--colors-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Cpu size={20} />
            </div>
            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--colors-ink-strong)", margin: 0 }}>
              {c.pillars[0].title}
            </h4>
            <p style={{ fontSize: "13.5px", color: "var(--colors-body)", lineHeight: 1.6, margin: 0 }}>
              {c.pillars[0].desc}
            </p>
          </div>

          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.12)",
                color: "#38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ServerOff size={20} />
            </div>
            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--colors-ink-strong)", margin: 0 }}>
              {c.pillars[1].title}
            </h4>
            <p style={{ fontSize: "13.5px", color: "var(--colors-body)", lineHeight: 1.6, margin: 0 }}>
              {c.pillars[1].desc}
            </p>
          </div>

          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(168, 85, 247, 0.12)",
                color: "#c084fc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={20} />
            </div>
            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--colors-ink-strong)", margin: 0 }}>
              {c.pillars[2].title}
            </h4>
            <p style={{ fontSize: "13.5px", color: "var(--colors-body)", lineHeight: 1.6, margin: 0 }}>
              {c.pillars[2].desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
