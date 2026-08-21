"use client";

/**
 * app/tools/background-remover/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Browser-native AI Background Removal tool for desktools.run
 * Powered by 100% Client-Side WebAI Neural Network (@imgly/background-removal)
 * Features interactive Manual Touch-Up Brush (Restore & Erase)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Eraser,
  Upload,
  ArrowLeft,
  Download,
  RotateCcw,
  Bot,
  Paintbrush,
  Undo,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

type BgStyle = "transparent" | "white" | "black" | "custom";
type BrushMode = "none" | "restore" | "erase";

export default function BackgroundRemoverPage() {
  const { t } = useLocale();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  const [bgStyle, setBgStyle] = useState<BgStyle>("transparent");
  const [customBgColor, setCustomBgColor] = useState<string>("#6366f1");

  // Touch-up Brush Controls
  const [brushMode, setBrushMode] = useState<BrushMode>("none");
  const [brushSize, setBrushSize] = useState<number>(30);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const [aiCutoutBlob, setAiCutoutBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgElementRef = useRef<HTMLImageElement | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    setImageFile(file);
    setAiCutoutBlob(null);
    setProcessedUrl("");
    setProgressPercent(0);
    setStatusMessage("");
    setBrushMode("none");

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);
        originalImgElementRef.current = img;
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  // Run 100% Client-Side AI Background Removal Neural Net
  useEffect(() => {
    if (!imageFile) return;

    let isMounted = true;
    setIsProcessing(true);
    setProgressPercent(10);
    setStatusMessage("Loading Web AI Neural Network...");

    const runAiRemoval = async () => {
      try {
        const { removeBackground } = await import("@imgly/background-removal");

        if (!isMounted) return;
        setStatusMessage("Analyzing subject and erasing background...");

        const blob = await removeBackground(imageFile, {
          progress: (key, current, total) => {
            if (!isMounted) return;
            if (total > 0) {
              const pct = Math.round((current / total) * 100);
              setProgressPercent(Math.min(99, Math.max(15, pct)));
            }
          },
        });

        if (!isMounted) return;
        setAiCutoutBlob(blob);
        setProgressPercent(100);
        setIsProcessing(false);
      } catch (error) {
        console.error("AI Background Removal Error:", error);
        if (!isMounted) return;
        setIsProcessing(false);
        setStatusMessage("Error removing background with AI.");
      }
    };

    runAiRemoval();

    return () => {
      isMounted = false;
    };
  }, [imageFile]);

  // Initial rendering of AI Cutout onto hidden working Canvas
  const updateResultUrl = useCallback(() => {
    if (!resultCanvasRef.current || origWidth === 0 || origHeight === 0) return;
    const workCanvas = resultCanvasRef.current;

    if (bgStyle !== "transparent") {
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = origWidth;
      finalCanvas.height = origHeight;
      const finalCtx = finalCanvas.getContext("2d");

      if (finalCtx) {
        if (bgStyle === "white") {
          finalCtx.fillStyle = "#ffffff";
        } else if (bgStyle === "black") {
          finalCtx.fillStyle = "#000000";
        } else if (bgStyle === "custom") {
          finalCtx.fillStyle = customBgColor;
        }
        finalCtx.fillRect(0, 0, origWidth, origHeight);
        finalCtx.drawImage(workCanvas, 0, 0);

        finalCanvas.toBlob((finalBlob) => {
          if (finalBlob) setProcessedUrl(URL.createObjectURL(finalBlob));
        }, "image/png");
      }
    } else {
      workCanvas.toBlob((finalBlob) => {
        if (finalBlob) setProcessedUrl(URL.createObjectURL(finalBlob));
      }, "image/png");
    }
  }, [bgStyle, customBgColor, origWidth, origHeight]);

  useEffect(() => {
    if (!aiCutoutBlob || origWidth === 0 || origHeight === 0) return;

    const img = new Image();
    const cutoutUrl = URL.createObjectURL(aiCutoutBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = origWidth;
      canvas.height = origHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0, origWidth, origHeight);
        resultCanvasRef.current = canvas;
        updateResultUrl();
      }
      URL.revokeObjectURL(cutoutUrl);
    };

    img.src = cutoutUrl;
  }, [aiCutoutBlob, origWidth, origHeight, updateResultUrl]);

  useEffect(() => {
    updateResultUrl();
  }, [bgStyle, customBgColor, updateResultUrl]);

  // Interactive Brush Touch-Up (Restore / Erase)
  const applyBrushAt = (clientX: number, clientY: number, targetImgEl: HTMLImageElement) => {
    if (brushMode === "none" || !resultCanvasRef.current || !originalImgElementRef.current) return;
    const canvas = resultCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = targetImgEl.getBoundingClientRect();
    const imgRatio = origWidth / origHeight;
    const containerRatio = rect.width / rect.height;

    let renderW = rect.width;
    let renderH = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (containerRatio > imgRatio) {
      renderW = rect.height * imgRatio;
      offsetX = (rect.width - renderW) / 2;
    } else {
      renderH = rect.width / imgRatio;
      offsetY = (rect.height - renderH) / 2;
    }

    const relativeX = clientX - rect.left - offsetX;
    const relativeY = clientY - rect.top - offsetY;

    if (relativeX < 0 || relativeX > renderW || relativeY < 0 || relativeY > renderH) return;

    const canvasX = (relativeX / renderW) * origWidth;
    const canvasY = (relativeY / renderH) * origHeight;

    const scaledBrushRadius = (brushSize / renderW) * origWidth;

    if (brushMode === "erase") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, scaledBrushRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (brushMode === "restore") {
      // Restore original pixels inside circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, scaledBrushRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(originalImgElementRef.current, 0, 0, origWidth, origHeight);
      ctx.restore();
    }

    updateResultUrl();
  };

  const handleResultMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (brushMode === "none") return;
    setIsDrawing(true);
    applyBrushAt(e.clientX, e.clientY, e.currentTarget);
  };

  const handleResultMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isDrawing || brushMode === "none") return;
    applyBrushAt(e.clientX, e.clientY, e.currentTarget);
  };

  const handleResultMouseUp = () => {
    setIsDrawing(false);
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownload = () => {
    if (!processedUrl || !imageFile) return;

    const rawName = imageFile.name || "image";
    const lastDotIndex = rawName.lastIndexOf(".");
    const nameWithoutExt = lastDotIndex > 0 ? rawName.substring(0, lastDotIndex) : rawName;
    const filename = `${nameWithoutExt}_nobg_ai.png`;

    const link = document.createElement("a");
    link.href = processedUrl;
    link.setAttribute("download", filename);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImageFile(null);
    setImageSrc("");
    setOrigWidth(0);
    setOrigHeight(0);
    setAiCutoutBlob(null);
    setProcessedUrl("");
    setProgressPercent(0);
    setBrushMode("none");
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
                    background: "rgba(236,72,153,0.15)",
                    border: "1px solid rgba(236,72,153,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f472b6",
                  }}
                >
                  <Eraser size={20} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                  {t("backgroundRemover.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "620px" }}>
                {t("backgroundRemover.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "rgba(236,72,153,0.1)",
                border: "1px solid rgba(236,72,153,0.2)",
                fontSize: "12px",
                color: "#f472b6",
                fontWeight: 600,
              }}
            >
              <Bot size={14} />
              100% Client-Side Web AI Neural Net
            </div>
          </div>
        </section>

        {/* ── Main Workspace ─────────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {!imageFile ? (
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
                border: isDragging ? "2px dashed #ec4899" : "2px dashed var(--border-subtle)",
                background: isDragging ? "rgba(236,72,153,0.08)" : "var(--glass-bg)",
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
                accept="image/png, image/jpeg, image/webp, image/bmp"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                style={{ display: "none" }}
              />

              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "rgba(236,72,153,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f472b6",
                }}
              >
                <Upload size={32} />
              </div>

              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {t("backgroundRemover.dropPrompt")}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Supports PNG, JPG, WEBP, BMP (Automatic AI Subject Segmentation)
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Dual Previews */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Original Image */}
                  <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                        {t("backgroundRemover.original")}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                        {origWidth} × {origHeight} px
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "380px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt="Original photo"
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                      Original Photo Uploaded
                    </p>
                  </div>

                  {/* AI Removed Background Result with Touch-up Brush Canvas */}
                  <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#f472b6", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Bot size={15} />
                        {t("backgroundRemover.removed")} (AI)
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", background: "rgba(236,72,153,0.15)", color: "#f472b6" }}>
                        PNG Alpha
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "380px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background:
                          bgStyle === "transparent"
                            ? "linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.08) 75%)"
                            : bgStyle === "white"
                            ? "#ffffff"
                            : bgStyle === "black"
                            ? "#000000"
                            : customBgColor,
                        backgroundColor: bgStyle === "transparent" ? "#1e293b" : "transparent",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        cursor: brushMode !== "none" ? "crosshair" : "default",
                      }}
                    >
                      {isProcessing ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "0 24px", textAlign: "center" }}>
                          <RefreshCw size={32} className="spin-icon" style={{ color: "#ec4899" }} />
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                              {statusMessage || "AI Neural Network Processing..."}
                            </p>
                            <p style={{ fontSize: "12px", color: "#f472b6", fontWeight: 600 }}>
                              {progressPercent}% Complete
                            </p>
                          </div>

                          {/* Progress bar */}
                          <div style={{ width: "200px", height: "6px", borderRadius: "100px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${progressPercent}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, #ec4899, #d946ef)",
                                transition: "width 0.3s ease-in-out",
                              }}
                            />
                          </div>
                        </div>
                      ) : processedUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={processedUrl}
                          alt="AI Cutout Result"
                          onMouseDown={handleResultMouseDown}
                          onMouseMove={handleResultMouseMove}
                          onMouseUp={handleResultMouseUp}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", userSelect: "none" }}
                        />
                      ) : (
                        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Waiting for AI processing...</div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                      <span>Mode: <strong style={{ color: "var(--text-primary)" }}>{bgStyle.toUpperCase()}</strong></span>
                      <span style={{ color: "#f472b6", fontWeight: 700 }}>100% Private (Web AI)</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleDownload}
                    disabled={!processedUrl || isProcessing}
                    style={{
                      flex: 1,
                      height: "46px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #ec4899, #d946ef)",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "14.5px",
                      cursor: processedUrl && !isProcessing ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(236,72,153,0.3)",
                      opacity: processedUrl && !isProcessing ? 1 : 0.6,
                    }}
                  >
                    <Download size={17} />
                    {t("backgroundRemover.download")}
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
                    {t("backgroundRemover.reset")}
                  </button>
                </div>
              </div>

              {/* Sidebar Controls */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", height: "fit-content" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Touch-up & Tools
                </h3>

                {/* Touch-up Restoration Brush Tools */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>
                    수동 터치업 브러시 (지워진 부분 살리기)
                  </label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <button
                      onClick={() => setBrushMode(brushMode === "restore" ? "none" : "restore")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        background: brushMode === "restore" ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.05)",
                        border: brushMode === "restore" ? "1px solid #f472b6" : "1px solid var(--border-subtle)",
                        color: brushMode === "restore" ? "#f472b6" : "var(--text-secondary)",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Paintbrush size={15} />
                      복원 브러시
                    </button>

                    <button
                      onClick={() => setBrushMode(brushMode === "erase" ? "none" : "erase")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        background: brushMode === "erase" ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.05)",
                        border: brushMode === "erase" ? "1px solid #f472b6" : "1px solid var(--border-subtle)",
                        color: brushMode === "erase" ? "#f472b6" : "var(--text-secondary)",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Eraser size={15} />
                      지우개 브러시
                    </button>
                  </div>

                  {brushMode !== "none" && (
                    <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 600 }}>브러시 크기</span>
                        <span style={{ color: "#f472b6", fontWeight: 700 }}>{brushSize}px</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        style={{ width: "100%", accentColor: "#ec4899", cursor: "pointer" }}
                      />
                      <p style={{ fontSize: "11px", color: "#f472b6", marginTop: "6px", fontWeight: 600 }}>
                        💡 이미지 위를 드래그하여 지워진 노트북/옷을 100% 원본으로 복원하세요!
                      </p>
                    </div>
                  )}
                </div>

                {/* Background Replacement Style */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>
                    {t("backgroundRemover.bgStyle")}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {[
                      { key: "transparent", label: t("backgroundRemover.bgTransparent") },
                      { key: "white", label: t("backgroundRemover.bgWhite") },
                      { key: "black", label: t("backgroundRemover.bgBlack") },
                      { key: "custom", label: t("backgroundRemover.bgCustom") },
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => setBgStyle(st.key as BgStyle)}
                        style={{
                          height: "36px",
                          borderRadius: "8px",
                          background: bgStyle === st.key ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.05)",
                          border: bgStyle === st.key ? "1px solid #f472b6" : "1px solid var(--border-subtle)",
                          color: bgStyle === st.key ? "#f472b6" : "var(--text-secondary)",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Input */}
                {bgStyle === "custom" && (
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      Custom Color Hex
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="color"
                        value={customBgColor}
                        onChange={(e) => setCustomBgColor(e.target.value)}
                        style={{ width: "36px", height: "36px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                      />
                      <input
                        type="text"
                        value={customBgColor}
                        onChange={(e) => setCustomBgColor(e.target.value)}
                        style={{
                          flex: 1,
                          height: "36px",
                          borderRadius: "6px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          padding: "0 10px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────── */}
        <ToolGuide
          badgeText="100% Client-Side Web AI"
          aboutTitle={t("backgroundRemover.guide.aboutTitle")}
          aboutDesc={t("backgroundRemover.guide.aboutDesc")}
          howTitle={t("backgroundRemover.guide.howTitle")}
          steps={[
            t("backgroundRemover.guide.step1"),
            t("backgroundRemover.guide.step2"),
            t("backgroundRemover.guide.step3"),
          ]}
          faqs={[
            { q: t("backgroundRemover.guide.faq1Q"), a: t("backgroundRemover.guide.faq1A") },
            { q: t("backgroundRemover.guide.faq2Q"), a: t("backgroundRemover.guide.faq2A") },
            { q: t("backgroundRemover.guide.faq3Q"), a: t("backgroundRemover.guide.faq3A") },
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
