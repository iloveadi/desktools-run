/**
 * lib/tools.ts
 * ─────────────────────────────────────────────────────────────
 * Central tool registry for desktools.run.
 */

export type ToolCategory =
  | "PDF Tools"
  | "Image Tools"
  | "Text & Formatting"
  | "Dev Tools"
  | "Converter"
  | "Security";

export type ToolBadge = "New" | "Popular" | "Pro" | "Dev";

export interface Tool {
  id: string;           // Unique slug used in URLs
  title: string;        // Display name
  description: string;  // Short description
  category: ToolCategory;
  icon: string;         // Lucide icon name
  badge?: ToolBadge;    // Optional label
  href: string;         // Route
  isDev?: boolean;      // True if tool is currently under development
}

/** All available tool categories */
export const CATEGORIES: ToolCategory[] = [
  "PDF Tools",
  "Image Tools",
  "Text & Formatting",
  "Dev Tools",
  "Converter",
  "Security",
];

/** Full tool registry */
export const TOOLS: Tool[] = [
  // ── PDF Tools ─────────────────────────────────────────────
  {
    id: "pdf-merger",
    title: "PDF Merge",
    description: "Combine multiple PDF files into a single document instantly.",
    category: "PDF Tools",
    icon: "FilePlus2",
    badge: "Popular",
    href: "/tools/pdf-merger",
    isDev: false,
  },
  {
    id: "pdf-split",
    title: "PDF Split",
    description: "Extract specific pages or split a PDF into separate files.",
    category: "PDF Tools",
    icon: "Scissors",
    href: "/tools/pdf-split",
    isDev: false,
  },
  {
    id: "pdf-compress",
    title: "PDF Compress",
    description: "Reduce PDF file size without sacrificing document visual quality.",
    category: "PDF Tools",
    icon: "FileArchive",
    badge: "Popular",
    href: "/tools/pdf-compress",
    isDev: false,
  },

  // ── Image Tools ───────────────────────────────────────────
  {
    id: "image-resizer",
    title: "Image Resizer",
    description: "Resize images to exact dimensions or scaling percentage.",
    category: "Image Tools",
    icon: "Scaling",
    href: "/tools/image-resizer",
    isDev: false,
  },
  {
    id: "image-converter",
    title: "Image Converter",
    description: "Convert between JPG, PNG, WebP, AVIF, and GIF formats.",
    category: "Image Tools",
    icon: "RefreshCw",
    badge: "Popular",
    href: "/tools/image-converter",
    isDev: false,
  },
  {
    id: "image-compress",
    title: "Image Compress",
    description: "Reduce image file sizes for faster web page loading.",
    category: "Image Tools",
    icon: "Minimize2",
    href: "/tools/image-compress",
    isDev: false,
  },
  {
    id: "background-remover",
    title: "Background Remover",
    description: "Remove image backgrounds automatically with client-side Web AI.",
    category: "Image Tools",
    icon: "Sparkles",
    badge: "New",
    href: "/tools/background-remover",
    isDev: false,
  },
  {
    id: "image-watermark",
    title: "Image Watermark Adder",
    description: "Add custom text or logo watermarks to images with full opacity, rotation, and pattern controls.",
    category: "Image Tools",
    icon: "Stamp",
    badge: "New",
    href: "/tools/image-watermark",
    isDev: false,
  },

  // ── Text & Formatting ─────────────────────────────────────
  {
    id: "word-count",
    title: "Word & Character Counter",
    description: "Analyze word count, character count, sentences, and reading time.",
    category: "Text & Formatting",
    icon: "FileText",
    badge: "Popular",
    href: "/tools/word-count",
    isDev: false,
  },
  {
    id: "text-case",
    title: "Text Case Converter",
    description: "Convert UPPERCASE, lowercase, Title Case, camelCase, and snake_case.",
    category: "Text & Formatting",
    icon: "Type",
    href: "/tools/text-case",
    isDev: false,
  },
  {
    id: "markdown-preview",
    title: "Markdown Live Preview",
    description: "Write Markdown with side-by-side formatted HTML preview.",
    category: "Text & Formatting",
    icon: "Eye",
    href: "/tools/markdown-preview",
    isDev: false,
  },
  {
    id: "text-diff",
    title: "Text Diff Checker",
    description: "Compare two text snippets side by side and highlight differences.",
    category: "Text & Formatting",
    icon: "GitCompare",
    href: "/tools/text-diff",
    isDev: false,
  },

  // ── Dev Tools ─────────────────────────────────────────────
  {
    id: "json-formatter",
    title: "JSON Formatter & Validator",
    description: "Format, minified, validate, and syntax highlight JSON data.",
    category: "Dev Tools",
    icon: "Braces",
    badge: "Popular",
    href: "/tools/json-formatter",
    isDev: false,
  },
  {
    id: "base64",
    title: "Base64 Encoder / Decoder",
    description: "Encode text and files into Base64 or decode Base64 back.",
    category: "Dev Tools",
    icon: "Code2",
    href: "/tools/base64",
    isDev: false,
  },
  {
    id: "url-encoder",
    title: "URL Encoder / Decoder",
    description: "Encode special characters into URL-safe formats or decode.",
    category: "Dev Tools",
    icon: "Link2",
    href: "/tools/url-encoder",
    isDev: false,
  },
  {
    id: "regex-tester",
    title: "Regex Tester",
    description: "Test regular expressions with real-time match highlighting.",
    category: "Dev Tools",
    icon: "Regex",
    href: "/tools/regex-tester",
    isDev: false,
  },
  {
    id: "jwt-decoder",
    title: "JWT Decoder & Inspector",
    description: "Decode JSON Web Tokens and inspect Header & Payload claims.",
    category: "Dev Tools",
    icon: "KeyRound",
    badge: "New",
    href: "/tools/jwt-decoder",
    isDev: false,
  },
  {
    id: "qr-generator",
    title: "QR Code Generator",
    description: "Generate high-res QR codes for URLs, text, and Wi-Fi credentials.",
    category: "Dev Tools",
    icon: "QrCode",
    badge: "New",
    href: "/tools/qr-generator",
    isDev: false,
  },
  {
    id: "cron-parser",
    title: "Cron Expression Parser",
    description: "Parse cron expressions, generate human descriptions, and next executions.",
    category: "Dev Tools",
    icon: "Clock",
    badge: "New",
    href: "/tools/cron-parser",
    isDev: false,
  },

  // ── Converter ─────────────────────────────────────────────
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert length, weight, temperature, area, volume, and speed.",
    category: "Converter",
    icon: "ArrowLeftRight",
    href: "/tools/unit-converter",
    isDev: false,
  },
  {
    id: "color-converter",
    title: "Color Converter & Picker",
    description: "Convert between HEX, RGB, HSL, HSV, and CMYK color codes.",
    category: "Converter",
    icon: "Palette",
    href: "/tools/color-converter",
    isDev: false,
  },
  {
    id: "csv-to-json",
    title: "CSV to JSON",
    description: "Upload a CSV file and convert it to structured JSON data.",
    category: "Converter",
    icon: "Table",
    badge: "New",
    href: "/tools/csv-to-json",
    isDev: false,
  },

  // ── Security ──────────────────────────────────────────────
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Generate strong, cryptographically secure random passwords.",
    category: "Security",
    icon: "KeyRound",
    badge: "Popular",
    href: "/tools/password-generator",
    isDev: false,
  },
  {
    id: "hash-generator",
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, or SHA-512 hashes from text.",
    category: "Security",
    icon: "ShieldCheck",
    href: "/tools/hash-generator",
    isDev: false,
  },
];

