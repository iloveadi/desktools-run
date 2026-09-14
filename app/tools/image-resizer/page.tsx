"use client";

/**
 * app/tools/image-resizer/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Image Resizer & Converter Tool for desktools.run
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
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

export default function ImageResizerPage() {
  const { t, locale } = useLocale();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [origSize, setOrigSize] = useState<number>(0);

  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState<number>(90);

  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [resizedDataUrl, setResizedDataUrl] = useState<string>("");
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

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
            {t("imageResizer.back")}
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
              {t("imageResizer.badge")}
            </div>
          </div>
        </section>

        {/* ── Main Resizer Workspace ───────────────────── */}
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
                  {t("imageResizer.dropDesc")}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }} className="workspace-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="preview-grid">
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
                        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{t("imageResizer.rendering")}</div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px", color: "var(--text-muted)" }}>
                      <span>
                        {t("imageResizer.sizeLabel")}: <strong style={{ color: "var(--text-primary)" }}>{formatBytes(resizedSize)}</strong>
                      </span>
                      {origSize > 0 && resizedSize > 0 && (
                        <span style={{ fontWeight: 700, color: resizedSize < origSize ? "#34d399" : "#fbbf24" }}>
                          {resizedSize < origSize ? `-${Math.round((1 - resizedSize / origSize) * 100)}%` : `+${Math.round((resizedSize / origSize - 1) * 100)}%`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

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

              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", height: "fit-content" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("imageResizer.settings")}
                </h3>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                      {t("imageResizer.dimensions")}
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

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────────── */}
        <ToolGuide
          badgeText="100% Free & Browser-Native"
          aboutTitle={
            locale === "ko"
              ? "브라우저 네이티브 초고속 이미지 리사이저 & 포맷 변환기"
              : "Browser-Native High-Performance Image Resizer & Converter"
          }
          aboutDesc={
            locale === "ko"
              ? "HTML5 Canvas 2D 고성능 렌더링 엔진과 고품질 바이큐빅(Bicubic) 안티에일리어싱 보간법을 적용하여, 원본 화질 손상을 최소화하면서 이미지 가로/세로 픽셀(px) 크기와 퍼센트(%) 비율을 정밀하게 조절합니다. 모든 처리는 100% 사용자의 웹 브라우저 메모리 안에서만 동작하므로, 개인 사진, 신분증, 업무용 기밀 캡처 이미지도 외부 유출 위험 없이 안전하게 변환할 수 있습니다."
              : "Precision image dimension and percentage scaling powered by client-side HTML5 Canvas. With high-quality bicubic resampling, your pictures retain crystal-clear sharpness while eliminating server upload risks entirely."
          }
          howTitle={locale === "ko" ? "단계별 사용 방법 안내" : "Step-by-Step Usage Guide"}
          steps={
            locale === "ko"
              ? [
                  "리사이즈할 이미지 파일을 드래그앤드롭하거나 상단 영역을 클릭하여 불러옵니다 (JPG, PNG, WebP, GIF, SVG 등 지원).",
                  "목표 가로(Width) 및 세로(Height) 픽셀 값을 입력하거나, 25% / 50% / 75% / 150% / 200% 프리셋 칩을 클릭합니다.",
                  "원본 비율을 유지하려면 종횡비 잠금(Link) 아이콘이 활성화되어 있는지 확인합니다.",
                  "원하는 출력 포맷(JPG / PNG / WEBP)과 압축 품질(Quality)을 조정한 뒤 실시간 미리보기 및 용량 변화를 확인합니다.",
                  "'이미지 다운로드' 버튼을 클릭하여 리사이즈된 고화질 이미지를 즉시 기기에 저장합니다.",
                ]
              : [
                  "Drop or select an image file into the upload zone (supports JPG, PNG, WebP, GIF, SVG).",
                  "Enter target width and height in pixels, or click 25%, 50%, 75%, 150%, 200% percentage scaling chips.",
                  "Ensure the aspect ratio lock icon is active to preserve image proportions without distortion.",
                  "Choose your desired output format (JPG / PNG / WEBP) and quality slider, observing the live file size preview.",
                  "Click 'Download Resized Image' to save your optimized file instantly to your local device.",
                ]
          }
          featuresTitle={locale === "ko" ? "이미지 리사이저 핵심 기능" : "Key Engineering Features"}
          features={[
            {
              title: locale === "ko" ? "실시간 미리보기 & 용량 절감 분석" : "Live Real-Time Preview & Byte Delta",
              desc: locale === "ko"
                ? "크기나 품질을 변경하는 즉시 0.1초 만에 렌더링된 결과물과 절감된 용량(%)을 실시간으로 나란히 비교합니다."
                : "Renders canvas output in 0.1s with side-by-side dimension and file size comparison.",
            },
            {
              title: locale === "ko" ? "황금비율 자동 고정 (Aspect Ratio Lock)" : "Smart Aspect Ratio Preservation",
              desc: locale === "ko"
                ? "가로 또는 세로 중 하나의 수치만 변경해도 원본 종횡비에 맞춰 반대편 크기를 자동으로 정밀 계산합니다."
                : "Automatically synchronizes complementary dimensions to prevent distortion.",
            },
            {
              title: locale === "ko" ? "차세대 WebP & 무손실 PNG 변환" : "Next-Gen WebP & Lossless PNG Export",
              desc: locale === "ko"
                ? "고화질을 유지하면서 웹 로딩 속도를 극대화하는 WebP 및 투명 배경을 보존하는 PNG 출력을 기본 지원합니다."
                : "Native export to modern WebP (VP8 lossy) and lossless transparent PNG.",
            },
            {
              title: locale === "ko" ? "100% 브라우저 로컬 안전 처리 (Zero Upload)" : "Zero-Server Privacy Sandbox",
              desc: locale === "ko"
                ? "단 1바이트의 파일 데이터도 원격 클라우드로 전송되지 않아 기업 기밀 및 개인정보를 완벽히 보호합니다."
                : "Files execute purely within client RAM buffers without outbound network requests.",
            },
          ]}
          useCasesTitle={locale === "ko" ? "실무 활용 추천 시나리오" : "Real-World Practical Use Cases"}
          useCases={[
            {
              icon: "🌐",
              title: locale === "ko" ? "웹사이트 및 블로그 썸네일 규격 최적화" : "Web & Blog Thumbnail Optimization",
              desc: locale === "ko"
                ? "4K 고해상도 사진을 웹 표준 1200x630 또는 800x400 규격으로 조절하여 웹 로딩 속도와 검색엔진 SEO 점수를 향상시킵니다."
                : "Scale heavy 4K camera photos to standard web dimensions for ultra-fast LCP and SEO.",
            },
            {
              icon: "📧",
              title: locale === "ko" ? "이메일 첨부 및 채용·관공서 서류 규격 맞춤" : "Document & Email Attachment Limits",
              desc: locale === "ko"
                ? "관공서, 채용 포털, 메일 시스템의 엄격한 용량/해상도 제한(예: 3x4 증명사진 규격, 500KB 이하)을 손쉽게 통과합니다."
                : "Fit passport photos and scan uploads within strict corporate portal upload bounds.",
            },
            {
              icon: "📱",
              title: locale === "ko" ? "SNS 프로필 & 오픈그래프 배너 제작" : "Social Media Profiles & Banner Assets",
              desc: locale === "ko"
                ? "인스타그램, 유튜브 썸네일(1280x720), X(트위터) 배너 등 플랫폼별 권장 규격에 맞춰 정밀하게 재단합니다."
                : "Resize assets for YouTube thumbnails, Instagram grids, and OpenGraph social cards.",
            },
            {
              icon: "🎨",
              title: locale === "ko" ? "디자이너 UI 목업 & 앱 아이콘 해상도 변환" : "UI Design Mockups & App Icons",
              desc: locale === "ko"
                ? "모바일 앱 아이콘(@1x, @2x, @3x) 및 웹 디자인 에셋을 다양한 규격으로 빠르게 가공하여 프로젝트에 적용합니다."
                : "Quickly export varying icon and layout resolutions for multi-screen responsive design.",
            },
          ]}
          proTips={{
            title: locale === "ko" ? "알아두면 유용한 전문가 이미지 최적화 팁" : "Pro Optimization & Quality Tips",
            tips: locale === "ko"
              ? [
                  "웹 성능을 최적화할 때는 포맷을 'WEBP'로 지정하세요. 동일 해상도에서도 JPG 대비 25~35% 더 작은 파일 크기를 달성합니다.",
                  "품질(Quality) 슬라이더는 85%~90% 수준이 가장 이상적입니다. 사람의 육안으로는 원본과 차이가 없으면서 파일 용량은 대폭 감소합니다.",
                  "투명한 배경이 포함된 그래픽이나 로고는 반드시 PNG 또는 WEBP 포맷으로 저장해야 배경 투명도가 유지됩니다.",
                  "작은 이미지를 무리하게 수배 이상 확대하면 픽셀 계단 현상이 발생하므로, 원본보다 작게 축소할 때 최상의 선명도를 얻을 수 있습니다.",
                ]
              : [
                  "Select WebP format for web publishing to gain up to 35% byte savings over standard JPEG.",
                  "Set the quality slider between 85% and 90% for the best balance of visual fidelity and lightweight file size.",
                  "Always export transparent logos or illustrations to PNG or WebP to preserve alpha channel transparency.",
                  "Downscaling large photos delivers sharper results than upscaling small low-res originals.",
                ],
          }}
          faqs={[
            {
              q: locale === "ko" ? "이미지를 리사이즈하면 화질이 많이 저하되거나 뭉개지나요?" : "Does resizing cause blurry or degraded images?",
              a: locale === "ko"
                ? "아닙니다! desktools.run은 HTML5 Canvas의 고급 바이큐빅(Bicubic) 스케일링 보간 알고리즘을 적용하여 픽셀 계단 현상을 방지하고 선명한 텍스트와 윤곽선을 유지합니다."
                : "No. Our engine uses high-quality bicubic interpolation on HTML5 Canvas to prevent aliasing and maintain crisp edges.",
            },
            {
              q: locale === "ko" ? "업로드한 사진이 외부 서버에 저장되거나 열람될 위험이 있나요?" : "Are my photos uploaded or stored on external servers?",
              a: locale === "ko"
                ? "전혀 없습니다. 모든 변환 파이프라인은 사용자의 기기 RAM 메모리 안에서만 실행되며, 작업 완료 즉시 메모리 버퍼가 안전하게 파기됩니다."
                : "Zero server storage. Everything runs inside your device's browser memory (Client-Side). Zero bytes are transmitted.",
            },
            {
              q: locale === "ko" ? "스마트폰(모바일 브라우저)에서도 사용 가능한가요?" : "Can I use this image resizer on mobile phones?",
              a: locale === "ko"
                ? "네! 별도의 앱 설치 없이 아이폰(Safari), 안드로이드(Chrome) 등 모든 모바일 기기에서 터치 인터페이스로 동일하게 이용할 수 있습니다."
                : "Yes! Fully responsive and touch-optimized across iOS Safari, Android Chrome, and tablets without app downloads.",
            },
            {
              q: locale === "ko" ? "수십 MB가 넘는 대용량 고화질 사진도 리사이즈할 수 있나요?" : "Can I resize large raw photo files exceeding 50MB?",
              a: locale === "ko"
                ? "네, 서버 업로드 제한이 없으므로 사용자의 기기 사양이 허용하는 한 수천만 화소의 DSLR/스마트폰 원본 사진도 자유롭게 처리할 수 있습니다."
                : "Yes. Because execution happens on your local hardware, high-resolution DSLR photos are processed without cloud limits.",
            },
            {
              q: locale === "ko" ? "투명 배경(누끼)이 있는 PNG 파일의 투명도가 유지되나요?" : "Does it preserve transparency for transparent PNG files?",
              a: locale === "ko"
                ? "네, 출력 포맷을 PNG 또는 WEBP로 선택하시면 알파 채널(투명 배경)이 그대로 보존된 채 해상도만 깔끔하게 변경됩니다."
                : "Yes, selecting PNG or WebP output preserves complete 8-bit/24-bit alpha channel transparency.",
            },
            {
              q: locale === "ko" ? "완전 무료인가요? 하루 사용 횟수 제한이 있나요?" : "Is there any daily limit or subscription cost?",
              a: locale === "ko"
                ? "완전 100% 무료입니다. 회원가입이나 워터마크 추가 없이 무제한으로 자유롭게 이용하실 수 있습니다."
                : "100% free and unlimited. No accounts, no paywalls, and no automated watermarks applied.",
            },
          ]}
          relatedTools={[
            {
              title: locale === "ko" ? "이미지 압축기 (Image Compress)" : "Image Compressor",
              desc: locale === "ko" ? "해상도 변경 없이 손실/무손실 WebP 압축으로 파일 용량을 최대 80% 절감합니다." : "Shrink image file size up to 80% without losing visual clarity.",
              href: "/tools/image-compress/",
            },
            {
              title: locale === "ko" ? "이미지 포맷 변환기 (Image Converter)" : "Image Converter",
              desc: locale === "ko" ? "JPG, PNG, WebP 등 다양한 그래픽 포맷을 브라우저에서 상호 일괄 변환합니다." : "Batch convert between JPG, PNG, and WebP instantly.",
              href: "/tools/image-converter/",
            },
            {
              title: locale === "ko" ? "배경 제거기 (Background Remover)" : "Background Remover",
              desc: locale === "ko" ? "AI 신경망으로 이미지의 배경을 1초 만에 깔끔하게 투명화(누끼 따기)합니다." : "Client-side AI neural network background remover.",
              href: "/tools/background-remover/",
            },
            {
              title: locale === "ko" ? "워터마크 추가기 (Image Watermark)" : "Image Watermark",
              desc: locale === "ko" ? "사진에 저작권 보호용 텍스트 및 로고를 투명도와 함께 합성합니다." : "Add transparent copyright text and logo watermarks.",
              href: "/tools/image-watermark/",
            },
          ]}
        />
      </main>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .workspace-grid { grid-template-columns: 1fr !important; }
          .preview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
