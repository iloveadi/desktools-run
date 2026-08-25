"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";
import {
  Upload,
  Download,
  AppWindow,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Smartphone,
  Eye,
  Sliders,
  Sparkles,
  FileCode,
  Image as ImageIcon
} from "lucide-react";

interface GeneratedIcon {
  name: string;
  size: number;
  dataUrl: string;
  blob: Blob;
  uint8: Uint8Array;
}

export default function FaviconGeneratorPage() {
  const { t } = useLocale();

  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Styling options
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [customHex, setCustomHex] = useState<string>("#4f46e5");
  const [shape, setShape] = useState<"square" | "rounded" | "circle">("rounded");
  const [padding, setPadding] = useState<number>(10); // percentage

  // Generated Assets
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([]);
  const [icoBlob, setIcoBlob] = useState<Blob | null>(null);
  const [icoUint8, setIcoUint8] = useState<Uint8Array | null>(null);
  const [manifestText, setManifestText] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setSourceImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Pure JS Zip Packager
  const createZip = (files: Array<{ name: string; buffer: Uint8Array }>): Uint8Array => {
    const localHeaders: Uint8Array[] = [];
    const centralDirs: Uint8Array[] = [];
    let offset = 0;

    for (const f of files) {
      const nameBytes = new TextEncoder().encode(f.name);
      const date = new Date();
      const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
      const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

      let crc = 0xffffffff;
      for (let i = 0; i < f.buffer.length; i++) {
        crc ^= f.buffer[i];
        for (let j = 0; j < 8; j++) {
          crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
      }
      crc = (crc ^ 0xffffffff) >>> 0;

      const lh = new Uint8Array(30 + nameBytes.length + f.buffer.length);
      const dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, dosTime, true);
      dv.setUint16(12, dosDate, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, f.buffer.length, true);
      dv.setUint32(22, f.buffer.length, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      lh.set(nameBytes, 30);
      lh.set(f.buffer, 30 + nameBytes.length);
      localHeaders.push(lh);

      const cd = new Uint8Array(46 + nameBytes.length);
      const cdv = new DataView(cd.buffer);
      cdv.setUint32(0, 0x02014b50, true);
      cdv.setUint16(4, 20, true);
      cdv.setUint16(6, 20, true);
      cdv.setUint16(8, 0, true);
      cdv.setUint16(10, 0, true);
      cdv.setUint16(12, dosTime, true);
      cdv.setUint16(14, dosDate, true);
      cdv.setUint32(16, crc, true);
      cdv.setUint32(20, f.buffer.length, true);
      cdv.setUint32(24, f.buffer.length, true);
      cdv.setUint16(28, nameBytes.length, true);
      cdv.setUint16(30, 0, true);
      cdv.setUint16(32, 0, true);
      cdv.setUint16(34, 0, true);
      cdv.setUint16(36, 0, true);
      cdv.setUint32(38, 0, true);
      cdv.setUint32(42, offset, true);
      cd.set(nameBytes, 46);
      centralDirs.push(cd);

      offset += lh.length;
    }

    const centralOffset = offset;
    let centralSize = 0;
    for (const cd of centralDirs) centralSize += cd.length;

    const eocd = new Uint8Array(22);
    const edv = new DataView(eocd.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(4, 0, true);
    edv.setUint16(6, 0, true);
    edv.setUint16(8, files.length, true);
    edv.setUint16(10, files.length, true);
    edv.setUint32(12, centralSize, true);
    edv.setUint32(16, centralOffset, true);
    edv.setUint16(20, 0, true);

    const totalLen = offset + centralSize + 22;
    const zip = new Uint8Array(totalLen);
    let pos = 0;
    for (const lh of localHeaders) { zip.set(lh, pos); pos += lh.length; }
    for (const cd of centralDirs) { zip.set(cd, pos); pos += cd.length; }
    zip.set(eocd, pos);

    return zip;
  };

  // ICO File Packager (Combining 16, 32, 48 PNGs)
  const buildIcoBinary = (pngList: Array<{ size: number; uint8: Uint8Array }>): Uint8Array => {
    const count = pngList.length;
    const headerSize = 6;
    const dirEntrySize = 16;
    let offset = headerSize + count * dirEntrySize;

    const header = new Uint8Array(headerSize);
    const hdv = new DataView(header.buffer);
    hdv.setUint16(0, 0, true);
    hdv.setUint16(2, 1, true); // ICO format
    hdv.setUint16(4, count, true);

    const dirEntries: Uint8Array[] = [];
    for (const img of pngList) {
      const entry = new Uint8Array(dirEntrySize);
      const edv = new DataView(entry.buffer);
      edv.setUint8(0, img.size === 256 ? 0 : img.size);
      edv.setUint8(1, img.size === 256 ? 0 : img.size);
      edv.setUint8(2, 0);
      edv.setUint8(3, 0);
      edv.setUint16(4, 1, true);
      edv.setUint16(6, 32, true);
      edv.setUint32(8, img.uint8.length, true);
      edv.setUint32(12, offset, true);
      dirEntries.push(entry);
      offset += img.uint8.length;
    }

    const totalLen = offset;
    const ico = new Uint8Array(totalLen);
    ico.set(header, 0);
    let pos = headerSize;
    for (const d of dirEntries) { ico.set(d, pos); pos += d.length; }
    for (const img of pngList) { ico.set(img.uint8, pos); pos += img.uint8.length; }

    return ico;
  };

  // Generate all Icon resolutions
  const renderIcons = useCallback(async () => {
    if (!sourceImage) return;
    setIsRendering(true);

    const targets = [
      { name: "favicon-16x16.png", size: 16 },
      { name: "favicon-32x32.png", size: 32 },
      { name: "favicon-48x48.png", size: 48 },
      { name: "apple-touch-icon.png", size: 180 },
      { name: "android-chrome-192x192.png", size: 192 },
      { name: "android-chrome-512x512.png", size: 512 },
    ];

    const results: GeneratedIcon[] = [];

    for (const target of targets) {
      const canvas = document.createElement("canvas");
      canvas.width = target.size;
      canvas.height = target.size;

      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      const s = target.size;
      const padPx = (s * padding) / 100;
      const drawSize = s - padPx * 2;

      // Draw background shape
      ctx.save();
      const fillStyle = bgColor === "transparent" ? null : bgColor === "custom" ? customHex : bgColor;

      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        if (shape === "circle") {
          ctx.beginPath();
          ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === "rounded") {
          const rx = s * 0.22;
          ctx.beginPath();
          ctx.roundRect(0, 0, s, s, rx);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, s, s);
        }
      }

      if (shape === "circle" && !fillStyle) {
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
        ctx.clip();
      } else if (shape === "rounded" && !fillStyle) {
        const rx = s * 0.22;
        ctx.beginPath();
        ctx.roundRect(0, 0, s, s, rx);
        ctx.clip();
      }

      // Draw centered logo image
      ctx.drawImage(sourceImage, padPx, padPx, drawSize, drawSize);
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const uint8 = new Uint8Array(await blob.arrayBuffer());

      results.push({
        name: target.name,
        size: target.size,
        dataUrl,
        blob,
        uint8,
      });
    }

    setGeneratedIcons(results);

    // Build multi-icon favicon.ico (16, 32, 48)
    const p16 = results.find((r) => r.size === 16);
    const p32 = results.find((r) => r.size === 32);
    const p48 = results.find((r) => r.size === 48);

    if (p16 && p32 && p48) {
      const icoUint = buildIcoBinary([
        { size: 16, uint8: p16.uint8 },
        { size: 32, uint8: p32.uint8 },
        { size: 48, uint8: p48.uint8 },
      ]);
      const icoB = new Blob([icoUint.buffer as ArrayBuffer], { type: "image/x-icon" });
      setIcoBlob(icoB);
      setIcoUint8(icoUint);
    }

    // Build site.webmanifest
    const manifest = {
      name: "My Web App",
      short_name: "App",
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone"
    };
    setManifestText(JSON.stringify(manifest, null, 2));

    setIsRendering(false);
  }, [sourceImage, bgColor, customHex, shape, padding]);

  useEffect(() => {
    renderIcons();
  }, [renderIcons]);

  // Download All as ZIP
  const handleDownloadZip = () => {
    if (!generatedIcons.length || !icoUint8) return;

    const filesToZip: Array<{ name: string; buffer: Uint8Array }> = [];

    // Add PNG icons
    for (const icon of generatedIcons) {
      filesToZip.push({ name: icon.name, buffer: icon.uint8 });
    }

    // Add favicon.ico
    filesToZip.push({ name: "favicon.ico", buffer: icoUint8 });

    // Add site.webmanifest
    const manifestBytes = new TextEncoder().encode(manifestText);
    filesToZip.push({ name: "site.webmanifest", buffer: manifestBytes });

    // Build ZIP
    const zipUint = createZip(filesToZip);
    const zipBlob = new Blob([zipUint.buffer as ArrayBuffer], { type: "application/zip" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(zipBlob);
    a.download = "favicon_package.zip";
    a.click();
  };

  // Download individual file
  const handleDownloadSingle = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  const htmlHeadSnippet = `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="shortcut icon" href="/favicon.ico">`;

  const copyHtmlSnippet = () => {
    navigator.clipboard.writeText(htmlHeadSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const icon16 = generatedIcons.find((i) => i.size === 16)?.dataUrl;
  const icon32 = generatedIcons.find((i) => i.size === 32)?.dataUrl;
  const icon180 = generatedIcons.find((i) => i.size === 180)?.dataUrl;

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
            {t("faviconGen.back")}
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
              }}
            >
              <AppWindow size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                {t("faviconGen.title")}
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                {t("faviconGen.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Main Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {!sourceImage ? (
            /* Upload Dropzone */
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
                accept="image/*"
                onChange={handleImageUpload}
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
                  background: "rgba(99, 102, 241, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "#818cf8",
                }}
              >
                <Upload size={32} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                {t("faviconGen.dropTitle")}
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 20px" }}>
                {t("faviconGen.dropDesc")}
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
                {t("faviconGen.selectFile")}
              </button>
            </div>
          ) : (
            /* Studio Studio Grid */
            <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 380px) 1fr", gap: "24px" }}>
              {/* Controls Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Source Info */}
                <div className="glass-card" style={{ padding: "18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {fileName}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {sourceImage.naturalWidth} × {sourceImage.naturalHeight} px
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
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                </div>

                {/* Customization Options */}
                <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sliders size={16} color="#818cf8" />
                    {t("faviconGen.customDesign")}
                  </div>

                  {/* Background Color */}
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                      {t("faviconGen.bgColor")}
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                      {[
                        { id: "transparent", label: t("faviconGen.transparent") },
                        { id: "#ffffff", label: t("faviconGen.white") },
                        { id: "#0f172a", label: t("faviconGen.dark") },
                        { id: "#4f46e5", label: t("faviconGen.indigo") },
                      ].map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => setBgColor(bg.id)}
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            background: bgColor === bg.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                            border: bgColor === bg.id ? "1px solid #818cf8" : "1px solid var(--border-subtle)",
                            color: bgColor === bg.id ? "#818cf8" : "var(--text-secondary)",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {bg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Icon Shape */}
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                      {t("faviconGen.shape")}
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                      {[
                        { id: "square", label: t("faviconGen.square") },
                        { id: "rounded", label: t("faviconGen.rounded") },
                        { id: "circle", label: t("faviconGen.circle") },
                      ].map((shp) => (
                        <button
                          key={shp.id}
                          onClick={() => setShape(shp.id as any)}
                          style={{
                            padding: "6px",
                            borderRadius: "6px",
                            background: shape === shp.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                            border: shape === shp.id ? "1px solid #818cf8" : "1px solid var(--border-subtle)",
                            color: shape === shp.id ? "#818cf8" : "var(--text-secondary)",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {shp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Padding Slider */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                      <span>{t("faviconGen.padding")}</span>
                      <span>{padding}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={35}
                      value={padding}
                      onChange={(e) => setPadding(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#6366f1" }}
                    />
                  </div>
                </div>

                {/* ZIP Download Action Box */}
                <div className="glass-card" style={{ padding: "18px" }}>
                  <button
                    onClick={handleDownloadZip}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: "10px",
                      fontSize: "14.5px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                    }}
                  >
                    <Download size={18} />
                    {t("faviconGen.downloadZip")}
                  </button>
                </div>
              </div>

              {/* Previews & Asset List Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Real-Time Browser & Mobile Previews */}
                <div className="glass-card" style={{ padding: "20px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Eye size={17} color="#818cf8" />
                    {t("faviconGen.previewTitle")}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Browser Dark Tab Preview */}
                    <div style={{ background: "#1e293b", borderRadius: "10px", padding: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Globe size={12} />
                        {t("faviconGen.darkTabPreview")}
                      </div>
                      <div style={{ background: "#0f172a", borderRadius: "6px 6px 0 0", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "8px", maxWidth: "180px" }}>
                        {icon16 && <img src={icon16} alt="tab icon" style={{ width: "16px", height: "16px" }} />}
                        <span style={{ fontSize: "12px", color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                          My Web App
                        </span>
                      </div>
                    </div>

                    {/* iOS Mobile Home Screen Icon Preview */}
                    <div style={{ background: "#090d16", borderRadius: "10px", padding: "10px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Smartphone size={12} />
                        {t("faviconGen.iosPreview")}
                      </div>
                      {icon180 && (
                        <div style={{ width: "54px", height: "54px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                          <img src={icon180} alt="apple icon" style={{ width: "100%", height: "100%" }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generated Icon Assets Grid */}
                <div className="glass-card" style={{ padding: "20px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
                    {t("faviconGen.generatedAssets")} ({generatedIcons.length + 2})
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                    {generatedIcons.map((icon) => (
                      <div
                        key={icon.name}
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--border-subtle)",
                          padding: "10px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <img src={icon.dataUrl} alt={icon.name} style={{ width: "24px", height: "24px", objectFit: "contain" }} />
                          <div>
                            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-primary)" }}>{icon.name}</div>
                            <div style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>{icon.size} × {icon.size} px</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadSingle(icon.dataUrl, icon.name)}
                          style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", padding: "4px" }}
                          title={t("faviconGen.downloadSingle")}
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    ))}

                    {/* favicon.ico Item */}
                    {icoBlob && (
                      <div
                        style={{
                          background: "rgba(99,102,241,0.08)",
                          border: "1px solid rgba(99,102,241,0.25)",
                          padding: "10px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {icon32 && <img src={icon32} alt="ico" style={{ width: "24px", height: "24px" }} />}
                          <div>
                            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#818cf8" }}>favicon.ico</div>
                            <div style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>16/32/48 ICO</div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = URL.createObjectURL(icoBlob);
                            a.download = "favicon.ico";
                            a.click();
                          }}
                          style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", padding: "4px" }}
                          title={t("faviconGen.downloadSingle")}
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* HTML <head> Code Snippet Box */}
                <div className="glass-card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FileCode size={16} color="#34d399" />
                      {t("faviconGen.htmlCodeTitle")}
                    </div>

                    <button
                      onClick={copyHtmlSnippet}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: copiedCode ? "rgba(52,211,153,0.2)" : "var(--btn-secondary-bg)",
                        border: "1px solid var(--btn-secondary-border)",
                        color: copiedCode ? "#34d399" : "var(--text-secondary)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                      {copiedCode ? t("faviconGen.copiedCode") : t("faviconGen.copyCode")}
                    </button>
                  </div>

                  <pre
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      color: "#34d399",
                      overflowX: "auto",
                      border: "1px solid var(--border-subtle)",
                      margin: 0,
                    }}
                  >
                    {htmlHeadSnippet}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Tool Guide */}
          <div style={{ marginTop: "60px" }}>
            <ToolGuide
              aboutTitle={t("faviconGen.guide.aboutTitle")}
              aboutDesc={t("faviconGen.guide.aboutDesc")}
              howTitle={t("faviconGen.guide.howTitle")}
              steps={[
                t("faviconGen.guide.step1"),
                t("faviconGen.guide.step2"),
                t("faviconGen.guide.step3"),
              ]}
              faqs={[
                {
                  q: t("faviconGen.guide.faq1Q"),
                  a: t("faviconGen.guide.faq1A"),
                },
                {
                  q: t("faviconGen.guide.faq2Q"),
                  a: t("faviconGen.guide.faq2A"),
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
