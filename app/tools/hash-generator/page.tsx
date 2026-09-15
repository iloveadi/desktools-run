"use client";

/**
 * app/tools/hash-generator/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Cryptographic Hash Generator & File Checksum Tool
 */

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Hash,
  ArrowLeft,
  Copy,
  Check,
  Upload,
  Trash2,
  Lock,
  FileCode,
  Layers,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { useLocale } from "@/lib/context/LocaleContext";

// ── Pure JS Compact MD5 Implementation ─────────────────────────
function md5(bytes: Uint8Array): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRol(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const nblocks = ((bytes.length + 8) >> 6) + 1;
  const blocks = new Int32Array(nblocks * 16);
  for (let i = 0; i < bytes.length; i++) {
    blocks[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  blocks[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
  blocks[nblocks * 16 - 2] = bytes.length * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < blocks.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, blocks[i + 0], 7, -680876936);
    d = md5ff(d, a, b, c, blocks[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, blocks[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, blocks[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, blocks[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, blocks[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, blocks[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, blocks[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, blocks[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, blocks[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, blocks[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, blocks[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, blocks[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, blocks[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, blocks[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, blocks[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, blocks[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, blocks[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, blocks[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, blocks[i + 0], 20, -373897302);
    a = md5gg(a, b, c, d, blocks[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, blocks[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, blocks[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, blocks[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, blocks[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, blocks[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, blocks[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, blocks[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, blocks[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, blocks[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, blocks[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, blocks[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, blocks[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, blocks[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, blocks[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, blocks[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, blocks[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, blocks[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, blocks[i + 7], 16, -1554976322);
    b = md5hh(b, c, d, a, blocks[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, blocks[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, blocks[i + 0], 11, -358537222);
    c = md5hh(c, d, a, b, blocks[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, blocks[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, blocks[i + 9], 4, -640364409);
    d = md5hh(d, a, b, c, blocks[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, blocks[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, blocks[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, blocks[i + 0], 6, -198630844);
    d = md5ii(d, a, b, c, blocks[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, blocks[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, blocks[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, blocks[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, blocks[i + 3], 10, -1894980168);
    c = md5ii(c, d, a, b, blocks[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, blocks[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, blocks[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, blocks[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, blocks[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, blocks[i + 1], 21, 1309151649);
    a = md5ii(a, b, c, d, blocks[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, blocks[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, blocks[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, blocks[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const hexTab = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 4; i++) {
    const val = [a, b, c, d][i];
    for (let j = 0; j < 4; j++) {
      out += hexTab.charAt((val >> (j * 8 + 4)) & 0x0f) + hexTab.charAt((val >> (j * 8)) & 0x0f);
    }
  }
  return out;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

export default function HashGeneratorPage() {
  const { locale, t } = useLocale();

  const [inputText, setInputText] = useState("Hello desktools.run");
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [isUppercase, setIsUppercase] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hashes, setHashes] = useState<{
    md5: string;
    sha1: string;
    sha256: string;
    sha384: string;
    sha512: string;
  }>({
    md5: "",
    sha1: "",
    sha256: "",
    sha384: "",
    sha512: "",
  });

  const computeHashesForBuffer = useCallback(async (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    const md5Hex = md5(bytes);

    let sha1Hex = "";
    let sha256Hex = "";
    let sha384Hex = "";
    let sha512Hex = "";

    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      try {
        const [sha1Buf, sha256Buf, sha384Buf, sha512Buf] = await Promise.all([
          window.crypto.subtle.digest("SHA-1", buffer),
          window.crypto.subtle.digest("SHA-256", buffer),
          window.crypto.subtle.digest("SHA-384", buffer),
          window.crypto.subtle.digest("SHA-512", buffer),
        ]);
        sha1Hex = bufferToHex(sha1Buf);
        sha256Hex = bufferToHex(sha256Buf);
        sha384Hex = bufferToHex(sha384Buf);
        sha512Hex = bufferToHex(sha512Buf);
      } catch (err) {
        console.error("WebCrypto error:", err);
      }
    }

    setHashes({
      md5: md5Hex,
      sha1: sha1Hex,
      sha256: sha256Hex,
      sha384: sha384Hex,
      sha512: sha512Hex,
    });
  }, []);

  useEffect(() => {
    if (fileInfo) return;
    const encoder = new TextEncoder();
    const buffer = encoder.encode(inputText).buffer;
    computeHashesForBuffer(buffer);
  }, [inputText, fileInfo, computeHashesForBuffer]);

  const handleFileProcess = useCallback(
    (file: File) => {
      setFileInfo({ name: file.name, size: file.size });
      const reader = new FileReader();
      reader.onload = (evt) => {
        const buffer = evt.target?.result as ArrayBuffer;
        if (buffer) {
          computeHashesForBuffer(buffer);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [computeHashesForBuffer]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleClear = () => {
    setInputText("");
    setFileInfo(null);
  };

  const handleCopy = (key: string, val: string) => {
    const outputVal = isUppercase ? val.toUpperCase() : val.toLowerCase();
    navigator.clipboard.writeText(outputVal);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    const text = `MD5: ${isUppercase ? hashes.md5.toUpperCase() : hashes.md5}
SHA-1: ${isUppercase ? hashes.sha1.toUpperCase() : hashes.sha1}
SHA-256: ${isUppercase ? hashes.sha256.toUpperCase() : hashes.sha256}
SHA-384: ${isUppercase ? hashes.sha384.toUpperCase() : hashes.sha384}
SHA-512: ${isUppercase ? hashes.sha512.toUpperCase() : hashes.sha512}`;

    navigator.clipboard.writeText(text);
    setCopiedKey("ALL");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      <ToolUsageTracker toolId="hash-generator" />
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
                  className="icon-developer"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Hash size={20} />
                </div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "var(--text-primary)",
                  }}
                >
                  {t("hashGen.title")}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "640px" }}>
                {t("hashGen.subtitle")}
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
              <Lock size={12} style={{ color: "#34d399" }} />
              Web Crypto API (`subtle.digest`)
            </div>
          </div>
        </section>

        {/* ── Main Tool Workspace ───────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {/* ── Input Box & Controls ────────────────────── */}
          <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <label style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                Input Text or File
              </label>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={() => setIsUppercase((prev) => !prev)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: isUppercase ? "rgba(99,102,241,0.2)" : "var(--btn-secondary-bg)",
                    border: isUppercase ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--btn-secondary-border)",
                    color: isUppercase ? "#a5b4fc" : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {isUppercase ? t("hashGen.uppercaseHex") : t("hashGen.lowercaseHex")}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileProcess(f);
                  }}
                  style={{ display: "none" }}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    background: "var(--btn-secondary-bg)",
                    border: "1px solid var(--btn-secondary-border)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Upload size={13} />
                  Import File
                </button>

                <button
                  onClick={handleClear}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#f87171",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Trash2 size={13} />
                  {t("hashGen.clear")}
                </button>
              </div>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{ position: "relative" }}
            >
              {fileInfo ? (
                <div
                  style={{
                    padding: "24px",
                    borderRadius: "12px",
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <FileCode size={32} style={{ color: "#818cf8" }} />
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {fileInfo.name}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {(fileInfo.size / 1024).toFixed(1)} KB — {t("hashGen.fileLoaded")}
                    </div>
                  </div>
                  <button
                    onClick={() => setFileInfo(null)}
                    style={{
                      marginLeft: "auto",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      background: "var(--btn-secondary-bg)",
                      border: "1px solid var(--btn-secondary-border)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    Switch to Text Input
                  </button>
                </div>
              ) : (
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t("hashGen.inputPlaceholder")}
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "var(--input-bg)",
                    border: isDragging ? "2px dashed #6366f1" : "1px solid var(--input-border)",
                    color: "var(--text-primary)",
                    fontSize: "14.5px",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.6,
                    outline: "none",
                    resize: "vertical",
                  }}
                  aria-label="Text to hash input"
                />
              )}

              {isDragging && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "12px",
                    background: "rgba(99,102,241,0.15)",
                    backdropFilter: "blur(4px)",
                    border: "2px dashed #6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "#a5b4fc",
                    fontWeight: 600,
                    pointerEvents: "none",
                  }}
                >
                  <Upload size={24} />
                  <span>{t("hashGen.dropPrompt")}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Hash Results Cards Grid ─────────────────── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={16} style={{ color: "#6366f1" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                Calculated Cryptographic Hashes
              </h3>
            </div>

            <button
              onClick={handleCopyAll}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                background: copiedKey === "ALL" ? "rgba(34,211,168,0.2)" : "rgba(99,102,241,0.15)",
                border: copiedKey === "ALL" ? "1px solid rgba(34,211,168,0.4)" : "1px solid rgba(99,102,241,0.3)",
                color: copiedKey === "ALL" ? "#34d399" : "#a5b4fc",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              {copiedKey === "ALL" ? <Check size={14} /> : <Copy size={14} />}
              {copiedKey === "ALL" ? t("hashGen.copied") : t("hashGen.copyAll")}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "40px" }}>
            {[
              { key: "md5", title: "MD5", bits: "128 bits", value: hashes.md5, color: "#f87171" },
              { key: "sha1", title: "SHA-1", bits: "160 bits", value: hashes.sha1, color: "#fbbf24" },
              { key: "sha256", title: "SHA-256", bits: "256 bits (Recommended)", value: hashes.sha256, color: "#34d399" },
              { key: "sha384", title: "SHA-384", bits: "384 bits", value: hashes.sha384, color: "#60a5fa" },
              { key: "sha512", title: "SHA-512", bits: "512 bits", value: hashes.sha512, color: "#a855f7" },
            ].map(({ key, title, bits, value, color }) => {
              const displayVal = isUppercase ? value.toUpperCase() : value.toLowerCase();
              return (
                <div
                  key={key}
                  className="glass-card"
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                        {title}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "100px",
                          background: `${color}20`,
                          color,
                          border: `1px solid ${color}40`,
                        }}
                      >
                        {bits}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(key, value)}
                      disabled={!value}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: copiedKey === key ? "rgba(34,211,168,0.2)" : "var(--btn-secondary-bg)",
                        border: copiedKey === key ? "1px solid rgba(34,211,168,0.4)" : "1px solid var(--btn-secondary-border)",
                        color: copiedKey === key ? "#34d399" : "var(--text-secondary)",
                        cursor: value ? "pointer" : "not-allowed",
                        opacity: value ? 1 : 0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {copiedKey === key ? <Check size={13} /> : <Copy size={13} />}
                      {copiedKey === key ? t("hashGen.copied") : t("hashGen.copy")}
                    </button>
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: displayVal ? "var(--text-primary)" : "var(--text-muted)",
                      wordBreak: "break-all",
                      background: "rgba(0,0,0,0.15)",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {displayVal || "Calculating..."}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
        {(() => {
          const content = {
            ko: {
              aboutTitle: "암호학적 해시 생성기 및 파일 체크섬 검증 도구 소개",
              aboutDesc:
                "텍스트와 파일의 무결성을 검증하고 고유한 지문을 추출하는 전문 암호학적 해시 도구입니다. 브라우저의 표준 WebCrypto API와 고속 해시 알고리즘을 결합하여 MD5(128-bit), SHA-1(160-bit), SHA-256(256-bit), SHA-384, SHA-512 해시값을 100% 브라우저 로컬에서 실시간으로 계산합니다.",
              howTitle: "해시 생성기 및 체크섬 검증 방법",
              steps: [
                "입력창에 텍스트를 타이핑하거나 검증할 파일(.zip, .iso, .exe, .pdf 등)을 드래그 앤 드롭으로 업로드합니다.",
                "MD5, SHA-1, SHA-256, SHA-384, SHA-512 해시 값이 실시간으로 계산되는 것을 확인합니다.",
                "우측 상단의 대문자/소문자(Uppercase / Lowercase) 토글 버튼으로 16진수 포맷을 선택합니다.",
                "필요한 해시 포맷 옆의 '복사' 버튼 또는 상단의 '전체 복사'를 눌러 클립보드에 저장합니다.",
                "다운로드 사이트에서 제공하는 공식 체크섬 값과 비교하여 파일 변조 및 전송 오류 여부를 확인합니다.",
              ],
              featuresTitle: "핵심 기능 및 특징",
              features: [
                { title: "5대 표준 해시 동시 계산 (MD5 ~ SHA-512)", desc: "레거시 체크섬용 MD5부터 최신 블록체인 및 보안 표준인 SHA-256, SHA-512까지 한 번에 산출합니다." },
                { title: "로컬 대용량 파일 체크섬 지원", desc: "파일이 서버로 업로드되지 않고 브라우저 FileReader 메모리에서 즉시 바이너리 해시를 처리합니다." },
                { title: "대소문자 16진수 원클릭 토글", desc: "개발 환경 및 시스템 표준에 맞춰 소문자(a-f) 및 대문자(A-F) Hex 코드로 손쉽게 전환합니다." },
                { title: "전체 결과 일괄 복사 (Copy All)", desc: "5종의 모든 해시 요약본을 깔끔한 텍스트 템플릿으로 클립보드에 한 번에 복사합니다." },
              ],
              useCasesTitle: "실무 활용 분야",
              useCases: [
                { title: "소프트웨어 설치 파일 다운로드 무결성 검증", desc: "공식 릴리즈 페이지의 SHA-256 해시와 다운로드한 .exe / .dmg 파일의 체크섬 일치 여부 확인" },
                { title: "비밀번호 단방향 해싱 및 데이터베이스 저장 테스트", desc: "사용자 패스워드를 SHA-256 등으로 해싱하여 DB 저장 규격 검증" },
                { title: "Git 커밋 및 블록체인 트랜잭션 해시 시뮬레이션", desc: "SHA-1 및 SHA-256 기반 머클 트리 및 블록 해시 계산 실습" },
                { title: "전자 문서 위변조 방지 지문(Fingerprint) 추출", desc: "계약서 및 중요 PDF 문서의 고유 해시값을 기록하여 원본 증명 데이터로 활용" },
              ],
              proTipsTitle: "해시 알고리즘 전문가 실무 팁",
              proTips: [
                "MD5와 SHA-1은 암호학적 충돌(Collision) 취약점이 발견되었으므로 신규 보안 시스템에는 반드시 SHA-256 이상을 사용하세요.",
                "해시 함수는 단방향(One-way)이므로 해시 문자열로부터 원본 텍스트를 수학적으로 되돌릴 수 없습니다.",
                "비밀번호 저장 시에는 단순 해싱 대신 Salt(솔트)와 PBKDF2/Argon2 등의 키 스트레칭 기법을 병행해야 안전합니다.",
                "파일의 내용이 단 1바이트만 달라져도 완전히 다른 해시값이 출력되는 눈태 현상(Avalanche Effect)이 발생합니다.",
              ],
              faqTitle: "자주 묻는 질문 (FAQ)",
              faqs: [
                { q: "입력한 텍스트나 업로드한 파일이 서버로 전송되나요?", a: "전혀 전송되지 않습니다! 모든 계산은 사용자의 브라우저 내에서 100% 로컬로 처리되므로 기밀 문서도 안전하게 검증할 수 있습니다." },
                { q: "MD5와 SHA-256의 차이점은 무엇인가요?", a: "MD5는 128비트 해시로 단순 파일 손상 확인에 쓰이며, SHA-256은 256비트 해시로 금융 및 암호화에 쓰이는 최신 표준입니다." },
                { q: "해시값에서 원본 데이터를 복호화할 수 있나요?", a: "불가능합니다. 해시는 복호화가 불가능한 단방향 수학 함수입니다." },
                { q: "대용량 파일의 체크섬도 계산할 수 있나요?", a: "네! 사용자 컴퓨터의 RAM과 브라우저가 허용하는 한 수백 MB 크기의 파일도 빠르게 검증할 수 있습니다." },
                { q: "대문자와 소문자 해시값은 서로 다른 데이터인가요?", a: "아닙니다. 데이터는 100% 동일하며 16진수 알파벳(A-F)을 표기하는 방식만 다릅니다." },
                { q: "완전 무료인가요?", a: "네, 로그인이나 횟수 제한 없이 100% 무료로 평생 이용하실 수 있습니다." },
              ],
              relatedTools: [
                { title: "AES 텍스트 암호화 / 복호화기", desc: "비밀번호를 설정하여 텍스트를 군사급 AES-256으로 양방향 암호화", href: "/tools/aes-encrypt/" },
                { title: "비밀번호 생성기", desc: "암호학적 난수 기반의 초강력 무작위 패스워드 생성", href: "/tools/password-generator/" },
                { title: "Base64 인코더 / 디코더", desc: "텍스트 및 바이너리 데이터를 Base64 형식으로 변환", href: "/tools/base64/" },
                { title: "텍스트 Diff 비교기", desc: "두 텍스트나 코드의 줄 단위 변경 사항을 실시간 비교", href: "/tools/text-diff/" },
              ],
            },
            en: {
              aboutTitle: "About Cryptographic Hash Generator & File Checksum",
              aboutDesc:
                "A client-side cryptographic hashing suite for calculating MD5 (128-bit), SHA-1 (160-bit), SHA-256 (256-bit), SHA-384, and SHA-512 hashes from plaintext or uploaded files. Powered by the native W3C Web Cryptography API (crypto.subtle.digest) to verify data integrity and checksums with zero server uploads.",
              howTitle: "How to Generate Hashes & Verify Checksums",
              steps: [
                "Type or paste your text into the input box, or drag and drop any file (.zip, .iso, .exe, .pdf).",
                "Observe instantaneous calculation of MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes.",
                "Toggle between lowercase and uppercase hexadecimal formatting using the top-right button.",
                "Click 'Copy' next to any hash algorithm, or use 'Copy All' to grab the complete checksum manifest.",
                "Compare the computed SHA-256 hash against official vendor checksums to confirm file authenticity.",
              ],
              featuresTitle: "Key Features & Capabilities",
              features: [
                { title: "5-Way Simultaneous Hash Generation", desc: "Generates MD5, SHA-1, SHA-256, SHA-384, and SHA-512 concurrently in milliseconds." },
                { title: "Local Binary File Checksum Verification", desc: "Processes local files directly in browser memory via FileReader with zero bandwidth consumption." },
                { title: "Uppercase / Lowercase Hex Toggle", desc: "Instantly switches hex representation (a-f vs A-F) to match target system requirements." },
                { title: "One-Click 'Copy All' Manifest", desc: "Copies a formatted digest of all computed hashes for convenient documentation and auditing." },
              ],
              useCasesTitle: "Common Use Cases",
              useCases: [
                { title: "Software Download Integrity Audits", desc: "Validate that downloaded binaries (.exe, .dmg, .tar.gz) match vendor SHA-256 checksums." },
                { title: "Password Hashing & Storage Prototyping", desc: "Verify SHA-256 password hash lengths and formatting for database schemas." },
                { title: "Digital Forensic & Document Fingerprinting", desc: "Create immutable cryptographic fingerprints for legal agreements and sensitive documents." },
                { title: "Git & Blockchain Hash Simulation", desc: "Analyze Merkle tree node calculations and SHA-256 block hash generation." },
              ],
              proTipsTitle: "Professional Cryptographic Tips",
              proTips: [
                "MD5 and SHA-1 have known collision vulnerabilities; always use SHA-256 or SHA-512 for security-critical applications.",
                "Cryptographic hashes are one-way functions; it is mathematically impossible to reverse a hash back to its source text.",
                "Changing a single character produces a completely distinct hash due to the cryptographic avalanche effect.",
                "For password storage, always combine hashing with unique cryptographic salts (Salt) and key stretching (PBKDF2/Argon2).",
              ],
              faqTitle: "Frequently Asked Questions",
              faqs: [
                { q: "Is my text or file uploaded to any server?", a: "Never! All hashing executes 100% locally in your browser memory via the Web Crypto API." },
                { q: "What is the difference between MD5 and SHA-256?", a: "MD5 produces 128-bit hashes suitable for simple checksums, whereas SHA-256 produces 256-bit collision-resistant hashes for secure authentication." },
                { q: "Can I reverse or decrypt a hash?", a: "No. Cryptographic hashes are one-way mathematical functions designed to be irreversible." },
                { q: "Can I hash large files?", a: "Yes, files of several hundred megabytes can be hashed locally depending on your available device RAM." },
                { q: "Are uppercase and lowercase hashes identical?", a: "Yes, the underlying binary data is identical; only the hexadecimal character case differs." },
                { q: "Is this tool completely free?", a: "Yes, 100% free with unlimited usage." },
              ],
              relatedTools: [
                { title: "AES Text Encryptor", desc: "Encrypt text and notes with military-grade AES-256 WebCrypto", href: "/tools/aes-encrypt/" },
                { title: "Password Generator", desc: "Generate cryptographically secure high-entropy random passwords", href: "/tools/password-generator/" },
                { title: "Base64 Encoder / Decoder", desc: "Convert text and binary data into safe Base64 strings", href: "/tools/base64/" },
                { title: "Text Diff Checker", desc: "Compare text and code line-by-line in real-time", href: "/tools/text-diff/" },
              ],
            },
            ja: {
              aboutTitle: "暗号ハッシュ生成器＆ファイルチェックサム検証について",
              aboutDesc:
                "テキストやファイルの整合性を検証し、固有のデジタル指紋を算出する暗号ハッシュ計算ツールです。ブラウザ標準の WebCrypto API（crypto.subtle.digest）を活用し、MD5（128-bit）、SHA-1（160-bit）、SHA-256（256-bit）、SHA-384、SHA-512 の各ハッシュ値を 100% ローカルで瞬時に計算します。",
              howTitle: "ハッシュ値の計算とチェックサム検証方法",
              steps: [
                "入力欄にテキストを入力するか、検証したいファイル（.zip, .exe, .iso 等）をドラッグ＆ドロップします。",
                "MD5、SHA-1、SHA-256、SHA-384、SHA-512 のハッシュ値がリアルタイムに算出されます。",
                "右上のトグルボタンで大文字（Uppercase）と小文字（Lowercase）の表記を切り替えます。",
                "必要なハッシュ値の「コピー」ボタンまたは「すべてコピー」をクリックします。",
                "配布元が公開している公式ハッシュ値と比較して、改ざんや破損がないか確認します。",
              ],
              featuresTitle: "主な機能と特徴",
              features: [
                { title: "5大ハッシュ規格を同時計算 (MD5〜SHA-512)", desc: "軽量チェックサム用 MD5 から最新セキュリティ基準の SHA-256 / SHA-512 まで一括出力します。" },
                { title: "ローカルファイルチェックサム対応", desc: "ファイルをサーバーに送信せず、ブラウザのメモリ内で安全かつ高速にバイナリハッシュを計算します。" },
                { title: "大文字・小文字 Hex ワンクリック切替", desc: "システム仕様に合わせて 16 進数表記（a-f / A-F）を即座に変換できます。" },
                { title: "全ハッシュの一括コピー (Copy All)", desc: "算出したすべてのハッシュ値をまとめたレポート形式でクリップボードに保存します。" },
              ],
              useCasesTitle: "実務での主な活用シーン",
              useCases: [
                { title: "ダウンロードファイルの整合性検証", desc: "公式サイトの SHA-256 ハッシュとダウンロードした実行ファイルのチェックサムを突合" },
                { title: "パスワード保存のハッシュ化テスト", desc: "SHA-256 による文字列ハッシュ長やフォーマットの事前検証" },
                { title: "契約書・電子文書の改ざん防止フィンガープリント", desc: "重要 PDF のハッシュ値を記録し、オリジナル文書の同一性を証明" },
                { title: "Git やブロックチェーンのハッシュ構造解析", desc: "SHA-1 / SHA-256 に基づくデータブロックのハッシュ生成シミュレーション" },
              ],
              proTipsTitle: "ハッシュアルゴリズムのプロの知識",
              proTips: [
                "MD5 および SHA-1 は衝突耐性に脆弱性が確認されているため、セキュリティ用途には SHA-256 以上を使用してください。",
                "ハッシュ関数は不可逆な単方向関数であるため、ハッシュ値から元の平文を復元することは不可能です。",
                "1文字でもデータが異なると全く別のハッシュ値が出力される「雪崩効果（Avalanche Effect）」が発生します。",
                "パスワードの保存には、単純なハッシュ化だけでなくソルト（Salt）とストレッチング（PBKDF2 等）を併用してください。",
              ],
              faqTitle: "よくある質問 (FAQ)",
              faqs: [
                { q: "入力テキストやファイルがサーバーに送信されますか？", a: "一切送信されません。すべての計算はお手元のブラウザ内（Web Crypto API）で完結します。" },
                { q: "MD5 と SHA-256 の違いは何ですか？", a: "MD5 は 128bit の軽量ハッシュで破損チェック向け、SHA-256 は 256bit の耐衝突性を備えた現代の安全基準です。" },
                { q: "ハッシュ値から元のデータを復元できますか？", a: "できません。ハッシュ関数は不可逆な数学アルゴリズムです。" },
                { q: "大容量ファイルのチェックサムも計算できますか？", a: "はい、端末のメモリが許す限り数百 MB のファイルも安全にローカル計算できます。" },
                { q: "大文字と小文字のハッシュ値は異なるデータですか？", a: "同じデータです。16進数のアルファベット表記のみが異なります。" },
                { q: "完全無料で利用できますか？", a: "はい、回数制限なしで完全無料にてご利用いただけます。" },
              ],
              relatedTools: [
                { title: "AES テキスト暗号化 / 復号化", desc: "軍用規格 AES-256 で機密テキストを安全に暗号化", href: "/tools/aes-encrypt/" },
                { title: "パスワード生成器", desc: "暗号論的乱数による強力なランダムパスワードを生成", href: "/tools/password-generator/" },
                { title: "Base64 変換ツール", desc: "テキストやバイナリデータを Base64 形式に相互変換", href: "/tools/base64/" },
                { title: "テキスト Diff 比較ツール", desc: "2つのテキストの差異をリアルタイムに行単位比較", href: "/tools/text-diff/" },
              ],
            },
            es: {
              aboutTitle: "Acerca del Generador de Hashes Criptográficos",
              aboutDesc:
                "Herramienta criptográfica en el navegador para calcular hashes MD5 (128-bit), SHA-1 (160-bit), SHA-256 (256-bit), SHA-384 y SHA-512 a partir de texto o archivos locales. Utiliza la Web Cryptography API nativa del navegador para verificar la integridad y sumas de verificación (checksum) sin enviar datos a ningún servidor.",
              howTitle: "Cómo generar hashes y verificar checksums",
              steps: [
                "Escribe o pega texto en el cuadro de entrada, o arrastra y suelta cualquier archivo (.zip, .iso, .exe, .pdf).",
                "Observa el cálculo simultáneo e instantáneo de los hashes MD5, SHA-1, SHA-256, SHA-384 y SHA-512.",
                "Alterna entre mayúsculas y minúsculas hexadecimales con el botón superior.",
                "Haz clic en 'Copiar' junto a cualquier hash, o en 'Copiar todo' para el informe completo.",
                "Compara el hash SHA-256 con el checksum oficial del proveedor para verificar la autenticidad del archivo.",
              ],
              featuresTitle: "Características principales",
              features: [
                { title: "Cálculo simultáneo de 5 algoritmos", desc: "Genera MD5, SHA-1, SHA-256, SHA-384 y SHA-512 en milisegundos." },
                { title: "Verificación de archivos locales", desc: "Procesa archivos binarios directamente en memoria sin consumir ancho de banda." },
                { title: "Selector Mayúsculas / Minúsculas", desc: "Cambia la notación hexadecimal (a-f vs A-F) según tus requisitos de desarrollo." },
                { title: "Copia completa con un solo clic", desc: "Exporta un resumen ordenado de todos los hashes para auditorías y documentación." },
              ],
              useCasesTitle: "Casos de uso frecuentes",
              useCases: [
                { title: "Auditoría de integridad de descargas", desc: "Confirma que los instaladores descargados coincidan con el hash SHA-256 oficial." },
                { title: "Pruebas de hash de contraseñas", desc: "Comprueba longitudes de hash y salidas para esquemas de bases de datos." },
                { title: "Huella digital de documentos legales", desc: "Genera identificadores inmutables para certificar la autenticidad de archivos PDF." },
                { title: "Simulación de cadenas de bloques y Git", desc: "Analiza el funcionamiento de árboles Merkle y bloques basados en SHA-256." },
              ],
              proTipsTitle: "Consejos profesionales de criptografía",
              proTips: [
                "MD5 y SHA-1 presentan vulnerabilidades de colisión; usa siempre SHA-256 o SHA-512 para seguridad crítica.",
                "Los hashes son funciones unidireccionales; es matemáticamente imposible recuperar el texto original a partir del hash.",
                "Cualquier cambio mínimo en el texto modifica por completo el hash resultante debido al efecto avalancha.",
                "Para guardar contraseñas, combina siempre el hash con una sal (Salt) y derivación de clave (PBKDF2/Argon2).",
              ],
              faqTitle: "Preguntas frecuentes (FAQ)",
              faqs: [
                { q: "¿Se suben mis textos o archivos al servidor?", a: "¡No! Todo el procesamiento se realiza 100% localmente en tu navegador mediante Web Crypto API." },
                { q: "¿Cuál es la diferencia entre MD5 y SHA-256?", a: "MD5 genera hashes de 128 bits para comprobaciones simples, mientras que SHA-256 ofrece 256 bits resistentes a colisiones." },
                { q: "¿Puedo descifrar un hash para ver el texto original?", a: "No. Los hashes criptográficos son matemáticamente irreversibles." },
                { q: "¿Puedo calcular el checksum de archivos grandes?", a: "Sí, puedes procesar archivos de cientos de megabytes en función de la memoria RAM de tu equipo." },
                { q: "¿Son diferentes los hashes en mayúsculas y minúsculas?", a: "No, los datos binarios son idénticos; solo cambia la representación tipográfica." },
                { q: "¿Es completamente gratuito?", a: "Sí, 100% gratuito e ilimitado." },
              ],
              relatedTools: [
                { title: "Cifrado AES de Texto", desc: "Cifra textos y notas confidenciales con AES-256", href: "/tools/aes-encrypt/" },
                { title: "Generador de Contraseñas", desc: "Crea contraseñas robustas y aleatorias al instante", href: "/tools/password-generator/" },
                { title: "Codificador Base64", desc: "Convierte texto y binarios a formato Base64", href: "/tools/base64/" },
                { title: "Comparador de Texto Diff", desc: "Compara diferencias entre dos textos línea por línea", href: "/tools/text-diff/" },
              ],
            },
            zh: {
              aboutTitle: "密码学哈希生成器与文件校验和工具介绍",
              aboutDesc:
                "用于验证数据完整性并提取数字指纹的专业密码学哈希在线工具。利用浏览器原生 W3C Web Cryptography API（crypto.subtle.digest）与极速算法引擎，实时在本地计算 MD5 (128-bit)、SHA-1 (160-bit)、SHA-256 (256-bit)、SHA-384 及 SHA-512 哈希值，无任何数据上传风险。",
              howTitle: "哈希计算与文件 Checksum 校验步骤",
              steps: [
                "在输入框中输入待计算文本，或直接拖拽任意文件（.zip、.exe、.iso、.pdf 等）进行解析。",
                "系统将实时并发计算出 MD5、SHA-1、SHA-256、SHA-384、SHA-512 的哈希值。",
                "点击右上角的“大写/小写十六进制”切换按钮调整显示格式。",
                "点击各哈希栏右侧的“复制”按钮，或点击“复制全部”获取完整的校验清单。",
                "将计算得到的 SHA-256 哈希与官方发布的 Checksum 比对，确认文件是否遭到篡改或损坏。",
              ],
              featuresTitle: "核心功能与特性",
              features: [
                { title: "5大主流哈希算法并发计算", desc: "一次性输出从文件校验常用的 MD5 到高安全标准的 SHA-256、SHA-512。" },
                { title: "本地大文件 Checksum 零流量校验", desc: "基于浏览器 FileReader 内存直接计算二进制哈希，无需耗费上传带宽。" },
                { title: "大小写 Hex 自由切换", desc: "一键在小写 (a-f) 与大写 (A-F) 之间切换，完美匹配开发与系统规范。" },
                { title: "一键复制全部摘要清单 (Copy All)", desc: "自动排版 5 种算法的哈希结果并一键存入剪贴板，方便归档与审计。" },
              ],
              useCasesTitle: "常见应用场景",
              useCases: [
                { title: "软件安装包完整性比对", desc: "验证下载的 .exe / .dmg / .zip 文件哈希值与官方发布的 SHA-256 是否完全一致" },
                { title: "密码哈希存储与格式验证", desc: "验证用户密码在 SHA-256 单向哈希后的输出长度与数据库存储格式" },
                { title: "电子合同与机密文档防篡改指纹", desc: "计算并记录 PDF 合同的哈希值以作为不可篡改的原创性证明" },
                { title: "Git 与区块链哈希原理模拟", desc: "分析 Merkle 树节点计算与基于 SHA-256 的区块链区块哈希生成机制" },
              ],
              proTipsTitle: "密码学专家实用建议",
              proTips: [
                "MD5 与 SHA-1 已被证实存在碰撞漏洞，在新系统的安全认证场景中务必使用 SHA-256 或 SHA-512。",
                "哈希函数为单向不可逆数学算法，在数学上无法通过哈希值反推还原原始明文。",
                "原始数据发生即使 1 个字节的变动，也会触发“雪崩效应 (Avalanche Effect)”导致哈希值发生天翻地覆的变化。",
                "存储密码时，除了哈希运算外还必须配合加盐 (Salt) 及密钥派生拉伸算法 (PBKDF2 / Argon2)。",
              ],
              faqTitle: "常见问题解答 (FAQ)",
              faqs: [
                { q: "我输入的文字或上传的文件会被传到服务器吗？", a: "绝对不会！所有哈希计算均在您本地浏览器的 WebCrypto 引擎中 100% 独立完成。" },
                { q: "MD5 与 SHA-256 有何区别？", a: "MD5 为 128 位哈希，主要用于普通文件的损坏校验；SHA-256 为 256 位哈希，具有极强的抗碰撞性，是现代安全标准。" },
                { q: "能否将哈希值反向解密出原始明文？", a: "不能。密码学哈希属于单向函数，不可逆向破解。" },
                { q: "可以计算超大文件的 Checksum 吗？", a: "可以！在您设备内存允许的前提下，数百兆的文件均可秒速完成本地计算。" },
                { q: "大写和小写哈希值代表的数据一样吗？", a: "完全一样。只是十六进制字符 (A-F 与 a-f) 的大小写显示不同。" },
                { q: "完全免费吗？", a: "是的，永久 100% 免费且无任何限制。" },
              ],
              relatedTools: [
                { title: "AES 文本加密与解密", desc: "使用 AES-256 军工级标准对文本进行对称加密", href: "/tools/aes-encrypt/" },
                { title: "强密码生成器", desc: "基于密码学随机数生成高强度安全密码", href: "/tools/password-generator/" },
                { title: "Base64 编码与解码", desc: "文本与二进制数据的 Base64 双向编码转换", href: "/tools/base64/" },
                { title: "文本差异对比工具", desc: "逐行实时对比两段文本或代码的变动细节", href: "/tools/text-diff/" },
              ],
            },
            fr: {
              aboutTitle: "À propos du Générateur de Hashes et Checksum",
              aboutDesc:
                "Suite cryptographique côté client pour calculer les empreintes MD5 (128-bit), SHA-1 (160-bit), SHA-256 (256-bit), SHA-384 et SHA-512 à partir de texte ou de fichiers. Alimenté par l'API native W3C Web Cryptography (crypto.subtle.digest) pour vérifier l'intégrité et les sommes de contrôle (checksum) sans aucun transfert vers des serveurs.",
              howTitle: "Comment générer des hashes et vérifier les checksums",
              steps: [
                "Saisissez votre texte dans le champ ou glissez-déposez un fichier (.zip, .iso, .exe, .pdf).",
                "Observez le calcul instantané des hashes MD5, SHA-1, SHA-256, SHA-384 et SHA-512.",
                "Basculez entre majuscules et minuscules hexadécimales via le bouton en haut à droite.",
                "Cliquez sur 'Copier' pour un hash particulier ou sur 'Copier tout' pour le manifeste complet.",
                "Comparez l'empreinte SHA-256 obtenue avec la valeur officielle pour valider l'intégrité du fichier.",
              ],
              featuresTitle: "Fonctionnalités clés",
              features: [
                { title: "Calcul simultané de 5 algorithmes", desc: "Génère MD5, SHA-1, SHA-256, SHA-384 et SHA-512 en quelques millisecondes." },
                { title: "Vérification locale de fichiers binaires", desc: "Traite les fichiers directement dans la mémoire de votre navigateur sans utiliser de bande passante." },
                { title: "Bascule Majuscules / Minuscules", desc: "Changez instantanément la casse hexadécimale (a-f vs A-F) selon vos besoins de développement." },
                { title: "Copie intégrale en un clic (Copy All)", desc: "Copie un rapport formaté de tous les hashes pour faciliter la documentation et l'audit." },
              ],
              useCasesTitle: "Cas d'utilisation courants",
              useCases: [
                { title: "Audit d'intégrité de logiciels téléchargés", desc: "Vérifiez que vos fichiers (.exe, .dmg) correspondent au hash SHA-256 officiel de l'éditeur." },
                { title: "Tests de hashage de mots de passe", desc: "Vérifiez la longueur et le format des hashes SHA-256 pour vos bases de données." },
                { title: "Empreintes numériques de documents légaux", desc: "Générez des identifiants immuables pour certifier l'authenticité de contrats PDF." },
                { title: "Simulation de blockchain et Git", desc: "Analysez le calcul des arbres de Merkle et des blocs basés sur SHA-256." },
              ],
              proTipsTitle: "Conseils d'experts en cryptographie",
              proTips: [
                "MD5 et SHA-1 comportent des vulnérabilités de collision ; utilisez toujours SHA-256 ou SHA-512 pour la sécurité.",
                "Les fonctions de hashage sont à sens unique ; il est mathématiquement impossible de retrouver le texte d'origine.",
                "Le moindre changement dans le texte produit une empreinte radicalement différente (effet avalanche).",
                "Pour stocker des mots de passe, combinez toujours le hash avec du sel (Salt) et un étirement de clé (PBKDF2).",
              ],
              faqTitle: "Foire Aux Questions (FAQ)",
              faqs: [
                { q: "Mes textes ou fichiers sont-ils envoyés sur un serveur ?", a: "Jamais ! Toutes les opérations s'exécutent 100% localement dans votre navigateur via l'API Web Crypto." },
                { q: "Quelle est la différence entre MD5 et SHA-256 ?", a: "MD5 génère des hashes de 128 bits pour des vérifications basiques, tandis que SHA-256 offre 256 bits sécurisés contre les collisions." },
                { q: "Puis-je inverser ou déchiffrer un hash ?", a: "Non. Les fonctions de hashage cryptographique sont mathématiquement irréversibles." },
                { q: "Puis-je calculer le checksum de gros fichiers ?", a: "Oui, des fichiers de plusieurs centaines de mégaoctets peuvent être traités localement." },
                { q: "Les hashes en majuscules et minuscules sont-ils identiques ?", a: "Oui, les données binaires sont strictement identiques ; seule la typographie change." },
                { q: "Est-ce totalement gratuit ?", a: "Oui, 100% gratuit et sans aucune limite." },
              ],
              relatedTools: [
                { title: "Chiffrement de Texte AES-256", desc: "Chiffrez vos textes sensibles avec la norme AES-256", href: "/tools/aes-encrypt/" },
                { title: "Générateur de Mots de Passe", desc: "Générez des mots de passe ultra-sécurisés et aléatoires", href: "/tools/password-generator/" },
                { title: "Convertisseur Base64", desc: "Encodez et décodez du texte et des données en Base64", href: "/tools/base64/" },
                { title: "Comparateur de Texte Diff", desc: "Comparez les différences ligne par ligne en temps réel", href: "/tools/text-diff/" },
              ],
            },
          };

          const g = content[locale as keyof typeof content] || content.ko;

          return (
            <ToolGuide
              badgeText="100% Client-side Processing"
              aboutTitle={g.aboutTitle}
              aboutDesc={g.aboutDesc}
              howTitle={g.howTitle}
              steps={g.steps}
              featuresTitle={g.featuresTitle}
              features={g.features}
              useCasesTitle={g.useCasesTitle}
              useCases={g.useCases}
              proTips={{
              title: g.proTipsTitle,
              tips: g.proTips,
            }}
              faqTitle={g.faqTitle}
              faqs={g.faqs}
              relatedTools={g.relatedTools}
            />
          );
        })()}
      </main>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .guide-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
