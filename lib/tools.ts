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
    isDev: true,
  },
  {
    id: "pdf-compress",
    title: "PDF Compress",
    description: "Reduce PDF file size without sacrificing visible quality.",
    category: "PDF Tools",
    icon: "PackageMinus",
    badge: "Popular",
    href: "/tools/pdf-compress",
    isDev: false,
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert PDF documents to editable .docx format in seconds.",
    category: "PDF Tools",
    icon: "FileText",
    href: "/tools/pdf-to-word",
    isDev: false,
  },

  // ── Image Tools ───────────────────────────────────────────
  {
    id: "image-resizer",
    title: "Image Resizer",
    description: "Resize images to any dimension while preserving aspect ratio.",
    category: "Image Tools",
    icon: "ScanLine",
    badge: "Popular",
    href: "/tools/image-resizer",
    isDev: false,
  },
  {
    id: "image-converter",
    title: "Image Converter",
    description: "Convert between JPG, PNG, WebP, AVIF, GIF, and more formats.",
    category: "Image Tools",
    icon: "RefreshCw",
    badge: "Popular",
    href: "/tools/image-converter",
    isDev: false,
  },
  {
    id: "image-compress",
    title: "Image Compress",
    description: "Shrink image file sizes for faster web loading.",
    category: "Image Tools",
    icon: "ZoomOut",
    badge: "Popular",
    href: "/tools/image-compress",
    isDev: false,
  },
  {
    id: "background-remover",
    title: "Background Remover",
    description: "Automatically remove image backgrounds with AI precision.",
    category: "Image Tools",
    icon: "Eraser",
    badge: "New",
    href: "/tools/background-remover",
    isDev: false,
  },

  // ── Text & Formatting ─────────────────────────────────────
  {
    id: "word-count",
    title: "Word Count",
    description: "Count words, characters, sentences, and reading time.",
    category: "Text & Formatting",
    icon: "Type",
    badge: "Popular",
    href: "/tools/word-count",
    isDev: false,
  },
  {
    id: "text-case",
    title: "Text Case Converter",
    description: "Switch between UPPER, lower, Title, camelCase, and more.",
    category: "Text & Formatting",
    icon: "CaseSensitive",
    href: "/tools/text-case",
    isDev: true,
  },
  {
    id: "markdown-preview",
    title: "Markdown Preview",
    description: "Write Markdown and see a live HTML preview side-by-side.",
    category: "Text & Formatting",
    icon: "Code2",
    href: "/tools/markdown-preview",
    isDev: true,
  },
  {
    id: "text-diff",
    title: "Text Diff",
    description: "Compare two text blocks and highlight the differences.",
    category: "Text & Formatting",
    icon: "GitCompare",
    href: "/tools/text-diff",
    isDev: true,
  },

  // ── Dev Tools ─────────────────────────────────────────────
  {
    id: "json-formatter",
    title: "JSON Formatter",
    description: "Prettify, minify, and validate JSON with syntax highlighting.",
    category: "Dev Tools",
    icon: "Braces",
    badge: "Popular",
    href: "/tools/json-formatter",
    isDev: true,
  },
  {
    id: "base64",
    title: "Base64 Encode / Decode",
    description: "Encode strings or files to Base64 and decode them back.",
    category: "Dev Tools",
    icon: "Binary",
    href: "/tools/base64",
    isDev: true,
  },
  {
    id: "url-encoder",
    title: "URL Encode / Decode",
    description: "Encode or decode URL strings and query parameters.",
    category: "Dev Tools",
    icon: "Link",
    href: "/tools/url-encoder",
    isDev: true,
  },
  {
    id: "regex-tester",
    title: "Regex Tester",
    description: "Test and debug regular expressions with live match highlighting.",
    category: "Dev Tools",
    icon: "Search",
    badge: "New",
    href: "/tools/regex-tester",
    isDev: true,
  },

  // ── Converter ─────────────────────────────────────────────
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert length, weight, temperature, area, and more instantly.",
    category: "Converter",
    icon: "ArrowLeftRight",
    href: "/tools/unit-converter",
    isDev: false,
  },
  {
    id: "color-converter",
    title: "Color Converter",
    description: "Convert between HEX, RGB, HSL, HSV, and CSS color formats.",
    category: "Converter",
    icon: "Palette",
    badge: "Popular",
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
