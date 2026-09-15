"use client";

/**
 * app/tools/color-converter/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Color Converter & Palette Generator Tool for desktools.run
 * 100% Client-Side with full 6-language SEO support
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
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
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
  const { locale, t } = useLocale();

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
        lightness,
        hex: rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b),
      };
    });
  }, [hsl]);

  const harmonies = useMemo(() => {
    const compHue = (hsl.h + 180) % 360;
    const compRgb = hslToRgb(compHue, hsl.s, hsl.l);

    const anal1Hue = (hsl.h + 30) % 360;
    const anal1Rgb = hslToRgb(anal1Hue, hsl.s, hsl.l);
    const anal2Hue = (hsl.h + 330) % 360;
    const anal2Rgb = hslToRgb(anal2Hue, hsl.s, hsl.l);

    const tri1Hue = (hsl.h + 120) % 360;
    const tri1Rgb = hslToRgb(tri1Hue, hsl.s, hsl.l);
    const tri2Hue = (hsl.h + 240) % 360;
    const tri2Rgb = hslToRgb(tri2Hue, hsl.s, hsl.l);

    return {
      complementary: rgbToHex(compRgb.r, compRgb.g, compRgb.b),
      analogous: [
        { hex: rgbToHex(anal1Rgb.r, anal1Rgb.g, anal1Rgb.b), hue: "+30°" },
        { hex, hue: "0°" },
        { hex: rgbToHex(anal2Rgb.r, anal2Rgb.g, anal2Rgb.b), hue: "-30°" },
      ],
      triadic: [
        { hex, hue: "Base" },
        { hex: rgbToHex(tri1Rgb.r, tri1Rgb.g, tri1Rgb.b), hue: "+120°" },
        { hex: rgbToHex(tri2Rgb.r, tri2Rgb.g, tri2Rgb.b), hue: "+240°" },
      ],
    };
  }, [hsl, hex]);

  const copyCode = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  return (
    <>
      <ToolUsageTracker toolId="color-converter" />
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Breadcrumb & Header */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 20px" }}>
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
            {t("colorGen.back") || "Back to Tools"}
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "rgba(236,72,153,0.15)",
                color: "#ec4899",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Palette size={22} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("colorGen.title") || "Color Converter & Palette Generator"}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            {t("colorGen.subtitle") || "Convert HEX, RGB, HSL, HSV, and CMYK color codes with harmonic palettes & WCAG contrast analysis."}
          </p>
        </section>

        {/* Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Main Color Grid */}
          <div
            className="color-hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "340px 1fr",
              gap: "24px",
            }}
          >
            {/* Color Swatch & Live Preview */}
            <div
              className="glass-card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "180px",
                  borderRadius: "14px",
                  background: hex,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "16px",
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  {hex}
                </div>
              </div>

              {/* Native Color Picker & Hex Input */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  style={{
                    width: "52px",
                    height: "44px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    padding: 0,
                    background: "transparent",
                  }}
                />
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  style={{
                    flex: 1,
                    height: "44px",
                    borderRadius: "10px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    padding: "0 14px",
                    fontSize: "15px",
                    fontWeight: 700,
                    fontFamily: "ui-monospace, monospace",
                  }}
                />
                {typeof window !== "undefined" && "EyeDropper" in window && (
                  <button
                    onClick={handleEyeDropper}
                    title="Pick Color from Screen"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "#818cf8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Pipette size={18} />
                  </button>
                )}
              </div>

              {/* WCAG Contrast Ratio Checker */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                  WCAG Accessibility Contrast
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>on White</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: Number(whiteContrast) >= 4.5 ? "#4ade80" : "#f87171" }}>
                      {whiteContrast}:1 ({Number(whiteContrast) >= 4.5 ? "AA Pass" : "Fail"})
                    </span>
                  </div>
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>on Black</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: Number(blackContrast) >= 4.5 ? "#4ade80" : "#f87171" }}>
                      {blackContrast}:1 ({Number(blackContrast) >= 4.5 ? "AA Pass" : "Fail"})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Color Formats Conversion List */}
            <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                {t("colorGen.formatsTitle") || "Color Format Codes"}
              </div>

              {[
                { label: "HEX", code: hex, desc: "Standard Web / CSS Hexadecimal" },
                { label: "RGB", code: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, desc: "Red, Green, Blue (0 - 255)" },
                { label: "HSL", code: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, desc: "Hue, Saturation, Lightness" },
                { label: "HSV", code: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`, desc: "Hue, Saturation, Value" },
                { label: "CMYK", code: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, desc: "Cyan, Magenta, Yellow, Key (Print)" },
              ].map((fmt) => (
                <div
                  key={fmt.label}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#818cf8", width: "45px" }}>
                        {fmt.label}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "ui-monospace, monospace" }}>
                        {fmt.code}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "53px" }}>
                      {fmt.desc}
                    </span>
                  </div>

                  <button
                    onClick={() => copyCode(fmt.label, fmt.code)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: copiedKey === fmt.label ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
                      border: "1px solid var(--border-subtle)",
                      color: copiedKey === fmt.label ? "#4ade80" : "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copiedKey === fmt.label ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === fmt.label ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tints & Shades Palette */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              <Sun size={18} color="#fbbf24" />
              Tints & Shades Palette (10% - 90% Lightness)
            </div>

            <div
              className="shades-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(9, 1fr)",
                gap: "8px",
              }}
            >
              {shadesPalette.map((s) => (
                <div
                  key={s.lightness}
                  onClick={() => handleHexChange(s.hex)}
                  style={{
                    height: "70px",
                    borderRadius: "10px",
                    background: s.hex,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: "6px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: s.lightness > 50 ? "#000000" : "#ffffff",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {s.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Harmonic Color Palettes */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              <Sparkles size={18} color="#ec4899" />
              Harmonic Color Combinations
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {/* Complementary */}
              <div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  Complementary (보색 - 180°)
                </span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div
                    onClick={() => handleHexChange(hex)}
                    style={{
                      flex: 1,
                      height: "54px",
                      borderRadius: "10px",
                      background: hex,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: getContrastRatio(rgb, { r: 255, g: 255, b: 255 }) > 4.5 ? "white" : "black",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    {hex}
                  </div>
                  <div
                    onClick={() => handleHexChange(harmonies.complementary)}
                    style={{
                      flex: 1,
                      height: "54px",
                      borderRadius: "10px",
                      background: harmonies.complementary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: getContrastRatio(hexToRgb(harmonies.complementary), { r: 255, g: 255, b: 255 }) > 4.5 ? "white" : "black",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    {harmonies.complementary}
                  </div>
                </div>
              </div>

              {/* Analogous */}
              <div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  Analogous (유사색 - ±30°)
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

        {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "색상 변환기 및 인터랙티브 팔레트 생성기 소개",
              aboutDesc:
                "웹 디자이너, UI/UX 전문가 및 프론트엔드 개발자를 위한 고정밀 색상 변환 도구입니다. HEX, RGB, HSL, HSV, 인쇄용 CMYK 색상 코드를 실시간으로 상호 변환하고, WCAG 웹 접근성 명암비(AA/AAA 기준) 검사 및 명암 틴트/셰이드 팔레트, 보색 및 유사색 조화 팔레트를 100% 브라우저 로컬에서 안전하게 생성합니다.",
              howTitle: "색상 변환기 및 피커 사용 방법",
              steps: [
                "HEX 코드 입력란에 원하는 색상을 입력하거나 컬러 스와치 또는 스포이트(EyeDropper)로 화면 색상을 추출합니다.",
                "실시간 색상 변환기를 통해 HEX, RGB, HSL, HSV, CMYK 코드가 즉시 동기화되는 것을 확인합니다.",
                "우측 패널에서 각 색상 포맷 옆의 'Copy' 버튼을 눌러 CSS/디자인 코드에 적용할 코드를 복사합니다.",
                "좌측 하단에서 흰색 및 검은색 배경에 대한 WCAG 명암비(4.5:1 AA 통과 여부)를 점검합니다.",
                "하단의 틴트/셰이드 9단계 팔레트 및 보색/유사색 하모니 팔레트를 클릭하여 세부 색조를 탐색합니다."
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "HEX / RGB / HSL / HSV / CMYK 5단 변환", desc: "웹 표준 CSS 컬러 포맷부터 출판 인쇄용 CMYK 잉크 비율까지 1초 만에 상호 변환합니다." },
                { title: "WCAG 2.1 접근성 명암비 실시간 판정", desc: "텍스트 가독성을 보장하기 위해 흰색/검은색 배경 대비 비율을 계산하고 AA 적합 여부를 안내합니다." },
                { title: "9단계 틴트 & 셰이드(Tints & Shades) 추출", desc: "기본 색상의 명도를 10%부터 90%까지 세분화한 디자이너용 명암 팔레트를 자동 렌더링합니다." },
                { title: "보색(Complementary) & 유사색(Analogous) 하모니", desc: "색상환(Color Wheel) 180° 보색 및 ±30° 유사색 배색 조합을 클릭 한 번으로 제공합니다." }
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "웹 UI 디자인 시스템 색상 토큰 정의", desc: "Primary, Secondary 브랜드 색상의 100~900단계 명암 팔레트 및 CSS 변수 코드 구성" },
                { title: "웹 접근성(A11y) 텍스트 명암비 검수", desc: "버튼 텍스트나 배경색의 명암비가 4.5:1 이상을 충족하는지 사전 검증" },
                { title: "인쇄물 제작 시 웹 컬러(RGB) ➔ CMYK 변환", desc: "웹사이트 로고 및 그래픽 에셋의 CMYK 인쇄 잉크 배합 비율 확인" },
                { title: "화면 색상 즉시 추출 (EyeDropper)", desc: "참고 웹사이트나 디자인 시안의 특정 픽셀 색상을 클릭 한 번으로 스포이트 추출" }
              ],
              proTipsTitle: "색상 배색 및 접근성 전문가 실무 팁",
              proTips: [
                "일반 본문 텍스트는 WCAG AA 기준인 4.5:1 이상의 명암비를 충족해야 저시력 사용자도 편안하게 읽을 수 있습니다.",
                "RGB는 빛의 삼원색(가산 혼합)이며, CMYK는 잉크의 사원색(감산 혼합)이므로 모니터와 실제 인쇄물의 채도 차이가 발생할 수 있습니다.",
                "HSL의 H(Hue: 0~360)에 180을 더하면 언제나 완벽한 대비를 이루는 보색(Complementary Color)을 얻을 수 있습니다.",
                "눈의 피로를 줄이려면 순수한 검정(#000000) 대신 짙은 네이비나 다크 그레이 계열 색상을 본문에 사용하는 것이 좋습니다."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "화면 스포이트(EyeDropper)는 어떤 브라우저에서 동작하나요?", a: "Chrome, Edge, Opera 등 최신 Chromium 기반 브라우저에서 화면 전체 픽셀 추출을 완벽 지원합니다." },
                { q: "RGB와 CMYK 변환 시 색상 차이가 생기는 이유는 무엇인가요?", a: "RGB는 화면 발광 색 공간이고 CMYK는 인쇄 잉크 색 공간이므로 물리적인 표현 영역(Color Gamut)의 차이가 존재하기 때문입니다." },
                { q: "WCAG 명암비 기준이란 무엇인가요?", a: "웹 콘텐츠 접근성 지침으로 일반 텍스트는 최소 4.5:1, 대형 텍스트(18pt 이상)는 3:1 이상의 명암비를 권장합니다." },
                { q: "변환된 CSS 코드를 바로 복사할 수 있나요?", a: "네! 포맷별 우측 'Copy' 버튼을 누르면 클립보드에 즉시 복사됩니다." },
                { q: "입력한 색상 정보가 외부 서버에 전송되나요?", a: "전혀 전송되지 않습니다. 모든 계산과 팔레트 생성이 브라우저 내부에서 100% 로컬로 처리됩니다." },
                { q: "완전 무료인가요?", a: "네, 아무런 제한 없이 영구적으로 완전 무료로 제공됩니다." }
              ],
              relatedTools: [
                { title: "단위 변환기", desc: "길이, 무게, 넓이, 부피, 속도 등 다차원 단위 실시간 환산", href: "/tools/unit-converter/" },
                { title: "파비콘(Favicon) 생성기", desc: "웹사이트용 고해상도 favicon.ico 및 다중 규격 아이콘 생성", href: "/tools/favicon-generator/" },
                { title: "QR 코드 생성기", desc: "맞춤형 색상 및 스타일로 고해상도 QR 코드 제작", href: "/tools/qr-generator/" },
                { title: "이미지 워터마크 추가", desc: "브라우저에서 이미지에 텍스트 및 로고 워터마크 합성", href: "/tools/image-watermark/" }
              ]
            },
            en: {
              aboutTitle: "About Color Converter & Palette Generator",
              aboutDesc:
                "A precision color conversion and palette generation utility for UI/UX designers and frontend developers. Seamlessly convert between HEX, RGB, HSL, HSV, and CMYK color spaces in real-time. Analyze WCAG 2.1 contrast ratios (AA/AAA) and generate 9-step tints/shades palettes along with complementary and analogous harmonic schemes.",
              howTitle: "How to Use the Color Converter",
              steps: [
                "Enter a HEX code, pick a color using the color swatch, or use the screen EyeDropper pipette.",
                "Observe real-time synchronization across HEX, RGB, HSL, HSV, and CMYK format outputs.",
                "Click 'Copy' next to any color format code to grab the CSS snippet directly.",
                "Inspect the WCAG contrast score against pure black and pure white backgrounds on the bottom left.",
                "Click on any swatch in the 9-step tints/shades or harmonic combination palettes to explore variations."
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "5-Way Color Space Conversion", desc: "Converts between web CSS formats (HEX, RGB, HSL, HSV) and print CMYK percentages instantaneously." },
                { title: "Real-Time WCAG 2.1 Contrast Analysis", desc: "Evaluates readability against black and white backdrops to ensure compliance with AA accessibility guidelines." },
                { title: "9-Level Tints & Shades Palette", desc: "Generates lightness variations from 10% to 90% for designing consistent design token scales." },
                { title: "Harmonic Color Combinations", desc: "Calculates 180° complementary and ±30° analogous harmonious pairings automatically." }
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "Design System Color Tokens", desc: "Create 100 to 900 lightness shade scales for Tailwind CSS or Figma design systems." },
                { title: "Accessibility Compliance Audits", desc: "Verify that button labels and body text exceed the required 4.5:1 contrast threshold." },
                { title: "Print Preparation (RGB to CMYK)", desc: "Translate digital branding colors to ink formulas before printing merchandise." },
                { title: "Screen Pixel Sampling (EyeDropper)", desc: "Sample exact hex codes from any webpage or image directly in supported browsers." }
              ],
              proTipsTitle: "Professional Tips for Color Design",
              proTips: [
                "Body copy should maintain at least a 4.5:1 contrast ratio against the background to satisfy WCAG AA standards.",
                "RGB is additive light (screens), while CMYK is subtractive ink (print). Colors may appear slightly softer in print.",
                "Adding 180° to your HSL Hue always produces an exact complementary accent color for maximum visual contrast.",
                "Use high-contrast dark slate or charcoal text (#1e293b) instead of harsh pure black (#000000) for better reading comfort."
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "Which browsers support the EyeDropper screen pipette?", a: "The native EyeDropper API is supported in modern Chromium browsers like Google Chrome, Microsoft Edge, and Opera." },
                { q: "Why do colors look different between RGB and CMYK?", a: "Monitors emit light (RGB) with a wider color gamut, whereas physical ink absorbs light (CMYK), leading to gamut mapping differences." },
                { q: "What is the WCAG AA contrast threshold?", a: "WCAG 2.1 requires a minimum contrast ratio of 4.5:1 for standard text and 3:1 for large text (18pt+)." },
                { q: "Can I copy CSS formatted color codes?", a: "Yes, click 'Copy' next to any format to copy valid CSS snippets directly to your clipboard." },
                { q: "Is any data uploaded to a server?", a: "No. All color math, sampling, and palette calculations execute 100% locally in your browser." },
                { q: "Is this tool completely free?", a: "Yes, 100% free with unlimited usage." }
              ],
              relatedTools: [
                { title: "Unit Converter", desc: "Convert length, weight, temperature, area, volume, and speed", href: "/tools/unit-converter/" },
                { title: "Favicon Generator", desc: "Generate multi-size web favicons and app icons", href: "/tools/favicon-generator/" },
                { title: "QR Code Generator", desc: "Generate customizable high-resolution QR codes", href: "/tools/qr-generator/" },
                { title: "Image Watermark", desc: "Add text or logo watermarks to images in your browser", href: "/tools/image-watermark/" }
              ]
            },
            ja: {
              aboutTitle: "色コード変換＆カラーパレット生成器について",
              aboutDesc:
                "UI/UX デザイナーや Web 開発者のための高精度カラーコード変換ツールです。HEX、RGB、HSL、HSV、印刷用 CMYK カラーコードをリアルタイムに相互変換し、WCAG コントラスト比（AA / AAA 基準）の判定、9段階の明暗（ティント＆シェード）パレット、補色・類似色の調和配色をブラウザ内で瞬時に生成します。",
              howTitle: "色コード変換ツールの使い方",
              steps: [
                "HEX 入力欄にカラーコードを入力するか、カラーピッカーまたはスポイト（EyeDropper）で画面上の色を取得します。",
                "HEX、RGB、HSL、HSV、CMYK の各コードがリアルタイムに自動同期・変換されるのを確認します。",
                "各フォーマットの右側にある「Copy」ボタンをクリックして CSS コードを取得します。",
                "左下で白背景・黒背景に対する WCAG コントラスト比（4.5:1 AA 基準適合状況）をチェックします。",
                "下部のティント＆シェードパレットや補色・類似色の配色パターンをクリックして色相を展開します。"
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "HEX / RGB / HSL / HSV / CMYK 5系統変換", desc: "Web 標準 CSS カラーから印刷用 CMYK インキ比率まで瞬時に相互変換します。" },
                { title: "WCAG 2.1 アクセシビリティコントラスト比判定", desc: "白・黒背景に対する視認性（AA 基準 4.5:1 以上）を自動計算して表示します。" },
                { title: "9段階ティント＆シェードパレット", desc: "明度を 10% から 90% まで細分化したカラーパレットを自動生成します。" },
                { title: "補色（180°）＆類似色（±30°）ハーモニー", desc: "色相環に基づく美しい配色パターンをワンクリックで提案します。" }
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "デザインシステムのカラートークン作成", desc: "Tailwind CSS や Figma で使用する 100〜900 番台のカラースケール設計" },
                { title: "Web アクセシビリティ視認性チェック", desc: "ボタン文字や背景色のコントラスト比が 4.5:1 を満たしているか事前検証" },
                { title: "印刷用データ作成時の CMYK 変換", desc: "Web 用ロゴやバナー画像を印刷する際の CMYK インキ配合比率の確認" },
                { title: "画面からの色抽出（スポイト機能）", desc: "参考サイトや写真の特定ピクセルの色をワンクリックで取得" }
              ],
              proTipsTitle: "カラーデザインのプロのテクニック",
              proTips: [
                "本文テキストは背景に対して最低 4.5:1 以上のコントラスト比を確保することが推奨されます。",
                "RGB は光の三原色（加法混色）、CMYK はインクの混色（減法混色）のため印刷時は若干彩度が落ちる傾向があります。",
                "HSL の H（色相）に 180 を足すと、最も視認性の高い補色（Complementary Color）が得られます。",
                "純粋な黒（#000000）の代わりにダークグレー（#1e293b）を使うと目に優しいデザインに仕上がります。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "画面スポイト機能はどのブラウザで使えますか？", a: "Google Chrome、Microsoft Edge など Chromium ベースの最新ブラウザに対応しています。" },
                { q: "RGB と CMYK で色味が異なるのはなぜですか？", a: "画面の発光（RGB）と紙のインク（CMYK）では再現できる色の範囲（色域）が異なるためです。" },
                { q: "WCAG の AA 基準とは何ですか？", a: "一般的な文字サイズにおいて 4.5:1 以上の明暗比を保つアクセシビリティの国際標準です。" },
                { q: "CSS コードとしてそのままコピーできますか？", a: "はい、各コードの「Copy」ボタンをクリックすると即座にクリップボードに保存されます。" },
                { q: "データがサーバーに送信されることはありますか？", a: "ありません。すべての計算はお手元のブラウザ内で安全に実行されます。" },
                { q: "無料で利用できますか？", a: "はい、回数無制限で完全無料にてご利用いただけます。" }
              ],
              relatedTools: [
                { title: "単位変換ツール", desc: "長さ、重さ、温度、面積、体積、速度などを即時換算", href: "/tools/unit-converter/" },
                { title: "ファビコン (Favicon) 生成器", desc: "マルチサイズ対応の favicon.ico を作成", href: "/tools/favicon-generator/" },
                { title: "QR コード生成器", desc: "カスタムカラーと高解像度で QR コードを作成", href: "/tools/qr-generator/" },
                { title: "画像透かし (ウォーターマーク) 追加", desc: "画像にテキストやロゴの透かしを合成", href: "/tools/image-watermark/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Conversor de Color y Generador de Paletas",
              aboutDesc:
                "Herramienta de conversión de color de alta precisión para diseñadores UI/UX y desarrolladores web. Convierte entre formatos HEX, RGB, HSL, HSV y CMYK en tiempo real. Analiza ratios de contraste WCAG 2.1 (AA/AAA) y genera paletas de 9 tonalidades (tints & shades) junto a armonías complementarias y análogas.",
              howTitle: "Cómo Usar el Conversor de Color",
              steps: [
                "Introduce un código HEX, elige un color con el selector o usa el cuentagotas de pantalla.",
                "Observa la sincronización instantánea entre HEX, RGB, HSL, HSV y CMYK.",
                "Haz clic en 'Copy' junto a cualquier formato para llevarte el código CSS.",
                "Revisa la puntuación de contraste WCAG sobre fondos blanco y negro a la izquierda.",
                "Explora la escala de 9 tonos y combinaciones armónicas en la parte inferior."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Conversión Quíntuple HEX / RGB / HSL / HSV / CMYK", desc: "Pasa de formatos CSS para web a porcentajes de tinta de imprenta al instante." },
                { title: "Análisis de Contraste WCAG 2.1 en Vivo", desc: "Verifica si tu color supera el umbral de 4.5:1 (Nivel AA) para lectura accesible." },
                { title: "Paleta de 9 Niveles de Tonalidades", desc: "Calcula gradaciones de luminosidad del 10% al 90% para escalas de diseño." },
                { title: "Armonías Complementarias y Análogas", desc: "Obtén combinaciones de color a 180° y ±30° en la rueda cromática con un clic." }
              ],
              useCasesTitle: "Casos de Uso Comunes",
              useCases: [
                { title: "Creación de Tokens de Diseño", desc: "Construye escalas cromáticas de 100 a 900 para Tailwind CSS o Figma." },
                { title: "Auditorías de Accesibilidad Web", desc: "Asegúrate de que tus botones y textos cumplan la normativa de contraste mínima." },
                { title: "Preparación de Impresión (RGB a CMYK)", desc: "Calcula porcentajes de cuatricromía antes de enviar material a imprenta." },
                { title: "Extracción de Color en Pantalla (Pipeta)", desc: "Captura píxeles exactos de cualquier sitio web en navegadores compatibles." }
              ],
              proTipsTitle: "Consejos Profesionales de Color",
              proTips: [
                "El texto general debe tener un contraste de al menos 4.5:1 contra el fondo para cumplir el estándar WCAG AA.",
                "RGB es luz aditiva (pantallas) y CMYK es tinta sustractiva (papel), por lo que los colores impresos pueden verse más apagados.",
                "Sumar 180° al tono HSL genera el color complementario perfecto para botones de llamada a la acción.",
                "Utiliza tonos gris oscuro (#1e293b) en lugar de negro puro (#000000) para reducir la fatiga visual."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Qué navegadores admiten la pipeta cuentagotas?", a: "La función EyeDropper está disponible en navegadores basados en Chromium como Chrome y Edge." },
                { q: "¿Por qué difiere el color entre RGB y CMYK?", a: "Porque las pantallas emiten luz con un espacio de color más amplio que el de las tintas de imprenta." },
                { q: "¿Qué exige el nivel WCAG AA?", a: "Un ratio de contraste de al menos 4.5:1 para texto normal y 3:1 para texto grande." },
                { q: "¿Puedo copiar directamente el código CSS?", a: "Sí, pulsa 'Copy' al lado del formato deseado." },
                { q: "¿Se guardan mis colores en algún servidor?", a: "No. Todo se procesa de forma 100% local en tu navegador." },
                { q: "¿Es completamente gratuito?", a: "Sí, 100% gratuito y sin límites." }
              ],
              relatedTools: [
                { title: "Conversor de Unidades", desc: "Convierte longitud, peso, temperatura, área y volumen", href: "/tools/unit-converter/" },
                { title: "Generador de Favicon", desc: "Crea iconos web en múltiples resoluciones", href: "/tools/favicon-generator/" },
                { title: "Generador de Códigos QR", desc: "Crea códigos QR personalizados en alta resolución", href: "/tools/qr-generator/" },
                { title: "Marca de Agua en Imágenes", desc: "Añade texto y logotipos a imágenes en tu navegador", href: "/tools/image-watermark/" }
              ]
            },
            zh: {
              aboutTitle: "关于颜色转换器与调色板生成工具",
              aboutDesc:
                "专为 UI/UX 设计师与前端开发者打造的高精度色彩空间转换工具。实时支持 HEX、RGB、HSL、HSV 与印刷 CMYK 五大主流色彩格式互转，内置 WCAG 2.1 无障碍明度对比度（AA/AAA 标准）实时检测、9 级明暗色阶（Tints & Shades）提取以及互补色/类似色和谐配色方案。100% 浏览器本地运算。",
              howTitle: "如何使用颜色转换与调色板工具",
              steps: [
                "在输入框输入十六进制 HEX 代码、点击色块选取，或使用屏幕吸管（EyeDropper）直接取色。",
                "查看 HEX、RGB、HSL、HSV 及 CMYK 五种色彩格式代码的实时同步转换结果。",
                "点击任意格式右侧的“Copy”按钮，一键将标准 CSS 代码带入剪贴板。",
                "在左下方查看针对白色与黑色背景的 WCAG 无障碍明度对比度达标情况（4.5:1 AA）。",
                "点击下方的 9 级明暗色阶或互补色/类似色卡，秒级探索扩展配色方案。"
              ],
              featuresTitle: "核心功能与特点",
              features: [
                { title: "HEX / RGB / HSL / HSV / CMYK 五维互转", desc: "无缝打通前端 Web 样式代码与平面印刷油墨调色参数。" },
                { title: "WCAG 2.1 无障碍明度对比度实时评估", desc: "自动计算黑白背景对比度，即刻判定是否符合 4.5:1 AA 级可读性标准。" },
                { title: "9 级 Tints & Shades 明暗色阶矩阵", desc: "自动生成 10% 至 90% 亮度的递进色板，便于设计系统搭建色彩梯度。" },
                { title: "色环互补色 (180°) 与类似色 (±30°) 配色", desc: "基于标准色度学模型一键生成高视觉冲击力与和谐统一的色彩搭配。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "UI 设计系统 (Design Tokens) 色板搭建", desc: "为 Tailwind CSS、Figma 快速生成 100~900 的完整品牌色阶梯度" },
                { title: "Web 无障碍 (A11y) 字体对比度验收", desc: "验证按钮文本与背景色是否达到 4.5:1 的合规阅读对比度" },
                { title: "印刷品出街前色彩转换 (RGB ➔ CMYK)", desc: "在印刷画册前确认数字色彩对应的四色油墨配比" },
                { title: "屏幕精准吸色提取 (EyeDropper)", desc: "通过浏览器原生吸管即刻拾取参考页面或图片中任意像素的色彩" }
              ],
              proTipsTitle: "色彩设计与排版专业技巧",
              proTips: [
                "正文文本与背景色对比度需大于 4.5:1，方能确保低视力用户无障碍阅读。",
                "RGB 为屏幕发光加色模型，CMYK 为油墨减色模型，印刷品实际显色通常略暗于屏幕显示。",
                "在 HSL 色彩中将 H（色相）增加 180°，即可得到对比最为强烈的完美互补色。",
                "使用深灰偏蓝调（#1e293b）替代纯黑（#000000）作为正文字体颜色，能大幅减轻眼部阅读疲劳。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "屏幕吸管功能支持哪些浏览器？", a: "支持 Google Chrome、Microsoft Edge 等现代 Chromium 内核浏览器。" },
                { q: "为什么 RGB 与 CMYK 色彩会有细微差异？", a: "因为屏幕显示色域（RGB）大于物理油墨能够展现的色域（CMYK），存在色域映射偏差。" },
                { q: "WCAG AA 级别的具体标准是什么？", a: "常规文本需达到 4.5:1 以上的明度对比度，大号标题文本需达到 3:1 以上。" },
                { q: "可以直接复制带格式的 CSS 代码吗？", a: "可以，点击任意格式右侧的“Copy”按钮即可直接获得代码。" },
                { q: "颜色数据会被上传到云端吗？", a: "绝对不会，所有算法 100% 在您本机的浏览器中运行。" },
                { q: "完全免费吗？", a: "永久 100% 免费。" }
              ],
              relatedTools: [
                { title: "单位换算器", desc: "长度、重量、面积、体积、速度等全维度单位即时换算", href: "/tools/unit-converter/" },
                { title: "Favicon 图标生成器", desc: "生成网站用 favicon.ico 及多尺寸高清图标", href: "/tools/favicon-generator/" },
                { title: "QR 二维码生成器", desc: "个性化配色与高清矢量 SVG 二维码生成", href: "/tools/qr-generator/" },
                { title: "图片添加水印", desc: "在浏览器中为图片添加文字与 Logo 水印", href: "/tools/image-watermark/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Convertisseur de Couleurs et Générateur de Palettes",
              aboutDesc:
                "Un outil de conversion colorimétrique de haute précision pour designers UI/UX et développeurs frontend. Convertissez instantanément entre les formats HEX, RGB, HSL, HSV et CMYK. Analysez les ratios de contraste WCAG 2.1 (AA/AAA) et générez des palettes de 9 nuances (tints & shades) ainsi que des harmonies complémentaires et analogues.",
              howTitle: "Comment Utiliser le Convertisseur de Couleurs",
              steps: [
                "Saisissez un code HEX, sélectionnez une couleur dans le nuancier ou utilisez la pipette compte-gouttes.",
                "Observez la synchronisation en temps réel entre HEX, RGB, HSL, HSV et CMYK.",
                "Cliquez sur 'Copy' à côté du format souhaité pour récupérer le code CSS.",
                "Vérifiez le score de contraste WCAG sur fonds blanc et noir en bas à gauche.",
                "Explorez la palette de 9 nuances et les harmonies de couleurs en bas de page."
              ],
              featuresTitle: "Fonctionnalités Clés",
              features: [
                { title: "Conversion 5 Formats HEX / RGB / HSL / HSV / CMYK", desc: "Passez des formats CSS web aux pourcentages d'encres pour l'impression en un clin d'œil." },
                { title: "Analyse de Contraste WCAG 2.1 en Direct", desc: "Contrôle la lisibilité sur fond blanc et noir pour respecter le seuil AA de 4.5:1." },
                { title: "Palette de 9 Paliers de Nuances", desc: "Calcule les variations de luminosité de 10% à 90% pour concevoir des échelles d'UI." },
                { title: "Harmonies Complémentaires et Analogues", desc: "Découvrez des combinaisons de couleurs équilibrées basées sur le cercle chromatique." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Tokens de Design System", desc: "Générez des échelles de teintes de 100 à 900 pour Tailwind CSS ou Figma." },
                { title: "Audits d'Accessibilité Numérique", desc: "Vérifiez que vos textes respectent les critères de contraste légaux." },
                { title: "Préparation pour l'Impression (RGB vers CMYK)", desc: "Calculez le mélange d'encres avant d'envoyer vos fichiers à l'imprimeur." },
                { title: "Prélèvement de Couleur à l'Écran (Pipette)", desc: "Échantillonnez n'importe quel pixel sur vos écrans avec les navigateurs compatibles." }
              ],
              proTipsTitle: "Conseils d'Experts sur les Couleurs",
              proTips: [
                "Le texte courant doit présenter un contraste d'au moins 4.5:1 avec l'arrière-plan pour satisfaire la norme WCAG AA.",
                "Le RGB fonctionne par synthèse additive (lumière) et le CMYK par synthèse soustractive (encre).",
                "Ajouter 180° à la teinte HSL vous donne la couleur complémentaire idéale pour faire ressortir un bouton.",
                "Privilégiez un gris très foncé (#1e293b) au noir pur (#000000) pour un confort de lecture optimal."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Quels navigateurs supportent la pipette compte-gouttes ?", a: "L'API EyeDropper est disponible sur les navigateurs Chromium modernes comme Chrome et Edge." },
                { q: "Pourquoi les couleurs varient-elles entre RGB et CMYK ?", a: "Les écrans émettent de la lumière avec un espace colorimétrique plus étendu que celui des encres physiques." },
                { q: "Que requiert le niveau WCAG AA ?", a: "Un ratio de contraste minimal de 4.5:1 pour le texte standard et 3:1 pour les grands titres." },
                { q: "Puis-je copier directement le code CSS ?", a: "Oui, cliquez sur 'Copy' à côté de la ligne voulue." },
                { q: "Mes couleurs sont-elles envoyées sur un serveur ?", a: "Non. Tout s'exécute à 100% localement dans votre navigateur." },
                { q: "L'outil est-il gratuit ?", a: "Oui, 100% gratuit et sans limite." }
              ],
              relatedTools: [
                { title: "Convertisseur d'Unités", desc: "Convertissez longueur, poids, température, surface et volume", href: "/tools/unit-converter/" },
                { title: "Générateur de Favicon", desc: "Créez des favicons et icônes d'application web", href: "/tools/favicon-generator/" },
                { title: "Générateur de QR Code", desc: "Créez des QR codes personnalisés haute résolution", href: "/tools/qr-generator/" },
                { title: "Filigrane d'Images", desc: "Ajoutez du texte et des logos sur vos images", href: "/tools/image-watermark/" }
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
