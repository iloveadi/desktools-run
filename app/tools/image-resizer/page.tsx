"use client";

/**
 * app/tools/image-resizer/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Image Resizer & Converter Tool for desktools.run
 *
 * Features:
 *  - 100% Client-side HTML5 Canvas resizing & format conversion
 *  - Supports PNG, JPG, WEBP, GIF, SVG image formats
 *  - Custom pixel dimensions (Width/Height) with aspect ratio lock/unlock
 *  - Quick percentage resizing presets (25%, 50%, 75%, 100%, 150%, 200%)
 *  - Output format selection (PNG, JPEG, WEBP) & Quality slider
 *  - Real-time side-by-side original vs resized preview with file size reduction
 *  - 1-click Download & Reset
 *  - Full 6-language i18n & Dark/Light theme support
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ImageIcon,
  Upload,
  ArrowLeft,
  Link as LinkIcon,
  Unlink,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileImage,
  HelpCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

export default function ImageResizerPage() {
  const { t } = useLocale();

  // File & Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [origSize, setOrigSize] = useState<number>(0);

  // Resize settings
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState<number>(90); // 10 to 100

  // Resized Output Preview state
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [resizedDataUrl, setResizedDataUrl] = useState<string>("");
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load image file
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    setImageFile(file);
    setOrigSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);
        setTargetWidth(img.naturalWidth);
        setTargetHeight(img.naturalHeight);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Dimension change handlers
  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && origWidth > 0 && origHeight > 0) {
      const ratio = origHeight / origWidth;
      setTargetHeight(Math.max(1, Math.round(val * ratio)));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && origWidth > 0 && origHeight > 0) {
      const ratio = origWidth / origHeight;
      setTargetWidth(Math.max(1, Math.round(val * ratio)));
    }
  };

  const applyPercent = (pct: number) => {
    if (origWidth === 0 || origHeight === 0) return;
    const w = Math.round((origWidth * pct) / 100);
    const h = Math.round((origHeight * pct) / 100);
    setTargetWidth(w);
    setTargetHeight(h);
  };

  // Canvas Resize Execution
  useEffect(() => {
    if (!imageSrc || targetWidth <= 0 || targetHeight <= 0) return;

    setIsProcessing(true);
    const timer = setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Smooth image scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // If JPEG, fill white background to avoid transparent black artifacts
          if (outputFormat === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          }

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const qVal = quality / 100;
          canvas.toBlob(
            (blob) => {
              if (blob) {
                setResizedBlob(blob);
                setResizedSize(blob.size);
                const newUrl = URL.createObjectURL(blob);
                setResizedDataUrl(newUrl);
              }
              setIsProcessing(false);
            },
            outputFormat,
            qVal
          );
        }
      };
      img.src = imageSrc;
    }, 150);

    return () => clearTimeout(timer);
  }, [imageSrc, targetWidth, targetHeight, outputFormat, quality]);

  // Download Handler
  const handleDownload = () => {
    if (!resizedBlob || !imageFile) return;

    const ext = outputFormat === "image/png" ? "png" : outputFormat === "image/jpeg" ? "jpg" : "webp";
    const rawName = imageFile.name || "image";
    const lastDotIndex = rawName.lastIndexOf(".");
    const nameWithoutExt = lastDotIndex > 0 ? rawName.substring(0, lastDotIndex) : rawName;
    const filename = `${nameWithoutExt}_resized_${targetWidth}x${targetHeight}.${ext}`;

    const link = document.createElement("a");
    link.href = resizedDataUrl;
    link.setAttribute("download", filename);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Handler
  const handleReset = () => {
    setImageFile(null);
    setImageSrc("");
    setOrigWidth(0);
    setOrigHeight(0);
    setOrigSize(0);
    setTargetWidth(0);
    setTargetHeight(0);
    setResizedBlob(null);
    setResizedDataUrl("");
    setResizedSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Format Helper
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
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#818cf8",
                  }}
                >
                  <ImageIcon size={20} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                  {t("imageResizer.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
                {t("imageResizer.subtitle")}
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
                color: "#a5b4fc",
                fontWeight: 600,
              }}
            >
              <Sparkles size={12} />
              100% Client-Side Canvas
            </div>
          </div>
        </section>

        {/* ── Main Resizer Workspace ───────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {!imageFile ? (
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
                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml, image/bmp"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
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
                  {t("imageResizer.dropPrompt")}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Supports PNG, JPG, WEBP, GIF, SVG (Max 50MB)
                </p>
              </div>
            </div>
          ) : (
            /* Resizer Editing Workspace */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }} className="workspace-grid">
              {/* Left Column: Side-by-Side Preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="preview-grid">
                  {/* Original Image Card */}
                  <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                        {t("imageResizer.original")}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                        {origWidth} × {origHeight} px
                      </span>
                    </div>

                    <div style={{ width: "100%", height: "260px", borderRadius: "10px", overflow: "hidden", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt="Original preview"
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px", color: "var(--text-muted)" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
                        {imageFile.name}
                      </span>
                      <span style={{ fontWeight: 600 }}>{formatBytes(origSize)}</span>
                    </div>
                  </div>

                  {/* Resized Preview Card */}
                  <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#818cf8" }}>
                        {t("imageResizer.resized")}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>
                        {targetWidth} × {targetHeight} px
                      </span>
                    </div>

                    <div style={{ width: "100%", height: "260px", borderRadius: "10px", overflow: "hidden", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {resizedDataUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={resizedDataUrl}
                          alt="Resized preview"
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", opacity: isProcessing ? 0.5 : 1, transition: "opacity 0.15s" }}
                        />
                      ) : (
                        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Rendering...</div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px", color: "var(--text-muted)" }}>
                      <span>
                        Size: <strong style={{ color: "var(--text-primary)" }}>{formatBytes(resizedSize)}</strong>
                      </span>
                      {origSize > 0 && resizedSize > 0 && (
                        <span style={{ fontWeight: 700, color: resizedSize < origSize ? "#34d399" : "#fbbf24" }}>
                          {resizedSize < origSize ? `-${Math.round((1 - resizedSize / origSize) * 100)}%` : `+${Math.round((resizedSize / origSize - 1) * 100)}%`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleDownload}
                    disabled={!resizedBlob || isProcessing}
                    style={{
                      flex: 1,
                      height: "46px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "14.5px",
                      cursor: resizedBlob && !isProcessing ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                      opacity: resizedBlob && !isProcessing ? 1 : 0.6,
                    }}
                  >
                    <Download size={17} />
                    {t("imageResizer.download")}
                  </button>

                  <button
                    onClick={handleReset}
                    style={{
                      height: "46px",
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
                    {t("imageResizer.reset")}
                  </button>
                </div>
              </div>

              {/* Right Column: Controls Panel */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", height: "fit-content" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Resize Settings
                </h3>

                {/* Pixel Inputs (Width x Height) */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                      Dimensions (px)
                    </label>
                    <button
                      onClick={() => setLockAspect(!lockAspect)}
                      style={{
                        background: lockAspect ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.06)",
                        border: lockAspect ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--border-subtle)",
                        color: lockAspect ? "#818cf8" : "var(--text-muted)",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: 600,
                      }}
                      title={t("imageResizer.lockAspect")}
                    >
                      {lockAspect ? <LinkIcon size={12} /> : <Unlink size={12} />}
                      {t("imageResizer.lockAspect")}
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                        {t("imageResizer.width")}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={targetWidth || ""}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                        style={{
                          width: "100%",
                          height: "38px",
                          borderRadius: "8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          padding: "0 10px",
                          fontSize: "13.5px",
                          fontWeight: 600,
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                        {t("imageResizer.height")}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={targetHeight || ""}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                        style={{
                          width: "100%",
                          height: "38px",
                          borderRadius: "8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          padding: "0 10px",
                          fontSize: "13.5px",
                          fontWeight: 600,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Percentage Preset Chips */}
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                    {t("imageResizer.byPercent")}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                    {[25, 50, 75, 100, 150, 200].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => applyPercent(pct)}
                        style={{
                          height: "32px",
                          borderRadius: "6px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#818cf8"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)"; }}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Format Selection */}
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                    {t("imageResizer.format")}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                    {[
                      { label: "JPG", value: "image/jpeg" },
                      { label: "PNG", value: "image/png" },
                      { label: "WEBP", value: "image/webp" },
                    ].map((fmt) => (
                      <button
                        key={fmt.value}
                        onClick={() => setOutputFormat(fmt.value as OutputFormat)}
                        style={{
                          height: "34px",
                          borderRadius: "8px",
                          background: outputFormat === fmt.value ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                          border: outputFormat === fmt.value ? "1px solid #818cf8" : "1px solid var(--border-subtle)",
                          color: outputFormat === fmt.value ? "#a5b4fc" : "var(--text-secondary)",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider (for JPG & WEBP) */}
                {outputFormat !== "image/png" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600 }}>{t("imageResizer.quality")}</span>
                      <span style={{ color: "#818cf8", fontWeight: 700 }}>{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer" }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden Canvas Element */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </section>

        {/* ── Bottom Guide & FAQ Section ─────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "48px auto 0", padding: "0 24px" }}>
          <div className="glass-card" style={{ padding: "36px", display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Header */}
            <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <FileImage size={22} color="#818cf8" />
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {t("imageResizer.guide.title")}
                </h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Everything you need to know about resizing and converting images locally in your browser.
              </p>
            </div>

            {/* Grid layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }} className="guide-grid">
              {/* About section */}
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} color="#818cf8" />
                  {t("imageResizer.guide.aboutTitle")}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                  {t("imageResizer.guide.aboutDesc")}
                </p>
              </div>

              {/* How to use */}
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  {t("imageResizer.guide.howTitle")}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "13.5px", color: "var(--text-secondary)" }}>
                  <li>{t("imageResizer.guide.step1")}</li>
                  <li>{t("imageResizer.guide.step2")}</li>
                  <li>{t("imageResizer.guide.step3")}</li>
                </ul>
              </div>
            </div>

            {/* FAQ Section */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <HelpCircle size={18} color="#fbbf24" />
                {t("imageResizer.guide.faqTitle")}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="faq-grid">
                {[
                  { q: t("imageResizer.guide.faq1Q"), a: t("imageResizer.guide.faq1A") },
                  { q: t("imageResizer.guide.faq2Q"), a: t("imageResizer.guide.faq2A") },
                  { q: t("imageResizer.guide.faq3Q"), a: t("imageResizer.guide.faq3A") },
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
          .preview-grid { grid-template-columns: 1fr !important; }
          .guide-grid { grid-template-columns: 1fr !important; }
          .faq-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
