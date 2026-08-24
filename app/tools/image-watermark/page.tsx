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
  const { locale } = useLocale();

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

  const getLabel = (ko: string, en: string, ja?: string, es?: string, zh?: string, fr?: string) => {
    if (locale === "ko") return ko;
    if (locale === "ja") return ja || en;
    if (locale === "es") return es || en;
    if (locale === "zh") return zh || en;
    if (locale === "fr") return fr || en;
    return en;
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
            {getLabel("모든 도구로 돌아가기", "Back to Tools", "ツール一覧へ戻る", "Volver a herramientas", "返回工具列表", "Retour aux outils")}
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
                {getLabel("이미지 워터마크 추가기", "Image Watermark Adder", "画像ウォーターマーク追加", "Añadir Marca de Agua", "图片水印添加器", "Filigrane d'Image")}
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                {getLabel(
                  "텍스트 또는 로고 워터마크를 투명도, 회전 및 패턴으로 자유롭게 합성하세요. 100% 브라우저 연산.",
                  "Protect your images with customizable text or logo watermarks. 100% private client-side canvas processing.",
                  "テキストやロゴの透かしを画像に自由合成。100%ブラウザ内で安全に処理。",
                  "Protege tus imágenes con marcas de agua personalizadas de texto o logo. 100% privado.",
                  "添加自定义文本与 Logo 水印，保护图片版权。100% 浏览器本地安全处理。",
                  "Protégez vos images avec des filigranes personnalisés de texte ou de logo. 100% privé."
                )}
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
                {getLabel("워터마크를 추가할 이미지를 업로드하세요", "Upload Image for Watermarking", "画像ファイルをアップロード", "Sube una imagen para añadir marca de agua", "上传需添加水印的图片", "Télécharger une image à filigraner")}
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 20px" }}>
                {getLabel("JPG, PNG, WebP, GIF, AVIF 지원. 파일은 서버에 업로드되지 않고 100% 로컬에서만 처리됩니다.", "Supports JPG, PNG, WebP, GIF. 100% client-side rendering with zero server uploads.", "JPG, PNG, WebP対応。サーバー転送なしで安心。", "Soporta JPG, PNG, WebP. 100% cliente sin subida a servidor.", "支持 JPG、PNG、WebP。100% 本地渲染，无需上传服务器。", "Prend en charge JPG, PNG, WebP. 100% local." )}
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
                {getLabel("이미지 파일 선택", "Select Image File", "画像ファイルを選択", "Seleccionar Imagen", "选择图片文件", "Sélectionner une image")}
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
                    {getLabel("교체", "Change", "変更", "Cambiar", "更换", "Changer")}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                </div>

                {/* Mode Selector */}
                <div className="glass-card" style={{ padding: "18px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", display: "block" }}>
                    {getLabel("워터마크 유형", "Watermark Type", "透かしタイプ", "Tipo de marca", "水印类型", "Type de filigrane")}
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
                      {getLabel("텍스트 워터마크", "Text", "テキスト", "Texto", "文本水印", "Texte")}
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
                      {getLabel("로고 이미지", "Logo Image", "ロゴ画像", "Imagen Logo", "Logo 图片", "Logo")}
                    </button>
                  </div>
                </div>

                {/* Text Controls */}
                {mode === "text" && (
                  <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", display: "block" }}>
                        {getLabel("워터마크 문구", "Watermark Text", "透かしテキスト", "Texto de marca", "水印文字内容", "Texte du filigrane")}
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
                          {getLabel("글꼴", "Font Family", "フォント", "Fuente", "字体", "Police")}
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
                          {getLabel("크기", "Font Size", "サイズ", "Tamaño", "字号", "Taille")}: {fontSize}px
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
                          {getLabel("색상", "Color", "カラー", "Color", "颜色", "Couleur")}
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
                          {getLabel("투명도", "Opacity", "不透明度", "Opacidad", "透明度", "Opacité")}: {Math.round(textOpacity * 100)}%
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
                        <span>{getLabel("회전 각도", "Rotation", "回転角度", "Rotación", "旋转角度", "Angle de rotation")}</span>
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
                          {getLabel("로고 PNG 업로드", "Upload Logo Image", "ロゴ画像をアップロード", "Subir Logo PNG", "上传 Logo 图片", "Télécharger le logo")}
                          <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                        </label>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {getLabel("로고 조절", "Logo Settings", "ロゴ設定", "Ajustes de logo", "Logo 设置", "Réglages du logo")}
                          </span>
                          <button
                            onClick={() => setLogoImage(null)}
                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <Trash2 size={12} />
                            {getLabel("삭제", "Remove", "削除", "Quitar", "移除", "Supprimer")}
                          </button>
                        </div>

                        {/* Scale & Opacity */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                              {getLabel("크기 배율", "Scale", "拡大縮小", "Escala", "缩放比例", "Échelle")}: {Math.round(logoScale * 100)}%
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
                              {getLabel("투명도", "Opacity", "不透明度", "Opacidad", "透明度", "Opacité")}: {Math.round(logoOpacity * 100)}%
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
                            <span>{getLabel("회전 각도", "Rotation", "回転角度", "Rotación", "旋转角度", "Angle de rotation")}</span>
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
                    {getLabel("배치 / 패턴 위치", "Position & Pattern", "配置・パターン", "Posición y patrón", "位置与模式", "Position et motif")}
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
                      {getLabel("화면 전체 격자 패턴 (Tiled Pattern)", "Full Grid Tile Pattern", "画面全体グリッドパターン", "Patrón de rejilla completa", "全图网格重复平铺", "Motif de grille répété")}
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
                    {getLabel("저장 포맷", "Export Format", "保存フォーマット", "Formato de guardado", "导出格式", "Format d'export")}
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
                    {getLabel("워터마크 이미지 다운로드", "Download Watermarked Image", "画像をダウンロード", "Descargar imagen", "下载水印图片", "Télécharger l'image")}
                  </button>
                </div>
              </div>

              {/* Live Canvas Preview Column */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Eye size={16} style={{ color: "#818cf8" }} />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {getLabel("실시간 워터마크 미리보기", "Real-Time Preview", "リアルタイムプレビュー", "Vista previa en tiempo real", "实时水印合成预览", "Aperçu en temps réel")}
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
            aboutTitle={getLabel("이미지 워터마크 추가기 소개", "About Image Watermark Adder")}
            aboutDesc={getLabel(
              "이미지 워터마크 추가기는 소중한 사진, 디자인, 카탈로그, 문서에 텍스트 또는 로고 워터마크를 투명도 및 패턴으로 안전하게 합성할 수 있는 웹 유틸리티입니다. 업로드된 파일은 서버로 전송되지 않고 100% 브라우저 로컬에서 연산됩니다.",
              "desktools.run Image Watermark Adder is a browser-based tool to add text or logo watermarks to your pictures, photography, and graphics. All processing runs 100% locally with zero server uploads."
            )}
            steps={[
              getLabel("워터마크를 추가할 사진 또는 이미지 파일을 업로드합니다.", "Upload photo or image file."),
              getLabel("텍스트 문구 작성 또는 로고 PNG 이미지를 업로드합니다.", "Set text content or upload logo image."),
              getLabel("투명도, 회전 각도 및 배치 위치(격자 패턴/중앙 등)를 조절합니다.", "Adjust opacity, rotation, and layout position."),
              getLabel("워터마크가 합성된 고해상도 이미지를 즉시 다운로드합니다.", "Download watermarked high-res image."),
            ]}
            faqs={[
              {
                q: getLabel("업로드한 원본 사진이 외부 서버에 저장되나요?", "Is my photo stored on a remote server?"),
                a: getLabel("아닙니다. 모든 워터마크 연산은 HTML5 Canvas 기술을 이용해 사용자의 웹 브라우저 내에서 100% 로컬로만 처리됩니다.", "No. All canvas rendering happens 100% locally inside your web browser."),
              },
              {
                q: getLabel("어떤 이미지 포맷을 지원하나요?", "What image formats are supported?"),
                a: getLabel("JPG, PNG, WebP, GIF, AVIF 등 주요 이미지 포맷을 모두 지원하며, PNG/JPG/WebP 포맷으로 다운로드할 수 있습니다.", "Supports JPG, PNG, WebP, GIF, AVIF input, and PNG/JPG/WebP export."),
              },
            ]}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
