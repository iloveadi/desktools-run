"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import {
  Upload,
  Download,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  MapPin,
  Camera,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  Info
} from "lucide-react";

interface ExifData {
  make?: string;
  model?: string;
  software?: string;
  dateTimeOriginal?: string;
  dateTime?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  focalLength?: string;
  gpsLat?: number;
  gpsLng?: number;
  gpsAlt?: number;
  width?: number;
  height?: number;
  rawTags: Record<string, string>;
}

export default function ExifRemoverPage() {
  const { t, locale } = useLocale();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [exifInfo, setExifInfo] = useState<ExifData | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [cleanSuccess, setCleanSuccess] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [quality, setQuality] = useState<number>(0.92);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parse EXIF ArrayBuffer
  const parseExif = (buffer: ArrayBuffer): ExifData => {
    const view = new DataView(buffer);
    const result: ExifData = { rawTags: {} };

    if (view.byteLength < 12) return result;

    // Check JPEG SOI marker 0xFFD8
    if (view.getUint16(0) !== 0xffd8) return result;

    let offset = 2;
    while (offset < view.byteLength) {
      if (view.getUint16(offset) === 0xffe1) {
        // Found APP1 marker
        const app1Length = view.getUint16(offset + 2);
        const exifHeader = String.fromCharCode(
          view.getUint8(offset + 4),
          view.getUint8(offset + 5),
          view.getUint8(offset + 6),
          view.getUint8(offset + 7)
        );

        if (exifHeader === "Exif") {
          const tiffOffset = offset + 10;
          const littleEndian = view.getUint16(tiffOffset) === 0x4949;

          const get16 = (o: number) => view.getUint16(tiffOffset + o, littleEndian);
          const get32 = (o: number) => view.getUint32(tiffOffset + o, littleEndian);

          const firstIfdOffset = get32(4);
          if (firstIfdOffset) {
            readIfd(tiffOffset, firstIfdOffset, get16, get32, view, result, tiffOffset);
          }
        }
        break;
      }
      offset += 2 + view.getUint16(offset + 2);
    }

    return result;
  };

  const readIfd = (
    tiffStart: number,
    dirStart: number,
    get16: (o: number) => number,
    get32: (o: number) => number,
    view: DataView,
    result: ExifData,
    baseOffset: number
  ) => {
    try {
      const entries = get16(dirStart);
      let exifIfdOffset: number | null = null;
      let gpsIfdOffset: number | null = null;

      for (let i = 0; i < entries; i++) {
        const entryOffset = dirStart + 2 + i * 12;
        const tag = get16(entryOffset);
        const type = get16(entryOffset + 2);
        const count = get32(entryOffset + 4);
        const valueOffset = entryOffset + 8;

        const val = readTagValue(view, tiffStart, type, count, valueOffset, get16, get32);

        if (tag === 0x010f && typeof val === "string") result.make = val.trim();
        if (tag === 0x0110 && typeof val === "string") result.model = val.trim();
        if (tag === 0x0131 && typeof val === "string") result.software = val.trim();
        if (tag === 0x0132 && typeof val === "string") result.dateTime = val.trim();
        if (tag === 0x8769 && typeof val === "number") exifIfdOffset = val;
        if (tag === 0x8825 && typeof val === "number") gpsIfdOffset = val;
      }

      if (exifIfdOffset) {
        const subEntries = get16(exifIfdOffset);
        for (let i = 0; i < subEntries; i++) {
          const entryOffset = exifIfdOffset + 2 + i * 12;
          const tag = get16(entryOffset);
          const type = get16(entryOffset + 2);
          const count = get32(entryOffset + 4);
          const valueOffset = entryOffset + 8;
          const val = readTagValue(view, tiffStart, type, count, valueOffset, get16, get32);

          if (tag === 0x9003 && typeof val === "string") result.dateTimeOriginal = val.trim();
          if (tag === 0x829a && typeof val === "string") result.exposureTime = val;
          if (tag === 0x829d && typeof val === "string") result.fNumber = `f/${val}`;
          if (tag === 0x8827) result.iso = `ISO ${val}`;
          if (tag === 0x920a) result.focalLength = `${val}mm`;
        }
      }

      if (gpsIfdOffset) {
        const gpsEntries = get16(gpsIfdOffset);
        let latRef = "N";
        let lngRef = "E";
        let latDms: number[] | null = null;
        let lngDms: number[] | null = null;

        for (let i = 0; i < gpsEntries; i++) {
          const entryOffset = gpsIfdOffset + 2 + i * 12;
          const tag = get16(entryOffset);
          const type = get16(entryOffset + 2);
          const count = get32(entryOffset + 4);
          const valueOffset = entryOffset + 8;
          const val = readTagValue(view, tiffStart, type, count, valueOffset, get16, get32);

          if (tag === 0x0001 && typeof val === "string") latRef = val;
          if (tag === 0x0003 && typeof val === "string") lngRef = val;
          if (tag === 0x0002 && Array.isArray(val)) latDms = val.map(Number);
          if (tag === 0x0004 && Array.isArray(val)) lngDms = val.map(Number);
          if (tag === 0x0006 && typeof val === "number") result.gpsAlt = Math.round(val);
        }

        if (latDms && latDms.length >= 3) {
          let lat = latDms[0] + latDms[1] / 60 + latDms[2] / 3600;
          if (latRef === "S") lat = -lat;
          result.gpsLat = Number(lat.toFixed(6));
        }

        if (lngDms && lngDms.length >= 3) {
          let lng = lngDms[0] + lngDms[1] / 60 + lngDms[2] / 3600;
          if (lngRef === "W") lng = -lng;
          result.gpsLng = Number(lng.toFixed(6));
        }
      }
    } catch (e) {
      console.warn("EXIF read warning:", e);
    }
  };

  const readTagValue = (
    view: DataView,
    tiffStart: number,
    type: number,
    count: number,
    valueOffset: number,
    get16: (o: number) => number,
    get32: (o: number) => number
  ): any => {
    // 2 = ASCII, 3 = SHORT, 4 = LONG, 5 = RATIONAL
    if (type === 2) {
      const dataOffset = count > 4 ? get32(valueOffset) : valueOffset;
      let str = "";
      for (let i = 0; i < count - 1; i++) {
        str += String.fromCharCode(view.getUint8(tiffStart + dataOffset + i));
      }
      return str;
    }

    if (type === 3) return get16(valueOffset);
    if (type === 4) return get32(valueOffset);

    if (type === 5) {
      const dataOffset = get32(valueOffset);
      if (count === 1) {
        const num = get32(dataOffset);
        const den = get32(dataOffset + 4);
        return den ? Number((num / den).toFixed(2)) : num;
      } else {
        const arr = [];
        for (let i = 0; i < count; i++) {
          const num = get32(dataOffset + i * 8);
          const den = get32(dataOffset + i * 8 + 4);
          arr.push(den ? num / den : num);
        }
        return arr;
      }
    }

    return null;
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsInspecting(true);
    setCleanSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      const parsed = parseExif(buffer);

      const img = new Image();
      img.onload = () => {
        parsed.width = img.naturalWidth;
        parsed.height = img.naturalHeight;
        setExifInfo(parsed);
        setIsInspecting(false);
      };
      const blob = new Blob([buffer], { type: file.type });
      img.src = URL.createObjectURL(blob);
      setImageSrc(img.src);
    };
    reader.readAsArrayBuffer(file);
  };

  // Check if image contains any EXIF fields
  const hasExifData = Boolean(
    exifInfo &&
      (exifInfo.make ||
        exifInfo.model ||
        exifInfo.gpsLat ||
        exifInfo.dateTimeOriginal ||
        exifInfo.dateTime ||
        exifInfo.exposureTime ||
        exifInfo.software)
  );

  // Strip EXIF via Canvas redraw
  const handleStripAndDownload = () => {
    if (!imageSrc || !imageFile) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Redraw pristine pixels onto fresh canvas (strips all EXIF headers)
      ctx.drawImage(img, 0, 0);

      const mime = exportFormat === "png" ? "image/png" : exportFormat === "webp" ? "image/webp" : "image/jpeg";
      const dataUrl = canvas.toDataURL(mime, quality);

      const baseName = imageFile.name.substring(0, imageFile.name.lastIndexOf(".")) || "photo";
      const downloadName = `${baseName}_no_exif.${exportFormat}`;

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = downloadName;
      a.click();

      setCleanSuccess(true);
    };
    img.src = imageSrc;
  };

  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Header Title Section */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 20px" }}>
          <Link
            href="/#tools"
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
            {t("exifRemover.back")}
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f87171",
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                {t("exifRemover.title")}
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                {t("exifRemover.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Main Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {!imageSrc ? (
            /* Dropzone */
            <div
              className="glass-card"
              style={{
                padding: "60px 24px",
                textAlign: "center",
                border: "2px dashed var(--border-subtle)",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.02)",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/tiff"
                onChange={handleFileUpload}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                  width: "100%",
                  height: "100%",
                }}
              />
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "rgba(239, 68, 68, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "#f87171",
                }}
              >
                <Upload size={32} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                {t("exifRemover.dropTitle")}
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 20px" }}>
                {t("exifRemover.dropDesc")}
              </p>
              <button
                className="btn-primary"
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  pointerEvents: "none",
                }}
              >
                <ImageIcon size={18} />
                {t("exifRemover.selectFile")}
              </button>
            </div>
          ) : (
            /* Result Layout: Image & EXIF Inspection Cards */
            <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: "24px" }}>
              {/* Left: Image Card & Action controls */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="glass-card" style={{ padding: "18px" }}>
                  <div style={{ position: "relative", width: "100%", borderRadius: "10px", overflow: "hidden", marginBottom: "14px", background: "#000" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt="Uploaded preview"
                      style={{ width: "100%", height: "auto", maxHeight: "320px", objectFit: "contain", display: "block" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {imageFile?.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {exifInfo?.width} × {exifInfo?.height} px · {((imageFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>

                    <label
                      className="btn-secondary"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Upload size={13} />
                      {t("imageWatermark.change")}
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                  </div>

                  {/* Status Banner */}
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: hasExifData ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                      border: hasExifData ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    {hasExifData ? (
                      <ShieldAlert size={20} color="#f87171" style={{ flexShrink: 0 }} />
                    ) : (
                      <ShieldCheck size={20} color="#34d399" style={{ flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: hasExifData ? "#f87171" : "#34d399" }}>
                        {hasExifData ? t("exifRemover.hasExif") : t("exifRemover.noExif")}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "1px" }}>
                        {hasExifData
                          ? t("exifRemover.hasExifDesc")
                          : t("exifRemover.noExifDesc")}
                      </div>
                    </div>
                  </div>

                  {/* Export Format Controls */}
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", display: "block" }}>
                      {t("exifRemover.exportQuality")}
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "10px" }}>
                      {(["jpeg", "png", "webp"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            background: exportFormat === fmt ? "linear-gradient(135deg, #ef4444, #dc2626)" : "rgba(255,255,255,0.04)",
                            border: exportFormat === fmt ? "none" : "1px solid var(--border-subtle)",
                            color: exportFormat === fmt ? "white" : "var(--text-secondary)",
                            fontSize: "12px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            cursor: "pointer",
                          }}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clean Download Button */}
                  <button
                    onClick={handleStripAndDownload}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                    }}
                  >
                    <Trash2 size={16} />
                    {t("exifRemover.stripAll")}
                  </button>

                  {cleanSuccess && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "12.5px", fontWeight: 600, marginTop: "10px", justifyContent: "center" }}>
                      <CheckCircle2 size={15} />
                      {t("exifRemover.cleanSuccess")}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Detailed EXIF Inspection Panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* GPS Location Box */}
                {exifInfo?.gpsLat && exifInfo?.gpsLng && (
                  <div className="glass-card" style={{ padding: "20px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171" }}>
                        <MapPin size={18} />
                        <span style={{ fontSize: "15px", fontWeight: 700 }}>
                          {t("exifRemover.gpsLocation")}
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${exifInfo.gpsLat},${exifInfo.gpsLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#f87171",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "rgba(239,68,68,0.15)",
                          padding: "4px 10px",
                          borderRadius: "6px",
                        }}
                      >
                        {t("exifRemover.viewMap")}
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px" }}>
                      <div>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.latitude")}</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>
                          {exifInfo.gpsLat}°
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.longitude")}</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>
                          {exifInfo.gpsLng}°
                        </div>
                      </div>
                      {exifInfo.gpsAlt !== undefined && (
                        <div>
                          <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.altitude")}</div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>
                            {exifInfo.gpsAlt}m
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Camera & Settings Box */}
                <div className="glass-card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#818cf8", marginBottom: "14px" }}>
                    <Camera size={18} />
                    <span style={{ fontSize: "15px", fontWeight: 700 }}>
                      {t("exifRemover.cameraInfo")}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", padding: "10px 12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.make")}</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {exifInfo?.make || t("exifRemover.notIncluded")}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", padding: "10px 12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.model")}</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {exifInfo?.model || t("exifRemover.notIncluded")}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", padding: "10px 12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.shutterSpeed")}</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {exifInfo?.exposureTime || t("exifRemover.notIncluded")}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", padding: "10px 12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.aperture")}</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {exifInfo?.fNumber || t("exifRemover.notIncluded")}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", padding: "10px 12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.iso")}</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {exifInfo?.iso || t("exifRemover.notIncluded")}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", padding: "10px 12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.focalLength")}</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {exifInfo?.focalLength || t("exifRemover.notIncluded")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date & Additional Details Box */}
                <div className="glass-card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#34d399", marginBottom: "14px" }}>
                    <Calendar size={18} />
                    <span style={{ fontSize: "15px", fontWeight: 700 }}>
                      {t("exifRemover.captureDate")}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", padding: "10px 12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.captureDate")}</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {exifInfo?.dateTimeOriginal || exifInfo?.dateTime || t("exifRemover.notIncluded")}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", padding: "10px 12px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{t("exifRemover.software")}</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {exifInfo?.software || t("exifRemover.notIncluded")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guide Component (Full 6-Language Support) */}
          {(() => {
            const content = {
              ko: {
                aboutTitle: "브라우저 네이티브 이미지 EXIF 메타데이터 뷰어 & 제거기",
                aboutDesc: "스마트폰이나 디지털 카메라로 촬영한 사진 파일 내부 바이너리에 숨겨진 GPS 위도·경도 위치 좌표, 카메라 기기 모델, 렌즈 정보, 셔터스피드, 촬영 일시 등의 EXIF(Exchangeable Image File Format) 데이터를 브라우저에서 즉시 분석하고, 단 1클릭으로 모든 개인정보 메타데이터를 깨끗하게 소멸시켜 다운로드합니다. 모든 과정이 사용자의 브라우저 메모리 안에서 100% 로컬로 처리되어 데이터 유출 걱정이 없습니다.",
                howTitle: "단계별 EXIF 확인 및 삭제 방법",
                steps: [
                  "EXIF 정보를 확인하거나 제거할 사진을 드래그앤드롭하거나 파일 선택 창을 통해 업로드합니다 (JPG, JPEG, PNG, WEBP 지원).",
                  "사진에 포함된 GPS 위도/경도, 구글 지도 링크, 촬영 기기(카메라/스마트폰 모델), 촬영 일시를 상세히 확인합니다.",
                  "원하는 출력 포맷(JPEG / PNG / WEBP) 및 이미지 품질을 선택합니다.",
                  "'EXIF 완벽 삭제 & 다운로드' 버튼을 클릭합니다.",
                  "모든 위치 및 기기 식별 메타데이터가 100% 제거된 깨끗하고 안전한 이미지를 기기에 저장합니다.",
                ],
                featuresTitle: "EXIF 제거기 핵심 기술 기능",
                features: [
                  { title: "심층 바이너리 EXIF/GPS 데이터 디코더", desc: "사진의 바이너리 헤더를 정밀 파싱하여 GPS 좌표, 카메라 브랜드, 셔터 속도, ISO, 렌즈 스펙을 투명하게 시각화합니다." },
                  { title: "1클릭 완벽 개인정보 메타데이터 소멸 (Metadata Stripper)", desc: "캔버스 재인코딩 엔진을 통해 원본 사진의 화질 손상 없이 EXIF, XMP, IPTC 메타데이터 태그를 100% 영구 삭제합니다." },
                  { title: "다양한 포맷 & 품질 최적화 출력", desc: "JPEG, 무손실 PNG, 차세대 고효율 WebP 포맷 중 원하는 확장자로 메타데이터 없는 이미지를 즉시 변환 생성합니다." },
                  { title: "100% 로컬 프라이버시 샌드박스 (Zero Server Upload)", desc: "사진 파일과 민감한 GPS 위치 정보가 외부 서버로 절대 전송되지 않아 완벽한 익명성을 보장합니다." },
                ],
                useCasesTitle: "실무 추천 활용 시나리오",
                useCases: [
                  { icon: "🏠", title: "중고거래 & 커뮤니티 사진 업로드 시 집 위치 유출 방지", desc: "당근마켓, 중고나라, 온라인 커뮤니티에 집 내부 사진을 올릴 때 스마트폰이 기록한 집 주소 GPS 좌표를 안전하게 삭제합니다." },
                  { icon: "📱", title: "인스타그램 & 블로그 일상 사진 사생활 보호", desc: "자녀 사진이나 일상 기록 업로드 시 촬영 시간과 상세 위치 정보가 담긴 메타데이터를 사전에 차단합니다." },
                  { icon: "📄", title: "사내 보안 문서 및 비즈니스 사진 배포", desc: "공식 보도자료나 제품 사진에 포함된 촬영 장비 정보와 내부 작업 소프트웨어 정보를 깨끗이 제거합니다." },
                  { icon: "📷", title: "사진 작가 및 디자이너 EXIF 촬영 값 분석", desc: "촬영된 사진의 조리개값(F-Number), 셔터스피드, 초점거리(Focal Length)를 정밀 분석하여 촬영 노하우를 점검합니다." },
                ],
                proTipsTitle: "전문가 사진 개인정보 보호 노하우",
                proTips: [
                  "스마트폰 카메라로 집, 직장, 학교 주변에서 찍은 사진은 대부분 오차 범위 수 미터 이내의 정밀 GPS 좌표가 자동으로 저장됩니다.",
                  "온라인 게시판이나 SNS에 사진을 올리기 전 반드시 EXIF 제거기를 거쳐 다운로드하면 위치 추적을 100% 원천 차단할 수 있습니다.",
                  "무손실 품질을 원하시면 'PNG' 포맷을, 파일 용량까지 가볍게 줄이고 싶으시면 'WebP' 포맷을 선택하세요.",
                  "메타데이터가 성공적으로 제거되었는지 확인하려면 다운로드한 사진을 다시 이 도구에 올려보세요. GPS와 기기 정보가 완전히 사라진 것을 확인하실 수 있습니다.",
                ],
                faqTitle: "자주 묻는 질문 (FAQ)",
                faqs: [
                  { q: "EXIF 메타데이터란 무엇이며 왜 지워야 하나요?", a: "사진 촬영 시 카메라가 사진 파일 내부에 자동으로 기록하는 숨겨진 정보로, 특히 GPS 위도·경도 좌표는 집 주소나 현재 위치를 타인에게 그대로 노출시킬 수 있어 프라이버시 보호를 위해 삭제하는 것이 안전합니다." },
                  { q: "사진을 올렸을 때 내 위치 정보가 서버로 전송되나요?", a: "전혀 전송되지 않습니다! desktools.run의 모든 분석 및 메타데이터 제거 작업은 100% 사용자의 브라우저 메모리 안에서만 실행됩니다." },
                  { q: "EXIF를 삭제하면 사진의 해상도나 화질이 떨어지나요?", a: "아닙니다. 캔버스 1:1 픽셀 매핑 엔진을 사용하여 원본의 해상도와 화질을 손상 없이 그대로 유지하면서 순수 메타데이터만 제거합니다." },
                  { q: "모든 기기(아이폰, 갤럭시, DSLR 카메라)의 사진을 지원하나요?", a: "네! 아이폰(iOS), 갤럭시(안드로이드), 소니/캐논/니콘 DSLR 및 미러리스 등 모든 카메라에서 생성된 표준 EXIF를 완벽 지원합니다." },
                  { q: "스마트폰에서도 별도 앱 설치 없이 작동하나요?", a: "네! 모바일 Safari, Chrome 브라우저에서 바로 사진을 선택하여 위치 확인 및 제거가 가능합니다." },
                  { q: "이용 요금이나 횟수 제한이 있나요?", a: "완전 100% 무료이며 이용 횟수 제한이나 워터마크가 전혀 없습니다." },
                ],
                relatedToolsTitle: "함께 쓰면 좋은 연관 도구",
                relatedTools: [
                  { title: "이미지 워터마크 추가기 (Image Watermark)", desc: "사진에 저작권 보호용 텍스트 및 로고를 투명도와 함께 합성합니다.", href: "/tools/image-watermark/" },
                  { title: "이미지 용량 압축기 (Image Compress)", desc: "화질 손상 없이 이미지 용량을 최대 80% 줄여 웹 업로드를 최적화합니다.", href: "/tools/image-compress/" },
                  { title: "이미지 크기 조절 (Image Resizer)", desc: "이미지 해상도(픽셀/%)를 원하는 규격으로 자유롭게 변경합니다.", href: "/tools/image-resizer/" },
                  { title: "이미지 포맷 변환기 (Image Converter)", desc: "PNG, JPG, WEBP, BMP, ICO 포맷을 브라우저에서 상호 변환합니다.", href: "/tools/image-converter/" },
                ],
              },
              ja: {
                aboutTitle: "ブラウザネイティブ写真EXIF情報確認・完全消去ツール（プライバシー保護）",
                aboutDesc: "スマートフォンやデジカメで撮影された写真に含まれるGPS位置情報（緯度・経度）、カメラの機種名、撮影日時などのEXIF（Exchangeable Image File Format）メタデータをブラウザ内で瞬時に解析し、ワンクリックで個人情報を完全削除して出力します。すべての処理がお使いの端末内で100%ローカルに完結するため、位置情報の流出を防ぎます。",
                howTitle: "ステップ別のご利用手順",
                steps: [
                  "EXIF情報を確認または削除したい写真をドラッグ＆ドロップまたはクリックして選択します（JPG、PNG、WEBP対応）。",
                  "写真に埋め込まれたGPS位置情報（Googleマップリンク）、撮影カメラ機種、撮影日時を詳細に確認します。",
                  "出力フォーマット（JPEG / PNG / WEBP）と画像品質を設定します。",
                  "「EXIF完全消去＆ダウンロード」ボタンをクリックします。",
                  "位置情報や機器情報が完全に消去された安全な画像を保存します。",
                ],
                featuresTitle: "EXIF削除ツールの主な特徴",
                features: [
                  { title: "ディープEXIF/GPSバイナリ解析エンジン", desc: "写真のバイナリヘッダーを解析し、GPS座標や撮影機器、シャッタースピード、ISO、レンズ情報を可視化します。" },
                  { title: "ワンクリック個人情報メタデータ完全消去", desc: "Canvas再エンコードにより、画質を保ったままEXIF・XMP・IPTCメタデータを100%消去します。" },
                  { title: "多彩なフォーマット＆品質最適化出力", desc: "JPEG、可逆PNG、次世代高圧縮WebPから用途に合わせて安全な画像を出力可能。" },
                  { title: "完全ローカル・安心プライバシー（Zero Server Upload）", desc: "画像データや位置情報が外部サーバーへ送信されることはなく、端末内で安全に処理されます。" },
                ],
                useCasesTitle: "実務での活用シーン",
                useCases: [
                  { icon: "🏠", title: "フリマアプリ・オークション出品時の自宅特定防止", desc: "メルカリやヤフオクへの商品画像投稿時に、スマホ写真に記録された自宅のGPS位置情報を消去します。" },
                  { icon: "📱", title: "SNSやブログへの日常写真投稿時のプライバシー保護", desc: "子供の写真や日常のスナップから撮影日時や居場所が特定されるリスクを未然に防ぎます。" },
                  { icon: "📄", title: "社外向け資料・プレスリリース用画像のクリーン化", desc: "社外に配布する写真から撮影機材や制作環境のメタデータを削除して安全に公開します。" },
                  { icon: "📷", title: "カメラマン・写真愛好家の撮影設定値分析", desc: "撮影時の絞り値（F値）、シャッタースピード、焦点距離を詳細に確認してスキルアップに役立てます。" },
                ],
                proTipsTitle: "専門家による写真プライバシー保護のヒント",
                proTips: [
                  "スマホのカメラで撮影された写真には、数メートル精度のGPS位置情報が自動的に記録されています。",
                  "ネット上に画像を投稿する前にこのツールでEXIFを消去しておけば、自宅や職場を特定される心配がありません。",
                  "画質劣化ゼロを希望する場合は「PNG形式」、軽量化も同時に行いたい場合は「WebP形式」をお選びください。",
                  "削除後の安全性を確認するには、ダウンロードした写真をもう一度このツールに読み込ませてGPS情報が消えているかチェックできます。",
                ],
                faqTitle: "よくある質問 (FAQ)",
                faqs: [
                  { q: "EXIF情報とは何ですか？なぜ削除すべきなのですか？", a: "写真撮影時に自動記録されるメタデータで、特にGPS位置情報は自宅の住所や居場所が他人に特定される原因となるため、ネット投稿前に削除することが推奨されます。" },
                  { q: "写真を読み込んだ際、位置情報が外部サーバーへ送信されますか？", a: "一切送信されません！すべての解析・削除処理はお使いのブラウザメモリ内でのみ実行されます。" },
                  { q: "EXIFを削除すると写真の画質が劣化しますか？", a: "劣化しません。1:1ピクセルマッピングにより、元画像の解像度と鮮明さを維持したままメタデータのみを除去します。" },
                  { q: "iPhoneやAndroid、一眼レフカメラの写真に対応していますか？", a: "はい！主要なスマートフォンや各社デジタル一眼カメラ（Sony、Canon、Nikon等）のEXIF規格に完全対応しています。" },
                  { q: "スマートフォンでも使えますか？", a: "はい！アプリのインストール不要で、スマホのブラウザから直接ご利用いただけます。" },
                  { q: "利用料金や制限はありますか？", a: "完全無料・無制限です。会員登録も不要です。" },
                ],
                relatedToolsTitle: "関連する便利なツール",
                relatedTools: [
                  { title: "画像透かし追加 (Image Watermark)", desc: "写真に著作権保護用のテキストやロゴ透かしを合成します。", href: "/tools/image-watermark/" },
                  { title: "画像圧縮 (Image Compress)", desc: "EXIF削除後の画像を最大80%軽量化します。", href: "/tools/image-compress/" },
                  { title: "画像リサイザー (Image Resizer)", desc: "画像の解像度（px/%）を自由に変更・調整します。", href: "/tools/image-resizer/" },
                  { title: "画像フォーマット変換 (Image Converter)", desc: "画像をPNG、JPG、WEBP、ICO形式に変換します。", href: "/tools/image-converter/" },
                ],
              },
              es: {
                aboutTitle: "Visor y eliminador de metadatos EXIF y GPS de imágenes en el navegador",
                aboutDesc: "Inspecciona y elimina al instante las coordenadas de ubicación GPS, el modelo de cámara, la fecha de captura y todos los metadatos EXIF (Exchangeable Image File Format) ocultos en tus fotos con un solo clic. Todo el proceso ocurre al 100% en la memoria de tu navegador, garantizando máxima privacidad sin enviar tus datos a servidores externos.",
                howTitle: "Guía de uso paso a paso",
                steps: [
                  "Arrastra y suelta o selecciona la fotografía que deseas inspeccionar (compatible con JPG, JPEG, PNG, WEBP).",
                  "Examina los metadatos detectados: coordenadas GPS (con enlace a Google Maps), modelo de cámara y fecha.",
                  "Elige el formato de salida deseado (JPEG / PNG / WEBP) y la calidad de exportación.",
                  "Haz clic en 'Eliminar EXIF y Descargar'.",
                  "Guarda tu imagen 100% limpia y libre de datos personales sensibles.",
                ],
                featuresTitle: "Características principales de privacidad",
                features: [
                  { title: "Decodificador profundo de datos EXIF/GPS", desc: "Analiza la cabecera binaria para revelar coordenadas GPS exactas, óptica, apertura, ISO y fecha." },
                  { title: "Eliminación completa de metadatos en 1 clic", desc: "Limpia al 100% etiquetas EXIF, XMP e IPTC mediante renderizado limpio en Canvas sin pérdida visual." },
                  { title: "Exportación multiformato optimizada", desc: "Convierte tus fotos seguras a formatos JPEG, PNG transparente o el moderno WebP." },
                  { title: "Privacidad 100% local (Sin subidas a servidores)", desc: "Tus fotos y ubicación nunca salen de tu ordenador, asegurando total anonimato." },
                ],
                useCasesTitle: "Casos prácticos de uso",
                useCases: [
                  { icon: "🏠", title: "Ventas de segunda mano y plataformas de anuncios", desc: "Elimina la ubicación GPS de tu domicilio antes de publicar fotos en Wallapop o eBay." },
                  { icon: "📱", title: "Privacidad en redes sociales y blogs familiares", desc: "Evita el rastreo de ubicación y horarios al compartir fotos cotidianas o de menores en internet." },
                  { icon: "📄", title: "Publicación de fotografías corporativas y notas de prensa", desc: "Limpia la información sobre el equipo fotográfico y software interno antes de difundir imágenes." },
                  { icon: "📷", title: "Análisis de parámetros fotográficos", desc: "Consulta el tiempo de exposición, número f y distancia focal para estudiar tus tomas." },
                ],
                proTipsTitle: "Consejos profesionales de privacidad fotográfica",
                proTips: [
                  "Las fotos tomadas con teléfonos móviles suelen incluir coordenadas GPS con precisión de pocos metros.",
                  "Limpiar los metadatos antes de subir fotos a la red previene por completo la geolocalización no deseada.",
                  "Elige el formato 'PNG' para máxima fidelidad visual o 'WebP' para archivos ligeros de carga rápida.",
                  "Puedes verificar la eliminación volviendo a subir la imagen descargada a esta herramienta para comprobar que los datos GPS han desaparecido.",
                ],
                faqTitle: "Preguntas frecuentes (FAQ)",
                faqs: [
                  { q: "¿Qué son los datos EXIF y por qué eliminarlos?", a: "Son datos incrustados automáticamente al tomar fotos. La información GPS puede revelar tu domicilio a extraños, por lo que es vital borrarla antes de compartir." },
                  { q: "¿Mis fotos o ubicación se envían a algún servidor?", a: "¡No! Todo el análisis y la eliminación se realizan localmente en tu navegador sin conexión externa." },
                  { q: "¿Se pierde calidad de imagen al eliminar el EXIF?", a: "No, la resolución y los píxeles se conservan intactos; solo se purgan los bloques de metadatos." },
                  { q: "¿Es compatible con fotos de iPhone, Android y cámaras DSLR?", a: "Sí, es totalmente compatible con formatos EXIF estándar de smartphones y cámaras profesionales." },
                  { q: "¿Funciona en teléfonos móviles?", a: "Sí, funciona de forma fluida en cualquier navegador móvil sin instalar aplicaciones." },
                  { q: "¿Tiene algún coste o límite diario?", a: "Es 100% gratuito e ilimitado. Sin registros ni marcas de agua." },
                ],
                relatedToolsTitle: "Herramientas relacionadas",
                relatedTools: [
                  { title: "Añadir marca de agua (Image Watermark)", desc: "Protege tus fotos con marcas de agua y firmas personalizadas.", href: "/tools/image-watermark/" },
                  { title: "Compresor de imágenes (Image Compress)", desc: "Reduce el peso de tus imágenes limpias hasta un 80%.", href: "/tools/image-compress/" },
                  { title: "Redimensionador de imágenes (Image Resizer)", desc: "Ajusta las dimensiones en píxeles o porcentaje con precisión.", href: "/tools/image-resizer/" },
                  { title: "Conversor de imágenes (Image Converter)", desc: "Convierte tus fotos a formatos PNG, JPG, WEBP o ICO.", href: "/tools/image-converter/" },
                ],
              },
              zh: {
                aboutTitle: "浏览器本地照片 EXIF 元数据查看与一键消除器 (隐私防护)",
                aboutDesc: "深度解析数码相机与智能手机拍摄照片中的二进制隐藏数据，包括 GPS 经纬度地理坐标、相机设备型号、镜头光圈、拍摄时间等 EXIF (Exchangeable Image File Format) 元数据，并支持 1 键彻底抹除所有敏感隐私后下载。全套算法 100% 在本地浏览器内存中计算，照片与定位零上传云端，全面杜绝住址与轨迹泄露。",
                howTitle: "分步操作指南",
                steps: [
                  "拖拽或点击上传需要查看或清除 EXIF 信息的照片（支持 JPG、JPEG、PNG、WEBP 格式）。",
                  "在面板中详细查看照片中暗藏的 GPS 定位坐标（可点击 Google 地图链接查看）、拍摄设备与精确时间。",
                  "选择期望的导出格式（JPEG / PNG / WEBP）及画面质量等级。",
                  "点击“完全消除 EXIF 并下载”按钮。",
                  "瞬间将 100% 剥离了地理位置与设备指纹的纯净安全图片保存至本地。",
                ],
                featuresTitle: "核心技术与工程特性",
                features: [
                  { title: "深度二进制 EXIF/GPS 元数据解析引擎", desc: "精准解析二进制图像头部，透明还原 GPS 坐标、曝光时间、ISO、光圈值及拍摄时间。" },
                  { title: "一键彻底物理脱敏 (Metadata Stripper)", desc: "基于 Canvas 纯净渲染机制，100% 永久清除 EXIF、XMP、IPTC 等所有信息标签且画质零损伤。" },
                  { title: "多格式转换与轻量导出", desc: "支持直接输出为标准 JPEG、无损透明 PNG 或新一代超轻量 WebP 格式。" },
                  { title: "100% 浏览器本地安全沙箱 (零服务器上传)", desc: "照片与定位数据绝不离开运算设备，全方位保护家庭住址与个人行踪隐私。" },
                ],
                useCasesTitle: "实战应用推荐场景",
                useCases: [
                  { icon: "🏠", title: "二手闲置平台发图防家庭住址定位泄露", desc: "在闲鱼、转转等二手平台发帖时，提前清除原图携带的住宅精准 GPS 坐标。" },
                  { icon: "📱", title: "小红书、微博与朋友圈日常晒图隐私脱敏", desc: "分享儿童、生活日常照片时，防止他人通过原图 EXIF 逆向追踪拍摄地点与生活轨迹。" },
                  { icon: "📄", title: "企业对外宣传与公关新闻配图净化", desc: "在公开分发官方宣传图前，抹除拍摄设备型号、内部后期软件版本等敏感环境信息。" },
                  { icon: "📷", title: "摄影师与后期爱好者拍摄参数复盘", desc: "精准查看优秀摄影作品的光圈 (F-Number)、快门速度 (Shutter Speed)、焦距等核心参数。" },
                ],
                proTipsTitle: "专家照片隐私保护技巧",
                proTips: [
                  "现代智能手机拍摄的原图通常包含误差仅数米的精细 GPS 坐标信息。",
                  "在社交网络或论坛发送原图前，建议一律先使用本工具消除 EXIF 数据。",
                  "如果追求极致画质可选择 'PNG' 导出；若需同时缩减文件体积以便快速分享，推荐选用 'WebP' 格式。",
                  "下载后可将处理好的图片重新拖入本工具验证，您会发现所有 GPS 与相机信息均已彻底消失。",
                ],
                faqTitle: "常见问题解答 (FAQ)",
                faqs: [
                  { q: "什么是 EXIF 元数据？为什么要删除它？", a: "EXIF 是拍照时相机自动写入文件内部的元数据，其中包含的 GPS 定位坐标能够直接暴露您的居住地址或出行轨迹，为了防止个人隐私泄露应在网络公开前予以清除。" },
                  { q: "上传照片时我的位置信息会被发送到服务器吗？", a: "绝无可能！desktools.run 的所有解析与消除操作全部在您本地电脑的内存中完成，无任何网络数据传输。" },
                  { q: "清除 EXIF 会导致照片画质或分辨率下降吗？", a: "不会！系统严格按照 1:1 像素映射渲染，完美保留画面原有清晰度与分辨率，仅清除纯文本元数据。" },
                  { q: "支持苹果 iPhone、华为/小米安卓手机及单反相机的照片吗？", a: "支持！全面兼容各类智能手机（iOS/Android）以及索尼、佳能、尼康等数码相机的标准 EXIF 格式。" },
                  { q: "手机端浏览器可以直接使用吗？", a: "可以！无需安装任何 App，在移动端 Safari 或 Chrome 浏览器中即可轻松完成位置查看与一键脱敏。" },
                  { q: "完全免费吗？每天有使用次数限制吗？", a: "100% 永久免费，无任何每日上限，不添加任何水印，无需注册登录。" },
                ],
                relatedToolsTitle: "推荐相关实用工具",
                relatedTools: [
                  { title: "图片添加水印 (Image Watermark)", desc: "为脱敏后的照片一键添加专属防盗文字与 Logo 水印。", href: "/tools/image-watermark/" },
                  { title: "图片压缩器 (Image Compress)", desc: "无损压缩图片体积高达 80%，让上传与分享更加轻盈迅速。", href: "/tools/image-compress/" },
                  { title: "图片尺寸调整 (Image Resizer)", desc: "按像素或百分比无损调整图片分辨率与尺寸规格。", href: "/tools/image-resizer/" },
                  { title: "图片格式转换 (Image Converter)", desc: "在 PNG、JPG、WEBP、ICO 等多种格式之间秒级批量互转。", href: "/tools/image-converter/" },
                ],
              },
              fr: {
                aboutTitle: "Visualiseur et suppresseur de métadonnées EXIF et GPS d'images dans le navigateur",
                aboutDesc: "Inspectez et supprimez instantanément les coordonnées GPS, le modèle d'appareil photo, la date de prise de vue et l'ensemble des métadonnées EXIF (Exchangeable Image File Format) cachées dans vos photos en 1 seul clic. Tout s'exécute à 100% dans la mémoire vive de votre navigateur, garantissant un anonymat absolu sans transfert de données vers des serveurs.",
                howTitle: "Guide d'utilisation étape par étape",
                steps: [
                  "Glissez-déposez ou sélectionnez la photo à analyser (compatible JPG, JPEG, PNG, WEBP).",
                  "Consultez les métadonnées détectées : coordonnées GPS (avec lien Google Maps), modèle d'appareil et date.",
                  "Choisissez le format de sortie souhaité (JPEG / PNG / WEBP) et la qualité d'exportation.",
                  "Cliquez sur 'Supprimer les EXIF et Télécharger'.",
                  "Enregistrez votre photo nettoyée et sécurisée sans aucune donnée personnelle.",
                ],
                featuresTitle: "Fonctionnalités clés de confidentialité",
                features: [
                  { title: "Décodeur binaire approfondi EXIF / GPS", desc: "Analyse l'en-tête binaire pour révéler les coordonnées GPS exactes, l'ouverture, l'ISO et l'optique." },
                  { title: "Suppression complète des métadonnées en 1 clic", desc: "Efface 100% des balises EXIF, XMP et IPTC par réencodage Canvas sans dégradation visuelle." },
                  { title: "Exportation multiformat optimisée", desc: "Convertissez vos photos nettoyées vers JPEG, PNG sans perte ou le format moderne WebP." },
                  { title: "Confidentialité 100% locale (Zéro upload sur serveur)", desc: "Vos photos et données de géolocalisation ne quittent jamais votre appareil." },
                ],
                useCasesTitle: "Cas d'utilisation pratiques",
                useCases: [
                  { icon: "🏠", title: "Annonces de vente entre particuliers et petites annonces", desc: "Supprimez la localisation GPS de votre domicile avant de publier des photos sur des sites d'annonces." },
                  { icon: "📱", title: "Protection de la vie privée sur les réseaux sociaux et blogs", desc: "Empêchez le traçage de vos habitudes et lieux de vie lors du partage de photos du quotidien." },
                  { icon: "📄", title: "Diffusion de visuels d'entreprise et communiqués de presse", desc: "Nettoyez les informations relatives au matériel photographique et aux logiciels utilisés." },
                  { icon: "📷", title: "Analyse des réglages de prise de vue pour photographes", desc: "Examinez le temps d'exposition, l'ouverture f et la distance focale pour perfectionner vos clichés." },
                ],
                proTipsTitle: "Conseils d'experts pour la confidentialité de vos photos",
                proTips: [
                  "Les photos prises avec un smartphone intègrent généralement des coordonnées GPS précises à quelques mètres près.",
                  "Nettoyer les métadonnées avant publication sur internet empêche totalement la géolocalisation de votre domicile.",
                  "Choisissez le format 'PNG' pour conserver une fidélité parfaite ou 'WebP' pour des fichiers légers.",
                  "Pour vérifier l'efficacité, glissez à nouveau l'image téléchargée dans l'outil pour constater la disparition totale des données GPS.",
                ],
                faqTitle: "Foire Aux Questions (FAQ)",
                faqs: [
                  { q: "Que sont les métadonnées EXIF et pourquoi les supprimer ?", a: "Ce sont des informations enregistrées automatiquement lors de la prise de vue. Les coordonnées GPS peuvent révéler votre adresse à des tiers, d'où l'importance de les effacer." },
                  { q: "Mes photos ou ma position sont-elles envoyées sur un serveur ?", a: "Absolument pas ! Tout le traitement s'exécute dans la mémoire vive de votre navigateur sans aucune connexion externe." },
                  { q: "La suppression des EXIF dégrade-t-elle la qualité de l'image ?", a: "Non, la résolution et la netteté des pixels sont conservées à 100% ; seuls les blocs de métadonnées sont purgés." },
                  { q: "L'outil est-il compatible avec les photos d'iPhone, Android et reflex ?", a: "Oui, il prend en charge l'ensemble des formats EXIF standard de tous les fabricants." },
                  { q: "Fonctionne-t-il sur smartphone ?", a: "Oui, il fonctionne parfaitement sur tous les navigateurs mobiles sans aucune application à installer." },
                  { q: "Le service est-il gratuit et sans limite ?", a: "100% gratuit, illimité, sans filigrane et sans inscription." },
                ],
                relatedToolsTitle: "Outils recommandés",
                relatedTools: [
                  { title: "Ajout de filigrane (Image Watermark)", desc: "Appliquez des filigranes ou logos sur vos photos pour protéger vos droits.", href: "/tools/image-watermark/" },
                  { title: "Compresseur d'images (Image Compress)", desc: "Réduisez la taille de vos fichiers jusqu'à 80% sans perte.", href: "/tools/image-compress/" },
                  { title: "Redimensionneur d'images (Image Resizer)", desc: "Ajustez les dimensions en pixels ou en pourcentage sans perte de qualité.", href: "/tools/image-resizer/" },
                  { title: "Convertisseur d'images (Image Converter)", desc: "Convertissez vos fichiers vers PNG, JPG, WEBP ou ICO.", href: "/tools/image-converter/" },
                ],
              },
              en: {
                aboutTitle: "Browser-Native Image EXIF Metadata Viewer & Cleaner (Privacy Stripper)",
                aboutDesc: "Deeply inspect and strip hidden GPS latitude/longitude coordinates, camera device models, lens specs, shutter speeds, and timestamps embedded in photo files in 1 click. All EXIF (Exchangeable Image File Format) decoding and metadata wiping run 100% locally inside your client browser memory, guaranteeing total privacy and preventing location tracking.",
                howTitle: "Step-by-Step Usage Guide",
                steps: [
                  "Drag and drop or select the photo you want to inspect or sanitize (supports JPG, JPEG, PNG, WEBP).",
                  "Inspect detected metadata details: GPS coordinates (with direct Google Maps links), camera hardware, and capture dates.",
                  "Choose your desired export format (JPEG / PNG / WEBP) and quality settings.",
                  "Click 'Strip EXIF & Download'.",
                  "Save your completely sanitized image free of all sensitive personal geolocation metadata.",
                ],
                featuresTitle: "Key Privacy & Engineering Features",
                features: [
                  { title: "Deep Binary EXIF/GPS Metadata Parser", desc: "Inspects raw binary file headers to visualize exact GPS coordinates, camera make, aperture, ISO, and focal length." },
                  { title: "1-Click Total Privacy Metadata Stripping", desc: "Purges 100% of EXIF, XMP, and IPTC metadata tags via pure Canvas re-encoding without visual degradation." },
                  { title: "Multi-Format & Quality Optimization", desc: "Export sanitized assets directly into standard JPEG, lossless PNG, or lightweight modern WebP formats." },
                  { title: "100% Client-Side Privacy Sandbox (Zero Upload)", desc: "Zero image bytes or geolocation coordinates leave your device, ensuring complete anonymity." },
                ],
                useCasesTitle: "Real-World Practical Use Cases",
                useCases: [
                  { icon: "🏠", title: "Classifieds & Marketplace Listings Home Privacy", desc: "Wipe home GPS coordinates recorded in smartphone photos before posting items on Craigslist or Facebook Marketplace." },
                  { icon: "📱", title: "Social Media & Public Blog Photo Sanitization", desc: "Prevent strangers from tracking your home address, routine, or children's school locations from uploaded daily photos." },
                  { icon: "📄", title: "Corporate Media Kit & Press Release Sanitization", desc: "Strip internal camera serial numbers and editing software versions before distributing official imagery." },
                  { icon: "📷", title: "Photographer Camera Settings & EXIF Analysis", desc: "Inspect exposure times, f-stops, and lens configurations from high-end photos to study shooting techniques." },
                ],
                proTipsTitle: "Pro Photo Privacy & EXIF Tips",
                proTips: [
                  "Photos taken on modern smartphones routinely embed precise GPS coordinates accurate to within a few meters.",
                  "Running photos through an EXIF stripper before uploading to public forums is the most effective safeguard against stalking and doxxing.",
                  "Select 'PNG' for lossless quality, or 'WebP' to simultaneously shrink file sizes for fast web sharing.",
                  "To verify sanitization, drag your downloaded image back into this tool—you will see that all GPS and camera tags are permanently gone.",
                ],
                faqTitle: "Frequently Asked Questions (FAQ)",
                faqs: [
                  { q: "What is EXIF metadata and why should I remove it?", a: "EXIF data is automatically written by cameras during capture. Embedded GPS coordinates can reveal your exact residential address to anyone who downloads the photo." },
                  { q: "Is my photo or location sent to any server?", a: "Zero server upload! All analysis and metadata stripping happen 100% locally inside your browser memory." },
                  { q: "Does stripping EXIF reduce image resolution or quality?", a: "No! The canvas engine performs a 1:1 pixel map, maintaining 100% of original visual sharpness while discarding text metadata blocks." },
                  { q: "Does it support iPhone, Android, and DSLR camera photos?", a: "Yes! Fully compatible with standard EXIF metadata generated by Apple iOS, Android devices, and Sony/Canon/Nikon cameras." },
                  { q: "Can I use this tool on mobile browsers?", a: "Yes! Fully responsive across mobile Safari and Chrome browsers without requiring app installations." },
                  { q: "Is it completely free with no usage limits?", a: "100% free and unlimited. No accounts, no subscriptions, and no forced watermarks." },
                ],
                relatedToolsTitle: "Related Utilities",
                relatedTools: [
                  { title: "Image Watermark", desc: "Add transparent copyright text and logo watermarks to photos.", href: "/tools/image-watermark/" },
                  { title: "Image Compressor", desc: "Shrink sanitized image files up to 80% without losing quality.", href: "/tools/image-compress/" },
                  { title: "Image Resizer", desc: "Resize image dimensions (pixels/percentage) while preserving quality.", href: "/tools/image-resizer/" },
                  { title: "Image Converter", desc: "Convert sanitized photos between PNG, JPG, WEBP, and ICO formats.", href: "/tools/image-converter/" },
                ],
              },
            };

            const active = content[locale as keyof typeof content] || content.en;

            return (
              <div style={{ marginTop: "60px" }}>
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
              </div>
            );
          })()}
        </section>
      </main>

      <Footer />
    </>
  );
}
