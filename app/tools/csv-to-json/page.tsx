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
  Sparkles,
  Layers,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
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
  const { locale, t } = useLocale();

  const [csvText, setCsvText] = useState(
    `id,name,role,department,email,active\n101,Alex Jung,Lead Architect,Platform Engineering,alex@desktools.run,true\n102,Sarah Chen,Product Designer,UX Studio,sarah@desktools.run,true\n103,David Miller,Security Engineer,SecOps,david@desktools.run,false`
  );
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
    { label: t("csvToJson.delimComma") || "Comma (,)", value: "," },
    { label: t("csvToJson.delimSemicolon") || "Semicolon (;)", value: ";" },
    { label: t("csvToJson.delimTab") || "Tab (\\t)", value: "\\t" },
    { label: t("csvToJson.delimPipe") || "Pipe (|)", value: "|" },
  ];

  return (
    <>
      <ToolUsageTracker toolId="csv-to-json" />
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
            {t("csvToJson.back") || "Back to Tools"}
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
                {t("csvToJson.title") || "CSV to JSON Converter"}
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {t("csvToJson.subtitle") || "Convert CSV files or raw text into structured JSON data with interactive table preview."}
              </p>
            </div>
          </div>
        </section>

        {/* ── Main Tool Workspace ── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 0" }}>
          {/* Options Bar */}
          <div
            className="glass-card"
            style={{
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            {/* Left: Delimiter + Header checkbox + Format */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Settings2 size={15} style={{ color: "var(--brand-mid)" }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {t("csvToJson.delimiterLabel") || "Delimiter"}:
                </span>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {DELIMITER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Has Header Checkbox */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  style={{ accentColor: "var(--brand-mid)", cursor: "pointer" }}
                />
                {t("csvToJson.hasHeader") || "First row is header"}
              </label>

              {/* Output format */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {t("csvToJson.outputFormatLabel") || "Format"}:
                </span>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as "array" | "object")}
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <option value="array">{t("csvToJson.formatArray") || "Array of Objects [ { ... } ]"}</option>
                  <option value="object">{t("csvToJson.formatObject") || "Object by 1st Column { key: { ... } }"}</option>
                </select>
              </div>

              {/* Indent size */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {t("csvToJson.indentLabel") || "Indent"}:
                </span>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={0}>Minify (0)</option>
                </select>
              </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {csvText && (
                <button
                  onClick={handleClear}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#f87171",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <Trash2 size={13} />
                  {t("csvToJson.clear") || "Clear"}
                </button>
              )}
            </div>
          </div>

          {/* Editor Grid: Left = CSV Input, Right = JSON Output */}
          <div
            className="csv-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* ── Left: CSV Input Panel ── */}
            <div
              className="glass-card"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={15} style={{ color: "var(--brand-mid)" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {t("csvToJson.csvInputLabel") || "CSV Input"}
                  </span>
                  {fileName && (
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 7px",
                        borderRadius: "6px",
                        background: "rgba(99,102,241,0.15)",
                        color: "var(--brand-mid)",
                        fontWeight: 600,
                      }}
                    >
                      {fileName}
                    </span>
                  )}
                </div>

                {/* Upload Button */}
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
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <Upload size={13} />
                  {t("csvToJson.uploadFile") || "Upload .csv"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,text/csv"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              {/* Drag-and-drop overlay container */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "10px",
                  border: isDragging ? "2px dashed var(--brand-mid)" : "1px solid var(--border-subtle)",
                  background: isDragging ? "rgba(99,102,241,0.08)" : "transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={t("csvToJson.placeholder") || "Paste your CSV here or drag and drop a .csv file..."}
                  style={{
                    width: "100%",
                    minHeight: "420px",
                    padding: "16px",
                    background: "var(--input-bg)",
                    border: "none",
                    borderRadius: "10px",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />

                {/* Empty State / Drag Overlay */}
                {!csvText && !isDragging && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      pointerEvents: "none",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Upload size={28} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: "13px" }}>
                      {t("csvToJson.dropNotice") || "Paste CSV or drag & drop a .csv file"}
                    </span>
                  </div>
                )}
              </div>

              {/* Left footer: stats */}
              {csvText && (
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <span>
                    {result ? `${result.rows.length} ${t("csvToJson.rowsCount") || "rows"}` : "0 rows"}
                  </span>
                  <span>
                    {result ? `${result.headers.length} ${t("csvToJson.colsCount") || "columns"}` : "0 cols"}
                  </span>
                </div>
              )}
            </div>

            {/* ── Right: JSON Output Panel ── */}
            <div
              className="glass-card"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px",
              }}
            >
              {/* Header: Tabs + Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {/* View Switcher: JSON / Table */}
                <div
                  style={{
                    display: "flex",
                    background: "var(--btn-secondary-bg)",
                    border: "1px solid var(--btn-secondary-border)",
                    borderRadius: "8px",
                    padding: "2px",
                    gap: "2px",
                  }}
                >
                  <button
                    onClick={() => setActiveTab("json")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "none",
                      background: activeTab === "json" ? "var(--brand-mid)" : "transparent",
                      color: activeTab === "json" ? "#fff" : "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => setActiveTab("table")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "none",
                      background: activeTab === "table" ? "var(--brand-mid)" : "transparent",
                      color: activeTab === "table" ? "#fff" : "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {t("csvToJson.tabTable") || "Table"}
                  </button>
                </div>

                {/* Copy & Download Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={handleCopy}
                    disabled={!jsonOutput}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: copied ? "rgba(34,197,94,0.15)" : "var(--btn-secondary-bg)",
                      border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--btn-secondary-border)",
                      color: copied ? "#4ade80" : "var(--text-primary)",
                      fontSize: "12px",
                      cursor: jsonOutput ? "pointer" : "not-allowed",
                      fontWeight: 600,
                      opacity: jsonOutput ? 1 : 0.5,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? (t("csvToJson.copied") || "Copied!") : (t("csvToJson.copy") || "Copy JSON")}
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={!jsonOutput}
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
                      cursor: jsonOutput ? "pointer" : "not-allowed",
                      fontWeight: 600,
                      opacity: jsonOutput ? 1 : 0.5,
                    }}
                  >
                    <Download size={13} />
                    {t("csvToJson.download") || "Download .json"}
                  </button>
                </div>
              </div>

              {/* Output Content Area */}
              <div
                style={{
                  flex: 1,
                  minHeight: "420px",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid var(--border-subtle)",
                  overflow: "auto",
                  padding: activeTab === "json" ? "16px" : "0",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Error State */}
                {result?.error && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#f87171",
                      fontSize: "13px",
                      padding: "16px",
                    }}
                  >
                    <AlertCircle size={16} />
                    {result.error}
                  </div>
                )}

                {/* Empty State */}
                {!csvText && (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      color: "var(--text-muted)",
                      fontSize: "13px",
                    }}
                  >
                    <ArrowRight size={24} style={{ opacity: 0.4 }} />
                    <span>{t("csvToJson.outputEmptyNotice") || "JSON result will appear here"}</span>
                  </div>
                )}

                {/* ── JSON View ── */}
                {csvText && activeTab === "json" && jsonOutput && (
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "12.5px",
                      lineHeight: "1.6",
                      color: "var(--text-primary)",
                      whiteSpace: "pre",
                    }}
                  >
                    <SyntaxHighlight code={jsonOutput} />
                  </pre>
                )}

                {/* ── Table View ── */}
                {csvText && activeTab === "table" && result && !result.error && (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "12.5px",
                        textAlign: "left",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--border-subtle)",
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <th style={{ padding: "10px 12px", color: "var(--text-muted)", width: "36px" }}>#</th>
                          {result.headers.map((h, i) => (
                            <th
                              key={i}
                              style={{
                                padding: "10px 12px",
                                color: "var(--brand-mid)",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.slice(0, 100).map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                              transition: "background 0.1s",
                            }}
                          >
                            <td style={{ padding: "8px 12px", color: "var(--text-muted)", fontSize: "11px" }}>
                              {rIdx + 1}
                            </td>
                            {result.headers.map((h, cIdx) => (
                              <td
                                key={cIdx}
                                style={{
                                  padding: "8px 12px",
                                  color: "var(--text-primary)",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {row[h] || <span style={{ color: "var(--text-muted)" }}>-</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {result.rows.length > 100 && (
                      <div
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          borderTop: "1px solid var(--border-subtle)",
                        }}
                      >
                        {t("csvToJson.tableTruncated") || `Showing first 100 of ${result.rows.length} rows`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right footer: stats */}
              {jsonOutput && (
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <span>{lineCount.toLocaleString()} {t("csvToJson.lines") || "lines"}</span>
                  <span>{(byteSize / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "CSV ➔ JSON 실시간 변환기 소개",
              aboutDesc:
                "엑셀(Excel), 구글 스프레드시트 또는 데이터베이스에서 내보낸 CSV(쉼표로 구분된 값) 파일을 웹 개발과 API 연동에 최적화된 표준 JSON 데이터로 즉시 변환해 주는 브라우저 기반 고속 변환기입니다. 쉼표(,), 세미콜론(;), 탭(\\t), 파이프(|) 등 커스텀 구분자 완벽 지원과 함께 객체 배열 포맷 및 인터랙티브 테이블 미리보기를 100% 로컬에서 안전하게 처리합니다.",
              howTitle: "CSV to JSON 변환기 사용 방법",
              steps: [
                "왼쪽 입력창에 CSV 텍스트를 직접 붙여넣거나 'Upload .csv' 버튼을 눌러 파일을 불러옵니다.",
                "상단 툴바에서 구분자(쉼표, 세미콜론, 탭 등)와 첫 줄 헤더(Header) 포함 여부를 설정합니다.",
                "출력 형태를 '객체 배열 [ { ... } ]' 또는 '첫 번째 열 기준 객체 { key: { ... } }' 중에서 선택합니다.",
                "우측 결과창에서 실시간으로 생성된 문법 하이라이트 JSON 코드 또는 'Table' 탭의 표 미리보기를 확인합니다.",
                "'Copy JSON' 버튼으로 클립보드에 복사하거나 'Download .json' 버튼으로 파일 저장하세요."
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "다양한 구분자(Delimiter) 자동 처리", desc: "쉼표(,), 세미콜론(;), 탭 구분 TSV, 파이프(|) 기호까지 손쉽게 파싱합니다." },
                { title: "인터랙티브 테이블 뷰(Table Preview) 지원", desc: "JSON 변환 결과뿐만 아니라 원본 스프레드시트 형태의 데이터 그리드를 동시 확인 가능합니다." },
                { title: "배열(Array) vs 키-값(Object) 포맷 선택", desc: "용도에 맞게 객체 배열 [ { } ] 또는 첫 번째 컬럼을 고유 ID로 사용하는 맵 구조로 출력합니다." },
                { title: "100% 클라이언트 로컬 보안 파싱", desc: "고객 DB, 매출 장부, 기밀 엑셀 파일이 외부 서버로 단 1바이트도 전송되지 않습니다." }
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "스프레드시트 엑셀 데이터 ➔ 프론트엔드 목업", desc: "마케팅팀에서 전달받은 CSV 데이터를 React/Vue 컴포넌트의 초기 mockData.json으로 즉시 변환" },
                { title: "NoSQL 데이터베이스(MongoDB) 일괄 임포트", desc: "RDBMS에서 덤프한 CSV 테이블을 MongoDB mongoimport용 JSON 문서로 변환" },
                { title: "REST API 요청 페이로드(Payload) 구성", desc: "수백 건의 상품 목록이나 유저 리스트를 Postman / Insomnia API 테스트 페이로드로 가공" },
                { title: "국가 공공데이터 CSV 파싱", desc: "공공데이터 포털에서 다운로드한 통계 CSV를 웹 서비스용 JSON 데이터셋으로 변환" }
              ],
              proTipsTitle: "CSV 변환 전문가 실무 팁",
              proTips: [
                "필드 내에 쉼표가 포함되어 있는 경우(예: \"Seoul, Korea\"), 쌍따옴표로 감싸져 있어야 정상 파싱됩니다.",
                "유럽 지역 엑셀 파일은 소수점을 쉼표(,)로 표기하므로 열 구분자로 세미콜론(;)을 사용하는 경우가 많습니다.",
                "대용량 CSV 파일(수 MB 이상)도 브라우저 메모리 내에서 부드럽게 변환되므로 안심하고 로드하세요.",
                "첫 번째 행에 헤더가 없는 순수 데이터 파일인 경우 'First row is header' 체크를 해제하면 column_1, column_2가 자동 생성됩니다."
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "입력한 CSV 파일이 서버에 저장되거나 유출될 위험이 있나요?", a: "전혀 없습니다. desktools.run의 모든 파싱 로직은 브라우저 내부에서 100% 로컬 실행되므로 외부 전송이 발생하지 않습니다." },
                { q: "탭(Tab)으로 구분된 TSV 파일도 변환 가능한가요?", a: "네! 상단 'Delimiter' 옵션에서 'Tab (\\t)'을 선택하시면 TSV 파일을 완벽하게 변환합니다." },
                { q: "한글이나 특수문자가 포함된 CSV도 깨지지 않나요?", a: "UTF-8 표준 인코딩 파서를 내장하여 한글, 일본어, 중국어 및 이모지가 완벽하게 보존됩니다." },
                { q: "변환된 JSON의 들여쓰기를 조절할 수 있나요?", a: "네, 상단 'Indent' 옵션에서 2 Spaces, 4 Spaces 또는 압축(Minify)을 자유롭게 선택하실 수 있습니다." },
                { q: "변환 용량이나 행 수(Row)에 제한이 있나요?", a: "웹 브라우저 메모리가 허용하는 한 수만 행 이상의 데이터도 무제한으로 변환 가능합니다." },
                { q: "완전 무료인가요?", a: "네, 아무런 조건이나 제한 없이 100% 무료로 제공됩니다." }
              ],
              relatedTools: [
                { title: "JSON 정렬 / 검증기", desc: "변환된 JSON을 포맷팅하고 문법 오류 실시간 검사", href: "/tools/json-formatter/" },
                { title: "Base64 인코더 / 디코더", desc: "텍스트 및 파일 데이터를 Base64로 즉시 변환", href: "/tools/base64/" },
                { title: "단위 변환기", desc: "길이, 무게, 넓이, 부피, 속도 등 다차원 단위 실시간 환산", href: "/tools/unit-converter/" },
                { title: "색상 변환기 & 피커", desc: "HEX, RGB, HSL, CMYK 색상 코드 상호 변환", href: "/tools/color-converter/" }
              ]
            },
            en: {
              aboutTitle: "About CSV to JSON Converter",
              aboutDesc:
                "Convert spreadsheet CSV files and tabular raw text into structured JSON data in real-time. Supports custom delimiters (comma, semicolon, tab, pipe), array vs object output formatting, and an interactive spreadsheet table preview. 100% client-side processing guarantees your customer databases and financial records never touch remote servers.",
              howTitle: "How to Convert CSV to JSON",
              steps: [
                "Paste your CSV text into the left editor or click 'Upload .csv' to open a local file.",
                "Configure your delimiter (Comma, Semicolon, Tab, Pipe) and specify whether the first row represents column headers.",
                "Choose your desired output structure: 'Array of Objects' or 'Object by 1st Column'.",
                "Review the formatted JSON output or switch to the 'Table' tab for a structured data preview.",
                "Click 'Copy JSON' to save to your clipboard or 'Download .json' to save the output file."
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "Universal Delimiter Support", desc: "Handles standard commas, European semicolons, tab-separated TSV files, and custom pipes seamlessly." },
                { title: "Interactive Table Preview", desc: "Visualizes your CSV rows in a clean, scrollable spreadsheet data grid alongside the JSON output." },
                { title: "Flexible Array or Keyed Object Structures", desc: "Output as a standard array of objects [ { } ] or indexed dictionary { key: { } }." },
                { title: "100% Client-Side Privacy", desc: "All conversions happen locally in your browser memory with zero network uploads." }
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "Frontend Mock Data Creation", desc: "Convert exported business spreadsheets directly into mock JSON fixtures for React/Vue testing." },
                { title: "NoSQL (MongoDB) Database Seeding", desc: "Transform CSV database dumps into JSON collections ready for mongoimport." },
                { title: "REST API Payload Construction", desc: "Format batch records into JSON array payloads for Postman and API integration tests." },
                { title: "Open Data & Statistics Ingestion", desc: "Parse public government CSV datasets into web-ready JSON feeds." }
              ],
              proTipsTitle: "Professional Tips for CSV Parsing",
              proTips: [
                "If field values contain commas (e.g., \"San Francisco, CA\"), ensure they are enclosed in double quotes.",
                "European Excel files often use semicolons (;) as delimiters because commas are used as decimal points.",
                "Large CSV files with thousands of rows parse smoothly in browser memory with zero server lag.",
                "If your raw data lacks header columns, uncheck 'First row is header' to generate column_1, column_2 automatically."
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "Is my CSV file uploaded to any remote server?", a: "No. All parsing happens 100% locally in your browser with complete privacy." },
                { q: "Does it support Tab-separated TSV files?", a: "Yes. Simply choose 'Tab (\\t)' in the Delimiter dropdown." },
                { q: "Are international characters and emojis preserved?", a: "Yes. The parser uses UTF-8 decoding to preserve all Unicode characters and symbols." },
                { q: "Can I adjust JSON indentation?", a: "Yes, you can choose between 2 spaces, 4 spaces, or compact Minified JSON." },
                { q: "Is there a limit on file size or row count?", a: "You can convert files with tens of thousands of rows up to your browser's memory capacity." },
                { q: "Is this tool completely free?", a: "Yes, 100% free with unlimited conversions." }
              ],
              relatedTools: [
                { title: "JSON Formatter & Validator", desc: "Prettify, minify, and validate JSON data in real-time", href: "/tools/json-formatter/" },
                { title: "Base64 Encoder & Decoder", desc: "Convert text and binary payloads to and from Base64", href: "/tools/base64/" },
                { title: "Unit Converter", desc: "Convert length, weight, temperature, area, volume, and speed", href: "/tools/unit-converter/" },
                { title: "Color Converter & Picker", desc: "Convert between HEX, RGB, HSL, HSV, and CMYK color codes", href: "/tools/color-converter/" }
              ]
            },
            ja: {
              aboutTitle: "CSV ➔ JSON リアルタイム変換器について",
              aboutDesc:
                "Excel やスプレッドシートからエクスポートした CSV（カンマ区切り）ファイルを Web 開発や API 連携に最適な構造化 JSON データに即座に変換する高機能ツールです。カンマ、セミコロン、タブ（TSV）、パイプなどのカスタム区切り文字に対応し、配列 / オブジェクト形式の切り替えやテーブルプレビュー機能をブラウザ内で安全に提供します。",
              howTitle: "CSV から JSON への変換手順",
              steps: [
                "左側の入力エリアに CSV テキストを貼り付けるか、「Upload .csv」ボタンからファイルを読み込みます。",
                "上部のオプションで区切り文字（カンマ、タブ等）と 1 行目をヘッダーとするかを設定します。",
                "出力形式を「オブジェクト配列 [ { ... } ]」または「1 列目基準のオブジェクト { key: { ... } }」から選択します。",
                "右側の結果エリアで JSON コードまたは「Table」タブによる表形式プレビューを確認します。",
                "「Copy JSON」ボタンでクリップボードにコピーするか、「Download .json」で保存します。"
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "多彩な区切り文字（Delimiter）に対応", desc: "カンマ（,）、セミコロン（;）、タブ区切り（TSV）、パイプ（|）を柔軟にパースします。" },
                { title: "テーブルプレビュー（Table View）搭載", desc: "JSON 出力だけでなく、元の表形式データを視覚的にスクロールして確認できます。" },
                { title: "配列形式・キー指定オブジェクト形式", desc: "標準的なオブジェクト配列形式または 1 列目の値をキーとする辞書構造を選択可能です。" },
                { title: "100% クライアント側ローカル処理", desc: "売上データや顧客リストが外部サーバーへ送信される心配は一切ありません。" }
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "フロントエンド開発のモックデータ作成", desc: "マーケティング資料の CSV を React / Vue のテスト用 mockData.json に即時変換" },
                { title: "NoSQL（MongoDB）データベースへのインポート", desc: "CSV データを mongoimport で一括投入可能な JSON ドキュメントへ変換" },
                { title: "REST API のリクエストペイロード構築", desc: "Postman や API テストツールで使用する一括送信ペイロードの生成" },
                { title: "オープンデータ（統計 CSV）の活用", desc: "自治体や政府の公開 CSV を Web アプリ用 JSON データセットに変換" }
              ],
              proTipsTitle: "CSV 変換のプロのテクニック",
              proTips: [
                "フィールド内にカンマが含まれる値（例: \"Tokyo, Japan\"）はダブルクォートで囲む必要があります。",
                "欧州圏の Excel CSV は小数点がカンマ表記となるため、セミコロン（;）区切りが多用されます。",
                "数 MB クラスの大容量 CSV もブラウザの高速メモリ内でスムーズに変換可能です。",
                "ヘッダー行がないデータの場合、チェックを外すと column_1, column_2 が自動付与されます。"
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "入力したデータがサーバーに送信されることはありますか？", a: "ありません。すべての変換処理はお使いのブラウザ内部で完結します。" },
                { q: "タブ区切りの TSV ファイルも変換できますか？", a: "はい、区切り文字オプションで「Tab (\\t)」を選択することで TSV も完全対応します。" },
                { q: "日本語が文字化けすることはありませんか？", a: "UTF-8 エンコーディングを標準サポートしており日本語も綺麗に変換されます。" },
                { q: "インデント（空白数）を調整できますか？", a: "はい、2 スペース、4 スペース、最小化（Minify）から選択できます。" },
                { q: "行数やファイルサイズに上限はありますか？", a: "お使いのブラウザのメモリが許す限り数万行のデータも無制限に変換可能です。" },
                { q: "無料で利用できますか？", a: "はい、完全無料・回数無制限でご利用いただけます。" }
              ],
              relatedTools: [
                { title: "JSON 整形・バリデーター", desc: "JSON の整形、圧縮、構文エラー検証", href: "/tools/json-formatter/" },
                { title: "Base64 エンコーダー / デコーダー", desc: "文字列とバイナリデータを Base64 形式で相互変換", href: "/tools/base64/" },
                { title: "単位変換ツール", desc: "長さ、重さ、温度、面積、体積、速度などを即時換算", href: "/tools/unit-converter/" },
                { title: "色コード変換＆ピッカー", desc: "HEX、RGB、HSL、CMYK の相互変換とカラーパレット作成", href: "/tools/color-converter/" }
              ]
            },
            es: {
              aboutTitle: "Acerca del Conversor de CSV a JSON",
              aboutDesc:
                "Convierte archivos CSV y datos tabulares exportados de Excel en estructuras JSON optimizadas para desarrollo web y APIs en tiempo real. Admite delimitadores personalizados (coma, punto y coma, tabulador, barra vertical), formatos de salida en matriz u objeto y vista previa en tabla interactiva. Todo 100% local en tu navegador con total privacidad.",
              howTitle: "Cómo Convertir CSV a JSON",
              steps: [
                "Pega tu texto CSV en el editor izquierdo o pulsa 'Upload .csv' para cargar un archivo local.",
                "Configura el delimitador (coma, punto y coma, tabulador) e indica si la primera fila es encabezado.",
                "Elige la estructura de salida: 'Matriz de Objetos' u 'Objeto indexado por 1ª columna'.",
                "Revisa la salida JSON formateada o cambia a la pestaña 'Table' para ver la cuadrícula de datos.",
                "Haz clic en 'Copy JSON' para copiar al portapapeles o en 'Download .json' para guardar el archivo."
              ],
              featuresTitle: "Características Principales",
              features: [
                { title: "Soporte de Múltiples Delimitadores", desc: "Procesa comas (,), puntos y coma (;), tabuladores TSV y barras (|) con facilidad." },
                { title: "Vista Previa en Tabla Interactiva", desc: "Visualiza tus filas en una hoja de cálculo limpia junto a la salida JSON." },
                { title: "Formatos en Array o Diccionario Clave-Valor", desc: "Exporta como lista estándar [ { } ] o mapa indexado { key: { } }." },
                { title: "Privacidad 100% en el Navegador", desc: "Tus datos confidenciales nunca se transmiten a servidores externos." }
              ],
              useCasesTitle: "Casos de Uso Comunes",
              useCases: [
                { title: "Datos Mock para Frontend", desc: "Convierte hojas de cálculo de marketing en archivos mockData.json para React o Vue." },
                { title: "Importación en MongoDB / NoSQL", desc: "Prepara volcados de bases de datos relacionales para importación masiva en formato JSON." },
                { title: "Pruebas de APIs REST", desc: "Genera payloads de prueba para Postman o Insomnia a partir de listas en hojas de cálculo." },
                { title: "Ingesta de Datos Públicos Abiertos", desc: "Convierte conjuntos de datos CSV gubernamentales en feeds JSON listos para web." }
              ],
              proTipsTitle: "Consejos Profesionales para CSV",
              proTips: [
                "Los campos que contengan comas deben ir encerrados entre comillas dobles (ej. \"Madrid, España\").",
                "Los archivos de Excel en español suelen usar punto y coma (;) como separador de columnas.",
                "Archivos CSV de varios megabytes se procesan de forma fluida en la memoria de tu navegador.",
                "Si tus datos carecen de encabezados, desmarca la casilla para autogenerar column_1, column_2."
              ],
              faqTitle: "Preguntas Frecuentes (FAQ)",
              faqs: [
                { q: "¿Se envían mis archivos CSV a algún servidor?", a: "No. Todo el procesamiento se realiza localmente en tu navegador." },
                { q: "¿Se admiten archivos TSV separados por tabuladores?", a: "Sí. Selecciona 'Tab (\\t)' en el menú de delimitadores." },
                { q: "¿Se conservan tildes, eñes y emojis?", a: "Sí, el decodificador UTF-8 preserva perfectamente todos los caracteres especiales." },
                { q: "¿Se puede ajustar la sangría del JSON?", a: "Sí, puedes elegir entre 2 espacios, 4 espacios o formato compacto (Minify)." },
                { q: "¿Hay límite de filas?", a: "Puedes convertir decenas de miles de filas sin restricciones de uso." },
                { q: "¿Es completamente gratuito?", a: "Sí, 100% gratuito e ilimitado." }
              ],
              relatedTools: [
                { title: "Formateador y Validador JSON", desc: "Embellece, valida y minifica datos JSON", href: "/tools/json-formatter/" },
                { title: "Codificador / Decodificador Base64", desc: "Convierte texto y archivos a formato Base64", href: "/tools/base64/" },
                { title: "Conversor de Unidades", desc: "Convierte longitud, peso, temperatura, área y volumen", href: "/tools/unit-converter/" },
                { title: "Conversor de Color y Paleta", desc: "Convierte entre códigos HEX, RGB, HSL, HSV y CMYK", href: "/tools/color-converter/" }
              ]
            },
            zh: {
              aboutTitle: "关于 CSV ➔ JSON 实时数据转换器",
              aboutDesc:
                "专为数据分析师与前端开发者打造的高速表格数据转换工具。可即刻将 Excel、Google 表格导出的 CSV 文件或文本转化为结构化标准 JSON 数据。完美支持逗号 (,)、分号 (;)、制表符 TSV (\\t)、竖线 (|) 等各类自定义分隔符，支持对象数组与键值对对象双重输出，并提供沉浸式数据表格预览。100% 浏览器本地运算，数据零泄露。",
              howTitle: "如何将 CSV 转换为 JSON 数据",
              steps: [
                "在左侧文本框粘贴 CSV 文本，或点击“Upload .csv”直接载入本地表格文件。",
                "在顶部工具栏配置分隔符（逗号、分号、Tab 等）并确认首行是否为表头字段名。",
                "选择目标输出结构：“对象数组 [ { ... } ]”或“以首列为键的字典对象 { key: { ... } }”。",
                "在右侧窗口查看语法高亮 JSON 结果，或点击“Table”标签页查看可视化表格排版。",
                "点击“Copy JSON”一键复制到剪贴板，或点击“Download .json”直接下载生成的文件。"
              ],
              featuresTitle: "核心功能与特点",
              features: [
                { title: "全能分隔符 (Delimiter) 自由解析", desc: "支持标准逗号、欧洲分号规范、制表符 TSV 以及管道符 (|) 混合分隔。" },
                { title: "内置交互式表格视图 (Table View)", desc: "无需额外打开 Excel 即可在浏览器内直观核对数据行与列对应关系。" },
                { title: "数组 (Array) 与键值字典 (Object) 双模", desc: "既可输出标准的列表记录，也可按第一列主键快速重组为字典映射。" },
                { title: "100% 客户端本地安全隐私", desc: "商业报表、客户名单及财务数据绝不上云，绝对保证信息安全。" }
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "前端开发 Mock 数据生成", desc: "将产品运营提供的 CSV 需求表一键转换为 React / Vue 项目所需的测试 mockData.json" },
                { title: "NoSQL 数据库 (MongoDB) 数据清洗", desc: "将关系型数据库导出的 CSV 转换为可被 mongoimport 批量录入的 JSON 集合" },
                { title: "REST API 接口联调 Payload 构建", desc: "在 Postman / Apifox 中批量构建 JSON 格式的测试请求体" },
                { title: "政府开放统计数据清洗", desc: "将公开的宏观经济或人口统计 CSV 数据集转换为 Web 可用的 JSON 格式" }
              ],
              proTipsTitle: "CSV 转换专业实战技巧",
              proTips: [
                "若字段内容中本身含有逗号（例如 \"Beijing, China\"），必须用英文双引号包裹以防被错误拆列。",
                "部分欧洲版 Excel 导出的 CSV 默认使用分号 (;) 分隔，此时在 Delimiter 下拉框中切换为 Semicolon 即可。",
                "数兆字节（MB）级别的大型数据表格完全可在现代浏览器内存中流畅解析。",
                "若原始数据第一行就是有效记录而非表头，请取消勾选“First row is header”，系统将自动补齐 column_1 等列名。"
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "上传的 CSV 文件会被保存在服务器上吗？", a: "绝对不会。desktools.run 的所有转换算法 100% 在您本机的浏览器内存中运行。" },
                { q: "支持制表符分隔的 TSV 文件吗？", a: "支持！在 Delimiter 下拉框中选择“Tab (\\t)”即可完美转换 TSV。" },
                { q: "中文或 Emoji 会发生乱码吗？", a: "内置标准 UTF-8 编码解析，中英日韩及特殊符号均可完整保留。" },
                { q: "可以自定义 JSON 的缩进空格数吗？", a: "可以，支持 2 空格、4 空格以及生产环境单行压缩（Minify）。" },
                { q: "有行数或文件体积上限吗？", a: "只要浏览器内存充足，数万行的超大表格均可无限制转换。" },
                { q: "完全免费吗？", a: "永久 100% 免费。" }
              ],
              relatedTools: [
                { title: "JSON 格式化与校验工具", desc: "JSON 数据美化、压缩与语法错误实时排查", href: "/tools/json-formatter/" },
                { title: "Base64 编码 / 解码工具", desc: "文本与二进制数据的 Base64 双向即时转换", href: "/tools/base64/" },
                { title: "单位换算器", desc: "长度、重量、面积、体积、速度等全维度单位即时换算", href: "/tools/unit-converter/" },
                { title: "颜色转换器与调色板", desc: "HEX、RGB、HSL、HSV、CMYK 颜色代码相互转换", href: "/tools/color-converter/" }
              ]
            },
            fr: {
              aboutTitle: "À propos du Convertisseur CSV vers JSON",
              aboutDesc:
                "Convertissez instantanément vos fichiers CSV et données tabulaires issues d'Excel en JSON structuré prêt pour le web et les API. Prend en charge les délimiteurs personnalisés (virgule, point-virgule, tabulation, barre verticale), le formatage en tableau d'objets ou dictionnaire, et intègre un aperçu dynamique sous forme de tableur. Traitement 100% local dans votre navigateur.",
              howTitle: "Comment Convertir du CSV en JSON",
              steps: [
                "Collez votre texte CSV dans l'éditeur de gauche ou cliquez sur 'Upload .csv' pour importer un fichier.",
                "Définissez le délimiteur (virgule, point-virgule, tabulation) et précisez si la première ligne sert d'en-tête.",
                "Sélectionnez le format de sortie : 'Tableau d'objets' ou 'Objet indexé par la 1ère colonne'.",
                "Consultez le résultat JSON mis en forme ou basculez sur l'onglet 'Table' pour voir la grille de données.",
                "Cliquez sur 'Copy JSON' pour copier dans le presse-papiers ou sur 'Download .json' pour enregistrer le fichier."
              ],
              featuresTitle: "Fonctionnalités Clés",
              features: [
                { title: "Support Multi-Délimiteurs", desc: "Traite avec précision les virgules (,), points-virgules (;), tabulations TSV et barres (|)." },
                { title: "Aperçu en Tableau Interactif (Table View)", desc: "Examinez vos données dans un tableur virtuel ergonomique en parallèle du code JSON." },
                { title: "Structure en Tableau ou Objet Indexé", desc: "Exportez sous forme de liste standard [ { } ] ou de dictionnaire mappé { clé: { } }." },
                { title: "Confidentialité 100% Côté Client", desc: "Vos fichiers d'entreprise et données clients ne quittent jamais votre machine." }
              ],
              useCasesTitle: "Cas d'Utilisation Fréquents",
              useCases: [
                { title: "Génération de Mock Data pour le Web", desc: "Transformez des feuilles Excel en fixtures JSON pour les tests de composants React/Vue." },
                { title: "Importation NoSQL (MongoDB)", desc: "Convertissez des exports CSV en collections prêtes pour mongoimport." },
                { title: "Construction de Payloads d'API REST", desc: "Formatez des lots d'enregistrements pour vos tests d'API dans Postman." },
                { title: "Exploitation de Données Publiques Ouvertes (Open Data)", desc: "Intégrez des jeux de données statistiques CSV dans vos applications web." }
              ],
              proTipsTitle: "Conseils d'Experts sur le CSV",
              proTips: [
                "Les cellules contenant des virgules (ex. \"Paris, France\") doivent être entourées de guillemets doubles.",
                "Les exports Excel en français utilisent fréquemment le point-virgule (;) car la virgule sert de séparateur décimal.",
                "Les fichiers de plusieurs mégaoctets sont traités avec fluidité par la mémoire de votre navigateur.",
                "Si vos données brutes n'ont pas d'en-tête, décochez la case pour générer automatiquement column_1, column_2."
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Mes fichiers CSV sont-ils envoyés sur un serveur distant ?", a: "Non. Toute l'analyse et la conversion s'exécutent localement dans votre navigateur." },
                { q: "Les fichiers TSV avec séparateur tabulation sont-ils acceptés ?", a: "Oui, choisissez simplement 'Tab (\\t)' dans le menu déroulant du délimiteur." },
                { q: "Les accents français et caractères spéciaux sont-ils préservés ?", a: "Oui, le parseur respecte la norme UTF-8 et préserve tous les caractères Unicode." },
                { q: "Peut-on régler l'indentation du JSON ?", a: "Oui, vous pouvez choisir entre 2 espaces, 4 espaces ou une compression compacte (Minify)." },
                { q: "Y a-t-il une limite de lignes ?", a: "Vous pouvez convertir des dizaines de milliers de lignes sans aucune restriction." },
                { q: "L'outil est-il gratuit ?", a: "Oui, 100% gratuit et sans limite." }
              ],
              relatedTools: [
                { title: "Formateur & Validateur JSON", desc: "Mise en page, compression et validation de JSON", href: "/tools/json-formatter/" },
                { title: "Encodeur / Décodeur Base64", desc: "Convertissez textes et fichiers au format Base64", href: "/tools/base64/" },
                { title: "Convertisseur d'Unités", desc: "Convertissez longueur, poids, température, surface et volume", href: "/tools/unit-converter/" },
                { title: "Convertisseur de Couleurs & Palette", desc: "Convertissez entre HEX, RGB, HSL, HSV et CMYK", href: "/tools/color-converter/" }
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
        @media (max-width: 900px) {
          .csv-grid { grid-template-columns: 1fr !important; }
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
