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
  Stamp,
  Type,
  Image as ImageIcon,
  Grid,
  RotateCw,
  Eye,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Layers,
  Sliders,
  Trash2
} from "lucide-react";

type PositionMode = "center" | "tile" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export default function ImageWatermarkPage() {
  const { t } = useLocale();

  // Source Image State
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState<string>("");

  // Watermark Mode State
  const [mode, setMode] = useState<"text" | "logo">("text");

  // Text Watermark Settings
  const [watermarkText, setWatermarkText] = useState<string>("© desktools.run");
  const [fontFamily, setFontFamily] = useState<string>("Inter, sans-serif");
  const [fontSize, setFontSize] = useState<number>(36);
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [textOpacity, setTextOpacity] = useState<number>(0.65);
  const [textRotation, setTextRotation] = useState<number>(-30);

  // Logo Watermark Settings
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [logoScale, setLogoScale] = useState<number>(0.25);
  const [logoOpacity, setLogoOpacity] = useState<number>(0.75);
  const [logoRotation, setLogoRotation] = useState<number>(0);

  // Position & Output Settings
  const [position, setPosition] = useState<PositionMode>("tile");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("png");

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle Main Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImageName(file.name);

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

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setLogoImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Render Canvas Watermark
  const drawWatermark = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = sourceImage.naturalWidth;
    canvas.height = sourceImage.naturalHeight;

    // Draw Source Image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sourceImage, 0, 0);

    const width = canvas.width;
    const height = canvas.height;

    // TEXT WATERMARK DRAWING
    if (mode === "text" && watermarkText.trim().length > 0) {
      ctx.save();
      ctx.globalAlpha = textOpacity;
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      const metrics = ctx.measureText(watermarkText);
      const textWidth = metrics.width;
      const textHeight = fontSize * 1.2;

      if (position === "tile") {
        const stepX = Math.max(textWidth * 1.8, 160);
        const stepY = Math.max(textHeight * 2.8, 120);

        ctx.rotate((textRotation * Math.PI) / 180);

        const diag = Math.sqrt(width * width + height * height);
        for (let x = -diag; x < diag * 2; x += stepX) {
          for (let y = -diag; y < diag * 2; y += stepY) {
            ctx.fillText(watermarkText, x, y);
          }
        }
      } else {
        let posX = width / 2;
        let posY = height / 2;
        const padding = Math.max(width * 0.04, 20);

        if (position === "top-left") {
          posX = padding + textWidth / 2;
          posY = padding + textHeight / 2;
        } else if (position === "top-right") {
          posX = width - padding - textWidth / 2;
          posY = padding + textHeight / 2;
        } else if (position === "bottom-left") {
          posX = padding + textWidth / 2;
          posY = height - padding - textHeight / 2;
        } else if (position === "bottom-right") {
          posX = width - padding - textWidth / 2;
          posY = height - padding - textHeight / 2;
        }

        ctx.translate(posX, posY);
        ctx.rotate((textRotation * Math.PI) / 180);
        ctx.fillText(watermarkText, 0, 0);
      }

      ctx.restore();
    }

    // LOGO WATERMARK DRAWING
    if (mode === "logo" && logoImage) {
      ctx.save();
      ctx.globalAlpha = logoOpacity;

      const logoW = sourceImage.naturalWidth * logoScale;
      const logoH = (logoImage.naturalHeight / logoImage.naturalWidth) * logoW;

      if (position === "tile") {
        const stepX = Math.max(logoW * 2.0, 180);
        const stepY = Math.max(logoH * 2.0, 160);

        ctx.rotate((logoRotation * Math.PI) / 180);
        const diag = Math.sqrt(width * width + height * height);

        for (let x = -diag; x < diag * 2; x += stepX) {
          for (let y = -diag; y < diag * 2; y += stepY) {
            ctx.drawImage(logoImage, x - logoW / 2, y - logoH / 2, logoW, logoH);
          }
        }
      } else {
        let posX = width / 2;
        let posY = height / 2;
        const padding = Math.max(width * 0.04, 20);

        if (position === "top-left") {
          posX = padding + logoW / 2;
          posY = padding + logoH / 2;
        } else if (position === "top-right") {
          posX = width - padding - logoW / 2;
          posY = padding + logoH / 2;
        } else if (position === "bottom-left") {
          posX = padding + logoW / 2;
          posY = height - padding - logoH / 2;
        } else if (position === "bottom-right") {
          posX = width - padding - logoW / 2;
          posY = height - padding - logoH / 2;
        }

        ctx.translate(posX, posY);
        ctx.rotate((logoRotation * Math.PI) / 180);
        ctx.drawImage(logoImage, -logoW / 2, -logoH / 2, logoW, logoH);
      }

      ctx.restore();
    }
  }, [
    sourceImage,
    mode,
    watermarkText,
    fontFamily,
    fontSize,
    textColor,
    textOpacity,
    textRotation,
    logoImage,
    logoScale,
    logoOpacity,
    logoRotation,
    position,
  ]);

  useEffect(() => {
    drawWatermark();
  }, [drawWatermark]);

  // Download Watermarked Image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mime = outputFormat === "jpeg" ? "image/jpeg" : outputFormat === "webp" ? "image/webp" : "image/png";
    const dataUrl = canvas.toDataURL(mime, 0.92);

    const baseName = imageName.substring(0, imageName.lastIndexOf(".")) || "image";
    const filename = `${baseName}_watermarked.${outputFormat}`;

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };



  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Header Breadcrumb & Title */}
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
            {t("imageWatermark.back")}
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "rgba(52,211,153,0.15)",
                border: "1px solid rgba(52,211,153,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#34d399",
              }}
            >
              <Stamp size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                {t("imageWatermark.title")}
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                {t("imageWatermark.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Main Workspace Grid */}
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
                  background: "rgba(99,102,241,0.15)",
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
                {t("imageWatermark.uploadTitle")}
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 20px" }}>
                {t("imageWatermark.uploadDesc")}
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
                {t("imageWatermark.selectFile")}
              </button>
            </div>
          ) : (
            /* Studio Layout: Controls + Preview */
            <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 380px) 1fr", gap: "24px" }}>
              {/* Controls Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Image Info & Reset */}
                <div className="glass-card" style={{ padding: "18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {imageName}
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

                {/* Mode Selector */}
                <div className="glass-card" style={{ padding: "18px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", display: "block" }}>
                    {t("imageWatermark.watermarkType")}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button
                      onClick={() => setMode("text")}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        background: mode === "text" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.04)",
                        border: mode === "text" ? "none" : "1px solid var(--border-subtle)",
                        color: mode === "text" ? "white" : "var(--text-secondary)",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Type size={15} />
                      {t("imageWatermark.textMode")}
                    </button>

                    <button
                      onClick={() => setMode("logo")}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        background: mode === "logo" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.04)",
                        border: mode === "logo" ? "none" : "1px solid var(--border-subtle)",
                        color: mode === "logo" ? "white" : "var(--text-secondary)",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <ImageIcon size={15} />
                      {t("imageWatermark.logoMode")}
                    </button>
                  </div>
                </div>

                {/* Text Controls */}
                {mode === "text" && (
                  <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", display: "block" }}>
                        {t("imageWatermark.textLabel")}
                      </label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="© desktools.run"
                        style={{
                          width: "100%",
                          height: "40px",
                          borderRadius: "8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-subtle)",
                          padding: "0 12px",
                          color: "var(--text-primary)",
                          fontSize: "14px",
                        }}
                      />
                    </div>

                    {/* Font Family & Size */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                          {t("imageWatermark.font")}
                        </label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          style={{
                            width: "100%",
                            height: "36px",
                            borderRadius: "6px",
                            background: "var(--input-bg)",
                            border: "1px solid var(--border-subtle)",
                            padding: "0 8px",
                            color: "var(--text-primary)",
                            fontSize: "12.5px",
                          }}
                        >
                          <option value="Inter, sans-serif">Inter (Modern)</option>
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="Georgia, serif">Georgia (Serif)</option>
                          <option value="'Courier New', monospace">Courier (Monospace)</option>
                          <option value="'Brush Script MT', cursive">Cursive (Signature)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                          {t("imageWatermark.size")}: {fontSize}px
                        </label>
                        <input
                          type="range"
                          min={12}
                          max={120}
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#6366f1" }}
                        />
                      </div>
                    </div>

                    {/* Color & Opacity */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                          {t("imageWatermark.color")}
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              background: "none",
                            }}
                          />
                          <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                            {textColor}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                          {t("imageWatermark.opacity")}: {Math.round(textOpacity * 100)}%
                        </label>
                        <input
                          type="range"
                          min={0.05}
                          max={1.0}
                          step={0.05}
                          value={textOpacity}
                          onChange={(e) => setTextOpacity(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#6366f1" }}
                        />
                      </div>
                    </div>

                    {/* Rotation */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                        <span>{t("imageWatermark.rotation")}</span>
                        <span>{textRotation}°</span>
                      </div>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        value={textRotation}
                        onChange={(e) => setTextRotation(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#6366f1" }}
                      />
                    </div>
                  </div>
                )}

                {/* Logo Controls */}
                {mode === "logo" && (
                  <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {!logoImage ? (
                      <div style={{ textAlign: "center", padding: "16px 0" }}>
                        <label
                          className="btn-secondary"
                          style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Upload size={14} />
                          {t("imageWatermark.uploadLogo")}
                          <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                        </label>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {t("imageWatermark.logoSettings")}
                          </span>
                          <button
                            onClick={() => setLogoImage(null)}
                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <Trash2 size={12} />
                            {t("imageWatermark.remove")}
                          </button>
                        </div>

                        {/* Scale & Opacity */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                              {t("imageWatermark.scale")}: {Math.round(logoScale * 100)}%
                            </label>
                            <input
                              type="range"
                              min={0.05}
                              max={1.0}
                              step={0.05}
                              value={logoScale}
                              onChange={(e) => setLogoScale(Number(e.target.value))}
                              style={{ width: "100%", accentColor: "#6366f1" }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                              {t("imageWatermark.opacity")}: {Math.round(logoOpacity * 100)}%
                            </label>
                            <input
                              type="range"
                              min={0.05}
                              max={1.0}
                              step={0.05}
                              value={logoOpacity}
                              onChange={(e) => setLogoOpacity(Number(e.target.value))}
                              style={{ width: "100%", accentColor: "#6366f1" }}
                            />
                          </div>
                        </div>

                        {/* Rotation */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                            <span>{t("imageWatermark.rotation")}</span>
                            <span>{logoRotation}°</span>
                          </div>
                          <input
                            type="range"
                            min={-180}
                            max={180}
                            value={logoRotation}
                            onChange={(e) => setLogoRotation(Number(e.target.value))}
                            style={{ width: "100%", accentColor: "#6366f1" }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Position & Pattern Selector */}
                <div className="glass-card" style={{ padding: "18px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", display: "block" }}>
                    {t("imageWatermark.position")}
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                    <button
                      onClick={() => setPosition("tile")}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "6px",
                        background: position === "tile" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                        border: position === "tile" ? "1px solid #818cf8" : "1px solid var(--border-subtle)",
                        color: position === "tile" ? "#818cf8" : "var(--text-secondary)",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Grid size={14} />
                      {t("imageWatermark.tilePattern")}
                    </button>

                    {[
                      { id: "top-left", label: "↖ Top Left" },
                      { id: "center", label: "• Center" },
                      { id: "top-right", label: "↗ Top Right" },
                      { id: "bottom-left", label: "↙ Bottom Left" },
                      { id: "center", label: "Center" },
                      { id: "bottom-right", label: "↘ Bottom Right" },
                    ].map((pos, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPosition(pos.id as PositionMode)}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          background: position === pos.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                          border: position === pos.id ? "1px solid #818cf8" : "1px solid var(--border-subtle)",
                          color: position === pos.id ? "#818cf8" : "var(--text-secondary)",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export Options */}
                <div className="glass-card" style={{ padding: "18px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", display: "block" }}>
                    {t("imageWatermark.exportFormat")}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "14px" }}>
                    {(["png", "jpeg", "webp"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setOutputFormat(fmt)}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          background: outputFormat === fmt ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.04)",
                          border: outputFormat === fmt ? "none" : "1px solid var(--border-subtle)",
                          color: outputFormat === fmt ? "white" : "var(--text-secondary)",
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

                  <button
                    onClick={handleDownload}
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
                      boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                    }}
                  >
                    <Download size={16} />
                    {t("imageWatermark.download")}
                  </button>
                </div>
              </div>

              {/* Live Canvas Preview Column */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Eye size={16} style={{ color: "#818cf8" }} />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {t("imageWatermark.preview")}
                    </span>
                  </div>
                  <span style={{ fontSize: "11.5px", color: "#34d399", background: "rgba(52,211,153,0.12)", padding: "2px 8px", borderRadius: "100px", fontWeight: 600 }}>
                    100% Client-Side
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    minHeight: "420px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "12px",
                    border: "1px solid var(--border-subtle)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "auto",
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "560px",
                      borderRadius: "8px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SEO Guide Section */}
        <div style={{ maxWidth: "1280px", margin: "40px auto 0", padding: "0 24px" }}>
          <ToolGuide
            badgeText={t("imageWatermark.guideBadge")}
            aboutTitle={t("imageWatermark.guide.aboutTitle")}
            aboutDesc={t("imageWatermark.guide.aboutDesc")}
            howTitle={t("imageWatermark.guide.howTitle")}
            steps={[
              t("imageWatermark.guide.step1"),
              t("imageWatermark.guide.step2"),
              t("imageWatermark.guide.step3"),
              t("imageWatermark.guide.step4"),
            ]}
            faqs={[
              {
                q: t("imageWatermark.guide.faq1Q"),
                a: t("imageWatermark.guide.faq1A"),
              },
              {
                q: t("imageWatermark.guide.faq2Q"),
                a: t("imageWatermark.guide.faq2A"),
              },
            ]}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
