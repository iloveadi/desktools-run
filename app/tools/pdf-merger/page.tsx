"use client";

/**
 * app/tools/pdf-merger/page.tsx
 * ─────────────────────────────────────────────────────────────
 * PDF Merger & Combiner Tool for desktools.run
 */

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import {
  FileText,
  Upload,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  Plus,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
  Infinity as InfinityIcon,
  MonitorSmartphone,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

interface PdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export default function PdfMergerPage() {
  const { t } = useLocale();

  const [pdfQueue, setPdfQueue] = useState<PdfItem[]>([]);
  const [outputFilename, setOutputFilename] = useState<string>("merged_document.pdf");
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mergedBlobUrl, setMergedBlobUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse & append PDF files to queue
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const validPdfs = Array.from(files).filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (validPdfs.length === 0) return;

    const newItems: PdfItem[] = [];

    for (const file of validPdfs) {
      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          size: file.size,
          pageCount: pdfDoc.getPageCount(),
        });
      } catch (err) {
        console.error("Error loading PDF:", file.name, err);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          size: file.size,
          pageCount: 1,
        });
      }
    }

    setPdfQueue((prev) => [...prev, ...newItems]);
    setMergedBlobUrl(null);
  }, []);

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Reorder queue
  const moveItem = (index: number, direction: "up" | "down") => {
    const newQueue = [...pdfQueue];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQueue.length) return;

    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIndex];
    newQueue[targetIndex] = temp;
    setPdfQueue(newQueue);
    setMergedBlobUrl(null);
  };

  // Remove item
  const removeItem = (id: string) => {
    setPdfQueue((prev) => prev.filter((item) => item.id !== id));
    setMergedBlobUrl(null);
  };

  // Clear all
  const handleReset = () => {
    setPdfQueue([]);
    setMergedBlobUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Total Summary
  const totalFiles = pdfQueue.length;
  const totalPages = pdfQueue.reduce((sum, item) => sum + item.pageCount, 0);

  // Merge Action
  const handleMerge = async () => {
    if (pdfQueue.length === 0) return;

    setIsMerging(true);
    // Yield to event loop to allow loading UI state to render
    await new Promise((r) => setTimeout(r, 60));

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfQueue) {
        const buffer = await item.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setMergedBlobUrl(url);

      // Trigger automatic browser download
      const name = outputFilename.endsWith(".pdf") ? outputFilename : `${outputFilename}.pdf`;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("PDF Merge Error:", err);
      alert("PDF 병합 중 오류가 발생했습니다.");
    } finally {
      setIsMerging(false);
    }
  };

  // Helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* ── Breadcrumb & Title ──────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 16px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} />
            Back to All Tools
          </Link>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f87171",
                  }}
                >
                  <FileText size={20} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                  {t("pdfMerger.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
                {t("pdfMerger.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                fontSize: "12px",
                color: "#f87171",
                fontWeight: 600,
              }}
            >
              <Sparkles size={12} />
              100% Client-Side PDF Engine
            </div>
          </div>
        </section>

        {/* ── Main Workspace ───────────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {pdfQueue.length === 0 ? (
            /* Upload Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="glass-card"
              style={{
                padding: "64px 32px",
                textAlign: "center",
                cursor: "pointer",
                border: isDragging ? "2px dashed #f87171" : "2px dashed var(--border-subtle)",
                background: isDragging ? "rgba(239,68,68,0.08)" : "var(--glass-bg)",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf, .pdf"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                style={{ display: "none" }}
              />

              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "rgba(239,68,68,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f87171",
                }}
              >
                <Upload size={32} />
              </div>

              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {t("pdfMerger.dropPrompt")}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Select multiple PDF files. Combine unlimited pages 100% locally.
                </p>
              </div>
            </div>
          ) : (
            /* PDF Queue & Controls Workspace */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }} className="workspace-grid">
              {/* Left Column: File List Queue */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {pdfQueue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="glass-card"
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "8px",
                          background: "rgba(239,68,68,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#f87171",
                          flexShrink: 0,
                          fontWeight: 700,
                          fontSize: "13px",
                        }}
                      >
                        {idx + 1}
                      </div>

                      <div style={{ overflow: "hidden" }}>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.name}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", gap: "12px", marginTop: "2px" }}>
                          <span>{item.pageCount} {t("pdfMerger.pages")}</span>
                          <span>•</span>
                          <span>{formatBytes(item.size)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Up / Down / Delete Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <button
                        onClick={() => moveItem(idx, "up")}
                        disabled={idx === 0}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: idx === 0 ? "not-allowed" : "pointer",
                          opacity: idx === 0 ? 0.3 : 1,
                        }}
                        title={t("pdfMerger.moveUp")}
                      >
                        <ArrowUp size={14} />
                      </button>

                      <button
                        onClick={() => moveItem(idx, "down")}
                        disabled={idx === pdfQueue.length - 1}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: idx === pdfQueue.length - 1 ? "not-allowed" : "pointer",
                          opacity: idx === pdfQueue.length - 1 ? 0.3 : 1,
                        }}
                        title={t("pdfMerger.moveDown")}
                      >
                        <ArrowDown size={14} />
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          background: "rgba(239,68,68,0.12)",
                          border: "1px solid rgba(239,68,68,0.25)",
                          color: "#f87171",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        title={t("pdfMerger.remove")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add More Files Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px dashed var(--border-subtle)",
                    color: "var(--text-secondary)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#f87171"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)"; }}
                >
                  <Plus size={16} />
                  {t("pdfMerger.addMore")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="application/pdf, .pdf"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  style={{ display: "none" }}
                />
              </div>

              {/* Right Column: Options & Action Panel */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", height: "fit-content" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Merge Options
                </h3>

                {/* Total Stats Summary Badges */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.15)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>{t("pdfMerger.totalFiles")}</span>
                    <strong style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 800 }}>{totalFiles}</strong>
                  </div>
                  <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.15)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>{t("pdfMerger.totalPages")}</span>
                    <strong style={{ fontSize: "16px", color: "#f87171", fontWeight: 800 }}>{totalPages}</strong>
                  </div>
                </div>

                {/* Output Filename Input */}
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    {t("pdfMerger.filename")}
                  </label>
                  <input
                    type="text"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    placeholder="merged_document.pdf"
                    style={{
                      width: "100%",
                      height: "40px",
                      borderRadius: "8px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                      padding: "0 12px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                    }}
                  />
                </div>

                {/* Actions Bar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    onClick={handleMerge}
                    disabled={isMerging || totalFiles === 0}
                    style={{
                      height: "46px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #ef4444, #f43f5e)",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "14.5px",
                      cursor: isMerging || totalFiles === 0 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
                      opacity: isMerging || totalFiles === 0 ? 0.6 : 1,
                    }}
                  >
                    <Download size={17} />
                    {isMerging ? t("pdfMerger.merging") : t("pdfMerger.mergeBtn")}
                  </button>

                  <button
                    onClick={handleReset}
                    style={{
                      height: "40px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <RotateCcw size={14} />
                    {t("pdfMerger.reset")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────────── */}
        <ToolGuide
          badgeText={t("pdfMerger.guide.badge") || "100% Free & Local Processing"}
          aboutTitle={t("pdfMerger.guide.aboutTitle") || "PDF 합치기 도구란 무엇인가요?"}
          aboutDesc={t("pdfMerger.guide.aboutDesc") || "서버 업로드 걱정 없이 사용자의 웹 브라우저 메모리 내에서 여러 PDF 파일을 원하는 순서대로 안전하게 하나로 합쳐주는 100% 로컬 무료 유틸리티입니다."}
          howTitle={t("pdfMerger.guide.howTitle") || "PDF 병합 방법"}
          steps={[
            t("pdfMerger.guide.step1") || "합치고자 하는 여러 개의 PDF 파일을 드래그하거나 파일 선택을 통해 업로드합니다.",
            t("pdfMerger.guide.step2") || "목록에서 위(▲) 및 아래(▼) 버튼을 눌러 원하는 PDF 결합 순서로 정렬합니다.",
            t("pdfMerger.guide.step3") || "저장할 파일명을 입력한 후 'PDF 병합하기' 버튼을 눌러 즉시 다운로드합니다.",
          ]}
          featuresTitle={t("pdfMerger.guide.featuresTitle") || "PDF 합치기 핵심 강점 & 특징"}
          features={[
            {
              icon: <ShieldCheck size={16} />,
              title: t("pdfMerger.guide.feat1Title") || "100% 프라이빗 로컬 연산",
              desc: t("pdfMerger.guide.feat1Desc") || "파일이 외부 서버로 전송되지 않고 브라우저(pdf-lib) 메모리에서 즉시 처리되어 회사 대외비 문서나 개인정보도 안전합니다.",
            },
            {
              icon: <Zap size={16} />,
              title: t("pdfMerger.guide.feat2Title") || "무손실(Lossless) 벡터 & 텍스트 보존",
              desc: t("pdfMerger.guide.feat2Desc") || "단순 이미지 캡처가 아닌 순수 PDF 객체 구조를 병합하여 텍스트 검색, 폰트, 벡터 그래픽 및 하이퍼링크가 원본 그대로 유지됩니다.",
            },
            {
              icon: <InfinityIcon size={16} />,
              title: t("pdfMerger.guide.feat3Title") || "용량 & 파일 개수 무제한",
              desc: t("pdfMerger.guide.feat3Desc") || "일일 변환 횟수 제한이나 유료 결제 유도 없이, 기기 메모리가 허용하는 한 수십 개의 파일도 무제한 무료로 병합 가능합니다.",
            },
            {
              icon: <MonitorSmartphone size={16} />,
              title: t("pdfMerger.guide.feat4Title") || "모든 기기 & 브라우저 호환",
              desc: t("pdfMerger.guide.feat4Desc") || "별도 프로그램 설치 없이 Windows, Mac, Linux, iPad는 물론 모바일 스마트폰 브라우저에서도 즉시 이용할 수 있습니다.",
            },
          ]}
          useCasesTitle={t("pdfMerger.guide.useCasesTitle") || "대표적인 실무 & 일상 활용 사례"}
          useCases={[
            {
              icon: "💼",
              title: t("pdfMerger.guide.uc1Title") || "비즈니스 제안서 & 보고서 취합",
              desc: t("pdfMerger.guide.uc1Desc") || "부서별로 분할 작성된 기획서, 회의록, 견적서, 계약서 부속 문서를 하나의 완성된 보고서로 깔끔하게 정리.",
            },
            {
              icon: "🎓",
              title: t("pdfMerger.guide.uc2Title") || "이력서 · 포트폴리오 · 자격증 제출",
              desc: t("pdfMerger.guide.uc2Desc") || "취업/이직 또는 공공기관 제출 시 이력서, 자기소개서, 증명서 스캔본, 포트폴리오를 단일 제출용 PDF로 묶음.",
            },
            {
              icon: "📚",
              title: t("pdfMerger.guide.uc3Title") || "강의 자료 · 논문 · E-Book 통합",
              desc: t("pdfMerger.guide.uc3Desc") || "주차별로 나뉜 강의 슬라이드, 학술 논문, 전자책 챕터 PDF들을 한 권의 파일로 편리하게 정리하여 보관.",
            },
            {
              icon: "🧾",
              title: t("pdfMerger.guide.uc4Title") || "전자세금계산서 & 영수증 증빙",
              desc: t("pdfMerger.guide.uc4Desc") || "월별/분기별 발급된 전자 세금계산서와 비용 지출 결의용 증빙 PDF들을 일자순으로 정렬하여 회계 제출용 문서 생성.",
            },
          ]}
          proTips={{
            title: t("pdfMerger.guide.tipsTitle") || "PDF 병합 시 유용한 전문가 꿀팁",
            tips: [
              t("pdfMerger.guide.tip1") || "암호화(보안) 걸린 PDF는 사전에 'PDF 잠금 해제' 도구에서 암호를 해제한 후 업로드하시면 안전하게 병합됩니다.",
              t("pdfMerger.guide.tip2") || "A4, Letter, A3 등 서로 다른 용지 규격이나 가로/세로 방향이 섞여 있어도 각 페이지 고유의 형태를 유지한 채 합쳐집니다.",
              t("pdfMerger.guide.tip3") || "파일 카드 오른쪽의 위(▲)/아래(▼) 화살표를 통해 표지, 목차, 본문 순서를 꼼꼼히 확인한 후 병합 버튼을 누르세요.",
            ],
          }}
          faqs={[
            {
              q: t("pdfMerger.guide.faq1Q") || "업로드한 PDF 문서가 외부 서버로 전송되거나 저장되나요?",
              a: t("pdfMerger.guide.faq1A") || "아닙니다. desktools.run의 모든 PDF 처리는 WebAssembly 및 pdf-lib 엔진을 통해 사용자의 웹 브라우저 메모리 내에서 100% 로컬로 안전하게 진행되며 탭을 닫으면 즉시 삭제됩니다.",
            },
            {
              q: t("pdfMerger.guide.faq2Q") || "합쳐진 PDF에서도 텍스트 검색(OCR) 및 복사가 유지되나요?",
              a: t("pdfMerger.guide.faq2A") || "네, 이미지를 캡처하는 방식이 아닌 PDF 내부 객체 트리를 손실 없이 복사하므로 텍스트 선택, 검색, 폰트, 하이퍼링크가 원본 그대로 유지됩니다.",
            },
            {
              q: t("pdfMerger.guide.faq3Q") || "합칠 수 있는 PDF 파일 수나 페이지 수에 제한이 있나요?",
              a: t("pdfMerger.guide.faq3A") || "인위적인 개수나 용량 제한은 전혀 없습니다. 사용 중인 PC나 스마트폰 기기의 브라우저 RAM 메모리가 허용하는 한 수십 개의 파일도 병합 가능합니다.",
            },
            {
              q: t("pdfMerger.guide.faq4Q") || "서로 다른 크기(A4, Letter)나 가로/세로 방향이 섞여 있어도 되나요?",
              a: t("pdfMerger.guide.faq4A") || "네, 가능합니다. 각 PDF 페이지의 고유 해상도와 회전 각도(Orientation)를 손상 없이 그대로 유지하여 하나의 문서로 자연스럽게 결합됩니다.",
            },
            {
              q: t("pdfMerger.guide.faq5Q") || "파일 병합 전 순서를 어떻게 바꿀 수 있나요?",
              a: t("pdfMerger.guide.faq5A") || "파일을 추가한 뒤 목록에 표시된 각 파일 카드의 위(▲) 및 아래(▼) 이동 버튼을 누르면 원하는 결합 순서로 자유롭게 재배치할 수 있습니다.",
            },
            {
              q: t("pdfMerger.guide.faq6Q") || "모바일 스마트폰이나 태블릿에서도 사용 가능한가요?",
              a: t("pdfMerger.guide.faq6A") || "네! 별도 앱 설치 없이 Chrome, Safari, Samsung Internet 등 모든 모바일 브라우저에서 동일한 속도로 안전하게 작동합니다.",
            },
          ]}
        />
      </main>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .workspace-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
