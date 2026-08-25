"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  Sparkles,
  PlayCircle,
  Sliders,
  HelpCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

// Preset definitions
const CRON_PRESETS = [
  { key: "cronParser.presetEvery5Min", expr: "*/5 * * * *" },
  { key: "cronParser.presetEveryHour", expr: "0 * * * *" },
  { key: "cronParser.presetEveryDayMidnight", expr: "0 0 * * *" },
  { key: "cronParser.presetEveryDay9AM", expr: "0 9 * * *" },
  { key: "cronParser.presetEveryMon9AM", expr: "0 9 * * 1" },
  { key: "cronParser.presetFirstOfMonth", expr: "0 0 1 * *" },
];

// Translate cron expression to human description for active locale
function parseCronToDescription(expr: string, locale: string = "en") {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    const invalidMsg: Record<string, string> = {
      en: "Invalid cron expression. Must have exactly 5 fields (minute hour day month weekday).",
      ko: "유효하지 않은 Cron 표현식입니다. 5개 필드(분 시 일 월 요일)가 필요합니다.",
      ja: "無効な Cron 式です。5 つのフィールド (分 時 日 月 曜日) が必要です。",
      es: "Expresión Cron no válida. Debe tener exactamente 5 campos (minuto hora día mes día_de_semana).",
      zh: "无效的 Cron 表达式。必须包含 5 个字段（分 时 日 月 星期）。",
      fr: "Expression Cron non valide. Doit contenir exactement 5 champs (minute heure jour mois jour_semaine).",
    };
    return { isValid: false, text: invalidMsg[locale] || invalidMsg.en };
  }

  const [min, hour, dom, month, dow] = parts;

  if (min.startsWith("*/") && hour === "*" && dom === "*" && dow === "*") {
    const interval = min.split("/")[1];
    const map: Record<string, string> = {
      en: `Every ${interval} minutes`,
      ko: `${interval}분마다 실행`,
      ja: `${interval}分ごとに実行`,
      es: `Cada ${interval} minutos`,
      zh: `每 ${interval} 分钟执行一次`,
      fr: `Toutes les ${interval} minutes`,
    };
    return { isValid: true, text: map[locale] || map.en };
  }

  if (min === "0" && hour === "*" && dom === "*" && dow === "*") {
    const map: Record<string, string> = {
      en: `At minute 0 of every hour`,
      ko: `매 시간 정각(0분)마다 실행`,
      ja: `毎時 0 分に実行`,
      es: `En el minuto 0 de cada hora`,
      zh: `每小时 0 分时执行`,
      fr: `À la minute 0 de chaque heure`,
    };
    return { isValid: true, text: map[locale] || map.en };
  }

  if (min === "0" && hour !== "*" && dom === "*" && dow === "*") {
    const formattedHour = hour.padStart(2, "0");
    const map: Record<string, string> = {
      en: `Every day at ${formattedHour}:00`,
      ko: `매일 ${hour}시 정각에 실행`,
      ja: `毎日 ${hour}:00 に実行`,
      es: `Todos los días a las ${formattedHour}:00`,
      zh: `每天 ${hour}:00 执行`,
      fr: `Chaque jour à ${formattedHour}:00`,
    };
    return { isValid: true, text: map[locale] || map.en };
  }

  const weekdaysMap: Record<string, string[]> = {
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ko: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
    ja: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
    es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    zh: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    fr: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
  };

  const dayList = weekdaysMap[locale] || weekdaysMap.en;

  if (min === "0" && hour !== "*" && dow !== "*") {
    const dayName = dayList[parseInt(dow)] || dow;
    const formattedHour = hour.padStart(2, "0");
    const map: Record<string, string> = {
      en: `At ${formattedHour}:00 on ${dayName}`,
      ko: `매주 ${dayName} ${hour}시 정각에 실행`,
      ja: `毎週${dayName}の ${hour}:00 に実行`,
      es: `Cada ${dayName} a las ${formattedHour}:00`,
      zh: `每周${dayName} ${hour}:00 执行`,
      fr: `Chaque ${dayName} à ${formattedHour}:00`,
    };
    return { isValid: true, text: map[locale] || map.en };
  }

  return {
    isValid: true,
    text: `[Min: ${min}, Hour: ${hour}, Day: ${dom}, Mon: ${month}, Dow: ${dow}]`,
  };
}

