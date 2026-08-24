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

// Preset definitions
const CRON_PRESETS = [
  { label: "Every 5 Minutes", expr: "*/5 * * * *" },
  { label: "Every Hour", expr: "0 * * * *" },
  { label: "Every Day at Midnight", expr: "0 0 * * *" },
  { label: "Every Day at 9:00 AM", expr: "0 9 * * *" },
  { label: "Every Monday at 9:00 AM", expr: "0 9 * * 1" },
  { label: "1st of Every Month at Midnight", expr: "0 0 1 * *" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_KR = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

// Translate cron expression to human description
function parseCronToDescription(expr: string) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      isValid: false,
      en: "Invalid cron expression. Must have exactly 5 fields (minute hour day month weekday).",
      kr: "유효하지 않은 Cron 표현식입니다. 5개 필드(분 시 일 월 요일)가 필요합니다.",
    };
  }

  const [min, hour, dom, month, dow] = parts;

  // Simple Humanizer logic
  let minText = min === "*" ? "every minute" : min.startsWith("*/") ? `every ${min.split("/")[1]} minutes` : `at minute ${min}`;
  let minTextKr = min === "*" ? "매 분" : min.startsWith("*/") ? `${min.split("/")[1]}분마다` : `${min}분에`;

  let hourText = hour === "*" ? "every hour" : hour.startsWith("*/") ? `every ${hour.split("/")[1]} hours` : `at ${hour.padStart(2, "0")}:00`;
  let hourTextKr = hour === "*" ? "매 시간" : hour.startsWith("*/") ? `${hour.split("/")[1]}시간마다` : `${hour}시에`;

  let dowText = dow === "*" ? "" : `on ${dow.split(",").map((d) => WEEKDAYS[parseInt(d)] || d).join(", ")}`;
  let dowTextKr = dow === "*" ? "" : `${dow.split(",").map((d) => WEEKDAYS_KR[parseInt(d)] || d).join(", ")}마다`;

  let domText = dom === "*" ? "" : `on day ${dom} of the month`;
  let domTextKr = dom === "*" ? "" : `매월 ${dom}일에`;

  let summaryEn = "";
  let summaryKr = "";

  if (min.startsWith("*/") && hour === "*" && dom === "*" && dow === "*") {
    summaryEn = `Every ${min.split("/")[1]} minutes`;
    summaryKr = `${min.split("/")[1]}분마다 실행`;
  } else if (min === "0" && hour === "*" && dom === "*" && dow === "*") {
    summaryEn = `At minute 0 of every hour`;
    summaryKr = `매 시간 정각(0분)마다 실행`;
  } else if (min === "0" && hour !== "*" && dom === "*" && dow === "*") {
    summaryEn = `Every day at ${hour.padStart(2, "0")}:00`;
    summaryKr = `매일 ${hour}시 정각에 실행`;
  } else if (min === "0" && hour !== "*" && dow !== "*") {
    summaryEn = `At ${hour.padStart(2, "0")}:00 on ${WEEKDAYS[parseInt(dow)] || dow}`;
    summaryKr = `매주 ${WEEKDAYS_KR[parseInt(dow)] || dow} ${hour}시 정각에 실행`;
  } else {
    summaryEn = `${minText} ${hourText} ${domText} ${dowText}`.trim();
    summaryKr = `${domTextKr} ${dowTextKr} ${hourTextKr} ${minTextKr} 실행`.trim();
  }

  return { isValid: true, en: summaryEn, kr: summaryKr };
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
  const [cronInput, setCronInput] = useState("*/5 * * * *");
  const [copied, setCopied] = useState(false);

  // Visual builder fields
  const [bMin, setBMin] = useState("*/5");
  const [bHour, setBHour] = useState("*");
  const [bDom, setBDom] = useState("*");
  const [bMon, setBMon] = useState("*");
  const [bDow, setBDow] = useState("*");

  const parsed = useMemo(() => parseCronToDescription(cronInput), [cronInput]);
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
            Back to All Tools
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
              Cron Expression Parser & Builder
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
            Cron 표현식을 입력하여 한국어/영어 의미를 해석하고, 다음 5회 실행 스케줄을 미리 계산해 확인하세요.
          </p>
        </section>

        {/* Main Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {/* Cron Input & Result Banner */}
          <div className="glass-card" style={{ padding: "28px", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Cron Expression Input (5 fields)
              </label>

              {/* Presets dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Presets:</span>
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
                  <option value="">-- Select Preset --</option>
                  {CRON_PRESETS.map((p) => (
                    <option key={p.label} value={p.expr}>
                      {p.label} ({p.expr})
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
                {copied ? "Copied" : "Copy"}
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
                Human Readable Translation
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                {parsed.kr}
              </div>
              <div style={{ fontSize: "13.5px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                "{parsed.en}"
              </div>
            </div>
          </div>

          {/* Grid: Next Runs & Visual Builder */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }} className="cron-grid">
            {/* Left: Next 5 Run Schedules */}
            <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={18} style={{ color: "#34d399" }} />
                Upcoming 5 Scheduled Execution Times
              </h3>

              {nextRuns.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>
                  Unable to calculate next runs for this expression.
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
                          {date.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "medium" })}
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {date.toLocaleString("en-US", { weekday: "short" })}
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
                Visual Cron Builder
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Minute (0-59)", val: bMin, set: setBMin, options: ["*", "0", "*/5", "*/10", "*/15", "*/30"] },
                  { label: "Hour (0-23)", val: bHour, set: setBHour, options: ["*", "0", "9", "12", "18", "*/2", "*/6"] },
                  { label: "Day of Month (1-31)", val: bDom, set: setBDom, options: ["*", "1", "15", "30"] },
                  { label: "Month (1-12)", val: bMon, set: setBMon, options: ["*", "1", "6", "12"] },
                  { label: "Day of Week (0-6)", val: bDow, set: setBDow, options: ["*", "0 (Sun)", "1 (Mon)", "5 (Fri)"] },
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
          badgeText="Developer Essential"
          aboutTitle="Cron 표현식이란 무엇인가요?"
          aboutDesc="리눅스/유닉스 서버나 클라우드 작업 스케줄러에서 정기적인 배치 작업(매 5분마다 데이터 수집, 매일 자정 데이터베이스 백업 등)을 실행 시각을 지정하기 위해 사용되는 표준 문자열 표현 방식입니다."
          howTitle="사용 방법"
          steps={[
            "상단 입력창에 5자리 Cron 표현식(예: */5 * * * *)을 직접 입력하거나 프리셋 선택 메뉴를 활용합니다.",
            "실시간 번역 상자에서 한국어 및 영문 설명을 확인합니다.",
            "오른쪽 하단 Visual Cron Builder를 이용해 각 항목(분, 시, 일, 월, 요일)을 클릭하여 새로운 표현식을 작성합니다.",
          ]}
          faqs={[
            { q: "5자리 표현식은 각각 무엇을 의미하나요?", a: "[분 (0-59)] [시 (0-23)] [일 (1-31)] [월 (1-12)] [요일 (0-6, 0=일요일)] 순서로 구성됩니다." },
            { q: "*/5 의 별표와 슬래시는 무엇인가요?", a: "*는 '매 번'을 의미하고 /5는 '5단위 간격'을 의미하므로, */5 는 '매 5분마다'라는 뜻이 됩니다." },
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
