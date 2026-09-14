"use client";

/**
 * app/tools/background-remover/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Browser-native AI Background Removal tool for desktools.run
 * Powered by 100% Client-Side WebAI Neural Network (@imgly/background-removal)
 * Includes Automatic AI Hole Filling & Foreground Alpha Solidifier Engine
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Eraser,
  Upload,
  ArrowLeft,
  Download,
  RotateCcw,
  Sparkles,
  Bot,
  RefreshCw,
  Zap,
  ShieldCheck,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

type BgStyle = "transparent" | "white" | "black" | "custom";

export default function BackgroundRemoverPage() {
  const { t, locale } = useLocale();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  const [bgStyle, setBgStyle] = useState<BgStyle>("transparent");
  const [customBgColor, setCustomBgColor] = useState<string>("#6366f1");
  const [solidifySubject, setSolidifySubject] = useState<boolean>(true); // Solidify semi-transparent hand/leg areas

  const [aiCutoutBlob, setAiCutoutBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    setImageFile(file);
    setAiCutoutBlob(null);
    setProcessedUrl("");
    setProgressPercent(0);
    setStatusMessage("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);
        originalImgRef.current = img;
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

  // Process AI Cutout + Automatic Foreground Alpha Solidifier Engine
  useEffect(() => {
    if (!aiCutoutBlob || origWidth === 0 || origHeight === 0 || !originalImgRef.current) return;

    const img = new Image();
    const cutoutUrl = URL.createObjectURL(aiCutoutBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = origWidth;
      canvas.height = origHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0, origWidth, origHeight);
        const imgData = ctx.getImageData(0, 0, origWidth, origHeight);
        const data = imgData.data;
        const totalPixels = origWidth * origHeight;

        // 1. Mark outer image edges as seed background pixels (Flood Fill)
        const isOuterBg = new Uint8Array(totalPixels);
        const queue: number[] = [];

        // Check top & bottom outer borders
        for (let x = 0; x < origWidth; x++) {
          const topIdx = x;
          const botIdx = (origHeight - 1) * origWidth + x;
          if (data[topIdx * 4 + 3] < 100) {
            isOuterBg[topIdx] = 1;
            queue.push(topIdx);
          }
          if (data[botIdx * 4 + 3] < 100) {
            isOuterBg[botIdx] = 1;
            queue.push(botIdx);
          }
        }

        // Check left & right outer borders
        for (let y = 0; y < origHeight; y++) {
          const leftIdx = y * origWidth;
          const rightIdx = y * origWidth + (origWidth - 1);
          if (data[leftIdx * 4 + 3] < 100 && !isOuterBg[leftIdx]) {
            isOuterBg[leftIdx] = 1;
            queue.push(leftIdx);
          }
          if (data[rightIdx * 4 + 3] < 100 && !isOuterBg[rightIdx]) {
            isOuterBg[rightIdx] = 1;
            queue.push(rightIdx);
          }
        }

        // BFS to flood fill true outer background
        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++];
          const px = curr % origWidth;
          const py = Math.floor(curr / origWidth);

          const neighbors = [
            [px + 1, py],
            [px - 1, py],
            [px, py + 1],
            [px, py - 1],
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < origWidth && ny >= 0 && ny < origHeight) {
              const nIdx = ny * origWidth + nx;
              if (!isOuterBg[nIdx] && data[nIdx * 4 + 3] < 100) {
                isOuterBg[nIdx] = 1;
                queue.push(nIdx);
              }
            }
          }
        }

        // 2. Foreground Solidifier: Fill all non-outer background pixels with 100% solid original image!
        if (solidifySubject) {
          const origCanvas = document.createElement("canvas");
          origCanvas.width = origWidth;
          origCanvas.height = origHeight;
          const origCtx = origCanvas.getContext("2d");

          if (origCtx && originalImgRef.current) {
            origCtx.drawImage(originalImgRef.current, 0, 0);
            const origData = origCtx.getImageData(0, 0, origWidth, origHeight).data;

            for (let i = 0; i < totalPixels; i++) {
              const idx = i * 4;
              if (!isOuterBg[i]) {
                // Restore 100% solid original pixels for hands, legs, clothes & laptop!
                data[idx] = origData[idx];
                data[idx + 1] = origData[idx + 1];
                data[idx + 2] = origData[idx + 2];
                data[idx + 3] = 255;
              } else {
                // Ensure true background is fully 0 transparent
                data[idx + 3] = 0;
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Apply background style
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
            finalCtx.drawImage(canvas, 0, 0);

            finalCanvas.toBlob((finalBlob) => {
              if (finalBlob) setProcessedUrl(URL.createObjectURL(finalBlob));
            }, "image/png");
          }
        } else {
          canvas.toBlob((finalBlob) => {
            if (finalBlob) setProcessedUrl(URL.createObjectURL(finalBlob));
          }, "image/png");
        }
      }
      URL.revokeObjectURL(cutoutUrl);
    };

    img.src = cutoutUrl;
  }, [aiCutoutBlob, origWidth, origHeight, bgStyle, customBgColor, solidifySubject]);

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
            {t("backgroundRemover.back")}
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
              {t("backgroundRemover.badge")}
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
                  {t("backgroundRemover.dropDesc")}
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

                  {/* AI Removed Background Result */}
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
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
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
                  AI Enhancement Options
                </h3>

                {/* Foreground Solidifier Toggle */}
                <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#f472b6", display: "flex", alignItems: "center", gap: "6px" }}>
                      <ShieldCheck size={15} />
                      손·다리 피사체 영역 100% 또렷하게 보존
                    </span>
                    <input
                      type="checkbox"
                      checked={solidifySubject}
                      onChange={(e) => setSolidifySubject(e.target.checked)}
                      style={{ accentColor: "#ec4899", cursor: "pointer", width: "16px", height: "16px" }}
                    />
                  </div>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                    손, 무릎, 바지 등 하단 영역이 반투명하게 투명해지지 않고 100% 또렷하고 불투명하게 완전 보존됩니다.
                  </p>
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

        {/* ── Unified Tool Guide & FAQ Section (Full 6-Language Support) ───────── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "브라우저 네이티브 온디바이스 AI 이미지 배경 제거기 (누끼 따기)",
              aboutDesc: "최신 WebAssembly 및 ONNX Web AI 신경망 모델(@imgly/background-removal)과 자동 전경 보정(Foreground Alpha Solidifier) 엔진을 탑재하여, 단 한 번의 클릭으로 사진 속 인물, 제품, 반려동물, 사물의 배경을 정밀하게 분리해 투명 PNG로 추출합니다. 모든 인공지능 연산이 사용자의 브라우저 내부에서 100% 로컬로 구동되므로, 소중한 개인 사진이나 신제품 기밀 이미지가 외부 클라우드 서버로 단 1바이트도 유출되지 않습니다.",
              howTitle: "단계별 누끼 따기 사용 방법",
              steps: [
                "배경을 지우고 싶은 사진을 드래그앤드롭하거나 클릭하여 업로드합니다 (PNG, JPG, WEBP, BMP 지원).",
                "로컬 브라우저에서 실행되는 AI 신경망이 피사체를 자동으로 인식하고 배경을 정밀하게 지워냅니다.",
                "우측 패널에서 피사체 보존 옵션(손·다리 또렷하게 보존) 및 원하는 배경 스타일(투명 / 흰색 / 검은색 / 맞춤 색상)을 선택합니다.",
                "좌우 실시간 비교 화면을 통해 누끼 분리 결과물을 고화질로 검토합니다.",
                "'투명 배경 PNG 다운로드' 버튼을 클릭하여 결과물을 기기에 즉시 저장합니다.",
              ],
              featuresTitle: "배경 제거기 핵심 AI 엔지니어링 기능",
              features: [
                { title: "온디바이스 Web AI 인공지능 모델", desc: "서버 통신 없이 브라우저 GPU/Wasm 가속을 통해 초고속으로 피사체 윤곽을 정밀 감지합니다." },
                { title: "전경 보존 엔진 (Foreground Alpha Solidifier)", desc: "인물의 손, 다리, 옷깃 등 하단 부위가 의도치 않게 반투명해지는 현상을 100% 방지하고 선명하게 복원합니다." },
                { title: "다양한 배경 합성 스타일 (Multi-Backdrop)", desc: "투명 배경(Alpha PNG)뿐만 아니라 깔끔한 흰색, 세련된 블랙, 사용자 지정 단색 배경으로 즉시 교체 가능합니다." },
                { title: "100% 로컬 프라이버시 샌드박스 (Zero Cloud Leak)", desc: "이미지가 서버로 전송되지 않아 인물 사진, 사원증, 기밀 상품 사진도 완벽하게 보호됩니다." },
              ],
              useCasesTitle: "실무 추천 활용 시나리오",
              useCases: [
                { icon: "🛍️", title: "스마트스토어 & 쿠팡 상품 누끼 컷 제작", desc: "복잡한 촬영 배경을 깔끔한 흰색 또는 투명으로 제거하여 오픈마켓 규격에 맞는 상품 썸네일을 제작합니다." },
                { icon: "👤", title: "이력서·증명사진 & 링크드인 프로필 배경 정리", desc: "지저분한 일상 배경을 지우고 신뢰감을 주는 단색 배경으로 깔끔하게 교체합니다." },
                { icon: "🎨", title: "카드뉴스·유튜브 썸네일 & 배너 그래픽 디자인", desc: "포토샵 없이도 인물과 아이콘의 배경을 1초 만에 투명화하여 디자인 레이어에 손쉽게 배치합니다." },
                { icon: "🐾", title: "반려동물 스티커 및 굿즈 디자인 제작", desc: "강아지, 고양이 사진에서 털의 미세한 윤곽을 살려 투명 스티커와 굿즈용 에셋을 만듭니다." },
              ],
              proTipsTitle: "전문가 AI 누끼 따기 노하우",
              proTips: [
                "피사체와 배경의 명도/색상 대비가 뚜렷할수록 더욱 정교하고 자연스러운 경계선 추출이 가능합니다.",
                "의류나 모델의 다리 부분이 흐릿해지는 경우 '손·다리 피사체 영역 100% 또렷하게 보존' 옵션을 켜두시면 원본의 색상이 선명하게 살아납니다.",
                "쇼핑몰 업로드용 이미지는 '화이트(White)' 배경을 선택하여 오픈마켓 표준 규격(1000x1000)으로 바로 활용하세요.",
                "투명 배경으로 저장하려면 반드시 'PNG' 파일로 다운로드되어야 투명도 레이어가 유지됩니다.",
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "배경 제거 작업 시 사진이 외부 서버로 전송되나요?", a: "전혀 전송되지 않습니다! desktools.run은 브라우저 내장 WebAssembly AI 엔진을 사용하여 100% 사용자 컴퓨터 로컬에서만 실행됩니다." },
                { q: "머리카락이나 동물 털처럼 복잡한 경계도 깔끔하게 따지나요?", a: "네! 최신 딥러닝 세그멘테이션 모델이 적용되어 머리카락, 옷깃, 깃털 등 미세한 디테일까지 정밀하게 분리합니다." },
                { q: "완성된 이미지를 상업적(쇼핑몰/광고)으로 사용해도 되나요?", a: "네! 생성된 결과물의 저작권은 100% 사용자에게 있으며 상업적 용도로 자유롭게 활용하실 수 있습니다." },
                { q: "결과물에 워터마크가 찍히거나 화질이 저하되나요?", a: "워터마크가 전혀 없으며 원본 사진의 해상도와 픽셀 퀄리티를 그대로 보존하여 출력합니다." },
                { q: "스마트폰(아이폰/안드로이드) 모바일에서도 작동하나요?", a: "네! 최신 모바일 브라우저의 WebAssembly/WebGL 가속을 지원하여 스마트폰에서도 터치로 편리하게 누끼를 딸 수 있습니다." },
                { q: "누끼 작업 횟수에 제한이나 유료 결제가 있나요?", a: "완전 100% 무료이며 이용 횟수 제한, 구독료, 포인트 차감 없이 무제한으로 사용하실 수 있습니다." },
              ],
              relatedToolsTitle: "함께 쓰면 좋은 연관 도구",
              relatedTools: [
                { title: "이미지 크기 조절 (Image Resizer)", desc: "누끼 딴 이미지의 해상도(px/%)를 상품 등록 규격에 맞춰 조절합니다.", href: "/tools/image-resizer/" },
                { title: "이미지 용량 압축기 (Image Compress)", desc: "투명 PNG의 용량을 화질 저하 없이 최대 80% 줄여 웹 로딩을 가속합니다.", href: "/tools/image-compress/" },
                { title: "이미지 포맷 변환기 (Image Converter)", desc: "투명 PNG를 WebP, JPG 등 원하는 다양한 포맷으로 상호 변환합니다.", href: "/tools/image-converter/" },
                { title: "워터마크 추가기 (Image Watermark)", desc: "누끼 딴 상품 이미지에 브랜드 로고 및 저작권 텍스트를 합성합니다.", href: "/tools/image-watermark/" },
              ],
            },
            ja: {
              aboutTitle: "ブラウザネイティブ端末内AI画像背景透過・切り抜きツール（ヌッキ）",
              aboutDesc: "最新のWebAssemblyおよびONNX Web AIニューラルネットワーク（@imgly/background-removal）と自動前景補正エンジンを搭載し、ワンクリックで人物、商品、ペット、物体の背景を瞬時に高精度除去します。すべてのAI推論がお使いのブラウザ内で100%ローカルに実行されるため、プライベートな写真や機密商品画像も完全に保護されます。",
              howTitle: "ステップ別のご利用手順",
              steps: [
                "背景を削除したい画像をドラッグ＆ドロップまたはクリックして選択します（PNG、JPG、WEBP、BMPに対応）。",
                "ブラウザ内のAIモデルが被写体を自動認識し、背景を高精度に切り抜きます。",
                "右側の設定パネルで被写体保護オプションや背景スタイル（透過 / 白 / 黒 / カスタム色）を選択します。",
                "左右のプレビューで切り抜き結果を高解像度で確認します。",
                "「透過PNGダウンロード」ボタンをクリックして保存します。",
              ],
              featuresTitle: "背景除去ツールの主なAI技術と特徴",
              features: [
                { title: "端末内完結のWeb AIニューラルネットワーク", desc: "サーバー通信不要。ブラウザのWasm/GPUアクセラレーションにより超高速に輪郭を検出します。" },
                { title: "前景保護エンジン（Foreground Alpha Solidifier）", desc: "人物の手足や服の裾が半透明になる現象を防止し、100%鮮明に復元・保持します。" },
                { title: "多彩な背景合成スタイル", desc: "透明PNG（Alpha）だけでなく、白背景、シックな黒、カスタムカラー背景への差し替えが可能です。" },
                { title: "完全ローカル・安心プライバシー（Zero Cloud Upload）", desc: "画像が外部へ送信されないため、人物写真や機密データも安全に処理できます。" },
              ],
              useCasesTitle: "実務での活用シーン",
              useCases: [
                { icon: "🛍️", title: "ECサイト・ネットショップの商品画像切り抜き", desc: "乱雑な撮影背景を白や透過に変更し、モールの出品規格に適合したサムネイルを作成します。" },
                { icon: "👤", title: "証明写真・SNSプロフィール写真の背景整理", desc: "日常の背景を消去し、清潔感のある単色背景に差し替えて好印象な写真に仕上げます。" },
                { icon: "🎨", title: "バナー・YouTubeサムネイル・グラフィック制作", desc: "Photoshopなしで人物やオブジェクトの背景を瞬時に透過し、デザイン素材として活用します。" },
                { icon: "🐾", title: "ペットのオリジナルグッズ・ステッカー作成", desc: "愛犬・愛猫の細かな毛並みを綺麗に残したまま切り抜き、グッズ制作素材を作成します。" },
              ],
              proTipsTitle: "専門家によるAI切り抜きのヒント",
              proTips: [
                "被写体と背景の明暗・色彩のコントラストがはっきりしているほど、境界線がより綺麗に切り抜かれます。",
                "服や足元のディテールが薄く透けてしまう場合は「手足・被写体領域の完全保持」をオンにしてください。",
                "ECモール用の商品画像は「白背景（White）」を選択することで、そのまま規定サイズで使用できます。",
                "透明背景として保存したい場合は、必ず「PNG形式」でダウンロードしてください。",
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "背景除去処理の際、画像がサーバーへ送信されますか？", a: "一切送信されません！desktools.runはブラウザ内のWebAssembly AIエンジンを使用し、すべて端末内でローカル処理されます。" },
                { q: "髪の毛や動物の毛並みなど細かい輪郭も綺麗に抜けますか？", a: "はい！最新のディープラーニングモデルにより、髪の毛や毛並みなどの細部まで精細に分離します。" },
                { q: "作成した画像を商用利用（ネットショップ等）できますか？", a: "はい！生成された画像の権利は100%利用者にあり、商用・非商用問わず自由にご利用いただけます。" },
                { q: "透かし（ウォーターマーク）が付いたり画質が落ちたりしますか？", a: "透かしは一切入りません。元画像の解像度と品質を維持したまま高画質出力されます。" },
                { q: "スマートフォン（iPhone / Android）でも動作しますか？", a: "はい！モバイルブラウザからアプリ不要で快適にご利用いただけます。" },
                { q: "利用回数の制限や課金はありますか？", a: "完全無料・無制限です。登録やクレジット消費なしで何枚でもお使いいただけます。" },
              ],
              relatedToolsTitle: "関連する便利なツール",
              relatedTools: [
                { title: "画像リサイザー (Image Resizer)", desc: "切り抜いた画像の解像度（px/%）を出品規格に合わせて変更します。", href: "/tools/image-resizer/" },
                { title: "画像圧縮 (Image Compress)", desc: "透過PNGの画質を保ちながら最大80%軽量化します。", href: "/tools/image-compress/" },
                { title: "画像フォーマット変換 (Image Converter)", desc: "透過PNGをWebPやJPGなど用途に応じた形式に変換します。", href: "/tools/image-converter/" },
                { title: "ウォーターマーク追加 (Image Watermark)", desc: "切り抜いた商品画像に著作権ロゴやテキスト透かしを合成します。", href: "/tools/image-watermark/" },
              ],
            },
            es: {
              aboutTitle: "Eliminador de fondos de imágenes con IA local en el navegador",
              aboutDesc: "Equipado con redes neuronales WebAssembly y ONNX Web AI (@imgly/background-removal) y un motor de consolidación de primer plano, elimina el fondo de personas, productos, mascotas y objetos con un solo clic. Todo el proceso ocurre al 100% en la memoria de tu navegador, garantizando máxima privacidad sin enviar tus fotos a servidores externos.",
              howTitle: "Guía de uso paso a paso",
              steps: [
                "Arrastra y suelta o selecciona la imagen que deseas recortar (compatible con PNG, JPG, WEBP, BMP).",
                "La IA local detecta automáticamente al sujeto y elimina el fondo con extrema precisión.",
                "En el panel derecho, elige la preservación de extremidades y el estilo de fondo deseado (Transparente / Blanco / Negro / Color personalizado).",
                "Compara el resultado antes y después en la vista previa de alta definición.",
                "Haz clic en 'Descargar PNG transparente' para guardar la imagen resultante al instante.",
              ],
              featuresTitle: "Características principales de IA",
              features: [
                { title: "Modelo Web AI neuronal On-Device", desc: "Sin llamadas a la nube: aceleración por navegador para detección ultrarrápida de siluetas." },
                { title: "Motor de consolidación de primer plano", desc: "Evita transparencias no deseadas en manos, piernas y ropa, garantizando opacidad al 100%." },
                { title: "Múltiples estilos de fondo", desc: "Sustituye el fondo por transparencia (PNG Alpha), blanco limpio, negro elegante o cualquier color hexadecimal." },
                { title: "Privacidad 100% local (Sin subidas al servidor)", desc: "Tus imágenes nunca salen de tu dispositivo, ideal para fotos personales o productos confidenciales." },
              ],
              useCasesTitle: "Casos prácticos de uso",
              useCases: [
                { icon: "🛍️", title: "Fotografía de producto para tiendas online y marketplaces", desc: "Crea fondos blancos o transparentes profesionales para catálogos y tiendas de comercio electrónico." },
                { icon: "👤", title: "Fotos de perfil y documentos de identidad", desc: "Limpia fondos cotidianos y cámbialos por tonos neutros para CV y LinkedIn." },
                { icon: "🎨", title: "Diseño gráfico, miniaturas de YouTube y banners", desc: "Aísla elementos y personas en segundos para maquetar creatividades sin Photoshop." },
                { icon: "🐾", title: "Stickers y artículos personalizados de mascotas", desc: "Conserva los detalles finos del pelaje para crear pegatinas y merchandising único." },
              ],
              proTipsTitle: "Consejos profesionales de recorte con IA",
              proTips: [
                "Un buen contraste entre el sujeto y el fondo asegura un recorte perfecto en los bordes.",
                "Si notas que partes de la ropa o extremidades pierden opacidad, mantén activa la opción de consolidación de primer plano.",
                "Para e-commerce, elige el fondo 'Blanco' para cumplir de inmediato con los estándares de venta online.",
                "Descarga siempre en formato PNG para conservar la transparencia alfa sin compresión destructiva.",
              ],
              faqTitle: "Preguntas frecuentes (FAQ)",
              faqs: [
                { q: "¿Mis fotos se envían a algún servidor para procesarlas?", a: "¡No! Todo el procesamiento se realiza localmente en tu ordenador mediante WebAssembly y la IA del navegador." },
                { q: "¿Recorta con precisión detalles difíciles como el cabello?", a: "Sí, el modelo de segmentación profunda aísla detalles complejos como pelo, fibras textiles y contornos finos." },
                { q: "¿Puedo usar las imágenes resultantes para fines comerciales?", a: "¡Sí! Eres el dueño al 100% de tus imágenes y puedes usarlas libremente en tiendas y publicidad." },
                { q: "¿Añade marcas de agua o reduce la resolución?", a: "Sin marcas de agua y manteniendo la resolución y nitidez original de tu fotografía." },
                { q: "¿Funciona en teléfonos móviles (iOS / Android)?", a: "Sí, es totalmente compatible con navegadores móviles táctiles sin necesidad de instalar aplicaciones." },
                { q: "¿Existe algún límite diario o coste oculto?", a: "Es 100% gratuito, ilimitado y no requiere registros ni suscripciones." },
              ],
              relatedToolsTitle: "Herramientas relacionadas",
              relatedTools: [
                { title: "Redimensionador de imágenes (Image Resizer)", desc: "Ajusta las dimensiones de tus imágenes recortadas a las medidas estándar.", href: "/tools/image-resizer/" },
                { title: "Compresor de imágenes (Image Compress)", desc: "Reduce el peso de tus archivos PNG transparentes hasta un 80%.", href: "/tools/image-compress/" },
                { title: "Conversor de imágenes (Image Converter)", desc: "Convierte tus recortes a formatos WebP, JPG o ICO según tus necesidades.", href: "/tools/image-converter/" },
                { title: "Añadir marca de agua (Image Watermark)", desc: "Agrega firmas y logotipos a tus fotografías de producto.", href: "/tools/image-watermark/" },
              ],
            },
            zh: {
              aboutTitle: "浏览器本地端侧 AI 智能图片背景消除器 (一键抠图)",
              aboutDesc: "搭载最新 WebAssembly 与 ONNX Web AI 神经网络模型 (@imgly/background-removal) 以及前景智能实心固化引擎，一键即可秒级精细分离人物、商品、宠物及各类物体的背景，生成高质量透明 PNG。全套 AI 算法 100% 在用户本地浏览器内部运算，照片零上传云端服务器，杜绝商业机密与个人隐私泄露。",
              howTitle: "分步操作指南",
              steps: [
                "拖拽或点击上传需要抠图的照片（支持 PNG、JPG、WEBP、BMP 格式）。",
                "本地浏览器 AI 神经网络自动识别人像与主体轮廓并精准剥离背景。",
                "在右侧控制面板中开启手脚及肢体保护选项，或自由切换背景样式（透明 / 纯白 / 纯黑 / 自定义色）。",
                "在左右对比窗口中高分辨率实时预览抠图细节。",
                "点击“下载透明背景 PNG”按钮，即可将成品瞬间保存至本地。",
              ],
              featuresTitle: "核心 AI 算法与工程特性",
              features: [
                { title: "端侧 Web AI 神经网络引擎 (On-Device AI)", desc: "无需云端排队，利用浏览器 Wasm/GPU 加速实现超高速边缘轮廓分割。" },
                { title: "前景防半透实心固化技术 (Alpha Solidifier)", desc: "彻底解决人物手脚、腿部、衣摆因光影误判而半透明化的问题，百分之百还原实体质感。" },
                { title: "丰富背景一键替换 (Multi-Backdrop)", desc: "不仅支持透明 Alpha 图层，还可一键切换为电商白底、高级黑或任意 HEX 纯色底。" },
                { title: "100% 浏览器本地安全沙箱 (零服务器上传)", desc: "照片数据绝不离开运算设备，身份证、人像照、未发布新品样图安全无忧。" },
              ],
              useCasesTitle: "实战应用推荐场景",
              useCases: [
                { icon: "🛍️", title: "淘宝、京东、亚马逊电商商品白底主图制作", desc: "快速消除复杂拍摄杂物背景，一键换成标准白底图以符合平台入驻规范。" },
                { icon: "👤", title: "简历证件照与社交职场头像背景精修", desc: "擦除生活杂乱背景，更换为专业沉稳的单色背景，提升个人职业形象。" },
                { icon: "🎨", title: "公众号配图、B站/YouTube 封面与海报设计", desc: "无需打开庞大的 Photoshop 软件，1 秒提取人像与物体透明图层，轻松排版。" },
                { icon: "🐾", title: "萌宠可爱表情包与周边文创素材提取", desc: "精准保留猫狗毛发边缘细节，制作独一无二的贴纸和文创周边。" },
              ],
              proTipsTitle: "专家 AI 抠图优化技巧",
              proTips: [
                "主体与背景的明暗与色彩反差越明显，AI 边缘识别分割的效果越自然精细。",
                "若发现衣物或下肢边缘有部分透光现象，请确保开启“手·腿主体区域 100% 鲜明保留”开关。",
                "制作电商主图时可直接选择“纯白 (White)”背景，省去后续拼接底色的麻烦。",
                "如需保留透明背景图层，必须以 PNG 格式导出才能确保透明度完整无损。",
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "抠图时照片会被上传到外部服务器吗？", a: "绝无可能！desktools.run 采用纯前端 WebAssembly AI 技术，所有计算都在您电脑的本地浏览器中完成。" },
                { q: "头发丝或动物毛发这类复杂边缘能抠干净吗？", a: "可以！深度学习分割算法专门对毛发与边缘细节进行了优化训练，能够清晰呈现细腻发丝。" },
                { q: "抠出来的图片可以用于商业用途吗？", a: "可以！生成的图片版权 100% 归您所有，可自由用于电商上架、商业广告及印刷品。" },
                { q: "会有强制水印或降低分辨率吗？", a: "不加任何水印，并且完全保留原图的分辨率尺寸与高清像素画质。" },
                { q: "手机端（iPhone / 安卓）浏览器可以直接用吗？", a: "可以！完全支持移动端 Safari 和 Chrome 浏览器，支持触控操作，无需安装 App。" },
                { q: "每天有次数限制或收费吗？", a: "100% 永久免费，无任何每日上限，无需充值积分，无需注册账号。" },
              ],
              relatedToolsTitle: "推荐相关实用工具",
              relatedTools: [
                { title: "图片尺寸调整 (Image Resizer)", desc: "将抠好的商品图按像素无损调整为平台标准规格。", href: "/tools/image-resizer/" },
                { title: "图片压缩器 (Image Compress)", desc: "透明 PNG 无损压缩高达 80%，加速网页与小程序加载。", href: "/tools/image-compress/" },
                { title: "图片格式转换 (Image Converter)", desc: "将透明 PNG 极速转为 WebP、JPG、ICO 等多种格式。", href: "/tools/image-converter/" },
                { title: "图片添加水印 (Image Watermark)", desc: "为商品图一键添加品牌防盗水印与专属 Logo。", href: "/tools/image-watermark/" },
              ],
            },
            fr: {
              aboutTitle: "Suppresseur d'arrière-plan d'images par IA locale dans le navigateur (Détourage)",
              aboutDesc: "Grâce aux modèles d'IA WebAssembly et ONNX Web (@imgly/background-removal) et à notre moteur de consolidation de premier plan, détourez personnes, produits, animaux et objets en un seul clic pour obtenir un PNG transparent parfait. Tous les calculs s'exécutent à 100% localement dans votre navigateur, garantissant une confidentialité absolue sans transfert vers des serveurs distants.",
              howTitle: "Guide d'utilisation étape par étape",
              steps: [
                "Glissez-déposez ou sélectionnez la photo à détourer (compatible PNG, JPG, WEBP, BMP).",
                "L'intelligence artificielle locale détecte automatiquement le sujet et efface l'arrière-plan avec précision.",
                "Dans le panneau latéral, activez la préservation des membres et choisissez le style d'arrière-plan (Transparent / Blanc / Noir / Couleur personnalisée).",
                "Vérifiez le résultat avant/après en haute définition sur l'écran de prévisualisation.",
                "Cliquez sur 'Télécharger PNG transparent' pour enregistrer votre image instantanément.",
              ],
              featuresTitle: "Fonctionnalités clés de l'IA de détourage",
              features: [
                { title: "Réseau neuronal Web AI On-Device", desc: "Zéro appel serveur : accélération par le navigateur pour une détection ultra-rapide des contours." },
                { title: "Moteur de consolidation du premier plan", desc: "Empêche les zones de mains, jambes et vêtements de devenir semi-transparentes par erreur." },
                { title: "Styles d'arrière-plan variés", desc: "Remplacez le décor par de la transparence (PNG Alpha), un blanc immaculé, un noir élégant ou une couleur unie." },
                { title: "Confidentialité 100% locale (Zéro upload sur serveur)", desc: "Vos photos ne quittent jamais votre appareil, idéal pour les portraits confidentiels et visuels de produits." },
              ],
              useCasesTitle: "Cas d'utilisation pratiques",
              useCases: [
                { icon: "🛍️", title: "Visuels de produits pour e-commerce et boutiques en ligne", desc: "Créez des arrière-plans blancs ou transparents professionnels pour vos catalogues et marketplaces." },
                { icon: "👤", title: "Photos de profil, CV et documents d'identité", desc: "Effacez les fonds encombrés pour les remplacer par des tons neutres valorisants." },
                { icon: "🎨", title: "Création graphique, miniatures YouTube et bannières", desc: "Isolez des éléments en 1 seconde pour vos compositions graphiques sans passer par Photoshop." },
                { icon: "🐾", title: "Stickers et objets personnalisés d'animaux de compagnie", desc: "Préservez les détails fins du pelage pour créer des stickers et visuels mémorables." },
              ],
              proTipsTitle: "Conseils d'experts pour le détourage par IA",
              proTips: [
                "Un contraste net entre le sujet et le fond garantit une découpe parfaite des bordures.",
                "Si des vêtements ou des membres semblent translucides, activez l'option de consolidation du premier plan.",
                "Pour les boutiques en ligne, choisissez le fond 'Blanc' pour respecter immédiatement les normes e-commerce.",
                "Téléchargez toujours au format PNG pour préserver le canal alpha de transparence.",
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Mes photos sont-elles envoyées sur un serveur distant ?", a: "Absolument pas ! desktools.run utilise un moteur WebAssembly IA 100% local dans la mémoire de votre navigateur." },
                { q: "L'IA détoure-t-elle avec précision les cheveux et les poils d'animaux ?", a: "Oui ! Le modèle de segmentation profonde préserve les détails délicats comme les cheveux et le pelage." },
                { q: "Puis-je utiliser les images détourées pour un usage commercial ?", a: "Oui ! Vous possédez 100% des droits sur vos images et pouvez les utiliser librement pour vos ventes et publicités." },
                { q: "Y a-t-il des filigranes ou une perte de résolution ?", a: "Aucun filigrane n'est ajouté et la résolution d'origine de votre photo est totalement préservée." },
                { q: "L'outil fonctionne-t-il sur mobile (iPhone / Android) ?", a: "Oui ! Il fonctionne parfaitement sur tous les navigateurs mobiles sans aucune application à installer." },
                { q: "Le service est-il gratuit et sans limite ?", a: "100% gratuit, illimité, sans abonnement et sans inscription." },
              ],
              relatedToolsTitle: "Outils recommandés",
              relatedTools: [
                { title: "Redimensionneur d'images (Image Resizer)", desc: "Ajustez les dimensions de vos images détourées aux formats requis.", href: "/tools/image-resizer/" },
                { title: "Compresseur d'images (Image Compress)", desc: "Allégez vos fichiers PNG transparents jusqu'à 80% sans perte.", href: "/tools/image-compress/" },
                { title: "Convertisseur d'images (Image Converter)", desc: "Convertissez vos fichiers détourés vers WebP, JPG ou ICO.", href: "/tools/image-converter/" },
                { title: "Ajout de filigrane (Image Watermark)", desc: "Appliquez des filigranes ou logos sur vos photos de produits.", href: "/tools/image-watermark/" },
              ],
            },
            en: {
              aboutTitle: "Browser-Native On-Device AI Background Remover (Cutout Tool)",
              aboutDesc: "Powered by cutting-edge WebAssembly and ONNX Web AI neural network models (@imgly/background-removal) alongside an automatic Foreground Alpha Solidifier engine, remove backgrounds from portraits, e-commerce products, pets, and graphics in a single click. All AI inference runs 100% locally inside your client browser, ensuring zero data leakage to external cloud servers.",
              howTitle: "Step-by-Step Usage Guide",
              steps: [
                "Drag and drop or select the photo you want to cutout (supports PNG, JPG, WEBP, BMP).",
                "The browser-native Web AI neural network automatically detects subjects and erases the background with precision.",
                "In the right control panel, toggle subject limb solidifier and select your backdrop style (Transparent / White / Black / Custom Hex Color).",
                "Inspect the high-resolution before/after preview in real-time.",
                "Click 'Download Transparent PNG' to save your cutout asset instantly to your device.",
              ],
              featuresTitle: "Key AI & Engineering Features",
              features: [
                { title: "On-Device Web AI Neural Network", desc: "Zero cloud dependencies: GPU/Wasm browser acceleration delivers lightning-fast boundary segmentation." },
                { title: "Foreground Alpha Solidifier Engine", desc: "Prevents accidental semi-transparency in hands, legs, and dark clothing, restoring 100% solid opacity." },
                { title: "Multi-Backdrop Replacement Styles", desc: "Easily switch between transparent alpha PNG, clean studio white, modern dark, or custom solid colors." },
                { title: "100% Client-Side Privacy Sandbox (Zero Server Upload)", desc: "Zero file bytes leave your machine, making it ideal for confidential portraits and unreleased products." },
              ],
              useCasesTitle: "Real-World Practical Use Cases",
              useCases: [
                { icon: "🛍️", title: "E-commerce & Amazon Product Photography", desc: "Clean up cluttered product shoot backgrounds into compliant studio white or transparent PNGs." },
                { icon: "👤", title: "Resume, Headshots & LinkedIn Profile Cutouts", desc: "Replace noisy everyday backgrounds with professional, distraction-free corporate solid backdrops." },
                { icon: "🎨", title: "Graphic Design, YouTube Thumbnails & Social Banners", desc: "Isolate people and icons in 1 second without launching bulky desktop editing suites." },
                { icon: "🐾", title: "Pet Stickers & Custom Merchandise Creation", desc: "Preserve fine fur outlines to generate clean stickers and personalized merchandise assets." },
              ],
              proTipsTitle: "Pro AI Background Removal Tips",
              proTips: [
                "Higher lighting and color contrast between subject and background produces the sharpest edge extraction.",
                "If clothing or limbs appear slightly see-through, keep the 'Foreground Solidifier' toggle enabled to retain full opacity.",
                "For e-commerce product listings, choose the 'White' background preset to instantly conform to marketplace standards.",
                "Always save cutouts as 'PNG' to preserve the lossless alpha transparency channel.",
              ],
              faqTitle: "Frequently Asked Questions (FAQ)",
              faqs: [
                { q: "Are my photos uploaded to any server for processing?", a: "Zero server upload! desktools.run uses an embedded WebAssembly AI model running 100% inside your local browser memory." },
                { q: "Can it handle fine hair and animal fur details?", a: "Yes! The deep learning segmentation neural net is trained specifically to cleanly separate fine hair strands and fur contours." },
                { q: "Can I use the cutout images for commercial projects?", a: "Yes! You retain 100% ownership and copyright over all generated images for commercial and personal use." },
                { q: "Are watermarks added or is resolution compressed?", a: "No watermarks are ever added, and your image retains its original full resolution and pixel fidelity." },
                { q: "Does it work on mobile browsers (iOS / Android)?", a: "Yes! Fully responsive and touch-optimized across mobile browsers without requiring app installations." },
                { q: "Is it completely free with no usage limits?", a: "100% free and unlimited. No accounts, no subscriptions, and no credit deductions." },
              ],
              relatedToolsTitle: "Related Utilities",
              relatedTools: [
                { title: "Image Resizer", desc: "Resize cutout images to exact marketplace dimensions.", href: "/tools/image-resizer/" },
                { title: "Image Compressor", desc: "Shrink transparent PNG files up to 80% without losing quality.", href: "/tools/image-compress/" },
                { title: "Image Converter", desc: "Convert transparent cutouts to WebP, JPG, or ICO formats.", href: "/tools/image-converter/" },
                { title: "Image Watermark", desc: "Add transparent copyright text and logo watermarks to cutouts.", href: "/tools/image-watermark/" },
              ],
            },
          };

          const active = content[locale as keyof typeof content] || content.en;

          return (
            <ToolGuide
              badgeText="100% Free & On-Device AI"
              aboutTitle={active.aboutTitle}
              aboutDesc={active.aboutDesc}
              howTitle={active.howTitle}
              steps={active.steps}
              featuresTitle={active.featuresTitle}
              features={active.features}
              useCasesTitle={active.useCasesTitle}
              useCases={active.useCases}
              proTips={{
                title: active.proTipsTitle,
                tips: active.proTips,
              }}
              faqs={active.faqs}
              relatedTools={active.relatedTools}
            />
          );
        })()}
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
