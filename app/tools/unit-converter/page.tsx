"use client";

/**
 * app/tools/unit-converter/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Unit Converter Tool for desktools.run
 *
 * Features:
 *  - 8 Categories: Length, Weight, Temperature, Area, Volume, Speed, Time, Digital Storage
 *  - High-precision real-time conversion
 *  - Bidirectional unit swap (⇄)
 *  - Conversion formula display
 *  - Popular Preset shortcuts (e.g. 84 m² -> 평, 100°C -> °F)
 *  - All-Units Comparison Table
 *  - Full i18n (6 languages) & Dark/Light theme support
 *  - 100% Client-side local calculation
 */

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  Ruler,
  Weight,
  Thermometer,
  Grid,
  Box,
  Gauge,
  Clock,
  HardDrive,
  Table,
  Zap,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocale } from "@/lib/context/LocaleContext";

// ── Unit Definitions & Conversion Ratios ──────────────────────
export type CategoryKey =
  | "length"
  | "weight"
  | "temperature"
  | "area"
  | "volume"
  | "speed"
  | "time"
  | "storage";

interface UnitDef {
  key: string;
  label: string; // Symbol or name
  ratio?: number; // Base ratio relative to category base unit
}

const CATEGORIES: {
  key: CategoryKey;
  icon: typeof Ruler;
  labelKey: string;
  color: string;
  baseUnit: string;
  units: UnitDef[];
}[] = [
  {
    key: "length",
    icon: Ruler,
    labelKey: "unitConverter.cat.length",
    color: "#6366f1",
    baseUnit: "m",
    units: [
      { key: "m", label: "Meter (m)", ratio: 1 },
      { key: "km", label: "Kilometer (km)", ratio: 1000 },
      { key: "cm", label: "Centimeter (cm)", ratio: 0.01 },
      { key: "mm", label: "Millimeter (mm)", ratio: 0.001 },
      { key: "mi", label: "Mile (mi)", ratio: 1609.344 },
      { key: "yd", label: "Yard (yd)", ratio: 0.9144 },
      { key: "ft", label: "Foot (ft)", ratio: 0.3048 },
      { key: "in", label: "Inch (in)", ratio: 0.0254 },
    ],
  },
  {
    key: "weight",
    icon: Weight,
    labelKey: "unitConverter.cat.weight",
    color: "#34d399",
    baseUnit: "g",
    units: [
      { key: "kg", label: "Kilogram (kg)", ratio: 1000 },
      { key: "g", label: "Gram (g)", ratio: 1 },
      { key: "mg", label: "Milligram (mg)", ratio: 0.001 },
      { key: "t", label: "Metric Ton (t)", ratio: 1000000 },
      { key: "lb", label: "Pound (lb)", ratio: 453.59237 },
      { key: "oz", label: "Ounce (oz)", ratio: 28.349523125 },
      { key: "geun", label: "Geun (근 - 600g)", ratio: 600 },
    ],
  },
  {
    key: "temperature",
    icon: Thermometer,
    labelKey: "unitConverter.cat.temperature",
    color: "#f87171",
    baseUnit: "C",
    units: [
      { key: "C", label: "Celsius (°C)" },
      { key: "F", label: "Fahrenheit (°F)" },
      { key: "K", label: "Kelvin (K)" },
    ],
  },
  {
    key: "area",
    icon: Grid,
    labelKey: "unitConverter.cat.area",
    color: "#60a5fa",
    baseUnit: "m2",
    units: [
      { key: "m2", label: "Square Meter (m²)", ratio: 1 },
      { key: "pyeong", label: "Pyeong (평 - 3.3m²)", ratio: 400 / 121 },
      { key: "km2", label: "Square Km (km²)", ratio: 1000000 },
      { key: "ft2", label: "Square Foot (ft²)", ratio: 0.09290304 },
      { key: "ac", label: "Acre (ac)", ratio: 4046.8564224 },
      { key: "ha", label: "Hectare (ha)", ratio: 10000 },
    ],
  },
  {
    key: "volume",
    icon: Box,
    labelKey: "unitConverter.cat.volume",
    color: "#fbbf24",
    baseUnit: "L",
    units: [
      { key: "L", label: "Liter (L)", ratio: 1 },
      { key: "mL", label: "Milliliter (mL)", ratio: 0.001 },
      { key: "m3", label: "Cubic Meter (m³)", ratio: 1000 },
      { key: "gal", label: "US Gallon (gal)", ratio: 3.785411784 },
      { key: "qt", label: "US Quart (qt)", ratio: 0.946352946 },
      { key: "floz", label: "Fluid Ounce (fl oz)", ratio: 0.0295735295625 },
    ],
  },
  {
    key: "speed",
    icon: Gauge,
    labelKey: "unitConverter.cat.speed",
    color: "#e879f9",
    baseUnit: "ms",
    units: [
      { key: "kmh", label: "Km per Hour (km/h)", ratio: 1 / 3.6 },
      { key: "ms", label: "Meter per Sec (m/s)", ratio: 1 },
      { key: "mph", label: "Miles per Hour (mph)", ratio: 0.44704 },
      { key: "kn", label: "Knot (kn)", ratio: 0.514444444 },
    ],
  },
  {
    key: "time",
    icon: Clock,
    labelKey: "unitConverter.cat.time",
    color: "#38bdf8",
    baseUnit: "s",
    units: [
      { key: "s", label: "Second (s)", ratio: 1 },
      { key: "min", label: "Minute (min)", ratio: 60 },
      { key: "h", label: "Hour (h)", ratio: 3600 },
      { key: "d", label: "Day (d)", ratio: 86400 },
      { key: "wk", label: "Week (wk)", ratio: 604800 },
      { key: "mo", label: "Month (mo - 30.4d)", ratio: 2629746 },
      { key: "yr", label: "Year (yr - 365d)", ratio: 31536000 },
    ],
  },
  {
    key: "storage",
    icon: HardDrive,
    labelKey: "unitConverter.cat.storage",
    color: "#a855f7",
    baseUnit: "B",
    units: [
      { key: "B", label: "Byte (B)", ratio: 1 },
      { key: "KB", label: "Kilobyte (KB)", ratio: 1024 },
      { key: "MB", label: "Megabyte (MB)", ratio: 1048576 },
      { key: "GB", label: "Gigabyte (GB)", ratio: 1073741824 },
      { key: "TB", label: "Terabyte (TB)", ratio: 1099511627776 },
    ],
  },
];

