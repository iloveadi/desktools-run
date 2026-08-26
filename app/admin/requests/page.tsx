"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VisitorCounter from "@/components/admin/VisitorCounter";
import { getLocalRequests, saveLocalRequests, StoredRequest } from "@/app/request/page";
import {
  ShieldCheck,
  Search,
  Trash2,
  Lock,
  RefreshCw,
} from "lucide-react";

export default function AdminRequestsPage() {
  const [pinInput, setPinInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [requests, setRequests] = useState<StoredRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const ADMIN_PIN = "1212";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("비밀번호가 일치하지 않습니다.");
    }
  };

  const fetchRequests = () => {
    const data = getLocalRequests();
    setRequests(data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated]);

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = requests.map((item) =>
      item.id === id ? { ...item, status: newStatus as any } : item
    );
    setRequests(updated);
    saveLocalRequests(updated);
  };

  const handleDelete = (id: string) => {
    const updated = requests.filter((item) => item.id !== id);
    setRequests(updated);
    saveLocalRequests(updated);
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.toolTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || r.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "Pending").length,
    inReview: requests.filter((r) => r.status === "In Review").length,
    planned: requests.filter((r) => r.status === "Planned").length,
    completed: requests.filter((r) => r.status === "Completed").length,
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return { bg: "rgba(234, 179, 8, 0.15)", color: "#eab308", border: "rgba(234, 179, 8, 0.3)" };
      case "In Review":
        return { bg: "rgba(99, 102, 241, 0.15)", color: "#818cf8", border: "rgba(99, 102, 241, 0.3)" };
      case "Planned":
        return { bg: "rgba(14, 165, 233, 0.15)", color: "#38bdf8", border: "rgba(14, 165, 233, 0.3)" };
      case "Completed":
        return { bg: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "rgba(34, 197, 94, 0.3)" };
      default:
        return { bg: "rgba(255, 255, 255, 0.1)", color: "#a1a1aa", border: "rgba(255, 255, 255, 0.2)" };
    }
  };

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {!isAuthenticated ? (
          /* Password Protection Screen */
          <section style={{ maxWidth: "420px", margin: "80px auto", padding: "0 24px" }}>
            <div
              className="glass-card"
              style={{
                padding: "36px 28px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(99,102,241,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#818cf8",
                }}
              >
                <Lock size={24} />
              </div>

              <div>
                <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                  관리자 인증
                </h1>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  대시보드 접근을 위한 보안 PIN 번호를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handleLogin} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="password"
                  placeholder="PIN 번호 입력"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "8px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    padding: "0 14px",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                  autoFocus
                />
                {authError && (
                  <span style={{ fontSize: "12.5px", color: "#f87171" }}>{authError}</span>
                )}
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  확인
                </button>
              </form>
            </div>
          </section>
        ) : (
          /* Admin Dashboard Content */
          <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
            {/* Header Title Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(99,102,241,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#818cf8",
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
                    신규 도구 요청 관리 대시보드
                  </h1>
                  <p style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>
                    사용자가 제출한 도구 아이디어 및 기능 요청 목록을 관리합니다.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={fetchRequests}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: "var(--btn-secondary-bg)",
                    border: "1px solid var(--btn-secondary-border)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw size={14} />
                  새로고침
                </button>
              </div>
            </div>

            {/* Metric Overview Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              {[
                { title: "전체 접수", count: counts.total, color: "#818cf8" },
                { title: "대기 중 (Pending)", count: counts.pending, color: "#eab308" },
                { title: "검토 중 (In Review)", count: counts.inReview, color: "#818cf8" },
                { title: "개발 예정 (Planned)", count: counts.planned, color: "#38bdf8" },
                { title: "개발 완료 (Completed)", count: counts.completed, color: "#4ade80" },
              ].map((m) => (
                <div
                  key={m.title}
                  className="glass-card"
                  style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "4px" }}
                >
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{m.title}</span>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: m.color }}>{m.count}건</span>
                </div>
              ))}
            </div>

            {/* Filter Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "14px",
                marginBottom: "24px",
              }}
            >
              {/* Search Bar */}
              <div
                style={{
                  position: "relative",
                  flex: "1 1 280px",
                  maxWidth: "360px",
                  display: "flex",
                  alignItems: "center",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "0 12px",
                }}
              >
                <Search size={16} style={{ color: "var(--text-muted)", marginRight: "8px" }} />
                <input
                  type="text"
                  placeholder="도구명, 설명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text-primary)",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              {/* Status Filter Buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {["All", "Pending", "In Review", "Planned", "Completed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "100px",
                      background: selectedStatus === st ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                      border: selectedStatus === st ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border-subtle)",
                      color: selectedStatus === st ? "#a5b4fc" : "var(--text-secondary)",
                      fontSize: "12.5px",
                      fontWeight: selectedStatus === st ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {st === "All" ? "전체 보기" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
              <div
                className="glass-card"
                style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}
              >
                접수된 도구 요청 항목이 없습니다.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {filteredRequests.map((reqItem) => {
                  const badgeStyle = getStatusBadgeStyle(reqItem.status);

                  return (
                    <div
                      key={reqItem.id}
                      className="glass-card"
                      style={{
                        padding: "22px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        position: "relative",
                      }}
                    >
                      {/* Top Bar: Category, Status Dropdown, Date & Delete */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "6px",
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid var(--border-subtle)",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {reqItem.category}
                          </span>

                          {/* Status Badge Dropdown */}
                          <select
                            value={reqItem.status}
                            onChange={(e) => handleStatusChange(reqItem.id, e.target.value)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "100px",
                              background: badgeStyle.bg,
                              color: badgeStyle.color,
                              border: `1px solid ${badgeStyle.border}`,
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              outline: "none",
                            }}
                          >
                            <option value="Pending">⚡ Pending (대기 중)</option>
                            <option value="In Review">🔍 In Review (검토 중)</option>
                            <option value="Planned">🚀 Planned (개발 예정)</option>
                            <option value="Completed">✅ Completed (완료)</option>
                          </select>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {new Date(reqItem.createdAt).toLocaleString("ko-KR")}
                          </span>
                          <button
                            onClick={() => handleDelete(reqItem.id)}
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#f87171",
                              cursor: "pointer",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              fontWeight: 600,
                              transition: "all 0.15s",
                            }}
                            title="항목 삭제"
                          >
                            <Trash2 size={13} />
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>

                      {/* Tool Title & Description */}
                      <div>
                        <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                          {reqItem.toolTitle}
                        </h3>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "var(--text-secondary)",
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {reqItem.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Real Visitor Counter & Analytics Section */}
            <VisitorCounter />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