// Compute next 5 run times
function calculateNextRuns(expr: string, count: number = 5): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minStr, hourStr, domStr, monthStr, dowStr] = parts;
  const runs: Date[] = [];
  let curr = new Date();
  curr.setSeconds(0, 0);

  // Search ahead up to 10,000 minutes
  for (let i = 1; i <= 10000 && runs.length < count; i++) {
    curr = new Date(curr.getTime() + 60 * 1000);

    const m = curr.getMinutes();
    const h = curr.getHours();
    const dom = curr.getDate();
    const mon = curr.getMonth() + 1;
    const dow = curr.getDay();

    const matchMin = minStr === "*" || (minStr.startsWith("*/") && m % parseInt(minStr.split("/")[1]) === 0) || minStr.split(",").includes(String(m));
    const matchHour = hourStr === "*" || (hourStr.startsWith("*/") && h % parseInt(hourStr.split("/")[1]) === 0) || hourStr.split(",").includes(String(h));
    const matchDom = domStr === "*" || domStr.split(",").includes(String(dom));
    const matchMon = monthStr === "*" || monthStr.split(",").includes(String(mon));
    const matchDow = dowStr === "*" || dowStr.split(",").includes(String(dow));

    if (matchMin && matchHour && matchDom && matchMon && matchDow) {
      runs.push(new Date(curr));
    }
  }

  return runs;
}

