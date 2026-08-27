"use client";

import Link from "next/link";
import {
  FilePlus2, Scissors, FolderArchive, FileText,
  Maximize2, RefreshCw, Minimize2, Wand2, Stamp,
  Type, Eye, Code2, GitCompare,
  Braces, Binary, Link2, Search,
  ArrowLeftRight, Palette, Table,
  KeyRound, ShieldCheck, QrCode, Clock,
  ChevronRight, TrendingUp, Hammer, Flame, Sparkles,
  ShieldAlert, AppWindow, Star, Images
} from "lucide-react";
import type { Tool, ToolCategory } from "@/lib/tools";
import { TOOLS, groupToolsByCategory, getLocalizedTool } from "@/lib/tools";
import { useLocale } from "@/lib/context/LocaleContext";
import { useState, useEffect } from "react";
import { getToolUsageCount, incrementToolUsage, formatCount } from "@/lib/stats";
import { getFavorites, toggleFavorite } from "@/lib/favorites";

type ToolLocale = { title: string; description: string };

const TOOL_TRANSLATIONS: Record<string, Record<string, ToolLocale>> = {
  // PDF
  "pdf-merger":    { en: { title: "PDF Merge", description: "Combine multiple PDF files into a single document instantly." }, ko: { title: "PDF 합치기", description: "여러 PDF 파일을 하나의 문서로 즉시 합칩니다." }, ja: { title: "PDFマージ", description: "複数のPDFを即座に一つに結合します。" }, es: { title: "Combinar PDF", description: "Combina varios archivos PDF en un solo documento al instante." }, zh: { title: "PDF 合并", description: "立即将多个 PDF 文件合并为一个文档。" }, fr: { title: "Fusionner PDF", description: "Combinez plusieurs fichiers PDF en un seul document." } },
  "pdf-split":     { en: { title: "PDF Split", description: "Extract specific pages or split a PDF into separate files." }, ko: { title: "PDF 분할", description: "특정 페이지를 추출하거나 PDF를 여러 파일로 분할합니다." }, ja: { title: "PDF分割", description: "特定ページを抽出またはPDFを分割します。" }, es: { title: "Dividir PDF", description: "Extrae paginas especificas o divide un PDF en archivos separados." }, zh: { title: "PDF 拆分", description: "提取特定页面或将 PDF 拆分为独立文件。" }, fr: { title: "Diviser PDF", description: "Extrayez des pages specifiques ou divisez un PDF en fichiers distincts." } },
  "pdf-compress":  { en: { title: "PDF Compress", description: "Reduce PDF file size while maintaining visual quality." }, ko: { title: "PDF 압축", description: "눈에 띄는 품질 저하 없이 PDF 파일 크기를 줄입니다." }, ja: { title: "PDF圧縮", description: "品質を保ちつつPDFファイルサイズを圧縮します。" }, es: { title: "Comprimir PDF", description: "Reduce el tamano del archivo PDF manteniendo la calidad." }, zh: { title: "PDF 压缩", description: "在保持清晰度的同时降低 PDF 文件大小。" }, fr: { title: "Compresser PDF", description: "Reduisez la taille du fichier PDF tout en conservant la qualite." } },
  "image-to-pdf":  { en: { title: "Image to PDF Converter", description: "Combine multiple JPG, PNG, and WebP images into a single PDF document." }, ko: { title: "이미지 PDF 변환기", description: "여러 장의 사진/이미지를 순서대로 묶어 하나의 고화질 PDF 문서로 즉시 변환합니다." }, ja: { title: "画像 PDF 変換ツール", description: "複数の写真や画像を順番通りに1つの高品質なPDFファイルに即座に変換・結合します。" }, es: { title: "Convertidor de Imagen a PDF", description: "Combina y convierte múltiples imágenes en un documento PDF profesional al instante." }, zh: { title: "图片转 PDF 转换器", description: "将多张照片与图像按指定顺序一键合并转换为高清 PDF 电子文档。" }, fr: { title: "Convertisseur Image en PDF", description: "Combinez et convertissez plusieurs photos et images en un seul document PDF de haute qualité." } },
  "pdf-to-word":   { en: { title: "PDF to Word", description: "Convert PDF documents to editable .docx format." }, ko: { title: "PDF → Word", description: "PDF 문서를 편집 가능한 .docx 형식으로 변환합니다." }, ja: { title: "PDF→Word", description: "PDFを 編集可能な.docx形式に変換します。" }, es: { title: "PDF a Word", description: "Convierte documentos PDF a formato .docx editable." }, zh: { title: "PDF 转 Word", description: "将 PDF 文档转换为可编辑的 .docx 格式。" }, fr: { title: "PDF en Word", description: "Convertissez des documents PDF au format .docx modifiable." } },

  // Image
  "image-resizer":    { en: { title: "Image Resizer", description: "Resize images to any dimension while preserving aspect ratio." }, ko: { title: "이미지 리사이즈", description: "비율을 유지하면서 이미지를 원하는 크기로 조절합니다." }, ja: { title: "画像リサイズ", description: "アスペクト比を保ちながら画像をリサイズします。" }, es: { title: "Redimensionar Imagen", description: "Cambia el tamano manteniendo la relacion de aspecto." }, zh: { title: "图片调整尺寸", description: "在保持宽高比的同时调整图片尺寸。" }, fr: { title: "Redimensionner Image", description: "Redimensionnez les images tout en conservant le ratio." } },
  "image-converter":  { en: { title: "Image Converter", description: "Convert between JPG, PNG, WebP, AVIF, GIF, and more formats." }, ko: { title: "이미지 변환기", description: "JPG, PNG, WebP, AVIF, GIF 등 다양한 형식으로 변환합니다." }, ja: { title: "画像変換", description: "JPG, PNG, WebP, AVIF, GIF間で変換します。" }, es: { title: "Convertidor de Imagen", description: "Convierte entre formatos JPG, PNG, WebP, AVIF y GIF." }, zh: { title: "图片格式转换器", description: "在 JPG, PNG, WebP, AVIF, GIF 等格式间转换。" }, fr: { title: "Convertisseur d'Image", description: "Convertissez entre les formats JPG, PNG, WebP, AVIF et GIF." } },
  "image-compress":   { en: { title: "Image Compress", description: "Shrink image file sizes for faster web loading." }, ko: { title: "이미지 압축", description: "웹 로딩 속도를 높이기 위해 이미지 파일 크기를 줄입니다." }, ja: { title: "画像圧縮", description: "ウェブ読み込みを速めるため画像を圧縮します。" }, es: { title: "Comprimir Imagen", description: "Reduce el tamano de la imagen para una carga web mas rapida." }, zh: { title: "图片压缩", description: "缩小图片文件体积，加快网页加载速度。" }, fr: { title: "Compresser Image", description: "Reduisez la taille des images pour un chargement web plus rapide." } },
  "background-remover": { en: { title: "Background Remover", description: "Automatically remove image backgrounds with AI precision." }, ko: { title: "배경 제거 (누끼 따기)", description: "AI로 이미지 배경을 자동으로 정밀하게 제거합니다." }, ja: { title: "背景除去", description: "AIで画像の背景を自動で精密に除去します。" }, es: { title: "Eliminar Fondo", description: "Elimina fondos de imagen automaticamente con precision IA." }, zh: { title: "抠图去背景", description: "利用 AI 精准自动去除图片背景。" }, fr: { title: "Supprimer l'Arriere-Plan", description: "Supprimez l'arriere-plan des images automatiquement avec precision IA." } },
  "image-watermark":  { en: { title: "Image Watermark Adder", description: "Add custom text or logo watermarks to images with full opacity, rotation, and pattern controls." }, ko: { title: "이미지 워터마크 추가기", description: "이미지에 텍스트 및 로고 워터마크를 투명도, 회전, 격자 패턴으로 추가합니다." }, ja: { title: "画像ウォーターマーク追加", description: "画像にテキストやロゴの透かし（ウォーターマーク）を追加します。" }, es: { title: "Añadir Marca de Agua", description: "Añade marcas de agua de texto o logo a tus imágenes con control total." }, zh: { title: "图片水印添加器", description: "给图片添加自定义文本或 Logo 水印，支持透明度、旋转与平铺。" }, fr: { title: "Filigrane d'Image", description: "Ajoutez des filigranes de texte ou de logo à vos images en toute confidentialité." } },
  "exif-remover":     { en: { title: "Image EXIF Cleaner & Viewer", description: "Inspect GPS location, camera details, and date metadata from photos and strip all EXIF data in 1 click." }, ko: { title: "이미지 EXIF 메타데이터 제거기 / 보기", description: "사진에 담긴 GPS 위치 좌표, 촬영 기기, 날짜 등 개인정보 EXIF 데이터를 확인하고 1클릭 완벽 제거 후 다운로드." }, ja: { title: "画像EXIF情報削除・閲覧", description: "写真に含まれる位置情報（GPS）、撮影機器、日時などの個人情報EXIFを確認し1クリックで完全削除。" }, es: { title: "Visor y Eliminador de EXIF", description: "Inspecciona la ubicación GPS y datos EXIF de tus fotos y elimínalos en 1 clic." }, zh: { title: "图片 EXIF 元数据查看与清除", description: "查看照片中的 GPS 位置、拍摄设备与日期等隐私元数据，一键无损清除并下载。" }, fr: { title: "Nettoyeur & Visionneuse EXIF", description: "Inspectez la géolocalisation GPS et les métadonnées EXIF de vos photos et supprimez-les en 1 clic." } },
  "favicon-generator": { en: { title: "Favicon & App Icon Generator", description: "Generate complete 16x16, 32x32, 48x48, apple-touch-icon, favicon.ico, and site.webmanifest packages in 1 click." }, ko: { title: "Favicon & 앱 아이콘 생성기", description: "하나의 로고 이미지를 올리면 16x16, 32x32, 48x48, apple-touch-icon, favicon.ico 세트를 일괄 생성하여 다운로드." }, ja: { title: "ファビコン＆アプリアイコン作成", description: "1つのロゴ画像から16x16、32x32、apple-touch-icon、favicon.icoパッケージを1クリック生成。" }, es: { title: "Generador de Favicon e Iconos App", description: "Genera paquetes de favicons (16x16, 32x32, 180x180, favicon.ico) en 1 clic." }, zh: { title: "Favicon 与应用图标生成器", description: "上传单个 Logo 图像，一键生成 16x16、32x32、apple-touch-icon 和 favicon.ico 图标包。" }, fr: { title: "Générateur de Favicon & Icônes d'App", description: "Générez un ensemble complet de favicons (16x16, 32x32, 180x180, favicon.ico) en 1 clic." } },

  // Text
  "word-count":       { en: { title: "Word Count", description: "Count words, characters, sentences, and reading time." }, ko: { title: "단어 수 세기", description: "단어, 글자, 문장 수 및 읽기 시간을 계산합니다." }, ja: { title: "文字数カウント", description: "単語数、文字数、文章数、読了時間を計測します。" }, es: { title: "Contador de Palabras", description: "Cuenta palabras, caracteres, oraciones y tiempo de lectura." }, zh: { title: "字数统计", description: "统计单词数、字符数、句子数及阅读时间。" }, fr: { title: "Compteur de Mots", description: "Comptez les mots, caracteres, phrases et temps de lecture." } },
  "text-case":        { en: { title: "Text Case Converter", description: "Convert text between UPPERCASE, lowercase, Title Case, camelCase, and more." }, ko: { title: "대소문자 / 표기법 변환기", description: "대문자, 소문자, 제목 형식, camelCase 등으로 변환합니다." }, ja: { title: "テキストケース変換", description: "大文字、小文字、タイトルケース、camelCaseに変換します。" }, es: { title: "Convertidor de Mayusculas", description: "Cambia entre MAYUSCULAS, minusculas, camelCase y mas." }, zh: { title: "文本大小写转换", description: "在 大写, 小写, camelCase, snake_case 间转换。" }, fr: { title: "Convertisseur de Casse", description: "Passez entre MAJUSCULES, minuscules, camelCase et plus." } },
  "markdown-preview": { en: { title: "Markdown Live Preview", description: "Write Markdown text and view instant rendered HTML side-by-side." }, ko: { title: "마크다운 실시간 미리보기", description: "마크다운을 작성하고 HTML 미리보기를 실시간으로 확인합니다." }, ja: { title: "マークダウンプレビュー", description: "マークダウンを書いてHTMLプレビューをリアルタイム表示します。" }, es: { title: "Vista Previa Markdown", description: "Escribe Markdown y mira la vista previa HTML en tiempo real." }, zh: { title: "Markdown 实时预览", description: "实时编写 Markdown 并分屏预览 HTML 效果。" }, fr: { title: "Apercu Markdown en Direct", description: "Ecrivez du Markdown et visualisez l'apercu HTML en temps reel." } },
  "text-diff":        { en: { title: "Text Diff Checker", description: "Compare two text blocks and highlight line-by-line differences." }, ko: { title: "텍스트 차이점 비교 (Diff)", description: "두 텍스트 블록을 비교하고 차이점을 강조 표시합니다." }, ja: { title: "テキスト差分", description: "2つのテキストブロックを比較し差分をハイライトします。" }, es: { title: "Comparador de Texto", description: "Compara dos bloques de texto y resalta las diferencias." }, zh: { title: "文本差异对比", description: "对比两段文本并逐行高亮显示差异之处。" }, fr: { title: "Comparateur de Texte", description: "Comparez deux blocs de texte et mettez en surbrillance les differences." } },

  // Dev
  "json-formatter": { en: { title: "JSON Formatter & Validator", description: "Prettify, minify, and validate JSON data with instant syntax highlighting." }, ko: { title: "JSON 정렬 / 검증기", description: "JSON을 보기 좋게 정렬하거나 축소하고 유효성을 검사합니다." }, ja: { title: "JSONフォーマット", description: "JSONを整形、圧縮、検証します。" }, es: { title: "Formateador JSON", description: "Embellece, minifica y valida JSON al instante." }, zh: { title: "JSON 格式化与验证", description: "美化、压缩并校验 JSON 数据结构。" }, fr: { title: "Formateur JSON", description: "Embellissez, minifiez et validez les donnees JSON instantanement." } },
  "base64":         { en: { title: "Base64 Encode / Decode", description: "Convert plain text or binary files to Base64 strings and back." }, ko: { title: "Base64 인코딩/디코딩", description: "문자열이나 파일을 Base64로 인코딩하거나 디코딩합니다." }, ja: { title: "Base64エンコード/デコード", description: "文字列やファイルをBase64で変換します。" }, es: { title: "Base64 Codificar / Decodificar", description: "Convierte texto o archivos a Base64 y viceversa." }, zh: { title: "Base64 编码 / 解码", description: "在文本/文件与 Base64 字符串之间相互转换。" }, fr: { title: "Base64 Encodage / Decodage", description: "Convertissez du texte ou des fichiers en Base64 et inversement." } },
  "url-encoder":    { en: { title: "URL Encode & Decode", description: "Encode or decode special characters and parameters in URLs." }, ko: { title: "URL 인코더 / 디코더", description: "URL 문자열과 쿼리 파라미터를 인코딩하거나 디코딩합니다." }, ja: { title: "URLエンコード/デコード", description: "URL文字列とクエリパラメータを変換します。" }, es: { title: "Codificador URL", description: "Codifica o decodifica caracteres especiales en URL." }, zh: { title: "URL 编码 / 解码", description: "对 URL 中的特殊字符和参数进行编码或解码。" }, fr: { title: "Encodeur URL", description: "Encodez ou decodez les caracteres speciaux dans les URL." } },
  "regex-tester":   { en: { title: "Regex Tester & Debugger", description: "Test regular expressions with real-time match highlighting and capture groups." }, ko: { title: "정규표현식(Regex) 테스터", description: "실시간 매칭 강조로 정규표현식을 테스트하고 디버깅합니다." }, ja: { title: "正規表現テスター", description: "リアルタイムハイライトで正規表現をテストします。" }, es: { title: "Probador de Regex", description: "Prueba expresiones regulares con resalte en tiempo real." }, zh: { title: "正则表达式测试器", description: "实时高亮匹配并调试正则表达式。" }, fr: { title: "Testeur de Regex", description: "Testez les expressions regulieres avec surbrillance en temps reel." } },
  "jwt-decoder":    { en: { title: "JWT Decoder & Inspector", description: "Decode JSON Web Tokens and inspect Header & Payload claims." }, ko: { title: "JWT 디코더 & 토큰 분석기", description: "JSON Web Token(JWT)을 실시간 디코딩하고 만료 시간을 분석합니다." }, ja: { title: "JWT デコーダー＆解析", description: "JSON Web Token (JWT) をリアルタイムでデコード・解析します。" }, es: { title: "Decodificador JWT", description: "Decodifica e inspecciona JSON Web Tokens en tiempo real." }, zh: { title: "JWT 解析与解码", description: "实时解码 JSON Web Token 并查看 Claims 载荷。" }, fr: { title: "Décodeur JWT", description: "Décodez et inspectez des jetons JSON Web Tokens en direct." } },
  "qr-generator":   { en: { title: "QR Code Generator", description: "Generate high-res QR codes for URLs, text, and Wi-Fi credentials." }, ko: { title: "QR 코드 생성기", description: "URL, 텍스트, Wi-Fi 정보 기반 맞춤형 고해상도 QR 코드를 생성합니다." }, ja: { title: "QR コード作成", description: "URL、テキスト、Wi-Fi情報から高解像度QRコードを生成します。" }, es: { title: "Generador de QR", description: "Genera códigos QR personalizados para URL, texto y Wi-Fi." }, zh: { title: "QR 二维码生成器", description: "生成网址、文本与 Wi-Fi 二维码，支持 PNG/SVG 导出。" }, fr: { title: "Générateur de Code QR", description: "Générez des codes QR personnalisés pour URL, texte et Wi-Fi." } },
  "cron-parser":    { en: { title: "Cron Expression Parser", description: "Parse cron expressions, generate human descriptions, and next executions." }, ko: { title: "Cron 표현식 파서 & 생성기", description: "Cron 표현식을 자연어로 번역하고 다음 실행 시각을 계산합니다." }, ja: { title: "Cron 表現式解析＆生成", description: "Cron表現式を自然言語に翻訳し次回実行日時を計算します。" }, es: { title: "Analizador de Cron", description: "Traduce expresiones cron a lenguaje natural y calcula ejecuciones." }, zh: { title: "Cron 表达式解析器", description: "将 Cron 定时表达式转换为人类可读语言并计算执行时刻。" }, fr: { title: "Analyseur Cron", description: "Traduisez des expressions cron en langage clair et calculez les exécutions." } },

  // Converter & Security
  "unit-converter":    { en: { title: "Unit Converter", description: "Convert length, weight, temperature, area, volume, and speed." }, ko: { title: "단위 변환기", description: "길이, 무게, 온도, 넓이, 부피, 속도 등 다양한 단위를 즉시 변환합니다." }, ja: { title: "単位変換ツール", description: "長さ、重さ、温度、面積などを即座に相互変換します。" }, es: { title: "Convertidor de Unidades", description: "Convierte longitud, peso, temperatura y mas al instante." }, zh: { title: "多功能单位转换", description: "长度、重量、温度、面积等多维度单位换算。" }, fr: { title: "Convertisseur d'Unités", description: "Convertissez longueur, poids, température et plus." } },
  "color-converter":   { en: { title: "Color Converter & Picker", description: "Convert between HEX, RGB, HSL, HSV, and CMYK color codes." }, ko: { title: "색상 변환기 & 피커", description: "HEX, RGB, HSL, HSV, CMYK 색상 코드를 상호 변환합니다." }, ja: { title: "カラー変換＆ピッカー", description: "HEX、RGB、HSL、HSVコード를 즉시 상호변환." }, es: { title: "Convertidor de Color", description: "Convierte entre formatos de color HEX, RGB y HSL." }, zh: { title: "颜色格式转换与拾色器", description: "HEX、RGB、HSL、HSV 颜色代码相互转换。" }, fr: { title: "Convertisseur de Couleur", description: "Convertissez entre les formats HEX, RGB et HSL." } },
  "csv-to-json":       { en: { title: "CSV → JSON", description: "Upload a CSV file and convert it to structured JSON data." }, ko: { title: "CSV → JSON 변환기", description: "CSV 파일을 업로드하고 구조화된 JSON 데이터로 변환합니다." }, ja: { title: "CSV→JSON", description: "CSVファイルを構造化JSONデータに変換します。" }, es: { title: "CSV a JSON", description: "Sube un archivo CSV y conviértelo a datos JSON." }, zh: { title: "CSV 转 JSON 数据", description: "将 CSV 文件解析转换为 JSON 结构化数据。" }, fr: { title: "CSV vers JSON", description: "Convertissez un fichier CSV en données JSON." } },
  "password-generator": { en: { title: "Password Generator", description: "Generate strong, cryptographically secure random passwords." }, ko: { title: "비밀번호 생성기", description: "안전한 무작위 비밀번호를 암호학적으로 생성합니다." }, ja: { title: "パスワード自動生成", description: "暗号学的に安全なランダムパスワードを生成します。" }, es: { title: "Generador de Contraseñas", description: "Genera contraseñas aleatorias seguras." }, zh: { title: "随机密码生成器", description: "生成具备密码学强度的随机高难度安全密码。" }, fr: { title: "Générateur de Mots de Passe", description: "Générez des mots de passe aléatoires sécurisés." } },
  "hash-generator":     { en: { title: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, or SHA-512 hashes from text." }, ko: { title: "해시 생성기 (MD5 / SHA-256)", description: "텍스트에서 MD5, SHA-1, SHA-256, SHA-512 해시를 생성합니다." }, ja: { title: "ハッシュ生成", description: "テキストからMD5、SHA-256などのハッシュを生成します。" }, es: { title: "Generador de Hash", description: "Genera hashes MD5, SHA-1 o SHA-256." }, zh: { title: "哈希值计算", description: "计算文本的 MD5、SHA-1 及 SHA-256 校验和。" }, fr: { title: "Générateur de Hachage", description: "Générez des hachages MD5, SHA-1 ou SHA-256." } },
};

const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  "PDF Tools":         { ko: "PDF 도구",        ja: "PDFツール",      es: "Herramientas PDF",    zh: "PDF工具",      fr: "Outils PDF" },
  "Image Tools":       { ko: "이미지 도구",      ja: "画像ツール",     es: "Herramientas Imagen", zh: "图像工具",     fr: "Outils Image" },
  "Text & Formatting": { ko: "텍스트 & 서식",    ja: "テキスト整形",   es: "Texto & Formato",     zh: "文本&格式",    fr: "Texte & Format" },
  "Dev Tools":         { ko: "개발자 도구",      ja: "開発者ツール",   es: "Herramientas Dev",    zh: "开发工具",     fr: "Outils Dev" },
  "Converter":         { ko: "변환기",           ja: "コンバーター",   es: "Conversor",           zh: "转换器",       fr: "Convertisseur" },
  "Security":          { ko: "보안",             ja: "セキュリティ",   es: "Seguridad",           zh: "安全",         fr: "Sécurité" },
};

const CAT_NAV_TRANSLATIONS: Record<string, Record<string, string>> = {
  "PDF":       { ko: "PDF",    ja: "PDF",    es: "PDF",       zh: "PDF",   fr: "PDF" },
  "Image":     { ko: "이미지", ja: "画像",   es: "Imagen",    zh: "图像",  fr: "Image" },
  "Text":      { ko: "텍스트", ja: "テキスト", es: "Texto",   zh: "文本",  fr: "Texte" },
  "Dev":       { ko: "개발",   ja: "開発",   es: "Dev",       zh: "开发",  fr: "Dev" },
  "Converter": { ko: "변환기", ja: "変換",   es: "Conversor", zh: "转换器", fr: "Conv." },
  "Security":  { ko: "보안",   ja: "セキュリティ", es: "Seguridad", zh: "安全", fr: "Sécu." },
};

const TOOL_ICON_BY_ID: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  "pdf-merger": FilePlus2,
  "pdf-split": Scissors,
  "pdf-compress": FolderArchive,
  "image-resizer": Maximize2,
  "image-converter": RefreshCw,
  "image-compress": Minimize2,
  "background-remover": Wand2,
  "image-watermark": Stamp,
  "exif-remover": ShieldAlert,
  "favicon-generator": AppWindow,
  "image-to-pdf": Images,
  "word-count": FileText,
  "text-case": Type,
  "markdown-preview": Eye,
  "text-diff": GitCompare,
  "json-formatter": Braces,
  "base64": Code2,
  "url-encoder": Link2,
  "regex-tester": Search,
  "jwt-decoder": KeyRound,
  "qr-generator": QrCode,
  "cron-parser": Clock,
  "unit-converter": ArrowLeftRight,
  "color-converter": Palette,
  "csv-to-json": Table,
  "password-generator": ShieldCheck,
  "hash-generator": Binary,
};

