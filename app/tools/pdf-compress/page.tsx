"use client";

/**
 * app/tools/pdf-compress/page.tsx
 * ─────────────────────────────────────────────────────────────
 * PDF Compression Tool for desktools.run
 *
 * Features:
 *  - 100% Client-side PDF stream optimization & compression via `pdf-lib`
 *  - Drag & drop PDF file selection
 *  - Live size calculation (Original vs Compressed & % Savings)
 *  - 3 Compression Presets: Recommended, High, Low
 *  - Custom output filename & 1-click Download
 *  - Full 6-language i18n & Dark/Light theme support
 */

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import {
  PackageMinus,
  Upload,
  ArrowLeft,
  Trash2,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Zap,
  Gauge,
  ShieldCheck,
  FileText,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";

type CompressionLevel = "recommended" | "high" | "low";

interface LoadedPdf {
  file: File;
  name: string;
  originalSize: number;
  pageCount: number;
}

export default function PdfCompressPage() {
  const { t } = useLocale();

  const [pdfFile, setPdfFile] = useState<LoadedPdf | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const [outputFilename, setOutputFilename] = useState<string>("compressed_document.pdf");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [compressedResult, setCompressedResult] = useState<{
    size: number;
    url: string;
    savings: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle uploaded file
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const file = Array.from(files).find((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      setPdfFile({
        file,
        name: file.name,
        originalSize: file.size,
        pageCount: count,
      });
      setOutputFilename(file.name.replace(/\.pdf$/i, "_compressed.pdf"));
      setCompressedResult(null);
    } catch (err) {
      console.error("Error parsing PDF:", err);
      setPdfFile({
        file,
        name: file.name,
        originalSize: file.size,
        pageCount: 1,
      });
      setOutputFilename(file.name.replace(/\.pdf$/i, "_compressed.pdf"));
      setCompressedResult(null);
    }
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

  // Reset
  const handleReset = () => {
    setPdfFile(null);
    setCompressedResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Execute Compression
  const handleCompress = async () => {
    if (!pdfFile) return;

    setIsCompressing(true);
    try {
      const buffer = await pdfFile.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Create new optimized document
      const destDoc = await PDFDocument.create();
      const pages = await destDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((p) => destDoc.addPage(p));

      // Strip optional redundant metadata for High & Recommended levels
      if (level === "high" || level === "recommended") {
        destDoc.setTitle("");
        destDoc.setAuthor("");
        destDoc.setSubject("");
        destDoc.setKeywords([]);
        destDoc.setProducer("desktools.run local PDF engine");
        destDoc.setCreator("desktools.run");
      }

      // Configure save options based on level
      const useObjectStreams = level !== "low";
      const compressedBytes = await destDoc.save({
        useObjectStreams,
        addDefaultPage: false,
      });

      const blob = new Blob([compressedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const newSize = blob.size;

      // Calculate size reduction percentage
      const orig = pdfFile.originalSize;
      const savings = orig > 0 ? Math.max(0, Math.round(((orig - newSize) / orig) * 100)) : 0;

      setCompressedResult({
        size: newSize,
        url,
        savings,
      });

      // Trigger direct browser download
      const name = outputFilename.endsWith(".pdf") ? outputFilename : `${outputFilename}.pdf`;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("PDF Compression Error:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  // Bytes formatter helper
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
                  <PackageMinus size={20} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                  {t("pdfCompress.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
                {t("pdfCompress.subtitle")}
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
              100% Client-Side Compression
            </div>
          </div>
        </section>

        {/* ── Main Workspace ───────────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {!pdfFile ? (
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
                  {t("pdfCompress.dropPrompt")}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Select a PDF file to reduce size without server uploads.
                </p>
              </div>
            </div>
          ) : (
            /* PDF Compression Workspace */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px" }} className="workspace-grid">
              {/* Left Column: File Info & Compression Presets */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* File Card */}
                <div
                  className="glass-card"
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#f87171",
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={22} />
                    </div>

                    <div style={{ overflow: "hidden" }}>
                      <p
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pdfFile.name}
                      </p>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", gap: "12px", marginTop: "2px" }}>
                        <span>{pdfFile.pageCount} {t("pdfMerger.pages")}</span>
                        <span>•</span>
                        <span>{t("pdfCompress.originalSize")}: {formatBytes(pdfFile.originalSize)}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      color: "#f87171",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    title={t("pdfCompress.reset")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Preset Selection Cards */}
                <div className="glass-card" style={{ padding: "24px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Gauge size={18} color="#f87171" />
                    {t("pdfCompress.level")}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Recommended Level */}
                    <div
                      onClick={() => setLevel("recommended")}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: level === "recommended" ? "2px solid #f87171" : "1px solid var(--border-subtle)",
                        background: level === "recommended" ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: level === "recommended" ? "6px solid #f87171" : "2px solid var(--border-subtle)",
                          marginTop: "2px",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                            {t("pdfCompress.levelRecommended")}
                          </strong>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "100px",
                              background: "rgba(52,211,153,0.15)",
                              color: "#34d399",
                              border: "1px solid rgba(52,211,153,0.3)",
                            }}
                          >
                            Best Balance
                          </span>
                        </div>
                        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                          {t("pdfCompress.levelRecommendedDesc")}
                        </p>
                      </div>
                    </div>

                    {/* High Level */}
                    <div
                      onClick={() => setLevel("high")}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: level === "high" ? "2px solid #f87171" : "1px solid var(--border-subtle)",
                        background: level === "high" ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: level === "high" ? "6px solid #f87171" : "2px solid var(--border-subtle)",
                          marginTop: "2px",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                          {t("pdfCompress.levelHigh")}
                        </strong>
                        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                          {t("pdfCompress.levelHighDesc")}
                        </p>
                      </div>
                    </div>

                    {/* Low Level */}
                    <div
                      onClick={() => setLevel("low")}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: level === "low" ? "2px solid #f87171" : "1px solid var(--border-subtle)",
                        background: level === "low" ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: level === "low" ? "6px solid #f87171" : "2px solid var(--border-subtle)",
                          marginTop: "2px",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                          {t("pdfCompress.levelLow")}
                        </strong>
                        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                          {t("pdfCompress.levelLowDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Results */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", height: "fit-content" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Compression Summary
                </h3>

                {/* Output Stats / Results */}
                {compressedResult ? (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      background: "rgba(52,211,153,0.1)",
                      border: "1px solid rgba(52,211,153,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                      <CheckCircle2 size={14} />
                      Compression Complete!
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "4px" }}>
                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "8px", borderRadius: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>{t("pdfCompress.originalSize")}</span>
                        <strong style={{ fontSize: "13.5px", color: "var(--text-primary)" }}>{formatBytes(pdfFile.originalSize)}</strong>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "8px", borderRadius: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>{t("pdfCompress.compressedSize")}</span>
                        <strong style={{ fontSize: "13.5px", color: "#34d399" }}>{formatBytes(compressedResult.size)}</strong>
                      </div>
                    </div>
                    {compressedResult.savings > 0 && (
                      <div style={{ fontSize: "12px", color: "#34d399", fontWeight: 700, marginTop: "4px" }}>
                        🎉 Saved {compressedResult.savings}% file size!
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(0,0,0,0.15)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Ready to compress</span>
                    <strong style={{ fontSize: "16px", color: "var(--text-primary)", display: "block", marginTop: "4px" }}>
                      {formatBytes(pdfFile.originalSize)}
                    </strong>
                  </div>
                )}

                {/* Output Filename Input */}
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    {t("pdfCompress.filename")}
                  </label>
                  <input
                    type="text"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    placeholder="compressed_document.pdf"
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

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    onClick={handleCompress}
                    disabled={isCompressing}
                    style={{
                      height: "46px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #ef4444, #f43f5e)",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "14.5px",
                      cursor: isCompressing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
                      opacity: isCompressing ? 0.6 : 1,
                    }}
                  >
                    <Download size={17} />
                    {isCompressing ? t("pdfCompress.compressing") : t("pdfCompress.compressBtn")}
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
                    {t("pdfCompress.reset")}
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
                  {t("pdfCompress.guide.title")}
                </h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Everything you need to know about reducing PDF file sizes securely in your browser.
              </p>
            </div>

            {/* Grid layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }} className="guide-grid">
              {/* About section */}
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} color="#f87171" />
                  {t("pdfCompress.guide.aboutTitle")}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                  {t("pdfCompress.guide.aboutDesc")}
                </p>
              </div>

              {/* How to use */}
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  {t("pdfCompress.guide.howTitle")}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "13.5px", color: "var(--text-secondary)" }}>
                  <li>{t("pdfCompress.guide.step1")}</li>
                  <li>{t("pdfCompress.guide.step2")}</li>
                  <li>{t("pdfCompress.guide.step3")}</li>
                </ul>
              </div>
            </div>

            {/* FAQ Section */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <HelpCircle size={18} color="#fbbf24" />
                {t("pdfCompress.guide.faqTitle")}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="faq-grid">
                {[
                  { q: t("pdfCompress.guide.faq1Q"), a: t("pdfCompress.guide.faq1A") },
                  { q: t("pdfCompress.guide.faq2Q"), a: t("pdfCompress.guide.faq2A") },
                  { q: t("pdfCompress.guide.faq3Q"), a: t("pdfCompress.guide.faq3A") },
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
