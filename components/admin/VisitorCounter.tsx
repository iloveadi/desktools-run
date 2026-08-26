"use client";

import { useState, useEffect } from "react";
import {
  getVisitorStats,
  recordVisit,
  resetVisitorStats,
  VisitorStats,
  VisitLog,
} from "@/lib/visitorTracker";
import {
  Users,
  Eye,
  Calendar,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  RefreshCw,
  PlusCircle,
  RotateCcw,
  Activity,
  CheckCircle2,
  Globe,
  ShieldCheck,
} from "lucide-react";

export default function VisitorCounter() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [liveCount, setLiveCount] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load and record visit on mount
  useEffect(() => {
    const updated = recordVisit("/admin/requests");
    setStats(updated);
    setLiveCount(1);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleManualIncrement = () => {
    const updated = recordVisit("/admin/requests");
    setStats({ ...updated });
    showToast("방문자 카운트가 +1 증가하였습니다! (실제 방문 기록)");
  };

  const handleRefresh = () => {
    const current = getVisitorStats();
    setStats({ ...current });
    showToast("방문자 통계를 최신 상태로 새로고침했습니다.");
  };

  const handleReset = () => {
    if (confirm("정말로 방문자 카운트 및 접속 통계를 초기화하시겠습니까?")) {
      const resetStats = resetVisitorStats();
      setStats({ ...resetStats });
      showToast("방문자 통계가 0으로 초기화되었습니다.");
    }
  };

  if (!stats) return null;

  const totalDevice =
    (stats.deviceBreakdown.desktop || 0) +
    (stats.deviceBreakdown.mobile || 0) +
    (stats.deviceBreakdown.tablet || 0);

  const desktopPct = totalDevice > 0 ? Math.round((stats.deviceBreakdown.desktop / totalDevice) * 100) : 0;
  const mobilePct = totalDevice > 0 ? Math.round((stats.deviceBreakdown.mobile / totalDevice) * 100) : 0;
  const tabletPct = totalDevice > 0 ? 100 - desktopPct - mobilePct : 0;

  const getRelativeTime = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 10) return "방금 전";
    if (diffSec < 60) return `${diffSec}초 전`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}시간 전`;
  };

  return (
    <section style={{ marginTop: "48px", width: "100%" }}>
      {/* Dark Slate Container with High Contrast Elements */}
      <div
        style={{
          padding: "32px 28px",
          borderRadius: "16px",
          background: "#111625",
          border: "1px solid rgba(129, 140, 248, 0.35)",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
          position: "relative",
          overflow: "hidden",
          color: "#ffffff",
        }}
      >
        {/* Backdrop accent light */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(0,0,0,0) 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(34, 197, 94, 0.25)",
              border: "1px solid #4ade80",
              color: "#ffffff",
              padding: "10px 18px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              zIndex: 10,
              boxShadow: "0 4px 14px rgba(34,197,94,0.3)",
            }}
          >
            <CheckCircle2 size={16} style={{ color: "#4ade80" }} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Title & Status Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
            paddingBottom: "20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(79,70,229,0.25))",
                border: "1px solid #818cf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c7d2fe",
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.3px" }}>
                  실시간 방문자 카운터 (Real-time Visitors)
                </h2>
                {/* Live Indicator Badge */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "100px",
                    background: "rgba(34, 197, 94, 0.2)",
                    border: "1px solid #4ade80",
                    color: "#4ade80",
                    fontSize: "11.5px",
                    fontWeight: 800,
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      boxShadow: "0 0 10px #22c55e",
                    }}
                  />
                  LIVE TRACKING
                </span>
              </div>
              <p style={{ fontSize: "13.5px", color: "#cbd5e1", marginTop: "4px" }}>
                실제 사용자가 페이지 방문 시 자동 감지 및 중복 카운트 방지 처리된 실시간 방문 집계 데이터입니다.
              </p>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleManualIncrement}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#ffffff",
                border: "1px solid #818cf8",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
              }}
              title="카운트 +1 테스트"
            >
              <PlusCircle size={16} />
              <span>방문 테스트 (+1)</span>
            </button>

            <button
              onClick={handleRefresh}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={15} />
              <span>새로고침</span>
            </button>

            <button
              onClick={handleReset}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "9px 12px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#fca5a5",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
              }}
              title="통계 초기화"
            >
              <RotateCcw size={14} />
              <span>리셋</span>
            </button>
          </div>
        </div>

        {/* Counter Digital Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {/* Main Total Visitors Card */}
          <div
            style={{
              gridColumn: "span 2",
              padding: "22px 24px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(79,70,229,0.15) 100%)",
              border: "1px solid #818cf8",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13.5px", fontWeight: 800, color: "#e0e7ff", letterSpacing: "0.2px" }}>
                총 누적 방문자 수 (Total Visitors)
              </span>
              <Globe size={20} style={{ color: "#a5b4fc" }} />
            </div>

            <div style={{ marginTop: "12px", marginBottom: "6px" }}>
              <div
                style={{
                  fontSize: "38px",
                  fontWeight: 900,
                  color: "#ffffff",
                  fontFamily: "monospace, monospace",
                  letterSpacing: "2px",
                  textShadow: "0 0 20px rgba(165, 180, 252, 0.8)",
                }}
              >
                {stats.totalVisitors.toLocaleString()} <span style={{ fontSize: "17px", color: "#c7d2fe", fontWeight: 800 }}>명</span>
              </div>
            </div>

            <div style={{ fontSize: "12.5px", color: "#a7f3d0", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={16} style={{ color: "#34d399" }} />
              <span>실제 고유 사용자(Unique Visitors) 검증 카운트</span>
            </div>
          </div>

          {/* Today Visitors Card */}
          <div
            style={{
              padding: "20px",
              borderRadius: "14px",
              background: "rgba(14, 165, 233, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#7dd3fc" }}>오늘 방문자</span>
              <Calendar size={16} style={{ color: "#38bdf8" }} />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 900, color: "#38bdf8" }}>
              {stats.todayVisits.toLocaleString()} <span style={{ fontSize: "14px", color: "#bae6fd", fontWeight: 700 }}>명</span>
            </div>
            <span style={{ fontSize: "12px", color: "#bae6fd", fontWeight: 600 }}>{stats.lastDateStr} (오늘)</span>
          </div>

          {/* Yesterday Visitors Card */}
          <div
            style={{
              padding: "20px",
              borderRadius: "14px",
              background: "rgba(234, 179, 8, 0.12)",
              border: "1px solid rgba(250, 204, 21, 0.4)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#fde047" }}>어제 방문자</span>
              <Clock size={16} style={{ color: "#facc15" }} />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 900, color: "#facc15" }}>
              {stats.yesterdayVisits.toLocaleString()} <span style={{ fontSize: "14px", color: "#fef08a", fontWeight: 700 }}>명</span>
            </div>
            <span style={{ fontSize: "12px", color: "#fef08a", fontWeight: 600 }}>전일 대비 데이터</span>
          </div>

          {/* Live Active Visitors Card */}
          <div
            style={{
              padding: "20px",
              borderRadius: "14px",
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid #4ade80",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "0 4px 16px rgba(34,197,94,0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#86efac" }}>실시간 접속자</span>
              <Activity size={16} style={{ color: "#4ade80" }} />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 900, color: "#4ade80", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>{liveCount}</span>
              <span style={{ fontSize: "14px", color: "#bbf7d0", fontWeight: 700 }}>명</span>
            </div>
            <span style={{ fontSize: "12px", color: "#bbf7d0", fontWeight: 700 }}>현재 사이트 이용 중</span>
          </div>

          {/* Total Pageviews Card */}
          <div
            style={{
              padding: "20px",
              borderRadius: "14px",
              background: "rgba(168, 85, 247, 0.12)",
              border: "1px solid rgba(192, 132, 252, 0.4)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#e9d5ff" }}>총 페이지 뷰</span>
              <Eye size={16} style={{ color: "#c084fc" }} />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 900, color: "#c084fc" }}>
              {stats.totalPageViews.toLocaleString()} <span style={{ fontSize: "14px", color: "#f3e8ff", fontWeight: 700 }}>회</span>
            </div>
            <span style={{ fontSize: "12px", color: "#f3e8ff", fontWeight: 600 }}>전체 조회수 누적</span>
          </div>
        </div>

        {/* Section 2: Analytics & Recent Logs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {/* Device & Browser Breakdown Card */}
          <div
            style={{
              padding: "22px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff", marginBottom: "18px" }}>
              📱 디바이스 및 브라우저 비율
            </h3>

            {/* Device Progress Bar */}
            <div style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 700, color: "#e2e8f0", marginBottom: "10px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#a5b4fc" }}>
                  <Laptop size={15} /> Desktop ({desktopPct}%)
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#7dd3fc" }}>
                  <Smartphone size={15} /> Mobile ({mobilePct}%)
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#fde047" }}>
                  <Tablet size={15} /> Tablet ({tabletPct}%)
                </span>
              </div>

              {/* Combined Progress Bar */}
              <div style={{ height: "12px", borderRadius: "100px", background: "rgba(255,255,255,0.1)", overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${desktopPct}%`, background: "#818cf8", transition: "width 0.3s" }} />
                <div style={{ width: `${mobilePct}%`, background: "#38bdf8", transition: "width 0.3s" }} />
                <div style={{ width: `${tabletPct}%`, background: "#facc15", transition: "width 0.3s" }} />
              </div>
            </div>

            {/* Browser list tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "Chrome", count: stats.browserBreakdown.chrome, color: "#818cf8" },
                { name: "Safari", count: stats.browserBreakdown.safari, color: "#38bdf8" },
                { name: "Edge", count: stats.browserBreakdown.edge, color: "#34d399" },
                { name: "Firefox", count: stats.browserBreakdown.firefox, color: "#facc15" },
              ].map((b) => (
                <div key={b.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#e2e8f0", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: b.color, boxShadow: `0 0 6px ${b.color}` }} />
                    {b.name}
                  </span>
                  <span style={{ fontWeight: 800, color: "#ffffff" }}>{b.count} 회</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Visit Logs */}
          <div
            style={{
              padding: "22px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>
                ⚡ 최근 방문 기록 로그 (Recent Logs)
              </h3>
              <span style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 700 }}>최근 5건</span>
            </div>

            {stats.recentLogs && stats.recentLogs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {stats.recentLogs.slice(0, 5).map((log: VisitLog) => (
                  <div
                    key={log.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      fontSize: "13px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: log.isNewSession ? "rgba(34, 197, 94, 0.3)" : "rgba(99, 102, 241, 0.3)",
                          color: log.isNewSession ? "#86efac" : "#c7d2fe",
                          fontSize: "11px",
                          fontWeight: 800,
                          border: log.isNewSession ? "1px solid #4ade80" : "1px solid #818cf8",
                        }}
                      >
                        {log.isNewSession ? "신규 방문" : "재방문"}
                      </span>
                      <span style={{ color: "#ffffff", fontWeight: 700 }}>{log.path}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "12.5px", color: "#e2e8f0", fontWeight: 700 }}>
                        {log.device} • {log.browser}
                      </span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          color: "#f1f5f9",
                          fontWeight: 700,
                          background: "#334155",
                          padding: "2px 8px",
                          borderRadius: "100px",
                        }}
                      >
                        {getRelativeTime(log.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "24px", textAlign: "center", color: "#cbd5e1", fontSize: "13px", fontWeight: 600 }}>
                방문 로그가 기록되는 중입니다...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