const CATEGORY_META: Record<ToolCategory, { iconClass: string; badgeClass: string; accent: string }> = {
  "PDF Tools":         { iconClass: "icon-pdf",       badgeClass: "badge-pdf",       accent: "#f87171" },
  "Image Tools":       { iconClass: "icon-image",     badgeClass: "badge-image",     accent: "#34d399" },
  "Text & Formatting": { iconClass: "icon-text",      badgeClass: "badge-text",      accent: "#60a5fa" },
  "Dev Tools":         { iconClass: "icon-dev",       badgeClass: "badge-dev",       accent: "#818cf8" },
  "Converter":         { iconClass: "icon-converter", badgeClass: "badge-converter", accent: "#fbbf24" },
  "Security":          { iconClass: "icon-security",  badgeClass: "badge-security",  accent: "#38bdf8" },
};

const BADGE_TRANSLATIONS: Record<string, Record<string, string>> = {
  Popular: { ko: "인기",   ja: "人気",     es: "Popular",  zh: "热门",  fr: "Populaire" },
  New:     { ko: "신규",   ja: "新着",     es: "Nuevo",    zh: "新品",  fr: "Nouveau" },
};

const DEV_LABEL: Record<string, string> = {
  ko: "개발 중",
  ja: "開発中",
  es: "En desarrollo",
  zh: "开发中",
  fr: "En développement",
  en: "In Dev",
};

