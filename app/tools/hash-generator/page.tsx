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
  const { t } = useLocale();

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

        {/* ── Unified Tool Guide & FAQ Section ───────────── */}
        <ToolGuide
          badgeText="100% Client-side Processing"
          aboutTitle={t("hashGen.guide.aboutTitle") || "해시 생성기 도구란 무엇인가요?"}
          aboutDesc={t("hashGen.guide.aboutDesc") || "웹 브라우저의 Web Crypto API를 사용하여 텍스트나 파일의 단방향 암호화 해시(MD5, SHA-1, SHA-256, SHA-512)를 100% 로컬로 실시간 계산해 주는 유틸리티입니다."}
          howTitle={t("hashGen.guide.howTitle") || "사용 방법"}
          steps={[
            t("hashGen.guide.step1") || "텍스트를 입력창에 입력하거나 분석하고 싶은 파일(.txt, .png, .pdf 등)을 드래그하여 업로드합니다.",
            t("hashGen.guide.step2") || "MD5, SHA-1, SHA-256, SHA-512 해시 값이 실시간으로 계산되는 것을 확인합니다.",
            t("hashGen.guide.step3") || "원하는 해시 값 옆의 '복사' 버튼 또는 '전체 복사'를 눌러 해시 결과를 클립보드에 저장합니다.",
          ]}
          faqs={[
            { q: t("hashGen.guide.faq1Q") || "입력한 데이터나 파일이 서버에 업로드되나요?", a: t("hashGen.guide.faq1A") || "아닙니다. 브라우저의 Web Crypto API를 활용해 100% 로컬에서 암호화 해시가 계산되므로 절대 외부로 유출되지 않습니다." },
            { q: t("hashGen.guide.faq2Q") || "해시 알고리즘 간의 주요 차이점은 무엇인가요?", a: t("hashGen.guide.faq2A") || "해시의 길이와 무결성 검증 수준이 다릅니다. 보안 목적으로는 SHA-256 이상의 최신 표준 알고리즘 사용을 권장합니다." },
            { q: t("hashGen.guide.faq3Q") || "대용량 파일의 체크섬도 계산 가능한가요?", a: t("hashGen.guide.faq3A") || "네, 사용자 PC 메모리가 허용하는 한 수백 MB 크기의 파일도 서버 전송 없이 빠르게 해시 값을 추출합니다." },
          ]}
        />
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
