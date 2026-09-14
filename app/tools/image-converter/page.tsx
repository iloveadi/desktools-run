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
  const { t, locale } = useLocale();

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

        {/* ── Unified Tool Guide & FAQ Section (Full 6-Language Support) ───────── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "브라우저 네이티브 다중 이미지 포맷 일괄 변환기",
              aboutDesc: "HTML5 Canvas API와 클라이언트 사이드 바이너리 인코더를 활용하여 PNG, JPG, WEBP, BMP, ICO 등 다양한 이미지 포맷을 서버 업로드 없이 초고속으로 상호 일괄 변환합니다. 모든 변환 과정이 사용자의 웹 브라우저 메모리 내부에서 100% 로컬로 처리되므로, 소중한 개인 사진이나 비즈니스 그래픽 자산의 데이터 유출 걱정 없이 안전하게 사용할 수 있습니다.",
              howTitle: "단계별 사용 방법 안내",
              steps: [
                "변환할 이미지 파일들을 한 번에 드래그앤드롭하거나 클릭하여 일괄 선택합니다 (PNG, JPG, WEBP, GIF, BMP, SVG 등).",
                "상단 컨트롤 바에서 목표 출력 포맷(WEBP / PNG / JPG / BMP / ICO)을 선택합니다.",
                "JPG 또는 WEBP 포맷의 경우 압축 품질(Quality)을 10%~100% 범위로 조절하고, JPG 변환 시 배경색(흰색/검정)을 지정합니다.",
                "파일 목록에서 실시간으로 처리된 변환 이미지 미리보기와 절감된 용량을 확인합니다.",
                "'개별 다운로드' 또는 '전체 일괄 다운로드' 버튼을 클릭하여 변환된 파일들을 기기에 즉시 저장합니다.",
              ],
              featuresTitle: "이미지 변환기 핵심 엔지니어링 기능",
              features: [
                { title: "다중 파일 일괄 변환 (Batch Processing)", desc: "여러 장의 고해상도 이미지를 한 번에 불러와 원하는 포맷으로 지연 없이 동시에 고속 변환합니다." },
                { title: "차세대 WebP & 초고효율 압축 (VP8)", desc: "구글의 WebP 손실/무손실 인코딩을 지원하여 화질 손상 없이 이미지 용량을 평균 30~80% 대폭 줄여줍니다." },
                { title: "파비콘(ICO) & 무손실 PNG 알파 보존", desc: "웹사이트용 Favicon.ico 자동 리사이즈 생성 및 투명 배경을 완벽히 보존하는 PNG 출력을 지원합니다." },
                { title: "100% 로컬 프라이버시 샌드박스 (Zero Upload)", desc: "단 1바이트의 사진 데이터도 원격 서버로 전송되지 않아 완벽한 개인정보 보안을 보증합니다." },
              ],
              useCasesTitle: "실무 추천 활용 시나리오",
              useCases: [
                { icon: "🌐", title: "웹사이트 로딩 최적화를 위한 WebP 일괄 전환", desc: "무거운 PNG/JPG 파일들을 가벼운 차세대 WebP로 대량 변환하여 사이트 속도와 SEO 순위를 높입니다." },
                { icon: "📱", title: "웹사이트 파비콘(Favicon.ico) 아이콘 제작", desc: "일반 PNG 로고나 일러스트를 웹 브라우저 탭에 표시되는 표준 Favicon.ico 형식으로 손쉽게 생성합니다." },
                { icon: "📧", title: "JPG 강제 요구 서류 및 행정 포털 규격 맞춤", desc: "채용 사이트, 관공서 등에서 JPG 포맷만 요구할 때 PNG나 WebP 파일을 즉시 JPG로 변환합니다." },
                { icon: "🎨", title: "디자이너 에셋 가공 및 투명 PNG 추출", desc: "투명 배경을 지원하지 않는 BMP나 JPG를 무손실 PNG로 변환하여 그래픽 편집 작업에 활용합니다." },
              ],
              proTipsTitle: "전문가 이미지 변환 & 압축 노하우",
              proTips: [
                "웹사이트 썸네일과 배너는 'WEBP' 포맷을 강력 추천합니다. JPEG 대비 최대 35% 더 가벼워 로딩 속도가 획기적으로 개선됩니다.",
                "투명 배경(알파 채널)이 있는 일러스트나 로고는 JPG로 변환 시 투명 영역이 선택한 배경색(기본 흰색)으로 채워지므로, 투명도를 유지하려면 PNG 또는 WEBP를 선택하세요.",
                "품질 슬라이더를 85~90%로 설정하면 사람의 눈으로는 화질 차이를 거의 느끼지 못하면서 파일 크기를 절반 이상 절감할 수 있습니다.",
                "파비콘(ICO)으로 변환할 때는 256x256 이하의 정사각형 크기로 자동 최적화되어 브라우저 탭에 가장 선명하게 표시됩니다.",
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "한 번에 여러 장의 사진을 동시에 변환할 수 있나요?", a: "네! 파일 선택 창에서 여러 장을 선택하거나 마우스로 한꺼번에 드래그앤드롭하여 수십 장의 이미지를 동시에 일괄 변환할 수 있습니다." },
                { q: "업로드한 이미지가 외부 서버에 저장되거나 유출될 위험은 없나요?", a: "전혀 없습니다. desktools.run의 모든 이미지 변환 로직은 사용자의 컴퓨터 RAM 메모리 안에서만 동작하며 외부 서버로 파일이 업로드되지 않습니다." },
                { q: "투명 배경이 있는 PNG를 WebP로 변환해도 투명도가 유지되나요?", a: "네! WebP는 무손실 및 알파 채널 투명도를 기본 지원하므로 투명한 배경을 그대로 유지하면서 파일 용량을 크게 줄여줍니다." },
                { q: "스마트폰(아이폰/안드로이드)에서도 사용 가능한가요?", a: "네! 별도의 어플 설치 없이 모바일 웹 브라우저(Safari, Chrome)에서 완벽하게 작동합니다." },
                { q: "변환 가능한 최대 파일 크기나 하루 이용 횟수에 제한이 있나요?", a: "완전 100% 무료이며 이용 횟수 제한이나 워터마크가 전혀 없습니다. 기기의 메모리가 허용하는 한 대용량 파일도 무제한 변환 가능합니다." },
                { q: "JPG 변환 시 배경색이 검정색이나 흰색으로 채워지는 이유는 무엇인가요?", a: "JPG 표준 규격 자체에 투명도(Alpha)를 지원하지 않기 때문입니다. 컨트롤 바에서 원하는 배경색(흰색/검정)을 선택하실 수 있습니다." },
              ],
              relatedToolsTitle: "함께 쓰면 좋은 연관 도구",
              relatedTools: [
                { title: "이미지 리사이저 (Image Resizer)", desc: "이미지 해상도(픽셀/%)를 원하는 규격으로 자유롭게 조절합니다.", href: "/tools/image-resizer/" },
                { title: "이미지 압축기 (Image Compress)", desc: "해상도 변경 없이 손실/무손실 WebP 압축으로 파일 용량을 최대 80% 절감합니다.", href: "/tools/image-compress/" },
                { title: "배경 제거기 (Background Remover)", desc: "AI 신경망으로 이미지의 배경을 1초 만에 깔끔하게 투명화(누끼 따기)합니다.", href: "/tools/background-remover/" },
                { title: "워터마크 추가기 (Image Watermark)", desc: "사진에 저작권 보호용 텍스트 및 로고를 투명도와 함께 합성합니다.", href: "/tools/image-watermark/" },
              ],
            },
            ja: {
              aboutTitle: "ブラウザネイティブ多機能画像フォーマット一括変換ツール",
              aboutDesc: "HTML5 Canvas APIとクライアントサイドエンコーダーを活用し、PNG、JPG、WEBP、BMP、ICOなどの各種画像形式をサーバー送信なしで超高速に一括変換します。すべての処理がお使いのブラウザメモリ内で100%ローカルに完結するため、機密性の高い画像も安全に変換できます。",
              howTitle: "ステップ別のご利用手順",
              steps: [
                "変換したい画像をまとめてドラッグ＆ドロップまたはクリックして読み込みます（PNG、JPG、WebP、GIF、BMP、SVG等に対応）。",
                "上部のコントロールバーから出力フォーマット（WEBP / PNG / JPG / BMP / ICO）を選択します。",
                "JPGやWEBPの場合は圧縮品質（10%〜100%）を設定し、JPG変換時は背景色（白/黒）を指定します。",
                "リスト内で変換結果のプレビューと削減されたファイルサイズをリアルタイムで確認します。",
                "「個別ダウンロード」または「全ファイル一括ダウンロード」ボタンをクリックして保存します。",
              ],
              featuresTitle: "画像変換ツールの主な特徴",
              features: [
                { title: "複数ファイルの一括高速変換（Batch Processing）", desc: "大量の画像ファイルを同時に読み込み、待ち時間なしで瞬時にフォーマット変換します。" },
                { title: "次世代WebP＆高効率圧縮（VP8）", desc: "Google開発の高圧縮WebPに対応し、画質を保ちながらファイル容量を大幅に軽量化します。" },
                { title: "ファビコン（ICO）＆可逆PNG透過維持", desc: "Webサイト用Favicon.icoの自動生成および透過背景を完全保持するPNG出力をサポートします。" },
                { title: "完全ローカル・安心プライバシー（Zero Server Upload）", desc: "画像データが外部サーバーへ送信されることはなく、端末内部で安全に処理されます。" },
              ],
              useCasesTitle: "実務での活用シーン",
              useCases: [
                { icon: "🌐", title: "Web高速化のためのPNG/JPG ➔ WebP一括変換", desc: "重い画像を次世代フォーマットWebPに一括変換し、Webページの表示速度とSEOを向上させます。" },
                { icon: "📱", title: "Webサイト用ファビコン（Favicon.ico）作成", desc: "ロゴ画像をブラウザタブに表示される標準的なFavicon.ico形式に素早く変換します。" },
                { icon: "📧", title: "JPG必須の申請書類・公的機関システム対応", desc: "PNGやWebPしか持っていない場合でも、提出先で要求されるJPG形式に即座に変換可能です。" },
                { icon: "🎨", title: "デザイン素材の透過PNG抽出", desc: "透過非対応のBMPやJPGを高品質なPNG形式に変換し、グラフィック編集作業に活用します。" },
              ],
              proTipsTitle: "専門家による画像変換＆軽量化のヒント",
              proTips: [
                "Webサイト用には「WEBP」フォーマットが最も推奨されます。JPEG比で最大35%軽量化され、表示速度が向上します。",
                "透過背景のあるロゴは、JPGに変換すると透過部分が背景色で塗りつぶされます。透明度を保持したい場合はPNGまたはWEBPを選択してください。",
                "品質スライダーを85%〜90%に設定すると、肉眼では画質劣化を感じさせずにファイルサイズを大幅に削減できます。",
                "ファビコン（ICO）変換時は正方形（最大256x256）に自動調整され、ブラウザタブで最も鮮明に表示されます。",
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "一度に複数の画像を同時に変換できますか？", a: "はい！ドラッグ＆ドロップまたは複数選択で、何十枚もの画像を同時に一括変換できます。" },
                { q: "アップロードした画像がサーバーに流出する心配はありませんか？", a: "一切ありません。すべての処理はお使いの端末のブラウザメモリ内でのみ実行され、外部通信は行われません。" },
                { q: "透過PNGをWebPに変換しても透明度は保持されますか？", a: "はい！WebPはアルファチャンネル（透過度）をサポートしているため、透明な背景を維持したまま大幅に軽量化できます。" },
                { q: "スマートフォン（iPhone/Android）でも使えますか？", a: "はい！アプリのインストール不要で、スマホのブラウザ（Safari、Chrome）から快適にご利用いただけます。" },
                { q: "利用料金や1日の変換回数制限はありますか？", a: "完全無料・無制限です。会員登録や透かし（ウォーターマーク）の追加なども一切ありません。" },
                { q: "JPG変換時に背景色が必要なのはなぜですか？", a: "JPG規格自体が透過背景をサポートしていないためです。白または黒の背景色を選択できます。" },
              ],
              relatedToolsTitle: "関連する便利なツール",
              relatedTools: [
                { title: "画像リサイザー (Image Resizer)", desc: "画像の解像度（px/%）を劣化なしで自由に変更・調整します。", href: "/tools/image-resizer/" },
                { title: "画像圧縮 (Image Compress)", desc: "解像度を維持したままWebP圧縮でファイルサイズを最大80%軽量化します。", href: "/tools/image-compress/" },
                { title: "背景削除 (Background Remover)", desc: "AIニューラルネットワークで画像の背景を瞬時に透過（切り抜き）します。", href: "/tools/background-remover/" },
                { title: "ウォーターマーク追加 (Image Watermark)", desc: "写真に著作権保護用のテキストやロゴ透かしを合成します。", href: "/tools/image-watermark/" },
              ],
            },
            es: {
              aboutTitle: "Conversor de formatos de imagen por lotes nativo del navegador",
              aboutDesc: "Convierte imágenes entre PNG, JPG, WEBP, BMP e ICO al instante y por lotes utilizando la API HTML5 Canvas. Sin subidas a servidores: todo el procesamiento se realiza al 100% en la memoria de tu navegador, garantizando máxima velocidad y total privacidad de tus archivos.",
              howTitle: "Guía de uso paso a paso",
              steps: [
                "Arrastra y suelta o selecciona múltiples imágenes a la vez (compatible con PNG, JPG, WEBP, GIF, BMP, SVG).",
                "Elige el formato de destino deseado (WEBP / PNG / JPG / BMP / ICO) en la barra superior.",
                "Ajusta el control deslizante de calidad (10%~100%) y el color de fondo para JPG si es necesario.",
                "Revisa la vista previa convertida en tiempo real y la reducción de tamaño de cada archivo.",
                "Haz clic en 'Descargar' de forma individual o en 'Descargar todo' para guardar tus archivos convertidos.",
              ],
              featuresTitle: "Características principales",
              features: [
                { title: "Conversión masiva por lotes (Batch Processing)", desc: "Procesa decenas de imágenes en simultáneo de forma ultrarrápida sin esperas de servidor." },
                { title: "WebP de última generación y compresión ultraeficiente", desc: "Aprovecha el formato WebP de Google para reducir el peso de tus fotos hasta un 80% manteniendo nitidez." },
                { title: "Generador de Favicon (ICO) y PNG transparente", desc: "Crea iconos Favicon.ico para tu sitio web y preserva la transparencia alfa con PNG." },
                { title: "Privacidad 100% local (Sin subidas al servidor)", desc: "Tus fotos nunca salen de tu ordenador, asegurando máxima confidencialidad." },
              ],
              useCasesTitle: "Casos prácticos de uso",
              useCases: [
                { icon: "🌐", title: "Optimización web mediante conversión masiva a WebP", desc: "Transforma archivos PNG y JPG pesados en WebP ligero para acelerar tu web y mejorar el SEO." },
                { icon: "📱", title: "Creación de Favicon.ico para páginas web", desc: "Genera el archivo estándar Favicon.ico para pestañas de navegador a partir de cualquier imagen." },
                { icon: "📧", title: "Requisitos de formato JPG en plataformas y trámites", desc: "Convierte imágenes PNG o WebP a formato JPG estándar requerido por formularios oficiales." },
                { icon: "🎨", title: "Extracción y maquetación en PNG transparente", desc: "Convierte formatos sin transparencia como BMP a PNG de alta definición para diseño gráfico." },
              ],
              proTipsTitle: "Consejos profesionales de optimización",
              proTips: [
                "Para páginas web, te recomendamos el formato 'WEBP': hasta un 35% más ligero que JPG con la misma calidad.",
                "Para conservar la transparencia en logos o ilustraciones, exporta siempre a PNG o WEBP.",
                "Un nivel de calidad entre 85% y 90% ofrece el balance perfecto entre fidelidad visual y ligereza de archivo.",
                "Al convertir a ICO, la imagen se optimiza automáticamente a un formato cuadrado de hasta 256x256 px.",
              ],
              faqTitle: "Preguntas frecuentes (FAQ)",
              faqs: [
                { q: "¿Puedo convertir varias fotos al mismo tiempo?", a: "¡Sí! Puedes seleccionar o arrastrar decenas de imágenes para convertirlas en lote simultáneamente." },
                { q: "¿Mis imágenes se suben o guardan en algún servidor?", a: "No, en absoluto. Todo el proceso ocurre en la memoria RAM de tu navegador, garantizando privacidad total." },
                { q: "¿Se mantiene la transparencia al convertir PNG a WebP?", a: "¡Sí! WebP admite transparencia alfa, por lo que tus fondos transparentes se conservan intactos." },
                { q: "¿Funciona en móviles (iPhone y Android)?", a: "Sí, funciona de forma fluida y táctil en cualquier navegador móvil sin instalar aplicaciones." },
                { q: "¿Tiene algún coste o límite diario de conversiones?", a: "Es 100% gratuito e ilimitado. Sin marcas de agua, sin registros y sin tarifas ocultas." },
                { q: "¿Por qué el formato JPG requiere un color de fondo?", a: "El estándar JPG no soporta transparencias. Por ello, puedes elegir rellenar el fondo con blanco o negro." },
              ],
              relatedToolsTitle: "Herramientas relacionadas",
              relatedTools: [
                { title: "Redimensionador de imágenes (Image Resizer)", desc: "Ajusta las dimensiones en píxeles o porcentaje sin perder nitidez.", href: "/tools/image-resizer/" },
                { title: "Compresor de imágenes (Image Compress)", desc: "Reduce el tamaño de tus archivos hasta un 80% con compresión WebP.", href: "/tools/image-compress/" },
                { title: "Eliminador de fondos (Background Remover)", desc: "Elimina fondos con inteligencia artificial 100% local.", href: "/tools/background-remover/" },
                { title: "Añadir marca de agua (Image Watermark)", desc: "Protege tus imágenes con marcas de agua y firmas personalizadas.", href: "/tools/image-watermark/" },
              ],
            },
            zh: {
              aboutTitle: "浏览器本地多格式图片批量极速转换器",
              aboutDesc: "基于 HTML5 Canvas API 与客户端二进制编码引擎，支持在 PNG、JPG、WEBP、BMP、ICO 等多种图像格式之间秒级批量互转。全流程 100% 在本地浏览器内存中运算，零文件上传云端服务器，全面守护您的商业设计资产与个人隐私安全。",
              howTitle: "分步操作指南",
              steps: [
                "批量拖拽或点击选择多张需要转换的图片（支持 PNG、JPG、WEBP、GIF、BMP、SVG 等格式）。",
                "在顶部控制栏中选择目标输出格式（WEBP / PNG / JPG / BMP / ICO）。",
                "若选择 JPG 或 WEBP 格式，可通过滑块调节压缩质量（10%~100%），转换 JPG 时可指定填充背景色（白色/黑色）。",
                "在下方列表中实时查看转换后预览图及体积缩减百分比对比。",
                "点击“单张下载”或“全部下载”按钮，即可将转换后的成品文件瞬间保存至本地。",
              ],
              featuresTitle: "核心工程技术特性",
              features: [
                { title: "多图批量极速处理 (Batch Processing)", desc: "支持一次性导入数十张高清大图，无排队延迟并发完成格式转换。" },
                { title: "新一代 WebP 高效压缩 (VP8 引擎)", desc: "原生支持 Google WebP 压缩标准，在保证画质的同时大幅降低 30%~80% 文件体积。" },
                { title: "网站图标 (ICO) 生成与 PNG 透明通道保留", desc: "一键生成标准 Favicon.ico 网站图标，并完美保留 PNG 透明 Alpha 通道。" },
                { title: "100% 浏览器本地安全沙箱 (零服务器上传)", desc: "照片数据绝不离开发生运算的设备，彻底杜绝云端泄露隐患。" },
              ],
              useCasesTitle: "实战应用推荐场景",
              useCases: [
                { icon: "🌐", title: "网站与博客性能优化（PNG/JPG 转 WebP）", desc: "将大体积 PNG 和 JPG 批量转为超轻量 WebP，显著提升网页加载速度与 SEO 排名。" },
                { icon: "📱", title: "网站 Favicon.ico 标签页图标快速制作", desc: "将任意 PNG 设计图或 Logo 转换为网页浏览器标签页专用的 Favicon.ico 图标。" },
                { icon: "📧", title: "政务系统与招聘平台强制 JPG 格式转换", desc: "在各类报名及求职网站限制仅允许上传 JPG 时，秒级将 PNG 或 WebP 转换为合规 JPG。" },
                { icon: "🎨", title: "设计素材提取与无损透明 PNG 处理", desc: "将不支持透明的 BMP 或 JPG 转换为高质量 PNG，方便在 Photoshop 或 Figma 中二次设计。" },
              ],
              proTipsTitle: "专家图片转换与优化技巧",
              proTips: [
                "用于现代网页时强烈推荐导出为 'WEBP' 格式，比传统 JPEG 体积减小达 35%，加载速度飞跃提升。",
                "包含透明背景的 Logo 请勿直接转为 JPG，因为 JPG 不支持透明通道；保留透明度请选用 PNG 或 WEBP。",
                "将压缩质量设置在 85%~90% 区间，能够在肉眼无感画质差异的前提下将文件体积压缩一半以上。",
                "转换为 Favicon (ICO) 格式时系统会自动适配为 256x256 以内的标准正方形图标以确保清晰显示。",
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "可以一次性批量转换多张图片吗？", a: "可以！您可以在文件选择框中多选，或直接将数十张图片批量拖拽到页面中同时进行转换。" },
                { q: "上传的照片会被上传或保存在服务器上吗？", a: "绝无可能。desktools.run 的所有图片转换运算全部在您本地电脑的内存中完成，零网络数据传输。" },
                { q: "把带透明背景的 PNG 转为 WebP 会丢失透明度吗？", a: "不会！WebP 格式完美支持透明 Alpha 通道，能够完整保留透明背景并实现更高压缩率。" },
                { q: "手机端（iPhone/安卓）浏览器可以直接使用吗？", a: "可以！完全支持移动端 Safari 和 Chrome 浏览器，界面支持触控操作，无需安装任何 App。" },
                { q: "完全免费吗？每天有转换数量限制吗？", a: "100% 永久免费，无任何每日次数上限，不添加任何强制水印，无需注册登录。" },
                { q: "为什么转成 JPG 格式时需要选择背景颜色？", a: "因为 JPG 图像标准本身不支持透明图层。您可以在控制栏选择将透明部分填充为白色或黑色。" },
              ],
              relatedToolsTitle: "推荐相关实用工具",
              relatedTools: [
                { title: "图片尺寸调整 (Image Resizer)", desc: "按像素或百分比无损调整图片分辨率与尺寸规格。", href: "/tools/image-resizer/" },
                { title: "图片压缩器 (Image Compress)", desc: "不改变尺寸，通过 WebP 高效算法无损压缩图片体积高达 80%。", href: "/tools/image-compress/" },
                { title: "智能背景消除 (Background Remover)", desc: "内置本地 AI 神经网络模型，一键智能抠图并透明化背景。", href: "/tools/background-remover/" },
                { title: "图片添加水印 (Image Watermark)", desc: "自由添加版权文字及 Logo 水印，支持透明度与旋转调节。", href: "/tools/image-watermark/" },
              ],
            },
            fr: {
              aboutTitle: "Convertisseur de formats d'image par lots natif dans le navigateur",
              aboutDesc: "Convertissez instantanément vos images par lots entre PNG, JPG, WEBP, BMP et ICO grâce à l'API HTML5 Canvas. Tout s'exécute à 100% dans la mémoire vive de votre navigateur, assurant une vitesse maximale et une confidentialité absolue sans transfert de fichiers vers des serveurs.",
              howTitle: "Guide d'utilisation étape par étape",
              steps: [
                "Glissez-déposez ou sélectionnez plusieurs images en une seule fois (compatible PNG, JPG, WEBP, GIF, BMP, SVG).",
                "Choisissez le format de sortie cible (WEBP / PNG / JPG / BMP / ICO) dans la barre d'outils supérieure.",
                "Pour les formats JPG et WEBP, réglez le curseur de qualité (10%~100%) et la couleur d'arrière-plan souhaitée.",
                "Vérifiez l'aperçu du résultat en temps réel et la réduction de poids de chaque fichier.",
                "Cliquez sur 'Télécharger' individuellement ou sur 'Tout télécharger' pour enregistrer vos fichiers convertis.",
              ],
              featuresTitle: "Fonctionnalités clés de conversion",
              features: [
                { title: "Traitement par lots ultra-rapide (Batch Processing)", desc: "Convertissez des dizaines d'images simultanément sans file d'attente ni latence serveur." },
                { title: "WebP nouvelle génération & compression optimale", desc: "Exploitez le format WebP pour réduire le poids de vos fichiers jusqu'à 80% sans perte de clarté." },
                { title: "Création de Favicon (ICO) & conservation de transparence PNG", desc: "Générez des icônes Favicon.ico pour sites web et préservez la transparence avec le format PNG." },
                { title: "Confidentialité 100% locale (Zéro upload sur serveur)", desc: "Vos photos ne quittent jamais votre appareil, assurant une sécurité totale de vos données." },
              ],
              useCasesTitle: "Cas d'utilisation pratiques",
              useCases: [
                { icon: "🌐", title: "Optimisation de sites web via conversion par lots vers WebP", desc: "Transformez vos fichiers lourds PNG/JPG en WebP ultra-léger pour accélérer le chargement web et booster le SEO." },
                { icon: "📱", title: "Création d'icônes de site web Favicon.ico", desc: "Convertissez n'importe quel logo en fichier standard Favicon.ico pour les onglets de navigateur." },
                { icon: "📧", title: "Formats JPG exigés pour les démarches et candidatures", desc: "Convertissez facilement vos fichiers PNG ou WebP en JPG standard requis par les formulaires administratifs." },
                { icon: "🎨", title: "Extraction et retouche de visuels en PNG transparent", desc: "Convertissez des images sans transparence comme le BMP vers le PNG haute qualité pour vos créations graphiques." },
              ],
              proTipsTitle: "Conseils d'experts pour la conversion d'images",
              proTips: [
                "Pour les pages web, nous recommandons vivement le format 'WEBP' : jusqu'à 35% plus léger que le JPG avec une netteté remarquable.",
                "Pour conserver la transparence d'un logo, n'exportez pas en JPG (qui ne gère pas la transparence) ; choisissez PNG ou WEBP.",
                "Une qualité réglée entre 85% et 90% offre le meilleur compromis entre fidélité visuelle et réduction drastique du poids de fichier.",
                "Lors de la conversion vers ICO, l'image est automatiquement optimisée au format carré pour un affichage parfait dans les onglets.",
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Puis-je convertir plusieurs images en même temps ?", a: "Oui ! Vous pouvez glisser-déposer ou sélectionner des dizaines d'images pour les convertir toutes en un seul clic." },
                { q: "Mes photos sont-elles envoyées ou stockées sur un serveur ?", a: "Absolument pas. Tout le processus s'exécute dans la mémoire vive de votre navigateur sans aucun transfert réseau." },
                { q: "La transparence est-elle conservée lors de la conversion de PNG en WebP ?", a: "Oui ! Le format WebP prend parfaitement en charge le canal alpha de transparence." },
                { q: "L'outil est-il compatible sur mobile (iPhone et Android) ?", a: "Oui ! Il fonctionne parfaitement sur tous les navigateurs mobiles sans aucune application à installer." },
                { q: "Le service est-il totalement gratuit et sans limite ?", a: "100% gratuit et illimité. Aucun filigrane, aucune inscription et aucun frais caché." },
                { q: "Pourquoi le format JPG demande-t-il une couleur d'arrière-plan ?", a: "La norme JPG ne supporte pas la transparence. Vous pouvez donc choisir de remplir le fond avec du blanc ou du noir." },
              ],
              relatedToolsTitle: "Outils recommandés",
              relatedTools: [
                { title: "Redimensionneur d'images (Image Resizer)", desc: "Ajustez les dimensions en pixels ou en pourcentage sans perte de qualité.", href: "/tools/image-resizer/" },
                { title: "Compresseur d'images (Image Compress)", desc: "Réduisez la taille de vos fichiers jusqu'à 80% grâce à la compression WebP.", href: "/tools/image-compress/" },
                { title: "Suppression d'arrière-plan (Background Remover)", desc: "Détourez vos images instantanément grâce à l'intelligence artificielle locale.", href: "/tools/background-remover/" },
                { title: "Ajout de filigrane (Image Watermark)", desc: "Appliquez des filigranes textuels ou logos avec contrôle de transparence.", href: "/tools/image-watermark/" },
              ],
            },
            en: {
              aboutTitle: "Browser-Native High-Performance Batch Image Format Converter",
              aboutDesc: "Instantly batch convert between PNG, JPG, WEBP, BMP, and ICO formats right in your browser using HTML5 Canvas APIs. Zero server uploads: all operations execute 100% inside your local client memory, ensuring absolute data privacy and blazing conversion speeds.",
              howTitle: "Step-by-Step Usage Guide",
              steps: [
                "Drag and drop or select multiple image files at once (supports PNG, JPG, WEBP, GIF, BMP, SVG).",
                "Choose your desired target format (WEBP / PNG / JPG / BMP / ICO) on the top control bar.",
                "Adjust compression quality (10%~100%) for JPG/WEBP and specify background fill color for JPG conversions.",
                "Inspect the real-time converted previews and file size savings comparison for each image.",
                "Click 'Download' individually or 'Download All' to save your converted assets instantly to your device.",
              ],
              featuresTitle: "Key Engineering Features",
              features: [
                { title: "High-Speed Batch Processing", desc: "Convert dozens of high-resolution images simultaneously without cloud queue latencies." },
                { title: "Next-Gen WebP & Ultra-Efficient Compression", desc: "Leverage Google's WebP codec to shrink image file sizes up to 80% while retaining sharp fidelity." },
                { title: "Favicon (ICO) Generator & Lossless PNG Transparency", desc: "Export standardized browser tab Favicon.ico icons and preserve full alpha channel transparency in PNG." },
                { title: "100% Client-Side Privacy Sandbox (Zero Upload)", desc: "Zero file bytes leave your local device, guaranteeing enterprise-grade confidentiality." },
              ],
              useCasesTitle: "Real-World Practical Use Cases",
              useCases: [
                { icon: "🌐", title: "Web Performance Optimization via Batch WebP Conversion", desc: "Batch transform heavy PNG and JPG photos to lightweight WebP for lightning-fast page loading and SEO." },
                { icon: "📱", title: "Website Favicon.ico Icon Creation", desc: "Quickly convert any PNG logo into a standardized Favicon.ico file for browser tabs." },
                { icon: "📧", title: "Strict JPG Requirements for Forms & Portals", desc: "Instantly convert PNG or WebP screenshots to compliant JPG formats required by official portals." },
                { icon: "🎨", title: "Graphic Asset Prep & Transparent PNG Extraction", desc: "Convert non-transparent formats like BMP to lossless PNG for creative workflows." },
              ],
              proTipsTitle: "Pro Optimization & Conversion Tips",
              proTips: [
                "For web publishing, choose 'WEBP': it delivers up to 35% higher compression than JPEG at identical visual quality.",
                "Do not convert transparent logos to JPG if you need transparency, as JPG does not support alpha channels; use PNG or WEBP instead.",
                "Setting the quality slider between 85% and 90% achieves the optimal balance between visual sharpness and lightweight file size.",
                "When converting to ICO, the converter automatically resizes and formats assets into square dimensions up to 256x256 px.",
              ],
              faqTitle: "Frequently Asked Questions (FAQ)",
              faqs: [
                { q: "Can I convert multiple images at the same time?", a: "Yes! You can drag and drop or multi-select dozens of images to batch convert them concurrently." },
                { q: "Are my uploaded photos sent or stored on any server?", a: "Zero server storage. Everything runs inside your device's browser memory (Client-Side). Zero bytes are transmitted." },
                { q: "Does converting transparent PNG to WebP preserve transparency?", a: "Yes! WebP natively supports alpha transparency, retaining clean transparent backgrounds with smaller file sizes." },
                { q: "Can I use this converter on mobile phones (iOS / Android)?", a: "Yes! Fully responsive and touch-optimized across mobile browsers without requiring app installations." },
                { q: "Is it completely free with no usage limits?", a: "100% free and unlimited. No accounts, no paywalls, and no automated watermarks applied." },
                { q: "Why does JPG conversion require a background color?", a: "The JPG image specification does not support transparency. You can select white or black to fill transparent areas cleanly." },
              ],
              relatedToolsTitle: "Related Utilities",
              relatedTools: [
                { title: "Image Resizer", desc: "Resize image dimensions (pixels/percentage) while preserving quality.", href: "/tools/image-resizer/" },
                { title: "Image Compressor", desc: "Shrink image file size up to 80% without losing visual clarity.", href: "/tools/image-compress/" },
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

