"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Lock,
  Unlock,
  KeyRound,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Sliders,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import ToolUsageTracker from "@/components/common/ToolUsageTracker";
import { useLocale } from "@/lib/context/LocaleContext";

type Mode = "encrypt" | "decrypt";
type Format = "base64" | "hex";
type Algorithm = "AES-GCM" | "AES-CBC";

const I18N = {
  ko: {
    back: "전체 도구 목록",
    title: "AES 텍스트 암호화 & 복호화기",
    badge: "100% 브라우저 WebCrypto",
    subtitle: "비밀번호(비밀키)를 설정하여 민감한 텍스트, 계좌번호, API 키를 AES-256 군사급 표준 암호문으로 안전하게 암호화하고 복호화합니다.",
    tabEncrypt: "🔒 텍스트 암호화 (Encrypt)",
    tabDecrypt: "🔓 암호문 복호화 (Decrypt)",
    inputLabelEnc: "암호화할 원본 텍스트",
    inputPlaceholderEnc: "비밀 메시지, 계좌번호, 비밀번호, API 키 등 암호화할 내용을 입력하세요...",
    inputLabelDec: "복호화할 암호문 (Ciphertext)",
    inputPlaceholderDec: "복호화할 Base64 또는 Hex 암호문을 붙여넣으세요...",
    keyLabel: "비밀키 / 패스워드 (Secret Passphrase)",
    keyPlaceholder: "암호화 및 복호화에 사용할 비밀번호 입력",
    genKeyBtn: "랜덤 키 생성",
    outputLabelEnc: "생성된 암호문 (Ciphertext)",
    outputLabelDec: "복호화된 원본 텍스트 (Plaintext)",
    btnEncrypt: "AES-256 암호화 실행",
    btnDecrypt: "AES-256 복호화 실행",
    testDecryptBtn: "🔓 이 암호문 복호화 테스트하기",
    copied: "복사 완료!",
    copyBtn: "암호문 복사",
    copyPlainBtn: "원문 복사",
    downloadBtn: "텍스트 저장 (.txt)",
    clearBtn: "지우기",
    sampleBtn: "예시 텍스트 넣기",
    optionsTitle: "암호화 세부 옵션",
    algorithmLabel: "알고리즘",
    algoGCM: "AES-GCM (256-bit, 인증 및 최고 보안)",
    algoCBC: "AES-CBC (256-bit, 표준 호환성)",
    formatLabel: "출력 포맷",
    formatBase64: "Base64 (기본, 텍스트 전송용)",
    formatHex: "Hex (16진수 문자열)",
    errEmpty: "내용과 비밀번호를 모두 입력해주세요.",
    errDecrypt: "복호화에 실패했습니다. 비밀번호가 올바르지 않거나 암호문이 손상되었습니다.",
  },
  en: {
    back: "All Tools",
    title: "AES Text Encryptor & Decryptor",
    badge: "100% Client-Side WebCrypto",
    subtitle: "Securely encrypt and decrypt text, passwords, and sensitive keys with military-grade AES-256 encryption.",
    tabEncrypt: "🔒 Encrypt Text",
    tabDecrypt: "🔓 Decrypt Ciphertext",
    inputLabelEnc: "Plaintext to Encrypt",
    inputPlaceholderEnc: "Enter sensitive message, passwords, financial info, or API keys...",
    inputLabelDec: "Ciphertext to Decrypt",
    inputPlaceholderDec: "Paste Base64 or Hex encrypted string...",
    keyLabel: "Secret Key / Passphrase",
    keyPlaceholder: "Enter secret passphrase for encryption/decryption",
    genKeyBtn: "Generate Random Key",
    outputLabelEnc: "Generated Ciphertext",
    outputLabelDec: "Decrypted Plaintext",
    btnEncrypt: "Encrypt with AES-256",
    btnDecrypt: "Decrypt with AES-256",
    testDecryptBtn: "🔓 Test Decrypt this Ciphertext",
    copied: "Copied!",
    copyBtn: "Copy Ciphertext",
    copyPlainBtn: "Copy Plaintext",
    downloadBtn: "Download (.txt)",
    clearBtn: "Clear",
    sampleBtn: "Load Sample",
    optionsTitle: "Encryption Settings",
    algorithmLabel: "Algorithm",
    algoGCM: "AES-GCM (256-bit, Authenticated & Secure)",
    algoCBC: "AES-CBC (256-bit, Standard Compatibility)",
    formatLabel: "Output Format",
    formatBase64: "Base64 (Standard string)",
    formatHex: "Hexadecimal (Hex string)",
    errEmpty: "Please enter both text and a secret passphrase.",
    errDecrypt: "Decryption failed. Incorrect passphrase or corrupted ciphertext.",
  },
  ja: {
    back: "全ツール一覧",
    title: "AES テキスト暗号化・復号化ツール",
    badge: "100% ブラウザ完結",
    subtitle: "パスワードを設定して機密テキストやAPIキーを軍用グレードのAES-256で安全に暗号化・復号化します。",
    tabEncrypt: "🔒 テキスト暗号化",
    tabDecrypt: "🔓 暗号文復号化",
    inputLabelEnc: "暗号化する元のテキスト",
    inputPlaceholderEnc: "暗号化したい秘密メッセージやパスワードを入力...",
    inputLabelDec: "復号化する暗号文 (Ciphertext)",
    inputPlaceholderDec: "Base64またはHexの暗号文を貼り付けてください...",
    keyLabel: "秘密鍵 / パスフレーズ",
    keyPlaceholder: "暗号化・復号化に使用するパスワードを入力",
    genKeyBtn: "ランダム鍵生成",
    outputLabelEnc: "生成された暗号文",
    outputLabelDec: "復号化されたテキスト",
    btnEncrypt: "AES-256で暗号化",
    btnDecrypt: "AES-256で復号化",
    testDecryptBtn: "🔓 この暗号文を復号テスト",
    copied: "コピー完了!",
    copyBtn: "暗号文をコピー",
    copyPlainBtn: "テキストをコピー",
    downloadBtn: "保存 (.txt)",
    clearBtn: "クリア",
    sampleBtn: "サンプル入力",
    optionsTitle: "暗号化設定",
    algorithmLabel: "アルゴリズム",
    algoGCM: "AES-GCM (256-bit, 最高セキュリティ)",
    algoCBC: "AES-CBC (256-bit, 標準互換)",
    formatLabel: "出力フォーマット",
    formatBase64: "Base64 (標準)",
    formatHex: "Hex (16進数文字列)",
    errEmpty: "テキストとパスワードの両方を入力してください。",
    errDecrypt: "復号化に失敗しました。パスワードが異なるか暗号文が破損しています。",
  },
  es: {
    back: "Todas las herramientas",
    title: "Cifrado y Descifrado de Texto AES-256",
    badge: "100% en tu navegador",
    subtitle: "Cifra y descifra mensajes confidenciales, contraseñas y claves API con cifrado militar AES-256.",
    tabEncrypt: "🔒 Cifrar Texto",
    tabDecrypt: "🔓 Descifrar Texto",
    inputLabelEnc: "Texto original a cifrar",
    inputPlaceholderEnc: "Escribe el mensaje secreto o datos a proteger...",
    inputLabelDec: "Texto cifrado a descifrar",
    inputPlaceholderDec: "Pega el texto cifrado en Base64 o Hex...",
    keyLabel: "Clave Secreta / Contraseña",
    keyPlaceholder: "Introduce la contraseña secreta",
    genKeyBtn: "Generar clave",
    outputLabelEnc: "Texto Cifrado Generado",
    outputLabelDec: "Texto Original Descifrado",
    btnEncrypt: "Cifrar con AES-256",
    btnDecrypt: "Descifrar con AES-256",
    testDecryptBtn: "🔓 Probar Descifrado",
    copied: "¡Copiado!",
    copyBtn: "Copiar Cifrado",
    copyPlainBtn: "Copiar Texto",
    downloadBtn: "Descargar (.txt)",
    clearBtn: "Limpiar",
    sampleBtn: "Ejemplo",
    optionsTitle: "Opciones de Cifrado",
    algorithmLabel: "Algoritmo",
    algoGCM: "AES-GCM (256-bit, Autenticado y Seguro)",
    algoCBC: "AES-CBC (256-bit, Estándar)",
    formatLabel: "Formato de Salida",
    formatBase64: "Base64 (Estándar)",
    formatHex: "Hexadecimal (Hex)",
    errEmpty: "Por favor introduce el texto y la contraseña.",
    errDecrypt: "Error al descifrar. Contraseña incorrecta o texto cifrado dañado.",
  },
  zh: {
    back: "返回所有工具",
    title: "AES 文本加密与解密工具 (AES-256)",
    badge: "100% 本地浏览器 WebCrypto",
    subtitle: "设置安全密码，将机密文本、银行账号、API Key 加密为军工级 AES-256 密文并支持随时解密。",
    tabEncrypt: "🔒 文本加密 (Encrypt)",
    tabDecrypt: "🔓 密文解密 (Decrypt)",
    inputLabelEnc: "待加密的原始文本",
    inputPlaceholderEnc: "输入机密留言、账号密码、API 密钥等内容...",
    inputLabelDec: "待解密的密文字符串",
    inputPlaceholderDec: "粘贴 Base64 或 Hex 格式的密文...",
    keyLabel: "密码 / 密钥 (Secret Passphrase)",
    keyPlaceholder: "输入用于加密和解密的安全密码",
    genKeyBtn: "生成强密码",
    outputLabelEnc: "生成的加密密文 (Ciphertext)",
    outputLabelDec: "解密还原的明文 (Plaintext)",
    btnEncrypt: "立即进行 AES-256 加密",
    btnDecrypt: "立即进行 AES-256 解密",
    testDecryptBtn: "🔓 测试解密此密文",
    copied: "已复制！",
    copyBtn: "复制密文",
    copyPlainBtn: "复制明文",
    downloadBtn: "下载文本 (.txt)",
    clearBtn: "清空",
    sampleBtn: "填入示例",
    optionsTitle: "加密高级选项",
    algorithmLabel: "加密算法",
    algoGCM: "AES-GCM (256位，认证加密最高安全)",
    algoCBC: "AES-CBC (256位，标准兼容)",
    formatLabel: "输出编码格式",
    formatBase64: "Base64 (推荐文本传输)",
    formatHex: "Hex (16进制字符串)",
    errEmpty: "请输入文本内容与安全密码。",
    errDecrypt: "解密失败！密码错误或密文已被篡改损坏。",
  },
  fr: {
    back: "Tous les outils",
    title: "Chiffrement et Déchiffrement de Texte AES-256",
    badge: "100% Local WebCrypto",
    subtitle: "Chiffrez et déchiffrez des messages, mots de passe et clés API avec le standard militaire AES-256.",
    tabEncrypt: "🔒 Chiffrer le Texte",
    tabDecrypt: "🔓 Déchiffrer le Texte",
    inputLabelEnc: "Texte original à chiffrer",
    inputPlaceholderEnc: "Entrez le message secret ou les données sensibles...",
    inputLabelDec: "Texte chiffré à déchiffrer",
    inputPlaceholderDec: "Collez le texte chiffré en Base64 ou Hex...",
    keyLabel: "Clé Secrète / Mot de Passe",
    keyPlaceholder: "Entrez le mot de passe secret",
    genKeyBtn: "Générer une clé",
    outputLabelEnc: "Texte Chiffré Généré",
    outputLabelDec: "Texte Original Déchiffré",
    btnEncrypt: "Chiffrer avec AES-256",
    btnDecrypt: "Déchiffrer avec AES-256",
    testDecryptBtn: "🔓 Tester le Déchiffrement",
    copied: "Copié !",
    copyBtn: "Copier le Chiffre",
    copyPlainBtn: "Copier le Texte",
    downloadBtn: "Télécharger (.txt)",
    clearBtn: "Effacer",
    sampleBtn: "Exemple",
    optionsTitle: "Options de Chiffrement",
    algorithmLabel: "Algorithme",
    algoGCM: "AES-GCM (256-bit, Authentifié & Sécurisé)",
    algoCBC: "AES-CBC (256-bit, Standard)",
    formatLabel: "Format de Sortie",
    formatBase64: "Base64 (Standard)",
    formatHex: "Hexadécimal (Hex)",
    errEmpty: "Veuillez saisir le texte et le mot de passe.",
    errDecrypt: "Échec du déchiffrement. Mot de passe incorrect ou texte altéré.",
  },
};

