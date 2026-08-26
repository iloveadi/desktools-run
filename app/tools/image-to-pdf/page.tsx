"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  Download,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  RotateCcw,
  Sparkles,
  Layers,
  Sliders,
  Eye,
  CheckCircle2,
  FileCheck,
  Image as ImageIcon,
  FileSpreadsheet
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolGuide from "@/components/common/ToolGuide";
import { useLocale } from "@/lib/context/LocaleContext";

interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
}

type PageSize = "a4" | "letter" | "fit";
type Orientation = "auto" | "portrait" | "landscape";
type MarginSize = "none" | "small" | "normal";
type QualityLevel = "high" | "medium" | "low";

const I18N = {
  ko: {
    back: "전체 도구 목록",
    title: "이미지 PDF 변환기",
    badge: "100% 브라우저 처리",
    subtitle: "여러 장의 사진/이미지를 순서대로 묶어 하나의 깔끔한 PDF 문서로 즉시 변환합니다.",
    dropzoneTitle: "여기에 이미지를 드래그하거나 클릭하여 추가하세요",
    dropzoneHint: "JPG, PNG, WebP, GIF, BMP 등 여러 장 일괄 업로드 지원",
    dropzoneBtn: "이미지 파일 선택",
    addMore: "이미지 추가",
    clearAll: "전체 비우기",
    imagesCount: "장의 이미지",
    totalSize: "총 용량",
    settingsTitle: "PDF 레이아웃 및 용지 설정",
    pageSize: "용지 크기",
    pageA4: "A4 표준 (210 × 297 mm)",
    pageLetter: "Letter 표준 (8.5 × 11 in)",
    pageFit: "이미지 맞춤 (Fit to Image)",
    orientation: "용지 방향",
    orientAuto: "자동 (이미지 비율에 맞춤)",
    orientPortrait: "세로 (Portrait)",
    orientLandscape: "가로 (Landscape)",
    margin: "페이지 여백",
    marginNone: "여백 없음 (0px)",
    marginSmall: "좁은 여백 (20px)",
    marginNormal: "보통 여백 (40px)",
    quality: "이미지 화질 / 압축",
    qualHigh: "최고 화질 (원본 품질)",
    qualMed: "표준 최적화 (용량 균형)",
    qualLow: "용량 압축 (작은 파일 크기)",
    filenameLabel: "저장될 PDF 파일명",
    convertBtn: "PDF로 일괄 변환하기",
    converting: "PDF 생성 중...",
    downloadPdf: "PDF 다운로드",
    previewPdf: "PDF 미리보기",
    reset: "새로 만들기",
    successMsg: "PDF 문서가 성공적으로 생성되었습니다!",
    reorderTip: "▲ ▼ 버튼으로 PDF에 들어갈 페이지 순서를 변경할 수 있습니다.",
    guideTitle: "이미지 PDF 변환기 완벽 사용 가이드",
    step1Title: "1. 이미지 일괄 업로드",
    step1Desc: "PDF로 만들고 싶은 사진, 영수증, 스캔 문서, 디자인 시안 등의 이미지를 한 번에 드래그하여 업로드합니다.",
    step2Title: "2. 순서 정렬 및 용지 옵션 설정",
    step2Desc: "위/아래 화살표를 눌러 원하는 페이지 순서로 배열하고, A4/Letter 규격 및 여백 옵션을 취향에 맞게 조정합니다.",
    step3Title: "3. 1클릭 고화질 PDF 생성 및 저장",
    step3Desc: "변환 버튼을 누르면 서버 전송 없이 브라우저에서 즉시 초고속 렌더링되어 완성된 PDF를 다운로드할 수 있습니다.",
    faq1Q: "서버로 제 사진이나 개인 문서가 전송되나요?",
    faq1A: "전혀 전송되지 않습니다! desktools.run의 모든 작업은 WebAssembly와 Canvas/PDF-Lib 엔진을 통해 사용자의 PC/스마트폰 브라우저 내에서만 100% 로컬 처리되므로 개인정보가 완벽히 보호됩니다.",
    faq2Q: "JPG, PNG 외에 WebP나 다른 이미지 포맷도 지원하나요?",
    faq2A: "네! JPG, PNG는 물론 최신 WebP, GIF, BMP, SVG 등 브라우저가 읽을 수 있는 모든 이미지 형식을 자동으로 최적화하여 PDF에 삽입합니다.",
  },
  en: {
    back: "All Tools",
    title: "Image to PDF Converter",
    badge: "100% Client-Side",
    subtitle: "Combine and convert multiple images into a single professional PDF document instantly.",
    dropzoneTitle: "Drag & drop images here, or click to browse",
    dropzoneHint: "Supports JPG, PNG, WebP, GIF, BMP with batch multi-file upload",
    dropzoneBtn: "Select Image Files",
    addMore: "Add More Images",
    clearAll: "Clear All",
    imagesCount: "Images",
    totalSize: "Total size",
    settingsTitle: "PDF Layout & Page Settings",
    pageSize: "Page Size",
    pageA4: "A4 Standard (210 × 297 mm)",
    pageLetter: "Letter Standard (8.5 × 11 in)",
    pageFit: "Fit to Image Dimension",
    orientation: "Orientation",
    orientAuto: "Auto (Match image ratio)",
    orientPortrait: "Portrait (Vertical)",
    orientLandscape: "Landscape (Horizontal)",
    margin: "Page Margin",
    marginNone: "No Margin (0px)",
    marginSmall: "Small Margin (20px)",
    marginNormal: "Normal Margin (40px)",
    quality: "Image Quality & Compression",
    qualHigh: "Maximum Quality (Original)",
    qualMed: "Optimized (Balanced size)",
    qualLow: "High Compression (Small size)",
    filenameLabel: "Output PDF Filename",
    convertBtn: "Convert to PDF Document",
    converting: "Generating PDF...",
    downloadPdf: "Download PDF",
    previewPdf: "Preview PDF",
    reset: "Start Over",
    successMsg: "PDF document generated successfully!",
    reorderTip: "Use the ▲ and ▼ buttons to easily adjust the page order.",
    guideTitle: "How to Convert Images to PDF",
    step1Title: "1. Upload Your Images",
    step1Desc: "Select or drag-and-drop multiple photos, scans, receipts, or graphics all at once.",
    step2Title: "2. Arrange Order & Customize Layout",
    step2Desc: "Reorder pages using the arrow buttons, pick A4 or Letter sizes, and configure custom margins.",
    step3Title: "3. Generate & Download PDF",
    step3Desc: "Click Convert to render your document in milliseconds directly inside your browser.",
    faq1Q: "Are my photos or documents uploaded to any server?",
    faq1A: "Never! All image processing and PDF synthesis happens 100% locally inside your web browser. No data ever leaves your device.",
    faq2Q: "Can I convert WebP and PNG images as well as JPG?",
    faq2A: "Yes! The converter automatically parses and optimizes JPG, PNG, WebP, GIF, and BMP images into the output PDF.",
  },
  ja: {
    back: "すべてのツール",
    title: "画像 PDF 変換ツール",
    badge: "100% クライアント処理",
    subtitle: "複数の写真や画像を順番通りに1つの高品質なPDFファイルに即座に変換・結合します。",
    dropzoneTitle: "ここに画像をドラッグ＆ドロップ、またはクリックして追加",
    dropzoneHint: "JPG, PNG, WebP, GIF, BMPなど複数ファイルの一括アップロードに対応",
    dropzoneBtn: "画像ファイルを選択",
    addMore: "画像を追加",
    clearAll: "すべてクリア",
    imagesCount: "枚の画像",
    totalSize: "合計サイズ",
    settingsTitle: "PDFレイアウト・用紙設定",
    pageSize: "用紙サイズ",
    pageA4: "A4 標準 (210 × 297 mm)",
    pageLetter: "Letter (8.5 × 11 in)",
    pageFit: "画像サイズに合わせる (Fit)",
    orientation: "用紙の向き",
    orientAuto: "自動 (画像比率に連動)",
    orientPortrait: "縦向き (Portrait)",
    orientLandscape: "横向き (Landscape)",
    margin: "余白設定",
    marginNone: "余白なし (0px)",
    marginSmall: "狭い余白 (20px)",
    marginNormal: "標準余白 (40px)",
    quality: "画質 / 圧縮率",
    qualHigh: "最高画質 (オリジナル品質)",
    qualMed: "標準最適化 (バランス重視)",
    qualLow: "高圧縮 (ファイル軽量化)",
    filenameLabel: "出力PDFファイル名",
    convertBtn: "PDFを一括作成する",
    converting: "PDF生成中...",
    downloadPdf: "PDFをダウンロード",
    previewPdf: "PDFをプレビュー",
    reset: "新しく作成",
    successMsg: "PDFドキュメントが正常に作成されました！",
    reorderTip: "▲ ▼ ボタンでPDF内のページ順序を自由に変更できます。",
    guideTitle: "画像 PDF 変換ツールの使い方",
    step1Title: "1. 画像ファイルを一括選択",
    step1Desc: "PDF化したい写真、書類スキャン、レシート画像などをドラッグ＆ドロップします。",
    step2Title: "2. 順番の並び替え＆用紙設定",
    step2Desc: "矢印ボタンでページ順を整理し、A4/Letterサイズや余白・画質を調整します。",
    step3Title: "3. 1クリックでPDF生成＆保存",
    step3Desc: "サーバー送信なしでブラウザ内部で高速生成され、完成したPDFを即座に保存できます。",
    faq1Q: "写真や機密ファイルが外部サーバーに送信されますか？",
    faq1A: "一切送信されません！すべての処理はブラウザのローカル環境で行われるため安心です。",
    faq2Q: "WebPやPNG形式の画像も一緒に結合できますか？",
    faq2A: "はい、JPGだけでなくWebP、PNG、GIF、BMPなど混在した状態でも1つのPDFにまとめられます。",
  },
  es: {
    back: "Todas las herramientas",
    title: "Convertidor de Imagen a PDF",
    badge: "100% Local y Seguro",
    subtitle: "Combina y convierte múltiples imágenes en un documento PDF profesional al instante.",
    dropzoneTitle: "Arrastra y suelta imágenes aquí, o haz clic para explorar",
    dropzoneHint: "Compatible con JPG, PNG, WebP, GIF, BMP con subida múltiple",
    dropzoneBtn: "Seleccionar Imágenes",
    addMore: "Añadir Más Imágenes",
    clearAll: "Borrar Todo",
    imagesCount: "Imágenes",
    totalSize: "Tamaño total",
    settingsTitle: "Configuración de Página y Diseño PDF",
    pageSize: "Tamaño de Página",
    pageA4: "A4 Estándar (210 × 297 mm)",
    pageLetter: "Carta Estándar (8.5 × 11 in)",
    pageFit: "Ajustar a Imagen (Fit)",
    orientation: "Orientación",
    orientAuto: "Automática (Según proporción)",
    orientPortrait: "Vertical (Portrait)",
    orientLandscape: "Horizontal (Landscape)",
    margin: "Márgenes",
    marginNone: "Sin Margen (0px)",
    marginSmall: "Margen Estrecho (20px)",
    marginNormal: "Margen Normal (40px)",
    quality: "Calidad y Compresión",
    qualHigh: "Máxima Calidad (Original)",
    qualMed: "Optimizado (Equilibrado)",
    qualLow: "Alta Compresión (Menor tamaño)",
    filenameLabel: "Nombre del Archivo PDF",
    convertBtn: "Convertir a Documento PDF",
    converting: "Generando PDF...",
    downloadPdf: "Descargar PDF",
    previewPdf: "Vista Previa PDF",
    reset: "Comenzar de Nuevo",
    successMsg: "¡Documento PDF generado con éxito!",
    reorderTip: "Usa los botones ▲ y ▼ para ajustar el orden de las páginas.",
    guideTitle: "Guía de Conversión de Imágenes a PDF",
    step1Title: "1. Sube tus Imágenes",
    step1Desc: "Arrastra fotos, recibos o documentos escaneados todos a la vez.",
    step2Title: "2. Ordena y Personaliza",
    step2Desc: "Ajusta el orden con las flechas y configura tamaño A4, márgenes y calidad.",
    step3Title: "3. Genera y Descarga",
    step3Desc: "Haz clic en convertir y descarga tu PDF listo sin esperas.",
    faq1Q: "¿Mis imágenes se envían a algún servidor?",
    faq1A: "¡Para nada! Todo se procesa 100% en tu navegador con total privacidad.",
    faq2Q: "¿Puedo combinar archivos WebP, PNG y JPG?",
    faq2A: "Sí, todos los formatos comunes de imagen se unifican automáticamente.",
  },
  zh: {
    back: "所有工具",
    title: "图片转 PDF 转换器",
    badge: "100% 浏览器本地处理",
    subtitle: "将多张照片与图像按指定顺序一键合并转换为高清 PDF 电子文档。",
    dropzoneTitle: "拖放图片至此处，或点击上传",
    dropzoneHint: "支持 JPG, PNG, WebP, GIF, BMP 等多图批量导入",
    dropzoneBtn: "选择图片文件",
    addMore: "添加更多图片",
    clearAll: "清空全部",
    imagesCount: "张图片",
    totalSize: "总文件大小",
    settingsTitle: "PDF 页面与版式设置",
    pageSize: "纸张尺寸",
    pageA4: "A4 标准 (210 × 297 mm)",
    pageLetter: "Letter 信纸 (8.5 × 11 in)",
    pageFit: "贴合图片原始尺寸 (Fit)",
    orientation: "纸张方向",
    orientAuto: "自动适应 (按图片宽高比)",
    orientPortrait: "纵向 (Portrait)",
    orientLandscape: "横向 (Landscape)",
    margin: "页面边距",
    marginNone: "无边距 (0px)",
    marginSmall: "窄边距 (20px)",
    marginNormal: "常规边距 (40px)",
    quality: "画质与压缩比",
    qualHigh: "最高画质 (无损原始清晰度)",
    qualMed: "均衡优化 (画质与体积兼顾)",
    qualLow: "高压缩 (极小文件体积)",
    filenameLabel: "输出 PDF 文件名",
    convertBtn: "一键生成 PDF 文档",
    converting: "正在合成 PDF...",
    downloadPdf: "下载 PDF 文件",
    previewPdf: "在线预览 PDF",
    reset: "重新制作",
    successMsg: "PDF 文档已成功生成！",
    reorderTip: "使用 ▲ ▼ 箭头按钮可轻松调整每张图片在 PDF 中的页码顺序。",
    guideTitle: "图片转 PDF 转换器使用指南",
    step1Title: "1. 批量导入图片",
    step1Desc: "选择或拖入需要合并的照片、证件扫描件或图稿。",
    step2Title: "2. 排序与页面版式调整",
    step2Desc: "调整页面排列先后顺序，选择 A4/Letter 纸张规格及留白边距。",
    step3Title: "3. 一键极速导出 PDF",
    step3Desc: "无需上传至云端服务器，本地即刻渲染生成并下载 PDF 文件。",
    faq1Q: "我的图片或文件会被上传到服务器吗？",
    faq1A: "绝不会！所有图像合成均在您本地设备浏览器内部运算，隐私安全 100% 保障。",
    faq2Q: "支持 WebP 和 PNG 格式混合生成吗？",
    faq2A: "完全支持！系统会自动将各种格式图片转化为标准 PDF 页面。",
  },
  fr: {
    back: "Tous les outils",
    title: "Convertisseur Image en PDF",
    badge: "100% Côté Client",
    subtitle: "Combinez et convertissez plusieurs photos et images en un seul document PDF de haute qualité.",
    dropzoneTitle: "Glissez et déposez des images ici, ou cliquez pour parcourir",
    dropzoneHint: "Prend en charge JPG, PNG, WebP, GIF, BMP en téléchargement par lots",
    dropzoneBtn: "Sélectionner des images",
    addMore: "Ajouter d'autres images",
    clearAll: "Tout effacer",
    imagesCount: "Images",
    totalSize: "Taille totale",
    settingsTitle: "Paramètres de page et mise en page PDF",
    pageSize: "Format de page",
    pageA4: "A4 Standard (210 × 297 mm)",
    pageLetter: "Lettre Standard (8.5 × 11 in)",
    pageFit: "Ajuster à l'image (Fit)",
    orientation: "Orientation",
    orientAuto: "Automatique (Selon ratio)",
    orientPortrait: "Portrait (Vertical)",
    orientLandscape: "Paysage (Horizontal)",
    margin: "Marges de page",
    marginNone: "Sans marge (0px)",
    marginSmall: "Marge étroite (20px)",
    marginNormal: "Marge normale (40px)",
    quality: "Qualité & Compression",
    qualHigh: "Qualité maximale (Original)",
    qualMed: "Optimisé (Équilibré)",
    qualLow: "Haute compression (Fichier léger)",
    filenameLabel: "Nom du fichier PDF",
    convertBtn: "Convertir en document PDF",
    converting: "Génération du PDF...",
    downloadPdf: "Télécharger le PDF",
    previewPdf: "Aperçu du PDF",
    reset: "Recommencer",
    successMsg: "Le document PDF a été généré avec succès !",
    reorderTip: "Utilisez les boutons ▲ et ▼ pour réorganiser facilement l'ordre des pages.",
    guideTitle: "Guide de conversion Image en PDF",
    step1Title: "1. Importez vos images",
    step1Desc: "Déposez toutes vos photos, factures ou scans en une seule fois.",
    step2Title: "2. Organisez et personnalisez",
    step2Desc: "Ordonnez les pages et définissez la taille A4, les marges et l'orientation.",
    step3Title: "3. Exportez et téléchargez",
    step3Desc: "Cliquez sur Convertir pour générer votre document instantanément.",
    faq1Q: "Mes photos sont-elles téléchargées sur un serveur ?",
    faq1A: "Non, absolument pas ! Tout est traité 100% localement dans votre navigateur.",
    faq2Q: "Puis-je mélanger des images PNG, WebP et JPG ?",
    faq2A: "Oui, le convertisseur assemble tous les formats d'image courants sans problème.",
  },
};

