"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";
import { Lightbulb, Send, CheckCircle2 } from "lucide-react";

export const REQUESTS_STORAGE_KEY = "desktools_tool_requests_v1";

export interface StoredRequest {
  id: string;
  toolTitle: string;
  category: string;
  description: string;
  contact: string;
  createdAt: string;
  status: "Pending" | "In Review" | "Planned" | "Completed";
}

export function saveLocalRequests(requests: StoredRequest[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error("Failed to save local requests", e);
  }
}

export function getLocalRequests(): StoredRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse local requests", e);
  }

  const initialList: StoredRequest[] = [
    {
      id: "req-1724500000000",
      toolTitle: "SVG to PNG Converter",
      category: "Image Tools",
      description: "Convert vector SVG graphics into high-resolution transparent PNG images directly in browser without server upload.",
      contact: "",
      createdAt: "2026-08-24T21:00:00.000Z",
      status: "In Review",
    },
    {
      id: "req-1724501000000",
      toolTitle: "CSV Column Filter & Reorder",
      category: "Converter",
      description: "Upload a CSV file, select specific columns to keep or remove, reorder columns, and export to new CSV.",
      contact: "",
      createdAt: "2026-08-24T21:15:00.000Z",
      status: "Planned",
    },
  ];
  saveLocalRequests(initialList);
  return initialList;
}