/** Localize tool details based on selected locale */
export function getLocalizedTool(tool: Tool, locale: string): Tool {
  const map: Record<string, Record<string, { title: string; description: string; category?: ToolCategory }>> = {
    "pdf-merger": {
      ko: { title: "PDF 병합", description: "여러 PDF 파일을 하나의 문서로 즉시 결합합니다." },
      ja: { title: "PDF 結合", description: "複数のPDFファイルを1つのドキュメントに即座に結合します。" },
      es: { title: "PDF Unir", description: "Combina múltiples archivos PDF en un solo documento al instante." },
      zh: { title: "PDF 合并", description: "轻松将多个 PDF 文件合并为一个文档。" },
      fr: { title: "Fusion PDF", description: "Fusionnez plusieurs fichiers PDF en un seul document instantanément." },
    },
    "pdf-split": {
      ko: { title: "PDF 분할", description: "원하는 페이지 범위를 추출하거나 분리합니다." },
      ja: { title: "PDF 分割", description: "特定のページを抽出するかPDFを別々のファイルに分割します。" },
      es: { title: "PDF Dividir", description: "Extrae páginas específicas o divide un PDF en archivos separados." },
      zh: { title: "PDF 拆分", description: "按指定页码提取或拆分 PDF 文件。" },
      fr: { title: "Division PDF", description: "Extrayez des pages spécifiques ou divisez un PDF en fichiers distincts." },
    },
    "pdf-compress": {
      ko: { title: "PDF 압축", description: "화질 손상 없이 PDF 파일 용량을 최적화합니다." },
      ja: { title: "PDF 圧縮", description: "画質を損なわずにPDFファイルサイズを削減します。" },
      es: { title: "Compresión PDF", description: "Reduce el tamaño del PDF sin perder calidad visual." },
      zh: { title: "PDF 压缩", description: "无损画质缩小 PDF 文件体积。" },
      fr: { title: "Compression PDF", description: "Réduisez la taille du fichier PDF sans sacrifier la qualité." },
    },
    "image-resizer": {
      ko: { title: "이미지 리사이즈", description: "비율 유지 및 원하는 크기로 이미지 해상도를 조절합니다." },
      ja: { title: "画像リサイズ", description: "縦横比を保持したまま画像を自由なサイズに調整します。" },
      es: { title: "Redimensionar Imagen", description: "Cambia el tamaño de imágenes manteniendo la relación de aspecto." },
      zh: { title: "图像尺寸调整", description: "保持长宽比按像素缩放图像尺寸。" },
      fr: { title: "Redimensionner Image", description: "Redimensionnez les images à la taille souhaitée." },
    },
    "image-converter": {
      ko: { title: "이미지 포맷 변환", description: "JPG, PNG, WebP, AVIF, GIF 형식 간 자유롭게 변환합니다." },
      ja: { title: "画像フォーマット変換", description: "JPG、PNG、WebP、AVIF、GIF形式間で相互に変換します。" },
      es: { title: "Convertidor de Imagen", description: "Convierte entre formatos JPG, PNG, WebP, AVIF y GIF." },
      zh: { title: "图像格式转换", description: "在 JPG、PNG、WebP、AVIF、GIF 格式间自由转换。" },
      fr: { title: "Convertisseur d'Image", description: "Convertissez entre les formats JPG, PNG, WebP, AVIF et GIF." },
    },
    "image-compress": {
      ko: { title: "이미지 압축", description: "웹 로딩 속도 향상을 위해 이미지 파일 용량을 줄입니다." },
      ja: { title: "画像圧縮", description: "Web表示の高速化のため画像サイズを軽量化します。" },
      es: { title: "Compresión de Imagen", description: "Reduce el tamaño de archivos de imagen para una carga web rápida." },
      zh: { title: "图像压缩", description: "无损压缩图片体积，提升网页加载速度。" },
      fr: { title: "Compression d'Image", description: "Réduisez la taille des images pour un chargement web plus rapide." },
    },
    "background-remover": {
      ko: { title: "배경 제거 (누끼 따기)", description: "브라우저 내 마스킹으로 이미지 배경을 즉시 투명화합니다." },
      ja: { title: "背景削除 (透過処理)", description: "ブラウザ内マスキングにより画像の背景を瞬時に透過処理します。" },
      es: { title: "Eliminador de Fondo", description: "Elimina el fondo de las imágenes de forma transparente en el navegador." },
      zh: { title: "智能扣图 (背景消除)", description: "浏览器本地抠图，一键将图片背景处理为透明。" },
      fr: { title: "Suppression d'Arrière-Plan", description: "Supprimez l'arrière-plan des images instantanément dans votre navigateur." },
    },
    "image-watermark": {
      ko: { title: "이미지 워터마크 추가기", description: "이미지에 텍스트 및 로고 워터마크를 투명도, 회전, 격자 패턴으로 추가합니다." },
      ja: { title: "画像ウォーターマーク追加", description: "画像にテキストやロゴの透かし（ウォーターマーク）を追加します。" },
      es: { title: "Añadir Marca de Agua", description: "Añade marcas de agua de texto o logo a tus imágenes con control total." },
      zh: { title: "图片水印添加器", description: "给图片添加自定义文本或 Logo 水印，支持透明度、旋转与平铺。" },
      fr: { title: "Filigrane d'Image", description: "Ajoutez des filigranes de texte ou de logo à vos images en toute confidentialité." },
    },
    "word-count": {
      ko: { title: "글자 수 & 단어 세기", description: "단어, 글자 수, 문장 수, 예상 읽기 시간을 실시간 분석합니다." },
      ja: { title: "文字数＆単語数カウント", description: "単語数、文字数、文章数、読了時間をリアルタイム計測します。" },
      es: { title: "Contador de Palabras", description: "Cuenta palabras, caracteres, oraciones y tiempo de lectura en tiempo real." },
      zh: { title: "字数与文本分析", description: "实时统计单词、字符、句子数及预估阅读时长。" },
      fr: { title: "Compteur de Mots", description: "Comptez les mots, caractères, phrases et temps de lecture en temps réel." },
    },
    "text-case": {
      ko: { title: "대소문자 / 표기법 변환", description: "대문자, 소문자, Title, camelCase, snake_case 변환." },
      ja: { title: "大文字・小文字変換", description: "大文字、小文字、Title Case、camelCase、snake_case相互変換。" },
      es: { title: "Convertidor de Mayúsculas", description: "Cambia entre MAYÚSCULAS, minúsculas, Title Case, camelCase." },
      zh: { title: "大小写与命名转换", description: "在大写、小写、驼峰(camelCase)、蛇形(snake_case)间转换。" },
      fr: { title: "Convertisseur de Casse", description: "Basculez entre MAJUSCULES, minuscules, Title, camelCase." },
    },
    "markdown-preview": {
      ko: { title: "마크다운 실시간 미리보기", description: "마크다운 문서를 작성하면서 실시간 렌더링 HTML 확인." },
      ja: { title: "マークダウンリアルタイムプレビュー", description: "マークダウンを書きながらレンダリング結果をリアルタイム表示。" },
      es: { title: "Vista Previa Markdown", description: "Escribe en Markdown y ve una vista previa HTML en tiempo real." },
      zh: { title: "Markdown 实时预览", description: "编写 Markdown 时同步实时渲染 HTML 视图。" },
      fr: { title: "Aperçu Markdown en Direct", description: "Rédigez en Markdown et visualisez le rendu HTML en direct." },
    },
    "text-diff": {
      ko: { title: "텍스트 비교 (Diff)", description: "두 텍스트를 비교하여 차이점을 줄 단위로 강조 표시합니다." },
      ja: { title: "テキスト比較 (Diff)", description: "2つのテキストを比較し変更点をハイライト表示します。" },
      es: { title: "Comparador de Texto (Diff)", description: "Compara dos bloques de texto y resalta las diferencias." },
      zh: { title: "文本差异对比 (Diff)", description: "对比两段文本并逐行高亮显示差异处。" },
      fr: { title: "Comparateur de Texte (Diff)", description: "Comparez deux blocs de texte et mettez en évidence les différences." },
    },
    "json-formatter": {
      ko: { title: "JSON 포맷터 & 검증기", description: "JSON 구문 강조, 정렬(Prettify), 압축(Minify) 및 검증." },
      ja: { title: "JSON フォーマッター", description: "JSONの整形、整形解除、バリデーションと構文強調表示。" },
      es: { title: "Formateador JSON", description: "Formatea, minifica y valida datos JSON con resaltado de sintaxis." },
      zh: { title: "JSON 格式化与美化", description: "JSON 代码美化、压缩、语法校验与高亮显示。" },
      fr: { title: "Formateur JSON", description: "Embellissez, minifiez et validez le JSON avec coloration syntaxique." },
    },
    "base64": {
      ko: { title: "Base64 인코더 / 디코더", description: "텍스트나 파일을 Base64 문자열로 인코딩 및 디코딩." },
      ja: { title: "Base64 エンコード / デコード", description: "文字列やファイルをBase64形式に相互変換します。" },
      es: { title: "Codificador Base64", description: "Codifica texto o archivos a Base64 y decodifícalos de nuevo." },
      zh: { title: "Base64 编码 / 解码", description: "实现字符串与文件的 Base64 编码及解码操作。" },
      fr: { title: "Encodage / Décodage Base64", description: "Encodez des chaînes ou fichiers en Base64 et décodez-les." },
    },
    "url-encoder": {
      ko: { title: "URL 인코더 / 디코더", description: "URL 쿼리 파라미터 및 특수문자 인코딩/디코딩." },
      ja: { title: "URL エンコード / デコード", description: "URL文字列やクエリパラメータをエンコード/デコードします。" },
      es: { title: "Codificador de URL", description: "Codifica o decodifica cadenas de URL y parámetros de consulta." },
      zh: { title: "URL 编码 / 解码", description: "对 URL 网址字符串与查询参数进行转义处理。" },
      fr: { title: "Encodage URL", description: "Encodez ou décodez des chaînes d'URL et paramètres." },
    },
    "regex-tester": {
      ko: { title: "정규표현식 테스터", description: "정규표현식 패턴 및 매칭 결과를 실시간으로 디버깅." },
      ja: { title: "正規表現テスター", description: "正規表現パターンとマッチング結果をリアルタイム検証。" },
      es: { title: "Probador de Regex", description: "Prueba y depura expresiones regulares con resaltado en vivo." },
      zh: { title: "正则表达式测试器", description: "实时匹配与高亮调试 Regular Expression 表达式。" },
      fr: { title: "Testeur de Regex", description: "Testez et débuggez des expressions régulières en direct." },
    },
    "jwt-decoder": {
      ko: { title: "JWT 디코더 & 분석기", description: "JSON Web Token(JWT) 실시간 디코딩 및 만료 시간 분석." },
      ja: { title: "JWT デコーダー＆解析", description: "JSON Web Token (JWT) をリアルタイムでデコード・解析。" },
      es: { title: "Decodificador JWT", description: "Decodifica e inspecciona JSON Web Tokens en tiempo real." },
      zh: { title: "JWT 解析与解码", description: "实时解码 JSON Web Token 并查看 Claims 载荷。" },
      fr: { title: "Décodeur JWT", description: "Décodez et inspectez des jetons JSON Web Tokens en direct." },
    },
    "qr-generator": {
      ko: { title: "QR 코드 생성기", description: "URL, 텍스트, Wi-Fi 고해상도 QR 생성 및 PNG/SVG 저장." },
      ja: { title: "QR コード作成", description: "URL、テキスト、Wi-Fi情報からQRコードを生成しPNG/SVG保存。" },
      es: { title: "Generador de QR", description: "Genera códigos QR personalizados para URL, texto y Wi-Fi." },
      zh: { title: "QR 二维码生成器", description: "生成网址、文本与 Wi-Fi 二维码，支持 PNG/SVG 导出。" },
      fr: { title: "Générateur de Code QR", description: "Générez des codes QR personnalisés pour URL, texte et Wi-Fi." },
    },
    "cron-parser": {
      ko: { title: "Cron 표현식 파서 & 생성기", description: "Cron 표현식을 자연어로 번역하고 다음 실행 시각 계산." },
      ja: { title: "Cron 表現式解析＆生成", description: "Cron表現式を自然言語に翻訳し次回実行日時を計算します。" },
      es: { title: "Analizador de Cron", description: "Traduce expresiones cron a lenguaje natural y calcula ejecuciones." },
      zh: { title: "Cron 表达式解析器", description: "将 Cron 定时表达式转换为人类可读语言并计算执行时刻。" },
      fr: { title: "Analyseur Cron", description: "Traduisez des expressions cron en langage clair et calculez les exécutions." },
    },
    "unit-converter": {
      ko: { title: "단위 변환기", description: "길이, 무게, 온도, 넓이, 부피, 속도 등 다양한 단위 변환." },
      ja: { title: "単位変換ツール", description: "長さ、重さ、温度、面積、体積などを即座に相互変換します。" },
      es: { title: "Convertidor de Unidades", description: "Convierte longitud, peso, temperatura, área y más al instante." },
      zh: { title: "多功能单位转换", description: "长度、重量、温度、面积、体积等多维度单位换算。" },
      fr: { title: "Convertisseur d'Unités", description: "Convertissez longueur, poids, température, surface et plus." },
    },
    "color-converter": {
      ko: { title: "색상 변환기 & 피커", description: "HEX, RGB, HSL, HSV, CMYK 색상 코드 상호 변환." },
      ja: { title: "カラー変換＆ピッカー", description: "HEX、RGB、HSL、HSV、CMYKコードを即座に相互変換。" },
      es: { title: "Convertidor de Color", description: "Convierte entre formatos de color HEX, RGB, HSL, HSV y CMYK." },
      zh: { title: "颜色格式转换与拾色器", description: "HEX、RGB、HSL、HSV、CMYK 颜色代码相互转换。" },
      fr: { title: "Convertisseur de Couleur", description: "Convertissez entre les formats HEX, RGB, HSL, HSV et CMYK." },
    },
    "csv-to-json": {
      ko: { title: "CSV JSON 변환기", description: "CSV 파일을 업로드하여 구조화된 JSON 데이터로 변환." },
      ja: { title: "CSV ➔ JSON 変換", description: "CSVファイルをアップロードし構造化JSONデータに変換します。" },
      es: { title: "CSV a JSON", description: "Sube un archivo CSV y conviértelo a datos JSON estructurados." },
      zh: { title: "CSV 转 JSON 数据", description: "将上传的 CSV 表格文件解析转换为 JSON 结构化数据。" },
      fr: { title: "CSV vers JSON", description: "Téléchargez un fichier CSV et convertissez-le en données JSON." },
    },
    "password-generator": {
      ko: { title: "비밀번호 생성기", description: "보안학적으로 강력한 무작위 비밀번호를 생성합니다." },
      ja: { title: "パスワード自動生成", description: "暗号学的に安全なランダムパスワード를 생성합니다." },
      es: { title: "Generador de Contraseñas", description: "Genera contraseñas aleatorias criptográficamente seguras." },
      zh: { title: "随机密码生成器", description: "生成具备密码学强度的随机高难度安全密码。" },
      fr: { title: "Générateur de Mots de Passe", description: "Générez des mots de passe aléatoires sécurisés." },
    },
    "hash-generator": {
      ko: { title: "해시 생성기 (MD5 / SHA-256)", description: "텍스트나 파일에서 MD5, SHA-1, SHA-256, SHA-512 해시 생성." },
      ja: { title: "ハッシュ生成 (MD5/SHA-256)", description: "文字列やファイルからMD5、SHA-256などのハッシュを生成。" },
      es: { title: "Generador de Hash", description: "Genera hashes criptográficos MD5, SHA-1, SHA-256 o SHA-512." },
      zh: { title: "哈希值计算 (Hash)", description: "计算文本与文件的 MD5、SHA-1、SHA-256 及 SHA-512 校验和。" },
      fr: { title: "Générateur de Hachage", description: "Générez des hachages cryptographiques MD5, SHA-1, SHA-256." },
    },
  };

  const info = map[tool.id]?.[locale];
  if (info) {
    return {
      ...tool,
      title: info.title,
      description: info.description,
      category: info.category || tool.category,
    };
  }
  return tool;
}

