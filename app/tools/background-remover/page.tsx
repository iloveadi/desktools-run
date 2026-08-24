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
  const { t } = useLocale();

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

        {/* ── Unified Tool Guide & FAQ Section ───────── */}
        <ToolGuide
          badgeText={t("backgroundRemover.guideBadge")}
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
