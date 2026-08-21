"use client";

/**
 * app/tools/pdf-to-word/page.tsx
 * ─────────────────────────────────────────────────────────────
 * PDF to Word (.docx) Converter Tool for desktools.run
 * 100% Client-Side Smart PDF Table & Editable Layout Extraction Engine
 */

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  ArrowLeft,
  Download,
  RotateCcw,
  Sparkles,
  FileCheck2,
  RefreshCw,
  Table as TableIcon,
  CheckCircle2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

interface PdfMeta {
  name: string;
  sizeFormatted: string;
  numPages: number;
}

export default function PdfToWordPage() {
  const { t } = useLocale();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfMeta, setPdfMeta] = useState<PdfMeta | null>(null);
  const [docxBlobUrl, setDocxBlobUrl] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a valid PDF file.");
      return;
    }

    setPdfFile(file);
    setDocxBlobUrl("");
    setProgressPercent(0);
    setStatusMessage("");

    // Quick preview & page count metadata
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdfDoc = await loadingTask.promise;

        setPdfMeta({
          name: file.name,
          sizeFormatted: formatFileSize(file.size),
          numPages: pdfDoc.numPages,
        });
      } catch (err) {
        console.error("PDF preview error:", err);
        setPdfMeta({
          name: file.name,
          sizeFormatted: formatFileSize(file.size),
          numPages: 1,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // Smart Editable Word Table & Text Extraction Engine
  const convertPdfToWord = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setStatusMessage("Parsing PDF text coordinates & table structures...");

    try {
      const buffer = await pdfFile.arrayBuffer();

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdfDoc = await loadingTask.promise;
      const totalPages = pdfDoc.numPages;

      const docx = await import("docx");
      const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, Packer } = docx;

      const docSections: any[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setStatusMessage(`Analyzing tables & paragraphs for page ${pageNum} / ${totalPages}...`);
        const pct = Math.round(15 + (pageNum / totalPages) * 75);
        setProgressPercent(pct);

        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();

        // 1. Group text items by Y-coordinate (Row Detection)
        const rowMap = new Map<number, { text: string; x: number }[]>();

        for (const item of textContent.items as any[]) {
          if (!item.str || item.str.trim() === "") continue;

          // Round Y coordinate to group text on the same visual line (tolerance 6pt)
          const rawY = item.transform[5];
          const rawX = item.transform[4];
          const yKey = Math.round(rawY / 8) * 8;

          if (!rowMap.has(yKey)) {
            rowMap.set(yKey, []);
          }
          rowMap.get(yKey)!.push({ text: item.str, x: rawX });
        }

        // Sort Y keys from top to bottom
        const sortedYKeys = Array.from(rowMap.keys()).sort((a, b) => b - a);

        const pageElements: any[] = [];

        // Add Page Header Indicator
        pageElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `--- PAGE ${pageNum} ---`,
                bold: true,
                color: "888888",
                size: 18,
              }),
            ],
            spacing: { before: 240, after: 120 },
          })
        );

        // Group contiguous multi-column rows into Word Tables
        let currentTableRows: { text: string; x: number }[][] = [];

        const flushCurrentTable = () => {
          if (currentTableRows.length === 0) return;

          // Determine column boundaries across the table rows
          const tableXmlRows = currentTableRows.map((rowCells) => {
            // Sort cells left to right by X coordinate
            rowCells.sort((a, b) => a.x - b.x);

            const tableCells = rowCells.map((c) => {
              return new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: c.text,
                        size: 20, // 10pt
                      }),
                    ],
                    spacing: { before: 40, after: 40 },
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                },
                margins: { top: 100, bottom: 100, left: 150, right: 150 },
              });
            });

            return new TableRow({
              children: tableCells,
            });
          });

          pageElements.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableXmlRows,
            })
          );

          pageElements.push(
            new Paragraph({
              children: [],
              spacing: { after: 140 },
            })
          );

          currentTableRows = [];
        };

        for (const yKey of sortedYKeys) {
          const lineItems = rowMap.get(yKey)!;
          lineItems.sort((a, b) => a.x - b.x);

          // If line has multiple spaced items, treat as table row
          const isTableRow = lineItems.length >= 2;

          if (isTableRow) {
            currentTableRows.push(lineItems);
          } else {
            // Single text paragraph
            flushCurrentTable();
            const textStr = lineItems.map((it) => it.text).join(" ");
            const isTitle = textStr.includes("견적서") || textStr.length < 15;

            pageElements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: textStr,
                    bold: isTitle,
                    size: isTitle ? 32 : 22,
                  }),
                ],
                spacing: { after: 120 },
              })
            );
          }
        }

        // Flush any remaining table at page end
        flushCurrentTable();

        docSections.push({
          properties: {},
          children: pageElements,
        });
      }

      setStatusMessage("Generating MS Word (.docx) document with editable tables...");
      setProgressPercent(95);

      const wordDocument = new Document({
        sections: docSections,
      });

      const blob = await Packer.toBlob(wordDocument);
      const url = URL.createObjectURL(blob);

      setDocxBlobUrl(url);
      setProgressPercent(100);
      setIsProcessing(false);
    } catch (err) {
      console.error("PDF to Word Error:", err);
      setIsProcessing(false);
      alert("An error occurred during PDF conversion. Please try another PDF file.");
    }
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

  const handleDownload = () => {
    if (!docxBlobUrl || !pdfFile) return;

    const rawName = pdfFile.name || "document.pdf";
    const lastDotIndex = rawName.lastIndexOf(".");
    const nameWithoutExt = lastDotIndex > 0 ? rawName.substring(0, lastDotIndex) : rawName;
    const filename = `${nameWithoutExt}.docx`;

    const link = document.createElement("a");
    link.href = docxBlobUrl;
    link.setAttribute("download", filename);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfMeta(null);
    setDocxBlobUrl("");
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
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#818cf8",
                  }}
                >
                  <FileText size={20} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                  {t("pdfToWord.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "620px" }}>
                {t("pdfToWord.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                fontSize: "12px",
                color: "#818cf8",
                fontWeight: 600,
              }}
            >
              <TableIcon size={14} />
              100% Editable Word Tables & Cells (.docx)
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
                border: isDragging ? "2px dashed #6366f1" : "2px dashed var(--border-subtle)",
                background: isDragging ? "rgba(99,102,241,0.08)" : "var(--glass-bg)",
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
                  background: "rgba(99,102,241,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#818cf8",
                }}
              >
                <Upload size={32} />
              </div>

              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {t("pdfToWord.dropPrompt")}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Converts PDF tables and text into 100% editable MS Word (.docx) tables
                </p>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* PDF Document Preview Card */}
              <div className="glass-card" style={{ padding: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f87171",
                    }}
                  >
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                      {pdfMeta?.name || pdfFile.name}
                    </h3>
                    <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "var(--text-muted)" }}>
                      <span>Size: {pdfMeta?.sizeFormatted}</span>
                      <span>•</span>
                      <span>Total Pages: <strong>{pdfMeta?.numPages} pages</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <RotateCcw size={14} />
                  Change File
                </button>
              </div>

              {/* Status & Progress Bar */}
              {isProcessing && (
                <div className="glass-card" style={{ padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <RefreshCw size={36} className="spin-icon" style={{ color: "#818cf8" }} />
                  <div>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                      {statusMessage}
                    </p>
                    <p style={{ fontSize: "13px", color: "#818cf8", fontWeight: 600 }}>
                      {progressPercent}% Complete
                    </p>
                  </div>

                  <div style={{ width: "100%", maxWidth: "360px", height: "8px", borderRadius: "100px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${progressPercent}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #6366f1, #818cf8)",
                        transition: "width 0.3s ease-in-out",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Conversion Done Card */}
              {!isProcessing && docxBlobUrl && (
                <div
                  className="glass-card"
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      background: "rgba(99,102,241,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#818cf8",
                    }}
                  >
                    <FileCheck2 size={32} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                      Conversion Complete!
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                      Your editable MS Word (.docx) document with real tables & cells is ready.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "420px", marginTop: "8px" }}>
                    <button
                      onClick={handleDownload}
                      style={{
                        flex: 1,
                        height: "48px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                        color: "white",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                      }}
                    >
                      <Download size={18} />
                      {t("pdfToWord.download")}
                    </button>

                    <button
                      onClick={handleReset}
                      style={{
                        height: "48px",
                        padding: "0 20px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <RotateCcw size={15} />
                      {t("pdfToWord.reset")}
                    </button>
                  </div>
                </div>
              )}

              {/* Convert Action Button (Before Conversion) */}
              {!isProcessing && !docxBlobUrl && (
                <button
                  onClick={convertPdfToWord}
                  style={{
                    width: "100%",
                    height: "52px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    color: "white",
                    border: "none",
                    fontWeight: 800,
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                  }}
                >
                  <FileText size={20} />
                  {t("pdfToWord.convertBtn")}
                </button>
              )}
            </div>
          )}
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────── */}
        <ToolGuide
          badgeText="100% Client-Side & Private"
          aboutTitle={t("pdfToWord.guide.aboutTitle")}
          aboutDesc={t("pdfToWord.guide.aboutDesc")}
          howTitle={t("pdfToWord.guide.howTitle")}
          steps={[
            t("pdfToWord.guide.step1"),
            t("pdfToWord.guide.step2"),
            t("pdfToWord.guide.step3"),
          ]}
          faqs={[
            { q: t("pdfToWord.guide.faq1Q"), a: t("pdfToWord.guide.faq1A") },
            { q: t("pdfToWord.guide.faq2Q"), a: t("pdfToWord.guide.faq2A") },
            { q: t("pdfToWord.guide.faq3Q"), a: t("pdfToWord.guide.faq3A") },
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
