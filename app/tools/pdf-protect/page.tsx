"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";
import {
  Lock,
  Unlock,
  Upload,
  ArrowLeft,
  Trash2,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  FileText
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

interface LoadedPdf {
  file: File;
  name: string;
  originalSize: number;
  pageCount: number;
}

const I18N = {
  ko: {
    back: "전체 도구 목록",
    title: "PDF 비밀번호 설정 / 암호화",
    badge: "100% 브라우저 암호화",
    subtitle: "중요한 계약서, 급여명세서, 개인 PDF 문서에 비밀번호를 설정하여 안전하게 암호화하고 잠급니다.",
    dropzoneTitle: "여기에 PDF 파일을 드래그하거나 클릭하여 선택하세요",
    dropzoneHint: "1개의 PDF 파일을 선택하여 비밀번호를 설정합니다.",
    dropzoneBtn: "PDF 파일 선택",
    fileInfo: "문서 정보",
    pageCount: "페이지 수",
    fileSize: "파일 크기",
    passwordLabel: "열람용 비밀번호 (User Password)",
    passwordPlaceholder: "PDF를 열 때 입력할 비밀번호 입력",
    confirmLabel: "비밀번호 확인",
    confirmPlaceholder: "비밀번호를 한 번 더 입력하세요",
    passwordMismatch: "비밀번호가 일치하지 않습니다.",
    passwordMatched: "비밀번호가 일치합니다.",
    strengthWeak: "보안 약함 (6자 이상 권장)",
    strengthMedium: "보안 보통",
    strengthStrong: "보안 강력 (안전)",
    btnEncrypt: "PDF 암호화 및 다운로드",
    encrypting: "PDF 암호화 중...",
    successTitle: "PDF 암호화가 완료되었습니다!",
    successDesc: "설정하신 비밀번호를 입력해야만 문서를 열 수 있습니다.",
    downloadBtn: "암호화된 PDF 다운로드",
    resetBtn: "다른 파일 암호화",
    guideTitle: "PDF 비밀번호 설정 완벽 가이드",
    step1Title: "1. PDF 문서 업로드",
    step1Desc: "비밀번호를 걸어 보호하고 싶은 PDF 문서를 드래그하거나 선택하여 불러옵니다.",
    step2Title: "2. 강력한 비밀번호 설정",
    step2Desc: "문서를 열 때 필요한 열람용 비밀번호를 입력하고 확인란에 다시 입력합니다.",
    step3Title: "3. 1초 만에 안전한 암호화 PDF 다운로드",
    step3Desc: "암호화 버튼을 누르면 서버 전송 없이 브라우저에서 표준 암호화가 적용된 PDF를 즉시 내려받습니다.",
    faq1Q: "비밀번호를 설정할 때 파일이 서버로 전송되나요?",
    faq1A: "전혀 전송되지 않습니다! desktools.run의 모든 암호화 처리는 브라우저 내부 WebCrypto 및 순수 자바스크립트 엔진에서 100% 로컬로 수행되므로 비밀번호나 문서 내용이 외부로 유출될 염려가 전혀 없습니다.",
    faq2Q: "암호화된 PDF는 어떤 뷰어에서 열 수 있나요?",
    faq2A: "Adobe Acrobat Reader, 크롬/엣지/사파리 브라우저, 스마트폰 기본 PDF 뷰어 등 전 세계 모든 표준 PDF 리더에서 비밀번호를 입력하여 정상적으로 열 수 있습니다.",
    faq3Q: "비밀번호를 분실하면 복구할 수 있나요?",
    faq3A: "표준 보안 규격에 따라 암호화되므로 비밀번호를 분실하면 작성자 본인도 복구할 수 없습니다. 설정하신 비밀번호를 꼭 안전한 곳에 메모해 두세요."
  },
  en: {
    back: "All Tools",
    title: "PDF Protect & Encrypt",
    badge: "100% Client-Side Encryption",
    subtitle: "Protect sensitive PDF documents with secure password encryption. Runs 100% locally in your browser.",
    dropzoneTitle: "Drag & drop your PDF file here, or click to browse",
    dropzoneHint: "Select 1 PDF document to encrypt with a secure password",
    dropzoneBtn: "Select PDF File",
    fileInfo: "Document Information",
    pageCount: "Pages",
    fileSize: "Size",
    passwordLabel: "Open Password (User Password)",
    passwordPlaceholder: "Enter password required to open document",
    confirmLabel: "Confirm Password",
    confirmPlaceholder: "Re-enter the password",
    passwordMismatch: "Passwords do not match.",
    passwordMatched: "Passwords match.",
    strengthWeak: "Weak password (recommend 6+ chars)",
    strengthMedium: "Medium security",
    strengthStrong: "Strong & secure password",
    btnEncrypt: "Encrypt & Protect PDF",
    encrypting: "Encrypting PDF...",
    successTitle: "PDF Protected Successfully!",
    successDesc: "Your document is now encrypted and requires the password to open.",
    downloadBtn: "Download Protected PDF",
    resetBtn: "Protect Another File",
    guideTitle: "How to Password-Protect a PDF",
    step1Title: "1. Upload PDF Document",
    step1Desc: "Drag and drop the PDF file you want to secure.",
    step2Title: "2. Set Strong Password",
    step2Desc: "Type the open password and verify it in the confirmation field.",
    step3Title: "3. Download Encrypted PDF",
    step3Desc: "Click encrypt to apply standard PDF encryption directly in your browser without uploading to any server.",
    faq1Q: "Is my document uploaded to a server?",
    faq1A: "Never! All encryption calculations are executed 100% on your device inside your browser.",
    faq2Q: "Which PDF readers support the protected document?",
    faq2A: "All standard PDF viewers including Adobe Acrobat, Chrome, Safari, iOS Files, and Android PDF readers.",
    faq3Q: "What if I forget my password?",
    faq3A: "Because it uses standard cryptographic encryption, lost passwords cannot be recovered. Keep your password safe."
  },
  ja: {
    back: "全ツール一覧",
    title: "PDF パスワード設定・暗号化",
    badge: "100% ブラウザ完結",
    subtitle: "重要なPDFファイルにパスワードを設定して安全に保護・暗号化します。",
    dropzoneTitle: "ここにPDFファイルをドラッグ＆ドロップ",
    dropzoneHint: "暗号化するPDFファイルを選択してください",
    dropzoneBtn: "PDFファイルを選択",
    fileInfo: "ドキュメント情報",
    pageCount: "ページ数",
    fileSize: "サイズ",
    passwordLabel: "閲覧用パスワード",
    passwordPlaceholder: "PDFを開くためのパスワードを入力",
    confirmLabel: "パスワードの確認",
    confirmPlaceholder: "パスワードを再入力",
    passwordMismatch: "パスワードが一致しません。",
    passwordMatched: "パスワードが一致しました。",
    strengthWeak: "強度が低いです",
    strengthMedium: "普通の強度",
    strengthStrong: "安全なパスワード",
    btnEncrypt: "PDFを暗号化して保存",
    encrypting: "暗号化中...",
    successTitle: "PDFの暗号化が完了しました！",
    successDesc: "設定したパスワードを入力しないとファイルを開けません。",
    downloadBtn: "暗号化PDFをダウンロード",
    resetBtn: "別のファイルを暗号化",
    guideTitle: "PDFパスワード保護の使い方",
    step1Title: "1. PDFファイルをアップロード",
    step1Desc: "保護したいPDFファイルをドラッグ＆ドロップします。",
    step2Title: "2. パスワードを設定",
    step2Desc: "ファイルを開くためのパスワードを入力・確認します。",
    step3Title: "3. 1秒で暗号化PDFをダウンロード",
    step3Desc: "サーバーに送信せずブラウザ内で安全に暗号化されたPDFを保存します。",
    faq1Q: "ファイルが外部サーバーに送信されますか？",
    faq1A: "一切送信されません。すべてお使いの端末（ブラウザ）内で安全に処理されます。",
    faq2Q: "どのビューワーで開けますか？",
    faq2A: "Adobe Acrobat、Chrome、Edge、Safari、スマートフォン標準ビューワーなどすべてに対応しています。",
    faq3Q: "パスワードを忘れた場合は？",
    faq3A: "暗号化されているため復元はできません。設定したパスワードは必ず控えておいてください。"
  },
  es: {
    back: "Todas las herramientas",
    title: "Proteger PDF con Contraseña",
    badge: "100% en tu navegador",
    subtitle: "Protege y cifra documentos PDF confidenciales con contraseña de forma segura.",
    dropzoneTitle: "Arrastra y suelta tu archivo PDF aquí",
    dropzoneHint: "Selecciona un documento PDF para proteger",
    dropzoneBtn: "Seleccionar PDF",
    fileInfo: "Información del Documento",
    pageCount: "Páginas",
    fileSize: "Tamaño",
    passwordLabel: "Contraseña de Apertura",
    passwordPlaceholder: "Introduce la contraseña para abrir",
    confirmLabel: "Confirmar Contraseña",
    confirmPlaceholder: "Vuelve a escribir la contraseña",
    passwordMismatch: "Las contraseñas no coinciden.",
    passwordMatched: "Las contraseñas coinciden.",
    strengthWeak: "Contraseña débil",
    strengthMedium: "Seguridad media",
    strengthStrong: "Contraseña fuerte y segura",
    btnEncrypt: "Cifrar y Descargar PDF",
    encrypting: "Cifrando PDF...",
    successTitle: "¡PDF Protegido con Éxito!",
    successDesc: "Tu documento está cifrado y requiere contraseña para abrirse.",
    downloadBtn: "Descargar PDF Protegido",
    resetBtn: "Proteger Otro Archivo",
    guideTitle: "Guía para Proteger PDF",
    step1Title: "1. Sube tu archivo PDF",
    step1Desc: "Arrastra el PDF que deseas asegurar.",
    step2Title: "2. Establece una contraseña",
    step2Desc: "Introduce y confirma tu clave de acceso.",
    step3Title: "3. Descarga al instante",
    step3Desc: "Cifrado 100% en tu navegador sin enviar datos a servidores externos.",
    faq1Q: "¿Se sube mi archivo a algún servidor?",
    faq1A: "¡No! Todo el cifrado se realiza localmente en tu navegador para total privacidad.",
    faq2Q: "¿Es compatible con todos los visores de PDF?",
    faq2A: "Sí, con Adobe Acrobat, Chrome, Safari, Edge y visores móviles estándar.",
    faq3Q: "¿Qué pasa si olvido la contraseña?",
    faq3A: "Por motivos de seguridad criptográfica, las contraseñas olvidadas no se pueden recuperar."
  },
  zh: {
    back: "返回所有工具",
    title: "PDF 密码保护与加密",
    badge: "100% 本地浏览器加密",
    subtitle: "为机密 PDF 文件设置安全密码并加密锁定，完全在本地运行保障隐私。",
    dropzoneTitle: "将 PDF 文件拖拽到此处，或点击上传",
    dropzoneHint: "选择单个 PDF 文档设置安全密码保护",
    dropzoneBtn: "选择 PDF 文件",
    fileInfo: "文档信息",
    pageCount: "页数",
    fileSize: "大小",
    passwordLabel: "打开密码 (User Password)",
    passwordPlaceholder: "请输入打开 PDF 所需的密码",
    confirmLabel: "确认密码",
    confirmPlaceholder: "请再次输入密码",
    passwordMismatch: "两次输入的密码不一致。",
    passwordMatched: "密码一致。",
    strengthWeak: "密码较弱（建议6位以上）",
    strengthMedium: "密码强度中等",
    strengthStrong: "强密码（安全）",
    btnEncrypt: "立即加密并下载 PDF",
    encrypting: "正在加密 PDF...",
    successTitle: "PDF 加密成功！",
    successDesc: "您的文档已加密锁定，需输入密码方可打开浏览。",
    downloadBtn: "下载加密后的 PDF",
    resetBtn: "加密其他文件",
    guideTitle: "PDF 密码加密使用指南",
    step1Title: "1. 上传 PDF 文件",
    step1Desc: "拖入需要加密保护的 PDF 文件。",
    step2Title: "2. 设置安全密码",
    step2Desc: "输入并确认用于打开文档的安全密码。",
    step3Title: "3. 极速本地下载",
    step3Desc: "零服务器上传，纯浏览器端极速完成标准加密并下载。",
    faq1Q: "我的文件会上传到服务器吗？",
    faq1A: "绝对不会！所有加密算法均在您的浏览器本地执行，100% 保护文档隐私。",
    faq2Q: "加密后的 PDF 可以在手机或电脑上正常打开吗？",
    faq2A: "支持 Adobe Acrobat、Chrome、Edge、Safari 以及 iOS/Android 任意标准 PDF 阅读器。",
    faq3Q: "如果忘记密码能找回吗？",
    faq3A: "由于采用了行业标准高强度加密，遗忘密码后无法破解找回，请务必妥善记录密码。"
  },
  fr: {
    back: "Tous les outils",
    title: "Protéger et Chiffrer un PDF",
    badge: "100% Chiffrement Local",
    subtitle: "Protégez vos documents PDF sensibles avec un mot de passe sécurisé en toute confidentialité.",
    dropzoneTitle: "Glissez-déposez votre fichier PDF ici",
    dropzoneHint: "Sélectionnez 1 fichier PDF à chiffrer",
    dropzoneBtn: "Sélectionner un fichier PDF",
    fileInfo: "Informations du Document",
    pageCount: "Pages",
    fileSize: "Taille",
    passwordLabel: "Mot de passe d'ouverture",
    passwordPlaceholder: "Entrez le mot de passe pour ouvrir le PDF",
    confirmLabel: "Confirmer le mot de passe",
    confirmPlaceholder: "Retapez le mot de passe",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordMatched: "Les mots de passe correspondent.",
    strengthWeak: "Mot de passe faible",
    strengthMedium: "Sécurité moyenne",
    strengthStrong: "Mot de passe fort et sécurisé",
    btnEncrypt: "Chiffrer et Télécharger le PDF",
    encrypting: "Chiffrement du PDF en cours...",
    successTitle: "PDF Protégé avec Succès !",
    successDesc: "Votre document est maintenant chiffré et nécessite le mot de passe.",
    downloadBtn: "Télécharger le PDF Chiffré",
    resetBtn: "Protéger un Autre Fichier",
    guideTitle: "Guide de Protection PDF",
    step1Title: "1. Importer le fichier PDF",
    step1Desc: "Déposez le document PDF que vous souhaitez verrouiller.",
    step2Title: "2. Définir le mot de passe",
    step2Desc: "Saisissez et confirmez le mot de passe d'ouverture.",
    step3Title: "3. Télécharger instantanément",
    step3Desc: "Traitement 100% local dans votre navigateur sans téléversement sur serveur.",
    faq1Q: "Mon fichier est-il envoyé sur un serveur ?",
    faq1A: "Jamais ! Toutes les opérations sont traitées directement dans votre navigateur.",
    faq2Q: "Est-ce compatible avec tous les lecteurs PDF ?",
    faq2A: "Oui, avec Adobe Acrobat, Chrome, Safari, Edge et tous les lecteurs mobiles.",
    faq3Q: "Que faire si j'oublie le mot de passe ?",
    faq3A: "Le chiffrement standard ne permet pas de récupérer un mot de passe perdu. Notez-le soigneusement."
  }
};

export default function PdfProtectPage() {
  const { locale, t } = useLocale();
  const txt = I18N[locale as keyof typeof I18N] || I18N.ko;

  const [pdfFile, setPdfFile] = useState<LoadedPdf | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [encryptedResult, setEncryptedResult] = useState<{
    url: string;
    filename: string;
    size: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle uploaded file
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const file = Array.from(files).find((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      setPdfFile({
        file,
        name: file.name,
        originalSize: file.size,
        pageCount: count,
      });
      setEncryptedResult(null);
    } catch {
      setPdfFile({
        file,
        name: file.name,
        originalSize: file.size,
        pageCount: 1,
      });
      setEncryptedResult(null);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleReset = () => {
    setPdfFile(null);
    setPassword("");
    setConfirmPassword("");
    setEncryptedResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Password strength calculation
  const getStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4);
  };

  const strength = getStrength(password);

  const isPasswordValid = password.length > 0 && password === confirmPassword;

  // Execute Encryption
  const handleEncrypt = async () => {
    if (!pdfFile || !isPasswordValid) return;

    setIsEncrypting(true);
    await new Promise((resolve) => setTimeout(resolve, 60));

    try {
      const buffer = await pdfFile.file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      // Perform client-side standard PDF encryption (AES-256)
      const encryptedBytes = await encryptPDF(uint8, password);

      const blob = new Blob([encryptedBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const outName = pdfFile.name.replace(/\.pdf$/i, "_protected.pdf");

      setEncryptedResult({
        url,
        filename: outName,
        size: blob.size,
      });
    } catch (err) {
      console.error("Encryption error:", err);
      alert("PDF 암호화 중 오류가 발생했습니다. 암호화되지 않은 일반 PDF 파일을 사용해주세요.");
    } finally {
      setIsEncrypting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <Header />

      <main style={{ flex: 1, paddingBottom: "80px" }}>
        {/* ── Breadcrumb & Title ──────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 16px" }}>
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
            {t("pdfProtect.back") || txt.back}
          </Link>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f87171",
                  }}
                >
                  <Lock size={20} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                  {t("pdfProtect.title") || txt.title}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
                {t("pdfProtect.subtitle") || txt.subtitle}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={12} />
              {t("pdfProtect.badge") || txt.badge}
            </div>
          </div>
        </section>

        {/* ── Main Workspace ───────────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {!pdfFile ? (
            /* Upload Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="glass-card"
              style={{
                padding: "64px 32px",
                textAlign: "center",
                cursor: "pointer",
                border: isDragging ? "2px dashed #f87171" : "2px dashed var(--border-subtle)",
                background: isDragging ? "rgba(239,68,68,0.08)" : "var(--glass-bg)",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf, .pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFiles(e.target.files);
                  }
                }}
              />
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "rgba(239,68,68,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f87171",
                }}
              >
                <Upload size={32} />
              </div>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {t("pdfProtect.dropPrompt") || txt.dropzoneTitle}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {t("pdfProtect.dropHint") || txt.dropzoneHint}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: "32px", borderRadius: "16px", marginBottom: "48px" }}>
              {!encryptedResult ? (
                /* Config & Password Setting Form */
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* File Selected Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderRadius: "12px",
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(99, 102, 241, 0.22)",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", wordBreak: "break-all" }}>
                        {pdfFile.name}
                      </div>
                      <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {pdfFile.pageCount} {txt.pageCount} • {formatBytes(pdfFile.originalSize)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-muted)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
                  >
                    <Trash2 size={14} />
                    {locale === "ko" ? "파일 교체" : "Change"}
                  </button>
                </div>

                {/* Password Setting Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {/* Password 1 */}
                  <div>
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                      <KeyRound size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", color: "var(--brand-mid)" }} />
                      {txt.passwordLabel}
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={txt.passwordPlaceholder}
                        style={{
                          width: "100%",
                          padding: "12px 42px 12px 14px",
                          borderRadius: "10px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--input-border)",
                          color: "var(--text-primary)",
                          fontSize: "14.5px",
                          outline: "none",
                          transition: "border 0.2s",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div style={{ marginTop: "8px" }}>
                        <div style={{ display: "flex", gap: "4px", height: "4px", marginBottom: "6px" }}>
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              style={{
                                flex: 1,
                                borderRadius: "2px",
                                background:
                                  strength >= level
                                    ? strength <= 1
                                      ? "#ef4444"
                                      : strength <= 2
                                      ? "#f59e0b"
                                      : "#10b981"
                                    : "var(--border-subtle)",
                                transition: "all 0.2s",
                              }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: "11.5px", color: strength <= 1 ? "#ef4444" : strength <= 2 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
                          {strength <= 1 ? txt.strengthWeak : strength <= 2 ? txt.strengthMedium : txt.strengthStrong}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                      <CheckCircle2 size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", color: "var(--brand-mid)" }} />
                      {txt.confirmLabel}
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={txt.confirmPlaceholder}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "var(--input-bg)",
                        border: `1px solid ${
                          confirmPassword
                            ? isPasswordValid
                              ? "#10b981"
                              : "#ef4444"
                            : "var(--input-border)"
                        }`,
                        color: "var(--text-primary)",
                        fontSize: "14.5px",
                        outline: "none",
                      }}
                    />
                    {confirmPassword && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginTop: "6px",
                          fontSize: "12px",
                          color: isPasswordValid ? "#10b981" : "#ef4444",
                          fontWeight: 600,
                        }}
                      >
                        {isPasswordValid ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                        {isPasswordValid ? txt.passwordMatched : txt.passwordMismatch}
                      </div>
                    )}
                  </div>
                </div>

                {/* Encrypt Submit Button */}
                <button
                  onClick={handleEncrypt}
                  disabled={!isPasswordValid || isEncrypting}
                  className="btn-glow"
                  style={{
                    padding: "14px 24px",
                    fontSize: "15px",
                    fontWeight: 700,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: !isPasswordValid || isEncrypting ? 0.5 : 1,
                    cursor: !isPasswordValid || isEncrypting ? "not-allowed" : "pointer",
                    marginTop: "8px",
                  }}
                >
                  {isEncrypting ? (
                    <>
                      <div className="spinner" style={{ width: "16px", height: "16px" }} />
                      {txt.encrypting}
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      {txt.btnEncrypt}
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Success Result Card */
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <ShieldCheck size={32} />
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                  {txt.successTitle}
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "480px", margin: "0 auto 24px" }}>
                  {txt.successDesc}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <a
                    href={encryptedResult.url}
                    download={encryptedResult.filename}
                    className="btn-glow"
                    style={{
                      padding: "12px 24px",
                      fontSize: "14px",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Download size={16} />
                    {txt.downloadBtn}
                  </a>

                  <button
                    onClick={handleReset}
                    style={{
                      background: "var(--btn-secondary-bg)",
                      border: "1px solid var(--btn-secondary-border)",
                      color: "var(--text-primary)",
                      padding: "12px 20px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s",
                    }}
                  >
                    <RotateCcw size={15} />
                    {txt.resetBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
          )}
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────────── */}
        <ToolGuide
          badgeText={t("pdfProtect.guide.badge")}
          aboutTitle={t("pdfProtect.guide.aboutTitle")}
          aboutDesc={t("pdfProtect.guide.aboutDesc")}
          howTitle={t("pdfProtect.guide.howTitle")}
          steps={[
            t("pdfProtect.guide.step1"),
            t("pdfProtect.guide.step2"),
            t("pdfProtect.guide.step3"),
          ]}
          featuresTitle={t("pdfProtect.guide.featuresTitle")}
          features={[
            {
              icon: <ShieldCheck size={16} />,
              title: t("pdfProtect.guide.feat1Title"),
              desc: t("pdfProtect.guide.feat1Desc"),
            },
            {
              icon: <Lock size={16} />,
              title: t("pdfProtect.guide.feat2Title"),
              desc: t("pdfProtect.guide.feat2Desc"),
            },
            {
              icon: <KeyRound size={16} />,
              title: t("pdfProtect.guide.feat3Title"),
              desc: t("pdfProtect.guide.feat3Desc"),
            },
            {
              icon: <FileText size={16} />,
              title: t("pdfProtect.guide.feat4Title"),
              desc: t("pdfProtect.guide.feat4Desc"),
            },
          ]}
          useCasesTitle={t("pdfProtect.guide.useCasesTitle")}
          useCases={[
            {
              icon: "💼",
              title: t("pdfProtect.guide.uc1Title"),
              desc: t("pdfProtect.guide.uc1Desc"),
            },
            {
              icon: "📊",
              title: t("pdfProtect.guide.uc2Title"),
              desc: t("pdfProtect.guide.uc2Desc"),
            },
            {
              icon: "🤝",
              title: t("pdfProtect.guide.uc3Title"),
              desc: t("pdfProtect.guide.uc3Desc"),
            },
            {
              icon: "🪪",
              title: t("pdfProtect.guide.uc4Title"),
              desc: t("pdfProtect.guide.uc4Desc"),
            },
          ]}
          proTips={{
            title: t("pdfProtect.guide.tipsTitle"),
            tips: [
              t("pdfProtect.guide.tip1"),
              t("pdfProtect.guide.tip2"),
              t("pdfProtect.guide.tip3"),
            ],
          }}
          faqs={[
            { q: t("pdfProtect.guide.faq1Q"), a: t("pdfProtect.guide.faq1A") },
            { q: t("pdfProtect.guide.faq2Q"), a: t("pdfProtect.guide.faq2A") },
            { q: t("pdfProtect.guide.faq3Q"), a: t("pdfProtect.guide.faq3A") },
            { q: t("pdfProtect.guide.faq4Q"), a: t("pdfProtect.guide.faq4A") },
            { q: t("pdfProtect.guide.faq5Q"), a: t("pdfProtect.guide.faq5A") },
            { q: t("pdfProtect.guide.faq6Q"), a: t("pdfProtect.guide.faq6A") },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}
