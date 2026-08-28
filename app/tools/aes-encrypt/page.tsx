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
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  FileText,
  Sliders,
  FileCode2,
  RefreshCw
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
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
    guideTitle: "AES 텍스트 암호화 완벽 가이드",
    step1Title: "1. 텍스트 및 비밀번호 입력",
    step1Desc: "보호하고 싶은 원본 글이나 민감한 정보(계좌, 패스워드)를 적고 나만의 비밀키를 설정합니다.",
    step2Title: "2. AES-256 군사급 암호화 실행",
    step2Desc: "암호화 버튼을 누르면 브라우저 WebCrypto 엔진이 PBKDF2(100,000회 연산)와 솔트(Salt)를 결합하여 해킹 불가능한 암호문으로 변환합니다.",
    step3Title: "3. 안전한 공유 및 복호화",
    step3Desc: "생성된 암호문을 카카오톡/이메일로 전송하고, 상대방은 같은 비밀번호를 입력해 원문을 확인합니다.",
    faq1Q: "제가 입력한 텍스트나 비밀번호가 서버로 전송되나요?",
    faq1A: "전혀 전송되지 않습니다! desktools.run의 모든 암호화 연산은 브라우저 내장 WebCrypto API를 통해 100% 사용자의 기기 내부 메모리에서만 연산됩니다.",
    faq2Q: "AES-256 암호화는 얼마나 안전한가요?",
    faq2A: "AES-256은 미국 정부 및 군사 기관에서 기밀문서 보호에 사용하는 최고 등급 대칭키 암호화 표준입니다. 현재 전 세계 슈퍼컴퓨터를 총동원해도 비밀번호 없이 해킹하는 것은 물리적으로 불가능합니다.",
    faq3Q: "비밀번호를 분실하면 복구할 수 있나요?",
    faq3A: "아닙니다. 완벽한 암호학적 수학 알고리즘을 사용하므로 비밀번호가 없으면 원 작성자도 복구할 수 없습니다. 비밀번호를 반드시 메모해 두세요."
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
    guideTitle: "How to Use AES Text Encryption",
    step1Title: "1. Enter Text & Passphrase",
    step1Desc: "Type your secret message and choose a strong passphrase.",
    step2Title: "2. Encrypt with AES-256",
    step2Desc: "Uses PBKDF2 (100,000 rounds) + random Salt/IV to produce an unbreakable ciphertext.",
    step3Title: "3. Share & Decrypt",
    step3Desc: "Send the ciphertext safely. The recipient decrypts it with the secret passphrase.",
    faq1Q: "Is my text or password sent to any server?",
    faq1A: "Never! All cryptographic calculations run 100% locally in your browser via the Web Crypto API.",
    faq2Q: "How secure is AES-256?",
    faq2A: "AES-256 is the gold standard used by governments, banks, and military institutions worldwide.",
    faq3Q: "Can I recover lost passphrases?",
    faq3A: "No. Standard cryptographic security prevents any backdoor access without the correct passphrase."
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
    guideTitle: "AESテキスト暗号化の使い方",
    step1Title: "1. テキストとパスワードを入力",
    step1Desc: "保護したいテキストと秘密のパスワードを入力します。",
    step2Title: "2. AES-256で安全に暗号化",
    step2Desc: "ブラウザ内WebCryptoエンジンにより即座に暗号文へ変換されます。",
    step3Title: "3. 安全に共有して復号化",
    step3Desc: "暗号文を相手に送り、同じパスワードを入力して復号化します。",
    faq1Q: "サーバーにデータが送信されますか？",
    faq1A: "一切送信されません。すべてお使いのブラウザ内部で安全に処理されます。",
    faq2Q: "AES-256の安全性は？",
    faq2A: "国家機関や金融機関で採用されている世界最高水準の暗号化規格です。",
    faq3Q: "パスワードを忘れたら？",
    faq3A: "暗号化の仕様上、パスワードがないと復元できません。"
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
    guideTitle: "Guía de Cifrado AES-256",
    step1Title: "1. Introduce Texto y Clave",
    step1Desc: "Escribe tu mensaje y define tu clave secreta.",
    step2Title: "2. Cifrado Local Ultraseguro",
    step2Desc: "Se ejecuta 100% en tu navegador mediante Web Crypto API.",
    step3Title: "3. Comparte y Descifra",
    step3Desc: "Envía el texto cifrado y descífralo con la misma clave.",
    faq1Q: "¿Se envían mis datos a algún servidor?",
    faq1A: "¡No! Todo el procesamiento se realiza localmente en tu navegador.",
    faq2Q: "¿Qué tan seguro es AES-256?",
    faq2A: "Es el estándar militar utilizado mundialmente por bancos y gobiernos.",
    faq3Q: "¿Puedo recuperar una clave olvidada?",
    faq3A: "No, la seguridad criptográfica no permite puertas traseras."
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
    guideTitle: "AES 文本加密解密使用指南",
    step1Title: "1. 输入文本与密码",
    step1Desc: "输入待保护的文字内容并设置专有密码。",
    step2Title: "2. 本地军工级加密",
    step2Desc: "采用 PBKDF2(10万次运算)+Salt 生成无法被破解的高强度密文。",
    step3Title: "3. 密文分享与安全解密",
    step3Desc: "将密文发送给对方，对方输入相同密码即可秒速还原明文。",
    faq1Q: "我的明文或密码会上传到服务器吗？",
    faq1A: "绝对不会！所有密码学运算均在您的浏览器本地内存中 100% 独立执行。",
    faq2Q: "AES-256 加密有多安全？",
    faq2A: "AES-256 是全球政府与金融机构通用的最高安全加密标准，无密码强破在物理上不可行。",
    faq3Q: "如果忘记密码能找回吗？",
    faq3A: "无法找回。由于严格的安全规范，无密码状态下任何人都无法破解还原。"
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
    guideTitle: "Guide de Chiffrement AES-256",
    step1Title: "1. Saisir le Texte et la Clé",
    step1Desc: "Rédigez votre message et définissez votre mot de passe.",
    step2Title: "2. Chiffrement Local Sécurisé",
    step2Desc: "Traitement 100% local dans votre navigateur via Web Crypto API.",
    step3Title: "3. Partager et Déchiffrer",
    step3Desc: "Transmettez le texte chiffré et déchiffrez-le avec la même clé.",
    faq1Q: "Mes données sont-elles envoyées sur un serveur ?",
    faq1A: "Jamais ! Toutes les opérations s'exécutent directement dans votre navigateur.",
    faq2Q: "Le chiffrement AES-256 est-il sûr ?",
    faq2A: "C'est le standard de sécurité utilisé par les banques et gouvernements du monde entier.",
    faq3Q: "Puis-je récupérer un mot de passe oublié ?",
    faq3A: "Non, aucune porte dérobée n'existe sans le mot de passe valide."
  }
};

