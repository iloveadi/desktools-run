"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  ArrowLeft,
  Download,
  Copy,
  Check,
  Globe,
  Wifi,
  Type,
  Palette,
  Sliders,
  Sparkles,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { generateQRCodeMatrix } from "@/lib/qrcode";
import { useLocale } from "@/lib/context/LocaleContext";

type InputTab = "url" | "text" | "wifi";

export default function QrGeneratorPage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<InputTab>("url");
  const [urlInput, setUrlInput] = useState("https://desktools.run");
  const [textInput, setTextInput] = useState("Hello, World!");
  
  // WiFi state
  const [wifiSsid, setWifiSsid] = useState("MyHomeWiFi");
  const [wifiPass, setWifiPass] = useState("SecretPassword123");
  const [wifiType, setWifiType] = useState("WPA");

  // Styling state
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState<number>(320);
  const [margin, setMargin] = useState<number>(2);

  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute final QR content string
  const qrContent = useMemo(() => {
    if (activeTab === "url") return urlInput.trim() || "https://desktools.run";
    if (activeTab === "text") return textInput.trim() || "Hello World";
    if (activeTab === "wifi") {
      return `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};;`;
    }
    return "DeskTools";
  }, [activeTab, urlInput, textInput, wifiSsid, wifiPass, wifiType]);

  // Compute QR Matrix
  const matrix = useMemo(() => {
    try {
      return generateQRCodeMatrix(qrContent);
    } catch (e) {
      return generateQRCodeMatrix("https://desktools.run");
    }
  }, [qrContent]);

  // Render to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const moduleCount = matrix.length;
    const totalCells = moduleCount + margin * 2;
    const cellSize = Math.floor(size / totalCells);
    const canvasSize = cellSize * totalCells;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw foreground modules
    ctx.fillStyle = fgColor;
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          const x = (c + margin) * cellSize;
          const y = (r + margin) * cellSize;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
  }, [matrix, fgColor, bgColor, size, margin]);

  // Download PNG
  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  // Download SVG
  const downloadSvg = useCallback(() => {
    const moduleCount = matrix.length;
    const totalCells = moduleCount + margin * 2;
    const cellSize = 10;
    const svgSize = totalCells * cellSize;

    let rects = "";
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          const x = (c + margin) * cellSize;
          const y = (r + margin) * cellSize;
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fgColor}" />`;
        }
      }
    }

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
      <rect width="100%" height="100%" fill="${bgColor}" />
      ${rects}
    </svg>`;

    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [matrix, margin, fgColor, bgColor]);

  // Copy Canvas Image to Clipboard
  const copyImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      navigator.clipboard
        .write([new ClipboardItem({ "image/png": blob })])
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Fallback if clipboard API fails
          alert("Image copy not supported in this browser version. Use PNG Download instead.");
        });
    });
  }, []);

  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Breadcrumb & Title */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 24px" }}>
          <Link
            href="/tools"
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
            {t("qrGenerator.back")}
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "rgba(99,102,241,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
              }}
            >
              <QrCode size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("qrGenerator.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
            {t("qrGenerator.subtitle")}
          </p>
        </section>

        {/* Main Grid */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px" }} className="qr-grid">
            {/* Left Column: Form & Style Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Content Mode Selection Card */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  {[
                    { id: "url", label: t("qrGenerator.tabUrl"), icon: Globe },
                    { id: "text", label: t("qrGenerator.tabText"), icon: Type },
                    { id: "wifi", label: t("qrGenerator.tabWifi"), icon: Wifi },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as InputTab)}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: activeTab === id ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(255,255,255,0.05)",
                        border: activeTab === id ? "none" : "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                        color: activeTab === id ? "white" : "var(--text-secondary)",
                        fontSize: "13.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab 1: URL Input */}
                {activeTab === "url" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {t("qrGenerator.urlLabel")}
                    </label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com"
                      style={{
                        height: "44px",
                        borderRadius: "10px",
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                        padding: "0 14px",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>
                )}

                {/* Tab 2: Plain Text */}
                {activeTab === "text" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {t("qrGenerator.textLabel")}
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t("qrGenerator.textPlaceholder")}
                      rows={4}
                      style={{
                        borderRadius: "10px",
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                        padding: "12px 14px",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        outline: "none",
                        resize: "vertical",
                      }}
                    />
                  </div>
                )}

                {/* Tab 3: Wi-Fi Config */}
                {activeTab === "wifi" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {t("qrGenerator.ssidLabel")}
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        style={{
                          height: "40px",
                          borderRadius: "8px",
                          background: "rgba(0,0,0,0.25)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          padding: "0 12px",
                          color: "var(--text-primary)",
                          fontSize: "13.5px",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {t("qrGenerator.passLabel")}
                      </label>
                      <input
                        type="text"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        style={{
                          height: "40px",
                          borderRadius: "8px",
                          background: "rgba(0,0,0,0.25)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          padding: "0 12px",
                          color: "var(--text-primary)",
                          fontSize: "13.5px",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {t("qrGenerator.encLabel")}
                      </label>
                      <select
                        value={wifiType}
                        onChange={(e) => setWifiType(e.target.value)}
                        style={{
                          height: "40px",
                          borderRadius: "8px",
                          background: "rgba(0,0,0,0.25)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          padding: "0 12px",
                          color: "var(--text-primary)",
                          fontSize: "13.5px",
                        }}
                      >
                        <option value="WPA">{t("qrGenerator.encWpa")}</option>
                        <option value="WEP">{t("qrGenerator.encWep")}</option>
                        <option value="nopass">{t("qrGenerator.encNone")}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Style Customization Card */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Palette size={18} style={{ color: "#818cf8" }} />
                  {t("qrGenerator.stylingTitle")}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                      {t("qrGenerator.fgLabel")}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        style={{ width: "38px", height: "38px", borderRadius: "8px", border: "none", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "13px", fontFamily: "var(--font-mono), monospace", color: "var(--text-primary)" }}>
                        {fgColor}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                      {t("qrGenerator.bgLabel")}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        style={{ width: "38px", height: "38px", borderRadius: "8px", border: "none", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "13px", fontFamily: "var(--font-mono), monospace", color: "var(--text-primary)" }}>
                        {bgColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color Presets */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{t("qrGenerator.presetsLabel")}</span>
                  {[
                    { name: t("qrGenerator.presetClassic"), fg: "#000000", bg: "#ffffff" },
                    { name: t("qrGenerator.presetIndigo"), fg: "#4f46e5", bg: "#ffffff" },
                    { name: t("qrGenerator.presetEmerald"), fg: "#059669", bg: "#ffffff" },
                    { name: t("qrGenerator.presetDarkNeon"), fg: "#38bdf8", bg: "#0f172a" },
                  ].map((p) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        setFgColor(p.fg);
                        setBgColor(p.bg);
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live QR Canvas Preview & Download Card */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#818cf8" }}>
                  {t("qrGenerator.previewLabel")}
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                  {t("qrGenerator.generatedTitle")}
                </h3>
              </div>

              {/* Canvas Box */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: bgColor,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto", display: "block" }} />
              </div>

              {/* Download & Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                <button
                  onClick={downloadPng}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                  }}
                >
                  <Download size={16} />
                  {t("qrGenerator.downloadPng")}
                </button>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={downloadSvg}
                    style={{
                      flex: 1,
                      height: "40px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Download size={14} />
                    {t("qrGenerator.downloadSvg")}
                  </button>

                  <button
                    onClick={copyImage}
                    style={{
                      flex: 1,
                      height: "40px",
                      borderRadius: "8px",
                      background: copied ? "rgba(34,211,168,0.2)" : "rgba(255,255,255,0.06)",
                      border: copied ? "1px solid rgba(34,211,168,0.4)" : "1px solid rgba(255,255,255,0.12)",
                      color: copied ? "#34d399" : "var(--text-primary)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? t("qrGenerator.copied") : t("qrGenerator.copyImage")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Guide */}
        <ToolGuide
          badgeText={t("qrGenerator.guideBadge")}
          aboutTitle={t("qrGenerator.guide.aboutTitle")}
          aboutDesc={t("qrGenerator.guide.aboutDesc")}
          howTitle={t("qrGenerator.guide.howTitle")}
          steps={[
            t("qrGenerator.guide.step1"),
            t("qrGenerator.guide.step2"),
            t("qrGenerator.guide.step3"),
          ]}
          faqs={[
            { q: t("qrGenerator.guide.faq1Q"), a: t("qrGenerator.guide.faq1A") },
            { q: t("qrGenerator.guide.faq2Q"), a: t("qrGenerator.guide.faq2A") },
          ]}
        />
      </main>

      <Footer />

      <style>{`
        @media (max-width: 868px) {
          .qr-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

