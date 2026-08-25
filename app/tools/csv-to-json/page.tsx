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
import { useLocale } from "@/lib/context/LocaleContext";

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

    if (lines.length === 0) return { headers: [], rows: [], error: "Empty file" };

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
    return { headers: [], rows: [], error: "CSV Parse Error" };
  }
}

// ── Component ──────────────────────────────────────────────────
export default function CsvToJsonPage() {
  const { t } = useLocale();

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

  const lineCount = jsonOutput ? jsonOutput.split("\n").length : 0;
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
    { label: t("csvToJson.delimComma"), value: "," },
    { label: t("csvToJson.delimSemicolon"), value: ";" },
    { label: t("csvToJson.delimTab"), value: "\\t" },
    { label: t("csvToJson.delimPipe"), value: "|" },
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
            {t("csvToJson.back")}
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
                {t("csvToJson.title")}
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {t("csvToJson.subtitle")}
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
                      {t("csvToJson.inputLabel")}
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
                      {t("csvToJson.uploadFile")}
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
                        {t("csvToJson.clear")}
                      </button>
                    )}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={handleFileChange} />
                <textarea
                  value={csvText}
                  onChange={(e) => { setCsvText(e.target.value); setFileName(""); }}
                  placeholder={t("csvToJson.placeholder")}
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
                    ? `${csvText.split(/\r?\n/).filter(Boolean).length} ${t("csvToJson.statRows")} · ${new TextEncoder().encode(csvText).length} bytes`
                    : t("csvToJson.dropNotice")}
                </div>
              </div>

              {/* Options */}
              <div className="glass-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <Settings2 size={15} style={{ color: "var(--brand-mid)" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {t("csvToJson.optionsTitle")}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {/* Delimiter */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      {t("csvToJson.delimiterLabel")}
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
                      {t("csvToJson.indentLabel")}
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
                      <option value={2}>{t("csvToJson.indent2")}</option>
                      <option value={4}>{t("csvToJson.indent4")}</option>
                      <option value={0}>{t("csvToJson.indentMinify")}</option>
                    </select>
                  </div>

                  {/* Output Format */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      {t("csvToJson.outputFormatLabel")}
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[
                        { val: "array", label: t("csvToJson.formatArray") },
                        { val: "object", label: t("csvToJson.formatObject") },
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
                      {t("csvToJson.headerToggleLabel")}
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
                      {hasHeader ? t("csvToJson.headerHas") : t("csvToJson.headerNone")}
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
                  {t("csvToJson.convertingNotice")}
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
                    { label: t("csvToJson.statRows"), val: result.rows.length },
                    { label: t("csvToJson.statCols"), val: result.headers.length },
                    { label: t("csvToJson.statLines"), val: lineCount },
                    { label: t("csvToJson.statSize"), val: byteSize < 1024 ? `${byteSize}B` : `${(byteSize / 1024).toFixed(1)}KB` },
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
                    { key: "json", label: t("csvToJson.tabJson") },
                    { key: "table", label: t("csvToJson.tabTable") },
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
                    {activeTab === "json" ? t("csvToJson.jsonOutputTitle") : t("csvToJson.tablePreviewTitle")}
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
                        {copied ? t("csvToJson.copied") : t("csvToJson.copy")}
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
                        {t("csvToJson.saveJson")}
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
                        <span style={{ fontSize: "14px" }}>{t("csvToJson.emptyNotice")}</span>
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
                        {t("csvToJson.tableLimitNotice")} ({t("csvToJson.statRows")}: {result.rows.length})
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
          badgeText={t("csvToJson.guideBadge")}
          aboutTitle={t("csvToJson.guide.aboutTitle")}
          aboutDesc={t("csvToJson.guide.aboutDesc")}
          howTitle={t("csvToJson.guide.howTitle")}
          steps={[
            t("csvToJson.guide.step1"),
            t("csvToJson.guide.step2"),
            t("csvToJson.guide.step3"),
          ]}
          faqs={[
            { q: t("csvToJson.guide.faq1Q"), a: t("csvToJson.guide.faq1A") },
            { q: t("csvToJson.guide.faq2Q"), a: t("csvToJson.guide.faq2A") },
            { q: t("csvToJson.guide.faq3Q"), a: t("csvToJson.guide.faq3A") },
            { q: t("csvToJson.guide.faq4Q"), a: t("csvToJson.guide.faq4A") },
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