export default function AesEncryptPage() {
  const { locale } = useLocale();
  const t = I18N[locale as keyof typeof I18N] || I18N.ko;

  const [mode, setMode] = useState<Mode>("encrypt");

  // Separate states for Encrypt and Decrypt so inputs never mix up
  const [encryptPlaintext, setEncryptPlaintext] = useState<string>("");
  const [decryptCiphertext, setDecryptCiphertext] = useState<string>("");
  const [passphrase, setPassphrase] = useState<string>("");
  const [showPassphrase, setShowPassphrase] = useState<boolean>(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>("AES-GCM");
  const [format, setFormat] = useState<Format>("base64");
  const [showOptions, setShowOptions] = useState<boolean>(false);

  const [encryptResult, setEncryptResult] = useState<string>("");
  const [decryptResult, setDecryptResult] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Switch tabs safely
  const handleTabSwitch = (newMode: Mode) => {
    setMode(newMode);
    setErrorMessage("");
  };

  // Fast shortcut to test decrypt newly generated ciphertext
  const handleTransferToDecrypt = () => {
    if (!encryptResult) return;
    setDecryptCiphertext(encryptResult);
    setMode("decrypt");
    setErrorMessage("");
  };

  // Random password generator helper
  const handleGenerateKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
    const arr = new Uint8Array(18);
    window.crypto.getRandomValues(arr);
    const pass = Array.from(arr).map((b) => chars[b % chars.length]).join("");
    setPassphrase(pass);
    setShowPassphrase(true);
  };

  // Sample Text
  const handleLoadSample = () => {
    setEncryptPlaintext(
      "비밀 메모:\n- 국민은행 123-4567-89012\n- 개인 금고 비밀번호: 7890#\n- API Token: sk_live_9837198273918273"
    );
    if (!passphrase) {
      setPassphrase("desktools2026!Secret");
    }
  };

  // Clear inputs
  const handleClear = () => {
    if (mode === "encrypt") {
      setEncryptPlaintext("");
      setEncryptResult("");
    } else {
      setDecryptCiphertext("");
      setDecryptResult("");
    }
    setErrorMessage("");
  };

  // WebCrypto Encrypt
  const executeEncrypt = useCallback(async () => {
    if (!encryptPlaintext.trim() || !passphrase.trim()) {
      setErrorMessage(t.errEmpty);
      return;
    }
    setErrorMessage("");
    setIsProcessing(true);

    try {
      const enc = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(algorithm === "AES-GCM" ? 12 : 16));

      const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );

      const key = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: algorithm, length: 256 },
        false,
        ["encrypt"]
      );

      const cipherBuffer = await window.crypto.subtle.encrypt(
        algorithm === "AES-GCM" ? { name: "AES-GCM", iv } : { name: "AES-CBC", iv },
        key,
        enc.encode(encryptPlaintext)
      );

      const cipherArray = new Uint8Array(cipherBuffer);
      const combined = new Uint8Array(salt.length + iv.length + cipherArray.length);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(cipherArray, salt.length + iv.length);

      if (format === "hex") {
        const hex = Array.from(combined).map((b) => b.toString(16).padStart(2, "0")).join("");
        setEncryptResult(hex);
      } else {
        let binary = "";
        const len = combined.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(combined[i]);
        }
        setEncryptResult(btoa(binary));
      }
    } catch (err) {
      console.error("Encrypt error:", err);
      setErrorMessage("암호화 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  }, [encryptPlaintext, passphrase, algorithm, format, t.errEmpty]);

  // WebCrypto Decrypt
  const executeDecrypt = useCallback(async () => {
    if (!decryptCiphertext.trim() || !passphrase.trim()) {
      setErrorMessage(t.errEmpty);
      return;
    }
    setErrorMessage("");
    setIsProcessing(true);

    try {
      let combined: Uint8Array;
      const raw = decryptCiphertext.trim();

      // Check if hex or base64
      const isHex = /^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0 && !raw.includes("+") && !raw.includes("/");

      if (isHex && (format === "hex" || raw.length > 50)) {
        combined = new Uint8Array(raw.length / 2);
        for (let i = 0; i < raw.length; i += 2) {
          combined[i / 2] = parseInt(raw.substring(i, i + 2), 16);
        }
      } else {
        const binary = atob(raw);
        combined = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          combined[i] = binary.charCodeAt(i);
        }
      }

      const ivLen = algorithm === "AES-GCM" ? 12 : 16;
      if (combined.length < 16 + ivLen + 1) {
        throw new Error("Ciphertext too short");
      }

      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 16 + ivLen);
      const data = combined.slice(16 + ivLen);

      const enc = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );

      const key = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: algorithm, length: 256 },
        false,
        ["decrypt"]
      );

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        algorithm === "AES-GCM" ? { name: "AES-GCM", iv } : { name: "AES-CBC", iv },
        key,
        data
      );

      const dec = new TextDecoder();
      setDecryptResult(dec.decode(decryptedBuffer));
    } catch (err) {
      console.error("Decrypt error:", err);
      setErrorMessage(t.errDecrypt);
      setDecryptResult("");
    } finally {
      setIsProcessing(false);
    }
  }, [decryptCiphertext, passphrase, algorithm, format, t.errEmpty, t.errDecrypt]);

  // Copy to clipboard
  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download .txt
  const handleDownload = (text: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "encrypt" ? "encrypted_ciphertext.txt" : "decrypted_plaintext.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <ToolUsageTracker toolId="aes-encrypt" />
      <Header />

      <main style={{ minHeight: "85vh", padding: "40px 16px 80px" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <Link
            href="/#tools"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-muted)",
              fontSize: "13.5px",
              fontWeight: 500,
              textDecoration: "none",
              marginBottom: "24px",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--brand-mid)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
            }}
          >
            <ArrowLeft size={16} />
            {t.back}
          </Link>

          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                {t.title}
              </h1>
              <span className="badge-pill">
                <ShieldCheck size={13} />
                {t.badge}
              </span>
            </div>
            <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {t.subtitle}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "6px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "14px",
              marginBottom: "24px",
              maxWidth: "460px",
            }}
          >
            <button
              type="button"
              onClick={() => handleTabSwitch("encrypt")}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                background: mode === "encrypt" ? "linear-gradient(135deg, #4f46e5, #6366f1)" : "transparent",
                color: mode === "encrypt" ? "#ffffff" : "var(--text-secondary)",
                boxShadow: mode === "encrypt" ? "0 4px 14px rgba(99, 102, 241, 0.3)" : "none",
              }}
            >
              {t.tabEncrypt}
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch("decrypt")}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                background: mode === "decrypt" ? "linear-gradient(135deg, #10b981, #059669)" : "transparent",
                color: mode === "decrypt" ? "#ffffff" : "var(--text-secondary)",
                boxShadow: mode === "decrypt" ? "0 4px 14px rgba(16, 185, 129, 0.3)" : "none",
              }}
            >
              {t.tabDecrypt}
            </button>
          </div>

          {/* Main Card */}
          <div className="glass-card" style={{ padding: "32px", borderRadius: "16px", marginBottom: "48px" }}>
            {/* Input Section */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {mode === "encrypt" ? t.inputLabelEnc : t.inputLabelDec}
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {mode === "encrypt" && (
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--brand-mid)",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Sparkles size={13} />
                      {t.sampleBtn}
                    </button>
                  )}
                  {((mode === "encrypt" && encryptPlaintext) || (mode === "decrypt" && decryptCiphertext)) && (
                    <button
                      type="button"
                      onClick={handleClear}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "12.5px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                      }}
                    >
                      <Trash2 size={13} />
                      {t.clearBtn}
                    </button>
                  )}
                </div>
              </div>

              {mode === "encrypt" ? (
                <textarea
                  value={encryptPlaintext}
                  onChange={(e) => {
                    setEncryptPlaintext(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder={t.inputPlaceholderEnc}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              ) : (
                <textarea
                  value={decryptCiphertext}
                  onChange={(e) => {
                    setDecryptCiphertext(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder={t.inputPlaceholderDec}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "monospace",
                  }}
                />
              )}
            </div>

            {/* Secret Key Input Section */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  <KeyRound
                    size={14}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginRight: "6px",
                      color: mode === "encrypt" ? "var(--brand-mid)" : "#10b981",
                    }}
                  />
                  {t.keyLabel}
                </label>
                {mode === "encrypt" && (
                  <button
                    type="button"
                    onClick={handleGenerateKey}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--brand-mid)",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <RefreshCw size={12} />
                    {t.genKeyBtn}
                  </button>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassphrase ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => {
                    setPassphrase(e.target.value);
                    setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      mode === "encrypt" ? executeEncrypt() : executeDecrypt();
                    }
                  }}
                  placeholder={t.keyPlaceholder}
                  style={{
                    width: "100%",
                    padding: "12px 42px 12px 14px",
                    borderRadius: "10px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                  aria-label={showPassphrase ? "Hide passphrase" : "Show passphrase"}
                >
                  {showPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div style={{ marginBottom: "24px" }}>
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: 0,
                }}
              >
                <Sliders size={14} />
                {t.optionsTitle} {showOptions ? "▲" : "▼"}
              </button>

              {showOptions && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        marginBottom: "6px",
                      }}
                    >
                      {t.algorithmLabel}
                    </label>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    >
                      <option value="AES-GCM">{t.algoGCM}</option>
                      <option value="AES-CBC">{t.algoCBC}</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        marginBottom: "6px",
                      }}
                    >
                      {t.formatLabel}
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as Format)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    >
                      <option value="base64">{t.formatBase64}</option>
                      <option value="hex">{t.formatHex}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  marginBottom: "20px",
                }}
              >
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="button"
              onClick={mode === "encrypt" ? executeEncrypt : executeDecrypt}
              disabled={isProcessing}
              className="btn-glow"
              style={{
                width: "100%",
                padding: "14px 24px",
                fontSize: "15px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background:
                  mode === "encrypt"
                    ? "linear-gradient(135deg, #4f46e5, #6366f1)"
                    : "linear-gradient(135deg, #10b981, #059669)",
                boxShadow:
                  mode === "encrypt"
                    ? "0 4px 20px rgba(99, 102, 241, 0.3)"
                    : "0 4px 20px rgba(16, 185, 129, 0.3)",
              }}
            >
              {isProcessing ? (
                <div className="spinner" style={{ width: "16px", height: "16px" }} />
              ) : mode === "encrypt" ? (
                <>
                  <Lock size={16} />
                  {t.btnEncrypt}
                </>
              ) : (
                <>
                  <Unlock size={16} />
                  {t.btnDecrypt}
                </>
              )}
            </button>

            {/* Output Result Section */}
            {((mode === "encrypt" && encryptResult) || (mode === "decrypt" && decryptResult)) && (
              <div
                style={{
                  marginTop: "32px",
                  paddingTop: "28px",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {mode === "encrypt" ? t.outputLabelEnc : t.outputLabelDec}
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {mode === "encrypt" && encryptResult && (
                      <button
                        type="button"
                        onClick={handleTransferToDecrypt}
                        style={{
                          background: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          color: "#34d399",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <ArrowRight size={14} />
                        {t.testDecryptBtn}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopy(mode === "encrypt" ? encryptResult : decryptResult)}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border-subtle)",
                        color: copied ? "#10b981" : "var(--text-primary)",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? t.copied : mode === "encrypt" ? t.copyBtn : t.copyPlainBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(mode === "encrypt" ? encryptResult : decryptResult)}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Download size={14} />
                      {t.downloadBtn}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    color: mode === "encrypt" ? "#818cf8" : "#34d399",
                    fontSize: "13.5px",
                    fontFamily: mode === "encrypt" ? "monospace" : "inherit",
                    wordBreak: "break-all",
                    whiteSpace: "pre-wrap",
                    maxHeight: "300px",
                    overflowY: "auto",
                    lineHeight: 1.6,
                  }}
                >
                  {mode === "encrypt" ? encryptResult : decryptResult}
                </div>
              </div>
            )}
          </div>

          {/* ── Multilingual SEO Guide & FAQ (6 Languages) ── */}
          {(() => {
            const content = {
              ko: {
                aboutTitle: "AES-256 텍스트 암호화 및 복호화 도구 소개",
                aboutDesc:
                  "미국 연방 표준(FIPS 197) 및 전 세계 군사·금융 기관에서 사용하는 최고 보안 등급의 대칭키 알고리즘인 AES-256을 웹 브라우저 로컬 환경에서 무료로 제공합니다. PBKDF2(100,000회 연산)와 암호학적 무작위 Salt/IV를 결합하여 중요한 메시지, 계좌번호, 비밀번호, API 토큰을 외부 서버 전송 없이 안전하게 암호화하고 복호화할 수 있습니다.",
                howTitle: "AES 텍스트 암호화 및 복호화 사용 방법",
                steps: [
                  "상단 탭에서 '🔒 텍스트 암호화' 또는 '🔓 암호문 복호화' 모드를 선택합니다.",
                  "암호화 모드에서는 보호할 원본 글을 입력하고, 복호화 모드에서는 수신한 Base64 또는 Hex 암호문을 입력합니다.",
                  "암호화/복호화의 열쇠가 될 나만의 비밀번호(비밀키)를 입력하거나 '랜덤 키 생성'을 누릅니다.",
                  "필요에 따라 고급 옵션에서 알고리즘(AES-GCM / AES-CBC) 및 출력 포맷(Base64 / Hex)을 지정합니다.",
                  "'암호화 실행' 또는 '복호화 실행' 버튼을 누른 후 결과를 즉시 복사하거나 .txt 파일로 다운로드합니다.",
                ],
                featuresTitle: "핵심 보안 기능 및 특징",
                features: [
                  { title: "군사급 AES-256-GCM / CBC 표준", desc: "현대 암호학에서 가장 안전한 256비트 대칭키 암호화 및 AEAD 무결성 인증을 완벽 지원합니다." },
                  { title: "PBKDF2 100,000회 키 유도 & Salt 적용", desc: "무작위 16바이트 Salt와 100,000회 해싱으로 레인보우 테이블 공격 및 무차별 대입을 완벽 차단합니다." },
                  { title: "100% 브라우저 로컬 연산 (WebCrypto)", desc: "모든 암호화/복호화 연산이 사용자 기기의 메모리 내에서만 실행되며 서버로 일절 전송되지 않습니다." },
                  { title: "Base64 & Hex 양방향 인코딩 지원", desc: "이메일이나 메신저 전송에 적합한 Base64 포맷과 개발자용 16진수(Hex) 포맷을 자유롭게 전환합니다." },
                ],
                useCasesTitle: "실무 활용 분야",
                useCases: [
                  { title: "민감한 개인정보 및 금융 데이터 전달", desc: "계좌번호, 주민번호, 여권번호, 금고 비밀번호 등을 메신저나 이메일로 안전하게 전송" },
                  { title: "개발자 API 키 및 환경 변수 암호화 저장", desc: "OpenAI API Key, AWS 시크릿 키 등을 비밀번호로 암호화하여 로컬 메모에 보관" },
                  { title: "기밀 업무 메모 및 팀 간 비밀 메시지 교환", desc: "동일한 사전 공유 키(PSK)를 아는 팀원끼리만 열람할 수 있는 보안 메시지 공유" },
                  { title: "클라이언트 사이드 암호화 프로토타이핑", desc: "웹 앱 개발 시 WebCrypto 기반 AES-GCM 암호화 흐름 및 페이로드 검증" },
                ],
                proTipsTitle: "암호화 전문가 실무 보안 팁",
                proTips: [
                  "AES-GCM은 암호화와 동시에 메시지 변조 방지 태그를 검증하므로 최신 웹 표준에서 AES-CBC보다 적극 권장됩니다.",
                  "비밀번호(Passphrase)는 대소문자, 숫자, 특수문자를 혼합한 12자 이상을 사용하여 엔트로피를 극대화하세요.",
                  "암호문과 비밀번호는 절대 같은 채널로 공유하지 마세요 (예: 암호문은 이메일, 비밀번호는 전화나 오프라인으로 전달).",
                  "생성된 암호문 앞부분에는 무작위 Salt와 IV가 포함되어 있으므로 동일한 텍스트라도 매번 암호문이 다르게 생성되는 것이 정상입니다.",
                ],
                faqTitle: "자주 묻는 질문 (FAQ)",
                faqs: [
                  { q: "제가 입력한 텍스트나 비밀번호가 서버로 전송되나요?", a: "전혀 전송되지 않습니다. desktools.run의 모든 암호화 연산은 브라우저 내장 표준 WebCrypto API를 통해 100% 기기 메모리에서만 로컬로 실행됩니다." },
                  { q: "AES-256 암호화는 얼마나 안전한가요?", a: "AES-256은 미국 정부 및 군사 기관에서 기밀문서 보호에 사용하는 최고 등급 암호화 표준입니다. 현재 전 세계 슈퍼컴퓨터를 총동원해도 무차별 대입으로 해킹하는 것은 물리적으로 불가능합니다." },
                  { q: "AES-GCM과 AES-CBC 모드의 차이점은 무엇인가요?", a: "AES-GCM은 암호화와 동시에 데이터 변조 여부를 검증하는 인증 암호화(AEAD) 모드로 현대 보안의 표준입니다. AES-CBC는 전통적인 블록 암호화 방식입니다." },
                  { q: "비밀번호를 분실하면 복구할 수 있나요?", a: "아닙니다. 백도어가 없는 순수 수학적 암호 알고리즘이므로 비밀번호를 분실하면 서비스 운영자를 포함해 그 누구도 복구할 수 없습니다." },
                  { q: "동일한 문장을 암호화했는데 매번 결과가 다른 이유는 무엇인가요?", a: "암호화할 때마다 브라우저가 새로운 16바이트 Salt와 무작위 IV를 자동 생성하여 결합하기 때문이며, 이는 암호학적으로 가장 안전한 구현 방식입니다." },
                  { q: "완전 무료인가요?", a: "네, desktools.run의 모든 암호화 도구는 로그인이나 횟수 제한 없이 영구적으로 100% 무료입니다." },
                ],
                relatedTools: [
                  { title: "비밀번호 생성기", desc: "암호학적 무작위 난수 기반의 초강력 비밀번호 즉시 생성", href: "/tools/password-generator/" },
                  { title: "해시 생성기 (MD5 / SHA-256)", desc: "텍스트 및 파일의 무결성 검증을 위한 원웨이 암호화 해시 계산", href: "/tools/hash-generator/" },
                  { title: "Base64 인코더 / 디코더", desc: "텍스트 및 바이너리 데이터를 안전한 Base64 문자열로 변환", href: "/tools/base64/" },
                  { title: "JWT 토큰 디코더", desc: "JSON Web Token(JWT) 헤더와 페이로드를 실시간 분석 및 검증", href: "/tools/jwt-decoder/" },
                ],
              },
              en: {
                aboutTitle: "About AES-256 Text Encryptor & Decryptor",
                aboutDesc:
                  "A browser-native cryptographic utility for military-grade AES-256 symmetric encryption and decryption conforming to NIST FIPS 197 standards. Powered by the W3C Web Cryptography API with PBKDF2 key derivation (100,000 iterations) and cryptographically secure random Salt/IV. Safely protect passwords, financial records, API keys, and sensitive memos without sending a single byte to external servers.",
                howTitle: "How to Encrypt and Decrypt Text",
                steps: [
                  "Select either the '🔒 Encrypt Text' or '🔓 Decrypt Ciphertext' tab at the top.",
                  "In Encrypt mode, enter your sensitive plaintext. In Decrypt mode, paste the Base64 or Hex ciphertext.",
                  "Enter your secret passphrase or click 'Generate Random Key' to create a high-entropy password.",
                  "Optionally configure the cipher mode (AES-GCM / AES-CBC) and string format (Base64 / Hex) under Advanced Settings.",
                  "Click 'Encrypt' or 'Decrypt' to process immediately, then copy the result or download as a .txt file.",
                ],
                featuresTitle: "Key Features & Security Highlights",
                features: [
                  { title: "Military-Grade AES-256 (GCM & CBC)", desc: "Supports 256-bit key lengths with authenticated encryption (AEAD) in GCM mode." },
                  { title: "PBKDF2 with 100,000 Iterations & Salt", desc: "Derives robust 256-bit encryption keys using SHA-256 and unique 16-byte random salts to thwart rainbow table attacks." },
                  { title: "100% Client-Side WebCrypto", desc: "All cryptographic operations execute exclusively in your browser memory with zero network requests." },
                  { title: "Dual Output: Base64 & Hexadecimal", desc: "Seamlessly export and import ciphertexts formatted for standard messaging or low-level byte analysis." },
                ],
                useCasesTitle: "Common Use Cases",
                useCases: [
                  { title: "Securing Financial and PII Data", desc: "Safely transmit bank account numbers, SSNs, and passwords over unencrypted communication channels." },
                  { title: "Developer Credential Storage", desc: "Encrypt API keys, database credentials, and secret env tokens for local storage." },
                  { title: "Confidential Team Communications", desc: "Share classified instructions between team members using a pre-shared passphrase." },
                  { title: "Client-Side Cryptography Prototyping", desc: "Test WebCrypto AES-GCM encryption workflows and payload integrity in real-time." },
                ],
                proTipsTitle: "Cryptographic Security Tips",
                proTips: [
                  "AES-GCM is strongly recommended over AES-CBC because it verifies data authenticity and detects ciphertext tampering.",
                  "Always use passphrases of at least 12 characters containing mixed case, numbers, and symbols for high entropy.",
                  "Never transmit the encrypted ciphertext and the secret passphrase through the same communication channel.",
                  "Ciphertexts vary on every encryption run because a fresh 16-byte Salt and IV are generated each time, which is standard best practice.",
                ],
                faqTitle: "Frequently Asked Questions",
                faqs: [
                  { q: "Is my plaintext or passphrase sent to any server?", a: "Never! All encryption and decryption calculations run 100% locally in your browser memory via the W3C Web Crypto API." },
                  { q: "How secure is AES-256 encryption?", a: "AES-256 is the gold standard used by governments, banks, and military institutions worldwide. It is mathematically unbreakable by brute-force." },
                  { q: "What is the difference between AES-GCM and AES-CBC?", a: "AES-GCM is an Authenticated Encryption mode that protects against tampering, whereas AES-CBC is a legacy block cipher mode." },
                  { q: "Can I recover my data if I forget the passphrase?", a: "No. Without the exact passphrase, standard cryptographic algorithms make data recovery mathematically impossible." },
                  { q: "Why does the ciphertext change every time I encrypt the same text?", a: "Each encryption generates a new random Salt and Initialization Vector (IV) to prevent replay attacks and pattern recognition." },
                  { q: "Is this tool completely free to use?", a: "Yes, 100% free with no limits, accounts, or software installation required." },
                ],
                relatedTools: [
                  { title: "Password Generator", desc: "Generate cryptographically secure high-entropy random passwords", href: "/tools/password-generator/" },
                  { title: "Hash Generator (MD5 / SHA-256)", desc: "Calculate one-way cryptographic hashes for text and files", href: "/tools/hash-generator/" },
                  { title: "Base64 Encoder / Decoder", desc: "Convert text and binary data into safe Base64 ASCII strings", href: "/tools/base64/" },
                  { title: "JWT Token Decoder", desc: "Decode and inspect JSON Web Tokens in real-time", href: "/tools/jwt-decoder/" },
                ],
              },
              ja: {
                aboutTitle: "AES-256 テキスト暗号化・復号化ツールについて",
                aboutDesc:
                  "米国連邦標準（FIPS 197）および各国の国家機関・金融機関で採用されている軍用規格の対称鍵暗号「AES-256」をブラウザ上で安全に利用できる無料ツールです。PBKDF2（100,000回反復計算）と暗号論的乱数 Salt/IV を組み合わせ、機密データやAPIキーをサーバー送信なしで100%ローカル暗号化・復号化します。",
                howTitle: "AES 暗号化・復号化の使い方",
                steps: [
                  "上部タブで「🔒 テキスト暗号化」または「🔓 暗号文復号化」を選択します。",
                  "暗号化時は保護したいテキストを、復号化時は Base64 / Hex の暗号文を入力します。",
                  "秘密鍵（パスワード）を入力するか、「ランダム鍵生成」で強力なキーを生成します。",
                  "必要に応じて詳細設定からアルゴリズム（AES-GCM / AES-CBC）や出力形式を変更します。",
                  "「暗号化実行」または「復号化実行」をクリックし、結果をコピーまたは .txt 保存します。",
                ],
                featuresTitle: "主なセキュリティ機能と特徴",
                features: [
                  { title: "軍用規格 AES-256-GCM / CBC 対応", desc: "最高峰の256ビット暗号強度とデータ改ざん検知機能をサポートします。" },
                  { title: "PBKDF2 10万回計算 & 16バイト Salt", desc: "強固な鍵導出関数によりレインボーテーブル攻撃や総当たり攻撃を完全に防御します。" },
                  { title: "100% ブラウザ内ローカル処理", desc: "Web Crypto API を利用し、データが外部サーバーへ送信されることは一切ありません。" },
                  { title: "Base64 / Hex 両対応", desc: "メール送信に適した Base64 形式と開発者向けの16進数形式を自由に選択できます。" },
                ],
                useCasesTitle: "実務での主な活用シーン",
                useCases: [
                  { title: "個人情報や機密パスワードの安全な送受信", desc: "口座番号や暗証番号をチャットやメールで安全にやり取り" },
                  { title: "APIキーや秘密設定値の暗号化保管", desc: "OpenAI や AWS などのシークレットキーをパスワード付きで安全に保存" },
                  { title: "チーム内での機密連絡の共有", desc: "共通パスワードを知るメンバー間でのみ閲覧可能なメッセージの作成" },
                  { title: "Web アプリの暗号化プロトタイプ検証", desc: "WebCrypto を用いた AES-GCM 暗号化処理の動作検証" },
                ],
                proTipsTitle: "セキュリティの専門家によるヒント",
                proTips: [
                  "データの完全性を検証できる AES-GCM モードの使用が最も推奨されます。",
                  "パスワードは英大文字・小文字・数字・記号を組み合わせた12文字以上を設定してください。",
                  "暗号文とパスワードは必ず別の連絡手段（例: 暗号文はメール、パスワードは電話）で伝達してください。",
                  "毎回異なる乱数 Salt/IV が適用されるため、同じ文を暗号化しても出力される暗号文は毎回変化します。",
                ],
                faqTitle: "よくある質問 (FAQ)",
                faqs: [
                  { q: "入力したデータがサーバーに送信されることはありますか？", a: "一切ありません。すべての暗号化処理はお手元のブラウザ内（Web Crypto API）で完結します。" },
                  { q: "AES-256 の安全性はどのくらいですか？", a: "世界各国の政府・軍事・金融機関で使用されている最高水準の暗号化規格であり、総当たりでの解読は不可能です。" },
                  { q: "AES-GCM と AES-CBC の違いは何ですか？", a: "AES-GCM は暗号化と同時にデータ改ざんを防止する認証付き暗号で、現代の標準です。" },
                  { q: "パスワードを忘れた場合、復元できますか？", a: "できません。バックドアが存在しない仕様のため、パスワードがないと開発者でも復号できません。" },
                  { q: "同じ文章なのに暗号化するたびに結果が変わるのはなぜですか？", a: "暗号化のたびに異なる Salt と IV（初期化ベクトル）が生成されるためで、暗号学的に正しい動作です。" },
                  { q: "完全無料で利用できますか？", a: "はい、回数無制限で完全無料にてご利用いただけます。" },
                ],
                relatedTools: [
                  { title: "パスワード生成器", desc: "暗号論的乱数による強力なランダムパスワードを即座に生成", href: "/tools/password-generator/" },
                  { title: "ハッシュ生成器 (MD5 / SHA-256)", desc: "テキストやファイルの整合性チェック用ハッシュ値を算出", href: "/tools/hash-generator/" },
                  { title: "Base64 変換ツール", desc: "テキストやバイナリデータを Base64 形式に相互変換", href: "/tools/base64/" },
                  { title: "JWT デコーダー", desc: "JSON Web Token のヘッダーとペイロードを瞬時に解析", href: "/tools/jwt-decoder/" },
                ],
              },
              es: {
                aboutTitle: "Acerca del Cifrador y Descifrador AES-256",
                aboutDesc:
                  "Herramienta gratuita para el cifrado y descifrado simétrico de texto con el estándar militar AES-256 (NIST FIPS 197). Funciona 100% en tu navegador mediante Web Cryptography API, integrando derivación de clave PBKDF2 (100.000 iteraciones) y Salt/IV aleatorio para máxima seguridad.",
                howTitle: "Cómo cifrar y descifrar texto con AES-256",
                steps: [
                  "Selecciona la pestaña '🔒 Cifrar Texto' o '🔓 Descifrar Texto'.",
                  "Introduce el texto plano que deseas proteger o pega el texto cifrado en Base64/Hex.",
                  "Escribe tu contraseña secreta o pulsa 'Generar clave' para una clave aleatoria.",
                  "Personaliza el algoritmo (AES-GCM / AES-CBC) y el formato (Base64 / Hex) si lo deseas.",
                  "Haz clic en el botón de acción para procesar y copia o descarga el resultado.",
                ],
                featuresTitle: "Características principales de seguridad",
                features: [
                  { title: "Estándar militar AES-256 (GCM y CBC)", desc: "Cifrado robusto de 256 bits con autenticación de integridad en modo GCM." },
                  { title: "PBKDF2 con 100.000 iteraciones", desc: "Evita ataques de diccionario y tablas arcoíris mediante Salt aleatorio de 16 bytes." },
                  { title: "100% Local en tu navegador", desc: "Ningún dato ni contraseña se envía a servidores externos." },
                  { title: "Formatos Base64 y Hexadecimal", desc: "Exporta texto cifrado listo para mensajería o inspección de bytes." },
                ],
                useCasesTitle: "Casos de uso frecuentes",
                useCases: [
                  { title: "Envío seguro de contraseñas y cuentas", desc: "Transmite credenciales sensibles a través de canales no cifrados." },
                  { title: "Protección de claves API", desc: "Guarda tokens de OpenAI, AWS y bases de datos cifrados con contraseña." },
                  { title: "Mensajes confidenciales de equipo", desc: "Comparte notas privadas entre usuarios que conocen la clave secreta." },
                  { title: "Pruebas de desarrollo WebCrypto", desc: "Verifica flujos de cifrado AES-GCM en aplicaciones cliente." },
                ],
                proTipsTitle: "Consejos de seguridad profesional",
                proTips: [
                  "Utiliza AES-GCM siempre que sea posible para garantizar que el texto no haya sido alterado.",
                  "Usa contraseñas de al menos 12 caracteres con letras, números y símbolos.",
                  "No envíes el texto cifrado y la clave por el mismo medio de comunicación.",
                  "El texto cifrado cambia en cada intento debido al Salt/IV aleatorio, lo cual es la práctica correcta.",
                ],
                faqTitle: "Preguntas frecuentes (FAQ)",
                faqs: [
                  { q: "¿Se envían mis textos o contraseñas al servidor?", a: "¡No! Todo el procesamiento se realiza localmente en la memoria de tu navegador mediante Web Crypto API." },
                  { q: "¿Qué tan seguro es AES-256?", a: "Es el estándar militar utilizado por bancos y gobiernos. Es matemáticamente imposible de romper por fuerza bruta." },
                  { q: "¿Cuál es la diferencia entre AES-GCM y AES-CBC?", a: "AES-GCM incluye verificación de autenticidad (AEAD), siendo la opción moderna más segura." },
                  { q: "¿Puedo recuperar mis datos si olvido la contraseña?", a: "No. La seguridad criptográfica no permite puertas traseras sin la clave correcta." },
                  { q: "¿Por qué el texto cifrado cambia cada vez?", a: "Porque genera un nuevo Salt e IV aleatorios en cada operación para prevenir ataques de repetición." },
                  { q: "¿Es completamente gratuito?", a: "Sí, 100% gratuito e ilimitado." },
                ],
                relatedTools: [
                  { title: "Generador de Contraseñas", desc: "Crea contraseñas robustas y aleatorias al instante", href: "/tools/password-generator/" },
                  { title: "Generador de Hash (MD5 / SHA-256)", desc: "Calcula hashes criptográficos para verificar integridad", href: "/tools/hash-generator/" },
                  { title: "Codificador Base64", desc: "Convierte texto y binarios a formato Base64", href: "/tools/base64/" },
                  { title: "Decodificador JWT", desc: "Inspecciona tokens JSON Web Token en tiempo real", href: "/tools/jwt-decoder/" },
                ],
              },
              zh: {
                aboutTitle: "AES-256 文本加密与解密工具介绍",
                aboutDesc:
                  "基于美国国家标准（NIST FIPS 197）的军工级 AES-256 对称加密与解密在线工具。采用 W3C Web Cryptography API 原生引擎，结合 PBKDF2（100,000 次哈希运算）与密码学随机 Salt/IV，确保机密留言、API 密钥、银行卡号与密码在您的浏览器本地 100% 独立计算，绝不上传任何服务器。",
                howTitle: "AES 文本加密与解密使用步骤",
                steps: [
                  "在顶部选择“🔒 文本加密”或“🔓 密文解密”模式。",
                  "在加密模式下输入需要保护的明文，在解密模式下粘贴 Base64 或 Hex 密文。",
                  "输入专有解密密码（密钥），或点击“生成强密码”创建高强度随机密钥。",
                  "可在高级选项中选择加密算法（AES-GCM / AES-CBC）与输出编码格式（Base64 / Hex）。",
                  "点击加密/解密按钮即刻完成处理，支持一键复制或下载为 .txt 文件。",
                ],
                featuresTitle: "核心安全特性与优势",
                features: [
                  { title: "军工级 AES-256 (GCM / CBC) 双模式", desc: "支持行业公认最强的 256 位密钥长度及 GCM 认证加密防篡改保护。" },
                  { title: "PBKDF2 10万次运算 & 16字节随机盐", desc: "有效抵御彩虹表、字典破解与 GPU 暴力穷举攻击。" },
                  { title: "100% 浏览器本地内存计算", desc: "完全依托客户端 WebCrypto API 执行，无任何网络数据上传风险。" },
                  { title: "Base64 与 Hex 灵活输出", desc: "便于在聊天软件、电子邮件中传输或供开发人员进行十六进制校验。" },
                ],
                useCasesTitle: "常见应用场景",
                useCases: [
                  { title: "敏感隐私与金融信息安全传递", desc: "通过普通聊天工具安全发送银行账号、身份证号及个人隐私" },
                  { title: "开发者 API Key 与环境变量加密存储", desc: "对 OpenAI、AWS、数据库密钥进行加密后保存在本地笔记" },
                  { title: "团队内部机密备忘录交换", desc: "仅允许知晓预共享密码的团队成员解密查看工作机密" },
                  { title: "前端加密安全原型验证", desc: "测试 WebCrypto AES-GCM 加密流程及有效负载校验" },
                ],
                proTipsTitle: "密码学专家实用安全建议",
                proTips: [
                  "强烈建议优先使用 AES-GCM 模式，因为它不仅加密数据，还能校验密文是否遭受恶意篡改。",
                  "密码应至少包含大小写字母、数字及特殊符号且长度不少于 12 位，以获得足够的熵值。",
                  "切勿通过同一种通信渠道同时发送密文和密码（例如密文走邮件，密码走电话）。",
                  "每次加密都会生成全新的随机 Salt 与 IV，因此相同明文每次生成的密文不同是符合安全标准的正确现象。",
                ],
                faqTitle: "常见问题解答 (FAQ)",
                faqs: [
                  { q: "我的明文或密码会被上传到服务器吗？", a: "绝对不会！所有加解密运算均在您本地浏览器的 WebCrypto 引擎中 100% 独立完成。" },
                  { q: "AES-256 加密有多安全？", a: "AES-256 是全球政府、军方和金融机构通用的最高安全标准，在物理上无法通过暴力穷举攻破。" },
                  { q: "AES-GCM 与 AES-CBC 有何区别？", a: "AES-GCM 是支持 AEAD 认证加密的现代标准，可防止数据被篡改；AES-CBC 为传统分组加密模式。" },
                  { q: "如果忘记密码还能找回数据吗？", a: "不能。由于严格的密码学原理，没有密码任何人都无法解密还原数据。" },
                  { q: "为什么每次加密相同文字生成的密文都不一样？", a: "因为系统每次都会自动生成全新的随机 Salt 和 IV（初始向量），这是防止重放攻击的标准安全机制。" },
                  { q: "完全免费吗？", a: "是的，本工具完全免费，无任何次数或功能限制。" },
                ],
                relatedTools: [
                  { title: "强密码生成器", desc: "基于密码学随机数生成无法被猜测的强密码", href: "/tools/password-generator/" },
                  { title: "哈希生成器 (MD5 / SHA-256)", desc: "计算文本与文件的单向加密哈希校验值", href: "/tools/hash-generator/" },
                  { title: "Base64 编码与解码", desc: "文本与二进制数据的 Base64 格式双向转换", href: "/tools/base64/" },
                  { title: "JWT 令牌解析器", desc: "实时解码并分析 JSON Web Token 的 Header 与 Payload", href: "/tools/jwt-decoder/" },
                ],
              },
              fr: {
                aboutTitle: "À propos du Chiffreur / Déchiffreur AES-256",
                aboutDesc:
                  "Outil cryptographique gratuit pour le chiffrement et le déchiffrement symétrique de texte selon la norme militaire AES-256 (NIST FIPS 197). Exécuté à 100% localement dans votre navigateur via l'API Web Cryptography du W3C avec dérivation de clé PBKDF2 (100 000 itérations) et sel/IV aléatoires pour une confidentialité absolue.",
                howTitle: "Comment chiffrer et déchiffrer du texte",
                steps: [
                  "Sélectionnez l'onglet '🔒 Chiffrer le Texte' ou '🔓 Déchiffrer le Texte'.",
                  "Saisissez le texte clair à protéger ou collez le texte chiffré en Base64/Hex.",
                  "Définissez votre mot de passe secret ou cliquez sur 'Générer une clé'.",
                  "Configurez l'algorithme (AES-GCM / AES-CBC) et le format de sortie (Base64 / Hex) si nécessaire.",
                  "Cliquez sur le bouton pour exécuter l'opération puis copiez le résultat ou téléchargez un fichier .txt.",
                ],
                featuresTitle: "Fonctionnalités clés de sécurité",
                features: [
                  { title: "Norme militaire AES-256 (GCM & CBC)", desc: "Chiffrement haute sécurité 256 bits avec authentification de l'intégrité des données en mode GCM." },
                  { title: "PBKDF2 à 100 000 itérations & Sel aléatoire", desc: "Protège contre les attaques par force brute et tables arc-en-ciel." },
                  { title: "100% Local dans votre navigateur", desc: "Aucun texte ni mot de passe ne transite par un serveur externe." },
                  { title: "Formats Base64 et Hexadécimal", desc: "Exportez des chaînes prêtes pour la messagerie ou l'analyse binaire." },
                ],
                useCasesTitle: "Cas d'utilisation courants",
                useCases: [
                  { title: "Envoi sécurisé de données sensibles", desc: "Transmettez numéros de compte et identifiants par messagerie en toute sécurité." },
                  { title: "Stockage sécurisé de clés API", desc: "Chiffrez vos tokens OpenAI, AWS et mots de passe pour vos notes locales." },
                  { title: "Communications d'équipe confidentielles", desc: "Échangez des informations réservées aux personnes possédant le mot de passe." },
                  { title: "Prototypage WebCrypto", desc: "Vérifiez les flux de chiffrement AES-GCM pour vos projets web." },
                ],
                proTipsTitle: "Conseils de sécurité cryptographique",
                proTips: [
                  "Le mode AES-GCM est fortement recommandé car il intègre une protection contre l'altération des données.",
                  "Choisissez un mot de passe d'au moins 12 caractères combinant majuscules, minuscules, chiffres et symboles.",
                  "Ne transmettez jamais le texte chiffré et le mot de passe par le même canal de communication.",
                  "Le texte chiffré varie à chaque exécution car un nouveau sel et IV sont générés à chaque fois.",
                ],
                faqTitle: "Foire Aux Questions (FAQ)",
                faqs: [
                  { q: "Mes données ou mots de passe sont-ils envoyés sur un serveur ?", a: "Jamais ! Toutes les opérations sont traitées 100% localement dans la mémoire de votre navigateur via l'API Web Crypto." },
                  { q: "Quel est le niveau de sécurité d'AES-256 ?", a: "C'est le standard mondial utilisé par les banques et les gouvernements. Il est inviolable par force brute." },
                  { q: "Quelle est la différence entre AES-GCM et AES-CBC ?", a: "AES-GCM est un mode moderne avec authentification intégrée (AEAD), garantissant que le texte n'a pas été modifié." },
                  { q: "Puis-je récupérer mes données en cas d'oubli du mot de passe ?", a: "Non. Aucune porte dérobée n'existe sans le mot de passe valide." },
                  { q: "Pourquoi le texte chiffré change-t-il à chaque fois ?", a: "Parce qu'un nouveau sel et un IV aléatoire sont créés à chaque opération pour éviter les attaques par rejeu." },
                  { q: "Cet outil est-il totalement gratuit ?", a: "Oui, 100% gratuit et sans aucune limitation." },
                ],
                relatedTools: [
                  { title: "Générateur de Mots de Passe", desc: "Générez des mots de passe ultra-sécurisés et aléatoires", href: "/tools/password-generator/" },
                  { title: "Générateur de Hash (MD5 / SHA-256)", desc: "Calculez des empreintes cryptographiques pour vérifier l'intégrité", href: "/tools/hash-generator/" },
                  { title: "Convertisseur Base64", desc: "Encodez et décodez du texte et des données en Base64", href: "/tools/base64/" },
                  { title: "Décodeur JWT", desc: "Inspectez les tokens JSON Web Token en temps réel", href: "/tools/jwt-decoder/" },
                ],
              },
            };

            const g = content[locale as keyof typeof content] || content.ko;

            return (
              <ToolGuide
                badgeText="100% Free & Browser-Native"
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
        </div>
      </main>

      <Footer />
    </>
  );
}
