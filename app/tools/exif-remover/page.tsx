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
  const { t } = useLocale();

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

          {/* Guide Component */}
          <div style={{ marginTop: "60px" }}>
            <ToolGuide
              aboutTitle={t("exifRemover.guide.aboutTitle")}
              aboutDesc={t("exifRemover.guide.aboutDesc")}
              howTitle={t("exifRemover.guide.howTitle")}
              steps={[
                t("exifRemover.guide.step1"),
                t("exifRemover.guide.step2"),
                t("exifRemover.guide.step3"),
              ]}
              faqs={[
                {
                  q: t("exifRemover.guide.faq1Q"),
                  a: t("exifRemover.guide.faq1A"),
                },
                {
                  q: t("exifRemover.guide.faq2Q"),
                  a: t("exifRemover.guide.faq2A"),
                },
              ]}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