interface ToolGridProps {
  tools?: Tool[];
  isSearching?: boolean;
  onCategorySearch?: (query: string) => void;
}

export default function ToolGrid({ tools = TOOLS }: ToolGridProps) {
  const grouped = groupToolsByCategory(tools);
  const { locale } = useLocale();

  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
    const counts: Record<string, number> = {};
    grouped.forEach(({ tools: categoryTools }) => {
      categoryTools.forEach((tool) => {
        counts[tool.id] = getToolUsageCount(tool.id);
      });
    });
    setUsageCounts(counts);
  }, []);

  const handleToolClick = (toolId: string) => {
    const newCount = incrementToolUsage(toolId);
    setUsageCounts((prev) => ({ ...prev, [toolId]: newCount }));
  };

  const handleToggleFav = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleFavorite(toolId);
    setFavorites([...updated]);
  };

  const getTitle = (tool: Tool) => {
    const loc = TOOL_TRANSLATIONS[tool.id]?.[locale]?.title;
    if (loc) return loc;
    return getLocalizedTool(tool, locale).title;
  };

  const getDesc = (tool: Tool) => {
    const loc = TOOL_TRANSLATIONS[tool.id]?.[locale]?.description;
    if (loc) return loc;
    return getLocalizedTool(tool, locale).description;
  };

  const getCatName = (cat: string) => {
    return CATEGORY_TRANSLATIONS[cat]?.[locale] ?? cat;
  };

  const getBadgeText = (badge?: string) => {
    if (!badge) return null;
    return BADGE_TRANSLATIONS[badge]?.[locale] ?? badge;
  };

  return (
    <section id="tools" style={{ padding: "16px 0 60px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {favorites.length > 0 && (
          <div style={{ marginBottom: "56px" }}>
            {/* Favorites Header Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "4px",
                    height: "20px",
                    borderRadius: "2px",
                    background: "#eab308",
                  }}
                />
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.3px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Star size={18} style={{ color: "#eab308" }} fill="#facc15" />
                  {locale === "ko" ? "즐겨찾는 도구 (Pinned Favorites)" : "Pinned Favorites"}
                </h2>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#ca8a04",
                    background: "rgba(250, 204, 21, 0.14)",
                    border: "1px solid rgba(250, 204, 21, 0.35)",
                    padding: "2px 8px",
                    borderRadius: "100px",
                  }}
                >
                  {favorites.length}{locale === "ko" ? "개 고정됨" : " pinned"}
                </span>
              </div>

              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  display: "none",
                }}
                className="sm-inline"
              >
                ★ 아이콘을 눌러 언제든 추가/해제
              </span>
            </div>

            {/* Favorites Grid */}
            <div className="tool-grid-container">
              {favorites.map((favId) => {
                const tool = TOOLS.find((t) => t.id === favId);
                if (!tool || tool.isDev) return null;
                const IconComponent = TOOL_ICON_BY_ID[tool.id] || Sparkles;
                const count = usageCounts[tool.id] ?? getToolUsageCount(tool.id);
                const meta = CATEGORY_META[tool.category] || CATEGORY_META["Dev Tools"];

                return (
                  <Link
                    key={`fav-${tool.id}`}
                    href={tool.href}
                    onClick={() => handleToolClick(tool.id)}
                    className="glass-card card-hover"
                    style={{
                      padding: "22px",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px",
                      position: "relative",
                      border: "1.5px solid rgba(250, 204, 21, 0.4)",
                      background: "var(--bg-card)",
                      boxShadow: "0 6px 18px -4px rgba(250, 204, 21, 0.12)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                        <div
                          className={meta.iconClass}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconComponent size={20} strokeWidth={1.75} />
                        </div>

                        <button
                          onClick={(e) => handleToggleFav(e, tool.id)}
                          style={{
                            background: "rgba(250, 204, 21, 0.12)",
                            border: "1px solid rgba(250, 204, 21, 0.3)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            padding: "5px 8px",
                            color: "#eab308",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            fontWeight: 700,
                            transition: "all 0.15s",
                          }}
                          title="즐겨찾기 해제"
                        >
                          <Star size={14} fill="#facc15" />
                          <span>고정됨</span>
                        </button>
                      </div>

                      <h3 style={{ fontSize: "16.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.2px" }}>
                        {getTitle(tool)}
                      </h3>

                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.55" }}>
                        {getDesc(tool)}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#ca8a04",
                          display: "flex",
                          alignItems: "center",
                          gap: "2px",
                        }}
                      >
                        {locale === "ko" ? "실행하기" : "Run"}
                        <ChevronRight size={14} />
                      </span>

                      <span
                        style={{
                          fontSize: "11.5px",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          background: "rgba(255,255,255,0.03)",
                          padding: "2px 7px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <Flame size={11} style={{ color: "#f97316" }} />
                        {formatCount(count)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
          {grouped.map(({ category, tools: categoryTools }) => {
            const meta = CATEGORY_META[category];
            const sectionId = `cat-${category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

            if (categoryTools.length === 0) return null;

            return (
              <div key={category} id={sectionId} style={{ scrollMarginTop: "90px" }}>
                {/* Category Title */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div
                    style={{
                      width: "4px",
                      height: "20px",
                      borderRadius: "2px",
                      background: meta.accent,
                    }}
                  />
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                    {getCatName(category)}
                  </h2>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border-subtle)",
                      padding: "2px 8px",
                      borderRadius: "100px",
                      fontWeight: 600,
                    }}
                  >
                    {categoryTools.length}{locale === "ko" ? "개 도구" : " tools"}
                  </span>
                </div>

                {/* Cards Grid */}
                <div className="tool-grid-container">
                  {categoryTools.map((tool) => {
                    const IconComponent = TOOL_ICON_BY_ID[tool.id] || Sparkles;
                    const count = usageCounts[tool.id] ?? getToolUsageCount(tool.id);
                    const isFav = favorites.includes(tool.id);

                    if (tool.isDev) {
                      return (
                        <div
                          key={tool.id}
                          className="glass-card"
                          style={{
                            padding: "22px",
                            opacity: 0.6,
                            cursor: "not-allowed",
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "14px",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                              <div
                                className={meta.iconClass}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <IconComponent size={20} strokeWidth={1.75} />
                              </div>

                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: "var(--text-muted)",
                                  background: "rgba(255,255,255,0.06)",
                                  padding: "2px 8px",
                                  borderRadius: "100px",
                                  border: "1px solid var(--border-subtle)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Hammer size={10} />
                                {DEV_LABEL[locale] ?? "In Dev"}
                              </span>
                            </div>

                            <h3 style={{ fontSize: "16.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                              {getTitle(tool)}
                            </h3>

                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                              {getDesc(tool)}
                            </p>
                          </div>

                          <div style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600 }}>
                            {locale === "ko" ? "곧 출시 예정" : "Coming Soon"}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        onClick={() => handleToolClick(tool.id)}
                        className="glass-card card-hover"
                        style={{
                          padding: "22px",
                          textDecoration: "none",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "14px",
                          position: "relative",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                            <div
                              className={meta.iconClass}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <IconComponent size={20} strokeWidth={1.75} />
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {tool.badge && (
                                <span
                                  className={meta.badgeClass}
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: "100px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  {tool.badge === "Popular" && <TrendingUp size={10} />}
                                  {tool.badge === "New" && <Sparkles size={10} />}
                                  {getBadgeText(tool.badge)}
                                </span>
                              )}

                              <button
                                onClick={(e) => handleToggleFav(e, tool.id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "2px",
                                  color: isFav ? "#facc15" : "var(--text-muted)",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                title={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                              >
                                <Star size={16} fill={isFav ? "#facc15" : "none"} />
                              </button>
                            </div>
                          </div>

                          <h3 style={{ fontSize: "16.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.2px" }}>
                            {getTitle(tool)}
                          </h3>

                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.55" }}>
                            {getDesc(tool)}
                          </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px" }}>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: meta.accent,
                              display: "flex",
                              alignItems: "center",
                              gap: "2px",
                            }}
                          >
                            {locale === "ko" ? "실행하기" : "Run"}
                            <ChevronRight size={14} />
                          </span>

                          <span
                            style={{
                              fontSize: "11.5px",
                              color: "var(--text-muted)",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              background: "rgba(255,255,255,0.03)",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              border: "1px solid var(--border-subtle)",
                            }}
                            title="사용 횟수"
                          >
                            <Flame size={11} style={{ color: "#f97316" }} />
                            {formatCount(count)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
