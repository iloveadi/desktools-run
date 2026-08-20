"use client";

/**
 * app/tools/csv-to-json/page.tsx
 * ─────────────────────────────────────────────────────────────
 * CSV → JSON Converter Tool for desktools.run
 * 100% browser-native, no server upload required.
 */

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Table,
  ArrowLeft,
  Upload,
  Copy,
  Check,
  Download,
  Trash2,
  ArrowRight,
  FileText,
  Settings2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";

// ── CSV Parser ─────────────────────────────────────────────────
function parseCSV(
  raw: string,
  delimiter: string,
  hasHeader: boolean
): { headers: string[]; rows: Record<string, string>[]; error: string | null } {
  try {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return { headers: [], rows: [], error: "빈 파일입니다." };

    // Parse a single CSV line respecting quoted fields
    function parseLine(line: string): string[] {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delimiter && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    }

    let headers: string[];
    let dataLines: string[];

    if (hasHeader) {
      headers = parseLine(lines[0]);
      dataLines = lines.slice(1);
    } else {
      const colCount = parseLine(lines[0]).length;
      headers = Array.from({ length: colCount }, (_, i) => `column_${i + 1}`);
      dataLines = lines;
    }

    const rows: Record<string, string>[] = dataLines.map((line) => {
      const values = parseLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ?? "";
      });
      return row;
    });

    return { headers, rows, error: null };
  } catch {
    return { headers: [], rows: [], error: "CSV 파싱 중 오류가 발생했습니다." };
  }
}

