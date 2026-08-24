"use client";

/**
 * app/tools/image-converter/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Fast & Client-side Image Format Converter for desktools.run
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Upload,
  ArrowLeft,
  Download,
  RotateCcw,
  Sparkles,
  Trash2,
  CheckCircle2,
  FileImage,
  Layers,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

type TargetFormat = "PNG" | "JPG" | "WEBP" | "BMP" | "ICO";

interface ImageItem {
  id: string;
  file: File;
  src: string;
  width: number;
  height: number;
  origSize: number;
  convertedBlob: Blob | null;
  convertedUrl: string;
  convertedSize: number;
  isProcessing: boolean;
}

export default function ImageConverterPage() {
  const { t } = useLocale();

  const [items, setItems] = useState<ImageItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("WEBP");
  const [quality, setQuality] = useState<number>(90);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getMimeType = (format: TargetFormat): string => {
    switch (format) {
      case "PNG":
        return "image/png";
      case "JPG":
        return "image/jpeg";
      case "WEBP":
        return "image/webp";
      case "BMP":
        return "image/bmp";
      case "ICO":
        return "image/x-icon";
      default:
        return "image/png";
    }
  };

  const getExtension = (format: TargetFormat): string => {
    switch (format) {
      case "PNG":
        return "png";
      case "JPG":
        return "jpg";
      case "WEBP":
        return "webp";
      case "BMP":
        return "bmp";
      case "ICO":
        return "ico";
      default:
        return "png";
    }
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newItem: ImageItem = {
            id: Math.random().toString(36).substring(2, 9),
            file,
            src,
            width: img.naturalWidth,
            height: img.naturalHeight,
            origSize: file.size,
            convertedBlob: null,
            convertedUrl: "",
            convertedSize: 0,
            isProcessing: false,
          };
          setItems((prev) => [...prev, newItem]);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const convertItem = useCallback(
    (item: ImageItem, format: TargetFormat, q: number, bg: string): Promise<Partial<ImageItem>> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let renderWidth = img.naturalWidth;
          let renderHeight = img.naturalHeight;

          // ICO format is usually 32x32 or max 256x256
          if (format === "ICO") {
            if (renderWidth > 256 || renderHeight > 256) {
              const maxDim = Math.max(renderWidth, renderHeight);
              renderWidth = Math.round((renderWidth / maxDim) * 256);
              renderHeight = Math.round((renderHeight / maxDim) * 256);
            }
          }

          canvas.width = renderWidth;
          canvas.height = renderHeight;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            // If target is JPG or background is requested, fill background
            if (format === "JPG" || (bg !== "transparent" && format !== "PNG")) {
              ctx.fillStyle = bg;
              ctx.fillRect(0, 0, renderWidth, renderHeight);
            }

            ctx.drawImage(img, 0, 0, renderWidth, renderHeight);

            const mime = getMimeType(format);
            const qualityVal = format === "PNG" ? 1 : q / 100;

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  resolve({
                    convertedBlob: blob,
                    convertedUrl: url,
                    convertedSize: blob.size,
                    isProcessing: false,
                  });
                } else {
                  resolve({ isProcessing: false });
                }
              },
              mime,
              qualityVal
            );
          } else {
            resolve({ isProcessing: false });
          }
        };
        img.src = item.src;
      });
    },
    []
  );

  useEffect(() => {
    if (items.length === 0) return;

    items.forEach((item) => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isProcessing: true } : i))
      );

      convertItem(item, targetFormat, quality, bgColor).then((result) => {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, ...result } : i))
        );
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetFormat, quality, bgColor]);

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

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setItems([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadSingle = (item: ImageItem) => {
    if (!item.convertedUrl) return;
    const rawName = item.file.name || "image";
    const lastDotIndex = rawName.lastIndexOf(".");
    const nameWithoutExt = lastDotIndex > 0 ? rawName.substring(0, lastDotIndex) : rawName;
    const ext = getExtension(targetFormat);
    const filename = `${nameWithoutExt}_converted.${ext}`;

    const link = document.createElement("a");
    link.href = item.convertedUrl;
    link.setAttribute("download", filename);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    items.forEach((item, index) => {
      if (item.convertedUrl) {
        setTimeout(() => {
          downloadSingle(item);
        }, index * 300);
      }
    });
  };

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
        {/* ── Breadcrumb & Header Title ───────────────── */}
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
            {t("imageConverter.back")}
          </Link>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a78bfa",
                  }}
                >
                  <RefreshCw size={20} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                  {t("imageConverter.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "620px" }}>
                {t("imageConverter.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
                fontSize: "12px",
                color: "#c4b5fd",
                fontWeight: 600,
              }}
            >
              <Sparkles size={12} />
              {t("imageConverter.badge")}
            </div>
          </div>
        </section>

        {/* ── Main Converter Workspace ───────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {/* Controls Bar */}
          <div
            className="glass-card"
            style={{
              padding: "20px 24px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              {/* Target Format Buttons */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("imageConverter.targetFormat")}
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {(["WEBP", "PNG", "JPG", "BMP", "ICO"] as TargetFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setTargetFormat(fmt)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: targetFormat === fmt ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.05)",
                        border: targetFormat === fmt ? "1px solid #a78bfa" : "1px solid var(--border-subtle)",
                        color: targetFormat === fmt ? "#c4b5fd" : "var(--text-secondary)",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider (JPG/WEBP) */}
              {(targetFormat === "JPG" || targetFormat === "WEBP") && (
                <div style={{ minWidth: "160px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 700, textTransform: "uppercase" }}>{t("imageConverter.quality")}</span>
                    <span style={{ color: "#a78bfa", fontWeight: 700 }}>{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "#8b5cf6", cursor: "pointer" }}
                  />
                </div>
              )}

              {/* Background Color for JPG */}
              {targetFormat === "JPG" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>
                    {t("imageConverter.bgColor")}
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[
                      { label: t("imageConverter.white"), val: "#ffffff" },
                      { label: t("imageConverter.black"), val: "#000000" },
                    ].map((bg) => (
                      <button
                        key={bg.val}
                        onClick={() => setBgColor(bg.val)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          background: bgColor === bg.val ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)",
                          border: bgColor === bg.val ? "1px solid #a78bfa" : "1px solid var(--border-subtle)",
                          color: bgColor === bg.val ? "#c4b5fd" : "var(--text-muted)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Global Actions */}
            {items.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={downloadAll}
                  style={{
                    height: "38px",
                    padding: "0 18px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
                  }}
                >
                  <Download size={15} />
                  {t("imageConverter.downloadAll")} ({items.length})
                </button>

                <button
                  onClick={handleReset}
                  style={{
                    height: "38px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <RotateCcw size={14} />
                  {t("imageConverter.reset")}
                </button>
              </div>
            )}
          </div>

          {/* Upload Box / Image Grid */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="glass-card"
            style={{
              padding: items.length === 0 ? "64px 32px" : "24px",
              textAlign: items.length === 0 ? "center" : "left",
              border: isDragging ? "2px dashed #8b5cf6" : "2px dashed var(--border-subtle)",
              background: isDragging ? "rgba(139,92,246,0.08)" : "var(--glass-bg)",
              transition: "all 0.2s",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp, image/gif, image/bmp, image/svg+xml"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              style={{ display: "none" }}
            />

            {items.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "rgba(139,92,246,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a78bfa",
                  }}
                >
                  <Upload size={32} />
                </div>

                <div>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                    {t("imageConverter.dropPrompt")}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {t("imageConverter.dropDesc")}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Layers size={16} color="#a78bfa" />
                    {items.length} {t("imageConverter.filesSelected")}
                  </span>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Upload size={13} />
                    {t("imageConverter.addMore")}
                  </button>
                </div>

                {/* Grid of File Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "12px",
                        border: "1px solid var(--border-subtle)",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        position: "relative",
                      }}
                    >
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "rgba(239,68,68,0.15)",
                          border: "none",
                          color: "#f87171",
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Remove file"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Image Thumbnail Preview */}
                      <div
                        style={{
                          width: "100%",
                          height: "160px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          background: "rgba(0,0,0,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.convertedUrl || item.src}
                          alt={item.file.name}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                      </div>

                      {/* File Details */}
                      <div>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "200px",
                          }}
                        >
                          {item.file.name}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                          <span>{item.width} × {item.height} px</span>
                          <span>•</span>
                          <span>{formatBytes(item.origSize)}</span>
                        </div>
                      </div>

                      {/* Conversion Status & Size Comparison */}
                      <div
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "12px",
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#a78bfa" }}>➔ {targetFormat}</span>
                        {item.convertedSize > 0 ? (
                          <span style={{ fontWeight: 700, color: item.convertedSize < item.origSize ? "#34d399" : "#fbbf24" }}>
                            {formatBytes(item.convertedSize)} (
                            {item.convertedSize < item.origSize
                              ? `-${Math.round((1 - item.convertedSize / item.origSize) * 100)}%`
                              : `+${Math.round((item.convertedSize / item.origSize - 1) * 100)}%`}
                            )
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>{t("imageConverter.converting")}</span>
                        )}
                      </div>

                      {/* Download Single Button */}
                      <button
                        onClick={() => downloadSingle(item)}
                        disabled={!item.convertedUrl}
                        style={{
                          width: "100%",
                          height: "36px",
                          borderRadius: "8px",
                          background: item.convertedUrl ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)",
                          border: item.convertedUrl ? "1px solid #a78bfa" : "1px solid var(--border-subtle)",
                          color: item.convertedUrl ? "#c4b5fd" : "var(--text-muted)",
                          fontWeight: 700,
                          fontSize: "12.5px",
                          cursor: item.convertedUrl ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Download size={14} />
                        {t("imageConverter.download")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────── */}
        <ToolGuide
          badgeText={t("imageConverter.guideBadge")}
          aboutTitle={t("imageConverter.guide.aboutTitle")}
          aboutDesc={t("imageConverter.guide.aboutDesc")}
          howTitle={t("imageConverter.guide.howTitle")}
          steps={[
            t("imageConverter.guide.step1"),
            t("imageConverter.guide.step2"),
            t("imageConverter.guide.step3"),
          ]}
          faqs={[
            { q: t("imageConverter.guide.faq1Q"), a: t("imageConverter.guide.faq1A") },
            { q: t("imageConverter.guide.faq2Q"), a: t("imageConverter.guide.faq2A") },
            { q: t("imageConverter.guide.faq3Q"), a: t("imageConverter.guide.faq3A") },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}
