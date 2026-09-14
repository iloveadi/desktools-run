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
  const { t, locale } = useLocale();

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
            {(() => {
              const content = {
                ko: {
                  aboutTitle: "Favicon & PWA 앱 아이콘 일괄 생성기 소개",
                  aboutDesc:
                    "단 하나의 고해상도 로고나 심볼 이미지(PNG, SVG, JPG, WEBP)를 업로드하면 최신 웹 표준과 모바일 OS(iOS, Android, Windows)에 완벽 대응하는 멀티 사이즈 파비콘(16×16, 32×32, 48×48), 멀티 레이어 favicon.ico, 고해상도 Apple Touch Icon(180×180), PWA 웹 매니페스트(site.webmanifest), Android Chrome 아이콘(192×192, 512×512) 및 HTML <head> 삽입용 표준 코드까지 1초 만에 자동 생성해 주는 전문 웹마스터 도구입니다. 모든 렌더링과 ZIP 압축 패키징은 100% 사용자의 웹 브라우저 내에서 로컬 처리되므로 기업 로고나 신규 브랜드 에셋의 유출 걱정 없이 안전하게 사용할 수 있습니다.",
                  howTitle: "파비콘 & 앱 아이콘 세트 생성 및 적용 방법",
                  steps: [
                    "정사각형 비율의 고화질 로고나 아이콘 이미지(512×512 이상 권장)를 업로드 영역으로 드래그 앤 드롭합니다.",
                    "배경 스타일(투명, 화이트, 다크, 인디고 테마) 및 아이콘 형태(정사각형, 둥근 모서리, 원형)를 선택합니다.",
                    "심볼이 너무 꽉 차지 않도록 내부 여백(패딩) 슬라이더를 조절하여 최적의 비율을 맞춥니다.",
                    "상단 실시간 미리보기에서 브라우저 다크 모드 탭과 모바일 홈 화면에서의 렌더링 상태를 확인합니다.",
                    "'파비콘 패키지 ZIP 다운로드' 버튼을 클릭하고, 제공되는 HTML <head> 코드를 복사하여 웹사이트 최상단에 붙여넣습니다."
                  ],
                  featuresTitle: "주요 특징 및 핵심 기능",
                  features: [
                    { title: "단일 이미지로 올인원 패키지 생성", desc: "16px부터 512px까지 6종의 고품질 PNG와 레거시 브라우저 호환 multi-layer favicon.ico, PWA manifest 파일을 일괄 생성합니다." },
                    { title: "실시간 비주얼 프리뷰", desc: "실제 크롬/사파리 다크 테마 탭과 모바일 스마트폰 홈 화면 아이콘으로 표시되는 모습을 조작 즉시 실시간으로 시각화합니다." },
                    { title: "자유로운 배경색 & 형태 커스텀", desc: "투명 배경 PNG뿐만 아니라 스퀘어, 라운드, 원형 클리핑 및 컬러 배경을 손쉽게 합성하여 완성도 높은 앱 아이콘을 제작할 수 있습니다." },
                    { title: "HTML Head 스니펫 원클릭 복사", desc: "표준 meta 태그와 link 태그가 포함된 HTML 코드를 복사 버튼 한 번으로 바로 가져와 웹 프로젝트에 즉시 붙여넣을 수 있습니다." }
                  ],
                  useCasesTitle: "추천 활용 사례",
                  useCases: [
                    { title: "웹사이트 & 블로그 런칭", desc: "워드프레스, 노션 포트폴리오, 티스토리, 개인 블로그, 기업 공식 사이트 등에 필수적인 파비콘 세트 일괄 구성" },
                    { title: "PWA & 모바일 웹앱 패키징", desc: "홈 화면 바로가기 추가 시 고해상도 앱 아이콘(192px/512px) 및 웹 매니페스트 설정이 필요한 프로그레시브 웹앱 개발자" },
                    { title: "브랜드 리뉴얼 & 스타트업 CI/BI", desc: "새로운 CI 심볼을 브라우저 탭 및 북마크바 환경에서 크기별 가독성과 배경 대비를 사전 검증하고 에셋 패키징" },
                    { title: "SaaS & 웹 서비스 프론트엔드 구축", desc: "Next.js, Vite, React, Vue 프로젝트의 public 폴더에 그대로 배치할 파비콘 에셋 자동화" }
                  ],
                  proTipsTitle: "전문가를 위한 파비콘 최적화 팁",
                  proTips: [
                    { title: "고해상도 투명 배경(PNG) 원본 권장", desc: "512×512 이상의 알파 채널 투명 PNG를 사용하면 다운스케일링 시 16×16 작은 탭에서도 또렷한 앤티앨리어싱 품질을 유지합니다." },
                    { title: "모바일 홈 화면 아이콘은 불투명 배경 추천", desc: "iOS 및 안드로이드 홈 화면에서는 투명 배경이 검은색으로 처리될 수 있으므로, 적절한 브랜드 컬러 배경과 여백을 적용하는 것이 좋습니다." },
                    { title: "루트 디렉터리(favicon.ico) 배치 필수", desc: "많은 검색 엔진 크롤러와 레거시 북마크 시스템은 HTML 파싱 없이도 /favicon.ico를 직접 요청하므로 루트 경로에 배치하세요." },
                    { title: "브라우저 캐시 무효화 팁", desc: "파비콘 교체 후 반영이 안 될 경우 <link rel=\"icon\" href=\"/favicon.ico?v=2\">처럼 쿼리 파라미터를 붙이거나 캐시를 비우세요." }
                  ],
                  faqTitle: "자주 묻는 질문 (FAQ)",
                  faqs: [
                    { q: "favicon.ico 파일 하나만 있으면 모든 브라우저에서 문제없나요?", a: "기본적인 브라우저 탭 표시는 가능하지만, 레티나 디스플레이 고해상도 북마크, 모바일 바로가기 아이콘, PWA 설치 환경을 완벽히 지원하려면 180×180 Apple Touch Icon과 192×192 이상 Web App Manifest 아이콘이 반드시 함께 제공되어야 합니다." },
                    { q: "업로드한 로고 파일이 서버에 저장되거나 수집되나요?", a: "전혀 수집되지 않습니다. HTML5 Canvas API 및 로컬 브라우저 메모리 연산을 통해 100% 클라이언트 환경에서 생성 및 압축되므로 기업 보안 및 저작권에 100% 안전합니다." },
                    { q: "ZIP 파일 안에는 어떤 파일들이 포함되어 있나요?", a: "favicon.ico(16, 32, 48 포함), favicon-16x16.png, favicon-32x32.png, favicon-48x48.png, apple-touch-icon.png(180px), android-chrome-192x192.png, android-chrome-512x512.png, site.webmanifest 파일이 모두 포함되어 있습니다." },
                    { q: "생성된 파비콘 패키지를 웹사이트에 어떻게 적용하나요?", a: "ZIP 압축을 해제한 파일들을 프로젝트의 public 또는 루트 디렉터리에 넣고, 화면에 제공된 HTML <head> 코드 스니펫을 웹페이지 <head> 영역에 복사하여 붙여넣으시면 됩니다." },
                    { q: "투명 배경 이미지에 패딩(여백)을 주는 이유는 무엇인가요?", a: "로고 심볼이 모서리에 닿으면 작은 브라우저 탭이나 모바일 아이콘 라운딩 처리 시 시각적으로 답답해 보이므로, 8~12% 정도의 내부 패딩을 주면 훨씬 세련된 아이콘 비율이 완성됩니다." },
                    { q: "SVG 벡터 이미지를 업로드해도 파비콘으로 변환할 수 있나요?", a: "네, 최신 브라우저에서 렌더링 가능한 모든 이미지 포맷(PNG, SVG, JPG, WEBP)을 지원하며 업로드 시 즉시 각 해상도별 래스터화(Rasterization)를 거쳐 고화질 파비콘 세트로 변환됩니다." }
                  ],
                  relatedTitle: "함께 사용하면 좋은 이미지 도구",
                  relatedTools: [
                    { title: "이미지 리사이즈", desc: "웹 업로드 및 썸네일에 최적화된 맞춤 가로·세로 픽셀 크기 조절", href: "/tools/image-resizer/" },
                    { title: "이미지 포맷 변환기", desc: "PNG, JPG, WEBP, AVIF 등 고압축 차세대 웹 포맷 상호 변환", href: "/tools/image-converter/" },
                    { title: "이미지 워터마크 추가기", desc: "브랜드 로고와 저작권 텍스트를 패턴 및 투명도로 일괄 삽입", href: "/tools/image-watermark/" },
                    { title: "EXIF 메타데이터 제거기", desc: "사진에 포함된 GPS 위치 및 카메라 촬영 개인정보 완벽 삭제", href: "/tools/exif-remover/" }
                  ]
                },
                en: {
                  aboutTitle: "About Favicon & PWA App Icon Generator",
                  aboutDesc:
                    "Upload a single high-resolution logo or symbol (PNG, SVG, JPG, WEBP) to automatically generate a complete favicon and mobile app icon suite in seconds. Perfectly compliant with modern web standards, iOS Safari, Android Chrome, and desktop browsers, this generator delivers multi-size PNGs (16×16, 32×32, 48×48), multi-layer favicon.ico, Apple Touch Icon (180×180), PWA Web App Manifest (site.webmanifest), Android icons (192×192, 512×512), and ready-to-use HTML <head> code. All icon rendering and ZIP packaging happen 100% locally in your browser for absolute privacy and security.",
                  howTitle: "How to Generate & Install Your Favicon Suite",
                  steps: [
                    "Drag & drop your square high-resolution logo or icon (512×512px or higher recommended) into the upload box.",
                    "Choose your background styling (transparent, white, dark, or indigo) and icon shape (square, rounded, or circle).",
                    "Adjust the internal padding slider so your logo symbol looks balanced without touching the outer borders.",
                    "Review the real-time previews to see how your favicon appears in browser dark tabs and iOS home screens.",
                    "Click 'Download All Assets (ZIP)' and copy the provided HTML <head> code snippet into your website's header."
                  ],
                  featuresTitle: "Key Features & Capabilities",
                  features: [
                    { title: "All-in-One Asset Generation", desc: "Generates 6 PNG sizes (16px to 512px), multi-layer binary favicon.ico, and site.webmanifest in a single click." },
                    { title: "Live Real-Time Previews", desc: "Instant visual feedback showing how your favicon looks inside active browser tabs and mobile smartphone home screens." },
                    { title: "Custom Shapes & Colors", desc: "Easily apply solid background colors, rounded corner radiuses, circular masks, and custom padding to any graphic." },
                    { title: "1-Click HTML Code Snippet", desc: "Get clean, standards-compliant link and meta tags ready to copy directly into Next.js, HTML, WordPress, or React." }
                  ],
                  useCasesTitle: "Popular Use Cases",
                  useCases: [
                    { title: "New Website & Blog Launches", desc: "Essential favicon setup for WordPress, Webflow, Notion, personal blogs, and commercial websites." },
                    { title: "PWA & Mobile Web Apps", desc: "Generate crisp home screen icons (192px / 512px) and manifest files required for Progressive Web Apps." },
                    { title: "Brand Identity & Startup Logos", desc: "Test how your brand symbol renders at small resolutions (16×16) across light and dark browser themes." },
                    { title: "Frontend Web Development", desc: "Automate icon generation for the public folder in Next.js, Vite, Vue, Svelte, or Angular projects." }
                  ],
                  proTipsTitle: "Favicon Optimization Pro Tips",
                  proTips: [
                    { title: "Use High-Res Transparent PNGs", desc: "Starting with a 512×512+ transparent PNG ensures crisp downsampling and anti-aliasing on small 16px tabs." },
                    { title: "Opaque Backgrounds for Mobile Icons", desc: "iOS and Android home screens may render transparent PNGs with a black background; use a branded solid background with padding." },
                    { title: "Always Place favicon.ico in Root", desc: "Many search engine bots and legacy bookmarks look directly for /favicon.ico without parsing HTML meta tags." },
                    { title: "Bust Browser Cache on Updates", desc: "When replacing an existing favicon, add a version query string like <link rel=\"icon\" href=\"/favicon.ico?v=2\"> to force refresh." }
                  ],
                  faqTitle: "Frequently Asked Questions (FAQ)",
                  faqs: [
                    { q: "Is a single favicon.ico file sufficient for modern websites?", a: "While favicon.ico handles basic desktop browser tabs, modern high-DPI Retina screens, iOS bookmarks, and PWA installs require 180×180 Apple Touch Icons and 192×192 / 512×512 Web App Manifest icons for crisp display." },
                    { q: "Is my logo uploaded to any external server?", a: "No. All canvas rendering, image scaling, ICO encoding, and ZIP compression are performed 100% locally in your browser memory. Your brand assets remain strictly confidential." },
                    { q: "What files are included in the downloaded ZIP archive?", a: "The ZIP contains favicon.ico (multi-resolution), favicon-16x16.png, favicon-32x32.png, favicon-48x48.png, apple-touch-icon.png (180px), android-chrome-192x192.png, android-chrome-512x512.png, and site.webmanifest." },
                    { q: "How do I add these generated files to my website?", a: "Extract all files from the ZIP into your website's root or public directory, then copy and paste the provided HTML snippet into your HTML <head> section." },
                    { q: "Why should I add padding to my favicon icon?", a: "Adding 8–12% internal padding prevents logo edges from clipping against rounded app icon masks and ensures balanced visual breathing room in browser tabs." },
                    { q: "Can I upload SVG vector files?", a: "Yes, you can upload SVGs, PNGs, JPGs, or WEBP images. The tool will automatically rasterize and scale them to all required standard dimensions." }
                  ],
                  relatedTitle: "Related Image Utilities",
                  relatedTools: [
                    { title: "Image Resizer", desc: "Resize dimensions with exact pixel width/height controls for web optimization", href: "/tools/image-resizer/" },
                    { title: "Image Format Converter", desc: "Convert between PNG, JPG, WEBP, AVIF, and GIF instantly in browser", href: "/tools/image-converter/" },
                    { title: "Image Watermark Tool", desc: "Add text or logo watermarks with custom opacity and tile patterns", href: "/tools/image-watermark/" },
                    { title: "EXIF Metadata Remover", desc: "Inspect and strip hidden GPS, camera, and date info for total privacy", href: "/tools/exif-remover/" }
                  ]
                },
                ja: {
                  aboutTitle: "Favicon & アプリアイコン一括生成ツールについて",
                  aboutDesc:
                    "1枚の高解像度ロゴやシンボル画像（PNG, SVG, JPG, WEBP）をアップロードするだけで、最新のWeb標準および各種モバイルOS（iOS, Android, Windows）に完全対応したマルチサイズファビコン（16×16, 32×32, 48×48）、マルチレイヤーfavicon.ico、高解像度Apple Touch Icon（180×180）、PWA用Webマニフェスト（site.webmanifest）、Android Chromeアイコン（192×192, 512×512）、およびHTML <head> 用タグを一括生成します。すべてのレンダリングとZIP圧縮処理はブラウザ内でローカル完結するため安全です。",
                  howTitle: "ファビコン＆アプリアイコンの作成・導入手順",
                  steps: [
                    "正方形の高画質ロゴ・アイコン画像（512×512px以上推奨）をアップロードします。",
                    "背景色（透明、ホワイト、ダーク、インディゴ）およびアイコン形状（四角、角丸、円形）を選択します。",
                    "シンボルが端に寄りすぎないようパディング（余白）スライダーでバランスを調整します。",
                    "リアルタイムプレビューでブラウザのダークタブやスマホホーム画面での見栄えを確認します。",
                    "「ZIP一括ダウンロード」をクリックし、提供されるHTML <head> コードをWebサイトのヘッダーに貼り付けます。"
                  ],
                  featuresTitle: "主な特徴と機能",
                  features: [
                    { title: "1枚からオールインワン生成", desc: "16pxから512pxまでのPNG群、favicon.ico、site.webmanifestをワンクリックで同時作成。" },
                    { title: "リアルタイム外観プレビュー", desc: "実際のブラウザタブやスマホのホーム画面に配置された時の見た目を即座に確認できます。" },
                    { title: "背景色と形状の自由なカスタマイズ", desc: "透明背景のほか、角丸や丸型マスク、背景色の合成を自由に設定可能。" },
                    { title: "HTML Headコードのワンクリックコピー", desc: "サイトに貼り付けるだけの標準的なlinkタグとmetaタグをワンタップでコピーできます。" }
                  ],
                  useCasesTitle: "おすすめの活用シーン",
                  useCases: [
                    { title: "Webサイト・ブログの立ち上げ", desc: "WordPress、Notion、個人ブログ、企業コーポレートサイトのファビコン一括設定" },
                    { title: "PWA・モバイルWebアプリの開発", desc: "ホーム画面追加用の高解像度アイコン（192px/512px）とマニフェスト設定" },
                    { title: "ブランドCI・ロゴの視認性検証", desc: "新しいロゴシンボルが16×16pxの小サイズでも判読しやすいかを事前テスト" },
                    { title: "Next.js・Vite等のフロントエンド構築", desc: "プロジェクトのpublicフォルダにそのまま配置できるアセットパッケージの自動化" }
                  ],
                  proTipsTitle: "ファビコン最適化のプロのコツ",
                  proTips: [
                    { title: "高解像度透過PNGの使用を推奨", desc: "512×512以上の透過PNGから縮小生成することで、16pxの微小サイズでも輪郭が鮮明に保たれます。" },
                    { title: "スマホアイコンには背景色を設定", desc: "iOS等のホーム画面では透過部が黒く塗りつぶされる場合があるため、背景色と余白の適用がおすすめです。" },
                    { title: "ルートディレクトリへのfavicon.ico配置", desc: "多くの検索エンジンやレガシークローラーはHTMLタグを読まずに /favicon.ico を直接取得します。" },
                    { title: "ブラウザキャッシュのクリア方法", desc: "更新が反映されない場合は <link rel=\"icon\" href=\"/favicon.ico?v=2\"> のようにクエリを付与してください。" }
                  ],
                  faqTitle: "よくある質問 (FAQ)",
                  faqs: [
                    { q: "favicon.ico 1ファイルだけで十分ですか？", a: "PCタブの表示には十分ですが、Retinaディスプレイの高解像度ブックマークやiOS/Androidのホーム画面追加に対応するには、180pxのApple Touch Iconや192px以上のマニフェストアイコンが必須です。" },
                    { q: "アップロードした画像はサーバーに送信されますか？", a: "一切送信されません。すべての画像変換、ICO生成、ZIP圧縮はブラウザ内部（ローカルメモリ）で安全に処理されます。" },
                    { q: "ZIPファイルには何が含まれますか？", a: "favicon.ico、favicon-16x16.png、favicon-32x32.png、favicon-48x48.png、apple-touch-icon.png、android-chrome-192x192.png、android-chrome-512x512.png、site.webmanifest が含まれます。" },
                    { q: "生成したファビコンをWebサイトにどう適用しますか？", a: "ZIPを展開したファイルをサイトのpublicまたはルートディレクトリに配置し、画面に表示されたHTMLコードを<head>タグ内に貼り付けてください。" },
                    { q: "アイコンに余白（パディング）を入れる理由は何ですか？", a: "ロゴが端いっぱいにあるとスマホの角丸マスクで切れたり窮屈に見えたりするため、8〜12%程度の余白を設けるときれいに仕上がります。" },
                    { q: "SVGファイルをアップロードしても変換できますか？", a: "はい、SVG、PNG、JPG、WEBPなどブラウザで表示可能なすべての画像形式に対応しています。" }
                  ],
                  relatedTitle: "関連画像ツール",
                  relatedTools: [
                    { title: "画像リサイズ", desc: "Web掲載やサムネイル向けに正確なピクセル幅・高さを一括調整", href: "/tools/image-resizer/" },
                    { title: "画像フォーマット変換", desc: "PNG、JPG、WEBP、AVIFなどをブラウザ内で高速相互変換", href: "/tools/image-converter/" },
                    { title: "画像透かし（ウォーターマーク）追加", desc: "ロゴや著作権テキストを透明度・パターン付きで一括挿入", href: "/tools/image-watermark/" },
                    { title: "EXIFメタデータ削除・閲覧", desc: "写真に含まれるGPS位置情報や撮影日時を安全に完全削除", href: "/tools/exif-remover/" }
                  ]
                },
                es: {
                  aboutTitle: "Acerca del Generador de Favicon e Iconos de Apps",
                  aboutDesc:
                    "Sube un solo logotipo o símbolo en alta resolución (PNG, SVG, JPG, WEBP) y genera en segundos un paquete completo de favicons e iconos para aplicaciones web y móviles (iOS, Android, Windows). Crea automáticamente tamaños estándar (16×16, 32×32, 48×48), favicon.ico multicapa, Apple Touch Icon (180×180), site.webmanifest para PWA, iconos para Android Chrome (192×192, 512×512) y el código HTML <head> listo para usar. Todo el renderizado y empaquetado ZIP se procesa 100% en tu navegador de forma segura.",
                  howTitle: "Cómo Generar e Instalar tu Paquete de Favicon",
                  steps: [
                    "Arrastra y suelta tu logotipo cuadrado en alta resolución (se recomienda 512×512px o superior).",
                    "Elige el color de fondo (transparente, blanco, oscuro, índigo) y la forma del icono (cuadrado, esquinas redondeadas, circular).",
                    "Ajusta el control deslizante de relleno interior (padding) para que tu símbolo se vea perfectamente equilibrado.",
                    "Revisa la vista previa en tiempo real para pestañas de navegador en modo oscuro y pantallas de inicio móvil.",
                    "Haz clic en 'Descargar paquete ZIP' y copia el código HTML <head> proporcionado en el encabezado de tu sitio web."
                  ],
                  featuresTitle: "Características Principales",
                  features: [
                    { title: "Generación Todo en Uno", desc: "Crea 6 tamaños PNG, favicon.ico binario multicapa y el archivo site.webmanifest en un solo clic." },
                    { title: "Vista Previa en Tiempo Real", desc: "Observa al instante cómo lucirá tu favicon en pestañas de Chrome/Safari y en la pantalla de inicio móvil." },
                    { title: "Personalización de Formas y Colores", desc: "Aplica fondos sólidos, máscaras circulares o esquinas redondeadas y márgenes a tu imagen." },
                    { title: "Código HTML <head> en 1 Clic", desc: "Copia directamente las etiquetas link y meta estandarizadas para pegarlas en tu proyecto web." }
                  ],
                  useCasesTitle: "Casos de Uso Populares",
                  useCases: [
                    { title: "Lanzamiento de Sitios Web y Blogs", desc: "Configuración esencial de favicons para WordPress, Webflow, Notion, blogs y sitios corporativos." },
                    { title: "Aplicaciones Web Progresivas (PWA)", desc: "Generación de iconos de alta resolución (192px/512px) y manifest para acceso directo móvil." },
                    { title: "Identidad de Marca y Startups", desc: "Verificación de legibilidad y contraste del logotipo en tamaños pequeños de 16×16 píxeles." },
                    { title: "Desarrollo Frontend", desc: "Automatización de recursos para la carpeta public en Next.js, Vite, React, Vue o Angular." }
                  ],
                  proTipsTitle: "Consejos Profesionales de Optimización",
                  proTips: [
                    { title: "Usa PNGs Transparentes en Alta Resolución", desc: "Comenzar con un PNG de más de 512px garantiza bordes limpios y sin pixelado al reducirse a 16px." },
                    { title: "Fondos Opacos para Iconos Móviles", desc: "En iOS y Android, las transparencias pueden mostrarse negras; usa un fondo de color corporativo con margen." },
                    { title: "Coloca siempre favicon.ico en la Raíz", desc: "Muchos motores de búsqueda y navegadores antiguos buscan /favicon.ico directamente sin leer el HTML." },
                    { title: "Forzar Actualización de Caché", desc: "Si cambias el icono y no se actualiza, añade una versión como <link rel=\"icon\" href=\"/favicon.ico?v=2\">." }
                  ],
                  faqTitle: "Preguntas Frecuentes (FAQ)",
                  faqs: [
                    { q: "¿Es suficiente tener solo un archivo favicon.ico?", a: "Para pestañas de escritorio básicas sí, pero para pantallas Retina, accesos directos en iOS y apps PWA se requieren iconos de 180×180 y 192×192+ para una visualización nítida." },
                    { q: "¿Se envían mis imágenes a algún servidor?", a: "No. Toda la generación gráfica, codificación ICO y compresión ZIP se realiza 100% de forma local en la memoria de tu navegador." },
                    { q: "¿Qué archivos incluye el archivo ZIP descargado?", a: "Incluye favicon.ico, favicon-16x16.png, favicon-32x32.png, favicon-48x48.png, apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png y site.webmanifest." },
                    { q: "¿Cómo instalo estos archivos en mi web?", a: "Extrae el ZIP en la carpeta raíz o public de tu proyecto y pega las etiquetas HTML proporcionadas dentro del tag <head> de tu web." },
                    { q: "¿Por qué se recomienda añadir relleno (padding)?", a: "Un margen del 8-12% evita que los bordes del logotipo queden cortados por los marcos redondeados de los dispositivos móviles." },
                    { q: "¿Puedo subir imágenes vectoriales SVG?", a: "Sí, admite SVG, PNG, JPG y WEBP, rasterizando y escalando automáticamente a todas las resoluciones requeridas." }
                  ],
                  relatedTitle: "Herramientas de Imagen Relacionadas",
                  relatedTools: [
                    { title: "Redimensionar Imagen", desc: "Ajuste preciso de ancho y alto en píxeles para optimización web", href: "/tools/image-resizer/" },
                    { title: "Convertidor de Formatos", desc: "Conversión ultrarrápida entre PNG, JPG, WEBP, AVIF y GIF", href: "/tools/image-converter/" },
                    { title: "Agregar Marca de Agua", desc: "Inserta logotipos y textos de copyright con opacidad y patrones", href: "/tools/image-watermark/" },
                    { title: "Eliminar Metadatos EXIF", desc: "Inspecciona y borra datos GPS y de cámara para máxima privacidad", href: "/tools/exif-remover/" }
                  ]
                },
                zh: {
                  aboutTitle: "关于 Favicon 与 PWA 应用图标生成器",
                  aboutDesc:
                    "只需上传一张高分辨率的 Logo 或图形文件（PNG、SVG、JPG、WEBP），即可在 1 秒内自动生成完美兼容现代 Web 标准、iOS Safari、Android Chrome 及桌面浏览器的全套图标资源包。包括多尺寸 PNG（16×16, 32×32, 48×48）、多层 favicon.ico、Apple Touch Icon（180×180）、PWA 应用配置文件（site.webmanifest）、Android 图标（192×192, 512×512）以及现成的 HTML <head> 代码。所有渲染与 ZIP 压缩均在本地浏览器中完成，确保绝对的隐私与资产安全。",
                  howTitle: "如何生成与安装网站 Favicon 图标包",
                  steps: [
                    "将正方形高分辨率 Logo 或图标（推荐 512×512px 或更高）拖放至上传区域。",
                    "选择背景样式（透明、白色、深色、靛蓝）与图标形状（方形、圆角、圆形）。",
                    "调整内部边距（Padding）滑块，使 Logo 居中且视觉比例协调，避免紧贴边缘。",
                    "在上方实时预览中查看深色标签页与手机主屏幕上的实际呈现效果。",
                    "点击“下载 ZIP 图标包”，复制提供的 HTML <head> 代码片段并粘贴到网站的顶部。"
                  ],
                  featuresTitle: "核心功能与亮点",
                  features: [
                    { title: "一键生成全套图标包", desc: "包含从 16px 到 512px 的 6 种 PNG、多层 favicon.ico 和 site.webmanifest 清单文件。" },
                    { title: "实时设备效果预览", desc: "即时预览在 Chrome/Safari 深色标签页及智能手机主屏幕上的实际显示状态。" },
                    { title: "灵活的背景与形状定制", desc: "支持透明背景、纯色背景合成、圆角裁切和圆形遮罩等多种设计风格。" },
                    { title: "一键复制 HTML Head 代码", desc: "提供标准规范的 link 与 meta 标签代码，一键复制即可直接集成到前端项目中。" }
                  ],
                  useCasesTitle: "常见应用场景",
                  useCases: [
                    { title: "新建网站与博客上线", desc: "为 WordPress、Notion、个人博客、企业官网快速配置标准网站图标" },
                    { title: "PWA 与移动 Web 应用", desc: "生成添加到主屏幕所需的高清图标（192px/512px）及 Web App Manifest" },
                    { title: "品牌升级与 Logo 可读性测试", desc: "验证新 Logo 在 16×16 微小分辨率和不同背景色下的辨识度" },
                    { title: "前端工程化资源自动化", desc: "为 Next.js、Vite、React、Vue 等项目的 public 静态目录一键生成资源包" }
                  ],
                  proTipsTitle: "Favicon 优化专业建议",
                  proTips: [
                    { title: "推荐使用高分辨率透明 PNG", desc: "使用 512px 以上的透明 PNG 作为原图，缩放至 16px 时能保持出色的抗锯齿与边缘清晰度。" },
                    { title: "手机图标建议使用不透明背景", desc: "iOS 和 Android 主屏幕可能会将透明背景填充为黑色，建议使用品牌纯色背景并保留适当边距。" },
                    { title: "根目录必须放置 favicon.ico", desc: "许多搜索引擎爬虫和旧版浏览器会直接请求 /favicon.ico 而不解析 HTML 标签。" },
                    { title: "更新图标时的缓存刷新技巧", desc: "如果更换图标后未立即生效，可在代码中添加版本号如 <link rel=\"icon\" href=\"/favicon.ico?v=2\">。" }
                  ],
                  faqTitle: "常见问题解答 (FAQ)",
                  faqs: [
                    { q: "网站只放置一个 favicon.ico 文件够用吗？", a: "对于基本的桌面浏览器标签页足够，但对于 Retina 高清屏书签、iOS 添加到主屏幕以及 PWA 安装，必须提供 180×180 Apple Touch Icon 和 192×192 以上的 Manifest 图标才能完美显示。" },
                    { q: "我上传的 Logo 会被保存到服务器吗？", a: "完全不会。所有的 Canvas 图形渲染、ICO 编码与 ZIP 打包都在您的浏览器内存中 100% 本地运行，绝无隐私泄露风险。" },
                    { q: "下载的 ZIP 压缩包中包含哪些文件？", a: "包含 favicon.ico、favicon-16x16.png、favicon-32x32.png、favicon-48x48.png、apple-touch-icon.png、android-chrome-192x192.png、android-chrome-512x512.png 以及 site.webmanifest。" },
                    { q: "如何将生成的图标应用到我的网站中？", a: "解压 ZIP 文件后将所有文件放入项目的 public 或根目录，然后将页面上生成的 HTML 代码复制并粘贴到网页的 <head> 区域即可。" },
                    { q: "为什么建议在图标周围添加边距（Padding）？", a: "保留 8%~12% 的内边距可以防止 Logo 贴边，并在手机圆角图标裁切时保持优雅的视觉留白。" },
                    { q: "支持上传 SVG 矢量图吗？", a: "支持。您可以上传 SVG、PNG、JPG 或 WEBP 等所有主流格式，工具会自动将其栅格化为各分辨率的高清位图。" }
                  ],
                  relatedTitle: "相关图像处理工具",
                  relatedTools: [
                    { title: "图片尺寸调整", desc: "按精确像素宽高与比例调整图片大小，优化网络加载速度", href: "/tools/image-resizer/" },
                    { title: "图片格式转换器", desc: "在 PNG、JPG、WEBP、AVIF 及 GIF 之间进行高保真快速转换", href: "/tools/image-converter/" },
                    { title: "图片添加水印", desc: "批量为图片添加文字或 Logo 水印，支持透明度与平铺模式", href: "/tools/image-watermark/" },
                    { title: "EXIF 元数据查看与清除", desc: "一键彻底删除照片中的 GPS 定位、拍摄相机与时间等隐私信息", href: "/tools/exif-remover/" }
                  ]
                },
                fr: {
                  aboutTitle: "À propos du Générateur de Favicon & Icônes d'Apps",
                  aboutDesc:
                    "Téléversez un simple logo ou symbole en haute résolution (PNG, SVG, JPG, WEBP) pour générer instantanément une suite complète de favicons et d'icônes d'applications pour le Web, iOS et Android. Crée automatiquement les tailles standard (16×16, 32×32, 48×48), le favicon.ico multicouche, l'Apple Touch Icon (180×180), le fichier site.webmanifest pour PWA, les icônes Android Chrome (192×192, 512×512) et le code HTML <head> prêt à intégrer. Tous les rendus et la compression ZIP s'exécutent 100% localement dans votre navigateur en toute confidentialité.",
                  howTitle: "Comment Générer et Installer vos Favicons",
                  steps: [
                    "Glissez-déposez votre logo carré haute résolution (512×512px ou plus recommandé).",
                    "Choisissez la couleur d'arrière-plan (transparent, blanc, sombre, indigo) et la forme de l'icône (carré, coins arrondis, cercle).",
                    "Ajustez le curseur de marge interne (padding) pour équilibrer parfaitement votre logo.",
                    "Vérifiez l'aperçu en temps réel dans l'onglet de navigateur en mode sombre et sur l'écran d'accueil mobile.",
                    "Cliquez sur 'Télécharger le pack ZIP' et copiez le code HTML <head> fourni dans l'en-tête de votre site web."
                  ],
                  featuresTitle: "Fonctionnalités Principales",
                  features: [
                    { title: "Génération Tout-en-Un", desc: "Crée 6 fichiers PNG, un favicon.ico binaire multicouche et le fichier site.webmanifest en 1 clic." },
                    { title: "Aperçu Visuel en Direct", desc: "Visualisez immédiatement le rendu sur les onglets de navigateur et sur l'écran d'accueil d'un smartphone." },
                    { title: "Personnalisation des Formes et Couleurs", desc: "Appliquez des fonds colorés, des masques circulaires ou des coins arrondis selon vos besoins." },
                    { title: "Extrait de Code HTML en 1 Clic", desc: "Obtenez des balises link et meta standardisées prêtes à être collées dans votre projet." }
                  ],
                  useCasesTitle: "Cas d'Utilisation Fréquents",
                  useCases: [
                    { title: "Lancement de Sites Web et Blogs", desc: "Configuration complète des favicons pour WordPress, Webflow, Notion, blogs et sites d'entreprise." },
                    { title: "PWA et Applications Mobiles", desc: "Génération d'icônes haute définition (192px/512px) et manifest pour l'ajout à l'écran d'accueil." },
                    { title: "Identité de Marque et Startups", desc: "Test de lisibilité et de contraste du logo sur de très petites résolutions (16×16)." },
                    { title: "Développement Frontend", desc: "Automatisation des assets pour le dossier public de Next.js, Vite, React, Vue ou Angular." }
                  ],
                  proTipsTitle: "Conseils d'Optimisation Professionnels",
                  proTips: [
                    { title: "Utilisez un PNG Transparent Haute Définition", desc: "Partir d'un PNG 512px+ assure des contours nets et un anti-crénelage parfait lors de la réduction à 16px." },
                    { title: "Fond Opaque pour les Icônes Mobiles", desc: "Sur iOS et Android, la transparence peut devenir noire ; préférez un fond plein aux couleurs de votre marque." },
                    { title: "Placez toujours favicon.ico à la Racine", desc: "De nombreux robots d'indexation et anciens navigateurs cherchent /favicon.ico sans lire les balises HTML." },
                    { title: "Forcer le Rafraîchissement du Cache", desc: "Si l'icône ne change pas, ajoutez une version dans le lien : <link rel=\"icon\" href=\"/favicon.ico?v=2\">." }
                  ],
                  faqTitle: "Foire Aux Questions (FAQ)",
                  faqs: [
                    { q: "Un seul fichier favicon.ico est-il suffisant ?", a: "Pour les onglets de bureau basiques oui, mais les écrans Retina, les raccourcis iOS et les PWA exigent des icônes de 180×180 et 192×192+ pour un affichage net." },
                    { q: "Mes images sont-elles envoyées sur un serveur ?", a: "Non. Toute la manipulation Canvas, l'encodage ICO et la création du fichier ZIP sont exécutés à 100% dans la mémoire locale de votre navigateur." },
                    { q: "Quels fichiers sont inclus dans l'archive ZIP ?", a: "Elle contient favicon.ico, favicon-16x16.png, favicon-32x32.png, favicon-48x48.png, apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png et site.webmanifest." },
                    { q: "Comment intégrer ces fichiers à mon site web ?", a: "Décompressez le ZIP dans le répertoire public ou racine de votre projet et collez l'extrait HTML fourni dans la balise <head> de vos pages." },
                    { q: "Pourquoi ajouter une marge interne (padding) ?", a: "Une marge de 8 à 12% empêche le logo de toucher les bords et évite qu'il ne soit tronqué par les masques arrondis des smartphones." },
                    { q: "Puis-je téléverser des fichiers SVG ?", a: "Oui, les formats SVG, PNG, JPG et WEBP sont acceptés et automatiquement convertis en images matricielles de haute qualité." }
                  ],
                  relatedTitle: "Outils d'Image Complémentaires",
                  relatedTools: [
                    { title: "Redimensionner une Image", desc: "Ajustez précisément la largeur et la hauteur en pixels pour le web", href: "/tools/image-resizer/" },
                    { title: "Convertisseur de Formats d'Image", desc: "Convertissez instantanément entre PNG, JPG, WEBP, AVIF et GIF", href: "/tools/image-converter/" },
                    { title: "Ajouter un Filigrane (Watermark)", desc: "Insérez logos et textes de copyright avec transparence et motifs", href: "/tools/image-watermark/" },
                    { title: "Supprimer les Métadonnées EXIF", desc: "Inspectez et effacez les coordonnées GPS et données de prise de vue", href: "/tools/exif-remover/" }
                  ]
                }
              };

              const active = content[locale as keyof typeof content] || content.en;

              return (
                <ToolGuide
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
                    tips: active.proTips.map((p: any) =>
                      typeof p === "string" ? p : `${p.title} — ${p.desc}`
                    ),
                  }}
                  faqs={active.faqs}
                  relatedTools={active.relatedTools}
                />
              );
            })()}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
