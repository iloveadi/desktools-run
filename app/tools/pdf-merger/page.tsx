"use client";

/**
 * app/tools/pdf-merger/page.tsx
 * ─────────────────────────────────────────────────────────────
 * PDF Merger & Combiner Tool for desktools.run
 *
 * Features:
 *  - 100% Client-side PDF page copying & merging via `pdf-lib`
 *  - Drag & drop multiple PDF files simultaneously
 *  - Parses page count & file size for each PDF
 *  - Up (▲) and Down (▼) file reordering
 *  - Remove individual files or Clear All
 *  - Custom output filename & 1-click Download
 *  - Full 6-language i18n & Dark/Light theme support
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
  CheckCircle2,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
        // Fallback for corrupt or password protected files
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

        {/* ── Bottom Guide & FAQ Section ─────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "48px auto 0", padding: "0 24px" }}>
          <div className="glass-card" style={{ padding: "36px", display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Header */}
            <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <BookOpen size={22} color="#f87171" />
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {t("pdfMerger.guide.title")}
                </h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Everything you need to know about combining PDF documents securely in your browser.
              </p>
            </div>

            {/* Grid layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }} className="guide-grid">
              {/* About section */}
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} color="#f87171" />
                  {t("pdfMerger.guide.aboutTitle")}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                  {t("pdfMerger.guide.aboutDesc")}
                </p>
              </div>

              {/* How to use */}
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  {t("pdfMerger.guide.howTitle")}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "13.5px", color: "var(--text-secondary)" }}>
                  <li>{t("pdfMerger.guide.step1")}</li>
                  <li>{t("pdfMerger.guide.step2")}</li>
                  <li>{t("pdfMerger.guide.step3")}</li>
                </ul>
              </div>
            </div>

            {/* FAQ Section */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <HelpCircle size={18} color="#fbbf24" />
                {t("pdfMerger.guide.faqTitle")}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="faq-grid">
                {[
                  { q: t("pdfMerger.guide.faq1Q"), a: t("pdfMerger.guide.faq1A") },
                  { q: t("pdfMerger.guide.faq2Q"), a: t("pdfMerger.guide.faq2A") },
                  { q: t("pdfMerger.guide.faq3Q"), a: t("pdfMerger.guide.faq3A") },
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                    <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                      Q. {item.q}
                    </h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .workspace-grid { grid-template-columns: 1fr !important; }
          .guide-grid { grid-template-columns: 1fr !important; }
          .faq-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