// Presets for quick one-click loading
const POPULAR_PRESETS: {
  category: CategoryKey;
  label: string;
  val: number;
  from: string;
  to: string;
}[] = [
  { category: "area", label: "84 m² → 평", val: 84, from: "m2", to: "pyeong" },
  { category: "temperature", label: "100 °C → °F", val: 100, from: "C", to: "F" },
  { category: "weight", label: "1 kg → lb", val: 1, from: "kg", to: "lb" },
  { category: "length", label: "1 mi → km", val: 1, from: "mi", to: "km" },
  { category: "storage", label: "1 GB → MB", val: 1, from: "GB", to: "MB" },
  { category: "weight", label: "1 근 → g", val: 1, from: "geun", to: "g" },
  { category: "speed", label: "100 km/h → mph", val: 100, from: "kmh", to: "mph" },
];

// ── Temperature Math ──────────────────────────────────────────
function convertTemperature(val: number, from: string, to: string): number {
  if (from === to) return val;
  // Convert from -> Celsius
  let celsius = val;
  if (from === "F") celsius = ((val - 32) * 5) / 9;
  if (from === "K") celsius = val - 273.15;

  // Convert Celsius -> to
  if (to === "C") return celsius;
  if (to === "F") return (celsius * 9) / 5 + 32;
  if (to === "K") return celsius + 273.15;
  return val;
}

