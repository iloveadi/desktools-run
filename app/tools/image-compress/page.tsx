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
  const { t, locale } = useLocale();

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
            {t("imageCompress.back")}
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
              {t("imageCompress.badge")}
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
                    {t("imageCompress.dropDesc")}
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
                    {t("imageCompress.addMore")}
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

        {/* ── Unified Tool Guide & FAQ Section (Full 6-Language Support) ───────── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "브라우저 네이티브 고효율 이미지 무손실/스마트 압축기",
              aboutDesc: "HTML5 Canvas API와 최신 WebP/JPEG 인코딩 알고리즘을 활용하여 이미지의 화질 손상을 최소화하면서 용량을 최대 80%까지 획기적으로 줄여줍니다. 모든 압축 연산이 브라우저 메모리 내부(Client-side)에서 100% 로컬로 처리되므로, 소중한 개인 사진이나 비즈니스 그래픽 자산이 외부 서버로 유출될 위험이 전혀 없습니다.",
              howTitle: "단계별 압축 방법 안내",
              steps: [
                "압축할 이미지 파일들을 한 번에 드래그앤드롭하거나 클릭하여 일괄 선택합니다 (PNG, JPG, WEBP, BMP 등 다중 파일 지원).",
                "압축 강도 프리셋(권장 80% / 강력 압축 55% / 화질 우선 92% / 사용자 지정 슬라이더)을 선택합니다.",
                "더 높은 용량 절감을 원할 경우 'WebP 자동 변환' 옵션을 체크합니다.",
                "파일 목록에서 실시간으로 압축된 이미지 미리보기와 절감된 파일 크기(-%)를 확인합니다.",
                "'개별 다운로드' 또는 '전체 일괄 다운로드' 버튼을 클릭하여 압축된 파일들을 기기에 즉시 저장합니다.",
              ],
              featuresTitle: "이미지 압축기 핵심 기술 및 편의 기능",
              features: [
                { title: "다중 파일 일괄 고속 압축 (Batch Compression)", desc: "수십 장의 고해상도 이미지를 대기 시간 없이 동시에 병렬로 압축 처리합니다." },
                { title: "스마트 화질 보존 알고리즘 (Perceptual Lossless)", desc: "사람의 시각 특성을 고려한 양자화 인코딩으로 육안상 화질 저하 없이 파일 용량만 대폭 줄입니다." },
                { title: "WebP 차세대 고효율 포맷 자동 변환", desc: "기존 PNG/JPG 대비 평균 30~50% 더 가벼운 구글 WebP 포맷으로 즉시 변환 압축이 가능합니다." },
                { title: "100% 로컬 프라이버시 샌드박스 (Zero Server Upload)", desc: "단 1바이트의 이미지 데이터도 외부 서버로 전송되지 않아 완벽한 데이터 보안을 보장합니다." },
              ],
              useCasesTitle: "실무 추천 활용 시나리오",
              useCases: [
                { icon: "🚀", title: "웹사이트 & 쇼핑몰 로딩 속도 최적화 (SEO 향상)", desc: "쇼핑몰 상품 상세 페이지와 블로그 이미지를 압축하여 구글 Core Web Vitals 점수를 높입니다." },
                { icon: "📧", title: "이메일 첨부파일 및 메신저 전송 용량 제한 해결", desc: "용량 제한이 있는 이메일이나 사내 메신저에 고화질 사진을 가볍게 압축하여 빠르게 전송합니다." },
                { icon: "📝", title: "공공기관 및 입사 지원 포털 서류 업로드 규격 맞춤", desc: "정부24, 채용 사이트 등 파일 크기 제한(예: 1MB 이하)이 엄격한 시스템 규격을 손쉽게 맞춥니다." },
                { icon: "📱", title: "스마트폰 및 클라우드 저장 공간 절약", desc: "카메라로 촬영한 수십 MB 용량의 원본 사진을 화질 손상 없이 압축 보관하여 용량을 확보합니다." },
              ],
              proTipsTitle: "전문가 이미지 압축 & 최적화 노하우",
              proTips: [
                "일반적인 웹 업로드용 사진은 '권장 압축 (80%)' 모드가 화질과 파일 크기 사이의 가장 이상적인 균형을 제공합니다.",
                "투명 배경이 있는 PNG 파일은 'WebP 자동 변환'을 활성화하면 투명도를 유지하면서 PNG 대비 60% 이상 용량을 줄일 수 있습니다.",
                "4K 이상의 초대형 사진은 '강력 압축' 모드 선택 시 해상도가 2560px로 지능형 최적화되어 메가바이트 단위의 용량이 수백 킬로바이트(KB)로 줄어듭니다.",
                "압축 후 미리보기를 통해 세부 질감을 확인한 뒤 최적의 압축률을 선택하세요.",
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "이미지 압축 후 사진 화질이 많이 깨지나요?", a: "아닙니다. 권장 모드(80%) 기준으로는 육안으로 화질 차이를 거의 구분할 수 없도록 시각적 손실 최소화 알고리즘이 적용됩니다." },
                { q: "업로드한 사진이 서버에 저장되거나 외부로 유출되지 않나요?", a: "전혀 유출되지 않습니다. desktools.run의 모든 이미지 처리는 사용자의 브라우저 메모리 안에서만 100% 로컬로 동작합니다." },
                { q: "한 번에 몇 장까지 동시에 압축할 수 있나요?", a: "수량 제한이 없습니다. 기기의 메모리가 허용하는 한 수십 장 이상의 사진을 한 번에 드래그하여 일괄 압축할 수 있습니다." },
                { q: "PNG 투명 배경도 압축 시 유지되나요?", a: "네! 기본적으로 투명 배경을 지원하는 WebP/PNG 모드로 처리되어 투명한 배경이 검게 변하지 않고 그대로 유지됩니다." },
                { q: "모바일 스마트폰(아이폰/갤럭시)에서도 동작하나요?", a: "네! 별도의 어플 설치 없이 모바일 Safari, Chrome 브라우저에서 모든 기능이 완벽하게 작동합니다." },
                { q: "이용 요금이나 하루 이용 횟수 제한이 있나요?", a: "완전 100% 무료이며 이용 횟수 제한, 워터마크 추가, 회원가입 요구가 전혀 없습니다." },
              ],
              relatedToolsTitle: "함께 쓰면 좋은 연관 도구",
              relatedTools: [
                { title: "이미지 포맷 변환기 (Image Converter)", desc: "PNG, JPG, WEBP, BMP, ICO 포맷을 브라우저에서 상호 변환합니다.", href: "/tools/image-converter/" },
                { title: "이미지 크기 조절 (Image Resizer)", desc: "해상도(픽셀/%)를 원하는 규격으로 자유롭게 조절하고 최적화합니다.", href: "/tools/image-resizer/" },
                { title: "배경 제거기 (Background Remover)", desc: "AI 신경망으로 이미지의 배경을 1초 만에 깔끔하게 투명화합니다.", href: "/tools/background-remover/" },
                { title: "워터마크 추가기 (Image Watermark)", desc: "사진에 저작권 보호용 텍스트 및 로고를 투명도와 함께 합성합니다.", href: "/tools/image-watermark/" },
              ],
            },
            ja: {
              aboutTitle: "ブラウザネイティブ高効率画像スマート軽量化・圧縮ツール",
              aboutDesc: "HTML5 Canvas APIと最新のWebP/JPEGエンコーダーを活用し、画質の劣化を最小限に抑えながら画像サイズを最大80%まで劇的に軽量化します。すべての処理がお使いのブラウザメモリ内で100%ローカルに完結するため、機密画像も安全に圧縮できます。",
              howTitle: "ステップ別のご利用手順",
              steps: [
                "圧縮したい画像をまとめてドラッグ＆ドロップまたはクリックして選択します（PNG、JPG、WEBP、BMPなどに対応）。",
                "圧縮プリセット（推奨 80% / 高圧縮 55% / 高画質 92% / カスタムスライダー）を選択します。",
                "さらなる軽量化を求める場合は「WebP自動変換」オプションを有効にします。",
                "一覧で圧縮後のプレビューと削減されたファイルサイズ（-%）をリアルタイムに確認します。",
                "「個別ダウンロード」または「全ファイル一括ダウンロード」ボタンで保存します。",
              ],
              featuresTitle: "画像圧縮ツールの主な特徴",
              features: [
                { title: "複数ファイルの一括高速圧縮（Batch Compression）", desc: "大量の高解像度画像を待ち時間なしで瞬時に並列圧縮します。" },
                { title: "視覚的劣化ゼロの最適化アルゴリズム", desc: "人間の視覚特性に合わせた量子化により、見た目の美しさを保ちながら容量のみを削減します。" },
                { title: "次世代WebPフォーマット自動変換", desc: "従来のPNG/JPG比で30〜50%軽量なGoogle WebP形式への即時変換圧縮に対応。" },
                { title: "完全ローカル・安心プライバシー（Zero Server Upload）", desc: "画像データが外部サーバーへ送信されることはなく、端末内で安全に処理されます。" },
              ],
              useCasesTitle: "実務での活用シーン",
              useCases: [
                { icon: "🚀", title: "Webサイト・ブログの表示速度向上（SEO改善）", desc: "ECサイトの商品画像やブログの写真を圧縮し、Google PageSpeedスコアを向上させます。" },
                { icon: "📧", title: "メール添付やチャットツールの容量制限対策", desc: "ファイルサイズ制限のあるメール送信時に高画質写真を素早く軽量化します。" },
                { icon: "📝", title: "公的機関・求人サイトの提出書類サイズ調整", desc: "ファイル容量制限（例: 1MB以下）が厳しい申請フォームの要件をクリアします。" },
                { icon: "📱", title: "スマホやクラウドストレージの容量節約", desc: "高画質カメラで撮影した大容量写真を画質を落とさずに圧縮保管します。" },
              ],
              proTipsTitle: "専門家による画像軽量化のヒント",
              proTips: [
                "一般的なWeb用途には「推奨（80%）」モードが最もバランス良く高品質を維持できます。",
                "透過背景のあるPNG画像は「WebP自動変換」を有効にすることで、透過を保ちながら60%以上容量をカットできます。",
                "4K以上の特大画像は「高圧縮」を選択すると自動で適切な解像度に調整され、大幅にサイズを縮小できます。",
                "圧縮プレビューで細部の質感を確認しながら、用途に最適な圧縮率を微調整してください。",
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "圧縮後に画像の画質が大幅に劣化することはありますか？", a: "いいえ。推奨モード（80%）では肉眼でほとんど劣化を感じさせない高度なアルゴリズムを採用しています。" },
                { q: "アップロードした画像がサーバーに流出する心配はありませんか？", a: "一切ありません。すべての処理はブラウザのRAMメモリ内でのみ実行され、外部通信は行われません。" },
                { q: "一度に何枚まで同時に圧縮できますか？", a: "枚数制限はありません。お使いの端末メモリが許す限り、数十枚以上の画像をまとめて圧縮できます。" },
                { q: "PNGの透過背景は圧縮後も保持されますか？", a: "はい！アルファ透過をサポートするWebP/PNG形式で処理されるため、背景が黒くならず透過が維持されます。" },
                { q: "スマホ（iPhone/Android）でも使えますか？", a: "はい！アプリのインストール不要で、モバイルブラウザから快適にご利用いただけます。" },
                { q: "利用料金や1日の制限はありますか？", a: "完全無料・無制限です。透かし追加や会員登録も一切ありません。" },
              ],
              relatedToolsTitle: "関連する便利なツール",
              relatedTools: [
                { title: "画像フォーマット変換 (Image Converter)", desc: "PNG、JPG、WEBP、BMP、ICO形式を瞬時に相互変換します。", href: "/tools/image-converter/" },
                { title: "画像リサイザー (Image Resizer)", desc: "画像の解像度（px/%）を自由に変更・最適化します。", href: "/tools/image-resizer/" },
                { title: "背景削除 (Background Remover)", desc: "AIニューラルネットワークで画像の背景を瞬時に透過（切り抜き）します。", href: "/tools/background-remover/" },
                { title: "ウォーターマーク追加 (Image Watermark)", desc: "写真に著作権保護用のテキストやロゴ透かしを合成します。", href: "/tools/image-watermark/" },
              ],
            },
            es: {
              aboutTitle: "Compresor de imágenes inteligente y de alto rendimiento nativo del navegador",
              aboutDesc: "Reduce el tamaño de tus archivos de imagen hasta un 80% sin pérdida perceptible de calidad utilizando la API HTML5 Canvas y los estándares WebP/JPEG. Todo el procesamiento se realiza al 100% en la memoria local de tu navegador, garantizando máxima velocidad y total privacidad de tus datos.",
              howTitle: "Guía de uso paso a paso",
              steps: [
                "Arrastra y suelta o selecciona varias imágenes a la vez (compatible con PNG, JPG, WEBP, BMP).",
                "Elige un ajuste preestablecido de compresión (Recomendado 80% / Máxima compresión 55% / Calidad alta 92% / Control deslizante personalizado).",
                "Activa 'Conversión automática a WebP' para maximizar la reducción de peso.",
                "Comprueba la vista previa en tiempo real y el porcentaje de tamaño ahorrado (-%).",
                "Haz clic en 'Descargar' o 'Descargar todo' para guardar tus imágenes optimizadas.",
              ],
              featuresTitle: "Características principales de compresión",
              features: [
                { title: "Compresión por lotes masiva (Batch Compression)", desc: "Procesa decenas de imágenes en simultáneo de forma ultrarrápida sin esperas." },
                { title: "Algoritmo de conservación perceptual de calidad", desc: "Optimiza los datos de la imagen manteniendo una nitidez impecable a simple vista." },
                { title: "Conversión automática a WebP de última generación", desc: "Exporta al formato WebP de Google para lograr un 30% a 50% de reducción adicional." },
                { title: "Privacidad 100% local (Sin subidas a servidores)", desc: "Tus fotos nunca salen de tu ordenador, asegurando máxima confidencialidad." },
              ],
              useCasesTitle: "Casos prácticos de uso",
              useCases: [
                { icon: "🚀", title: "Optimización de páginas web y tiendas online (SEO)", desc: "Acelera los tiempos de carga web y mejora las métricas Core Web Vitals de Google." },
                { icon: "📧", title: "Superación de límites de tamaño en correo y mensajería", desc: "Envía fotografías de alta calidad reduciendo su peso para adjuntarlas sin problemas." },
                { icon: "📝", title: "Trámites oficiales y portales de empleo", desc: "Cumple con las restricciones de peso en formularios gubernamentales y plataformas de selección." },
                { icon: "📱", title: "Ahorro de espacio en smartphone y nube", desc: "Libera almacenamiento comprimiendo fotos pesadas sin sacrificar recuerdos." },
              ],
              proTipsTitle: "Consejos profesionales de optimización",
              proTips: [
                "El modo 'Recomendado (80%)' ofrece el equilibrio perfecto entre ligereza y nitidez visual para la web.",
                "En archivos PNG con fondo transparente, activar 'WebP automático' conserva la transparencia reduciendo el peso en más del 60%.",
                "Para imágenes de resolución 4K, el modo 'Máxima compresión' ajusta inteligentemente la escala para un ahorro drástico.",
                "Verifica la vista previa antes de descargar para asegurar el nivel de compresión deseado.",
              ],
              faqTitle: "Preguntas frecuentes (FAQ)",
              faqs: [
                { q: "¿Se pierde calidad visible al comprimir las imágenes?", a: "No. Con el modo recomendado (80%), la diferencia es prácticamente imperceptible para el ojo humano." },
                { q: "¿Mis fotos se suben o guardan en algún servidor?", a: "No, en absoluto. Todo el procesamiento ocurre en la memoria RAM de tu navegador." },
                { q: "¿Cuántas imágenes puedo comprimir a la vez?", a: "No hay límite. Puedes procesar tantas imágenes como soporte la memoria de tu dispositivo." },
                { q: "¿Se conserva la transparencia en imágenes PNG?", a: "Sí, la transparencia alfa se mantiene intacta en los formatos compatibles como WebP y PNG." },
                { q: "¿Funciona en teléfonos móviles (iPhone / Android)?", a: "Sí, funciona de forma rápida y fluida en cualquier navegador móvil." },
                { q: "¿Tiene algún coste o límite diario de uso?", a: "Es 100% gratuito e ilimitado. Sin marcas de agua ni registros requeridos." },
              ],
              relatedToolsTitle: "Herramientas relacionadas",
              relatedTools: [
                { title: "Conversor de imágenes (Image Converter)", desc: "Convierte entre formatos PNG, JPG, WEBP, BMP e ICO al instante.", href: "/tools/image-converter/" },
                { title: "Redimensionador de imágenes (Image Resizer)", desc: "Ajusta las dimensiones en píxeles o porcentaje con precisión.", href: "/tools/image-resizer/" },
                { title: "Eliminador de fondos (Background Remover)", desc: "Elimina fondos de imágenes con IA 100% local en tu navegador.", href: "/tools/background-remover/" },
                { title: "Añadir marca de agua (Image Watermark)", desc: "Protege tus fotos con marcas de agua y firmas personalizadas.", href: "/tools/image-watermark/" },
              ],
            },
            zh: {
              aboutTitle: "浏览器本地高效率图片智能无损压缩器",
              aboutDesc: "基于 HTML5 Canvas API 与先进的 WebP/JPEG 编码算法，在保持肉眼无感画质差异的前提下，将图片体积大幅降低高达 80%。全流程 100% 在本地浏览器内存中计算，零文件上传云端服务器，全面保障您的商业资产与个人隐私安全。",
              howTitle: "分步操作指南",
              steps: [
                "批量拖拽或点击选择多张需要压缩的图片（支持 PNG、JPG、WEBP、BMP 等格式）。",
                "选择压缩预设方案（推荐 80% / 强力压缩 55% / 极致画质 92% / 自定义质量滑块）。",
                "如需进一步精简体积，可勾选“自动转换为 WebP”选项。",
                "在列表中实时预览压缩效果并查看体积缩减百分比（-%）。",
                "点击“单张下载”或“全部下载”按钮，即可将优化后的图片保存至本地。",
              ],
              featuresTitle: "核心工程技术特性",
              features: [
                { title: "多图批量极速并发压缩 (Batch Compression)", desc: "支持一次性导入数十张高清大图，无排队延迟并发完成压缩优化。" },
                { title: "感知无损优化算法 (Perceptual Quality)", desc: "基于人眼视觉特性进行智能量化编码，在极致缩减体积的同时保持画面清晰细腻。" },
                { title: "新一代 WebP 高效格式自动转码", desc: "支持一键转换为比传统 PNG/JPG 额外体积减小 30%~50% 的 Google WebP 格式。" },
                { title: "100% 浏览器本地安全沙箱 (零服务器上传)", desc: "照片数据绝不离开发生运算的设备，彻底杜绝数据泄露风险。" },
              ],
              useCasesTitle: "实战应用推荐场景",
              useCases: [
                { icon: "🚀", title: "网站与电商博客性能优化 (提升 SEO)", desc: "大幅压缩商品主图与详情页图片，提升网页加载速度与 Google Core Web Vitals 评分。" },
                { icon: "📧", title: "邮件附件与即时通讯大图轻量化传输", desc: "突破邮箱与企业微信等即时通讯工具的单文件大小限制，秒级完成图片发送。" },
                { icon: "📝", title: "政务平台与招聘网站严格大小限制适配", desc: "轻松满足各类考试报名、政务系统等对上传图片体积（如 1MB 以内）的严苛限制。" },
                { icon: "📱", title: "手机与云盘储存空间释放", desc: "在不损坏珍贵回忆画质的前提下，将数码相机拍摄的几十兆原图批量瘦身。" },
              ],
              proTipsTitle: "专家图片压缩优化技巧",
              proTips: [
                "用于普通网页和日常分享时，'推荐模式 (80%)' 能够在画质和文件体积间取得完美平衡。",
                "带有透明背景的 PNG 图片建议开启 '自动转换为 WebP'，可在保留透明通道的同时减小 60% 以上体积。",
                "对于 4K 以上的超大分辨率照片，'强力压缩' 模式会自动进行智能缩放，将数兆文件缩小至数百 KB。",
                "下载前可通过列表中的预览图仔细检查纹理细节，以调整至最理想的压缩比。",
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "压缩后的图片画质会明显变模糊吗？", a: "不会。在推荐模式（80%）下采用了先进的感知无损算法，肉眼几乎无法察觉画质差异。" },
                { q: "上传的照片会被上传或保存在服务器上吗？", a: "绝无可能。desktools.run 的所有压缩运算全部在您本地电脑内存中进行，无网络传输。" },
                { q: "一次可以同时批量压缩多少张图片？", a: "无数量限制。只要您的设备内存允许，可以一次性导入数十张甚至更多图片进行批量处理。" },
                { q: "PNG 透明背景在压缩后会变成黑色吗？", a: "不会！系统默认支持 WebP/PNG 透明 Alpha 通道，能够完整保留透明图层。" },
                { q: "手机（iPhone / 安卓）可以直接使用吗？", a: "可以！无需安装任何 App，在移动端 Safari 或 Chrome 浏览器中即可流畅运行。" },
                { q: "完全免费吗？每天有次数限制吗？", a: "100% 永久免费，无任何每日上限，不添加任何水印，无需注册登录。" },
              ],
              relatedToolsTitle: "推荐相关实用工具",
              relatedTools: [
                { title: "图片格式转换 (Image Converter)", desc: "在 PNG、JPG、WEBP、BMP、ICO 格式之间极速互转。", href: "/tools/image-converter/" },
                { title: "图片尺寸调整 (Image Resizer)", desc: "按像素或百分比无损调整图片分辨率与尺寸规格。", href: "/tools/image-resizer/" },
                { title: "智能背景消除 (Background Remover)", desc: "内置本地 AI 神经网络模型，一键智能抠图并透明化背景。", href: "/tools/background-remover/" },
                { title: "图片添加水印 (Image Watermark)", desc: "自由添加版权文字及 Logo 水印，支持透明度与旋转调节。", href: "/tools/image-watermark/" },
              ],
            },
            fr: {
              aboutTitle: "Compresseur d'images haute performance et intelligent natif dans le navigateur",
              aboutDesc: "Réduisez la taille de vos fichiers image jusqu'à 80% sans perte visuelle grâce à l'API HTML5 Canvas et aux algorithmes WebP/JPEG. Tout s'exécute à 100% dans la mémoire vive de votre navigateur, assurant une vitesse maximale et une confidentialité absolue sans transfert de données vers des serveurs.",
              howTitle: "Guide d'utilisation étape par étape",
              steps: [
                "Glissez-déposez ou sélectionnez plusieurs images en une seule fois (compatible PNG, JPG, WEBP, BMP).",
                "Choisissez un préréglage de compression (Recommandé 80% / Haute compression 55% / Haute qualité 92% / Curseur personnalisé).",
                "Cochez l'option 'Conversion automatique en WebP' pour maximiser l'économie d'espace.",
                "Vérifiez l'aperçu du résultat en temps réel et le pourcentage de réduction de poids (-%).",
                "Cliquez sur 'Télécharger' individuellement ou sur 'Tout télécharger' pour enregistrer vos fichiers.",
              ],
              featuresTitle: "Fonctionnalités clés de compression",
              features: [
                { title: "Compression par lots ultra-rapide (Batch Compression)", desc: "Compressez des dizaines d'images simultanément sans file d'attente ni latence serveur." },
                { title: "Algorithme d'optimisation perceptuelle sans perte", desc: "Préserve la netteté et les détails visuels tout en réduisant drastiquement le poids." },
                { title: "Conversion automatique vers le format moderne WebP", desc: "Profitez d'un gain d'espace supplémentaire de 30% à 50% grâce au format WebP de Google." },
                { title: "Confidentialité 100% locale (Zéro upload sur serveur)", desc: "Vos photos ne quittent jamais votre appareil, assurant une sécurité totale de vos données." },
              ],
              useCasesTitle: "Cas d'utilisation pratiques",
              useCases: [
                { icon: "🚀", title: "Optimisation de sites web et e-commerce (Amélioration SEO)", desc: "Accélérez le chargement de vos pages web et améliorez vos scores Google Core Web Vitals." },
                { icon: "📧", title: "Pièces jointes d'e-mails et messageries professionnelles", desc: "Allégez vos photos haute définition pour respecter les limites de taille de vos envois." },
                { icon: "📝", title: "Démarches administratives et plateformes de recrutement", desc: "Respectez facilement les plafonds de taille de fichiers (ex: moins de 1 Mo) exigés par les formulaires." },
                { icon: "📱", title: "Économie d'espace sur smartphone et stockage cloud", desc: "Gagnez de la place sur votre disque en compressant vos photos sans altérer vos souvenirs." },
              ],
              proTipsTitle: "Conseils d'experts pour la compression d'images",
              proTips: [
                "Pour les usages web courants, le mode 'Recommandé (80%)' offre le meilleur ratio entre qualité visuelle et légèreté.",
                "Sur les fichiers PNG avec fond transparent, activer le 'WebP automatique' préserve la transparence tout en réduisant le poids de plus de 60%.",
                "Pour les photos en résolution 4K, le mode 'Haute compression' adapte intelligemment l'échelle pour une réduction massive.",
                "Vérifiez l'aperçu avant téléchargement pour ajuster le niveau de compression idéal.",
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "La qualité de l'image est-elle dégradée après compression ?", a: "Non. Le mode recommandé (80%) utilise un algorithme perceptuel imperceptible à l'œil nu." },
                { q: "Mes photos sont-elles envoyées ou stockées sur un serveur ?", a: "Absolument pas. Tout le traitement s'exécute dans la mémoire vive de votre navigateur sans aucun transfert réseau." },
                { q: "Combien d'images puis-je compresser à la fois ?", a: "Il n'y a aucune limite. Vous pouvez traiter autant d'images que la mémoire de votre appareil le permet." },
                { q: "La transparence PNG est-elle préservée ?", a: "Oui ! Les formats compatibles comme WebP et PNG gèrent parfaitement le canal alpha de transparence." },
                { q: "L'outil est-il compatible sur mobile (iPhone / Android) ?", a: "Oui ! Il fonctionne parfaitement sur tous les navigateurs mobiles sans aucune application à installer." },
                { q: "Le service est-il gratuit et sans limite ?", a: "100% gratuit et illimité. Aucun filigrane, aucune inscription et aucun frais caché." },
              ],
              relatedToolsTitle: "Outils recommandés",
              relatedTools: [
                { title: "Convertisseur d'images (Image Converter)", desc: "Convertissez instantanément vos fichiers entre PNG, JPG, WEBP, BMP et ICO.", href: "/tools/image-converter/" },
                { title: "Redimensionneur d'images (Image Resizer)", desc: "Ajustez les dimensions en pixels ou en pourcentage sans perte de qualité.", href: "/tools/image-resizer/" },
                { title: "Suppression d'arrière-plan (Background Remover)", desc: "Détourez vos images instantanément grâce à l'intelligence artificielle locale.", href: "/tools/background-remover/" },
                { title: "Ajout de filigrane (Image Watermark)", desc: "Appliquez des filigranes textuels ou logos avec contrôle de transparence.", href: "/tools/image-watermark/" },
              ],
            },
            en: {
              aboutTitle: "Browser-Native High-Efficiency Smart Image Compressor",
              aboutDesc: "Drastically reduce image file sizes up to 80% without perceptible visual quality loss using HTML5 Canvas APIs and cutting-edge WebP/JPEG encoding. All compression operations run 100% locally inside your client browser memory, guaranteeing enterprise-grade confidentiality and zero data leaks.",
              howTitle: "Step-by-Step Usage Guide",
              steps: [
                "Drag and drop or select multiple image files at once (supports PNG, JPG, WEBP, BMP).",
                "Select a compression preset (Recommended 80% / High Compression 55% / High Quality 92% / Custom Slider).",
                "Enable 'Auto Convert to WebP' for maximum file size reduction.",
                "Inspect real-time compressed previews and the calculated file savings percentage (-%).",
                "Click 'Download' individually or 'Download All' to save your optimized assets instantly.",
              ],
              featuresTitle: "Key Compression & Engineering Features",
              features: [
                { title: "High-Speed Batch Compression", desc: "Compress dozens of high-resolution images simultaneously with zero server queue delays." },
                { title: "Perceptual Lossless Optimization Algorithm", desc: "Intelligent quantization preserves crystal-clear details while eliminating redundant byte data." },
                { title: "Next-Gen WebP Auto-Encoding", desc: "Gain an extra 30%~50% compression boost by outputting to Google's modern WebP format." },
                { title: "100% Client-Side Privacy Sandbox (Zero Upload)", desc: "Zero file bytes leave your local device, guaranteeing total data security." },
              ],
              useCasesTitle: "Real-World Practical Use Cases",
              useCases: [
                { icon: "🚀", title: "Web Performance & E-commerce SEO Optimization", desc: "Speed up page load times and improve Google Core Web Vitals scores by shrinking product and banner assets." },
                { icon: "📧", title: "Email Attachments & Chat File Size Limits", desc: "Easily bypass email attachment size limits by compressing heavy photos before sending." },
                { icon: "📝", title: "Government & Job Application Portal Compliance", desc: "Meet strict file size requirements (e.g., under 1MB) on administrative portals and job boards." },
                { icon: "📱", title: "Device & Cloud Storage Space Savings", desc: "Free up valuable storage space on your smartphone and cloud drives without sacrificing quality." },
              ],
              proTipsTitle: "Pro Optimization & Compression Tips",
              proTips: [
                "For web publishing, the 'Recommended (80%)' preset delivers the ideal sweet spot between visual fidelity and lightweight file size.",
                "For transparent PNG files, enabling 'Auto Convert to WebP' preserves the alpha channel while reducing file size by over 60%.",
                "For ultra-high-resolution 4K+ images, the 'High Compression' mode automatically scales dimensions to 2560px for massive byte reduction.",
                "Always check the live preview to confirm visual sharpness before downloading batch archives.",
              ],
              faqTitle: "Frequently Asked Questions (FAQ)",
              faqs: [
                { q: "Does compression visibly degrade image quality?", a: "No. The recommended 80% preset uses perceptual lossless optimization that looks identical to the original to the human eye." },
                { q: "Are my photos uploaded or stored on any server?", a: "Zero server storage. Everything runs inside your device's browser memory (Client-Side). Zero bytes are transmitted." },
                { q: "How many images can I compress at once?", a: "There are no arbitrary limits. You can batch compress dozens of photos simultaneously as long as your device RAM permits." },
                { q: "Is PNG transparency preserved during compression?", a: "Yes! Alpha transparency is fully retained in supported WebP and PNG formats without black box artifacts." },
                { q: "Can I use this compressor on mobile phones (iOS / Android)?", a: "Yes! Fully responsive and touch-optimized across mobile browsers without requiring app installations." },
                { q: "Is it completely free with no usage limits?", a: "100% free and unlimited. No accounts, no paywalls, and no automated watermarks applied." },
              ],
              relatedToolsTitle: "Related Utilities",
              relatedTools: [
                { title: "Image Converter", desc: "Convert between PNG, JPG, WEBP, BMP, and ICO formats instantly.", href: "/tools/image-converter/" },
                { title: "Image Resizer", desc: "Resize image dimensions (pixels/percentage) while preserving quality.", href: "/tools/image-resizer/" },
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
    </>
  );
}