export default function RequestToolPage() {
  const { locale } = useLocale();

  const isKo = locale === "ko";
  const isJa = locale === "ja";
  const isEs = locale === "es";
  const isZh = locale === "zh";
  const isFr = locale === "fr";

  const defaultCategory = isKo
    ? "PDF 도구"
    : isJa
    ? "PDFツール"
    : isEs
    ? "Herramientas PDF"
    : isZh
    ? "PDF 工具"
    : isFr
    ? "Outils PDF"
    : "PDF Tools";

  const [toolTitle, setToolTitle] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const labels = {
    title: isKo
      ? "신규 도구 요청하기"
      : isJa
      ? "新規ツールリクエスト"
      : isEs
      ? "Solicitar nueva herramienta"
      : isZh
      ? "提交新工具需求"
      : isFr
      ? "Demander un nouvel outil"
      : "Request a New Tool",

    subtitle: isKo
      ? "desktools.run에 필요한 유틸리티 도구를 제안해 주세요. 개발팀이 검토 후 빠르게 반영합니다."
      : isJa
      ? "desktools.runに必要なユーティリティツールをご提案ください。開発チームが迅速に検討します。"
      : isEs
      ? "Sugiera nuevas herramientas para desktools.run. Nuestro equipo las revisará rápidamente."
      : isZh
      ? "请向 desktools.run 提出您需要的实用工具建议，开发团队将快速评估并上线。"
      : isFr
      ? "Suggérez de nouveaux outils pour desktools.run. Notre équipe les examinera rapidement."
      : "Suggest new utility tools for desktools.run. Our dev team will review and build them.",

    nameLabel: isKo
      ? "도구 이름 / 핵심 컨셉 *"
      : isJa
      ? "ツール名 / コンセプト *"
      : isEs
      ? "Nombre de la herramienta / Concepto *"
      : isZh
      ? "工具名称 / 核心概念 *"
      : isFr
      ? "Nom de l'outil / Concept *"
      : "Tool Name / Concept *",

    namePlaceholder: isKo
      ? "예: SVG PNG 변환기, CSV 특정 열 추출기"
      : isJa
      ? "例: SVG PNG 変換, CSV 列抽出"
      : isEs
      ? "ej: Convertidor SVG a PNG, Filtro de columnas CSV"
      : isZh
      ? "例如：SVG 转 PNG 转换器、CSV 列筛选器"
      : isFr
      ? "ex: Convertisseur SVG en PNG, Filtre de colonnes CSV"
      : "e.g. SVG to PNG Converter, CSV Column Filter",

    catLabel: isKo
      ? "도구 카테고리"
      : isJa
      ? "ツールカテゴリー"
      : isEs
      ? "Categoría de herramienta"
      : isZh
      ? "工具分类"
      : isFr
      ? "Catégorie d'outil"
      : "Tool Category",

    descLabel: isKo
      ? "상세 기능 및 사용 목적 *"
      : isJa
      ? "詳細機能および利用目的 *"
      : isEs
      ? "Funciones detalladas y propósito *"
      : isZh
      ? "详细功能与使用目的 *"
      : isFr
      ? "Fonctionnalités détaillées et objectif *"
      : "Detailed Features & Purpose *",

    descPlaceholder: isKo
      ? "필요한 기능, 입출력 포맷, 구체적인 작동 방식 등을 자유롭게 적어주세요..."
      : isJa
      ? "必要な機能、入出力フォーマット、具体な動作方式などを自由にご記入ください..."
      : isEs
      ? "Describa las funciones necesarias, formatos de entrada/salida y forma de uso..."
      : isZh
      ? "请自由填写所需功能、输入/输出格式以及具体的使用场景..."
      : isFr
      ? "Décrivez les fonctionnalités requises, les formats d'entrée/sortie et le fonctionnement..."
      : "Describe how this tool should work, input/output formats, and your use case...",

    submitBtn: isKo
      ? "도구 요청 제출하기"
      : isJa
      ? "リクエストを送信する"
      : isEs
      ? "Enviar solicitud"
      : isZh
      ? "提交工具需求"
      : isFr
      ? "Soumettre la demande"
      : "Submit Tool Request",

    submitting: isKo
      ? "요청 등록 중..."
      : isJa
      ? "送信中..."
      : isEs
      ? "Enviando..."
      : isZh
      ? "提交中..."
      : isFr
      ? "Envoi en cours..."
      : "Submitting...",

    successTitle: isKo
      ? "소중한 제안이 접수되었습니다!"
      : isJa
      ? "リクエストが受付されました！"
      : isEs
      ? "¡Solicitud recibida con éxito!"
      : isZh
      ? "感谢您的建议，需求已成功接收！"
      : isFr
      ? "Demande reçue avec succès !"
      : "Thank you for your suggestion!",

    successDesc: isKo
      ? "제안해주신 도구 요청이 등록되었습니다. 관리자가 빠르게 검토하겠습니다."
      : isJa
      ? "ご提案いただいたツールリクエストが登録されました。開発チームが迅速に確認します。"
      : isEs
      ? "Su solicitud de herramienta ha sido registrada y será revisada pronto."
      : isZh
      ? "您建议的工具需求已成功记录，开发团队将尽快评估。"
      : isFr
      ? "Votre demande d'outil a été enregistrée et sera bientôt examinée."
      : "Your tool request has been recorded. Our development team will review it.",

    submitAnother: isKo
      ? "다른 도구 추가 요청하기"
      : isJa
      ? "別のリクエストを送信"
      : isEs
      ? "Enviar otra solicitud"
      : isZh
      ? "提交其他工具需求"
      : isFr
      ? "Soumettre une autre demande"
      : "Submit Another Request",

    validationAlert: isKo
      ? "도구 이름과 상세 내용을 작성해 주세요."
      : isJa
      ? "ツール名と詳細内容を入力してください。"
      : isEs
      ? "Por favor complete el nombre y la descripción de la herramienta."
      : isZh
      ? "请填写工具名称和详细描述。"
      : isFr
      ? "Veuillez remplir le nom et la description de l'outil."
      : "Please fill in tool name and description.",
  };

  const categories = isKo
    ? [
        "PDF 도구",
        "이미지 도구",
        "개발자 도구",
        "변환기",
        "텍스트 도구",
        "보안 도구",
        "기타",
      ]
    : isJa
    ? [
        "PDFツール",
        "画像ツール",
        "開発者ツール",
        "変換ツール",
        "テキストツール",
        "セキュリティ",
        "その他",
      ]
    : isEs
    ? [
        "Herramientas PDF",
        "Herramientas de Imagen",
        "Herramientas de Dev",
        "Convertidor",
        "Herramientas de Texto",
        "Seguridad",
        "Otros",
      ]
    : isZh
    ? [
        "PDF 工具",
        "图像工具",
        "开发者工具",
        "转换器",
        "文本工具",
        "安全工具",
        "其他",
      ]
    : isFr
    ? [
        "Outils PDF",
        "Outils d'image",
        "Outils dev",
        "Convertisseur",
        "Outils texte",
        "Sécurité",
        "Autre",
      ]
    : [
        "PDF Tools",
        "Image Tools",
        "Dev Tools",
        "Converter",
        "Text Tools",
        "Security",
        "Other",
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolTitle.trim() || !description.trim()) {
      alert(labels.validationAlert);
      return;
    }

    setIsSubmitting(true);

    const newReq: StoredRequest = {
      id: `req-${Date.now()}`,
      toolTitle: toolTitle.trim(),
      category: category || categories[0],
      description: description.trim(),
      contact: "",
      createdAt: new Date().toISOString(),
      status: "Pending",
    };

    // Save locally
    const existing = getLocalRequests();
    existing.unshift(newReq);
    saveLocalRequests(existing);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 300);
  };

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        <section style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 20px" }}>
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
              <Lightbulb size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {labels.title}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
            {labels.subtitle}
          </p>
        </section>

        <section style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
          {isSubmitted ? (
            <div
              className="glass-card"
              style={{
                padding: "40px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <CheckCircle2 size={48} style={{ color: "#818cf8" }} />
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                  {labels.successTitle}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {labels.successDesc}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setToolTitle("");
                  setDescription("");
                }}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                {labels.submitAnother}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="glass-card"
              style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {labels.nameLabel}
                </label>
                <input
                  type="text"
                  placeholder={labels.namePlaceholder}
                  value={toolTitle}
                  onChange={(e) => setToolTitle(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "8px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    padding: "0 14px",
                    fontSize: "14px",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {labels.catLabel}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "8px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    padding: "0 14px",
                    fontSize: "14px",
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {labels.descLabel}
                </label>
                <textarea
                  rows={5}
                  placeholder={labels.descPlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    padding: "12px 14px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    lineHeight: "1.6",
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: isSubmitting ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                <Send size={16} />
                {isSubmitting ? labels.submitting : labels.submitBtn}
              </button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
