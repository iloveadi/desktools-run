"use client";

/**
 * app/tools/unit-converter/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Unit Converter Tool for desktools.run
 * 100% Client-Side with full 6-language SEO support
 */

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
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
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
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
  label: string;
  ratio?: number;
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

function convertTemperature(val: number, from: string, to: string): number {
  if (from === to) return val;
  let celsius = val;
  if (from === "F") celsius = ((val - 32) * 5) / 9;
  if (from === "K") celsius = val - 273.15;

  if (to === "C") return celsius;
  if (to === "F") return (celsius * 9) / 5 + 32;
  if (to === "K") return celsius + 273.15;
  return val;
}

function formatResultNumber(num: number): string {
  if (isNaN(num)) return "0";
  if (!isFinite(num)) return "Infinity";
  if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-4 && num !== 0)) {
    return num.toExponential(4);
  }
  const formatted = num.toFixed(6);
  return parseFloat(formatted).toString();
}

export default function UnitConverterPage() {
  const { locale, t } = useLocale();

  const [categoryKey, setCategoryKey] = useState<CategoryKey>("length");
  const [inputValue, setInputValue] = useState<string>("1");
  const [fromUnitKey, setFromUnitKey] = useState<string>("km");
  const [toUnitKey, setToUnitKey] = useState<string>("m");
  const [copied, setCopied] = useState(false);

  const activeCat = useMemo(
    () => CATEGORIES.find((c) => c.key === categoryKey) || CATEGORIES[0],
    [categoryKey]
  );

  const handleCategoryChange = useCallback((catKey: CategoryKey) => {
    setCategoryKey(catKey);
    const cat = CATEGORIES.find((c) => c.key === catKey)!;
    setFromUnitKey(cat.units[0].key);
    setToUnitKey(cat.units[1]?.key || cat.units[0].key);
  }, []);

  const numericInput = parseFloat(inputValue) || 0;

  const resultValue = useMemo(() => {
    if (categoryKey === "temperature") {
      return convertTemperature(numericInput, fromUnitKey, toUnitKey);
    }
    const fromDef = activeCat.units.find((u) => u.key === fromUnitKey);
    const toDef = activeCat.units.find((u) => u.key === toUnitKey);
    if (!fromDef?.ratio || !toDef?.ratio) return 0;

    const inBase = numericInput * fromDef.ratio;
    return inBase / toDef.ratio;
  }, [categoryKey, numericInput, fromUnitKey, toUnitKey, activeCat]);

  const handleSwap = useCallback(() => {
    setFromUnitKey(toUnitKey);
    setToUnitKey(fromUnitKey);
  }, [fromUnitKey, toUnitKey]);

  const handleCopy = useCallback(() => {
    const formatted = formatResultNumber(resultValue);
    const toDef = activeCat.units.find((u) => u.key === toUnitKey);
    const textToCopy = `${formatted} ${toDef?.label || ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [resultValue, activeCat, toUnitKey]);

  const handleApplyPreset = useCallback((preset: (typeof POPULAR_PRESETS)[0]) => {
    setCategoryKey(preset.category);
    const cat = CATEGORIES.find((c) => c.key === preset.category)!;
    setFromUnitKey(preset.from);
    setToUnitKey(preset.to);
    setInputValue(preset.val.toString());
  }, []);

  const allUnitsComparison = useMemo(() => {
    return activeCat.units.map((unit) => {
      let val = 0;
      if (categoryKey === "temperature") {
        val = convertTemperature(numericInput, fromUnitKey, unit.key);
      } else {
        const fromDef = activeCat.units.find((u) => u.key === fromUnitKey);
        if (fromDef?.ratio && unit.ratio) {
          const inBase = numericInput * fromDef.ratio;
          val = inBase / unit.ratio;
        }
      }
      return {
        unitKey: unit.key,
        label: unit.label,
        value: val,
        formattedValue: formatResultNumber(val),
        isCurrentToUnit: unit.key === toUnitKey,
      };
    });
  }, [activeCat, categoryKey, numericInput, fromUnitKey, toUnitKey]);

  return (
    <>
      <ToolUsageTracker toolId="unit-converter" />
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
            {t("unitConverter.back") || "Back to Tools"}
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
              <ArrowLeftRight size={22} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("unitConverter.title") || "Multi-Dimension Unit Converter"}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            {t("unitConverter.subtitle") || "Convert length, weight, temperature, area, volume, speed, time, and data storage with real-time comparison tables."}
          </p>
        </section>

        {/* Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Category Tabs */}
          <div
            className="glass-card"
            style={{
              padding: "8px",
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              borderRadius: "14px",
            }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = cat.key === categoryKey;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "none",
                    background: isActive ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
                    color: isActive ? "white" : "var(--text-secondary)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={16} />
                  {t(cat.labelKey) || cat.key}
                </button>
              );
            })}
          </div>

          {/* Quick Presets */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Zap size={14} color="#818cf8" />
              {t("unitConverter.popularPresets") || "Quick Presets:"}
            </span>
            {POPULAR_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Main Interactive Converter Box */}
          <div
            className="glass-card"
            style={{
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div
              className="converter-inputs-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: "16px",
              }}
            >
              {/* FROM Input Box */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {t("unitConverter.fromLabel") || "From (Value & Unit)"}
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter number..."
                    style={{
                      flex: 1,
                      height: "48px",
                      borderRadius: "10px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                      padding: "0 16px",
                      fontSize: "18px",
                      fontWeight: 700,
                      fontFamily: "ui-monospace, monospace",
                    }}
                  />
                  <select
                    value={fromUnitKey}
                    onChange={(e) => setFromUnitKey(e.target.value)}
                    style={{
                      width: "160px",
                      height: "48px",
                      borderRadius: "10px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                      padding: "0 12px",
                      fontSize: "13.5px",
                      fontWeight: 600,
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

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                title="Swap Units"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  color: "#818cf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginTop: "20px",
                  transition: "all 0.2s ease",
                }}
              >
                <ArrowLeftRight size={18} />
              </button>

              {/* TO Output Box */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    {t("unitConverter.toLabel") || "To (Converted Result)"}
                  </label>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: "none",
                      border: "none",
                      color: copied ? "#4ade80" : "#818cf8",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? (t("unitConverter.copied") || "Copied!") : (t("unitConverter.copyResult") || "Copy")}
                  </button>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div
                    style={{
                      flex: 1,
                      height: "48px",
                      borderRadius: "10px",
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid var(--border-subtle)",
                      color: "#4ade80",
                      padding: "0 16px",
                      fontSize: "20px",
                      fontWeight: 800,
                      fontFamily: "ui-monospace, monospace",
                      display: "flex",
                      alignItems: "center",
                      overflowX: "auto",
                    }}
                  >
                    {formatResultNumber(resultValue)}
                  </div>
                  <select
                    value={toUnitKey}
                    onChange={(e) => setToUnitKey(e.target.value)}
                    style={{
                      width: "160px",
                      height: "48px",
                      borderRadius: "10px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                      padding: "0 12px",
                      fontSize: "13.5px",
                      fontWeight: 600,
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
          </div>

          {/* Full Comparison Matrix in Category */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              <Table size={18} color="#818cf8" />
              {t("unitConverter.allUnitsTable") || "Complete Comparison for All Units in this Category"}
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
                    background: item.isCurrentToUnit ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                    border: item.isCurrentToUnit ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border-subtle)",
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
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {item.formattedValue}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "통합 정밀 단위 변환기 소개",
              aboutDesc:
                "길이, 무게, 온도, 넓이(평수/m²), 부피, 속도, 시간, 디지털 데이터 저장용량(KB/MB/GB/TB) 등 8가지 핵심 카테고리의 50여 개 단위를 실시간으로 상호 변환해 주는 브라우저 기반 고정밀 계산기입니다. 단위 간 환산 공식과 함께 카테고리 내 모든 단위의 변환 결과를 한눈에 비교할 수 있는 종합 비교표를 제공합니다.",
              howTitle: "단위 변환기 사용 방법",
              steps: [
                "상단 탭에서 변환하고자 하는 측정 범주(길이, 무게, 온도, 넓이, 부피, 속도, 시간, 용량)를 선택합니다.",
                "빠른 변환을 원할 경우 상단의 '인기 프리셋' 버튼(84m² → 평, 100°C → °F 등)을 누릅니다.",
                "좌측 입력란에 숫자를 입력하고 원본 단위와 대상 단위를 각각 선택합니다.",
                "양방향 화살표(⇄) 버튼을 클릭하여 원본과 대상을 즉시 맞바꿀 수 있습니다.",
                "하단 전체 비교표에서 모든 단위별 수치를 확인하고 '복사' 버튼으로 결과를 클립보드에 담으세요."
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "8대 핵심 물리량 50여 개 단위 지원", desc: "미터법, 야드파운드법뿐만 아니라 한국 전통 단위(평, 근)까지 완벽 지원합니다." },
                { title: "실시간 전체 단위 비교 매트릭스", desc: "단 하나의 값만 입력해도 해당 카테고리의 모든 단위 환산값이 테이블로 즉시 렌더링됩니다." },
                { title: "고정밀 소수점 및 지수 표기법", desc: "소수점 6자리 정밀 계산 및 극단적인 대용량/극소 수치는 지수 표기법으로 가독성을 극대화합니다." },
                { title: "100% 브라우저 로컬 초고속 계산", desc: "서버 통신 없이 즉각 반응하며 모바일 환경에서도 최적의 터치 UI를 제공합니다." }
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "부동산 면적(m² ↔ 평) 환산", desc: "아파트 공급면적 84m²를 25.4평으로 변환하는 등 부동산 거래 및 인테리어 견적 계산" },
                { title: "해외 직구 및 요리 레시피 계량", desc: "파운드(lb), 온스(oz), 갤런(gal) 등 영미권 무게 및 액체 부피 단위를 그램(g), 리터(L)로 즉시 계산" },
                { title: "엔지니어링 및 개발자 데이터 용량 환산", desc: "1024진법 기준 기가바이트(GB)와 메가바이트(MB), 테라바이트(TB) 간 정확한 스토리지 계산" },
                { title: "해외여행 시 온도 및 속도 환산", desc: "미국 날씨 화씨(°F)를 섭씨(°C)로, 고속도로 마일(mph)을 km/h로 빠르게 체감" }
              ],
              proTipsTitle: "단위 변환 전문가 실무 팁",
              proTips: [
                "1평은 정확히 약 3.305785 m²이며, m²를 평으로 빠르게 암산하려면 m² 수치에 0.3025를 곱하면 됩니다.",
                "한국 전통 육류 1근은 600g이지만 채소 1근은 375g(또는 400g)으로 취급되는 경우가 있으니 유의하세요.",
                "섭씨에서 화씨로의 변환 공식은 (°C × 9/5) + 32 이며, 0°C는 32°F, 100°C는 212°F입니다.",
                "컴퓨터 저장장치 제조사는 1000진법을 사용하지만 OS는 1024진법(2¹⁰)을 사용하므로 실제 표시 용량 차이가 발생합니다."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "한국 고유 단위인 '평'이나 '근'도 변환되나요?", a: "네! 넓이 카테고리에서 1평(3.3058m²), 무게 카테고리에서 1근(600g)을 완벽 지원합니다." },
                { q: "온도 변환 공식은 절대온도(Kelvin)도 지원하나요?", a: "네, 섭씨(°C), 화씨(°F), 켈빈(K) 간의 3방향 정밀 변환이 모두 지원됩니다." },
                { q: "디지털 용량은 1000과 1024 중 어떤 기준인가요?", a: "컴퓨팅 표준인 1024 바이트(1 KB = 1024 B, 1 MB = 1024 KB)를 기준으로 정확히 환산합니다." },
                { q: "모바일 스마트폰에서도 사용하기 편한가요?", a: "네! 모바일 터치 키패드와 스왑 버튼이 완벽하게 최적화되어 있습니다." },
                { q: "계산에 오차나 반올림 왜곡이 있나요?", a: "국제 도량형 표준 상수를 엄격히 적용하여 소수점 6자리까지 오차 없는 정확한 값을 제공합니다." },
                { q: "이용료가 발생하나요?", a: "100% 완전 무료이며 어떠한 제한 없이 무제한 이용하실 수 있습니다." }
              ],
              relatedTools: [
                { title: "색상 변환기 & 피커", desc: "HEX, RGB, HSL, CMYK 색상 코드 상호 변환", href: "/tools/color-converter/" },
                { title: "CSV ➔ JSON 변환기", desc: "스프레드시트 CSV 데이터를 구조화된 JSON으로 변환", href: "/tools/csv-to-json/" },
                { title: "JSON 정렬 / 검증기", desc: "JSON 포맷팅 및 문법 오류 실시간 진단", href: "/tools/json-formatter/" },
                { title: "글자수 세기 & 텍스트 분석", desc: "글자수, 단어수, 원고지 매수 및 읽기 시간 계산", href: "/tools/word-count/" }
              ]
            },
            en: {
              aboutTitle: "About Multi-Dimension Unit Converter",
              aboutDesc:
                "Convert over 50 metric, imperial, and localized units across 8 core categories: Length, Weight, Temperature, Area, Volume, Speed, Time, and Digital Storage. Includes an interactive live comparison matrix showing equivalent values for all units in real-time. 100% client-side precision calculation.",
              howTitle: "How to Use the Unit Converter",
              steps: [
                "Select your measurement category from the top tabs (Length, Weight, Temp, Area, etc.).",
                "Choose a quick preset or enter your numerical value in the left input box.",
                "Select your 'From' source unit and 'To' target unit using the dropdown selectors.",
                "Click the swap button (⇄) to instantly invert the conversion direction.",
                "Review the full category comparison matrix below and click 'Copy' to grab the result."
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "8 Categories & 50+ Global Units", desc: "Supports Metric (SI), Imperial/US customary, and localized units like Korean Pyeong and Geun." },
                { title: "Real-Time Full Comparison Matrix", desc: "Instantly computes and displays the equivalent value for every unit in the category simultaneously." },
                { title: "High-Precision Formatting", desc: "Calculates with 6 decimal places of precision and automatically formats extreme numbers with scientific notation." },
                { title: "100% Browser-Native Execution", desc: "Blazing fast calculations with zero network latency and responsive mobile layouts." }
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "Real Estate Area Calculations", desc: "Convert square meters (m²) to square feet (ft²) or Korean Pyeong for architectural planning." },
                { title: "Culinary Recipes & International Shopping", desc: "Translate ounces (oz), pounds (lb), and gallons (gal) to grams (g) and liters (L) accurately." },
                { title: "Software Engineering Storage Sizing", desc: "Convert bytes (B), megabytes (MB), gigabytes (GB), and terabytes (TB) using binary 1024 sizing." },
                { title: "Travel Navigation & Weather", desc: "Convert Fahrenheit (°F) to Celsius (°C) and miles per hour (mph) to km/h on the go." }
              ],
              proTipsTitle: "Professional Tips for Unit Conversions",
              proTips: [
                "To convert square meters to square feet quickly, multiply by roughly 10.764.",
                "For temperature conversion: °F = (°C × 9/5) + 32. Key reference: 20°C is 68°F (room temperature).",
                "Binary data storage in operating systems is calculated as 1 KB = 1024 Bytes, whereas hard drive manufacturers use 1000 Bytes.",
                "Use the swap button to quickly double-check your calculations in both directions."
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "Does this converter support localized units like Pyeong?", a: "Yes. In the Area category, Pyeong (3.3058 m²) is fully supported alongside acres and hectares." },
                { q: "Are temperature conversions accurate for Kelvin?", a: "Yes, precision formulas for Celsius, Fahrenheit, and Kelvin are implemented with high accuracy." },
                { q: "Is digital storage based on 1000 or 1024?", a: "It uses the binary standard of 1024 bytes (1 KB = 1024 Bytes, 1 MB = 1024 KB)." },
                { q: "Does this tool work offline on mobile?", a: "Yes. Once loaded, all calculations run 100% in your local browser sandbox." },
                { q: "Is there any precision loss during conversion?", a: "Calculations maintain full floating-point accuracy and are formatted to 6 decimal places." },
                { q: "Is this tool completely free?", a: "Yes, 100% free with unlimited conversions." }
              ],
              relatedTools: [
                { title: "Color Converter & Palette Generator", desc: "Convert between HEX, RGB, HSL, HSV, and CMYK color codes", href: "/tools/color-converter/" },
                { title: "CSV to JSON Converter", desc: "Transform CSV data into structured JSON with table preview", href: "/tools/csv-to-json/" },
                { title: "JSON Formatter & Validator", desc: "Prettify, minify, and validate JSON data in real-time", href: "/tools/json-formatter/" },
                { title: "Word Count & Text Analysis", desc: "Analyze word count, character count, and speaking duration", href: "/tools/word-count/" }
              ]
            },
            ja: {
              aboutTitle: "単位変換ツール（マルチ単位計算機）について",
              aboutDesc:
                "長さ、重さ、温度、面積（平/m²）、体積、速度、時間、デジタルデータ容量（KB/MB/GB/TB）など 8 つの主要カテゴリー・50 種類以上の単位をリアルタイムで相互変換するブラウザ完結型高精度計算ツールです。単一の入力からカテゴリー内のすべての単位を一覧比較できる比較表を同時表示します。",
              howTitle: "単位変換ツールの使い方",
              steps: [
                "上部のタブから変換したいカテゴリー（長さ、重さ、温度、面積など）を選択します。",
                "「クイックプリセット」をクリックするか、左側の入力欄に数値を入力します。",
                "ドロップダウンメニューで変換元単位と変換先単位を選択します。",
                "入れ替えボタン（⇄）をクリックすると変換元と変換先を瞬時に入れ替えられます。",
                "下部の全単位比較表で一覧を確認し、「コピー」ボタンで結果を取得します。"
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "8 カテゴリー 50 以上の国際単位に対応", desc: "メートル法、ヤードポンド法に加え、アジア圏の伝統単位（坪など）も網羅しています。" },
                { title: "リアルタイム全単位比較表", desc: "数値を1つ入力するだけで、同じカテゴリーに属する全単位の換算結果を一覧表示します。" },
                { title: "高精度小数点＆指数表記", desc: "小数点以下 6 桁まで正確に計算し、極端な大容量・微小数値は指数形式で見やすく表示します。" },
                { title: "100% ブラウザ内ローカル処理", desc: "サーバー通信なしで瞬時に動作し、スマートフォンでも軽快に操作可能です。" }
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "不動産・建築の面積（m² ↔ 坪）計算", desc: "マンション専有面積 84m² を約 25.4 坪に換算するなど間取りや設計の確認" },
                { title: "海外レシピや個人輸入の計量", desc: "ポンド（lb）、オンス（oz）、ガロン（gal）をグラム（g）やリットル（L）に換算" },
                { title: "エンジニアのデータストレージ計算", desc: "1024 基準でのメガバイト（MB）、ギガバイト（GB）、テラバイト（TB）の正確な換算" },
                { title: "海外旅行時の気温・速度換算", desc: "華氏（°F）を摂氏（°C）に、時速マイル（mph）を km/h に素早く計算" }
              ],
              proTipsTitle: "単位変換のプロのテクニック",
              proTips: [
                "1坪は約 3.305785 m² です。m² から坪への概算は「m² × 0.3025」で計算できます。",
                "華氏（°F）から摂氏（°C）への変換公式は「(°F - 32) × 5/9」です。20°C は 68°F に相当します。",
                "OS 上のデータ容量は 1024 バイト単位（2¹⁰）で計算されるため、ハードディスク公称値と差異が生じます。",
                "単位の入れ替えボタン（⇄）を活用して往復の計算結果をすばやく検証しましょう。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "坪（pyeong）の変換に対応していますか？", a: "はい。面積カテゴリーで 1 坪（約 3.3058 m²）の換算に対応しています。" },
                { q: "ケルビン（K）を含む温度換算は可能ですか？", a: "はい、摂氏（°C）、華氏（°F）、ケルビン（K）の相互変換に対応しています。" },
                { q: "データ容量は 1000 基準ですか、1024 基準ですか？", a: "コンピュータ規格に準拠し、1024 バイト（1 KB = 1024 B）基準で換算します。" },
                { q: "スマートフォンでも使えますか？", a: "はい、モバイル端末に完全対応しています。" },
                { q: "計算精度に誤差はありますか？", a: "国際度量衡標準定数を厳格に適用し、小数点第 6 位まで正確に算出します。" },
                { q: "無料で利用できますか？", a: "はい、完全無料・回数無制限でご利用いただけます。" }
              ],
              relatedTools: [
                { title: "色コード変換＆ピッカー", desc: "HEX、RGB、HSL、CMYK の相互変換とカラーパレット作成", href: "/tools/color-converter/" },
                { title: "CSV ➔ JSON 変換器", desc: "CSV データを構造化 JSON に瞬時に変換", href: "/tools/csv-to-json/" },
                { title: "JSON 整形・バリデーター", desc: "JSON の整形、圧縮、構文エラー検証", href: "/tools/json-formatter/" },
                { title: "文字数カウント＆文章分析", desc: "文字数、単語数、原稿用紙枚数、読了時間を測定", href: "/tools/word-count/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Conversor de Unidades Multidimensional",
              aboutDesc:
                "Convierte más de 50 unidades métricas, imperiales y tradicionales en 8 categorías esenciales: Longitud, Masa/Peso, Temperatura, Área, Volumen, Velocidad, Tiempo y Almacenamiento Digital. Proporciona una tabla de comparación en vivo que calcula simultáneamente todas las unidades equivalentes de la categoría.",
              howTitle: "Cómo Usar el Conversor de Unidades",
              steps: [
                "Selecciona la categoría de medida en las pestañas superiores (Longitud, Peso, Temperatura, etc.).",
                "Haz clic en un preajuste rápido o escribe un número en el cuadro de entrada.",
                "Elige la unidad de origen ('From') y la de destino ('To') en los menús desplegables.",
                "Pulsa el botón de intercambio (⇄) para invertir las unidades al instante.",
                "Consulta la matriz de comparación completa abajo y pulsa 'Copiar' para guardar el resultado."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "8 Categorías y más de 50 Unidades", desc: "Cubre el Sistema Internacional (SI), sistema imperial anglosajón y medidas tradicionales." },
                { title: "Matriz de Comparación en Tiempo Real", desc: "Muestra la equivalencia de tu valor en todas las unidades de la categoría simultáneamente." },
                { title: "Alta Precisión Decimal y Notación Científica", desc: "Calcula con 6 cifras decimales de precisión y adapta números extremos a formato exponencial." },
                { title: "Procesamiento 100% en el Navegador", desc: "Cálculos ultra rápidos sin latencia de servidor y adaptados a dispositivos móviles." }
              ],
              useCasesTitle: "Casos de Uso Comunes",
              useCases: [
                { title: "Conversión de Superficies Inmobiliarias", desc: "Calcula metros cuadrados (m²) a pies cuadrados (ft²), acres o hectáreas." },
                { title: "Recetas y Cocina Internacional", desc: "Convierte onzas (oz), libras (lb) y galones (gal) a gramos (g) y litros (L)." },
                { title: "Almacenamiento en Informática", desc: "Calcula bytes (B), megabytes (MB), gigabytes (GB) y terabytes (TB) en base binaria 1024." },
                { title: "Viajes y Meteorología", desc: "Pasa de grados Fahrenheit (°F) a Celsius (°C) y de millas por hora (mph) a km/h." }
              ],
              proTipsTitle: "Consejos Profesionales de Conversión",
              proTips: [
                "Para convertir m² a pies cuadrados de memoria, multiplica aproximadamente por 10.76.",
                "La fórmula de temperatura es °F = (°C × 9/5) + 32. 0°C son 32°F y 100°C son 212°F.",
                "El almacenamiento informático en sistemas operativos opera en múltiplos binarios de 1024.",
                "Usa el botón de intercambio (⇄) para verificar la exactitud de tus cálculos bidireccionales."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Se admiten unidades como acres o hectáreas?", a: "Sí, en la categoría de Área dispones de m², km², ft², acres y hectáreas." },
                { q: "¿Es precisa la conversión de temperatura?", a: "Sí, incluye fórmulas exactas para Celsius, Fahrenheit y Kelvin." },
                { q: "¿El almacenamiento se calcula en base 1000 o 1024?", a: "Se basa en el estándar de 1024 bytes (1 KB = 1024 B, 1 MB = 1024 KB)." },
                { q: "¿Funciona en teléfonos móviles?", a: "Sí, la interfaz táctil está totalmente optimizada para smartphones." },
                { q: "¿Hay pérdida de precisión en los cálculos?", a: "Se calculan con precisión de punto flotante y se muestran con hasta 6 decimales." },
                { q: "¿Es gratuito?", a: "Sí, 100% gratuito e ilimitado." }
              ],
              relatedTools: [
                { title: "Conversor de Color y Paleta", desc: "Convierte entre códigos HEX, RGB, HSL, HSV y CMYK", href: "/tools/color-converter/" },
                { title: "Conversor de CSV a JSON", desc: "Convierte hojas de cálculo CSV en JSON estructurado", href: "/tools/csv-to-json/" },
                { title: "Formateador y Validador JSON", desc: "Embellece, valida y minifica datos JSON", href: "/tools/json-formatter/" },
                { title: "Contador de Palabras y Caracteres", desc: "Analiza palabras, caracteres y tiempo de lectura", href: "/tools/word-count/" }
              ]
            },
            zh: {
              aboutTitle: "关于全功能高精度单位换算器",
              aboutDesc:
                "支持长度、重量、温度、面积（平方米/坪/亩）、体积、速度、时间、数字存储容量（KB/MB/GB/TB）等 8 大核心维度、50 余种公制、英制与传统单位的实时高精度相互换算。独家提供同维度全单位横向对比矩阵，一键掌握所有换算数值。100% 浏览器本地毫秒级计算。",
              howTitle: "如何使用多功能单位换算器",
              steps: [
                "在顶部标签页选择需要换算的物理量维度（长度、重量、温度、面积等）。",
                "可直接点击“热门快捷预设”（如 84m² → 坪、100°C → °F 等）快速加载。",
                "在左侧输入框填入数值，并在下拉菜单中分别指定原始单位与目标单位。",
                "点击中间的双向箭头（⇄）按钮，可秒级反转输入与输出单位。",
                "在下方全单位对照矩阵中查看所有换算结果，点击“复制”按钮带走数据。"
              ],
              featuresTitle: "核心功能与特点",
              features: [
                { title: "8 大维度 50+ 国际与传统单位", desc: "全面覆盖国际公制（SI）、英美制单位以及东亚传统面积单位（坪、公顷）。" },
                { title: "实时全单位矩阵横向比对", desc: "只需输入一个数值，同一类别下的所有单位换算结果同时以表格形式呈现。" },
                { title: "6 位高精小数与科学计数法", desc: "默认提供 6 位小数的高精计算，极端庞大或微小的数值自动适配科学计数法。" },
                { title: "100% 客户端本地安全秒开", desc: "无需等待服务器响应，即使在弱网环境下亦可在手机端流畅使用。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "房屋置业与装修面积核算", desc: "将建筑面积 84 平方米换算为约 25.4 坪或平方英尺，快速比对户型图纸" },
                { title: "海淘商品重量与西式烹饪烘焙", desc: "将磅（lb）、盎司（oz）、加仑（gal）精准折算为千克（kg）、克（g）与升（L）" },
                { title: "软件开发与服务器存储容量规划", desc: "按 1024 进制准确核算 KB、MB、GB、TB 的数据规模与带宽流量" },
                { title: "出国旅行天气温度与行车车速换算", desc: "将华氏度（°F）换算为摄氏度（°C），英里时速（mph）换算为 km/h" }
              ],
              proTipsTitle: "单位换算专业实战技巧",
              proTips: [
                "1 坪约等于 3.305785 平方米，平方米转坪数的心算速算法为：平方米数值 × 0.3025。",
                "华氏度 (°F) 转摄氏度 (°C) 的标准公式为：(°F - 32) × 5/9。常温 20°C 对应 68°F。",
                "计算机操作系统以 1024 字节（2¹⁰）为进率，而硬盘厂商常按 1000 进制标称，故实际可用容量略小。",
                "善用中间的 ⇄ 按钮，正向逆向双重核验重要计算结果。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "支持东亚传统面积单位“坪”吗？", a: "支持！在“面积”分类下完整集成了 1 坪（约 3.3058 m²）的精准换算。" },
                { q: "温度换算支持绝对温度（开尔文 K）吗？", a: "支持，摄氏度（°C）、华氏度（°F）、开尔文（K）三者之间可自由互转。" },
                { q: "存储单位是按 1000 还是 1024 换算？", a: "严格按照计算机二进制标准（1 KB = 1024 B, 1 MB = 1024 KB）进行计算。" },
                { q: "手机端可以正常操作吗？", a: "完全可以，已针对移动端触摸屏优化。" },
                { q: "计算过程中有精度截断吗？", a: "内部采用标准双精度浮点数运算，输出精确保留至小数点后 6 位。" },
                { q: "完全免费吗？", a: "100% 永久免费，无任何换算限制。" }
              ],
              relatedTools: [
                { title: "颜色转换器与调色板", desc: "HEX、RGB、HSL、HSV、CMYK 颜色代码相互转换", href: "/tools/color-converter/" },
                { title: "CSV ➔ JSON 转换器", desc: "表格 CSV 数据即刻转为结构化 JSON 格式", href: "/tools/csv-to-json/" },
                { title: "JSON 格式化与校验工具", desc: "JSON 数据美化、压缩与语法错误实时排查", href: "/tools/json-formatter/" },
                { title: "字数统计与文本分析", desc: "实时统计字符数、单词数、原稿纸页数与朗读时长", href: "/tools/word-count/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Convertisseur d'Unités Universel",
              aboutDesc:
                "Convertissez plus de 50 unités métriques, impériales et traditionnelles réparties sur 8 catégories fondamentales : Longueur, Poids/Masse, Température, Superficie, Volume, Vitesse, Temps et Stockage Numérique. Comprend un tableau comparatif exhaustif affichant instantanément toutes les valeurs équivalentes de la catégorie.",
              howTitle: "Comment Utiliser le Convertisseur d'Unités",
              steps: [
                "Sélectionnez votre grandeur physique dans les onglets supérieurs (Longueur, Poids, Température, etc.).",
                "Cliquez sur un préréglage rapide ou saisissez une valeur dans le champ de gauche.",
                "Sélectionnez l'unité source ('De') et l'unité cible ('Vers') dans les menus déroulants.",
                "Cliquez sur le bouton de permutation (⇄) pour inverser le sens de conversion en un clic.",
                "Consultez le tableau comparatif complet ci-dessous et cliquez sur 'Copier' pour récupérer le résultat."
              ],
              featuresTitle: "Fonctionnalités Clés",
              features: [
                { title: "8 Catégories & Plus de 50 Unités", desc: "Prend en charge le Système International (SI), le système impérial et les mesures traditionnelles." },
                { title: "Matrice de Comparaison en Temps Réel", desc: "Affiche instantanément l'équivalence de votre valeur pour toutes les unités de la catégorie." },
                { title: "Haute Précision Décimale & Notation Scientifique", desc: "Calcule jusqu'à 6 décimales de précision et adapte les valeurs extrêmes en notation scientifique." },
                { title: "Traitement 100% Côté Client", desc: "Calculs instantanés sans latence réseau et interface adaptée aux smartphones." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Superficies Immobilières et Architecture", desc: "Convertissez les mètres carrés (m²) en pieds carrés (ft²), hectares ou acres." },
                { title: "Recettes de Cuisine et Pâtisserie Internationale", desc: "Transformez onces (oz), livres (lb) et gallons (gal) en grammes (g) et litres (L)." },
                { title: "Dimensionnement Informatique", desc: "Calculez octets (B), mégaoctets (MB), gigaoctets (GB) et téraoctets (TB) en base 1024." },
                { title: "Voyages et Météorologie", desc: "Convertissez les degrés Fahrenheit (°F) en Celsius (°C) et les miles/heure (mph) en km/h." }
              ],
              proTipsTitle: "Conseils d'Experts sur les Unités",
              proTips: [
                "Pour passer rapidement des m² aux pieds carrés, multipliez approximativement par 10.764.",
                "La formule de conversion de température est °F = (°C × 9/5) + 32. 20°C équivaut à 68°F.",
                "La mémoire numérique dans les OS fonctionne en base binaire 1024 (1 KB = 1024 Octets).",
                "Utilisez le bouton d'inversion (⇄) pour vérifier immédiatement vos calculs dans les deux sens."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Les hectares et les acres sont-ils inclus ?", a: "Oui, la catégorie Superficie comprend m², km², ft², acres et hectares." },
                { q: "Le calcul de température gère-t-il les Kelvins ?", a: "Oui, conversion tripartite exacte entre Celsius, Fahrenheit et Kelvin." },
                { q: "Le stockage est-il basé sur 1000 ou 1024 ?", a: "Il respecte la norme binaire standard de 1024 octets (1 KB = 1024 B, 1 MB = 1024 KB)." },
                { q: "L'outil fonctionne-t-il sur mobile ?", a: "Oui, interface tactile parfaitement réactive." },
                { q: "Y a-t-il une perte de précision ?", a: "Tous les calculs conservent la précision en virgule flottante jusqu'à 6 décimales." },
                { q: "L'outil est-il gratuit ?", a: "Oui, 100% gratuit et sans limite." }
              ],
              relatedTools: [
                { title: "Convertisseur de Couleurs & Palette", desc: "Convertissez entre HEX, RGB, HSL, HSV et CMYK", href: "/tools/color-converter/" },
                { title: "Convertisseur CSV vers JSON", desc: "Transformez vos données CSV en JSON structuré", href: "/tools/csv-to-json/" },
                { title: "Formateur & Validateur JSON", desc: "Mise en page, compression et validation de JSON", href: "/tools/json-formatter/" },
                { title: "Compteur de Mots et Caractères", desc: "Analyse de mots, caractères et temps de lecture", href: "/tools/word-count/" }
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
          .converter-inputs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
