"use client";

/**
 * app/tools/background-remover/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Fast & Client-side Background Remover Tool with Smart Flood Fill (Magic Wand)
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
  Pipette,
  Wand2,
  Globe,
  Sliders,
  Layers,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

type BgStyle = "transparent" | "white" | "black" | "custom";
type RemovalMethod = "magicWand" | "global";

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export default function BackgroundRemoverPage() {
  const { t } = useLocale();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  const [targetColor, setTargetColor] = useState<RGBColor>({ r: 255, g: 255, b: 255 });
  const [lastClickPos, setLastClickPos] = useState<{ x: number; y: number } | null>(null);
  const [method, setMethod] = useState<RemovalMethod>("magicWand");
  const [tolerance, setTolerance] = useState<number>(30);
  const [feather, setFeather] = useState<number>(2);
  const [bgStyle, setBgStyle] = useState<BgStyle>("transparent");
  const [customBgColor, setCustomBgColor] = useState<string>("#6366f1");

  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);

        // Auto-detect corner pixel color as initial target color
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        const ctx = tempCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const p = ctx.getImageData(5, 5, 1, 1).data;
          setTargetColor({ r: p[0], g: p[1], b: p[2] });
          setLastClickPos({ x: Math.floor(img.naturalWidth / 2), y: 10 });
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  // Smart Flood Fill (Magic Wand) / Global Removal Processor
  const processBackgroundRemoval = useCallback(() => {
    if (!imageSrc || origWidth === 0 || origHeight === 0) return;

    setIsProcessing(true);
    const timer = setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = origWidth;
        canvas.height = origHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, origWidth, origHeight);
          const imgData = ctx.getImageData(0, 0, origWidth, origHeight);
          const data = imgData.data;

          const maxDist = (tolerance / 100) * 441.67; // Max Euclidean RGB distance sqrt(255^2 * 3) = 441.67
          const tr = targetColor.r;
          const tg = targetColor.g;
          const tb = targetColor.b;

          let hexR = 255;
          let hexG = 255;
          let hexB = 255;
          if (bgStyle === "custom") {
            const hex = customBgColor.replace("#", "");
            hexR = parseInt(hex.substring(0, 2), 16) || 0;
            hexG = parseInt(hex.substring(2, 4), 16) || 0;
            hexB = parseInt(hex.substring(4, 6), 16) || 0;
          }

          const totalPixels = origWidth * origHeight;
          const mask = new Uint8Array(totalPixels); // 1 = remove/transparent, 0 = keep

          if (method === "magicWand") {
            // BFS Flood Fill algorithm from click position & 4 corners
            const seeds: [number, number][] = [];
            if (lastClickPos) {
              seeds.push([lastClickPos.x, lastClickPos.y]);
            }
            // Add image 4 corners as backup background seeds
            seeds.push([0, 0]);
            seeds.push([origWidth - 1, 0]);
            seeds.push([0, origHeight - 1]);
            seeds.push([origWidth - 1, origHeight - 1]);

            const queue: number[] = [];
            const visited = new Uint8Array(totalPixels);

            for (const [sx, sy] of seeds) {
              const cx = Math.min(origWidth - 1, Math.max(0, sx));
              const cy = Math.min(origHeight - 1, Math.max(0, sy));
              const idx = cy * origWidth + cx;
              if (!visited[idx]) {
                visited[idx] = 1;
                queue.push(idx);
              }
            }

            let head = 0;
            while (head < queue.length) {
              const curr = queue[head++];
              const px = curr % origWidth;
              const py = Math.floor(curr / origWidth);
              const dataIdx = curr * 4;

              const r = data[dataIdx];
              const g = data[dataIdx + 1];
              const b = data[dataIdx + 2];

              const dist = Math.sqrt(
                (r - tr) * (r - tr) + (g - tg) * (g - tg) + (b - tb) * (b - tb)
              );

              if (dist <= maxDist) {
                mask[curr] = 1;

                // Check 4-connected neighbors
                const neighbors: [number, number][] = [
                  [px + 1, py],
                  [px - 1, py],
                  [px, py + 1],
                  [px, py - 1],
                ];

                for (const [nx, ny] of neighbors) {
                  if (nx >= 0 && nx < origWidth && ny >= 0 && ny < origHeight) {
                    const nIdx = ny * origWidth + nx;
                    if (!visited[nIdx]) {
                      visited[nIdx] = 1;
                      queue.push(nIdx);
                    }
                  }
                }
              }
            }
          } else {
            // Global color match
            for (let i = 0; i < totalPixels; i++) {
              const dataIdx = i * 4;
              const r = data[dataIdx];
              const g = data[dataIdx + 1];
              const b = data[dataIdx + 2];

              const dist = Math.sqrt(
                (r - tr) * (r - tr) + (g - tg) * (g - tg) + (b - tb) * (b - tb)
              );

              if (dist <= maxDist) {
                mask[i] = 1;
              }
            }
          }

          // Apply mask and background style to ImageData
          for (let i = 0; i < totalPixels; i++) {
            const dataIdx = i * 4;
            if (mask[i] === 1) {
              if (bgStyle === "transparent") {
                data[dataIdx + 3] = 0; // Fully transparent
              } else if (bgStyle === "white") {
                data[dataIdx] = 255;
                data[dataIdx + 1] = 255;
                data[dataIdx + 2] = 255;
                data[dataIdx + 3] = 255;
              } else if (bgStyle === "black") {
                data[dataIdx] = 0;
                data[dataIdx + 1] = 0;
                data[dataIdx + 2] = 0;
                data[dataIdx + 3] = 255;
              } else if (bgStyle === "custom") {
                data[dataIdx] = hexR;
                data[dataIdx + 1] = hexG;
                data[dataIdx + 2] = hexB;
                data[dataIdx + 3] = 255;
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setProcessedUrl(url);
            }
            setIsProcessing(false);
          }, "image/png");
        }
      };
      img.src = imageSrc;
    }, 120);

    return () => clearTimeout(timer);
  }, [imageSrc, origWidth, origHeight, targetColor, tolerance, feather, bgStyle, customBgColor, method, lastClickPos]);

  useEffect(() => {
    processBackgroundRemoval();
  }, [processBackgroundRemoval]);

  // Accurate Eyedropper click coordinate mapping considering object-fit: contain
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!originalImgRef.current || origWidth === 0 || origHeight === 0) return;
    const imgEl = originalImgRef.current;
    const rect = imgEl.getBoundingClientRect();

    // Calculate actual displayed dimensions of image inside element (considering object-fit: contain)
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

    const relativeX = e.clientX - rect.left - offsetX;
    const relativeY = e.clientY - rect.top - offsetY;

    if (relativeX < 0 || relativeX > renderW || relativeY < 0 || relativeY > renderH) {
      return; // Clicked on letterbox padding area, ignore
    }

    const clickX = Math.min(origWidth - 1, Math.max(0, Math.round((relativeX / renderW) * origWidth)));
    const clickY = Math.min(origHeight - 1, Math.max(0, Math.round((relativeY / renderH) * origHeight)));

    setLastClickPos({ x: clickX, y: clickY });

    // Pick pixel color at clickX, clickY
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = origWidth;
    tempCanvas.height = origHeight;
    const ctx = tempCanvas.getContext("2d");

    if (ctx) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const pixel = ctx.getImageData(clickX, clickY, 1, 1).data;
        setTargetColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      };
      img.src = imageSrc;
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownload = () => {
    if (!processedUrl || !imageFile) return;

    const rawName = imageFile.name || "image";
    const lastDotIndex = rawName.lastIndexOf(".");
    const nameWithoutExt = lastDotIndex > 0 ? rawName.substring(0, lastDotIndex) : rawName;
    const filename = `${nameWithoutExt}_nobg.png`;

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
    setProcessedUrl("");
    setLastClickPos(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const colorToRgbString = (c: RGBColor) => `rgb(${c.r}, ${c.g}, ${c.b})`;

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
              <Sparkles size={12} />
              100% Client-Side Magic Wand Masking
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
                  Supports PNG, JPG, WEBP, BMP (Max 50MB)
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Dual Previews */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Original Image (Clickable for Color Picker) */}
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
                        height: "360px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "crosshair",
                        position: "relative",
                      }}
                      title={t("backgroundRemover.clickHint")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={originalImgRef}
                        src={imageSrc}
                        alt="Original for color picker"
                        onClick={handleImageClick}
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", userSelect: "none" }}
                      />
                    </div>

                    <p style={{ fontSize: "12px", color: "#f472b6", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                      <Pipette size={14} />
                      {t("backgroundRemover.clickHint")}
                    </p>
                  </div>

                  {/* Removed Background Result */}
                  <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#f472b6" }}>
                        {t("backgroundRemover.removed")}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", background: "rgba(236,72,153,0.15)", color: "#f472b6" }}>
                        PNG Alpha
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "360px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        // High quality Photoshop-style checkerboard background
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
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {processedUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={processedUrl}
                          alt="Processed Result"
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", opacity: isProcessing ? 0.5 : 1, transition: "opacity 0.15s" }}
                        />
                      ) : (
                        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Processing mask...</div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                      <span>Mode: <strong style={{ color: "var(--text-primary)" }}>{bgStyle.toUpperCase()}</strong></span>
                      <span style={{ color: "#f472b6", fontWeight: 700 }}>100% Private</span>
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
                  Removal Controls
                </h3>

                {/* Removal Method Toggle (Magic Wand vs Global) */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>
                    {t("backgroundRemover.method")}
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button
                      onClick={() => setMethod("magicWand")}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: method === "magicWand" ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.04)",
                        border: method === "magicWand" ? "1px solid #f472b6" : "1px solid var(--border-subtle)",
                        color: method === "magicWand" ? "#f472b6" : "var(--text-secondary)",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        textAlign: "left",
                      }}
                    >
                      <Wand2 size={15} />
                      {t("backgroundRemover.methodMagicWand")}
                    </button>

                    <button
                      onClick={() => setMethod("global")}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: method === "global" ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.04)",
                        border: method === "global" ? "1px solid #f472b6" : "1px solid var(--border-subtle)",
                        color: method === "global" ? "#f472b6" : "var(--text-secondary)",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        textAlign: "left",
                      }}
                    >
                      <Globe size={15} />
                      {t("backgroundRemover.methodGlobal")}
                    </button>
                  </div>
                </div>

                {/* Picked Color Card */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>
                    {t("backgroundRemover.pickColor")}
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        background: colorToRgbString(targetColor),
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                      }}
                    />
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "block" }}>
                        {colorToRgbString(targetColor)}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target background color</span>
                    </div>
                  </div>
                </div>

                {/* Tolerance Slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600 }}>{t("backgroundRemover.tolerance")}</span>
                    <span style={{ color: "#f472b6", fontWeight: 700 }}>{tolerance}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={tolerance}
                    onChange={(e) => setTolerance(parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "#ec4899", cursor: "pointer" }}
                  />
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
          badgeText="100% Client-Side & Private"
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
    </>
  );
}
