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

        {/* ── Unified Tool Guide & FAQ Section (Full 6-Language Support) ───────────── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "브라우저 네이티브 초고속 이미지 리사이저 & 포맷 변환기",
              aboutDesc: "HTML5 Canvas 2D 고성능 렌더링 엔진과 고품질 바이큐빅(Bicubic) 안티에일리어싱 보간법을 적용하여, 원본 화질 손상을 최소화하면서 이미지 가로/세로 픽셀(px) 크기와 퍼센트(%) 비율을 정밀하게 조절합니다. 모든 처리는 100% 사용자의 웹 브라우저 메모리 안에서만 동작하므로, 개인 사진, 신분증, 업무용 기밀 캡처 이미지도 외부 유출 위험 없이 안전하게 변환할 수 있습니다.",
              howTitle: "단계별 사용 방법 안내",
              steps: [
                "리사이즈할 이미지 파일을 드래그앤드롭하거나 상단 영역을 클릭하여 불러옵니다 (JPG, PNG, WebP, GIF, SVG 등 지원).",
                "목표 가로(Width) 및 세로(Height) 픽셀 값을 입력하거나, 25% / 50% / 75% / 150% / 200% 프리셋 칩을 클릭합니다.",
                "원본 비율을 유지하려면 종횡비 잠금(Link) 아이콘이 활성화되어 있는지 확인합니다.",
                "원하는 출력 포맷(JPG / PNG / WEBP)과 압축 품질(Quality)을 조정한 뒤 실시간 미리보기 및 용량 변화를 확인합니다.",
                "'이미지 다운로드' 버튼을 클릭하여 리사이즈된 고화질 이미지를 즉시 기기에 저장합니다.",
              ],
              featuresTitle: "이미지 리사이저 핵심 기능",
              features: [
                { title: "실시간 미리보기 & 용량 절감 분석", desc: "크기나 품질을 변경하는 즉시 0.1초 만에 렌더링된 결과물과 절감된 용량(%)을 실시간으로 나란히 비교합니다." },
                { title: "황금비율 자동 고정 (Aspect Ratio Lock)", desc: "가로 또는 세로 중 하나의 수치만 변경해도 원본 종횡비에 맞춰 반대편 크기를 자동으로 정밀 계산합니다." },
                { title: "차세대 WebP & 무손실 PNG 변환", desc: "고화질을 유지하면서 웹 로딩 속도를 극대화하는 WebP 및 투명 배경을 보존하는 PNG 출력을 기본 지원합니다." },
                { title: "100% 브라우저 로컬 안전 처리 (Zero Upload)", desc: "단 1바이트의 파일 데이터도 원격 클라우드로 전송되지 않아 기업 기밀 및 개인정보를 완벽히 보호합니다." },
              ],
              useCasesTitle: "실무 활용 추천 시나리오",
              useCases: [
                { icon: "🌐", title: "웹사이트 및 블로그 썸네일 규격 최적화", desc: "4K 고해상도 사진을 웹 표준 1200x630 또는 800x400 규격으로 조절하여 웹 로딩 속도와 검색엔진 SEO 점수를 향상시킵니다." },
                { icon: "📧", title: "이메일 첨부 및 채용·관공서 서류 규격 맞춤", desc: "관공서, 채용 포털, 메일 시스템의 엄격한 용량/해상도 제한(예: 3x4 증명사진 규격, 500KB 이하)을 손쉽게 통과합니다." },
                { icon: "📱", title: "SNS 프로필 & 오픈그래프 배너 제작", desc: "인스타그램, 유튜브 썸네일(1280x720), X(트위터) 배너 등 플랫폼별 권장 규격에 맞춰 정밀하게 재단합니다." },
                { icon: "🎨", title: "디자이너 UI 목업 & 앱 아이콘 해상도 변환", desc: "모바일 앱 아이콘(@1x, @2x, @3x) 및 웹 디자인 에셋을 다양한 규격으로 빠르게 가공하여 프로젝트에 적용합니다." },
              ],
              proTipsTitle: "알아두면 유용한 전문가 이미지 최적화 팁",
              proTips: [
                "웹 성능을 최적화할 때는 포맷을 'WEBP'로 지정하세요. 동일 해상도에서도 JPG 대비 25~35% 더 작은 파일 크기를 달성합니다.",
                "품질(Quality) 슬라이더는 85%~90% 수준이 가장 이상적입니다. 사람의 육안으로는 원본과 차이가 없으면서 파일 용량은 대폭 감소합니다.",
                "투명한 배경이 포함된 그래픽이나 로고는 반드시 PNG 또는 WEBP 포맷으로 저장해야 배경 투명도가 유지됩니다.",
                "작은 이미지를 무리하게 수배 이상 확대하면 픽셀 계단 현상이 발생하므로, 원본보다 작게 축소할 때 최상의 선명도를 얻을 수 있습니다.",
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "이미지를 리사이즈하면 화질이 많이 저하되거나 뭉개지나요?", a: "아닙니다! desktools.run은 HTML5 Canvas의 고급 바이큐빅(Bicubic) 스케일링 보간 알고리즘을 적용하여 픽셀 계단 현상을 방지하고 선명한 텍스트와 윤곽선을 유지합니다." },
                { q: "업로드한 사진이 외부 서버에 저장되거나 열람될 위험이 있나요?", a: "전혀 없습니다. 모든 변환 파이프라인은 사용자의 기기 RAM 메모리 안에서만 실행되며, 작업 완료 즉시 메모리 버퍼가 안전하게 파기됩니다." },
                { q: "스마트폰(모바일 브라우저)에서도 사용 가능한가요?", a: "네! 별도의 앱 설치 없이 아이폰(Safari), 안드로이드(Chrome) 등 모든 모바일 기기에서 터치 인터페이스로 동일하게 이용할 수 있습니다." },
                { q: "수십 MB가 넘는 대용량 고화질 사진도 리사이즈할 수 있나요?", a: "네, 서버 업로드 제한이 없으므로 사용자의 기기 사양이 허용하는 한 수천만 화소의 DSLR/스마트폰 원본 사진도 자유롭게 처리할 수 있습니다." },
                { q: "투명 배경(누끼)이 있는 PNG 파일의 투명도가 유지되나요?", a: "네, 출력 포맷을 PNG 또는 WEBP로 선택하시면 알파 채널(투명 배경)이 그대로 보존된 채 해상도만 깔끔하게 변경됩니다." },
                { q: "완전 무료인가요? 하루 사용 횟수 제한이 있나요?", a: "완전 100% 무료입니다. 회원가입이나 워터마크 추가 없이 무제한으로 자유롭게 이용하실 수 있습니다." },
              ],
              relatedToolsTitle: "함께 쓰면 좋은 연관 도구",
              relatedTools: [
                { title: "이미지 압축기 (Image Compress)", desc: "해상도 변경 없이 손실/무손실 WebP 압축으로 파일 용량을 최대 80% 절감합니다.", href: "/tools/image-compress/" },
                { title: "이미지 포맷 변환기 (Image Converter)", desc: "JPG, PNG, WebP 등 다양한 그래픽 포맷을 브라우저에서 상호 일괄 변환합니다.", href: "/tools/image-converter/" },
                { title: "배경 제거기 (Background Remover)", desc: "AI 신경망으로 이미지의 배경을 1초 만에 깔끔하게 투명화(누끼 따기)합니다.", href: "/tools/background-remover/" },
                { title: "워터마크 추가기 (Image Watermark)", desc: "사진에 저작권 보호용 텍스트 및 로고를 투명도와 함께 합성합니다.", href: "/tools/image-watermark/" },
              ],
            },
            ja: {
              aboutTitle: "ブラウザネイティブ超高速画像リサイザー＆フォーマット変換ツール",
              aboutDesc: "HTML5 Canvas 2Dレンダリングエンジンと高品質バイキュービック（Bicubic）補間アルゴリズムを搭載し、画質劣化を最小限に抑えながらピクセル（px）やパーセント（%）で画像サイズを精密に調整します。すべての処理は100%お使いのWebブラウザメモリ内でのみ実行されるため、機密書類や個人写真も安全に処理できます。",
              howTitle: "ステップ別のご利用手順",
              steps: [
                "リサイズしたい画像ファイルをドラッグ＆ドロップまたはクリックして読み込みます（PNG、JPG、WebP、GIF、SVG等に対応）。",
                "希望する幅（Width）および高さ（Height）のピクセル値を入力するか、25% / 50% / 75% / 150% / 200% の比率ボタンをクリックします。",
                "縦横比（Aspect Ratio）を維持する場合は、アスペクト比固定アイコン（Link）がオンになっていることを確認します。",
                "出力フォーマット（JPG / PNG / WEBP）と圧縮品質を設定し、リアルタイムプレビューとファイルサイズを確認します。",
                "「リサイズ画像をダウンロード」ボタンをクリックして、端末に即座に保存します。",
              ],
              featuresTitle: "画像リサイザーの主な特徴",
              features: [
                { title: "リアルタイムプレビュー＆容量削減率表示", desc: "サイズや品質を変更すると、わずか0.1秒で変換結果と削減された容量をプレビュー比較できます。" },
                { title: "アスペクト比自動固定（縦横比維持）", desc: "幅または高さの一方を入力するだけで、元画像の比率を崩さず自動的に反対側を計算します。" },
                { title: "次世代WebP＆可逆PNG変換", desc: "Web高速化に最適な高圧縮WebPフォーマットや、透過背景を保持するPNG形式への出力をサポートします。" },
                { title: "完全ローカル・安全処理（Zero Server Upload）", desc: "画像データが外部サーバーへ送信されることは一切なく、端末内部で安全に処理されます。" },
              ],
              useCasesTitle: "実務での活用シーン",
              useCases: [
                { icon: "🌐", title: "Webサイト＆ブログのアイキャッチ画像最適化", desc: "4K写真をWeb標準サイズ（1200x630等）にリサイズして読み込み速度とSEO評価を向上させます。" },
                { icon: "📧", title: "メール添付＆証明写真・書類アップロード", desc: "公的機関や求人サイト等の容量制限（500KB以下等）に合わせてサイズを調整します。" },
                { icon: "📱", title: "SNSプロフィール＆YouTubeサムネイル制作", desc: "YouTube（1280x720）やInstagram、X（Twitter）の推奨サイズに正確にリサイズします。" },
                { icon: "🎨", title: "デザイナー向けUIモックアップ＆アプリアイコン作成", desc: "アプリの各解像度用アイコンやWeb素材を用途に合わせて素早く書き出せます。" },
              ],
              proTipsTitle: "専門家による画像最適化のヒント",
              proTips: [
                "Webサイトの表示速度を高めるには、出力フォーマットに「WEBP」を選択してください。JPEG比で約30%軽量化されます。",
                "品質スライダーは85%〜90%が最も推奨されます。肉眼での画質劣化なしに大幅な容量削減が可能です。",
                "背景が透明なロゴやイラストは、必ずPNGまたはWEBPで保存して透明度を維持してください。",
                "小さな画像を無理に拡大するとぼやけの原因となるため、元画像より縮小するときに最高の鮮明度が得られます。",
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "リサイズによって画質が大幅に劣化したりぼやけたりしませんか？", a: "いいえ。desktools.runはCanvasの高品質バイキュービック補間アルゴリズムを使用しており、滑らかな輪郭と鮮明度を維持します。" },
                { q: "アップロードした写真がサーバーに保存される心配はありませんか？", a: "一切ありません。すべての処理はお使いの端末のブラウザメモリ内でのみ実行され、外部への通信は行われません。" },
                { q: "スマートフォンやタブレットでも利用できますか？", a: "はい！アプリのインストール不要で、iPhone（Safari）やAndroid（Chrome）のブラウザから快適にご利用いただけます。" },
                { q: "50MB以上の大きな高解像度写真もリサイズできますか？", a: "はい。サーバー制限がないため、端末のメモリが許す限り一眼レフの高解像度写真も制限なくリサイズ可能です。" },
                { q: "透過PNGの透明背景は維持されますか？", a: "はい。出力形式をPNGまたはWEBPに設定すると、アルファチャンネル（透過度）を完全に保持したままリサイズされます。" },
                { q: "完全無料ですか？利用回数の制限はありますか？", a: "完全無料でご利用いただけます。会員登録や透かし（ウォーターマーク）追加などの制限も一切ありません。" },
              ],
              relatedToolsTitle: "関連する便利なツール",
              relatedTools: [
                { title: "画像圧縮 (Image Compress)", desc: "解像度を維持したままWebP圧縮でファイルサイズを最大80%軽量化します。", href: "/tools/image-compress/" },
                { title: "画像フォーマット変換 (Image Converter)", desc: "JPG、PNG、WebPなどの各種画像形式をブラウザ内で一括変換します。", href: "/tools/image-converter/" },
                { title: "背景削除 (Background Remover)", desc: "AIニューラルネットワークで画像の背景を瞬時に透過（切り抜き）します。", href: "/tools/background-remover/" },
                { title: "ウォーターマーク追加 (Image Watermark)", desc: "写真に著作権保護用のテキストやロゴ透かしを合成します。", href: "/tools/image-watermark/" },
              ],
            },
            es: {
              aboutTitle: "Redimensionador y conversor de imágenes ultrarrápido nativo del navegador",
              aboutDesc: "Ajusta con precisión las dimensiones en píxeles (px) y porcentajes (%) de tus imágenes mediante HTML5 Canvas y remuestreo bicúbico de alta calidad. Todo el procesamiento se realiza al 100% en la memoria de tu navegador, garantizando absoluta privacidad sin subir archivos a ningún servidor.",
              howTitle: "Guía de uso paso a paso",
              steps: [
                "Arrastra y suelta o selecciona tu imagen (compatible con JPG, PNG, WebP, GIF, SVG).",
                "Introduce el ancho y alto deseados en píxeles o utiliza los botones de porcentaje (25%, 50%, 75%, 150%, 200%).",
                "Mantén activo el icono de bloqueo de relación de aspecto para evitar deformaciones.",
                "Selecciona el formato de salida (JPG, PNG, WEBP) y la calidad, comprobando la vista previa y el peso estimado.",
                "Haz clic en 'Descargar imagen redimensionada' para guardar el archivo optimizado en tu dispositivo.",
              ],
              featuresTitle: "Características principales",
              features: [
                { title: "Vista previa en tiempo real y cálculo de peso", desc: "Compara al instante las dimensiones y el porcentaje de reducción en menos de 0.1 segundos." },
                { title: "Bloqueo inteligente de relación de aspecto", desc: "Ajusta automáticamente el alto o ancho correspondiente sin deformar la foto original." },
                { title: "Exportación a WebP de última generación y PNG sin pérdidas", desc: "Optimiza al máximo la velocidad de tu web con WebP y preserva transparencias con PNG." },
                { title: "Privacidad 100% local en tu navegador (Sin servidor)", desc: "Tus imágenes nunca salen de tu ordenador, asegurando máxima confidencialidad." },
              ],
              useCasesTitle: "Casos prácticos de uso",
              useCases: [
                { icon: "🌐", title: "Optimización web y miniaturas de blog", desc: "Convierte fotos 4K a estándares web (1200x630) para acelerar la carga y mejorar el SEO." },
                { icon: "📧", title: "Límites de adjuntos de correo y fotos de carné", desc: "Adapta fotos de pasaporte y documentos a los límites estrictos de plataformas oficiales." },
                { icon: "📱", title: "Perfiles sociales y portadas de YouTube", desc: "Ajusta tus gráficos a los tamaños exactos recomendados para YouTube, Instagram y X." },
                { icon: "🎨", title: "Maquetación UI e iconos de aplicaciones", desc: "Exporta múltiples resoluciones para el diseño de interfaces web y móviles." },
              ],
              proTipsTitle: "Consejos profesionales de optimización",
              proTips: [
                "Para sitios web, elige el formato 'WEBP': reduce el peso hasta un 35% comparado con JPG manteniendo gran nitidez.",
                "Configura la calidad entre 85% y 90% para obtener el equilibrio perfecto entre tamaño ligero y fidelidad visual.",
                "Para logos o gráficos con fondo transparente, exporta siempre a PNG o WEBP.",
                "Reducir imágenes grandes genera resultados mucho más nítidos que ampliar fotos de baja resolución.",
              ],
              faqTitle: "Preguntas frecuentes (FAQ)",
              faqs: [
                { q: "¿Se pierde calidad al redimensionar las imágenes?", a: "No. desktools.run emplea interpolación bicúbica de alta calidad para evitar pixelados y mantener bordes definidos." },
                { q: "¿Mis fotos se guardan en algún servidor?", a: "No, en absoluto. Todo se procesa en la memoria RAM de tu navegador y se descarta al terminar la sesión." },
                { q: "¿Funciona en teléfonos móviles y tablets?", a: "¡Sí! Funciona fluidamente en navegadores móviles (iOS Safari, Android Chrome) sin instalar aplicaciones." },
                { q: "¿Puedo procesar fotos de más de 50MB?", a: "Sí, al ejecutarse en tu propio hardware no existen límites de subida en la nube." },
                { q: "¿Se mantiene la transparencia en archivos PNG?", a: "Sí, seleccionando PNG o WEBP se conserva intacto el canal alfa de transparencia." },
                { q: "¿Es totalmente gratuito?", a: "100% gratuito, sin límites de uso diario, marcas de agua ni registros requeridos." },
              ],
              relatedToolsTitle: "Herramientas relacionadas",
              relatedTools: [
                { title: "Compresor de imágenes (Image Compress)", desc: "Reduce el tamaño de tus fotos hasta un 80% sin perder calidad visual.", href: "/tools/image-compress/" },
                { title: "Conversor de imágenes (Image Converter)", desc: "Convierte entre JPG, PNG y WebP directamente en el navegador.", href: "/tools/image-converter/" },
                { title: "Eliminador de fondos (Background Remover)", desc: "Elimina fondos de fotos con IA de forma 100% local.", href: "/tools/background-remover/" },
                { title: "Añadir marca de agua (Image Watermark)", desc: "Añade marcas de agua y firmas con control de transparencia.", href: "/tools/image-watermark/" },
              ],
            },
            zh: {
              aboutTitle: "浏览器本地超高速图片尺寸调整与格式转换器",
              aboutDesc: "基于 HTML5 Canvas 2D 高性能渲染引擎与双三次（Bicubic）抗锯齿插值算法，在极小化画质损失的前提下，精准调整图片像素尺寸与百分比缩放比例。所有运算 100% 运行在本地浏览器内存中，企业保密文档与个人照片零服务器上传，全面杜绝隐私外泄风险。",
              howTitle: "分步操作指南",
              steps: [
                "将图片拖拽至上传区域或点击选择文件（支持 JPG、PNG、WebP、GIF、SVG 等格式）。",
                "输入目标宽度和高度像素值，或直接点击 25%、50%、75%、150%、200% 预设比例按钮。",
                "确保锁定宽高比（Link）图标开启，以保持原图比例不变形。",
                "选择导出格式（JPG / PNG / WEBP）及压缩质量，实时查看渲染预览和预估文件大小。",
                "点击“下载调整后的图片”即可将高清成品瞬间保存到您的设备中。",
              ],
              featuresTitle: "核心技术亮点",
              features: [
                { title: "毫秒级实时预览与体积缩减对比", desc: "修改参数 0.1 秒内即时渲染，并直观对比原始与压缩后的文件体积。" },
                { title: "智能锁定宽高比（防止图片拉伸变形）", desc: "修改宽或高任意一项，系统将按黄金比例自动计算并对齐另一侧尺寸。" },
                { title: "新一代 WebP 与无损 PNG 导出", desc: "原生支持超高压缩率的 WebP 格式及完整保留透明通道的 PNG 导出。" },
                { title: "100% 浏览器本地安全沙箱处理", desc: "文件数据绝不上传云端服务器，保障企业商业机密与个人隐私安全。" },
              ],
              useCasesTitle: "实战应用场景",
              useCases: [
                { icon: "🌐", title: "网站与博客文章封面图规格优化", desc: "将单反 4K 大图调整为 Web 标准尺寸（如 1200x630），大幅提升网页加载速度与 SEO 评分。" },
                { icon: "📧", title: "邮件附件与证件照/求职简历上传限制", desc: "轻松满足各类考试报名、政务系统及招聘网站对证件照尺寸与 500KB 以下的严苛要求。" },
                { icon: "📱", title: "社交媒体头像与封面图裁切", desc: "按各平台推荐规格快速调整微信公众号配图、B站封面（1280x720）及小红书图片。" },
                { icon: "🎨", title: "UI 设计师切图与应用图标多倍率导出", desc: "快速批量导出 @1x, @2x, @3x 移动端应用图标与前端设计素材。" },
              ],
              proTipsTitle: "专家图片优化实用技巧",
              proTips: [
                "用于网页发布时优先选择 WEBP 格式，在同等画质下比 JPG 减小高达 35% 体积。",
                "压缩质量建议设置在 85%~90% 区间，肉眼几乎无法分辨画质差异，同时文件体积大幅缩减。",
                "包含透明背景的 Logo 或插画，务必选择 PNG 或 WEBP 格式导出以保留透明通道。",
                "大图等比例缩小通常比小图强行放大拥有更清晰锐利的视觉效果。",
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "调整图片尺寸后会导致画质模糊失真吗？", a: "不会。desktools.run 采用浏览器双三次（Bicubic）平滑重采样算法，有效消除锯齿并保留锐利轮廓。" },
                { q: "上传的照片会被保存或泄露到服务器吗？", a: "绝无可能。所有处理均在您本地设备的浏览器内存中进行，处理完毕即刻释放内存，零网络传输。" },
                { q: "手机或平板电脑也可以直接使用吗？", a: "可以！完全支持 iPhone (Safari) 及 Android (Chrome) 等移动设备浏览器，触控操作体验顺畅。" },
                { q: "可以处理 50MB 以上的超大高清照片吗？", a: "可以。因完全由本地硬件运算，只要您的设备内存允许，单反高分辨率原图均可自由处理。" },
                { q: "带透明背景的 PNG 图片透明度会丢失吗？", a: "不会。导出格式选择 PNG 或 WEBP 时，透明 Alpha 通道将被 100% 完整保留。" },
                { q: "完全免费吗？每天有使用次数限制吗？", a: "100% 永久免费，无需注册账号，绝无任何每日次数限制或强制水印。" },
              ],
              relatedToolsTitle: "推荐相关实用工具",
              relatedTools: [
                { title: "图片压缩器 (Image Compress)", desc: "不改变分辨率，通过 WebP 高效算法无损压缩图片体积高达 80%。", href: "/tools/image-compress/" },
                { title: "图片格式转换器 (Image Converter)", desc: "JPG、PNG、WebP 等多格式在浏览器端批量秒级互转。", href: "/tools/image-converter/" },
                { title: "智能背景消除 (Background Remover)", desc: "内置本地 AI 神经网络模型，一键智能抠图并透明化背景。", href: "/tools/background-remover/" },
                { title: "图片添加水印 (Image Watermark)", desc: "自由添加版权文字及 Logo 水印，支持透明度与旋转调节。", href: "/tools/image-watermark/" },
              ],
            },
            fr: {
              aboutTitle: "Redimensionneur et convertisseur d'images ultra-rapide natif dans le navigateur",
              aboutDesc: "Ajustez avec précision les dimensions en pixels (px) et les pourcentages (%) grâce au moteur HTML5 Canvas et au rééchantillonnage bicubique haute fidélité. Le traitement s'effectue à 100% dans la mémoire de votre navigateur, assurant une confidentialité totale sans upload sur serveur.",
              howTitle: "Guide d'utilisation étape par étape",
              steps: [
                "Glissez-déposez ou sélectionnez votre image (compatible JPG, PNG, WebP, GIF, SVG).",
                "Entrez la largeur et la hauteur cibles en pixels, ou cliquez sur les boutons de pourcentage (25%, 50%, 75%, 150%, 200%).",
                "Assurez-vous que l'icône de verrouillage des proportions (Link) est active pour éviter toute déformation.",
                "Sélectionnez le format de sortie (JPG / PNG / WEBP) et la qualité, en observant l'aperçu en temps réel.",
                "Cliquez sur 'Télécharger l'image' pour enregistrer le fichier optimisé instantanément sur votre appareil.",
              ],
              featuresTitle: "Fonctionnalités clés",
              features: [
                { title: "Aperçu en temps réel & calcul de gain de poids", desc: "Comparez instantanément les dimensions et la réduction de taille en moins de 0.1s." },
                { title: "Maintien intelligent des proportions", desc: "Ajuste automatiquement la hauteur ou la largeur opposée sans déformer l'image." },
                { title: "Export WebP moderne & PNG sans perte", desc: "Optimisez la vitesse web avec le format WebP et préservez la transparence avec le PNG." },
                { title: "Confidentialité 100% locale (Zéro serveur)", desc: "Vos fichiers ne quittent jamais votre appareil, garantissant une sécurité absolue." },
              ],
              useCasesTitle: "Cas d'utilisation pratiques",
              useCases: [
                { icon: "🌐", title: "Optimisation de sites web & miniatures de blog", desc: "Réduisez les photos 4K au format standard (1200x630) pour un temps de chargement ultra-rapide." },
                { icon: "📧", title: "Pièces jointes d'e-mails et photos d'identité", desc: "Respectez facilement les limites strictes des portails d'inscription ou d'e-mails (ex: < 500 Ko)." },
                { icon: "📱", title: "Profils réseaux sociaux et bannières YouTube", desc: "Adaptez vos visuels aux formats recommandés pour YouTube (1280x720), Instagram et X." },
                { icon: "🎨", title: "Maquettes UI & icônes d'applications", desc: "Exportez rapidement différentes résolutions pour vos créations graphiques mobiles et web." },
              ],
              proTipsTitle: "Conseils d'experts pour l'optimisation",
              proTips: [
                "Pour les pages web, optez pour le format 'WEBP' : jusqu'à 35% plus léger que le JPEG à qualité égale.",
                "Réglez le curseur de qualité entre 85% et 90% pour un équilibre parfait entre fidélité visuelle et légèreté.",
                "Pour les logos avec fond transparent, exportez impérativement en PNG ou WEBP.",
                "La réduction d'images haute définition offre une netteté bien supérieure à l'agrandissement d'images basse résolution.",
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Le redimensionnement altère-t-il la qualité de l'image ?", a: "Non. desktools.run utilise un rééchantillonnage bicubique de haute qualité sur Canvas pour préserver la netteté des contours." },
                { q: "Mes photos sont-elles envoyées ou conservées sur un serveur ?", a: "Absolument pas. Tout se déroule dans la mémoire vive de votre navigateur sans aucun transfert réseau." },
                { q: "L'outil fonctionne-t-il sur smartphone et tablette ?", a: "Oui ! Parfaitement compatible avec Safari iOS et Chrome Android sans aucune application requise." },
                { q: "Puis-je traiter des photos lourdes de plus de 50 Mo ?", a: "Oui. L'exécution étant locale sur votre matériel, vous pouvez redimensionner vos photos haute définition sans contrainte." },
                { q: "La transparence des fichiers PNG est-elle préservée ?", a: "Oui, le choix des formats PNG ou WEBP conserve parfaitement le canal alpha de transparence." },
                { q: "L'outil est-il totalement gratuit et sans limite ?", a: "100% gratuit et illimité, sans inscription, sans filigrane et sans abonnement." },
              ],
              relatedToolsTitle: "Outils recommandés",
              relatedTools: [
                { title: "Compresseur d'images (Image Compress)", desc: "Réduisez la taille de vos fichiers jusqu'à 80% sans perte de qualité visuelle.", href: "/tools/image-compress/" },
                { title: "Convertisseur d'images (Image Converter)", desc: "Convertissez entre JPG, PNG et WebP directement dans votre navigateur.", href: "/tools/image-converter/" },
                { title: "Suppression d'arrière-plan (Background Remover)", desc: "Détourez vos images instantanément grâce à l'IA locale.", href: "/tools/background-remover/" },
                { title: "Ajout de filigrane (Image Watermark)", desc: "Appliquez des filigranes textuels ou logos avec contrôle de transparence.", href: "/tools/image-watermark/" },
              ],
            },
            en: {
              aboutTitle: "Browser-Native High-Performance Image Resizer & Converter",
              aboutDesc: "Precision image dimension and percentage scaling powered by client-side HTML5 Canvas. With high-quality bicubic resampling, your pictures retain crystal-clear sharpness while eliminating server upload risks entirely.",
              howTitle: "Step-by-Step Usage Guide",
              steps: [
                "Drop or select an image file into the upload zone (supports JPG, PNG, WebP, GIF, SVG).",
                "Enter target width and height in pixels, or click 25%, 50%, 75%, 150%, 200% percentage scaling chips.",
                "Ensure the aspect ratio lock icon is active to preserve image proportions without distortion.",
                "Choose your desired output format (JPG / PNG / WEBP) and quality slider, observing the live file size preview.",
                "Click 'Download Resized Image' to save your optimized file instantly to your local device.",
              ],
              featuresTitle: "Key Engineering Features",
              features: [
                { title: "Live Real-Time Preview & Byte Delta", desc: "Renders canvas output in 0.1s with side-by-side dimension and file size comparison." },
                { title: "Smart Aspect Ratio Preservation", desc: "Automatically synchronizes complementary dimensions to prevent distortion." },
                { title: "Next-Gen WebP & Lossless PNG Export", desc: "Native export to modern WebP (VP8 lossy) and lossless transparent PNG." },
                { title: "Zero-Server Privacy Sandbox", desc: "Files execute purely within client RAM buffers without outbound network requests." },
              ],
              useCasesTitle: "Real-World Practical Use Cases",
              useCases: [
                { icon: "🌐", title: "Web & Blog Thumbnail Optimization", desc: "Scale heavy 4K camera photos to standard web dimensions for ultra-fast LCP and SEO." },
                { icon: "📧", title: "Document & Email Attachment Limits", desc: "Fit passport photos and scan uploads within strict corporate portal upload bounds." },
                { icon: "📱", title: "Social Media Profiles & Banner Assets", desc: "Resize assets for YouTube thumbnails, Instagram grids, and OpenGraph social cards." },
                { icon: "🎨", title: "UI Design Mockups & App Icons", desc: "Quickly export varying icon and layout resolutions for multi-screen responsive design." },
              ],
              proTipsTitle: "Pro Optimization & Quality Tips",
              proTips: [
                "Select WebP format for web publishing to gain up to 35% byte savings over standard JPEG.",
                "Set the quality slider between 85% and 90% for the best balance of visual fidelity and lightweight file size.",
                "Always export transparent logos or illustrations to PNG or WebP to preserve alpha channel transparency.",
                "Downscaling large photos delivers sharper results than upscaling small low-res originals.",
              ],
              faqTitle: "Frequently Asked Questions (FAQ)",
              faqs: [
                { q: "Does resizing cause blurry or degraded images?", a: "No. Our engine uses high-quality bicubic interpolation on HTML5 Canvas to prevent aliasing and maintain crisp edges." },
                { q: "Are my photos uploaded or stored on external servers?", a: "Zero server storage. Everything runs inside your device's browser memory (Client-Side). Zero bytes are transmitted." },
                { q: "Can I use this image resizer on mobile phones?", a: "Yes! Fully responsive and touch-optimized across iOS Safari, Android Chrome, and tablets without app downloads." },
                { q: "Can I resize large raw photo files exceeding 50MB?", a: "Yes. Because execution happens on your local hardware, high-resolution DSLR photos are processed without cloud limits." },
                { q: "Does it preserve transparency for transparent PNG files?", a: "Yes, selecting PNG or WebP output preserves complete 8-bit/24-bit alpha channel transparency." },
                { q: "Is there any daily limit or subscription cost?", a: "100% free and unlimited. No accounts, no paywalls, and no automated watermarks applied." },
              ],
              relatedToolsTitle: "Related Utilities",
              relatedTools: [
                { title: "Image Compressor", desc: "Shrink image file size up to 80% without losing visual clarity.", href: "/tools/image-compress/" },
                { title: "Image Converter", desc: "Batch convert between JPG, PNG, and WebP instantly.", href: "/tools/image-converter/" },
                { title: "Background Remover", desc: "Client-side AI neural network background remover.", href: "/tools/background-remover/" },
                { title: "Image Watermark", desc: "Add transparent copyright text and logo watermarks.", href: "/tools/image-watermark/" },
              ],
            },
          };

          const active = content[locale as keyof typeof content] || content.en;

          return (
            <ToolGuide
              badgeText="100% Free & Browser-Native"
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
        @media (max-width: 900px) {
          .workspace-grid { grid-template-columns: 1fr !important; }
          .preview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
