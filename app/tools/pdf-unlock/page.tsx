"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import {
  Unlock,
  Upload,
  ArrowLeft,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  FileText,
  ShieldCheck,
  Info
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

interface LoadedPdf {
  file: File;
  name: string;
  originalSize: number;
}

const I18N = {
  ko: {
    back: "전체 도구 목록",
    title: "PDF 비밀번호 해제 / 잠금 풀기",
    badge: "100% 브라우저 복호화",
    subtitle: "암호 걸린 PDF 문서의 비밀번호를 입력하여 영구적으로 잠금을 해제하고 일반 PDF로 다시 저장합니다.",
    dropzoneTitle: "여기에 암호화된 PDF 파일을 드래그하거나 클릭하세요",
    dropzoneHint: "1개의 비밀번호 보호된 PDF 파일을 선택합니다.",
    dropzoneBtn: "PDF 파일 선택",
    passwordPrompt: "PDF 열람 비밀번호를 입력하세요",
    passwordPlaceholder: "문서 비밀번호 입력",
    btnUnlock: "비밀번호 해제 및 PDF 저장",
    unlocking: "PDF 잠금 해제 중...",
    wrongPassword: "비밀번호가 올바르지 않습니다. 다시 확인해 주세요.",
    corruptError: "PDF를 읽지 못했습니다. 파일이 손상되었는지 확인해 주세요.",
    notEncrypted: "이 PDF에는 암호가 걸려 있지 않습니다. 바로 열 수 있어요.",
    notEncryptedDesc: "이 문서는 이미 암호 없이 열람 및 인쇄가 가능하므로 추가 해제 작업이 필요하지 않습니다.",
    onlyPdf: "PDF 파일만 업로드할 수 있습니다.",
    rasterNotice: "※ 안내: 보안 암호 해제를 위해 고해상도 이미지 방식으로 재구성되어 저장되었습니다. 글자 복사·검색은 불가하며 원본 대비 파일 용량이 늘어날 수 있습니다.",
    autoDownloadNotice: "완료 후 잠금 해제된 PDF가 자동으로 다운로드됩니다. (다운로드가 시작되지 않았다면 아래 버튼을 클릭하세요)",
    successTitle: "PDF 잠금 해제가 완료되었습니다!",
    successDesc: "비밀번호가 완전히 제거되어 이제 암호 입력 없이 어디서나 바로 열 수 있습니다.",
    downloadBtn: "잠금 해제된 PDF 다운로드",
    resetBtn: "다른 파일 해제",
    guideTitle: "PDF 비밀번호 해제 완벽 가이드",
    step1Title: "1. 암호화된 PDF 업로드",
    step1Desc: "비밀번호가 걸려 있는 PDF 문서를 드래그하거나 선택하여 불러옵니다.",
    step2Title: "2. 문서 비밀번호 입력",
    step2Desc: "문서를 열 때 사용하는 올바른 비밀번호를 입력합니다.",
    step3Title: "3. 암호 없는 일반 PDF로 다운로드",
    step3Desc: "1초 만에 브라우저에서 암호가 영구 해제된 깨끗한 PDF 파일로 즉시 저장됩니다.",
    faq1Q: "비밀번호를 모르는 상태에서도 강제로 풀 수 있나요?",
    faq1A: "아닙니다. 표준 PDF 암호화는 올바른 비밀번호를 입력해야만 합법적이고 안전하게 잠금을 해제할 수 있습니다.",
    faq2Q: "제 비밀번호나 문서 내용이 서버로 전송되나요?",
    faq2A: "전혀 전송되지 않습니다! desktools.run의 모든 복호화 작업은 사용자의 브라우저 내에서 100% 로컬 처리됩니다.",
    faq3Q: "잠금 해제 후 원본 내용이나 화질이 변경되나요?",
    faq3A: "보안 암호를 영구 제거하기 위해 고해상도 이미지 방식으로 재구성되어 저장되므로 시각적 레이아웃은 유지되지만, 글자 복사·검색은 불가하며 파일 용량이 늘어날 수 있습니다."
  },
  en: {
    back: "All Tools",
    title: "PDF Unlock & Remove Password",
    badge: "100% Client-Side Decryption",
    subtitle: "Enter the password to permanently unlock your protected PDF and save it as a standard password-free PDF.",
    dropzoneTitle: "Drag & drop your encrypted PDF file here",
    dropzoneHint: "Select 1 password-protected PDF document to unlock",
    dropzoneBtn: "Select PDF File",
    passwordPrompt: "Enter Document Open Password",
    passwordPlaceholder: "Enter PDF password",
    btnUnlock: "Unlock & Save PDF",
    unlocking: "Unlocking PDF...",
    wrongPassword: "Incorrect password. Please try again.",
    corruptError: "Could not read PDF. Please check if the file is corrupted.",
    notEncrypted: "This PDF is not password-protected. You can open it directly.",
    notEncryptedDesc: "This document is already accessible without any password. No unlocking is required.",
    onlyPdf: "Only PDF files can be uploaded.",
    rasterNotice: "※ Notice: Reconstructed using high-resolution images to remove password protection. Text copying/searching is disabled and file size may increase.",
    autoDownloadNotice: "Saved automatically upon completion. (Click the button below if download did not start)",
    successTitle: "PDF Unlocked Successfully!",
    successDesc: "The password protection has been permanently removed.",
    downloadBtn: "Download Unlocked PDF",
    resetBtn: "Unlock Another File",
    guideTitle: "How to Unlock a Password-Protected PDF",
    step1Title: "1. Upload Encrypted PDF",
    step1Desc: "Select or drag the password-protected PDF file.",
    step2Title: "2. Enter Current Password",
    step2Desc: "Type the open password of the document.",
    step3Title: "3. Download Password-Free PDF",
    step3Desc: "Instantly decrypt and download the unlocked PDF directly in your browser without server uploads.",
    faq1Q: "Can I unlock a PDF without knowing the password?",
    faq1A: "No. Standard cryptographic security requires the correct password to decrypt and remove protection legally and securely.",
    faq2Q: "Is my document uploaded to a server?",
    faq2A: "Never! All decryption operations run 100% locally on your machine inside your browser.",
    faq3Q: "Does unlocking affect document quality?",
    faq3A: "Pages are reconstructed as high-resolution images to permanently remove password encryption. Visual layout is preserved, but text copying/searching may be unavailable and file size may increase."
  },
  ja: {
    back: "全ツール一覧",
    title: "PDF パスワード解除・ロック解除",
    badge: "100% ブラウザ完結",
    subtitle: "パスワード付きPDFのパスワードを入力し、パスワード不要の通常のPDFとして再保存します。",
    dropzoneTitle: "ここに保護されたPDFファイルをドラッグ＆ドロップ",
    dropzoneHint: "パスワード解除するPDFファイルを選択してください",
    dropzoneBtn: "PDFファイルを選択",
    passwordPrompt: "PDFのパスワードを入力してください",
    passwordPlaceholder: "パスワードを入力",
    btnUnlock: "パスワードを解除して保存",
    unlocking: "ロック解除中...",
    wrongPassword: "パスワードが正しくありません。再度ご確認ください。",
    corruptError: "PDFを読み取れませんでした。ファイルが破損していないかご確認ください。",
    notEncrypted: "このPDFにはパスワードが設定されていません。そのまま開くことができます。",
    notEncryptedDesc: "この文書には保護がかかっておらず、そのまま閲覧や印刷が可能です。",
    onlyPdf: "PDFファイルのみアップロードできます。",
    rasterNotice: "※ ご案内：パスワード除去のため高解像度画像として再構築されています。文字のコピーや検索はできず、ファイルサイズが増加する場合があります。",
    autoDownloadNotice: "完了後に自動ダウンロードされます。（開始されない場合は下のボタンを押してください）",
    successTitle: "PDFのロック解除が完了しました！",
    successDesc: "パスワード保護が完全に解除され、今後はパスワードなしで開けます。",
    downloadBtn: "解除済みPDFをダウンロード",
    resetBtn: "別のファイルを解除",
    guideTitle: "PDFパスワード解除の使い方",
    step1Title: "1. 保護されたPDFをアップロード",
    step1Desc: "パスワードが設定されたPDFファイルを読み込みます。",
    step2Title: "2. パスワードを入力",
    step2Desc: "ファイルを開くための現在のパスワードを入力します。",
    step3Title: "3. パスワード不要のPDFをダウンロード",
    step3Desc: "ブラウザ内で安全にロックが解除されたPDFを保存します。",
    faq1Q: "パスワードを知らない場合でも解除できますか？",
    faq1A: "できません。正規の暗号化仕様のため、正しいパスワードの入力が必要です。",
    faq2Q: "サーバーにファイルやパスワードが送信されますか？",
    faq2A: "一切送信されません。すべてお使いの端末（ブラウザ）内で安全に処理されます。",
    faq3Q: "画質やレイアウトは劣化しますか？",
    faq3A: "パスワードを永久解除するため高解像度画像として再構築されます。見た目のレイアウトは保たれますが、テキストの選択・検索ができなくなり、ファイルサイズが大きくなる場合があります。"
  },
  es: {
    back: "Todas las herramientas",
    title: "Desbloquear PDF y Quitar Contraseña",
    badge: "100% en tu navegador",
    subtitle: "Introduce la contraseña para desbloquear tu PDF y guardarlo como un PDF sin contraseña.",
    dropzoneTitle: "Arrastra y suelta tu archivo PDF protegido aquí",
    dropzoneHint: "Selecciona un documento PDF para desbloquear",
    dropzoneBtn: "Seleccionar PDF",
    passwordPrompt: "Introduce la Contraseña del PDF",
    passwordPlaceholder: "Contraseña del documento",
    btnUnlock: "Desbloquear y Guardar PDF",
    unlocking: "Desbloqueando PDF...",
    wrongPassword: "Contraseña incorrecta. Inténtalo de nuevo.",
    corruptError: "No se pudo leer el PDF. Comprueba si el archivo está dañado.",
    notEncrypted: "Este PDF no tiene contraseña. Puedes abrirlo directamente.",
    notEncryptedDesc: "Este documento ya es accesible sin contraseña. No requiere desbloqueo.",
    onlyPdf: "Solo se pueden subir archivos PDF.",
    rasterNotice: "※ Nota: Reconstruido mediante imágenes de alta resolución para eliminar la contraseña. No se puede seleccionar texto y el tamaño del archivo puede aumentar.",
    autoDownloadNotice: "Se guardará automáticamente al finalizar. (Haz clic abajo si no comienza)",
    successTitle: "¡PDF Desbloqueado con Éxito!",
    successDesc: "La contraseña ha sido eliminada permanentemente.",
    downloadBtn: "Descargar PDF Desbloqueado",
    resetBtn: "Desbloquear Otro Archivo",
    guideTitle: "Guía para Desbloquear PDF",
    step1Title: "1. Sube el PDF protegido",
    step1Desc: "Arrastra el archivo PDF con contraseña.",
    step2Title: "2. Introduce la contraseña",
    step2Desc: "Escribe la contraseña actual del documento.",
    step3Title: "3. Descarga el PDF libre",
    step3Desc: "Descarga instantánea 100% en tu navegador sin servidores externos.",
    faq1Q: "¿Se puede desbloquear sin saber la contraseña?",
    faq1A: "No. La seguridad criptográfica estándar requiere la contraseña correcta.",
    faq2Q: "¿Se envían mis datos a algún servidor?",
    faq2A: "¡No! Todo el procesamiento es 100% local en tu navegador.",
    faq3Q: "¿Afecta a la calidad del documento?",
    faq3A: "Las páginas se redibujan como imágenes de alta resolución para eliminar la contraseña de forma permanente. Se mantiene el diseño visual, pero no se podrá copiar ni buscar texto y el tamaño del archivo puede aumentar."
  },
  zh: {
    back: "返回所有工具",
    title: "PDF 解除密码与解锁",
    badge: "100% 本地浏览器解密",
    subtitle: "输入密码解除 PDF 保护锁定，一键另存为无需密码的通用 PDF 文档。",
    dropzoneTitle: "将加密的 PDF 文件拖拽到此处",
    dropzoneHint: "选择 1 个受密码保护的 PDF 文件",
    dropzoneBtn: "选择 PDF 文件",
    passwordPrompt: "请输入 PDF 打开密码",
    passwordPlaceholder: "输入文档当前密码",
    btnUnlock: "解除密码并保存 PDF",
    unlocking: "正在解除锁定...",
    wrongPassword: "密码错误，请重新确认输入。",
    corruptError: "无法读取 PDF，请检查文件是否损坏。",
    notEncrypted: "此 PDF 未设置密码保护，可以直接打开阅读。",
    notEncryptedDesc: "该文档未加密，可直接正常打开与打印，无需额外解锁。",
    onlyPdf: "仅支持上传 PDF 格式文件。",
    rasterNotice: "※ 说明：为彻底永久解除密码，本工具通过高清图像渲染重构页面并导出。版面视觉完整保留，但不支持文字复制与搜索，且文件体积可能会比原件偏大。",
    autoDownloadNotice: "处理完成后已自动开始下载。（若未自动下载，请点击下方按钮）",
    successTitle: "PDF 密码解除成功！",
    successDesc: "密码保护已被永久移除，今后无需密码即可随时打开浏览。",
    downloadBtn: "下载已解锁的 PDF",
    resetBtn: "解锁其他文件",
    guideTitle: "PDF 密码解除使用指南",
    step1Title: "1. 上传受保护的 PDF",
    step1Desc: "拖入或选择需要解密解锁的 PDF 文件。",
    step2Title: "2. 输入原密码",
    step2Desc: "输入打开该文档所需的有效密码。",
    step3Title: "3. 下载无密码 PDF",
    step3Desc: "零服务器上传，纯本地秒速生成无密码的标准 PDF 文档。",
    faq1Q: "不知道密码可以强行破解吗？",
    faq1A: "不能。行业标准高强度加密必须输入正确密码方可合法安全解密。",
    faq2Q: "我的文件或密码会泄露到服务器吗？",
    faq2A: "绝无可能！所有解密均在您的电脑或手机浏览器本地执行。",
    faq3Q: "解锁后会损失画质或格式吗？",
    faq3A: "为彻底永久解除密码，本工具通过高清图像渲染重构页面并导出。版面视觉完整保留，但不支持文字复制与搜索，且文件体积可能会比原件偏大。"
  },
  fr: {
    back: "Tous les outils",
    title: "Déverrouiller et Supprimer Mot de Passe PDF",
    badge: "100% Déchiffrement Local",
    subtitle: "Entrez le mot de passe pour déverrouiller définitivement votre PDF sans mot de passe.",
    dropzoneTitle: "Glissez-déposez votre fichier PDF protégé ici",
    dropzoneHint: "Sélectionnez 1 fichier PDF à déverrouiller",
    dropzoneBtn: "Sélectionner un fichier PDF",
    passwordPrompt: "Entrez le mot de passe du document",
    passwordPlaceholder: "Mot de passe actuel du PDF",
    btnUnlock: "Déverrouiller et Enregistrer",
    unlocking: "Déverrouillage en cours...",
    wrongPassword: "Mot de passe incorrect. Veuillez réessayer.",
    corruptError: "Impossible de lire le PDF. Veuillez vérifier si le fichier est corrompu.",
    notEncrypted: "Ce PDF n'est pas protégé par un mot de passe. Vous pouvez l'ouvrir directement.",
    notEncryptedDesc: "Ce document est déjà accessible sans mot de passe. Aucun déverrouillage n'est nécessaire.",
    onlyPdf: "Seuls les fichiers PDF peuvent être téléversés.",
    rasterNotice: "※ Remarque : Reconstruit sous forme d'images haute résolution pour supprimer définitivement le mot de passe. La sélection de texte est indisponible et la taille peut augmenter.",
    autoDownloadNotice: "Téléchargé automatiquement dès la fin du traitement. (Cliquez ci-dessous si le téléchargement ne démarre pas)",
    successTitle: "PDF Déverrouillé avec Succès !",
    successDesc: "Le mot de passe a été retiré définitivement.",
    downloadBtn: "Télécharger le PDF Déverrouillé",
    resetBtn: "Déverrouiller un Autre Fichier",
    guideTitle: "Guide de Déverrouillage PDF",
    step1Title: "1. Importer le PDF protégé",
    step1Desc: "Sélectionnez le fichier PDF verrouillé par mot de passe.",
    step2Title: "2. Entrer le mot de passe",
    step2Desc: "Saisissez le mot de passe d'ouverture du document.",
    step3Title: "3. Télécharger le PDF libre",
    step3Desc: "Déchiffrement 100% local dans votre navigateur sans téléversement.",
    faq1Q: "Peut-on déverrouiller sans mot de passe ?",
    faq1A: "Non. Le chiffrement standard requiert le mot de passe valide.",
    faq2Q: "Mon fichier est-il envoyé sur un serveur ?",
    faq2A: "Jamais ! Toutes les opérations s'exécutent directement dans votre navigateur.",
    faq3Q: "La qualité est-elle modifiée ?",
    faq3A: "Les pages sont reconstruites sous forme d'images haute résolution pour supprimer définitivement le mot de passe. La mise en page est préservée, mais la sélection de texte est indisponible et la taille peut augmenter."
  }
};