// ── Component ──────────────────────────────────────────────────
export default function CsvToJsonPage() {
  const [csvText, setCsvText] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeader, setHasHeader] = useState(true);
  const [indentSize, setIndentSize] = useState(2);
  const [outputFormat, setOutputFormat] = useState<"array" | "object">("array");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"json" | "table">("json");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse result
  const result = csvText.trim()
    ? parseCSV(csvText, delimiter === "\\t" ? "\t" : delimiter, hasHeader)
    : null;

  // Build JSON output
  const jsonOutput = (() => {
    if (!result || result.error || result.rows.length === 0) return "";
    if (outputFormat === "object") {
      const key = result.headers[0] || "key";
      const obj: Record<string, Record<string, string>> = {};
      result.rows.forEach((row) => {
        const keyVal = row[key] || String(Math.random());
        obj[keyVal] = row;
      });
      return JSON.stringify(obj, null, indentSize);
    }
    return JSON.stringify(result.rows, null, indentSize);
  })();

  const lineCount = jsonOutput.split("\n").length;
  const byteSize = new TextEncoder().encode(jsonOutput).length;

  // File read
  function readFile(file: File) {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt") && file.type !== "text/csv") {
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setCsvText((e.target?.result as string) ?? "");
    reader.readAsText(file, "UTF-8");
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const handleCopy = async () => {
    if (!jsonOutput) return;
    await navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? fileName.replace(/\.(csv|txt)$/i, ".json") : "output.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setCsvText("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleRow = (i: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const DELIMITER_OPTIONS = [
    { label: "쉼표 (,)", value: "," },
    { label: "세미콜론 (;)", value: ";" },
    { label: "탭 (\\t)", value: "\\t" },
    { label: "파이프 (|)", value: "|" },
  ];

  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* ── Breadcrumb ── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 0" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} />
            모든 도구로 돌아가기
          </Link>
        </section>

        {/* ── Page Header ── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "6px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--brand-mid)",
              }}
            >
              <Table size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
                CSV → JSON 변환기
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
                CSV 파일을 브라우저에서 즉시 JSON으로 변환합니다 — 서버 전송 없음, 100% 로컬 처리
              </p>
            </div>
          </div>
        </section>

        {/* ── Main Tool Area ── */}
        <section style={{ maxWidth: "1280px", margin: "24px auto 0", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="csv-grid">

            {/* LEFT: Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Upload / Paste Area */}
              <div
                className="glass-card"
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                style={{
                  padding: "20px",
                  border: isDragging
                    ? "2px dashed var(--brand-mid)"
                    : "1px solid var(--border-subtle)",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={16} style={{ color: "var(--brand-mid)" }} />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      CSV 입력
                    </span>
                    {fileName && (
                      <span style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "100px",
                        background: "rgba(99,102,241,0.15)",
                        color: "var(--brand-mid)",
                        fontWeight: 600,
                      }}>
                        {fileName}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "var(--btn-secondary-bg)",
                        border: "1px solid var(--btn-secondary-border)",
                        color: "var(--text-primary)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Upload size={13} />
                      파일 업로드
                    </button>
                    {csvText && (
                      <button
                        onClick={handleClear}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.25)",
                          color: "#f87171",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={13} />
                        초기화
                      </button>
                    )}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={handleFileChange} />
                <textarea
                  value={csvText}
                  onChange={(e) => { setCsvText(e.target.value); setFileName(""); }}
                  placeholder={"name,age,city\n홍길동,30,서울\n김철수,25,부산\n\n→ CSV를 붙여넣거나 파일을 드래그하세요"}
                  style={{
                    width: "100%",
                    minHeight: "260px",
                    resize: "vertical",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "14px",
                    fontSize: "13px",
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                    color: "var(--text-primary)",
                    lineHeight: 1.6,
                    outline: "none",
                  }}
                />
                <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                  {csvText
                    ? `${csvText.split(/\r?\n/).filter(Boolean).length}행 · ${new TextEncoder().encode(csvText).length} bytes`
                    : "CSV 파일을 이 영역에 드래그하거나 직접 붙여넣기 하세요"}
                </div>
              </div>

              {/* Options */}
              <div className="glass-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <Settings2 size={15} style={{ color: "var(--brand-mid)" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>변환 옵션</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {/* Delimiter */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      구분자 (Delimiter)
                    </label>
                    <select
                      value={delimiter}
                      onChange={(e) => setDelimiter(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {DELIMITER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Indent */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      들여쓰기 (Indent)
                    </label>
                    <select
                      value={indentSize}
                      onChange={(e) => setIndentSize(Number(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option value={2}>2칸</option>
                      <option value={4}>4칸</option>
                      <option value={0}>압축 (Minify)</option>
                    </select>
                  </div>

                  {/* Output Format */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      출력 형식
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[
                        { val: "array", label: "배열 [ ]" },
                        { val: "object", label: "객체 { }" },
                      ].map(({ val, label }) => (
                        <button
                          key={val}
                          onClick={() => setOutputFormat(val as "array" | "object")}
                          style={{
                            flex: 1,
                            padding: "8px",
                            borderRadius: "8px",
                            border: outputFormat === val
                              ? "1px solid var(--brand-mid)"
                              : "1px solid var(--btn-secondary-border)",
                            background: outputFormat === val
                              ? "rgba(99,102,241,0.15)"
                              : "var(--btn-secondary-bg)",
                            color: outputFormat === val ? "var(--brand-mid)" : "var(--text-secondary)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Header Toggle */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      첫 행 헤더 사용
                    </label>
                    <button
                      onClick={() => setHasHeader((v) => !v)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "8px",
                        border: hasHeader ? "1px solid #34d399" : "1px solid var(--btn-secondary-border)",
                        background: hasHeader ? "rgba(52,211,153,0.12)" : "var(--btn-secondary-bg)",
                        color: hasHeader ? "#34d399" : "var(--text-secondary)",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {hasHeader ? "✓ 헤더 있음" : "헤더 없음 (auto)"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Convert Arrow Button (mobile) */}
              <div className="csv-convert-btn" style={{ display: "none", justifyContent: "center" }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "100px",
                  background: "linear-gradient(135deg, var(--brand-start), var(--brand-end))",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                }}>
                  <ArrowRight size={16} />
                  JSON 변환 중...
                </div>
              </div>
            </div>

            {/* RIGHT: Output */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Error Banner */}
              {result?.error && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#f87171",
                  fontSize: "13px",
                  fontWeight: 600,
                }}>
                  <AlertCircle size={16} />
                  {result.error}
                </div>
              )}

              {/* Stats Bar */}
              {result && !result.error && result.rows.length > 0 && (
                <div style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}>
                  {[
                    { label: "행", val: result.rows.length },
                    { label: "열", val: result.headers.length },
                    { label: "줄 수", val: lineCount },
                    { label: "크기", val: byteSize < 1024 ? `${byteSize}B` : `${(byteSize / 1024).toFixed(1)}KB` },
                  ].map(({ label, val }) => (
                    <div key={label} style={{
                      flex: 1,
                      minWidth: "60px",
                      padding: "10px",
                      borderRadius: "10px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-subtle)",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--brand-mid)" }}>{val}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab Switcher */}
              {result && !result.error && result.rows.length > 0 && (
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { key: "json", label: "JSON 출력" },
                    { key: "table", label: "테이블 미리보기" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as "json" | "table")}
                      style={{
                        padding: "7px 16px",
                        borderRadius: "8px",
                        border: activeTab === key ? "1px solid var(--brand-mid)" : "1px solid var(--btn-secondary-border)",
                        background: activeTab === key ? "rgba(99,102,241,0.15)" : "var(--btn-secondary-bg)",
                        color: activeTab === key ? "var(--brand-mid)" : "var(--text-secondary)",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* JSON Output */}
              <div
                className="glass-card"
                style={{
                  padding: "20px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "300px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {activeTab === "json" ? "JSON 출력" : "테이블 미리보기"}
                  </span>
                  {jsonOutput && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={handleCopy}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: copied ? "rgba(52,211,153,0.15)" : "var(--btn-secondary-bg)",
                          border: copied ? "1px solid #34d399" : "1px solid var(--btn-secondary-border)",
                          color: copied ? "#34d399" : "var(--text-primary)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? "복사됨!" : "복사"}
                      </button>
                      <button
                        onClick={handleDownload}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, var(--brand-start), var(--brand-end))",
                          border: "none",
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <Download size={13} />
                        .json 저장
                      </button>
                    </div>
                  )}
                </div>

                {/* JSON View */}
                {activeTab === "json" && (
                  <div style={{ flex: 1, position: "relative" }}>
                    {jsonOutput ? (
                      <pre style={{
                        margin: 0,
                        padding: "14px",
                        borderRadius: "10px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "12.5px",
                        fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace",
                        color: "var(--text-primary)",
                        lineHeight: 1.65,
                        overflowX: "auto",
                        overflowY: "auto",
                        maxHeight: "400px",
                        whiteSpace: "pre",
                      }}>
                        <SyntaxHighlight code={jsonOutput} />
                      </pre>
                    ) : (
                      <div style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "200px",
                        color: "var(--text-muted)",
                        gap: "10px",
                      }}>
                        <ArrowRight size={32} style={{ opacity: 0.3 }} />
                        <span style={{ fontSize: "14px" }}>왼쪽에 CSV를 입력하면 JSON이 여기 표시됩니다</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Table View */}
                {activeTab === "table" && result && !result.error && result.rows.length > 0 && (
                  <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ background: "rgba(99,102,241,0.1)" }}>
                          <th style={{ padding: "8px 12px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600, fontSize: "11px", borderBottom: "1px solid var(--border-subtle)", width: "36px" }}>
                            #
                          </th>
                          {result.headers.map((h) => (
                            <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--brand-mid)", fontWeight: 700, fontSize: "12px", borderBottom: "1px solid var(--border-subtle)", whiteSpace: "nowrap" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.slice(0, 100).map((row, i) => (
                          <tr
                            key={i}
                            style={{
                              background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                              cursor: "pointer",
                            }}
                            onClick={() => toggleRow(i)}
                          >
                            <td style={{ padding: "8px 12px", textAlign: "center", color: "var(--text-muted)", fontSize: "11px", borderBottom: "1px solid var(--border-subtle)" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                {expandedRows.has(i) ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                {i + 1}
                              </span>
                            </td>
                            {result.headers.map((h) => (
                              <td key={h} style={{ padding: "8px 14px", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: expandedRows.has(i) ? "normal" : "nowrap" }}>
                                {row[h] || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {result.rows.length > 100 && (
                      <div style={{ padding: "10px 14px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                        처음 100행만 표시 중 (전체 {result.rows.length}행)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Tool Guide ── */}
        <ToolGuide
          badgeText="100% Free & Browser-Native"
          aboutTitle="CSV → JSON 변환기란 무엇인가요?"
          aboutDesc="CSV 형식의 스프레드시트 데이터를 JavaScript 및 API에서 바로 사용할 수 있는 JSON 형식으로 변환하는 도구입니다. 모든 처리는 사용자의 브라우저 내에서만 수행되므로 파일이 서버로 업로드되지 않아 개인정보가 완벽하게 보호됩니다."
          howTitle="사용 방법"
          steps={[
            "CSV 파일을 드래그앤드롭하거나 '파일 업로드' 버튼으로 선택하세요. 또는 텍스트 영역에 CSV를 직접 붙여넣어도 됩니다.",
            "구분자(쉼표, 세미콜론, 탭 등), 들여쓰기, 출력 형식(배열/객체) 옵션을 필요에 따라 조정하세요.",
            "오른쪽에 즉시 변환된 JSON이 표시됩니다. '복사' 또는 '.json 저장' 버튼으로 결과물을 내보내세요.",
          ]}
          faqs={[
            { q: "파일이 서버로 업로드되나요?", a: "아니요. 모든 CSV 파싱 및 JSON 변환은 사용자의 브라우저 메모리 내에서만 수행됩니다. 데이터가 외부로 절대 전송되지 않습니다." },
            { q: "어떤 구분자를 지원하나요?", a: "쉼표(,), 세미콜론(;), 탭(\\t), 파이프(|)를 지원합니다. 엑셀에서 내보낼 경우 보통 쉼표 또는 세미콜론을 사용합니다." },
            { q: "한글이나 특수문자도 처리되나요?", a: "네. UTF-8 인코딩 기반으로 파일을 읽으므로 한국어를 포함한 모든 언어와 특수문자가 정확하게 처리됩니다." },
            { q: "출력 형식 '객체 { }'는 무엇인가요?", a: "배열 대신 첫 번째 컬럼 값을 키로 사용하는 객체 형태로 출력합니다. 특정 키로 데이터를 빠르게 조회해야 할 때 유용합니다." },
          ]}
        />
      </main>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .csv-grid { grid-template-columns: 1fr !important; }
          .csv-convert-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

// ── Simple JSON Syntax Highlighter ─────────────────────────────
function SyntaxHighlight({ code }: { code: string }) {
  const html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = "color:#a78bfa"; // number / bool / null
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "color:#93c5fd"; // key
        } else {
          cls = "color:#86efac"; // string value
        }
      } else if (/true|false/.test(match)) {
        cls = "color:#fbbf24";
      } else if (/null/.test(match)) {
        cls = "color:#f87171";
      }
      return `<span style="${cls}">${match}</span>`;
    });

  return <code dangerouslySetInnerHTML={{ __html: html }} />;
}