// Format numbers neatly (max 6 decimal places, trim trailing zeroes)
function formatResultNumber(num: number): string {
  if (isNaN(num)) return "0";
  if (!isFinite(num)) return "Infinity";
  if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-4 && num !== 0)) {
    return num.toExponential(4);
  }
  const formatted = num.toFixed(6);
  return parseFloat(formatted).toString();
}

// ─────────────────────────────────────────────────────────────
export default function UnitConverterPage() {
  const { t } = useLocale();

  // State
  const [categoryKey, setCategoryKey] = useState<CategoryKey>("length");
  const [inputValue, setInputValue] = useState<string>("1");
  const [fromUnitKey, setFromUnitKey] = useState<string>("km");
  const [toUnitKey, setToUnitKey] = useState<string>("m");
  const [copied, setCopied] = useState(false);

  const activeCat = useMemo(
    () => CATEGORIES.find((c) => c.key === categoryKey) || CATEGORIES[0],
    [categoryKey]
  );

  // Switch category
  const handleCategoryChange = useCallback((catKey: CategoryKey) => {
    setCategoryKey(catKey);
    const cat = CATEGORIES.find((c) => c.key === catKey)!;
    setFromUnitKey(cat.units[0].key);
    setToUnitKey(cat.units[1]?.key || cat.units[0].key);
  }, []);

  // Compute Converted Value
  const numericInput = parseFloat(inputValue) || 0;

  const resultValue = useMemo(() => {
    if (categoryKey === "temperature") {
      return convertTemperature(numericInput, fromUnitKey, toUnitKey);
    }
    const fromDef = activeCat.units.find((u) => u.key === fromUnitKey);
    const toDef = activeCat.units.find((u) => u.key === toUnitKey);
    if (!fromDef?.ratio || !toDef?.ratio) return 0;

    // Convert fromUnit -> baseUnit -> toUnit
    const inBase = numericInput * fromDef.ratio;
    return inBase / toDef.ratio;
  }, [categoryKey, numericInput, fromUnitKey, toUnitKey, activeCat]);

  // Swap From & To
  const handleSwap = useCallback(() => {
    setFromUnitKey(toUnitKey);
    setToUnitKey(fromUnitKey);
  }, [fromUnitKey, toUnitKey]);

  // Copy Result
  const handleCopy = useCallback(() => {
    const formatted = formatResultNumber(resultValue);
    const toDef = activeCat.units.find((u) => u.key === toUnitKey);
    const textToCopy = `${formatted} ${toDef?.label || ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [resultValue, activeCat, toUnitKey]);

  // Apply Preset Shortcut
  const handleApplyPreset = useCallback((preset: (typeof POPULAR_PRESETS)[0]) => {
    setCategoryKey(preset.category);
    const cat = CATEGORIES.find((c) => c.key === preset.category)!;
    setFromUnitKey(preset.from);
    setToUnitKey(preset.to);
    setInputValue(preset.val.toString());
  }, []);

  // All Units Comparison Table calculation
  const allUnitsComparison = useMemo(() => {
    return activeCat.units.map((unit) => {
      let val = 0;
      if (categoryKey === "temperature") {
        val = convertTemperature(numericInput, fromUnitKey, unit.key);
      } else {
        const fromDef = activeCat.units.find((u) => u.key === fromUnitKey);
        if (fromDef?.ratio && unit.ratio) {
          val = (numericInput * fromDef.ratio) / unit.ratio;
        }
      }
      return {
        unitKey: unit.key,
        label: unit.label,
        formattedValue: formatResultNumber(val),
        isCurrentToUnit: unit.key === toUnitKey,
        isCurrentFromUnit: unit.key === fromUnitKey,
      };
    });
  }, [activeCat, categoryKey, numericInput, fromUnitKey, toUnitKey]);

  // Active units
  const fromUnitObj = activeCat.units.find((u) => u.key === fromUnitKey) || activeCat.units[0];
  const toUnitObj = activeCat.units.find((u) => u.key === toUnitKey) || activeCat.units[1];

  // Formula string
  const formulaText = useMemo(() => {
    const oneResult =
      categoryKey === "temperature"
        ? convertTemperature(1, fromUnitKey, toUnitKey)
        : ((fromUnitObj.ratio || 1) / (toUnitObj.ratio || 1));

    return `1 ${fromUnitObj.label.split("(")[0].trim()} = ${formatResultNumber(oneResult)} ${toUnitObj.label.split("(")[0].trim()}`;
  }, [categoryKey, fromUnitKey, toUnitKey, fromUnitObj, toUnitObj]);

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
                  className="icon-converter"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowLeftRight size={20} />
                </div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "var(--text-primary)",
                  }}
                >
                  {t("unitConverter.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
                {t("unitConverter.subtitle")}
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
              <Sparkles size={12} style={{ color: "#fbbf24" }} />
              100% Client-side Calculation
            </div>
          </div>
        </section>

        {/* ── Main Workspace Container ─────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {/* ── Category Pill Bar ──────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "12px",
              marginBottom: "24px",
              scrollbarWidth: "none",
            }}
          >
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isActive = cat.key === categoryKey;
              const catName = t(cat.labelKey as any) || cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "9px 16px",
                    borderRadius: "100px",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? "rgba(99,102,241,0.2)" : "var(--glass-bg)",
                    border: isActive ? `1px solid ${cat.color}` : "1px solid var(--border-subtle)",
                    color: isActive ? "#a5b4fc" : "var(--text-secondary)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? `0 0 20px ${cat.color}25` : "none",
                  }}
                >
                  <IconComp size={15} style={{ color: isActive ? cat.color : "var(--text-muted)" }} />
                  <span>{catName}</span>
                </button>
              );
            })}
          </div>

          {/* ── Main Converter Glass Card ──────────────── */}
          <div className="glass-card" style={{ padding: "28px", marginBottom: "28px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 50px 1fr",
                gap: "16px",
                alignItems: "center",
                marginBottom: "24px",
              }}
              className="converter-inputs-grid"
            >
              {/* FROM Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                  {t("unitConverter.from")} ({t("unitConverter.value")})
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="0"
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                      fontSize: "18px",
                      fontWeight: 700,
                      outline: "none",
                      fontFamily: "Inter, sans-serif",
                    }}
                  />
                  <select
                    value={fromUnitKey}
                    onChange={(e) => setFromUnitKey(e.target.value)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-hover)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                      fontWeight: 600,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {activeCat.units.map((u) => (
                      <option key={u.key} value={u.key}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SWAP Button */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "20px" }}>
                <button
                  onClick={handleSwap}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    color: "#818cf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  title={t("unitConverter.swap")}
                  aria-label={t("unitConverter.swap")}
                >
                  <ArrowLeftRight size={18} />
                </button>
              </div>

              {/* TO Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                  {t("unitConverter.to")} ({t("unitConverter.result")})
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      color: "var(--text-primary)",
                      fontSize: "18px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatResultNumber(resultValue)}
                  </div>
                  <select
                    value={toUnitKey}
                    onChange={(e) => setToUnitKey(e.target.value)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-hover)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                      fontWeight: 600,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {activeCat.units.map((u) => (
                      <option key={u.key} value={u.key}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Banner: Formula & Copy Action */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderRadius: "12px",
                background: "var(--btn-secondary-bg)",
                border: "1px solid var(--btn-secondary-border)",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={15} style={{ color: "#fbbf24" }} />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  <strong style={{ color: "var(--text-primary)", marginRight: "6px" }}>
                    {t("unitConverter.formula")}:
                  </strong>
                  {formulaText}
                </span>
              </div>

              <button
                onClick={handleCopy}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: copied ? "rgba(34,211,168,0.2)" : "rgba(99,102,241,0.15)",
                  border: copied ? "1px solid rgba(34,211,168,0.4)" : "1px solid rgba(99,102,241,0.3)",
                  color: copied ? "#34d399" : "#a5b4fc",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t("unitConverter.copied") : t("unitConverter.copyResult")}
              </button>
            </div>
          </div>

          {/* ── Popular Presets Bar ─────────────────────── */}
          <div style={{ marginBottom: "32px" }}>
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontWeight: 600,
                display: "block",
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              ⚡ {t("unitConverter.presets")}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {POPULAR_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleApplyPreset(p)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "100px",
                    background: "var(--btn-secondary-bg)",
                    border: "1px solid var(--btn-secondary-border)",
                    color: "var(--text-secondary)",
                    fontSize: "12.5px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    btn.style.background = "rgba(99,102,241,0.15)";
                    btn.style.color = "#a5b4fc";
                    btn.style.borderColor = "rgba(99,102,241,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    btn.style.background = "var(--btn-secondary-bg)";
                    btn.style.color = "var(--text-secondary)";
                    btn.style.borderColor = "var(--btn-secondary-border)";
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── All Units Comparison Table ──────────────── */}
          <div className="glass-card" style={{ padding: "24px", marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Table size={16} style={{ color: "#60a5fa" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                {t("unitConverter.allUnits")} ({inputValue} {fromUnitObj.label})
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "10px",
              }}
            >
              {allUnitsComparison.map((item) => (
                <div
                  key={item.unitKey}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: item.isCurrentToUnit
                      ? "rgba(99,102,241,0.15)"
                      : "var(--btn-secondary-bg)",
                    border: item.isCurrentToUnit
                      ? "1px solid rgba(99,102,241,0.4)"
                      : "1px solid var(--btn-secondary-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 500 }}>
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: item.isCurrentToUnit ? "#a5b4fc" : "var(--text-primary)",
                    }}
                  >
                    {item.formattedValue}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tool Guide & FAQ Section ────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "48px" }}>
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "100px",
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "#a5b4fc",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                <BookOpen size={12} />
                {t("unitConverter.guide.title")}
              </div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.4px",
                }}
              >
                {t("unitConverter.guide.aboutTitle")}
              </h2>
            </div>

            {/* About & Steps Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "32px",
              }}
              className="guide-grid"
            >
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(99,102,241,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#818cf8",
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Instant & Private
                  </h3>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {t("unitConverter.guide.aboutDesc")}
                </p>
              </div>

              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {t("unitConverter.guide.howTitle")}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    t("unitConverter.guide.step1"),
                    t("unitConverter.guide.step2"),
                    t("unitConverter.guide.step3"),
                  ].map((stepText, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "rgba(99,102,241,0.2)",
                          color: "#a5b4fc",
                          fontSize: "12px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        {idx + 1}
                      </div>
                      <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {stepText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Card */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <HelpCircle size={18} style={{ color: "#fbbf24" }} />
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("unitConverter.guide.faqTitle")}
                </h3>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {[
                  { q: t("unitConverter.guide.faq1Q"), a: t("unitConverter.guide.faq1A") },
                  { q: t("unitConverter.guide.faq2Q"), a: t("unitConverter.guide.faq2A") },
                  { q: t("unitConverter.guide.faq3Q"), a: t("unitConverter.guide.faq3A") },
                ].map(({ q, a }, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: "var(--btn-secondary-bg)",
                      border: "1px solid var(--btn-secondary-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                      <CheckCircle2 size={15} style={{ color: "#34d399", marginTop: "3px", flexShrink: 0 }} />
                      <span>{q}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "21px" }}>
                      {a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .converter-inputs-grid {
            grid-template-columns: 1fr !important;
          }
          .guide-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