export default function PdfUnlockPage() {
  const { locale, t } = useLocale();
  const txt = I18N[locale as keyof typeof I18N] || I18N.ko;

  const [pdfFile, setPdfFile] = useState<LoadedPdf | null>(null);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean | null>(null);
  const [notEncryptedMessage, setNotEncryptedMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [unlockedResult, setUnlockedResult] = useState<{
    url: string;
    filename: string;
    size: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize document title with the active locale
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${t("pdfUnlock.title") || txt.title} | desktools.run`;
    }
  }, [locale, t, txt.title]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const file = fileList.find(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );

    if (!file) {
      setErrorMessage(txt.onlyPdf);
      return;
    }

    setErrorMessage("");
    setIsChecking(true);

    try {
      const buffer = await file.arrayBuffer();

      // Verify whether the PDF is actually password-protected
      try {
        await PDFDocument.load(buffer);
        // If it loaded without error, it is NOT encrypted!
        setIsEncrypted(false);
        setNotEncryptedMessage(txt.notEncrypted);
      } catch (loadErr: unknown) {
        const errStr = String(loadErr);
        if (
          errStr.includes("encrypted") ||
          errStr.includes("Encrypted") ||
          (loadErr as { name?: string })?.name === "EncryptedPDFError"
        ) {
          // Document is truly encrypted
          setIsEncrypted(true);
          setNotEncryptedMessage("");
        } else {
          console.warn("PDF parse error:", loadErr);
          setErrorMessage(txt.corruptError);
          setIsChecking(false);
          return;
        }
      }

      setPdfFile({
        file,
        name: file.name,
        originalSize: file.size,
      });
      setPassword("");
      setUnlockedResult(null);
    } catch (readErr: unknown) {
      console.warn("File read error:", readErr);
      setErrorMessage(txt.corruptError);
    } finally {
      setIsChecking(false);
    }
  }, [txt.onlyPdf, txt.notEncrypted, txt.corruptError]);

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
    setErrorMessage("");
    setIsEncrypted(null);
    setNotEncryptedMessage("");
    setUnlockedResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Unlock execution
  const handleUnlock = async () => {
    if (!pdfFile || isEncrypted === false) return;

    setIsUnlocking(true);
    setErrorMessage("");
    await new Promise((resolve) => setTimeout(resolve, 60));

    try {
      const buffer = await pdfFile.file.arrayBuffer();

      // Dynamically load pdfjs-dist and use same-origin local worker
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const loadingTask = pdfjsLib.getDocument({
        data: buffer.slice(0),
        password: password,
      });

      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      // Create new clean unencrypted PDF using pdf-lib
      const newPdfDoc = await PDFDocument.create();

      for (let p = 1; p <= numPages; p++) {
        const page = await pdfDoc.getPage(p);
        const viewport = page.getViewport({ scale: 2.0 }); // High-res 2x scaling for crisp quality

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
          const imageBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
          const embeddedImage = await newPdfDoc.embedJpg(imageBytes);

          // Add page matching original dimensions (divide by scale)
          const newPage = newPdfDoc.addPage([viewport.width / 2.0, viewport.height / 2.0]);
          newPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: viewport.width / 2.0,
            height: viewport.height / 2.0,
          });
        }
      }

      const unlockedPdfBytes = await newPdfDoc.save();
      const blob = new Blob([unlockedPdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const outName = pdfFile.name.replace(/\.pdf$/i, "_unlocked.pdf");

      setUnlockedResult({
        url,
        filename: outName,
        size: blob.size,
      });

      // Automatic download upon completion
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = outName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        // Fallback gracefully to manual button
      }
    } catch (err: unknown) {
      const errStr = String(err);
      if (
        errStr.includes("Password") ||
        errStr.includes("password") ||
        errStr.includes("Incorrect") ||
        errStr.includes("bad password") ||
        (err as { name?: string })?.name === "PasswordException"
      ) {
        console.warn("PDF unlock: incorrect password entered");
        setErrorMessage(txt.wrongPassword);
      } else {
        console.error("PDF unlock read/render error:", err);
        setErrorMessage(txt.corruptError);
      }
    } finally {
      setIsUnlocking(false);
    }
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
            {t("pdfUnlock.back") || txt.back}
          </Link>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--colors-primary)",
                  }}
                >
                  <Unlock size={20} />
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                  {t("pdfUnlock.title") || txt.title}
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px" }}>
                {t("pdfUnlock.subtitle") || txt.subtitle}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "100px",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                color: "var(--colors-primary)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={12} />
              {t("pdfUnlock.badge") || txt.badge}
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
                border: isDragging ? "2px dashed var(--colors-primary)" : "2px dashed var(--border-subtle)",
                background: isDragging ? "rgba(245, 158, 11, 0.08)" : "var(--glass-bg)",
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
                  background: "rgba(245, 158, 11, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--colors-primary)",
                }}
              >
                <Upload size={32} />
              </div>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {t("pdfUnlock.dropPrompt") || txt.dropzoneTitle}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {t("pdfUnlock.dropHint") || txt.dropzoneHint}
                </p>
              </div>

              {errorMessage && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  <AlertCircle size={15} />
                  {errorMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: "32px", borderRadius: "16px", marginBottom: "48px" }}>
              {!unlockedResult ? (
                /* Password Input & Unlock Action OR Not-Encrypted Banner */
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* File Selected Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderRadius: "12px",
                      background: "rgba(245, 158, 11, 0.08)",
                      border: "1px solid rgba(245, 158, 11, 0.22)",
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
                          background: "rgba(245, 158, 11, 0.15)",
                          color: "var(--colors-primary)",
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
                          {formatBytes(pdfFile.originalSize)}
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

                  {/* Case 1: PDF is NOT password protected */}
                  {isEncrypted === false ? (
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "12px",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "#10b981" }}>
                            {txt.notEncrypted}
                          </div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.5 }}>
                            {txt.notEncryptedDesc}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <button
                          onClick={handleReset}
                          className="button-primary"
                          style={{
                            padding: "8px 18px",
                            fontSize: "13px",
                          }}
                        >
                          <RotateCcw size={14} />
                          <span>{txt.resetBtn}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Case 2: PDF IS password protected -> Show Password Input */
                    <div>
                      <label style={{ display: "block", fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                        <KeyRound size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", color: "var(--colors-primary)" }} />
                        {txt.passwordPrompt}
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrorMessage("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && password) handleUnlock();
                          }}
                          placeholder={txt.passwordPlaceholder}
                          style={{
                            width: "100%",
                            padding: "12px 42px 12px 14px",
                            borderRadius: "10px",
                            background: "var(--input-bg)",
                            border: `1px solid ${errorMessage ? "#ef4444" : "var(--input-border)"}`,
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

                      {errorMessage && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginTop: "8px",
                            fontSize: "12.5px",
                            color: "#ef4444",
                            fontWeight: 600,
                          }}
                        >
                          <AlertCircle size={14} />
                          {errorMessage}
                        </div>
                      )}

                      {/* Unlock Submit Button */}
                      <button
                        onClick={handleUnlock}
                        disabled={!password || isUnlocking || isChecking}
                        className="button-primary"
                        style={{
                          padding: "14px 24px",
                          fontSize: "15px",
                          fontWeight: 700,
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          opacity: !password || isUnlocking || isChecking ? 0.5 : 1,
                          cursor: !password || isUnlocking || isChecking ? "not-allowed" : "pointer",
                          marginTop: "16px",
                        }}
                      >
                        {isUnlocking ? (
                          <>
                            <div className="spinner" style={{ width: "16px", height: "16px" }} />
                            <span>{txt.unlocking}</span>
                          </>
                        ) : (
                          <>
                            <Unlock size={16} />
                            <span>{txt.btnUnlock}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
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
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                    {txt.successTitle}
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px", maxWidth: "520px", margin: "0 auto 16px" }}>
                    {txt.successDesc}
                  </p>

                  {/* Informative notice on rasterization format & auto download */}
                  <div
                    style={{
                      maxWidth: "600px",
                      margin: "0 auto 24px",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      background: "rgba(245, 158, 11, 0.08)",
                      border: "1px solid rgba(245, 158, 11, 0.25)",
                      fontSize: "12.5px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                      <Info size={15} color="var(--colors-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {txt.autoDownloadNotice}
                      </span>
                    </div>
                    <p style={{ margin: 0, paddingLeft: "23px", fontSize: "12px", color: "var(--colors-mute)" }}>
                      {txt.rasterNotice}
                    </p>
                  </div>

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
                      href={unlockedResult.url}
                      download={unlockedResult.filename}
                      className="button-primary"
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
                      <span>{txt.downloadBtn}</span>
                    </a>

                    <button
                      onClick={handleReset}
                      className="button-outline-on-dark"
                      style={{
                        padding: "12px 20px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <RotateCcw size={15} />
                      <span>{txt.resetBtn}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Unified Tool Guide & FAQ Section ───────────── */}
        <ToolGuide
          badgeText={t("pdfUnlock.guide.badge")}
          aboutTitle={t("pdfUnlock.guide.aboutTitle")}
          aboutDesc={t("pdfUnlock.guide.aboutDesc")}
          howTitle={t("pdfUnlock.guide.howTitle")}
          steps={[
            t("pdfUnlock.guide.step1"),
            t("pdfUnlock.guide.step2"),
            t("pdfUnlock.guide.step3"),
          ]}
          featuresTitle={t("pdfUnlock.guide.featuresTitle")}
          features={[
            {
              icon: <ShieldCheck size={16} />,
              title: t("pdfUnlock.guide.feat1Title"),
              desc: t("pdfUnlock.guide.feat1Desc"),
            },
            {
              icon: <Unlock size={16} />,
              title: t("pdfUnlock.guide.feat2Title"),
              desc: t("pdfUnlock.guide.feat2Desc"),
            },
            {
              icon: <Eye size={16} />,
              title: t("pdfUnlock.guide.feat3Title"),
              desc: t("pdfUnlock.guide.feat3Desc"),
            },
            {
              icon: <FileText size={16} />,
              title: t("pdfUnlock.guide.feat4Title"),
              desc: t("pdfUnlock.guide.feat4Desc"),
            },
          ]}
          useCasesTitle={t("pdfUnlock.guide.useCasesTitle")}
          useCases={[
            {
              icon: "💳",
              title: t("pdfUnlock.guide.uc1Title"),
              desc: t("pdfUnlock.guide.uc1Desc"),
            },
            {
              icon: "📑",
              title: t("pdfUnlock.guide.uc2Title"),
              desc: t("pdfUnlock.guide.uc2Desc"),
            },
            {
              icon: "🖨️",
              title: t("pdfUnlock.guide.uc3Title"),
              desc: t("pdfUnlock.guide.uc3Desc"),
            },
            {
              icon: "🏛️",
              title: t("pdfUnlock.guide.uc4Title"),
              desc: t("pdfUnlock.guide.uc4Desc"),
            },
          ]}
          proTips={{
            title: t("pdfUnlock.guide.tipsTitle"),
            tips: [
              t("pdfUnlock.guide.tip1"),
              t("pdfUnlock.guide.tip2"),
              t("pdfUnlock.guide.tip3"),
            ],
          }}
          faqs={[
            { q: t("pdfUnlock.guide.faq1Q"), a: t("pdfUnlock.guide.faq1A") },
            { q: t("pdfUnlock.guide.faq2Q"), a: t("pdfUnlock.guide.faq2A") },
            { q: t("pdfUnlock.guide.faq3Q"), a: t("pdfUnlock.guide.faq3A") },
            { q: t("pdfUnlock.guide.faq4Q"), a: t("pdfUnlock.guide.faq4A") },
            { q: t("pdfUnlock.guide.faq5Q"), a: t("pdfUnlock.guide.faq5A") },
            { q: t("pdfUnlock.guide.faq6Q"), a: t("pdfUnlock.guide.faq6A") },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}
