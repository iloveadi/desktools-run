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
  const { t, locale } = useLocale();

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

        {/* SEO Guide Section (Full 6-Language Support) */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "브라우저 네이티브 고화질 이미지 워터마크 추가기",
              aboutDesc: "HTML5 Canvas 2D 렌더링 엔진을 활용하여 사진 위에 텍스트 서명이나 브랜드 로고 워터마크를 투명도, 회전 각도, 격자 패턴(타일 반복)과 함께 실시간으로 합성합니다. 모든 이미지 합성 처리가 사용자의 브라우저 메모리 안에서 100% 로컬로 구동되므로, 소중한 사진 자산이 외부 서버로 유출될 염려 없이 안전하게 저작권을 보호할 수 있습니다.",
              howTitle: "단계별 워터마크 삽입 방법",
              steps: [
                "워터마크를 추가할 원본 사진을 드래그앤드롭하거나 클릭하여 불러옵니다 (PNG, JPG, WEBP, BMP 등 지원).",
                "상단 탭에서 '텍스트 워터마크' 또는 '로고 이미지 워터마크' 모드를 선택합니다.",
                "폰트 서체, 글자 크기, 색상, 투명도(Opacity), 회전 각도(Rotation) 및 로고 배율을 자유롭게 조절합니다.",
                "워터마크 위치(중앙, 모서리 4방향 또는 화면 전체 격자 타일 반복)를 지정합니다.",
                "실시간 캔버스 미리보기로 결과를 확인한 후 원하는 포맷(PNG / JPG / WEBP)으로 즉시 다운로드합니다.",
              ],
              featuresTitle: "워터마크 생성기 핵심 엔지니어링 기능",
              features: [
                { title: "텍스트 & 로고 듀얼 합성 엔진", desc: "원하는 문구 서명 입력 또는 투명 PNG 로고 이미지를 업로드하여 정교하게 워터마크를 각인합니다." },
                { title: "화면 전체 격자 타일 패턴 (Full Tile Matrix)", desc: "도용 방지를 위해 사진 전면에 대각선으로 반복 배치되는 격자형 워터마크를 1클릭으로 적용합니다." },
                { title: "정밀 투명도 및 회전 각도 컨트롤", desc: "시각적 방해를 최소화하는 미세 투명도(0~100%)와 360도 자유 회전 각도를 지원합니다." },
                { title: "100% 로컬 프라이버시 샌드박스 (Zero Upload)", desc: "단 1바이트의 원본 사진 데이터도 원격 서버로 전송되지 않아 완벽한 저작권 보안을 보증합니다." },
              ],
              useCasesTitle: "실무 추천 활용 시나리오",
              useCases: [
                { icon: "📸", title: "전문 작가 사진 & 포트폴리오 저작권 보호", desc: "개인 촬영 사진이나 작품 포트폴리오에 작가 서명과 저작권(©) 표기를 넣어 무단 불펌을 방지합니다." },
                { icon: "🛍️", title: "쇼핑몰 상품 상세페이지 및 썸네일 브랜딩", desc: "스마트스토어, 쿠팡 상품 컷에 브랜드 로고를 자연스럽게 합성하여 타사 카피를 방지합니다." },
                { icon: "📄", title: "기업 대외비·사내 기밀 문서 'CONFIDENTIAL' 각인", desc: "계약서 초안이나 기밀 디자인 시안에 '대외비 / 기밀' 대각선 격자 워터마크를 빠르게 입힙니다." },
                { icon: "📱", title: "인스타그램 & 블로그 인플루언서 워터마크", desc: "SNS 콘텐츠 이미지에 채널 아이디나 심볼 마크를 깔끔하게 삽입하여 브랜딩을 강화합니다." },
              ],
              proTipsTitle: "전문가 워터마크 디자인 노하우",
              proTips: [
                "도용 방지 효과를 극대화하려면 '격자 타일(Tile)' 배치와 '-30도 회전' 설정을 조합하는 것이 가장 효과적입니다.",
                "투명도를 20%~35% 수준으로 맞추면 사진의 본래 피사체를 가리지 않으면서도 확실한 저작권 보호 효과를 얻을 수 있습니다.",
                "로고 워터마크를 사용할 때는 배경이 투명한 PNG 파일을 업로드해야 가장 깔끔한 합성 결과물이 나옵니다.",
                "웹사이트 게재용으로는 용량이 가볍고 화질이 뛰어난 'WEBP' 포맷으로 다운로드하는 것을 추천합니다.",
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "워터마크를 합성할 때 사진이 서버에 업로드되나요?", a: "전혀 업로드되지 않습니다! desktools.run의 모든 이미지 합성 로직은 사용자의 웹 브라우저 메모리 안에서 100% 로컬로 실행됩니다." },
                { q: "화면 전체에 바둑판식으로 반복되는 워터마크를 넣을 수 있나요?", a: "네! 위치 옵션에서 '격자 타일 (Tile)'을 선택하시면 사진 전면에 대각선으로 반복되는 도용 방지 패턴이 자동 생성됩니다." },
                { q: "투명 배경의 PNG 로고도 워터마크로 올릴 수 있나요?", a: "네! 로고 모드에서 투명 PNG 이미지를 업로드하시면 알파 투명도가 완벽하게 유지된 상태로 합성됩니다." },
                { q: "합성 후 원본 사진의 해상도나 화질이 떨어지나요?", a: "아닙니다. 원본 이미지의 픽셀 해상도를 1:1로 유지한 캔버스에서 렌더링되므로 화질 저하가 없습니다." },
                { q: "모바일 스마트폰(아이폰/안드로이드)에서도 사용 가능한가요?", a: "네! 모바일 웹 브라우저(Safari, Chrome)에서 터치 인터페이스로 편리하게 이용하실 수 있습니다." },
                { q: "이용 요금이나 워터마크 생성 개수에 제한이 있나요?", a: "완전 100% 무료이며 이용 횟수 제한이나 강제 자체 워터마크가 전혀 없습니다." },
              ],
              relatedToolsTitle: "함께 쓰면 좋은 연관 도구",
              relatedTools: [
                { title: "이미지 용량 압축기 (Image Compress)", desc: "워터마크가 합성된 이미지의 파일 용량을 최대 80% 가볍게 줄입니다.", href: "/tools/image-compress/" },
                { title: "이미지 크기 조절 (Image Resizer)", desc: "이미지 해상도(픽셀/%)를 원하는 규격으로 자유롭게 조절합니다.", href: "/tools/image-resizer/" },
                { title: "배경 제거기 (Background Remover)", desc: "AI로 로고 이미지의 배경을 깔끔하게 제거하여 투명 로고로 만듭니다.", href: "/tools/background-remover/" },
                { title: "이미지 포맷 변환기 (Image Converter)", desc: "합성된 이미지를 PNG, JPG, WebP, ICO 등으로 상호 변환합니다.", href: "/tools/image-converter/" },
              ],
            },
            ja: {
              aboutTitle: "ブラウザネイティブ高画質画像透かし（ウォーターマーク）追加ツール",
              aboutDesc: "HTML5 Canvas 2D描画エンジンを活用し、写真にテキスト署名やブランドロゴの透かしを透明度、回転角度、タイル格子パターンとともにリアルタイム合成します。すべての処理がお使いのブラウザメモリ内で100%ローカルに完結するため、大切な画像資産の著作権を安全に保護できます。",
              howTitle: "ステップ別のご利用手順",
              steps: [
                "ウォーターマークを入れたい元画像をドラッグ＆ドロップまたはクリックして読み込みます（PNG、JPG、WEBP、BMPなどに対応）。",
                "上部タブから「テキスト透かし」または「ロゴ画像透かし」モードを選択します。",
                "フォント、文字サイズ、色、透明度（Opacity）、回転角度（Rotation）、ロゴ倍率を自由に調整します。",
                "配置位置（中央、四隅、または画面全体の格子タイルパターン）を指定します。",
                "リアルタイムプレビューで仕上がりを確認し、希望のフォーマット（PNG / JPG / WEBP）で保存します。",
              ],
              featuresTitle: "ウォーターマーク追加ツールの主な特徴",
              features: [
                { title: "テキスト＆ロゴのデュアル合成エンジン", desc: "著作権テキストの直接入力や透過PNGロゴの配置に対応し、自由自在に透かしを入れられます。" },
                { title: "画面全体の格子タイルパターン（Full Tile Matrix）", desc: "無断転載・不正コピーを強力に防止するため、斜め配置の連続パターン透かしを1クリックで適用します。" },
                { title: "精密な透明度＆360度回転コントロール", desc: "被写体の視認性を損なわない微細な透過率調整と自由な角度回転に対応。" },
                { title: "完全ローカル・安心プライバシー（Zero Server Upload）", desc: "画像データが外部サーバーへ送信されることはなく、端末内で安全に処理されます。" },
              ],
              useCasesTitle: "実務での活用シーン",
              useCases: [
                { icon: "📸", title: "写真家・クリエイターの作品著作権保護", desc: "ポートフォリオやSNS投稿写真に©コピーライト表記を合成し、無断使用を防止します。" },
                { icon: "🛍️", title: "ECサイト・ネットショップの商品画像ブランディング", desc: "商品写真にショップロゴを配置し、他社による画像盗用や転載をシャットアウトします。" },
                { icon: "📄", title: "社外秘・機密書類への「CONFIDENTIAL」透かし合成", desc: "契約書案や企画書画像に社外秘スタンプを素早く斜め格子で刻印します。" },
                { icon: "📱", title: "SNSインフルエンサーの投稿ブランディング", desc: "Instagramやブログの写真にアカウントIDやロゴマークを美しく挿入します。" },
              ],
              proTipsTitle: "専門家による透かしデザインのヒント",
              proTips: [
                "盗用防止効果を最大化するには「格子タイル（Tile）」配置と「-30度回転」の組み合わせが最も効果的です。",
                "透明度を20%〜35%に設定すると、写真本来の魅力を損なわずにしっかりとした透かし効果が得られます。",
                "ロゴを使用する場合は、背景が透明なPNG画像をアップロードすると最も自然に仕上がります。",
                "Webサイト用には、高画質で軽量な「WEBP形式」での保存がおすすめです。",
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "透かし合成時に写真がサーバーに送信されますか？", a: "一切送信されません！すべての処理はお使いの端末のブラウザメモリ内でのみローカル実行されます。" },
                { q: "画像全体に斜めで繰り返すパターン透かしは可能ですか？", a: "はい！配置設定で「格子タイル (Tile)」を選択すると、全体に斜め連続透かしが自動生成されます。" },
                { q: "透過PNGロゴを透かしとして読み込めますか？", a: "はい！ロゴモードで透過PNGを選択すると、透明度を維持したまま綺麗に合成されます。" },
                { q: "合成後に元画像の解像度や画質が低下しますか？", a: "低下しません。元画像のピクセル解像度を100%維持したままレンダリング出力されます。" },
                { q: "スマートフォン（iPhone/Android）でも使えますか？", a: "はい！スマホのブラウザからアプリ不要で快適にご利用いただけます。" },
                { q: "利用料金や透かし作成回数の制限はありますか？", a: "完全無料・無制限です。透かしロゴの強制挿入や会員登録もありません。" },
              ],
              relatedToolsTitle: "関連する便利なツール",
              relatedTools: [
                { title: "画像圧縮 (Image Compress)", desc: "透かし入り画像のファイルサイズを最大80%軽量化します。", href: "/tools/image-compress/" },
                { title: "画像リサイザー (Image Resizer)", desc: "画像の解像度（px/%）を自由に変更・調整します。", href: "/tools/image-resizer/" },
                { title: "背景削除 (Background Remover)", desc: "AIでロゴ画像の背景を消して透過PNGロゴを作成します。", href: "/tools/background-remover/" },
                { title: "画像フォーマット変換 (Image Converter)", desc: "透かし入り画像をPNG、JPG、WEBP、ICO形式に変換します。", href: "/tools/image-converter/" },
              ],
            },
            es: {
              aboutTitle: "Añadir marca de agua a imágenes de alta definición en el navegador",
              aboutDesc: "Añade firmas de texto o marcas de agua con logotipos a tus fotografías con control total de opacidad, ángulo de rotación y patrones en mosaico utilizando la API HTML5 Canvas. Todo el procesamiento se realiza al 100% en la memoria de tu navegador, garantizando máxima velocidad y total privacidad para tus derechos de autor.",
              howTitle: "Guía de uso paso a paso",
              steps: [
                "Arrastra y suelta o selecciona tu imagen original (compatible con PNG, JPG, WEBP, BMP).",
                "Selecciona el modo 'Marca de agua de texto' o 'Logotipo de imagen'.",
                "Ajusta la tipografía, tamaño, color, opacidad (0~100%), rotación y escala del logotipo.",
                "Elige la posición deseada (Centro, Esquinas o Mosaico en cuadrícula completa).",
                "Revisa la vista previa en tiempo real y descarga tu imagen en formato PNG, JPG o WEBP.",
              ],
              featuresTitle: "Características principales",
              features: [
                { title: "Motor dual de Texto y Logotipo", desc: "Inserta firmas tipográficas personalizadas o estampa logotipos PNG transparentes con total nitidez." },
                { title: "Patrón en mosaico continuo (Full Tile Matrix)", desc: "Protege tus fotos contra robos cubriendo toda la imagen con marcas de agua diagonales repetidas." },
                { title: "Control preciso de opacidad y rotación", desc: "Ajusta la sutileza visual con opacidades finas y rotación libre de 360 grados." },
                { title: "Privacidad 100% local (Sin subidas a servidores)", desc: "Tus fotos nunca salen de tu ordenador, asegurando total confidencialidad." },
              ],
              useCasesTitle: "Casos prácticos de uso",
              useCases: [
                { icon: "📸", title: "Protección de derechos de autor para fotógrafos", desc: "Añade tu firma artística y el símbolo © para evitar el uso no autorizado en internet." },
                { icon: "🛍️", title: "Branding de productos para e-commerce y tiendas online", desc: "Estampa el logotipo de tu marca en las fotos de catálogo para evitar copias de la competencia." },
                { icon: "📄", title: "Marcado de documentos confidenciales", desc: "Aplica sellos diagonales de 'CONFIDENCIAL' en bocetos y archivos corporativos." },
                { icon: "📱", title: "Creación de contenido para redes sociales y blogs", desc: "Inserta tu usuario de Instagram o marca personal en tus publicaciones." },
              ],
              proTipsTitle: "Consejos profesionales de diseño de marcas de agua",
              proTips: [
                "Para máxima seguridad antipiratería, combina la posición en 'Mosaico (Tile)' con un ángulo de rotación de -30 grados.",
                "Una opacidad entre el 20% y el 35% ofrece el balance perfecto entre protección y visibilidad de la foto.",
                "Usa siempre archivos PNG con fondo transparente para tus marcas de agua de logotipo.",
                "Exporta en formato 'WEBP' para conseguir imágenes ligeras y ultra nítidas en la web.",
              ],
              faqTitle: "Preguntas frecuentes (FAQ)",
              faqs: [
                { q: "¿Mis fotos se suben a algún servidor?", a: "¡No! Todo el procesamiento se realiza localmente en la memoria RAM de tu navegador." },
                { q: "¿Puedo crear marcas de agua repetidas en toda la imagen?", a: "¡Sí! Selecciona la opción 'Mosaico (Tile)' para generar un patrón repetido diagonal continuo." },
                { q: "¿Se admiten logotipos en formato PNG transparente?", a: "¡Sí! El canal alfa transparente de tu logotipo se mantiene intacto durante la superposición." },
                { q: "¿Se reduce la calidad o resolución de mi fotografía original?", a: "No, la imagen se procesa y exporta manteniendo el 100% de la resolución original." },
                { q: "¿Funciona en teléfonos móviles (iPhone / Android)?", a: "Sí, funciona de forma rápida y fluida en cualquier navegador móvil." },
                { q: "¿Tiene algún coste o límite de uso?", a: "Es 100% gratuito e ilimitado. Sin marcas de agua forzadas y sin registros." },
              ],
              relatedToolsTitle: "Herramientas relacionadas",
              relatedTools: [
                { title: "Compresor de imágenes (Image Compress)", desc: "Reduce el peso de tus imágenes con marca de agua hasta un 80%.", href: "/tools/image-compress/" },
                { title: "Redimensionador de imágenes (Image Resizer)", desc: "Ajusta las dimensiones en píxeles o porcentaje con precisión.", href: "/tools/image-resizer/" },
                { title: "Eliminador de fondos (Background Remover)", desc: "Elimina fondos de logotipos con IA local para dejarlos transparentes.", href: "/tools/background-remover/" },
                { title: "Conversor de imágenes (Image Converter)", desc: "Convierte tus fotos a formatos PNG, JPG, WEBP o ICO.", href: "/tools/image-converter/" },
              ],
            },
            zh: {
              aboutTitle: "浏览器本地高清图片水印添加器 (防盗水印)",
              aboutDesc: "基于 HTML5 Canvas 2D 渲染引擎，可在照片上实时合成文字签名或品牌 Logo 水印，支持透明度、旋转角度、全图平铺瓦片阵列等丰富样式调节。全流程 100% 在本地浏览器内存中运行，零文件上传云端服务器，全面捍卫您的原创图片版权安全。",
              howTitle: "分步操作指南",
              steps: [
                "拖拽或点击上传需要添加水印的原图（支持 PNG、JPG、WEBP、BMP 等格式）。",
                "在顶部选项卡中选择“文字水印”或“Logo 图片水印”模式。",
                "自由设置字体、文字大小、颜色、透明度 (Opacity)、旋转角度 (Rotation) 及 Logo 缩放比例。",
                "指定水印位置（居中、四角或全图倾斜平铺瓦片阵列）。",
                "在实时画布预览中确认效果后，选择所需格式（PNG / JPG / WEBP）瞬间下载保存至本地。",
              ],
              featuresTitle: "核心工程技术特性",
              features: [
                { title: "文字与 Logo 双引擎合成", desc: "支持自定义版权文案输入或上传透明 PNG 品牌 Logo，高保真矢量渲染。" },
                { title: "全图倾斜瓦片平铺阵列 (Full Tile Matrix)", desc: "一键生成覆盖全图的对角线平铺水印，杜绝裁剪与涂抹盗图风险。" },
                { title: "精细透明度与 360° 旋转调节", desc: "微调 0%~100% 透明度，在不破坏原图视觉美感的前提下提供清晰防伪标识。" },
                { title: "100% 浏览器本地安全沙箱 (零服务器上传)", desc: "照片数据绝不离开发生运算的设备，彻底杜绝原创设计泄露隐患。" },
              ],
              useCasesTitle: "实战应用推荐场景",
              useCases: [
                { icon: "📸", title: "摄影师与设计师原创作品版权防护", desc: "在摄影大图或作品集上添加作者署名与 © 版权符号，有效防止网络盗图与未经授权商用。" },
                { icon: "🛍️", title: "电商主图与详情页防盗图品牌标识", desc: "为网店商品实拍图打上品牌 Logo，防止同行搬运与盗用商品详情。" },
                { icon: "📄", title: "企业内部绝密资料与合同方案加注", desc: "在重要合同草案、设计初稿上快速印上“绝密 / 内部资料”全屏倾斜水印。" },
                { icon: "📱", title: "小红书与公众号博主社交分享加标", desc: "在社交平台配图上优雅地融入博主专属 ID 与个性徽标，提升品牌辨识度。" },
              ],
              proTipsTitle: "专家水印设计与排版技巧",
              proTips: [
                "为了达到最顶级的防盗图效果，推荐采用“平铺 (Tile)”布局配合“-30度旋转”。",
                "将透明度设置在 20%~35% 区间，既能清晰辨识版权信息，又不会遮挡原图主体细节。",
                "上传 Logo 水印时务必使用背景透明的 PNG 格式以获得最干净通透的叠加效果。",
                "用于网页与移动端发布时，建议导出为轻量高清的 'WEBP' 格式。",
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "添加水印时照片会被上传到服务器吗？", a: "绝无可能！desktools.run 的所有图片水印运算全部在您本地电脑的内存中完成，零网络数据传输。" },
                { q: "可以制作铺满整张照片的防盗水印吗？", a: "可以！在位置设置中选择“平铺 (Tile)”即可自动生成全屏对角线重复的水印阵列。" },
                { q: "支持上传透明背景的 PNG Logo 吗？", a: "支持！Logo 模式完美保留 PNG 文件的透明 Alpha 通道，呈现极具质感的合成效果。" },
                { q: "合成水印后原图的分辨率会降低吗？", a: "不会！系统严格按照原图的 1:1 物理像素尺寸进行渲染与输出，画质零损失。" },
                { q: "手机端（iPhone / 安卓）浏览器可以直接使用吗？", a: "可以！完全支持移动端 Safari 和 Chrome 浏览器，支持触控操作，无需安装 App。" },
                { q: "完全免费吗？每天有制作张数限制吗？", a: "100% 永久免费，无任何每日上限，不添加任何强制水印，无需注册登录。" },
              ],
              relatedToolsTitle: "推荐相关实用工具",
              relatedTools: [
                { title: "图片压缩器 (Image Compress)", desc: "将打好水印的图片体积无损压缩高达 80%，加速网页加载。", href: "/tools/image-compress/" },
                { title: "图片尺寸调整 (Image Resizer)", desc: "按像素或百分比无损调整图片分辨率与尺寸规格。", href: "/tools/image-resizer/" },
                { title: "智能背景消除 (Background Remover)", desc: "内置本地 AI 神经网络模型，一键智能抠图并制作透明 Logo。", href: "/tools/background-remover/" },
                { title: "图片格式转换 (Image Converter)", desc: "在 PNG、JPG、WEBP、ICO 等多种格式之间秒级批量互转。", href: "/tools/image-converter/" },
              ],
            },
            fr: {
              aboutTitle: "Ajout de filigrane et signature d'images haute définition dans le navigateur",
              aboutDesc: "Appliquez des filigranes textuels ou logos sur vos photos avec contrôle précis de l'opacité, de l'angle de rotation et des motifs en mosaïque grâce à l'API HTML5 Canvas. Tout s'exécute à 100% dans la mémoire de votre navigateur, assurant une vitesse maximale et une protection totale de vos droits d'auteur sans transfert de données vers des serveurs.",
              howTitle: "Guide d'utilisation étape par étape",
              steps: [
                "Glissez-déposez ou sélectionnez votre photo originale (compatible PNG, JPG, WEBP, BMP).",
                "Choisissez le mode 'Filigrane texte' ou 'Logo image'.",
                "Ajustez la police, la taille, la couleur, l'opacité (0~100%), la rotation et l'échelle du logo.",
                "Définissez l'emplacement souhaité (Centre, Coins ou Mosaïque répétée sur toute l'image).",
                "Vérifiez l'aperçu en temps réel et téléchargez votre création au format PNG, JPG ou WEBP.",
              ],
              featuresTitle: "Fonctionnalités clés de filigrane",
              features: [
                { title: "Double moteur Texte & Logo", desc: "Insérez des signatures typographiques ou incrustez des logos PNG transparents haute définition." },
                { title: "Motif en mosaïque continue (Full Tile Matrix)", desc: "Protégez vos visuels contre le vol en recouvrant toute l'image d'un motif diagonal répété en 1 clic." },
                { title: "Contrôle précis de l'opacité et de la rotation", desc: "Ajustez la discrétion visuelle grâce à une transparence subtile et une rotation libre à 360°." },
                { title: "Confidentialité 100% locale (Zéro upload sur serveur)", desc: "Vos photos ne quittent jamais votre appareil, assurant une sécurité totale de vos créations." },
              ],
              useCasesTitle: "Cas d'utilisation pratiques",
              useCases: [
                { icon: "📸", title: "Protection des droits d'auteur pour photographes", desc: "Ajoutez votre signature artistique et le symbole © pour empêcher la réutilisation non autorisée." },
                { icon: "🛍️", title: "Branding de photos de produits pour boutiques en ligne", desc: "Incrustez le logo de votre marque sur vos fiches produits pour éviter les copies concurrentes." },
                { icon: "📄", title: "Marquage de documents confidentiels et avant-projets", desc: "Appliquez rapidement un tampon diagonal 'CONFIDENTIEL' sur vos maquettes d'entreprise." },
                { icon: "📱", title: "Création de contenus pour réseaux sociaux et blogs", desc: "Ajoutez votre identifiant ou emblème personnel sur vos publications Instagram." },
              ],
              proTipsTitle: "Conseils d'experts pour vos filigranes",
              proTips: [
                "Pour une protection optimale contre le vol, combinez la disposition en 'Mosaïque (Tile)' avec une rotation de -30 degrés.",
                "Une opacité réglée entre 20% et 35% offre le parfait compromis entre protection et lisibilité du sujet.",
                "Utilisez toujours des fichiers PNG à fond transparent pour vos filigranes de logo.",
                "Téléchargez au format 'WEBP' pour obtenir des fichiers légers et nets pour le web.",
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Mes photos sont-elles envoyées sur un serveur ?", a: "Absolument pas ! Tout le traitement s'exécute dans la mémoire vive de votre navigateur sans aucun transfert réseau." },
                { q: "Puis-je répéter le filigrane sur toute l'image ?", a: "Oui ! Sélectionnez l'option 'Mosaïque (Tile)' pour générer un motif diagonal continu couvrant l'ensemble du visuel." },
                { q: "Les logos au format PNG transparent sont-ils pris en charge ?", a: "Oui ! La transparence alpha de votre fichier PNG est parfaitement préservée lors de la superposition." },
                { q: "La résolution de ma photo originale est-elle conservée ?", a: "Oui, l'image est exportée en conservant 100% de sa résolution et netteté d'origine." },
                { q: "L'outil fonctionne-t-il sur mobile (iPhone / Android) ?", a: "Oui ! Il fonctionne parfaitement sur tous les navigateurs mobiles sans aucune application à installer." },
                { q: "Le service est-il gratuit et sans limite ?", a: "100% gratuit, illimité, sans filigrane forcé et sans inscription." },
              ],
              relatedToolsTitle: "Outils recommandés",
              relatedTools: [
                { title: "Compresseur d'images (Image Compress)", desc: "Réduisez la taille de vos images filigranées jusqu'à 80% sans perte.", href: "/tools/image-compress/" },
                { title: "Redimensionneur d'images (Image Resizer)", desc: "Ajustez les dimensions en pixels ou en pourcentage sans perte de qualité.", href: "/tools/image-resizer/" },
                { title: "Suppression d'arrière-plan (Background Remover)", desc: "Détourez vos logos instantanément grâce à l'intelligence artificielle locale.", href: "/tools/background-remover/" },
                { title: "Convertisseur d'images (Image Converter)", desc: "Convertissez vos images vers PNG, JPG, WEBP ou ICO.", href: "/tools/image-converter/" },
              ],
            },
            en: {
              aboutTitle: "Browser-Native High-Resolution Image Watermark Adder",
              aboutDesc: "Overlay custom text signatures or brand logo watermarks on images with full opacity, rotation angle, font styling, and tiled matrix patterns using the HTML5 Canvas 2D engine. All rendering operations execute 100% locally inside your client browser memory, protecting your digital assets without cloud uploads.",
              howTitle: "Step-by-Step Usage Guide",
              steps: [
                "Drag and drop or select the original photo you want to watermark (supports PNG, JPG, WEBP, BMP).",
                "Choose either 'Text Watermark' or 'Logo Image Watermark' mode on the top selector.",
                "Customize typography, font size, text color, opacity (0~100%), rotation angle, and logo scaling.",
                "Select watermark positioning (Center, 4 Corners, or Full Tile Repeat Matrix).",
                "Inspect the real-time canvas preview and download in your preferred format (PNG / JPG / WEBP).",
              ],
              featuresTitle: "Key Watermarking & Engineering Features",
              features: [
                { title: "Text & Logo Dual Overlay Engine", desc: "Type custom copyright notices or upload transparent PNG brand logos with crystal-clear fidelity." },
                { title: "Full-Coverage Diagonal Tile Matrix", desc: "Protect images from unauthorized cropping by stamping repeated diagonal watermark patterns across the entire canvas." },
                { title: "Precision Opacity & 360° Rotation Control", desc: "Fine-tune opacity sliders and rotation angles to create subtle, non-intrusive yet secure marks." },
                { title: "100% Client-Side Privacy Sandbox (Zero Upload)", desc: "Zero file bytes leave your local device, guaranteeing enterprise-grade asset protection." },
              ],
              useCasesTitle: "Real-World Practical Use Cases",
              useCases: [
                { icon: "📸", title: "Photographer & Creative Portfolio Protection", desc: "Embed your signature and © copyright notices across portfolio galleries to prevent content scrapers." },
                { icon: "🛍️", title: "E-commerce & Marketplace Product Image Branding", desc: "Stamp brand insignias onto catalog photos to prevent competitors from stealing your product shots." },
                { icon: "📄", title: "Confidential Enterprise Document Marking", desc: "Quickly apply diagonal 'CONFIDENTIAL' or 'DRAFT' watermarks to corporate design proofs." },
                { icon: "📱", title: "Social Media & Blog Content Attribution", desc: "Stamp Instagram handles and personal logos onto shareable graphics to boost brand recognition." },
              ],
              proTipsTitle: "Pro Watermarking Design Tips",
              proTips: [
                "For the strongest antipiracy protection, combine 'Tile' positioning with a '-30 degree' rotation angle.",
                "Setting opacity between 20% and 35% provides the optimal balance between image clarity and copyright protection.",
                "When using logo watermarks, upload PNG files with transparent backgrounds for the cleanest overlay.",
                "Export as 'WEBP' for publishing to web platforms to achieve lightweight file sizes without sacrificing sharpness.",
              ],
              faqTitle: "Frequently Asked Questions (FAQ)",
              faqs: [
                { q: "Are my images uploaded to any server for watermarking?", a: "Zero server upload! Everything runs inside your device's browser memory (Client-Side). Zero bytes are transmitted." },
                { q: "Can I apply a repeating watermark pattern across the entire image?", a: "Yes! Choose the 'Tile' position mode to automatically generate a full-coverage diagonal repeating grid." },
                { q: "Are transparent PNG logos supported?", a: "Yes! PNG alpha transparency is fully preserved when stamping logo watermarks onto your photos." },
                { q: "Does adding a watermark lower the original image resolution?", a: "No! The canvas renders output assets at 100% 1:1 original pixel resolution." },
                { q: "Can I use this tool on mobile phones (iOS / Android)?", a: "Yes! Fully responsive and touch-optimized across mobile browsers without requiring app installations." },
                { q: "Is it completely free with no usage limits?", a: "100% free and unlimited. No accounts, no subscriptions, and no forced promotional watermarks applied." },
              ],
              relatedToolsTitle: "Related Utilities",
              relatedTools: [
                { title: "Image Compressor", desc: "Shrink watermarked image files up to 80% without losing quality.", href: "/tools/image-compress/" },
                { title: "Image Resizer", desc: "Resize image dimensions (pixels/percentage) while preserving quality.", href: "/tools/image-resizer/" },
                { title: "Background Remover", desc: "Remove logo backgrounds with client-side AI to create transparent stamps.", href: "/tools/background-remover/" },
                { title: "Image Converter", desc: "Convert watermarked images between PNG, JPG, WEBP, and ICO formats.", href: "/tools/image-converter/" },
              ],
            },
          };

          const active = content[locale as keyof typeof content] || content.en;

          return (
            <div style={{ maxWidth: "1280px", margin: "40px auto 0", padding: "0 24px" }}>
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
      </main>

      <Footer />
    </>
  );
}
