"use client";

/**
 * app/tools/image-compress/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Fast & Client-side Image Compression Tool for desktools.run
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ZoomOut,
  Upload,
  ArrowLeft,
  Download,
  RotateCcw,
  Sparkles,
  Trash2,
  Sliders,
  CheckCircle2,
  FileImage,
  Layers,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

type CompressPreset = "recommended" | "high" | "low" | "custom";

interface CompressItem {
  id: string;
  file: File;
  src: string;
  width: number;
  height: number;
  origSize: number;
  compressedBlob: Blob | null;
  compressedUrl: string;
  compressedSize: number;
  isProcessing: boolean;
}

export default function ImageCompressPage() {
  const { t } = useLocale();

  const [items, setItems] = useState<CompressItem[]>([]);
  const [preset, setPreset] = useState<CompressPreset>("recommended");
  const [customQuality, setCustomQuality] = useState<number>(75);
  const [autoConvertWebp, setAutoConvertWebp] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getEffectiveQuality = useCallback((): number => {
    switch (preset) {
      case "recommended":
        return 80;
      case "high":
        return 55;
      case "low":
        return 92;
      case "custom":
        return customQuality;
      default:
        return 80;
    }
  }, [preset, customQuality]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newItem: CompressItem = {
            id: Math.random().toString(36).substring(2, 9),
            file,
            src,
            width: img.naturalWidth,
            height: img.naturalHeight,
            origSize: file.size,
            compressedBlob: null,
            compressedUrl: "",
            compressedSize: 0,
            isProcessing: false,
          };
          setItems((prev) => [...prev, newItem]);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const compressSingleItem = useCallback(
    (item: CompressItem, q: number, convertWebp: boolean): Promise<Partial<CompressItem>> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let renderWidth = img.naturalWidth;
          let renderHeight = img.naturalHeight;

          // If preset is "high" and image is massive, scale down slightly for max compression
          if (preset === "high" && (renderWidth > 2560 || renderHeight > 2560)) {
            const maxDim = Math.max(renderWidth, renderHeight);
            renderWidth = Math.round((renderWidth / maxDim) * 2560);
            renderHeight = Math.round((renderHeight / maxDim) * 2560);
          }

          canvas.width = renderWidth;
          canvas.height = renderHeight;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            let mime = item.file.type || "image/jpeg";
            if (convertWebp || mime === "image/png" || mime === "image/svg+xml" || mime === "image/bmp") {
              mime = "image/webp";
            }

            // Fill white background for JPEG/WEBP if original PNG had transparency
            if (mime === "image/jpeg") {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, renderWidth, renderHeight);
            }

            ctx.drawImage(img, 0, 0, renderWidth, renderHeight);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  resolve({
                    compressedBlob: blob,
                    compressedUrl: url,
                    compressedSize: blob.size,
                    isProcessing: false,
                  });
                } else {
                  resolve({ isProcessing: false });
                }
              },
              mime,
              q / 100
            );
          } else {
            resolve({ isProcessing: false });
          }
        };
        img.src = item.src;
      });
    },
    [preset]
  );

  useEffect(() => {
    if (items.length === 0) return;

    const currentQuality = getEffectiveQuality();
    items.forEach((item) => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isProcessing: true } : i))
      );

      compressSingleItem(item, currentQuality, autoConvertWebp).then((result) => {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, ...result } : i))
        );
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, customQuality, autoConvertWebp]);

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

  const downloadSingle = (item: CompressItem) => {
    if (!item.compressedUrl) return;
    const rawName = item.file.name || "image";
    const lastDotIndex = rawName.lastIndexOf(".");
    const nameWithoutExt = lastDotIndex > 0 ? rawName.substring(0, lastDotIndex) : rawName;
    const isWebp = autoConvertWebp || item.file.type === "image/png";
    const ext = isWebp ? "webp" : lastDotIndex > 0 ? rawName.substring(lastDotIndex + 1) : "jpg";
    const filename = `${nameWithoutExt}_min.${ext}`;

    const link = document.createElement("a");
    link.href = item.compressedUrl;
    link.setAttribute("download", filename);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    items.forEach((item, index) => {
      if (item.compressedUrl) {
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

  const getTotalSavings = () => {
    const totalOrig = items.reduce((acc, item) => acc + item.origSize, 0);
    const totalComp = items.reduce((acc, item) => acc + (item.compressedSize || item.origSize), 0);
    if (totalOrig === 0) return { orig: 0, comp: 0, savedBytes: 0, savedPercent: 0 };
    const savedBytes = Math.max(0, totalOrig - totalComp);
    const savedPercent = Math.round((savedBytes / totalOrig) * 100);
    return { orig: totalOrig, comp: totalComp, savedBytes, savedPercent };
  };

  const stats = getTotalSavings();

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
                    background: "rgba(52,211,153,0.15)",
                    border: "1px solid rgba(52,211,153,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#34d399",
                  }}
                >
                  <ZoomOut size={20} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                  {t("imageCompress.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "620px" }}>
                {t("imageCompress.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "rgba(52,211,153,0.1)",
                border: "1px solid rgba(52,211,153,0.2)",
                fontSize: "12px",
                color: "#6ee7b7",
                fontWeight: 600,
              }}
            >
              <Sparkles size={12} />
              100% Client-Side Smart Compression
            </div>
          </div>
        </section>

        {/* ── Main Workspace ─────────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {/* Preset Controls */}
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
              {/* Presets */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("imageCompress.compressLevel")}
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[
                    { key: "recommended", label: t("imageCompress.levelRecommended") },
                    { key: "high", label: t("imageCompress.levelHigh") },
                    { key: "low", label: t("imageCompress.levelLow") },
                    { key: "custom", label: t("imageCompress.levelCustom") },
                  ].map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPreset(p.key as CompressPreset)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: preset === p.key ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.05)",
                        border: preset === p.key ? "1px solid #34d399" : "1px solid var(--border-subtle)",
                        color: preset === p.key ? "#6ee7b7" : "var(--text-secondary)",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Quality Slider */}
              {preset === "custom" && (
                <div style={{ minWidth: "160px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 700, textTransform: "uppercase" }}>{t("imageCompress.quality")}</span>
                    <span style={{ color: "#34d399", fontWeight: 700 }}>{customQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={customQuality}
                    onChange={(e) => setCustomQuality(parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "#10b981", cursor: "pointer" }}
                  />
                </div>
              )}

              {/* WebP Auto Checkbox */}
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: 600,
                  marginTop: "18px",
                }}
              >
                <input
                  type="checkbox"
                  checked={autoConvertWebp}
                  onChange={(e) => setAutoConvertWebp(e.target.checked)}
                  style={{ accentColor: "#10b981", cursor: "pointer", width: "16px", height: "16px" }}
                />
                {t("imageCompress.autoWebp")}
              </label>
            </div>

            {/* Total Savings Summary & Actions */}
            {items.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Total Saved</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#34d399" }}>
                    {formatBytes(stats.savedBytes)} ({stats.savedPercent}% saved)
                  </div>
                </div>

                <button
                  onClick={downloadAll}
                  style={{
                    height: "40px",
                    padding: "0 18px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                  }}
                >
                  <Download size={15} />
                  {t("imageCompress.downloadAll")} ({items.length})
                </button>

                <button
                  onClick={handleReset}
                  style={{
                    height: "40px",
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
                  {t("imageCompress.reset")}
                </button>
              </div>
            )}
          </div>

          {/* Upload Area / Cards Grid */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="glass-card"
            style={{
              padding: items.length === 0 ? "64px 32px" : "24px",
              textAlign: items.length === 0 ? "center" : "left",
              border: isDragging ? "2px dashed #10b981" : "2px dashed var(--border-subtle)",
              background: isDragging ? "rgba(16,185,129,0.08)" : "var(--glass-bg)",
              transition: "all 0.2s",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp, image/gif, image/bmp"
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
                    background: "rgba(52,211,153,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#34d399",
                  }}
                >
                  <Upload size={32} />
                </div>

                <div>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                    {t("imageCompress.dropPrompt")}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Supports PNG, JPG, WEBP, GIF, BMP (Batch upload & compression)
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Layers size={16} color="#34d399" />
                    {items.length} {t("imageCompress.filesSelected")}
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
                    Add More Images
                  </button>
                </div>

                {/* Cards Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {items.map((item) => {
                    const savedBytes = Math.max(0, item.origSize - (item.compressedSize || item.origSize));
                    const savedPercent = item.origSize > 0 ? Math.round((savedBytes / item.origSize) * 100) : 0;

                    return (
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

                        {/* Thumbnail */}
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
                            src={item.compressedUrl || item.src}
                            alt={item.file.name}
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                          />
                        </div>

                        {/* Details */}
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
                            <span>Orig: {formatBytes(item.origSize)}</span>
                          </div>
                        </div>

                        {/* Compression Savings */}
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
                          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                            {formatBytes(item.compressedSize || item.origSize)}
                          </span>
                          {item.compressedSize > 0 ? (
                            <span
                              style={{
                                fontWeight: 800,
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: savedPercent > 0 ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)",
                                color: savedPercent > 0 ? "#34d399" : "#fbbf24",
                              }}
                            >
                              {savedPercent > 0 ? `-${savedPercent}%` : "0%"}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>{t("imageCompress.compressing")}</span>
                          )}
                        </div>

                        {/* Download Single */}
                        <button
                          onClick={() => downloadSingle(item)}
                          disabled={!item.compressedUrl}
                          style={{
                            width: "100%",
                            height: "36px",
                            borderRadius: "8px",
                            background: item.compressedUrl ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
                            border: item.compressedUrl ? "1px solid #34d399" : "1px solid var(--border-subtle)",
                            color: item.compressedUrl ? "#6ee7b7" : "var(--text-muted)",
                            fontWeight: 700,
                            fontSize: "12.5px",
                            cursor: item.compressedUrl ? "pointer" : "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <Download size={14} />
                          {t("imageCompress.download")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────── */}
        <ToolGuide
          badgeText="100% Client-Side & Private"
          aboutTitle={t("imageCompress.guide.aboutTitle")}
          aboutDesc={t("imageCompress.guide.aboutDesc")}
          howTitle={t("imageCompress.guide.howTitle")}
          steps={[
            t("imageCompress.guide.step1"),
            t("imageCompress.guide.step2"),
            t("imageCompress.guide.step3"),
          ]}
          faqs={[
            { q: t("imageCompress.guide.faq1Q"), a: t("imageCompress.guide.faq1A") },
            { q: t("imageCompress.guide.faq2Q"), a: t("imageCompress.guide.faq2A") },
            { q: t("imageCompress.guide.faq3Q"), a: t("imageCompress.guide.faq3A") },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}
