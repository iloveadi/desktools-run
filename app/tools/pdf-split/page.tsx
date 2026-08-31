"use client";

/**
 * app/tools/pdf-split/page.tsx
 * ─────────────────────────────────────────────────────────────
 * PDF Splitter Tool for desktools.run
 * 100% Client-Side using pdf-lib & pdfjs-dist (Thumbnail Preview & Page Extraction)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Scissors,
  Upload,
  ArrowLeft,
  Download,
  RotateCcw,
  Sparkles,
  FileCheck2,
  RefreshCw,
  CheckSquare,
  Square,
  Layers,
  Check,
  ShieldCheck,
  Eye,
  Zap,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

type SplitMode = "all" | "range" | "visual";

interface PdfMeta {
  name: string;
  sizeFormatted: string;
  numPages: number;
}

interface PageThumbnail {
  pageNum: number;
  dataUrl: string;
  selected: boolean;
}

export default function PdfSplitPage() {
  const { t } = useLocale();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfMeta, setPdfMeta] = useState<PdfMeta | null>(null);

  const [splitMode, setSplitMode] = useState<SplitMode>("all");
  const [pageRangeStr, setPageRangeStr] = useState<string>("1-3");
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);

  const [resultBlobs, setResultBlobs] = useState<{ name: string; url: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const parsePageRange = (rangeStr: string, totalPages: number): number[] => {
    const indices = new Set<number>();
    const parts = rangeStr.split(",");

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.includes("-")) {
        const [startStr, endStr] = trimmed.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(totalPages, Math.max(start, end));
          for (let p = min; p <= max; p++) {
            indices.add(p - 1); // 0-based
          }
        }
      } else {
        const single = parseInt(trimmed, 10);
        if (!isNaN(single) && single >= 1 && single <= totalPages) {
          indices.add(single - 1); // 0-based
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert(t("pdfSplit.alertValidPdf"));
      return;
    }

    setPdfFile(file);
    setResultBlobs([]);
    setThumbnails([]);
    setProgressPercent(0);
    setStatusMessage("");

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsLoadingThumbs(true);
        const buffer = e.target?.result as ArrayBuffer;

        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdfDoc = await loadingTask.promise;
        const total = pdfDoc.numPages;

        setPdfMeta({
          name: file.name,
          sizeFormatted: formatFileSize(file.size),
          numPages: total,
        });

        // Render page thumbnails (up to 40 pages for speed)
        const thumbs: PageThumbnail[] = [];
        const renderMax = Math.min(total, 50);

        for (let p = 1; p <= renderMax; p++) {
          const page = await pdfDoc.getPage(p);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            await page.render({ canvasContext: ctx, canvas, viewport }).promise;
            thumbs.push({
              pageNum: p,
              dataUrl: canvas.toDataURL("image/jpeg", 0.7),
              selected: true,
            });
          }
        }

        setThumbnails(thumbs);
        setIsLoadingThumbs(false);
      } catch (err) {
        console.error("PDF thumbnail render error:", err);
        setIsLoadingThumbs(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [t]);

  const handleSplitPdf = async () => {
    if (!pdfFile || !pdfMeta) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setStatusMessage(t("pdfSplit.statusReading"));

    try {
      const { PDFDocument } = await import("pdf-lib");
      const buffer = await pdfFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const totalPages = srcDoc.getPageCount();

      const rawName = pdfFile.name.replace(/\.[^/.]+$/, "");
      const generatedBlobs: { name: string; url: string }[] = [];

      if (splitMode === "all") {
        // Split every single page into individual 1-page PDF
        for (let i = 0; i < totalPages; i++) {
          setStatusMessage(
            t("pdfSplit.statusExtractingPage")
              .replace("{current}", String(i + 1))
              .replace("{total}", String(totalPages))
          );
          const pct = Math.round(15 + ((i + 1) / totalPages) * 75);
          setProgressPercent(pct);

          const newDoc = await PDFDocument.create();
          const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
          newDoc.addPage(copiedPage);

          const pdfBytes = await newDoc.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);

          generatedBlobs.push({
            name: `${rawName}_page_${i + 1}.pdf`,
            url,
          });
        }
      } else if (splitMode === "range") {
        // Extract specified page range into a single PDF
        const targetIndices = parsePageRange(pageRangeStr, totalPages);

        if (targetIndices.length === 0) {
          alert(t("pdfSplit.alertValidRange"));
          setIsProcessing(false);
          return;
        }

        setStatusMessage(
          t("pdfSplit.statusExtractingPages").replace("{count}", String(targetIndices.length))
        );
        setProgressPercent(50);

        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(srcDoc, targetIndices);
        copiedPages.forEach((p) => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        generatedBlobs.push({
          name: `${rawName}_extracted.pdf`,
          url,
        });
      } else if (splitMode === "visual") {
        // Extract visually selected thumbnails
        const selectedIndices = thumbnails.filter((t) => t.selected).map((t) => t.pageNum - 1);

        if (selectedIndices.length === 0) {
          alert(t("pdfSplit.alertSelectPage"));
          setIsProcessing(false);
          return;
        }

        setStatusMessage(
          t("pdfSplit.statusExtractingSelected").replace("{count}", String(selectedIndices.length))
        );
        setProgressPercent(50);

        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(srcDoc, selectedIndices);
        copiedPages.forEach((p) => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        generatedBlobs.push({
          name: `${rawName}_selected_pages.pdf`,
          url,
        });
      }

      setResultBlobs(generatedBlobs);
      setProgressPercent(100);
      setIsProcessing(false);
    } catch (err) {
      console.error("PDF Split Error:", err);
      setIsProcessing(false);
      alert(t("pdfSplit.alertError"));
    }
  };

  const toggleSelectThumbnail = (pageNum: number) => {
    setThumbnails((prev) =>
      prev.map((t) => (t.pageNum === pageNum ? { ...t, selected: !t.selected } : t))
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setThumbnails((prev) => prev.map((t) => ({ ...t, selected: select })));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSingle = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfMeta(null);
    setResultBlobs([]);
    setThumbnails([]);
    setProgressPercent(0);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
            {t("pdfSplit.back")}
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
                  <Scissors size={20} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                  {t("pdfSplit.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "620px" }}>
                {t("pdfSplit.subtitle")}
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
              <Sparkles size={14} />
              {t("pdfSplit.badge")}
            </div>
          </div>
        </section>

        {/* ── Main Workspace ─────────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {!pdfFile ? (
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
                accept="application/pdf, .pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
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
                  {t("pdfSplit.dropPrompt")}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {t("pdfSplit.dropDesc")}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* PDF Meta Header Card */}
                <div className="glass-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(239,68,68,0.15)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Scissors size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                        {pdfMeta?.name}
                      </h3>
                      <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
                        <span>{t("pdfSplit.fileSize")}: {pdfMeta?.sizeFormatted}</span>
                        <span>•</span>
                        <span>{t("pdfSplit.totalPages")}: <strong>{pdfMeta?.numPages} {t("pdfSplit.pagesUnit")}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-secondary)",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <RotateCcw size={13} />
                    {t("pdfSplit.changeFile")}
                  </button>
                </div>

                {/* Split Modes & Controls */}
                {splitMode === "visual" && (
                  <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {t("pdfSplit.visualTitle")}
                      </span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => toggleSelectAll(true)}
                          style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#f87171", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                        >
                          {t("pdfSplit.selectAll")}
                        </button>
                        <button
                          onClick={() => toggleSelectAll(false)}
                          style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "none", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                        >
                          {t("pdfSplit.deselectAll")}
                        </button>
                      </div>
                    </div>

                    {isLoadingThumbs ? (
                      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                        {t("pdfSplit.renderingThumbs")}
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "12px", maxHeight: "420px", overflowY: "auto", padding: "4px" }}>
                        {thumbnails.map((tb) => (
                          <div
                            key={tb.pageNum}
                            onClick={() => toggleSelectThumbnail(tb.pageNum)}
                            style={{
                              borderRadius: "8px",
                              border: tb.selected ? "2px solid #f87171" : "1px solid var(--border-subtle)",
                              background: tb.selected ? "rgba(239,68,68,0.1)" : "rgba(0,0,0,0.2)",
                              padding: "6px",
                              cursor: "pointer",
                              position: "relative",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              transition: "all 0.15s",
                            }}
                          >
                            <div style={{ position: "absolute", top: "8px", right: "8px", width: "20px", height: "20px", borderRadius: "50%", background: tb.selected ? "#f87171" : "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                              {tb.selected && <Check size={12} />}
                            </div>

                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={tb.dataUrl}
                              alt={`${t("pdfSplit.pageLabel")} ${tb.pageNum}`}
                              style={{ width: "100%", height: "120px", objectFit: "contain", borderRadius: "4px", marginBottom: "6px" }}
                            />

                            <span style={{ fontSize: "11px", fontWeight: 700, color: tb.selected ? "#f87171" : "var(--text-muted)" }}>
                              {t("pdfSplit.pageLabel")} {tb.pageNum}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Result Section */}
                {resultBlobs.length > 0 && (
                  <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FileCheck2 size={24} style={{ color: "#f87171" }} />
                      <div>
                        <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {t("pdfSplit.successTitle")}
                        </h4>
                        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {t("pdfSplit.successDesc").replace("{count}", String(resultBlobs.length))}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
                      {resultBlobs.map((res, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-subtle)" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                            {res.name}
                          </span>
                          <button
                            onClick={() => handleDownloadSingle(res.url, res.name)}
                            style={{ padding: "6px 12px", borderRadius: "6px", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", color: "white", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <Download size={13} />
                            {t("pdfSplit.downloadBtn")}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Settings & Action */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", height: "fit-content" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("pdfSplit.splitMode")}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { key: "all", label: t("pdfSplit.modeAll") },
                    { key: "range", label: t("pdfSplit.modeRange") },
                    { key: "visual", label: t("pdfSplit.modeVisual") },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setSplitMode(m.key as SplitMode)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: splitMode === m.key ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.04)",
                        border: splitMode === m.key ? "1px solid #f87171" : "1px solid var(--border-subtle)",
                        color: splitMode === m.key ? "#f87171" : "var(--text-secondary)",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Layers size={15} />
                      {m.label}
                    </button>
                  ))}
                </div>

                {splitMode === "range" && (
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      {t("pdfSplit.pageRangeLabel")} (1 - {pdfMeta?.numPages})
                    </label>
                    <input
                      type="text"
                      value={pageRangeStr}
                      placeholder={t("pdfSplit.pageRangePlaceholder")}
                      onChange={(e) => setPageRangeStr(e.target.value)}
                      style={{
                        width: "100%",
                        height: "40px",
                        borderRadius: "8px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        padding: "0 12px",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    />
                  </div>
                )}

                {/* Split Action Button */}
                <button
                  onClick={handleSplitPdf}
                  disabled={isProcessing}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                    opacity: isProcessing ? 0.6 : 1,
                  }}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      {t("pdfSplit.splitting")}
                    </>
                  ) : (
                    <>
                      <Scissors size={17} />
                      {t("pdfSplit.splitBtn")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────── */}
        <ToolGuide
          badgeText={t("pdfSplit.guide.badge") || t("pdfSplit.badge")}
          aboutTitle={t("pdfSplit.guide.aboutTitle")}
          aboutDesc={t("pdfSplit.guide.aboutDesc")}
          howTitle={t("pdfSplit.guide.howTitle")}
          steps={[
            t("pdfSplit.guide.step1"),
            t("pdfSplit.guide.step2"),
            t("pdfSplit.guide.step3"),
          ]}
          featuresTitle={t("pdfSplit.guide.featuresTitle")}
          features={[
            {
              icon: <ShieldCheck size={16} />,
              title: t("pdfSplit.guide.feat1Title"),
              desc: t("pdfSplit.guide.feat1Desc"),
            },
            {
              icon: <Eye size={16} />,
              title: t("pdfSplit.guide.feat2Title"),
              desc: t("pdfSplit.guide.feat2Desc"),
            },
            {
              icon: <Scissors size={16} />,
              title: t("pdfSplit.guide.feat3Title"),
              desc: t("pdfSplit.guide.feat3Desc"),
            },
            {
              icon: <Zap size={16} />,
              title: t("pdfSplit.guide.feat4Title"),
              desc: t("pdfSplit.guide.feat4Desc"),
            },
          ]}
          useCasesTitle={t("pdfSplit.guide.useCasesTitle")}
          useCases={[
            {
              icon: "📄",
              title: t("pdfSplit.guide.uc1Title"),
              desc: t("pdfSplit.guide.uc1Desc"),
            },
            {
              icon: "🎓",
              title: t("pdfSplit.guide.uc2Title"),
              desc: t("pdfSplit.guide.uc2Desc"),
            },
            {
              icon: "💼",
              title: t("pdfSplit.guide.uc3Title"),
              desc: t("pdfSplit.guide.uc3Desc"),
            },
            {
              icon: "🗂️",
              title: t("pdfSplit.guide.uc4Title"),
              desc: t("pdfSplit.guide.uc4Desc"),
            },
          ]}
          proTips={{
            title: t("pdfSplit.guide.tipsTitle"),
            tips: [
              t("pdfSplit.guide.tip1"),
              t("pdfSplit.guide.tip2"),
              t("pdfSplit.guide.tip3"),
            ],
          }}
          faqs={[
            { q: t("pdfSplit.guide.faq1Q"), a: t("pdfSplit.guide.faq1A") },
            { q: t("pdfSplit.guide.faq2Q"), a: t("pdfSplit.guide.faq2A") },
            { q: t("pdfSplit.guide.faq3Q"), a: t("pdfSplit.guide.faq3A") },
            { q: t("pdfSplit.guide.faq4Q"), a: t("pdfSplit.guide.faq4A") },
            { q: t("pdfSplit.guide.faq5Q"), a: t("pdfSplit.guide.faq5A") },
            { q: t("pdfSplit.guide.faq6Q"), a: t("pdfSplit.guide.faq6A") },
          ]}
        />
      </main>

      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </>
  );
}
