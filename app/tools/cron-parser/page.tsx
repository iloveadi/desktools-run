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
  Layers,
  FileCode,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { useLocale } from "@/lib/context/LocaleContext";

// Preset definitions
const CRON_PRESETS = [
  { key: "cronParser.presetEvery5Min", label: "Every 5 minutes", expr: "*/5 * * * *" },
  { key: "cronParser.presetEveryHour", label: "Every hour (0m)", expr: "0 * * * *" },
  { key: "cronParser.presetEveryDayMidnight", label: "Every day at 00:00", expr: "0 0 * * *" },
  { key: "cronParser.presetEveryDay9AM", label: "Every day at 09:00", expr: "0 9 * * *" },
  { key: "cronParser.presetEveryMon9AM", label: "Every Monday at 09:00", expr: "0 9 * * 1" },
  { key: "cronParser.presetFirstOfMonth", label: "1st of every month", expr: "0 0 1 * *" },
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
    text: `[Min: ${min}, Hour: ${hour}, Day: ${dom}, Month: ${month}, Weekday: ${dow}]`,
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

    const matchMin =
      minStr === "*" ||
      (minStr.startsWith("*/") && m % parseInt(minStr.split("/")[1]) === 0) ||
      minStr.split(",").includes(String(m));
    const matchHour =
      hourStr === "*" ||
      (hourStr.startsWith("*/") && h % parseInt(hourStr.split("/")[1]) === 0) ||
      hourStr.split(",").includes(String(h));
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
  const { locale, t } = useLocale();

  const [cronInput, setCronInput] = useState<string>("*/15 9-18 * * 1-5");
  const [copied, setCopied] = useState<boolean>(false);

  // Builder states
  const [bMin, setBMin] = useState("*");
  const [bHour, setBHour] = useState("*");
  const [bDom, setBDom] = useState("*");
  const [bMon, setBMon] = useState("*");
  const [bDow, setBDow] = useState("*");

  const parsedInfo = useMemo(() => parseCronToDescription(cronInput, locale), [cronInput, locale]);
  const nextRuns = useMemo(() => calculateNextRuns(cronInput, 5), [cronInput]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(cronInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cronInput]);

  const applyPreset = (expr: string) => {
    setCronInput(expr);
    const parts = expr.split(" ");
    if (parts.length === 5) {
      setBMin(parts[0]);
      setBHour(parts[1]);
      setBDom(parts[2]);
      setBMon(parts[3]);
      setBDow(parts[4]);
    }
  };

  const applyBuilder = (min: string, hour: string, dom: string, mon: string, dow: string) => {
    const expr = `${min} ${hour} ${dom} ${mon} ${dow}`;
    setCronInput(expr);
  };

  return (
    <>
      <ToolUsageTracker toolId="cron-parser" />
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
            {t("cronParser.back") || "Back to Tools"}
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
              <Clock size={22} />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>
              {t("cronParser.title") || "Cron Expression Parser & Schedule Generator"}
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            {t("cronParser.subtitle") || "Translate cron expressions into human language and calculate future execution times in real-time."}
          </p>
        </section>

        {/* Workspace */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Presets Bar */}
          <div className="glass-card" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginRight: "4px" }}>Presets:</span>
            {CRON_PRESETS.map((p) => (
              <button
                key={p.expr}
                onClick={() => applyPreset(p.expr)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: cronInput === p.expr ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.04)",
                  border: cronInput === p.expr ? "1px solid rgba(99,102,241,0.6)" : "1px solid var(--border-subtle)",
                  color: cronInput === p.expr ? "#a5b4fc" : "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {p.label} ({p.expr})
              </button>
            ))}
          </div>

          {/* Big Cron Input & Live Human Description */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                {t("cronParser.inputLabel") || "Cron Expression (5 Fields: min hour day month weekday)"}
              </label>
              <button
                onClick={copyToClipboard}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: copied ? "rgba(34,211,168,0.2)" : "rgba(99,102,241,0.15)",
                  border: "1px solid var(--border-subtle)",
                  color: copied ? "#34d399" : "#818cf8",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? (t("cronParser.copied") || "Copied!") : (t("cronParser.copy") || "Copy Expression")}
              </button>
            </div>

            <input
              type="text"
              value={cronInput}
              onChange={(e) => setCronInput(e.target.value)}
              placeholder="* * * * *"
              style={{
                height: "54px",
                borderRadius: "10px",
                background: "var(--input-bg)",
                border: parsedInfo.isValid ? "1px solid var(--border-subtle)" : "1px solid #ef4444",
                color: "var(--text-primary)",
                padding: "0 18px",
                fontSize: "20px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontWeight: 700,
                letterSpacing: "2px",
              }}
            />

            {/* Human Readable Translation Banner */}
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "10px",
                background: parsedInfo.isValid ? "rgba(99,102,241,0.08)" : "rgba(239,68,68,0.08)",
                border: parsedInfo.isValid ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(239,68,68,0.3)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Sparkles size={20} color={parsedInfo.isValid ? "#818cf8" : "#f87171"} />
              <div style={{ fontSize: "15px", fontWeight: 700, color: parsedInfo.isValid ? "var(--text-primary)" : "#f87171" }}>
                {parsedInfo.text}
              </div>
            </div>
          </div>

          <div className="cron-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
            {/* Left: Next Scheduled Runs */}
            <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={18} style={{ color: "#818cf8" }} />
                {t("cronParser.nextRunsTitle") || "Next 5 Scheduled Executions"}
              </h3>

              {nextRuns.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "13px", padding: "20px 0" }}>
                  {t("cronParser.noFutureRuns") || "No upcoming runs matched within search horizon."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {nextRuns.map((date, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "rgba(0,0,0,0.2)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "13.5px",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      }}
                    >
                      <span style={{ color: "#818cf8", fontWeight: 700 }}>#{idx + 1}</span>
                      <span style={{ color: "var(--text-primary)" }}>{date.toLocaleString()}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {date.toISOString().replace("T", " ").substring(0, 19)} UTC
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
                {t("cronParser.builderTitle") || "Interactive Visual Builder"}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: t("cronParser.minLabel") || "Minute (0-59)", val: bMin, set: setBMin, options: ["*", "0", "*/5", "*/10", "*/15", "*/30"] },
                  { label: t("cronParser.hourLabel") || "Hour (0-23)", val: bHour, set: setBHour, options: ["*", "0", "9", "12", "18", "*/2", "*/6"] },
                  { label: t("cronParser.domLabel") || "Day of Month (1-31)", val: bDom, set: setBDom, options: ["*", "1", "15", "30"] },
                  { label: t("cronParser.monLabel") || "Month (1-12)", val: bMon, set: setBMon, options: ["*", "1", "6", "12"] },
                  { label: t("cronParser.dowLabel") || "Day of Week (0-6)", val: bDow, set: setBDow, options: ["*", "0 (Sun)", "1 (Mon)", "5 (Fri)"] },
                ].map(({ label, val, set, options }, idx) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
                    <select
                      value={val}
                      onChange={(e) => {
                        const newVals = [bMin, bHour, bDom, bMon, bDow];
                        newVals[idx] = e.target.value.split(" ")[0];
                        set(newVals[idx]);
                        applyBuilder(newVals[0], newVals[1], newVals[2], newVals[3], newVals[4]);
                      }}
                      style={{
                        height: "34px",
                        borderRadius: "6px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid var(--border-subtle)",
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

        {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "Cron 표현식 파서 및 스케줄 생성기 소개",
              aboutDesc:
                "리눅스 Crontab 및 서버 백엔드 스케줄러(Node.js node-cron, Spring @Scheduled, AWS EventBridge 등)에서 사용되는 5개 필드 Cron 표현식을 사람이 읽기 쉬운 자연어로 번역하고, 향후 실행될 다음 5회차 스케줄 일시를 실시간으로 계산하는 브라우저 기반 도구입니다. 드롭다운 방식의 시각적 빌더(Visual Builder)를 통해 분, 시, 일, 월, 요일을 클릭만으로 손쉽게 구성할 수 있습니다.",
              howTitle: "Cron 파서 및 생성기 사용 방법",
              steps: [
                "상단 입력창에 직접 Cron 표현식(예: */15 9-18 * * 1-5)을 입력하거나 프리셋 버튼을 클릭합니다.",
                "실시간 번역기가 입력된 표현식을 분석하여 알기 쉬운 자연어 스케줄 문장으로 변환합니다.",
                "좌측 하단 '다음 실행 예정 시각' 패널에서 향후 5회차의 정확한 현지 시간(KST) 및 UTC 실행 시각을 확인합니다.",
                "우측 '비주얼 빌더'를 이용해 분, 시, 일, 월, 요일 드롭다운 값을 조정하여 새 표현식을 생성합니다.",
                "'Copy Expression' 버튼을 눌러 생성된 표현식을 Crontab 파일이나 클라우드 스케줄러 설정에 붙여넣습니다."
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "자연어 실시간 번역", desc: "복잡한 기호(*, /, -, ,)로 구성된 Cron 표현식을 명확한 한글 문장으로 즉시 번역합니다." },
                { title: "다음 실행 일정(Next Runs) 계산", desc: "현재 시간을 기준으로 앞으로 실행될 5번의 스케줄 일시를 현지 시각 및 UTC로 계산합니다." },
                { title: "인터랙티브 비주얼 빌더", desc: "각 필드를 드롭다운 메뉴로 선택하여 문법 오류 없이 손쉽게 Cron 표현식을 조립합니다." },
                { title: "100% 클라이언트 로컬 실행", desc: "모든 일정 계산이 브라우저 내부에서 즉시 처리되어 빠르고 안전합니다." }
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "서버 백업 및 데이터베이스 덤프 자동화", desc: "매일 새벽 2시 또는 매월 1일에 실행되는 DB 백업 주기 설정 (0 2 * * * 등)" },
                { title: "주기적인 이메일 뉴스레터 및 배치 작업", desc: "매주 월요일 오전 9시에 발송되는 정기 리포트 배치 작업 스케줄링 (0 9 * * 1)" },
                { title: "AWS Lambda / CloudWatch 이벤트 트리거", desc: "서버리스 함수의 주기적 트리거를 위한 Cron 표현식 검증" },
                { title: "캐시 갱신 및 만료 데이터 정리 배치", desc: "5분 또는 30분 주기로 오래된 세션 데이터를 정리하는 백그라운드 태스크 구성" }
              ],
              proTipsTitle: "Cron 표현식 전문가 실무 팁",
              proTips: [
                "표준 Cron은 5개 필드(분 시 일 월 요일) 구조이며, 요일 필드에서 0과 7은 모두 일요일(Sunday)을 의미합니다.",
                "간격 실행을 설정할 때는 '*/N' 문법을 사용합니다 (예: '*/5 * * * *' = 5분마다 실행).",
                "범위 실행은 '-' 기호를 사용합니다 (예: '0 9-18 * * 1-5' = 평일 9시부터 18시까지 매시 정각).",
                "일(Day of Month)과 요일(Day of Week)을 동시에 지정할 경우 OR 조건으로 결합될 수 있으므로 주의하세요."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "Cron 표현식의 5개 필드 순서는 어떻게 되나요?", a: "왼쪽부터 순서대로 [분(0-59)] [시(0-23)] [일(1-31)] [월(1-12)] [요일(0-6)] 입니다." },
                { q: "초(Seconds) 단위가 포함된 6개 필드도 지원하나요?", a: "기본적으로 리눅스 표준 Crontab인 5개 필드를 기준으로 작동하며, 6개 필드(초 단위)는 상위 5자리를 기준으로 계산됩니다." },
                { q: "다음 실행 시간은 어떤 기준 시각으로 계산되나요?", a: "현재 사용자의 브라우저 로컬 타임존 및 UTC 기준 시각을 동시에 계산하여 표시합니다." },
                { q: "입력한 스케줄 정보가 외부 서버에 전송되나요?", a: "아닙니다. 모든 계산은 100% 브라우저 내부 자바스크립트 엔진에서 로컬로 실행됩니다." },
                { q: "스프링(Spring)이나 Node.js 스케줄러에서도 동일하게 사용 가능한가요?", a: "네! Node-cron, Spring @Scheduled, Celery, Kubernetes CronJob 등 표준 규격을 따르는 모든 시스템과 호환됩니다." },
                { q: "이용료가 발생하나요?", a: "완전 무료이며 횟수 제한 없이 자유롭게 사용하실 수 있습니다." }
              ],
              relatedTools: [
                { title: "정규표현식 (Regex) 테스터", desc: "실시간 패턴 매칭 및 하이라이트 검사", href: "/tools/regex-tester/" },
                { title: "JSON 정렬 / 유효성 검사기", desc: "JSON 포맷팅 및 문법 오류 실시간 진단", href: "/tools/json-formatter/" },
                { title: "Base64 인코더 / 디코더", desc: "텍스트 및 파일 데이터를 Base64로 즉시 변환", href: "/tools/base64/" },
                { title: "JWT 디코더 & 토큰 분석기", desc: "JWT Header, Payload 실시간 복호화 및 만료 시간 확인", href: "/tools/jwt-decoder/" }
              ]
            },
            en: {
              aboutTitle: "About Cron Expression Parser & Generator",
              aboutDesc:
                "Translate 5-field cron expressions used across Linux crontab, Node.js node-cron, Spring framework, and AWS EventBridge into human-readable plain language in real-time. Calculate upcoming scheduled run times and construct valid expressions effortlessly using an interactive visual builder. 100% browser-native execution.",
              howTitle: "How to Parse and Build Cron Schedules",
              steps: [
                "Type a cron expression (e.g. */15 9-18 * * 1-5) into the main input or select a preset.",
                "The real-time parser immediately translates the expression into clear English.",
                "Examine the 'Next 5 Scheduled Executions' panel on the left to verify future dates in local time and UTC.",
                "Use the interactive 'Visual Builder' on the right to tweak minute, hour, day, month, and weekday fields.",
                "Click 'Copy Expression' to paste the verified schedule into your crontab or backend configurations."
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "Real-Time Natural Language Translation", desc: "Converts symbols (*, /, -, ,) into plain, understandable schedule explanations." },
                { title: "Next Run Times Calculator", desc: "Calculates the exact next 5 execution timestamps based on your local timezone and UTC." },
                { title: "Interactive Visual Builder", desc: "Construct error-free cron strings using intuitive dropdown field selectors." },
                { title: "100% Client-Side Privacy", desc: "All calculations execute inside your local browser sandbox with zero network uploads." }
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "Automated Database Backups", desc: "Configure scheduled midnight database dumps and log rotations (e.g. 0 2 * * *)." },
                { title: "Email Newsletters & Batch Jobs", desc: "Schedule weekly business reports to execute Monday morning (e.g. 0 9 * * 1)." },
                { title: "AWS CloudWatch & Lambda Triggers", desc: "Validate recurring schedules before deploying serverless event rules." },
                { title: "Cache Eviction & Cleanup Routines", desc: "Run background maintenance tasks every 5 or 30 minutes to clean expired cache entries." }
              ],
              proTipsTitle: "Professional Tips for Cron Expressions",
              proTips: [
                "Standard crontab consists of 5 fields: [minute] [hour] [day_of_month] [month] [day_of_week].",
                "In the weekday field, both 0 and 7 represent Sunday.",
                "Use the step operator '*/N' to repeat actions every N units (e.g. '*/5 * * * *' = every 5 minutes).",
                "Use hyphens '-' for ranges (e.g. '9-18' = every hour between 9 AM and 6 PM)."
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "What is the order of fields in standard crontab?", a: "From left to right: [Minute (0-59)] [Hour (0-23)] [Day of Month (1-31)] [Month (1-12)] [Day of Week (0-6)]." },
                { q: "Are 6-field cron expressions with seconds supported?", a: "The tool is standardized on 5-field Linux crontab syntax. 6-field expressions evaluate their top 5 fields." },
                { q: "How are future execution dates calculated?", a: "Future run dates are calculated relative to your system's current local clock and displayed in local time and UTC." },
                { q: "Is any data sent to an external server?", a: "No. All schedule simulations and translations are processed 100% locally in your browser." },
                { q: "Is it compatible with Spring and Node.js?", a: "Yes, it is fully compatible with Linux crontab, node-cron, Spring @Scheduled, Celery, and Kubernetes CronJobs." },
                { q: "Is this tool completely free?", a: "Yes, 100% free with unlimited usage." }
              ],
              relatedTools: [
                { title: "Regex Tester & Debugger", desc: "Test regular expressions with real-time match highlighting", href: "/tools/regex-tester/" },
                { title: "JSON Formatter & Validator", desc: "Format, minify, and validate JSON data in real-time", href: "/tools/json-formatter/" },
                { title: "Base64 Encoder & Decoder", desc: "Convert text and binary payloads to and from Base64", href: "/tools/base64/" },
                { title: "JWT Token Decoder", desc: "Decode and inspect JSON Web Token header and payload claims", href: "/tools/jwt-decoder/" }
              ]
            },
            ja: {
              aboutTitle: "Cron 式パーサー＆スケジュール生成器について",
              aboutDesc:
                "Linux の Crontab、Node.js の node-cron、Spring Framework、AWS EventBridge などで広く使用される 5 フィールドの Cron 式を分かりやすい自然言語に自動翻訳し、次回以降の実行スケジュール（5 回分）をリアルタイムでシミュレーション計算するオンラインツールです。ビジュアルビルダーを使って直感的に Cron 式を組み立てることも可能です。",
              howTitle: "Cron 式の解析と作成方法",
              steps: [
                "入力欄に Cron 式（例: */15 9-18 * * 1-5）を入力するか、プリセットボタンをクリックします。",
                "パーサーが自動的に実行周期を解析し、日本語の説明文をリアルタイムで表示します。",
                "左下の「次回実行予定」パネルで直近 5 回分の正確なローカル日時と UTC 時刻を確認します。",
                "右側の「ビジュアルビルダー」を使って分・時・日・月・曜日のドロップダウンを選択して式を作成します。",
                "「Copy Expression」ボタンをクリックして Crontab やクラウド設定にコピーします。"
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "自然言語へのリアルタイム翻訳", desc: "特殊記号（*、/、-、,）を人間が直感的に理解できる文章へ即座に翻訳します。" },
                { title: "次回以降 5 回分の実行予定計算", desc: "現在時刻を起点として、次に実行される正確な日時をローカルタイムおよび UTC で算出します。" },
                { title: "視覚的なビジュアルビルダー", desc: "各フィールドをプルダウンから選択するだけで文法ミスなく Cron 式を組み立てられます。" },
                { title: "100% ブラウザ内ローカル処理", desc: "すべての計算処理がお使いのブラウザ内部で安全かつ高速に実行されます。" }
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "定期データベースバックアップ", desc: "毎日深夜 2 時に実行するバックアップスクリプトのスケジュール設定 (0 2 * * *)" },
                { title: "週次メルマガ・バッチ処理", desc: "毎週月曜日の朝 9 時に定期実行する配信バッチの Crontab 設定 (0 9 * * 1)" },
                { title: "AWS CloudWatch イベントルールの検証", desc: "サーバーレス Lambda 関数を定期起動する Cron 式の妥当性確認" },
                { title: "キャッシュクリア・メンテナンスタスク", desc: "5 分ごとまたは 30 分ごとに実行するキャッシュ破棄バッチの構築" }
              ],
              proTipsTitle: "Cron 式のプロのテクニック",
              proTips: [
                "標準 Crontab は「分 時 日 月 曜日」の 5 フィールド構成です。",
                "曜日の指定において 0 と 7 はどちらも「日曜日 (Sunday)」を意味します。",
                "間隔指定には '*/N' を使用します（例: '*/5 * * * *' = 5分ごと）。",
                "範囲指定にはハイフン '-' を使用します（例: '9-18' = 9時から18時まで）。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "Cron 式の 5 つのフィールドの並び順はどうなっていますか？", a: "左から順に [分 (0-59)] [時 (0-23)] [日 (1-31)] [月 (1-12)] [曜日 (0-6)] です。" },
                { q: "秒単位を含む 6 フィールドにも対応していますか？", a: "Linux 標準の 5 フィールドを基準としており、一般的な Crontab 形式に最適化されています。" },
                { q: "次回実行日時はどのタイムゾーンで計算されますか？", a: "お使いのデバイスのローカルタイムゾーンおよび UTC の両方で算出・表示されます。" },
                { q: "データがサーバーに送信されることはありますか？", a: "ありません。すべての計算処理はお使いのブラウザ内部で完結します。" },
                { q: "Spring や Node.js のライブラリと互換性はありますか？", a: "はい、node-cron や Spring @Scheduled、Kubernetes CronJob など標準仕様に準拠しています。" },
                { q: "無料で利用できますか？", a: "はい、完全無料・回数無制限でご利用いただけます。" }
              ],
              relatedTools: [
                { title: "正規表現 (Regex) テスター", desc: "リアルタイムマッチングとハイライトで Regex をデバッグ", href: "/tools/regex-tester/" },
                { title: "JSON 整形・バリデーター", desc: "JSON の整形、圧縮、構文エラー検証", href: "/tools/json-formatter/" },
                { title: "Base64 エンコーダー / デコーダー", desc: "文字列とバイナリデータを Base64 形式で相互変換", href: "/tools/base64/" },
                { title: "JWT デコーダー & トークン解析", desc: "JWT のヘッダーとペイロードをリアルタイム解析", href: "/tools/jwt-decoder/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Analizador y Generador de Expresiones Cron",
              aboutDesc:
                "Traduce expresiones cron de 5 campos utilizadas en Linux Crontab, Node.js, Spring Framework y AWS EventBridge a lenguaje natural legible en tiempo real. Calcula las próximas 5 fechas de ejecución programadas y construye expresiones fácilmente mediante un constructor visual interactivo. Procesamiento 100% local en tu navegador.",
              howTitle: "Cómo Analizar y Construir Expresiones Cron",
              steps: [
                "Escribe una expresión cron (ej. */15 9-18 * * 1-5) o selecciona un preajuste.",
                "El analizador traduce instantáneamente la expresión a una explicación clara en español.",
                "Consulta el panel izquierdo para verificar las próximas 5 fechas de ejecución en hora local y UTC.",
                "Utiliza el 'Constructor Visual' derecho para ajustar minutos, horas, días y meses con menús desplegables.",
                "Haz clic en 'Copy Expression' para copiar la programación a tu crontab o entorno cloud."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Traducción en Tiempo Real a Lenguaje Natural", desc: "Convierte símbolos (*, /, -, ,) en explicaciones sencillas y comprensibles." },
                { title: "Cálculo de Próximas Ejecuciones", desc: "Determina los próximos 5 lanzamientos exactos según tu zona horaria y UTC." },
                { title: "Constructor Visual Interactivo", desc: "Configura expresiones válidas sin errores de sintaxis mediante selectores." },
                { title: "Privacidad 100% en el Navegador", desc: "Toda la simulación se ejecuta de forma local en tu dispositivo." }
              ],
              useCasesTitle: "Casos de Uso Comunes",
              useCases: [
                { title: "Copias de Seguridad Automatizadas", desc: "Programa volcados de bases de datos diarios a medianoche (ej. 0 2 * * *)." },
                { title: "Informes Semanales y Tareas Batch", desc: "Programa envíos de newsletters los lunes por la mañana (ej. 0 9 * * 1)." },
                { title: "Reglas de Eventos en AWS CloudWatch / Lambda", desc: "Valida expresiones cron antes de desplegar arquitecturas serverless." },
                { title: "Limpieza de Caché y Sesiones", desc: "Ejecuta tareas de mantenimiento cada 5 o 30 minutos." }
              ],
              proTipsTitle: "Consejos Profesionales sobre Cron",
              proTips: [
                "El formato estándar consta de 5 campos: [minuto] [hora] [día_del_mes] [mes] [día_de_la_semana].",
                "En el campo de día de la semana, tanto 0 como 7 corresponden al domingo.",
                "Usa el operador de paso '*/N' para intervalos regulares (ej. '*/5 * * * *' = cada 5 minutos).",
                "Usa guiones '-' para rangos horarios (ej. '9-18' = cada hora de 9 a 18 horas)."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Cuál es el orden de los campos en Crontab?", a: "De izquierda a derecha: [Minuto (0-59)] [Hora (0-23)] [Día del Mes (1-31)] [Mes (1-12)] [Día de la Semana (0-6)]." },
                { q: "¿Se admiten expresiones con segundos (6 campos)?", a: "La herramienta se basa en el estándar Linux de 5 campos, evaluando la parte horaria principal." },
                { q: "¿Cómo se calculan las próximas ejecuciones?", a: "Se calculan tomando como referencia el reloj del sistema de tu navegador en hora local y UTC." },
                { q: "¿Se envía algún dato a un servidor externo?", a: "No. Todo el análisis se ejecuta localmente en tu navegador." },
                { q: "¿Es compatible con Spring, Node.js y Kubernetes?", a: "Sí, es totalmente compatible con node-cron, Spring @Scheduled, Celery y Kubernetes CronJobs." },
                { q: "¿Es completamente gratuito?", a: "Sí, 100% gratuito y sin límites." }
              ],
              relatedTools: [
                { title: "Probador de Expresiones Regulares", desc: "Prueba y depura expresiones Regex con resaltado en vivo", href: "/tools/regex-tester/" },
                { title: "Formateador y Validador JSON", desc: "Embellece, valida y minifica datos JSON", href: "/tools/json-formatter/" },
                { title: "Codificador / Decodificador Base64", desc: "Convierte texto y archivos a formato Base64", href: "/tools/base64/" },
                { title: "Decodificador de Tokens JWT", desc: "Inspecciona el contenido de tokens web JSON en vivo", href: "/tools/jwt-decoder/" }
              ]
            },
            zh: {
              aboutTitle: "关于 Cron 表达式解析与生成器",
              aboutDesc:
                "支持将 Linux Crontab、Node.js node-cron、Spring @Scheduled 及 AWS EventBridge 中广泛使用的 5 字段 Cron 表达式实时解析为人类易懂的自然语言，并精确计算未来 5 次计划执行的具体时间。内置可视化构建器（Visual Builder），让您通过下拉菜单轻松组合复杂的定时任务调度策略。100% 浏览器本地运行。",
              howTitle: "如何解析与构建 Cron 定时表达式",
              steps: [
                "在顶部输入框中输入 Cron 表达式（例如 */15 9-18 * * 1-5）或直接选择快捷预设。",
                "实时翻译引擎会即刻将符号解析为通俗易懂的中文执行计划说明。",
                "查看左侧“未来 5 次计划执行时间”面板，核对本地时间与 UTC 时间点。",
                "使用右侧“可视化生成器”通过下拉菜单微调分、时、日、月、星期各个字段。",
                "点击“Copy Expression”一键将生成的表达式复制到项目或系统配置文件中。"
              ],
              featuresTitle: "核心功能与特点",
              features: [
                { title: "自然语言实时精准翻译", desc: "将复杂的通配符（*、/、-、,）一秒转译为清晰的中文调度周期说明。" },
                { title: "未来 5 次执行时刻动态推算", desc: "以当前时间为基准，精确推算接下来 5 次触发的具体日期与时间。" },
                { title: "交互式可视化构建器", desc: "零门槛通过下拉选择框配置时间规则，彻底避免由于手写语法失误导致的定时错误。" },
                { title: "100% 客户端本地安全运算", desc: "所有调度计算均在浏览器内完成，毫秒级响应且无需上传服务器。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "服务器数据自动备份任务", desc: "配置每日凌晨 2 点或每月 1 号自动执行的数据库 Dump 备份脚本 (0 2 * * *)" },
                { title: "定期邮件与周报批处理调度", desc: "设定每周一上午 9 点定时发送周报或结算账单的后台任务 (0 9 * * 1)" },
                { title: "AWS CloudWatch / 云函数触发器", desc: "在部署定时 Serverless 函数前校验 Cron 表达式的正确性" },
                { title: "缓存清理与过期数据归档", desc: "每隔 5 分钟或 30 分钟轮询清理过期 Session 记录与临时缓存" }
              ],
              proTipsTitle: "Cron 表达式专业实战技巧",
              proTips: [
                "标准 Linux Crontab 由 5 个字段组成：[分] [时] [日] [月] [星期]。",
                "在星期（Day of Week）字段中，数字 0 和 7 均代表星期日（Sunday）。",
                "使用步长符号 '*/N' 表示每隔 N 个单位执行一次（例如 '*/5 * * * *' 代表每 5 分钟执行一次）。",
                "使用区间符号 '-' 表示连续时间段（例如 '9-18' 代表每天 9 点到 18 点之间）。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "Cron 表达式的 5 个字段顺序是怎样的？", a: "从左到右依次为：[分钟 (0-59)] [小时 (0-23)] [日期 (1-31)] [月份 (1-12)] [星期 (0-6)]。" },
                { q: "支持带秒数的 6 字段格式吗？", a: "本工具严格基于最通用的 Linux 标准 5 字段 Crontab 规范构建，6 字段输入时将以核心 5 字段进行解析。" },
                { q: "未来执行时间是按照什么时区推算的？", a: "基于您当前电脑操作系统的本地时区以及标准 UTC 时间同时推算显示。" },
                { q: "输入的调度信息会被发送到云端吗？", a: "不会。所有计算 100% 在您本机的浏览器内存中运行。" },
                { q: "兼容 Spring 和 Node.js 吗？", a: "完全兼容！适用于 Linux crontab、node-cron、Spring @Scheduled、Celery 及 Kubernetes CronJob。" },
                { q: "完全免费吗？", a: "永久 100% 免费，无任何限制。" }
              ],
              relatedTools: [
                { title: "正则表达式 (Regex) 测试器", desc: "实时高亮匹配与正则语法快速调试", href: "/tools/regex-tester/" },
                { title: "JSON 格式化与校验工具", desc: "JSON 数据美化、压缩与语法错误实时排查", href: "/tools/json-formatter/" },
                { title: "Base64 编码 / 解码工具", desc: "文本与二进制数据的 Base64 双向即时转换", href: "/tools/base64/" },
                { title: "JWT Token 实时解码器", desc: "解析 JSON Web Token 的 Header 与 Payload 声明", href: "/tools/jwt-decoder/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Parseur et Générateur d'Expressions Cron",
              aboutDesc:
                "Traduisez en temps réel les expressions cron à 5 champs utilisées dans Linux Crontab, Node.js, Spring Framework et AWS EventBridge en phrases compréhensibles. Calculez précisément les 5 prochaines exécutions planifiées et concevez de nouvelles expressions grâce à un constructeur visuel interactif. Traitement 100% local dans votre navigateur.",
              howTitle: "Comment Analyser et Construire vos Expressions Cron",
              steps: [
                "Saisissez une expression cron (ex. */15 9-18 * * 1-5) ou sélectionnez un modèle prédéfini.",
                "Le parseur traduit instantanément l'expression en une phrase explicative en français.",
                "Consultez le panneau de gauche pour vérifier les 5 prochaines dates d'exécution en heure locale et UTC.",
                "Utilisez le 'Constructeur Visuel' à droite pour ajuster les minutes, heures et jours via des menus déroulants.",
                "Cliquez sur 'Copy Expression' pour coller la planification dans votre crontab ou serveur cloud."
              ],
              featuresTitle: "Fonctionnalités Clés",
              features: [
                { title: "Traduction Immédiate en Langage Naturel", desc: "Explicite clairement les symboles (*, /, -, ,) sans risque de mauvaise interprétation." },
                { title: "Calcul des Prochaines Dates d'Exécution", desc: "Simule les 5 prochains déclenchements selon votre fuseau horaire et l'heure UTC." },
                { title: "Constructeur Visuel Intuitif", desc: "Générez des expressions fiables et sans erreur de syntaxe à l'aide de sélecteurs déroulants." },
                { title: "Confidentialité 100% Côté Client", desc: "Toute la simulation s'exécute dans votre navigateur sans le moindre transfert distant." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Sauvegardes de Bases de Données", desc: "Planifiez des exports automatiques chaque nuit à minuit (ex. 0 2 * * *)." },
                { title: "Traitements Batch et Envois de Newsletters", desc: "Programmez des rapports hebdomadaires le lundi matin (ex. 0 9 * * 1)." },
                { title: "Déclencheurs AWS CloudWatch / Lambda", desc: "Validez la périodicité de vos fonctions serverless avant déploiement." },
                { title: "Purge de Cache et Tâches de Maintenance", desc: "Exécutez des routines de nettoyage toutes les 5 ou 30 minutes." }
              ],
              proTipsTitle: "Conseils d'Experts sur les Expressions Cron",
              proTips: [
                "La norme Crontab standard comporte 5 champs : [minute] [heure] [jour_du_mois] [mois] [jour_de_la_semaine].",
                "Pour le jour de la semaine, 0 et 7 désignent tous deux le dimanche.",
                "Utilisez l'opérateur '*/N' pour définir des intervalles réguliers (ex. '*/5 * * * *' = toutes les 5 minutes).",
                "Utilisez le tiret '-' pour définir des plages horaires (ex. '9-18' = toutes les heures de 9h à 18h)."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Quel est l'ordre des 5 champs dans Crontab ?", a: "De gauche à droite : [Minute (0-59)] [Heure (0-23)] [Jour du mois (1-31)] [Mois (1-12)] [Jour de la semaine (0-6)]." },
                { q: "Les expressions à 6 champs avec secondes sont-elles gérées ?", a: "L'outil est calé sur la norme Linux standard à 5 champs pour garantir une compatibilité maximale." },
                { q: "Comment les prochaines dates sont-elles calculées ?", a: "Elles sont simulées d'après l'horloge locale de votre navigateur et affichées en heure locale et UTC." },
                { q: "Mes données sont-elles envoyées sur un serveur ?", a: "Non. Tout le calcul est effectué localement dans votre navigateur." },
                { q: "Est-ce compatible avec Node.js, Spring et Kubernetes ?", a: "Oui, parfaitement compatible avec node-cron, Spring @Scheduled, Celery et Kubernetes CronJobs." },
                { q: "L'outil est-il gratuit ?", a: "Oui, 100% gratuit et sans limite d'utilisation." }
              ],
              relatedTools: [
                { title: "Testeur d'Expressions Régulières (Regex)", desc: "Testez et déboguez vos regex avec coloration syntaxique", href: "/tools/regex-tester/" },
                { title: "Formateur & Validateur JSON", desc: "Mise en page, compression et validation de JSON", href: "/tools/json-formatter/" },
                { title: "Encodeur / Décodeur Base64", desc: "Convertissez textes et fichiers au format Base64", href: "/tools/base64/" },
                { title: "Décodeur de Tokens JWT", desc: "Décodez les en-têtes et charges utiles de JSON Web Tokens", href: "/tools/jwt-decoder/" }
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
          .cron-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