export default function CronParserPage() {
  const { t, locale } = useLocale();
  const [cronInput, setCronInput] = useState("*/5 * * * *");
  const [copied, setCopied] = useState(false);

  // Visual builder fields
  const [bMin, setBMin] = useState("*/5");
  const [bHour, setBHour] = useState("*");
  const [bDom, setBDom] = useState("*");
  const [bMon, setBMon] = useState("*");
  const [bDow, setBDow] = useState("*");

  const parsed = useMemo(() => parseCronToDescription(cronInput, locale), [cronInput, locale]);
  const nextRuns = useMemo(() => calculateNextRuns(cronInput), [cronInput]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(cronInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cronInput]);

  // Apply visual builder choices
  const applyBuilder = (min: string, hour: string, dom: string, mon: string, dow: string) => {
    setBMin(min);
    setBHour(hour);
    setBDom(dom);
    setBMon(mon);
    setBDow(dow);
    setCronInput(`${min} ${hour} ${dom} ${mon} ${dow}`);
  };

  const dateLocaleMap: Record<string, string> = {
    ko: "ko-KR",
    ja: "ja-JP",
    es: "es-ES",
    zh: "zh-CN",
    fr: "fr-FR",
    en: "en-US",
  };

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
            {t("cronParser.back")}
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
              <Clock size={20} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("cronParser.title")}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
            {t("cronParser.subtitle")}
          </p>
        </section>

        {/* Main Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {/* Cron Input & Result Banner */}
          <div className="glass-card" style={{ padding: "28px", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {t("cronParser.inputLabel")}
              </label>

              {/* Presets dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{t("cronParser.presetsLabel")}</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) setCronInput(e.target.value);
                  }}
                  style={{
                    height: "34px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "var(--text-primary)",
                    fontSize: "12.5px",
                    padding: "0 10px",
                    cursor: "pointer",
                  }}
                >
                  <option value="">{t("cronParser.presetSelect")}</option>
                  {CRON_PRESETS.map((p) => (
                    <option key={p.key} value={p.expr}>
                      {t(p.key)} ({p.expr})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input Box with Copy Button */}
            <div style={{ display: "flex", gap: "12px" }}>
              <input
                type="text"
                value={cronInput}
                onChange={(e) => setCronInput(e.target.value)}
                placeholder="*/5 * * * *"
                style={{
                  flex: 1,
                  height: "50px",
                  borderRadius: "12px",
                  background: "rgba(0,0,0,0.3)",
                  border: parsed.isValid ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(239,68,68,0.5)",
                  padding: "0 18px",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "2px",
                  outline: "none",
                }}
              />

              <button
                onClick={copyToClipboard}
                style={{
                  padding: "0 24px",
                  borderRadius: "12px",
                  background: copied ? "rgba(34,211,168,0.2)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
                  border: copied ? "1px solid rgba(34,211,168,0.4)" : "none",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t("cronParser.copied") : t("cronParser.copy")}
              </button>
            </div>

            {/* Human Readable Translation Output Box */}
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#818cf8" }}>
                {t("cronParser.translationLabel")}
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                {parsed.text}
              </div>
            </div>
          </div>

          {/* Grid: Next Runs & Visual Builder */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }} className="cron-grid">
            {/* Left: Next 5 Run Schedules */}
            <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={18} style={{ color: "#34d399" }} />
                {t("cronParser.upcomingLabel")}
              </h3>

              {nextRuns.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>
                  {t("cronParser.unableToCalc")}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {nextRuns.map((date, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#818cf8", width: "24px" }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {date.toLocaleString(dateLocaleMap[locale] || "en-US", { dateStyle: "medium", timeStyle: "medium" })}
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {date.toLocaleString(dateLocaleMap[locale] || "en-US", { weekday: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Interactive Visual Builder */}
            <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sliders size={18} style={{ color: "#c084fc" }} />
                {t("cronParser.builderTitle")}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: t("cronParser.minLabel"), val: bMin, set: setBMin, options: ["*", "0", "*/5", "*/10", "*/15", "*/30"] },
                  { label: t("cronParser.hourLabel"), val: bHour, set: setBHour, options: ["*", "0", "9", "12", "18", "*/2", "*/6"] },
                  { label: t("cronParser.domLabel"), val: bDom, set: setBDom, options: ["*", "1", "15", "30"] },
                  { label: t("cronParser.monLabel"), val: bMon, set: setBMon, options: ["*", "1", "6", "12"] },
                  { label: t("cronParser.dowLabel"), val: bDow, set: setBDow, options: ["*", t("cronParser.dowSun"), t("cronParser.dowMon"), t("cronParser.dowFri")] },
                ].map(({ label, val, set, options }, idx) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
                    <select
                      value={val}
                      onChange={(e) => {
                        const newVals = [bMin, bHour, bDom, bMon, bDow];
                        newVals[idx] = e.target.value;
                        applyBuilder(newVals[0], newVals[1], newVals[2], newVals[3], newVals[4]);
                      }}
                      style={{
                        height: "34px",
                        borderRadius: "6px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "var(--text-primary)",
                        fontSize: "12.5px",
                        padding: "0 10px",
                        cursor: "pointer",
                      }}
                    >
                      {options.map((opt) => (
                        <option key={opt} value={opt.split(" ")[0]}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tool Guide */}
        <ToolGuide
          badgeText={t("cronParser.guideBadge")}
          aboutTitle={t("cronParser.guide.aboutTitle")}
          aboutDesc={t("cronParser.guide.aboutDesc")}
          howTitle={t("cronParser.guide.howTitle")}
          steps={[
            t("cronParser.guide.step1"),
            t("cronParser.guide.step2"),
            t("cronParser.guide.step3"),
          ]}
          faqs={[
            { q: t("cronParser.guide.faq1Q"), a: t("cronParser.guide.faq1A") },
            { q: t("cronParser.guide.faq2Q"), a: t("cronParser.guide.faq2A") },
          ]}
        />
      </main>

      <Footer />

      <style>{`
        @media (max-width: 868px) {
          .cron-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