/** Localize category labels */
export function getLocalizedCategory(cat: string, locale: string): string {
  const map: Record<string, Record<string, string>> = {
    All: { ko: "전체 도구", ja: "すべてのツール", es: "Todas las herramientas", zh: "所有工具", fr: "Tous les outils" },
    "PDF Tools": { ko: "PDF 도구", ja: "PDF ツール", es: "Herramientas PDF", zh: "PDF 工具", fr: "Outils PDF" },
    "Image Tools": { ko: "이미지 도구", ja: "画像ツール", es: "Herramientas Imagen", zh: "图像工具", fr: "Outils Image" },
    "Text & Formatting": { ko: "텍스트 & 서식", ja: "テキスト＆書式", es: "Texto y Formato", zh: "文本与格式", fr: "Texte & Formatage" },
    "Dev Tools": { ko: "개발자 도구", ja: "開発者ツール", es: "Herramientas Dev", zh: "开发者工具", fr: "Outils Dev" },
    Converter: { ko: "변환기", ja: "コンバーター", es: "Convertidor", zh: "转换工具", fr: "Convertisseur" },
    Security: { ko: "보안 도구", ja: "セキュリティ", es: "Seguridad", zh: "安全工具", fr: "Sécurité" },
  };
  return map[cat]?.[locale] || cat;
}

/** Filter tools by search query (searches title + description) */
export function searchTools(query: string): Tool[] {
  if (!query.trim()) return TOOLS;
  const q = query.toLowerCase();
  return TOOLS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  );
}

/** Group tools by category, preserving CATEGORIES order */
export function groupToolsByCategory(
  tools: Tool[]
): Array<{ category: ToolCategory; tools: Tool[] }> {
  return CATEGORIES.map((cat) => ({
    category: cat,
    tools: tools.filter((t) => t.category === cat),
  })).filter((g) => g.tools.length > 0);
}
