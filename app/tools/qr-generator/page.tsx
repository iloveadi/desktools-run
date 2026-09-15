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
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { generateQRCodeMatrix } from "@/lib/qrcode";
import { useLocale } from "@/lib/context/LocaleContext";

type InputTab = "url" | "text" | "wifi";

export default function QrGeneratorPage() {
  const { locale, t } = useLocale();
  const [activeTab, setActiveTab] = useState<InputTab>("url");
  const [urlInput, setUrlInput] = useState("https://desktools.run");
  const [textInput, setTextInput] = useState("Hello, World! desktools.run");
  
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
        });
    });
  }, []);

  return (
    <>
      <ToolUsageTracker toolId="qr-generator" />
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Breadcrumb & Header */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 24px" }}>
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
            {t("qrGenerator.back") || "Back to Tools"}
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCode size={22} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("qrGenerator.title") || "QR Code Generator"}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            {t("qrGenerator.subtitle") || "Generate custom high-resolution QR codes for URLs, text, and Wi-Fi credentials."}
          </p>
        </section>

        {/* Workspace Grid */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div
            className="qr-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "24px",
            }}
          >
            {/* Left Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Tabs */}
              <div
                className="glass-card"
                style={{
                  padding: "6px",
                  display: "flex",
                  gap: "6px",
                  borderRadius: "12px",
                }}
              >
                <button
                  onClick={() => setActiveTab("url")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: activeTab === "url" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
                    color: activeTab === "url" ? "white" : "var(--text-secondary)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Globe size={16} />
                  {t("qrGenerator.tabUrl") || "URL"}
                </button>
                <button
                  onClick={() => setActiveTab("text")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: activeTab === "text" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
                    color: activeTab === "text" ? "white" : "var(--text-secondary)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Type size={16} />
                  {t("qrGenerator.tabText") || "Text"}
                </button>
                <button
                  onClick={() => setActiveTab("wifi")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: activeTab === "wifi" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
                    color: activeTab === "wifi" ? "white" : "var(--text-secondary)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Wifi size={16} />
                  {t("qrGenerator.tabWifi") || "Wi-Fi"}
                </button>
              </div>

              {/* Tab Form Inputs */}
              <div className="glass-card" style={{ padding: "20px" }}>
                {activeTab === "url" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {t("qrGenerator.urlLabel") || "Website URL"}
                    </label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://desktools.run"
                      style={{
                        height: "44px",
                        borderRadius: "8px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        padding: "0 14px",
                        fontSize: "14px",
                        fontFamily: "var(--font-mono), monospace",
                      }}
                    />
                  </div>
                )}

                {activeTab === "text" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {t("qrGenerator.textLabel") || "Text Content"}
                    </label>
                    <textarea
                      rows={4}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter plain text message, contact, or note..."
                      style={{
                        borderRadius: "8px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        padding: "12px 14px",
                        fontSize: "14px",
                        fontFamily: "var(--font-mono), monospace",
                        resize: "vertical",
                      }}
                    />
                  </div>
                )}

                {activeTab === "wifi" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {t("qrGenerator.wifiSsid") || "Network SSID (Name)"}
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="e.g. Office_WiFi"
                        style={{
                          height: "40px",
                          borderRadius: "8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          padding: "0 12px",
                          fontSize: "14px",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {t("qrGenerator.wifiPass") || "Wi-Fi Password"}
                      </label>
                      <input
                        type="text"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        placeholder="e.g. MySecurePassword123"
                        style={{
                          height: "40px",
                          borderRadius: "8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          padding: "0 12px",
                          fontSize: "14px",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {t("qrGenerator.wifiType") || "Encryption Security Type"}
                      </label>
                      <select
                        value={wifiType}
                        onChange={(e) => setWifiType(e.target.value)}
                        style={{
                          height: "40px",
                          borderRadius: "8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          padding: "0 12px",
                          fontSize: "14px",
                        }}
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (Default)</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None (Open Network)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Design Customization */}
              <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)", fontSize: "14px", fontWeight: 700 }}>
                  <Palette size={16} color="#818cf8" />
                  {t("qrGenerator.customStyle") || "Design & Colors"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                      {t("qrGenerator.fgColor") || "Foreground Color"}
                    </label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          padding: 0,
                          background: "transparent",
                        }}
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        style={{
                          flex: 1,
                          height: "36px",
                          borderRadius: "8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          padding: "0 10px",
                          fontSize: "13px",
                          fontFamily: "var(--font-mono), monospace",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                      {t("qrGenerator.bgColor") || "Background Color"}
                    </label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          padding: 0,
                          background: "transparent",
                        }}
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        style={{
                          flex: 1,
                          height: "36px",
                          borderRadius: "8px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          padding: "0 10px",
                          fontSize: "13px",
                          fontFamily: "var(--font-mono), monospace",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                        {t("qrGenerator.sizeLabel") || "Resolution"}
                      </label>
                      <span style={{ fontSize: "12px", color: "#818cf8", fontFamily: "var(--font-mono)" }}>
                        {size}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="160"
                      max="640"
                      step="20"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#6366f1" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                        {t("qrGenerator.marginLabel") || "Quiet Zone"}
                      </label>
                      <span style={{ fontSize: "12px", color: "#818cf8", fontFamily: "var(--font-mono)" }}>
                        {margin} modules
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="1"
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#6366f1" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right QR Preview & Download */}
            <div
              className="glass-card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", width: "100%", textAlign: "left" }}>
                {t("qrGenerator.previewTitle") || "Live QR Code Preview"}
              </div>

              {/* Canvas Display */}
              <div
                style={{
                  background: bgColor,
                  padding: "16px",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    maxWidth: "260px",
                    maxHeight: "260px",
                    width: "100%",
                    height: "auto",
                    borderRadius: "4px",
                    display: "block",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "320px" }}>
                <button
                  onClick={downloadPng}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    border: "none",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                  }}
                >
                  <Download size={16} />
                  {t("qrGenerator.downloadPng") || "Download PNG"}
                </button>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={downloadSvg}
                    style={{
                      flex: 1,
                      height: "40px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--border-subtle)",
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
                    {t("qrGenerator.downloadSvg") || "SVG Vector"}
                  </button>

                  <button
                    onClick={copyImage}
                    style={{
                      flex: 1,
                      height: "40px",
                      borderRadius: "8px",
                      background: copied ? "rgba(34,211,168,0.2)" : "rgba(255,255,255,0.06)",
                      border: copied ? "1px solid rgba(34,211,168,0.4)" : "1px solid var(--border-subtle)",
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
                    {copied ? (t("qrGenerator.copied") || "Copied!") : (t("qrGenerator.copyImage") || "Copy Image")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "QR 코드 생성기 소개",
              aboutDesc:
                "웹사이트 링크(URL), 자유 텍스트, 카페/사무실 Wi-Fi 자동 접속 설정 정보를 맞춤형 고해상도 QR 코드로 즉시 생성하는 브라우저 기반 무료 도구입니다. 전경색 및 배경색 커스텀 지정, 여백(Quiet Zone) 조절, 인쇄용 고해상도 PNG 및 무손실 벡터 SVG 다운로드를 지원합니다. 100% 브라우저 내부에서 생성되어 데이터가 외부로 저장되지 않습니다.",
              howTitle: "QR 코드 생성 및 다운로드 방법",
              steps: [
                "상단 탭에서 생성할 유형(URL 링크, 일반 텍스트, Wi-Fi 접속 정보)을 선택합니다.",
                "웹 주소나 텍스트, 또는 Wi-Fi 이름(SSID)과 비밀번호를 입력합니다.",
                "하단 디자인 패널에서 브랜드 색상(전경색/배경색), 크기 해상도, 여백을 자유롭게 커스텀합니다.",
                "우측 실시간 미리보기에서 스마트폰 카메라로 QR 코드를 테스트 스캔합니다.",
                "'Download PNG' 또는 인쇄용 'SVG Vector' 버튼을 눌러 고화질 파일로 다운로드하거나 'Copy Image'로 즉시 붙여넣습니다."
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "원클릭 Wi-Fi 자동 접속 QR 지원", desc: "복잡한 비밀번호 입력 없이 스마트폰 카메라로 비추면 Wi-Fi에 즉시 연결되는 특수 QR 프로토콜을 생성합니다." },
                { title: "무손실 벡터 SVG & 고해상도 PNG", desc: "현수막, 명함, 브로슈어 등 대형 인쇄물에도 선명한 무손실 벡터(SVG) 및 PNG 파일 다운로드를 지원합니다." },
                { title: "브랜드 맞춤 색상 & 여백 커스텀", desc: "컬러 피커를 이용해 브랜드 컬러에 맞춘 감각적인 QR 코드를 손쉽게 제작할 수 있습니다." },
                { title: "클립보드 이미지 직접 복사", desc: "파일 다운로드 절차 없이 클릭 한 번으로 메신저나 슬랙, 피그마에 바로 붙여넣기할 수 있습니다." }
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "카페 및 매장 Wi-Fi 접속 안내판", desc: "손님들이 비밀번호를 물어보지 않고 QR 스캔 한 번으로 Wi-Fi에 자동 접속하도록 안내물 제작" },
                { title: "명함 및 포트폴리오 사이트 연결", desc: "인쇄용 명함이나 이력서에 개인 포트폴리오/GitHub 링크를 QR 코드로 인쇄" },
                { title: "식당 테이블 모바일 메뉴판 주문", desc: "테이블마다 모바일 메뉴판이나 주문 결제 링크를 QR 코드로 배치" },
                { title: "이벤트 포스터 및 마케팅 설문조사", desc: "전시회나 세미나 현장에서 구글 폼 설문지나 이벤트 응모 페이지로 즉시 유입 유도" }
              ],
              proTipsTitle: "인쇄 및 스캔 성공률을 높이는 전문가 팁",
              proTips: [
                "스마트폰 카메라 인식률을 위해 배경색은 밝게, 전경색은 어둡게 충분한 대비(Contrast)를 확보하세요.",
                "인쇄물 디자인 시 QR 코드 주변에 최소 2모듈 이상의 빈 여백(Quiet Zone)을 유지해야 스캔 오류를 방지할 수 있습니다.",
                "명함 등 작은 인쇄물에는 최소 2cm x 2cm 이상의 크기로 인쇄하는 것이 안전합니다.",
                "오프라인 포스터나 브로슈어 인쇄 시에는 해상도 저하가 없는 SVG 벡터 포맷을 디자이너에게 전달하세요."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "생성된 QR 코드의 유효기간이나 스캔 횟수 제한이 있나요?", a: "전혀 없습니다. 생성된 QR 코드는 영구적으로 유효하며 횟수 제한 없이 무료로 스캔됩니다." },
                { q: "Wi-Fi QR 코드는 모든 스마트폰에서 바로 연결되나요?", a: "네! 최신 iOS(아이폰) 및 Android(갤럭시 등) 기본 카메라 앱에서 스캔 시 자동으로 Wi-Fi 연결 팝업이 뜹니다." },
                { q: "SVG와 PNG 파일의 차이는 무엇인가요?", a: "PNG는 웹 공유나 문서용 비트맵 이미지이고, SVG는 아무리 확대해도 깨지지 않는 인쇄/디자인용 벡터 파일입니다." },
                { q: "입력한 Wi-Fi 비밀번호나 링크가 서버에 저장되나요?", a: "아닙니다. 100% 사용자의 브라우저 내에서 렌더링되므로 비밀번호가 외부로 유출될 위험이 전혀 없습니다." },
                { q: "상업적 용도로 인쇄물이나 상품에 사용해도 되나요?", a: "네, 개인 및 기업의 상업적 용도로 자유롭게 사용하실 수 있습니다." },
                { q: "이용료가 발생하나요?", a: "100% 영구 무료 서비스입니다." }
              ],
              relatedTools: [
                { title: "URL 인코더 / 디코더", desc: "한글 파라미터가 포함된 URL을 퍼센트 인코딩", href: "/tools/url-encoder/" },
                { title: "Base64 인코더 / 디코더", desc: "텍스트 및 파일 데이터를 Base64로 즉시 변환", href: "/tools/base64/" },
                { title: "파비콘(Favicon) 생성기", desc: "웹사이트용 고해상도 favicon.ico 및 다중 규격 아이콘 생성", href: "/tools/favicon-generator/" },
                { title: "이미지 리사이저", desc: "이미지 크기 및 해상도를 브라우저에서 무손실 조절", href: "/tools/image-resizer/" }
              ]
            },
            en: {
              aboutTitle: "About QR Code Generator",
              aboutDesc:
                "Create customized high-resolution QR codes instantly for website URLs, plain text messages, and one-tap Wi-Fi network logins. Customize colors, resolution, and quiet zones, and export in crisp PNG or lossless SVG vector formats. 100% browser-native generation guarantees your passwords and links remain private.",
              howTitle: "How to Generate and Download QR Codes",
              steps: [
                "Select your content type from the tabs above: 'URL', 'Text', or 'Wi-Fi'.",
                "Enter your website address, text note, or Wi-Fi network name (SSID) and security password.",
                "Customize foreground/background colors, pixel dimensions, and quiet zone margins in the design panel.",
                "Test scanning the live preview with your smartphone camera.",
                "Click 'Download PNG' for digital use or 'SVG Vector' for professional print media."
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "One-Tap Wi-Fi Auto Connect", desc: "Generates standard Wi-Fi QR protocols so guests can join networks instantly without typing complex passwords." },
                { title: "Lossless SVG & High-Res PNG Exports", desc: "Download ultra-crisp vector SVG files suitable for billboards, business cards, and brochures." },
                { title: "Custom Colors & Margin Padding", desc: "Match your corporate brand guidelines with custom foreground and background colors." },
                { title: "Direct Clipboard Image Copying", desc: "Copy the QR code image to your clipboard with one click to paste directly into Figma, Slack, or Docs." }
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "Café & Office Wi-Fi Signboards", desc: "Allow customers and guests to connect to Wi-Fi instantly with a quick camera scan." },
                { title: "Business Cards & Portfolios", desc: "Print QR codes on physical business cards linking to personal websites or LinkedIn." },
                { title: "Restaurant Digital Menus", desc: "Place QR codes on dining tables for contactless menu viewing and ordering." },
                { title: "Event Posters & Marketing Surveys", desc: "Drive foot traffic directly to registration forms, feedback surveys, or landing pages." }
              ],
              proTipsTitle: "Professional Tips for QR Printing & Scanning",
              proTips: [
                "Maintain high contrast between foreground and background (dark codes on light backgrounds scan most reliably).",
                "Always leave a quiet zone margin (at least 2 modules of blank space around the QR) to avoid scanning failures.",
                "Ensure printed codes on business cards are at least 2cm x 2cm (0.8 in x 0.8 in) in physical size.",
                "Provide vector SVG files to graphic designers and print shops to prevent pixelation on printed signage."
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "Do these QR codes expire or have scan limits?", a: "No. These are static QR codes that last forever with unlimited scans and no recurring fees." },
                { q: "Does Wi-Fi QR code scanning work automatically on smartphones?", a: "Yes. Modern iOS and Android camera apps automatically recognise Wi-Fi QR codes and display a 'Join Network' prompt." },
                { q: "What is the difference between PNG and SVG?", a: "PNG is a raster bitmap image great for websites, while SVG is an infinitely scalable vector format for sharp printing." },
                { q: "Is my Wi-Fi password or URL sent to any server?", a: "No. All rendering takes place 100% inside your browser memory for absolute privacy." },
                { q: "Can I use these QR codes for commercial projects?", a: "Yes, they are free for both personal and commercial use with no copyright restrictions." },
                { q: "Is this service completely free?", a: "Yes, 100% free with no hidden charges." }
              ],
              relatedTools: [
                { title: "URL Encoder / Decoder", desc: "Safely encode query parameters in URLs", href: "/tools/url-encoder/" },
                { title: "Base64 Encoder & Decoder", desc: "Convert text and binary payloads to and from Base64", href: "/tools/base64/" },
                { title: "Favicon Generator", desc: "Generate multi-size web favicons and app icons", href: "/tools/favicon-generator/" },
                { title: "Image Resizer", desc: "Resize and crop images with precision in your browser", href: "/tools/image-resizer/" }
              ]
            },
            ja: {
              aboutTitle: "QR コード生成器について",
              aboutDesc:
                "Web サイトの URL、テキスト、Wi-Fi 接続情報を高解像度な QR コードとして即座に作成できる無料オンラインツールです。ブランドカラーに合わせた色指定、余白調整、PNG および印刷用 ベクター SVG ダウンロードに対応。ブラウザ内で 100% 完結するため Wi-Fi パスワードや機密リンクも安心です。",
              howTitle: "QR コードの作成とダウンロード方法",
              steps: [
                "上部のタブから「URL」「Text」「Wi-Fi」のいずれかを選択します。",
                "Web アドレス、テキスト、または Wi-Fi のネットワーク名（SSID）とパスワードを入力します。",
                "カラーピッカーで前景色・背景色、サイズ、余白（マージン）を自由にカスタマイズします。",
                "右側のリアルタイムプレビューをスマートフォンのカメラで読み取ってテストします。",
                "「Download PNG」または印刷用の「SVG Vector」をクリックして保存します。"
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "Wi-Fi ワンタップ自動接続 QR", desc: "カメラをかざすだけで複雑なパスワード入力なしに Wi-Fi へ接続できる専用規格を生成します。" },
                { title: "高品質 PNG & ベクター SVG 出力", desc: "看板やチラシなどの印刷用途にも拡大劣化しない SVG 形式に対応しています。" },
                { title: "ブランドカラー & 余白調整", desc: "コーポレートカラーに合わせた自由な色設定とスキャン性を高める余白調整が可能です。" },
                { title: "クリップボードへの画像コピー", desc: "ダウンロード不要でそのまま Slack や Figma に貼り付け可能です。" }
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "店舗・オフィスの Wi-Fi 接続案内", desc: "パスワードを教える手間を省き、QR を読み取るだけで Wi-Fi 接続を完了" },
                { title: "名刺やポートフォリオへの掲載", desc: "印刷された名刺から Web サイトや SNS アカウントへスムーズに誘導" },
                { title: "飲食店のモバイルメニュー・注文", desc: "テーブル上に QR コードを配置して非接触注文システムを提供" },
                { title: "イベントポスターやチラシからの集客", desc: "アンケートフォームやキャンペーン特設ページへのアクセスを促進" }
              ],
              proTipsTitle: "QR コード印刷・スキャン精度のプロのコツ",
              proTips: [
                "認識率を保つため、背景色は明るく前景色は暗い十分なコントラストを確保してください。",
                "印刷時は QR コードの周囲に最低 2 モジュール以上の余白（クワイエットゾーン）を確保しましょう。",
                "名刺などの小型印刷物では、最低 2cm × 2cm 以上のサイズを推奨します。",
                "チラシやポスターなどの印刷物には、解像度の劣化がないベクター SVG 形式を使用してください。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "QR コードに有効期限や読み取り回数の制限はありますか？", a: "ありません。恒久的に有効な静的 QR コードですので無制限に読み取り可能です。" },
                { q: "Wi-Fi QR コードはスマホで直接認識されますか？", a: "はい、最新の iPhone や Android の標準カメラアプリでかざすだけで接続プロンプトが表示されます。" },
                { q: "PNG と SVG の違いは何ですか？", a: "PNG は一般的な画像ファイル、SVG はどれだけ拡大してもぼやけない印刷・デザイン向けベクターデータです。" },
                { q: "パスワードなどの情報がサーバーに送信されますか？", a: "送信されません。すべての描画処理はお手元のブラウザ内で安全に実行されます。" },
                { q: "商用利用は可能ですか？", a: "はい、個人・法人問わず商用印刷物等にも無料でご利用いただけます。" },
                { q: "無料で利用できますか？", a: "はい、完全無料でご利用いただけます。" }
              ],
              relatedTools: [
                { title: "URL エンコーダー / デコーダー", desc: "URL パラメータや特殊文字を安全にエンコード", href: "/tools/url-encoder/" },
                { title: "Base64 エンコーダー / デコーダー", desc: "文字列とバイナリデータを Base64 形式で相互変換", href: "/tools/base64/" },
                { title: "ファビコン (Favicon) 生成器", desc: "マルチサイズ対応の favicon.ico を作成", href: "/tools/favicon-generator/" },
                { title: "画像リサイザー", desc: "画像の縦横比を保ちながら高画質でリサイズ", href: "/tools/image-resizer/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Generador de Códigos QR",
              aboutDesc:
                "Genera códigos QR de alta resolución personalizados para direcciones URL, textos y conexiones automáticas a redes Wi-Fi. Personaliza colores, dimensiones y márgenes con descarga en formato PNG nítido o SVG vectorial sin pérdidas. Procesamiento 100% en el navegador para mantener tus datos privados.",
              howTitle: "Cómo Generar y Descargar Códigos QR",
              steps: [
                "Elige el tipo de contenido en las pestañas superiores: 'URL', 'Texto' o 'Wi-Fi'.",
                "Introduce la dirección web, el texto o los datos de tu red Wi-Fi (SSID y contraseña).",
                "Personaliza los colores de primer plano y fondo, la resolución y la zona de silencio.",
                "Escanea la vista previa con la cámara de tu smartphone para comprobar su legibilidad.",
                "Pulsa 'Download PNG' para uso digital o 'SVG Vector' para impresión profesional."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Conexión Wi-Fi Automática en 1 Toque", desc: "Genera el protocolo estándar para que tus invitados se conecten sin teclear contraseñas." },
                { title: "Exportación en SVG Vectorial y PNG", desc: "Descarga archivos vectoriales escalables ideales para carteles, tarjetas y folletos." },
                { title: "Colores y Márgenes Personalizados", desc: "Ajusta la paleta cromática a la identidad visual de tu marca." },
                { title: "Copia Directa al Portapapeles", desc: "Copia la imagen del código QR con un clic para pegarla en Figma, Slack o presentaciones." }
              ],
              useCasesTitle: "Casos de Uso Comunes",
              useCases: [
                { title: "Acceso Wi-Fi en Cafeterías y Oficinas", desc: "Permite a tus clientes conectarse al instante escaneando el código QR en la mesa." },
                { title: "Tarjetas de Visita y Portafolios", desc: "Imprime enlaces directos a tu web o LinkedIn en soportes físicos." },
                { title: "Menús Digitales de Restaurantes", desc: "Ubica códigos QR en mesas para visualización de cartas sin contacto." },
                { title: "Carteles de Eventos y Encuestas", desc: "Dirige a los asistentes a formularios de registro o páginas promocionales." }
              ],
              proTipsTitle: "Consejos Profesionales para Códigos QR",
              proTips: [
                "Asegura un alto contraste (código oscuro sobre fondo claro) para garantizar un escaneo rápido.",
                "Deja siempre un margen de seguridad (zona de silencio de al menos 2 módulos) alrededor del código.",
                "En tarjetas de presentación, mantén un tamaño mínimo de 2 cm x 2 cm.",
                "Envía archivos SVG vectoriales a las imprentas para evitar pérdida de nitidez en gran formato."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Caducan estos códigos QR o tienen límite de escaneos?", a: "No. Son códigos estáticos permanentes sin límite de lecturas ni cuotas." },
                { q: "¿Funciona el código Wi-Fi automáticamente en smartphones?", a: "Sí. Las cámaras de iOS y Android reconocen la red y ofrecen la opción de unirse de inmediato." },
                { q: "¿Cuál es la diferencia entre PNG y SVG?", a: "PNG es una imagen bitmap para pantallas; SVG es un gráfico vectorial escalable al infinito para imprenta." },
                { q: "¿Se guardan mis contraseñas o URLs en algún servidor?", a: "No. Todo el renderizado se realiza de forma 100% local en tu navegador." },
                { q: "¿Puedo usarlos comercialmente?", a: "Sí, son totalmente libres para fines personales y comerciales." },
                { q: "¿Es completamente gratuito?", a: "Sí, 100% gratuito sin costes ocultos." }
              ],
              relatedTools: [
                { title: "Codificador / Decodificador URL", desc: "Codifica parámetros en URLs de forma segura", href: "/tools/url-encoder/" },
                { title: "Codificador / Decodificador Base64", desc: "Convierte texto y archivos a formato Base64", href: "/tools/base64/" },
                { title: "Generador de Favicon", desc: "Crea iconos web en múltiples resoluciones", href: "/tools/favicon-generator/" },
                { title: "Redimensionador de Imágenes", desc: "Ajusta dimensiones y calidad de imágenes en tu navegador", href: "/tools/image-resizer/" }
              ]
            },
            zh: {
              aboutTitle: "关于 QR 二维码生成器",
              aboutDesc:
                "支持在浏览器中即时将网址链接（URL）、纯文本或 Wi-Fi 无线网络连接信息生成为高清个性化二维码。支持自定义前景色与背景色、静区边距调整，并可一键导出清晰 PNG 或印刷级无损矢量 SVG 文件。100% 客户端本地计算，Wi-Fi 密码与私密链接绝不上传服务器。",
              howTitle: "如何生成与下载 QR 二维码",
              steps: [
                "在顶部标签页中选择类型：“URL 网址”、“Text 纯文本”或“Wi-Fi 网络”。",
                "输入目标网址、文字备忘或 Wi-Fi 名称（SSID）与连接密码。",
                "在下方设计面板中根据品牌视觉自定义前景色、背景色、尺寸分辨率及留白边距。",
                "在右侧实时预览区使用手机相机扫码测试识别效果。",
                "点击“Download PNG”下载位图或“SVG Vector”下载印刷级矢量源文件，亦可点击“Copy Image”直接复制。"
              ],
              featuresTitle: "核心功能与特点",
              features: [
                { title: "一键扫码直连 Wi-Fi 协议", desc: "生成标准 Wi-Fi 协议二维码，顾客与访客无需繁琐输入密码即可一键联网。" },
                { title: "无损矢量 SVG 与超清 PNG 双格式", desc: "完美适用于展会易拉宝、名片印刷与宣传手册制作，无限放大不失真。" },
                { title: "多色系与静区（Margin）微调", desc: "随心搭配符合企业品牌调性的色彩方案，并可调整四周安全留白。" },
                { title: "剪贴板图片秒级直接复制", desc: "免去下载存储文件步骤，一键复制后直接粘贴至 Figma、微信或 PPT 中。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "咖啡厅与企业前台 Wi-Fi 接入指示牌", desc: "免去口头询问密码的麻烦，顾客扫码即可自动完成 Wi-Fi 鉴权与联网。" },
                { title: "纸质商务名片与作品集印制", desc: "在实体名片上印制个人主页、GitHub 或电子简历的二维码入口。" },
                { title: "餐饮门店桌贴扫码点餐系统", desc: "在餐桌张贴二维码，引导顾客自助扫码进入移动端菜单与结账页面。" },
                { title: "展会海报与营销问卷直达", desc: "在线下活动现场引导观众扫码参与抽奖、填写调查问卷或关注公众号。" }
              ],
              proTipsTitle: "提高二维码印刷与扫码识别率的技巧",
              proTips: [
                "前景色与背景色之间务必保持高对比度（深色码配浅色底识别最为灵敏）。",
                "排版设计时在二维码周围保留至少 2 个模块宽度的空白静区（Quiet Zone），防止邻近图案干扰。",
                "名片等小型印刷品上的二维码实际印刷尺寸建议不小于 2cm x 2cm。",
                "印刷大型海报或画册时，务必将无损的 SVG 矢量文件交付给印刷厂以防模糊。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "生成的二维码有有效期或扫码次数限制吗？", a: "完全没有。生成的属于静态标准二维码，永久有效且扫码次数无任何限制。" },
                { q: "Wi-Fi 二维码支持所有手机直接扫码吗？", a: "是的！主流 iOS（iPhone）及 Android（华为、小米等）原生相机均可直接识别并弹出联网提示。" },
                { q: "PNG 与 SVG 格式有何区别？", a: "PNG 适用于屏幕显示与网络传播；SVG 为矢量格式，无限放大依然绝对清晰，专用于专业印刷。" },
                { q: "输入的 Wi-Fi 密码或链接会被上传到服务器吗？", a: "绝对不会。所有图像生成 100% 在您本地浏览器中进行，密码绝无泄露风险。" },
                { q: "可以用于商业项目与商品包装吗？", a: "可以，完全免费开放商业使用。" },
                { q: "该服务收费吗？", a: "永久 100% 免费。" }
              ],
              relatedTools: [
                { title: "URL 编码 / 解码器", desc: "URI 网址参数及特殊符号的百分号安全编码", href: "/tools/url-encoder/" },
                { title: "Base64 编码 / 解码工具", desc: "文本与二进制数据的 Base64 双向即时转换", href: "/tools/base64/" },
                { title: "Favicon 网站图标生成器", desc: "快速生成多尺寸 favicon.ico 与 App 图标", href: "/tools/favicon-generator/" },
                { title: "图片尺寸调整 (Resizer)", desc: "在浏览器中高质量调整图片分辨率与尺寸", href: "/tools/image-resizer/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Générateur de QR Code",
              aboutDesc:
                "Créez instantanément des QR codes haute résolution personnalisés pour vos adresses URL, textes bruts et connexions automatiques aux réseaux Wi-Fi. Personnalisez les couleurs, les dimensions et les marges de sécurité avec téléchargement en PNG net ou SVG vectoriel sans perte. Traitement 100% local dans votre navigateur.",
              howTitle: "Comment Générer et Télécharger vos QR Codes",
              steps: [
                "Choisissez le type de contenu dans les onglets : 'URL', 'Texte' ou 'Wi-Fi'.",
                "Saisissez votre lien web, votre texte ou les identifiants de votre réseau Wi-Fi (SSID et mot de passe).",
                "Personnalisez les couleurs, les dimensions et la zone de silence dans le volet de design.",
                "Scannez l'aperçu en direct avec l'appareil photo de votre smartphone pour tester.",
                "Cliquez sur 'Download PNG' pour le web ou 'SVG Vector' pour l'impression professionnelle."
              ],
              featuresTitle: "Fonctionnalités Clés",
              features: [
                { title: "Connexion Wi-Fi Automatique en 1 Scan", desc: "Générez le protocole standard permettant aux invités de se connecter sans taper de mot de passe." },
                { title: "Exports Vectoriels SVG et PNG Haute Résolution", desc: "Téléchargez des fichiers vectoriels nets pour affiches, cartes de visite et brochures." },
                { title: "Couleurs et Marges Entièrement Réglables", desc: "Adaptez le QR code à la charte graphique de votre marque." },
                { title: "Copie Directe d'Image dans le Presse-Papiers", desc: "Copiez l'image en un clic pour la coller directement dans Figma, Slack ou Word." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Accès Wi-Fi pour Cafés et Bureaux", desc: "Permettez à vos clients de se connecter au réseau sans demander le mot de passe." },
                { title: "Cartes de Visite et CV Imprimés", desc: "Imprimez un QR code renvoyant vers votre portfolio en ligne ou profil LinkedIn." },
                { title: "Menus de Restaurant sans Contact", desc: "Disposez des QR codes sur les tables pour afficher la carte sur mobile." },
                { title: "Affiches d'Événements et Questionnaires", desc: "Dirigez les visiteurs vers des formulaires d'inscription ou pages d'accueil." }
              ],
              proTipsTitle: "Conseils d'Experts pour l'Impression et la Lecture",
              proTips: [
                "Assurez un contraste élevé entre le code et le fond (motif sombre sur fond clair) pour une lecture rapide.",
                "Conservez toujours une marge de sécurité (zone de silence d'au moins 2 modules) autour du code.",
                "Sur les cartes de visite, prévoyez une taille minimale de 2 cm x 2 cm.",
                "Transmettez des fichiers SVG vectoriels à vos imprimeurs pour éviter toute pixellisation."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Les QR codes ont-ils une date d'expiration ?", a: "Non. Ce sont des QR codes statiques valables indéfiniment avec scans illimités." },
                { q: "Le scan Wi-Fi fonctionne-t-il sur tous les smartphones ?", a: "Oui. Les appareils photo natifs d'iOS et Android reconnaissent le réseau et proposent de s'y connecter directement." },
                { q: "Quelle est la différence entre PNG et SVG ?", a: "Le PNG est une image matricielle pour le web ; le SVG est un format vectoriel parfait pour l'impression haute définition." },
                { q: "Mes mots de passe Wi-Fi sont-ils enregistrés ?", a: "Non. Toute la création se fait à 100% dans la mémoire de votre navigateur." },
                { q: "Puis-je les utiliser à des fins commerciales ?", a: "Oui, totalement gratuits pour un usage personnel et commercial." },
                { q: "L'outil est-il gratuit ?", a: "Oui, 100% gratuit et sans frais cachés." }
              ],
              relatedTools: [
                { title: "Encodeur / Décodeur d'URL", desc: "Encodez les composants d'URL et paramètres de requête", href: "/tools/url-encoder/" },
                { title: "Encodeur / Décodeur Base64", desc: "Convertissez textes et fichiers au format Base64", href: "/tools/base64/" },
                { title: "Générateur de Favicon", desc: "Créez des favicons et icônes d'application web", href: "/tools/favicon-generator/" },
                { title: "Redimensionneur d'Images", desc: "Ajustez les dimensions de vos images dans votre navigateur", href: "/tools/image-resizer/" }
              ]
            }
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
