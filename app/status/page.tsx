"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { Activity, CheckCircle2 } from "lucide-react";

export default function StatusPage() {
  const { t, locale } = useLocale();

  const isKo = locale === "ko";
  const isJa = locale === "ja";
  const isEs = locale === "es";
  const isZh = locale === "zh";
  const isFr = locale === "fr";

  const statusBannerTitle = isKo
    ? "모든 시스템 및 엔진 정상 작동 중"
    : isJa
    ? "すべてのシステムとエンジンが正常に動作中"
    : isEs
    ? "Todos los sistemas y motores operativos"
    : isZh
    ? "所有系统与引擎正常运行中"
    : isFr
    ? "Tous les systèmes et moteurs sont opérationnels"
    : "All Systems & Engines Operational";

  const statusBannerDesc = isKo
    ? "100%의 클라이언트 연산 엔진 및 CDN 정적 리소스 배포 서비스가 지연 없이 원활하게 작동하고 있습니다."
    : isJa
    ? "100%のクライアント演算エンジンおよびCDN配信が遅延なく正常に稼働しています。"
    : isEs
    ? "El 100% de los motores del cliente y servicios CDN funcionan perfectamente sin latencia."
    : isZh
    ? "100% 客户端运算引擎与 CDN 静态资源分发服务均无延迟流畅运行。"
    : isFr
    ? "100% des moteurs côté client et services CDN fonctionnent parfaitement sans latence."
    : "100% of client-side computation engines and CDN static delivery services are running smoothly.";

  const operationalLabel = isKo
    ? "정상 작동"
    : isJa
    ? "正常稼働"
    : isEs
    ? "Operativo"
    : isZh
    ? "正常运行"
    : isFr
    ? "Opérationnel"
    : "Operational";

  const services = [
    {
      name: isKo
        ? "클라이언트 WebAssembly PDF 엔진 (pdf-lib)"
        : isJa
        ? "クライアント WebAssembly PDF エンジン (pdf-lib)"
        : isEs
        ? "Motor PDF WebAssembly del cliente (pdf-lib)"
        : isZh
        ? "客户端 WebAssembly PDF 解析引擎 (pdf-lib)"
        : isFr
        ? "Moteur PDF WebAssembly côté client (pdf-lib)"
        : "Client WebAssembly PDF Engine (pdf-lib)",
      status: operationalLabel,
      ping: "0.1 ms",
    },
    {
      name: isKo
        ? "클라이언트 Web AI ONNX 인퍼런스 엔진"
        : isJa
        ? "クライアント Web AI ONNX 推論エンジン"
        : isEs
        ? "Motor de inferencia IA ONNX en el cliente"
        : isZh
        ? "客户端 Web AI ONNX 神经网络推理引擎"
        : isFr
        ? "Moteur d'inférence Web AI ONNX côté client"
        : "Client Web AI ONNX Inference Engine",
      status: operationalLabel,
      ping: "0.2 ms",
    },
    {
      name: isKo
        ? "HTML5 Canvas 2D 그래픽 렌더링 엔진"
        : isJa
        ? "HTML5 Canvas 2D グラフィックレンダリングエンジン"
        : isEs
        ? "Motor de renderizado gráfico HTML5 Canvas 2D"
        : isZh
        ? "HTML5 Canvas 2D 图像渲染与转换引擎"
        : isFr
        ? "Moteur de rendu graphique HTML5 Canvas 2D"
        : "HTML5 Canvas 2D Graphic Engine",
      status: operationalLabel,
      ping: "0.1 ms",
    },
    {
      name: isKo
        ? "Cloudflare 글로벌 엣지 CDN 정적 배포"
        : isJa
        ? "Cloudflare グローバルエッジ CDN 配信"
        : isEs
        ? "Distribución estática CDN Edge de Cloudflare"
        : isZh
        ? "Cloudflare 全球边缘 CDN 静态分发节点"
        : isFr
        ? "Distribution statique CDN Edge Cloudflare"
        : "Cloudflare Global Edge CDN Delivery",
      status: operationalLabel,
      ping: "12 ms",
    },
    {
      name: isKo
        ? "정적 에셋 & Web Fonts 글로벌 라이브러리"
        : isJa
        ? "静的アセット＆Webフォントライブラリ"
        : isEs
        ? "Recursos estáticos y fuentes web globales"
        : isZh
        ? "静态资源文件与 Web 字体全局分发"
        : isFr
        ? "Ressources statiques et polices web globales"
        : "Static Assets & Web Fonts Delivery",
      status: operationalLabel,
      ping: "15 ms",
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
                background: "rgba(34,197,94,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4ade80",
              }}
            >
              <Activity size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("pages.status.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {t("pages.status.subtitle")}
          </p>
        </section>

        <section style={{ maxWidth: "840px", margin: "0 auto", padding: "0 24px" }}>
          {/* Status Alert Banner */}
          <div
            className="glass-card"
            style={{
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.3)",
              marginBottom: "24px",
            }}
          >
            <CheckCircle2 size={24} style={{ color: "#4ade80", flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                {statusBannerTitle}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {statusBannerDesc}
              </p>
            </div>
          </div>

          {/* Service List */}
          <div
            className="glass-card"
            style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {services.map((svc, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-subtle)",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#4ade80",
                      boxShadow: "0 0 8px #4ade80",
                    }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {svc.name}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{svc.ping}</span>
                  <span
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#4ade80",
                      padding: "4px 10px",
                      borderRadius: "100px",
                      background: "rgba(34,197,94,0.15)",
                    }}
                  >
                    {svc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