export default function ImageToPdfPage() {
  const { locale } = useLocale();
  const txt = I18N[locale as keyof typeof I18N] || I18N.ko;

  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [margin, setMargin] = useState<MarginSize>("none");
  const [quality, setQuality] = useState<QualityLevel>("high");
  const [outputFilename, setOutputFilename] = useState<string>("images_to_pdf.pdf");

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [generatedPdfBlobUrl, setGeneratedPdfBlobUrl] = useState<string | null>(null);
  const [generatedPdfSize, setGeneratedPdfSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load and read image files
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    const newItems: ImageItem[] = [];

    for (const file of validFiles) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const dims = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({ width: 800, height: 600 });
          img.src = dataUrl;
        });

        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          size: file.size,
          dataUrl,
          width: dims.width,
          height: dims.height,
        });
      } catch (err) {
        console.error("Error reading image:", file.name, err);
      }
    }

    setImages((prev) => [...prev, ...newItems]);
    setGeneratedPdfBlobUrl(null);
  }, []);

  // Drag & drop handlers
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

  // Reorder items
  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setImages(newItems);
    setGeneratedPdfBlobUrl(null);
  };

  // Remove single image
  const removeItem = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setGeneratedPdfBlobUrl(null);
  };

  // Clear all
  const clearAll = () => {
    setImages([]);
    setGeneratedPdfBlobUrl(null);
    setProgress(0);
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const totalImageSize = images.reduce((acc, cur) => acc + cur.size, 0);

  // Convert image to JPEG/PNG bytes via canvas
  const processImageToBytes = async (
    dataUrl: string,
    qual: QualityLevel
  ): Promise<{ bytes: Uint8Array; isPng: boolean; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }

        // Fill white background for transparent images
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        let q = 0.95;
        if (qual === "medium") q = 0.8;
        if (qual === "low") q = 0.65;

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error("Blob creation failed"));
              return;
            }
            const buffer = await blob.arrayBuffer();
            resolve({
              bytes: new Uint8Array(buffer),
              isPng: false,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          },
          "image/jpeg",
          q
        );
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  // Generate PDF
  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsConverting(true);
    setProgress(5);

    try {
      const pdfDoc = await PDFDocument.create();
      const marginPt = margin === "none" ? 0 : margin === "small" ? 20 : 40;

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const { bytes, width: imgW, height: imgH } = await processImageToBytes(item.dataUrl, quality);

        const embeddedImage = await pdfDoc.embedJpg(bytes);

        // Determine Page Dimensions in points (72 pt per inch)
        let pageWidth = 595.28; // A4 pt
        let pageHeight = 841.89;

        if (pageSize === "letter") {
          pageWidth = 612;
          pageHeight = 792;
        } else if (pageSize === "fit") {
          // 1px approx 0.75pt (96dpi to 72pt)
          const scale = 0.75;
          pageWidth = imgW * scale + marginPt * 2;
          pageHeight = imgH * scale + marginPt * 2;
        }

        if (pageSize !== "fit") {
          const isLandscape =
            orientation === "landscape" || (orientation === "auto" && imgW > imgH);

          if (isLandscape && pageWidth < pageHeight) {
            const temp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = temp;
          } else if (!isLandscape && pageWidth > pageHeight) {
            const temp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = temp;
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate image fit inside printable bounds
        const printableW = Math.max(10, pageWidth - marginPt * 2);
        const printableH = Math.max(10, pageHeight - marginPt * 2);

        const scaleW = printableW / imgW;
        const scaleH = printableH / imgH;
        const fitScale = Math.min(scaleW, scaleH);

        const drawW = imgW * fitScale;
        const drawH = imgH * fitScale;

        const posX = marginPt + (printableW - drawW) / 2;
        const posY = marginPt + (printableH - drawH) / 2;

        page.drawImage(embeddedImage, {
          x: posX,
          y: posY,
          width: drawW,
          height: drawH,
        });

        setProgress(Math.round(((i + 1) / images.length) * 85) + 5);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setGeneratedPdfBlobUrl(url);
      setGeneratedPdfSize(blob.size);
      setProgress(100);
    } catch (err) {
      console.error("PDF Generation error:", err);
      alert("PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      <Header />

      <main style={{ flex: 1, padding: "40px 0 80px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          {/* Breadcrumb Navigation */}
          <div style={{ marginBottom: "24px" }}>
            <Link
              href="/#tools"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              <ArrowLeft size={16} />
              {txt.back}
            </Link>
          </div>

          {/* Title Header */}
          <div style={{ marginBottom: "36px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "100px",
                background: "rgba(52, 211, 153, 0.12)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                color: "#10b981",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              <FileCheck size={16} />
              {txt.badge}
            </div>
            <h1
              style={{
                fontSize: "clamp(26px, 4vw, 38px)",
                fontWeight: 900,
                color: "var(--text-primary)",
                letterSpacing: "-0.6px",
                marginBottom: "12px",
              }}
            >
              {txt.title}
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "var(--text-secondary)",
                maxWidth: "680px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              {txt.subtitle}
            </p>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              borderRadius: "20px",
              border: `2px dashed ${isDragging ? "var(--accent-primary)" : "var(--border-strong)"}`,
              background: isDragging ? "rgba(59, 130, 246, 0.08)" : "var(--bg-card)",
              padding: "48px 24px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "32px",
              boxShadow: "0 10px 30px -10px var(--shadow-color)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
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
                borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.1))",
                border: "1px solid rgba(52, 211, 153, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#10b981",
              }}
            >
              <Upload size={30} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
              {txt.dropzoneTitle}
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              {txt.dropzoneHint}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 700,
                borderRadius: "10px",
                pointerEvents: "none",
              }}
            >
              {txt.dropzoneBtn}
            </button>
          </div>

          {/* If Images Selected */}
          {images.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Top Controls Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {images.length} {txt.imagesCount}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>
                    ({txt.totalSize}: {formatSize(totalImageSize)})
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn"
                    style={{
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 700,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "var(--accent-primary)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={15} />
                    {txt.addMore}
                  </button>

                  <button
                    onClick={clearAll}
                    className="btn"
                    style={{
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 700,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={15} />
                    {txt.clearAll}
                  </button>
                </div>
              </div>

              {/* Order Tip */}
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 4px",
                }}
              >
                <Sparkles size={14} style={{ color: "#eab308" }} />
                <span>{txt.reorderTip}</span>
              </div>

              {/* Image Queue List */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {images.map((item, index) => (
                  <div
                    key={item.id}
                    className="glass-card"
                    style={{
                      padding: "16px",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      position: "relative",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-card)",
                    }}
                  >
                    {/* Page Number Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        background: "rgba(0,0,0,0.75)",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "4px",
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", gap: "8px" }}>
                        <span>{item.width} × {item.height}px</span>
                        <span>•</span>
                        <span>{formatSize(item.size)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        style={{
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "6px",
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: index === 0 ? "not-allowed" : "pointer",
                          opacity: index === 0 ? 0.3 : 1,
                          color: "var(--text-primary)",
                        }}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>

                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === images.length - 1}
                        style={{
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "6px",
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: index === images.length - 1 ? "not-allowed" : "pointer",
                          opacity: index === images.length - 1 ? 0.3 : 1,
                          color: "var(--text-primary)",
                        }}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          borderRadius: "6px",
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#ef4444",
                        }}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Options & Settings Panel */}
              <div
                className="glass-card"
                style={{
                  padding: "28px",
                  borderRadius: "18px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                  <Sliders size={20} style={{ color: "var(--accent-primary)" }} />
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {txt.settingsTitle}
                  </h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                  {/* Page Size */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                      {txt.pageSize}
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(e.target.value as PageSize);
                        setGeneratedPdfBlobUrl(null);
                      }}
                      className="input"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "13.5px" }}
                    >
                      <option value="a4">{txt.pageA4}</option>
                      <option value="letter">{txt.pageLetter}</option>
                      <option value="fit">{txt.pageFit}</option>
                    </select>
                  </div>

                  {/* Orientation */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                      {txt.orientation}
                    </label>
                    <select
                      value={orientation}
                      disabled={pageSize === "fit"}
                      onChange={(e) => {
                        setOrientation(e.target.value as Orientation);
                        setGeneratedPdfBlobUrl(null);
                      }}
                      className="input"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        fontSize: "13.5px",
                        opacity: pageSize === "fit" ? 0.5 : 1,
                      }}
                    >
                      <option value="auto">{txt.orientAuto}</option>
                      <option value="portrait">{txt.orientPortrait}</option>
                      <option value="landscape">{txt.orientLandscape}</option>
                    </select>
                  </div>

                  {/* Margin */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                      {txt.margin}
                    </label>
                    <select
                      value={margin}
                      onChange={(e) => {
                        setMargin(e.target.value as MarginSize);
                        setGeneratedPdfBlobUrl(null);
                      }}
                      className="input"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "13.5px" }}
                    >
                      <option value="none">{txt.marginNone}</option>
                      <option value="small">{txt.marginSmall}</option>
                      <option value="normal">{txt.marginNormal}</option>
                    </select>
                  </div>

                  {/* Quality */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                      {txt.quality}
                    </label>
                    <select
                      value={quality}
                      onChange={(e) => {
                        setQuality(e.target.value as QualityLevel);
                        setGeneratedPdfBlobUrl(null);
                      }}
                      className="input"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "13.5px" }}
                    >
                      <option value="high">{txt.qualHigh}</option>
                      <option value="medium">{txt.qualMed}</option>
                      <option value="low">{txt.qualLow}</option>
                    </select>
                  </div>
                </div>

                {/* Output Filename */}
                <div style={{ marginTop: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                    {txt.filenameLabel}
                  </label>
                  <input
                    type="text"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    className="input"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px" }}
                    placeholder="my_document.pdf"
                  />
                </div>

                {/* Convert Button & Progress */}
                <div style={{ marginTop: "28px" }}>
                  {isConverting && (
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          height: "8px",
                          width: "100%",
                          borderRadius: "4px",
                          background: "var(--border-subtle)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${progress}%`,
                            background: "linear-gradient(90deg, #10b981, #3b82f6)",
                            transition: "width 0.2s ease",
                          }}
                        />
                      </div>
                      <div style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                        {txt.converting} ({progress}%)
                      </div>
                    </div>
                  )}

                  {!generatedPdfBlobUrl ? (
                    <button
                      onClick={handleGeneratePdf}
                      disabled={isConverting}
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        padding: "14px 28px",
                        fontSize: "16px",
                        fontWeight: 800,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        cursor: isConverting ? "not-allowed" : "pointer",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
                      }}
                    >
                      <Sparkles size={18} />
                      {isConverting ? txt.converting : txt.convertBtn}
                    </button>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        padding: "20px",
                        borderRadius: "14px",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1.5px solid rgba(16, 185, 129, 0.35)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#10b981" }}>
                        <CheckCircle2 size={20} />
                        <span style={{ fontSize: "15px", fontWeight: 800 }}>{txt.successMsg}</span>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                          ({formatSize(generatedPdfSize)})
                        </span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                        <a
                          href={generatedPdfBlobUrl}
                          download={outputFilename.endsWith(".pdf") ? outputFilename : `${outputFilename}.pdf`}
                          className="btn btn-primary"
                          style={{
                            flex: 1,
                            minWidth: "200px",
                            padding: "12px 24px",
                            fontSize: "15px",
                            fontWeight: 800,
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            textDecoration: "none",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                          }}
                        >
                          <Download size={18} />
                          {txt.downloadPdf}
                        </a>

                        <a
                          href={generatedPdfBlobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                          style={{
                            padding: "12px 20px",
                            fontSize: "14px",
                            fontWeight: 700,
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            textDecoration: "none",
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                          }}
                        >
                          <Eye size={16} />
                          {txt.previewPdf}
                        </a>

                        <button
                          onClick={() => setGeneratedPdfBlobUrl(null)}
                          className="btn"
                          style={{
                            padding: "12px 18px",
                            fontSize: "14px",
                            fontWeight: 700,
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "transparent",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                          }}
                        >
                          <RotateCcw size={15} />
                          {txt.reset}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guide & FAQs */}
          <div style={{ marginTop: "60px" }}>
            <ToolGuide
              badgeText="100% Free & Local Processing"
              aboutTitle={txt.guideTitle}
              aboutDesc={txt.subtitle}
              howTitle={txt.title}
              steps={[
                `${txt.step1Title}: ${txt.step1Desc}`,
                `${txt.step2Title}: ${txt.step2Desc}`,
                `${txt.step3Title}: ${txt.step3Desc}`,
              ]}
              faqs={[
                { q: txt.faq1Q, a: txt.faq1A },
                { q: txt.faq2Q, a: txt.faq2A },
              ]}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