export default function AesEncryptPage() {
  const { locale } = useLocale();
  const t = I18N[locale as keyof typeof I18N] || I18N.ko;

  const [mode, setMode] = useState<Mode>("encrypt");
  const [inputText, setInputText] = useState<string>("");
  const [passphrase, setPassphrase] = useState<string>("");
  const [showPassphrase, setShowPassphrase] = useState<boolean>(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>("AES-GCM");
  const [format, setFormat] = useState<Format>("base64");
  const [showOptions, setShowOptions] = useState<boolean>(false);

  const [outputText, setOutputText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Random password generator helper
  const handleGenerateKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
    const arr = new Uint8Array(18);
    window.crypto.getRandomValues(arr);
    const pass = Array.from(arr).map(b => chars[b % chars.length]).join("");
    setPassphrase(pass);
    setShowPassphrase(true);
  };

  // Sample Text
  const handleLoadSample = () => {
    if (mode === "encrypt") {
      setInputText(
        "비밀 메모:\n- 국민은행 123-4567-89012\n- 개인 금고 비밀번호: 7890#\n- API Token: sk_live_9837198273918273"
      );
      if (!passphrase) {
        setPassphrase("desktools2026!Secret");
      }
    }
  };

  // Clear inputs
  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setErrorMessage("");
  };

  // WebCrypto Encrypt
  const executeEncrypt = useCallback(async () => {
    if (!inputText.trim() || !passphrase.trim()) {
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
        enc.encode(inputText)
      );

      const cipherArray = new Uint8Array(cipherBuffer);
      const combined = new Uint8Array(salt.length + iv.length + cipherArray.length);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(cipherArray, salt.length + iv.length);

      if (format === "hex") {
        const hex = Array.from(combined).map(b => b.toString(16).padStart(2, "0")).join("");
        setOutputText(hex);
      } else {
        let binary = "";
        const len = combined.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(combined[i]);
        }
        setOutputText(btoa(binary));
      }
    } catch (err) {
      console.error("Encrypt error:", err);
      setErrorMessage("암호화 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, passphrase, algorithm, format, t.errEmpty]);

  // WebCrypto Decrypt
  const executeDecrypt = useCallback(async () => {
    if (!inputText.trim() || !passphrase.trim()) {
      setErrorMessage(t.errEmpty);
      return;
    }
    setErrorMessage("");
    setIsProcessing(true);

    try {
      let combined: Uint8Array;
      const raw = inputText.trim();

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
      setOutputText(dec.decode(decryptedBuffer));
    } catch (err) {
      console.error("Decrypt error:", err);
      setErrorMessage(t.errDecrypt);
      setOutputText("");
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, passphrase, algorithm, format, t.errEmpty, t.errDecrypt]);

  // Copy to clipboard
  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download .txt
  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "encrypt" ? "encrypted_ciphertext.txt" : "decrypted_plaintext.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
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
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--brand-mid)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
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
              onClick={() => {
                setMode("encrypt");
                setOutputText("");
                setErrorMessage("");
              }}
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
              onClick={() => {
                setMode("decrypt");
                setOutputText("");
                setErrorMessage("");
              }}
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
                  {inputText && (
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
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
                    >
                      <Trash2 size={13} />
                      {t.clearBtn}
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setErrorMessage("");
                }}
                placeholder={mode === "encrypt" ? t.inputPlaceholderEnc : t.inputPlaceholderDec}
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
                  fontFamily: mode === "decrypt" ? "monospace" : "inherit",
                }}
              />
            </div>

            {/* Secret Key Input Section */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  <KeyRound size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", color: mode === "encrypt" ? "var(--brand-mid)" : "#10b981" }} />
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
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
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
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
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
            {outputText && (
              <div
                style={{
                  marginTop: "32px",
                  paddingTop: "28px",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {mode === "encrypt" ? t.outputLabelEnc : t.outputLabelDec}
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={handleCopy}
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
                      onClick={handleDownload}
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
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    whiteSpace: "pre-wrap",
                    maxHeight: "300px",
                    overflowY: "auto",
                    lineHeight: 1.6,
                  }}
                >
                  {outputText}
                </div>
              </div>
            )}
          </div>

          {/* Tool Guide */}
          <ToolGuide
            aboutTitle={t.guideTitle}
            aboutDesc={t.subtitle}
            steps={[
              `${t.step1Title}: ${t.step1Desc}`,
              `${t.step2Title}: ${t.step2Desc}`,
              `${t.step3Title}: ${t.step3Desc}`,
            ]}
            faqs={[
              { q: t.faq1Q, a: t.faq1A },
              { q: t.faq2Q, a: t.faq2A },
              { q: t.faq3Q, a: t.faq3A },
            ]}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
