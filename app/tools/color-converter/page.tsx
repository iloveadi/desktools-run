"use client";

/**
 * app/tools/color-converter/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Color Converter & Palette Generator Tool for desktools.run
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Palette,
  ArrowLeft,
  Copy,
  Check,
  Pipette,
  Sparkles,
  Layers,
  Sun,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

// ── Precise Color Math Helpers ─────────────────────────────────

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

function hexToRgb(hex: string): RGB {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function rgbToCmyk(r: number, g: number, b: number): CMYK {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(rgb1: RGB, rgb2: RGB): number {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export default function ColorConverterPage() {
  const { t } = useLocale();

  const [rgb, setRgb] = useState<RGB>({ r: 99, g: 102, b: 241 });
  const [hexInput, setHexInput] = useState("#6366F1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const hex = useMemo(() => rgbToHex(rgb.r, rgb.g, rgb.b), [rgb]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);

  useEffect(() => {
    setHexInput(hex);
  }, [hex]);

  const handleHexChange = useCallback((newHex: string) => {
    setHexInput(newHex);
    if (/^#?[0-9A-Fa-f]{6}$/.test(newHex)) {
      setRgb(hexToRgb(newHex));
    }
  }, []);

  const handleEyeDropper = useCallback(async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          handleHexChange(result.sRGBHex);
        }
      } catch (err) {
        console.error("EyeDropper error:", err);
      }
    }
  }, [handleHexChange]);

  const whiteContrast = useMemo(
    () => getContrastRatio(rgb, { r: 255, g: 255, b: 255 }).toFixed(2),
    [rgb]
  );
  const blackContrast = useMemo(
    () => getContrastRatio(rgb, { r: 0, g: 0, b: 0 }).toFixed(2),
    [rgb]
  );

  const shadesPalette = useMemo(() => {
    return [10, 20, 30, 40, 50, 60, 70, 80, 90].map((lightness) => {
      const shadeRgb = hslToRgb(hsl.h, hsl.s, lightness);
      return {
        lightness: `${lightness}%`,
        hex: rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b),
        rgb: shadeRgb,
      };
    });
  }, [hsl]);

  const harmonies = useMemo(() => {
    const compRgb = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
    const ana1Rgb = hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l);
    const ana2Rgb = hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l);
    const tri1Rgb = hslToRgb((hsl.h - 120 + 360) % 360, hsl.s, hsl.l);
    const tri2Rgb = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l);

    return {
      complementary: [
        { hex: hex, label: "Base" },
        { hex: rgbToHex(compRgb.r, compRgb.g, compRgb.b), label: "Complementary (+180°)" },
      ],
      analogous: [
        { hex: rgbToHex(ana1Rgb.r, ana1Rgb.g, ana1Rgb.b), label: "-30°" },
        { hex: hex, label: "Base" },
        { hex: rgbToHex(ana2Rgb.r, ana2Rgb.g, ana2Rgb.b), label: "+30°" },
      ],
      triadic: [
        { hex: rgbToHex(tri1Rgb.r, tri1Rgb.g, tri1Rgb.b), label: "-120°" },
        { hex: hex, label: "Base" },
        { hex: rgbToHex(tri2Rgb.r, tri2Rgb.g, tri2Rgb.b), label: "+120°" },
      ],
    };
  }, [hsl, hex]);

  const handleCopy = useCallback((key: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* ── Breadcrumb & Header Summary ───────────────── */}
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
            Back to All Tools
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div
                  className="icon-design"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Palette size={20} />
                </div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "var(--text-primary)",
                  }}
                >
                  {t("colorGen.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
                {t("colorGen.subtitle")}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "var(--btn-secondary-bg)",
                border: "1px solid var(--btn-secondary-border)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              <Sparkles size={12} style={{ color: "#ec4899" }} />
              High-Precision Color Math
            </div>
          </div>
        </section>

        {/* ── Main Tool Workspace ───────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {/* ── Large Visual Swatch & Contrast Hero Banner ─ */}
          <div
            className="glass-card color-hero-grid"
            style={{
              padding: "32px",
              marginBottom: "28px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "28px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                height: "220px",
                borderRadius: "20px",
                background: hex,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                boxShadow: `0 12px 32px ${hex}33`,
                border: "1px solid rgba(255,255,255,0.2)",
                position: "relative",
                transition: "background 0.2s ease",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                White Text ({whiteContrast}:1)
              </div>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#000000",
                }}
              >
                Black Text ({blackContrast}:1)
              </div>

              <input
                type="color"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "16px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "2px solid white",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
                title={t("colorGen.picker")}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    borderRadius: "12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    color: "var(--text-primary)",
                    fontSize: "22px",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono), monospace",
                    letterSpacing: "1px",
                    outline: "none",
                  }}
                />

                {typeof window !== "undefined" && "EyeDropper" in window && (
                  <button
                    onClick={handleEyeDropper}
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "12px",
                      background: "rgba(236,72,153,0.15)",
                      border: "1px solid rgba(236,72,153,0.3)",
                      color: "#ec4899",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    title="Eyedropper Tool"
                  >
                    <Pipette size={22} />
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: parseFloat(whiteContrast) >= 4.5 ? "rgba(34,211,168,0.15)" : "var(--btn-secondary-bg)",
                    border: parseFloat(whiteContrast) >= 4.5 ? "1px solid rgba(34,211,168,0.4)" : "1px solid var(--btn-secondary-border)",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: parseFloat(whiteContrast) >= 4.5 ? "#34d399" : "var(--text-muted)",
                  }}
                >
                  White AA: {parseFloat(whiteContrast) >= 4.5 ? "Pass ✓" : "Fail ✗"} ({whiteContrast}:1)
                </div>

                <div
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: parseFloat(blackContrast) >= 4.5 ? "rgba(34,211,168,0.15)" : "var(--btn-secondary-bg)",
                    border: parseFloat(blackContrast) >= 4.5 ? "1px solid rgba(34,211,168,0.4)" : "1px solid var(--btn-secondary-border)",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: parseFloat(blackContrast) >= 4.5 ? "#34d399" : "var(--text-muted)",
                  }}
                >
                  Black AA: {parseFloat(blackContrast) >= 4.5 ? "Pass ✓" : "Fail ✗"} ({blackContrast}:1)
                </div>
              </div>
            </div>
          </div>

          {/* ── Multi-Format Color Codes Cards Grid ─────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {[
              { key: "HEX", title: t("colorGen.hex"), val: hex },
              { key: "RGB", title: t("colorGen.rgb"), val: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
              { key: "HSL", title: t("colorGen.hsl"), val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
              { key: "HSV", title: t("colorGen.hsv"), val: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
              { key: "CMYK", title: t("colorGen.cmyk"), val: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
            ].map(({ key, title, val }) => (
              <div
                key={key}
                className="glass-card"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    {title}
                  </span>
                  <button
                    onClick={() => handleCopy(key, val)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: copiedKey === key ? "rgba(34,211,168,0.2)" : "var(--btn-secondary-bg)",
                      border: copiedKey === key ? "1px solid rgba(34,211,168,0.4)" : "1px solid var(--btn-secondary-border)",
                      color: copiedKey === key ? "#34d399" : "var(--text-secondary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copiedKey === key ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === key ? t("colorGen.copied") : t("colorGen.copy")}
                  </button>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    background: "rgba(0,0,0,0.15)",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>

          {/* ── Tints & Shades Palette Bar ───────────────── */}
          <div className="glass-card" style={{ padding: "24px", marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Sun size={18} style={{ color: "#fbbf24" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                {t("colorGen.shades")}
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(9, 1fr)",
                gap: "8px",
              }}
              className="shades-grid"
            >
              {shadesPalette.map((shade, idx) => (
                <div
                  key={idx}
                  onClick={() => handleHexChange(shade.hex)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "56px",
                      borderRadius: "10px",
                      background: shade.hex,
                      border: shade.hex === hex ? "2px solid white" : "1px solid rgba(255,255,255,0.1)",
                      boxShadow: shade.hex === hex ? "0 0 16px rgba(99,102,241,0.5)" : "none",
                      transition: "transform 0.15s ease",
                    }}
                    title={`Select ${shade.hex} (${shade.lightness})`}
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {shade.lightness}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Color Harmonies Section ───────────────────── */}
          <div className="glass-card" style={{ padding: "24px", marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Layers size={18} style={{ color: "#a855f7" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                {t("colorGen.harmonies")}
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  Complementary (보색 - 180° Contrast)
                </span>
                <div style={{ display: "flex", gap: "10px" }}>
                  {harmonies.complementary.map((h, i) => (
                    <div
                      key={i}
                      onClick={() => handleHexChange(h.hex)}
                      style={{
                        flex: 1,
                        height: "54px",
                        borderRadius: "10px",
                        background: h.hex,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: getContrastRatio(hexToRgb(h.hex), { r: 255, g: 255, b: 255 }) > 4.5 ? "white" : "black",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {h.hex}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  Analogous (유사색 - ±30° Harmony)
                </span>
                <div style={{ display: "flex", gap: "10px" }}>
                  {harmonies.analogous.map((h, i) => (
                    <div
                      key={i}
                      onClick={() => handleHexChange(h.hex)}
                      style={{
                        flex: 1,
                        height: "54px",
                        borderRadius: "10px",
                        background: h.hex,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: getContrastRatio(hexToRgb(h.hex), { r: 255, g: 255, b: 255 }) > 4.5 ? "white" : "black",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {h.hex}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────────── */}
        <ToolGuide
          badgeText="100% Free & Browser-Native"
          aboutTitle={t("colorGen.guide.aboutTitle") || "색상 변환기 및 팔레트 도구란 무엇인가요?"}
          aboutDesc={t("colorGen.guide.aboutDesc") || "웹 디자이너와 개발자를 위한 정밀 색상 변환 도구입니다. HEX, RGB, HSL, HSV, CMYK 색상 코드 간 상호 변환 및 WCAG 접근성 명암비(AA/AAA) 체크, 명암 틴트 팔레트 및 보색/유사색 팔레트를 생성해 줍니다."}
          howTitle={t("colorGen.guide.howTitle") || "사용 방법"}
          steps={[
            t("colorGen.guide.step1") || "HEX 입력을 수정을 하거나 색상 스와치를 클릭해 원하는 색상을 정밀하게 선택합니다.",
            t("colorGen.guide.step2") || "HEX, RGB, HSL, CMYK 코드가 실시간 변환되는 것을 확인하고 원하는 코드 옆의 '복사'를 누릅니다.",
            t("colorGen.guide.step3") || "하단의 틴트/셰이드 팔레트와 보색/유사색 조화 팔레트를 자유롭게 클릭해 활용하세요.",
          ]}
          faqs={[
            { q: t("colorGen.guide.faq1Q") || "웹용 RGB와 인쇄용 CMYK의 차이는 무엇인가요?", a: t("colorGen.guide.faq1A") || "RGB는 모니터의 빛을 조합하는 가산 혼합 방식이며, CMYK는 인쇄용 잉크를 조합하는 감산 혼합 방식입니다." },
            { q: t("colorGen.guide.faq2Q") || "WCAG 명암비 기준(AA / AAA)이란 무엇인가요?", a: t("colorGen.guide.faq2A") || "웹 접근성 지침으로 일반 텍스트는 4.5:1 이상(AA 기준)의 명암비를 유지해야 가독성이 우수해집니다." },
            { q: t("colorGen.guide.faq3Q") || "화면 스포이트(EyeDropper) 기능은 어떻게 쓰나요?", a: t("colorGen.guide.faq3A") || "입력창 옆의 스포이트 아이콘을 누르면 모니터 화면 전체의 원하는 색상을 바로 추출할 수 있습니다. (크롬/엣지 지원)" },
          ]}
        />
      </main>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .color-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .shades-grid {
            grid-template-columns: repeat(5, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}
