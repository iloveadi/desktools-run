import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Word Converter — Convert PDF to Editable .docx Online Free | desktools.run",
  description:
    "Convert PDF documents to editable Microsoft Word (.docx) files instantly in your browser. 100% free, no registration, no file size limits, zero server uploads.",
  keywords: [
    "pdf to word",
    "pdf to docx",
    "pdf converter",
    "convert pdf to word online free",
    "pdf to word converter free",
    "pdf word 변환",
    "pdf docx 변환",
    "pdf 워드 변환기",
    "desktools",
  ],
  openGraph: {
    title: "PDF to Word Converter — Convert PDF to Editable .docx Free",
    description: "Convert PDF documents to editable Microsoft Word (.docx) format 100% locally in your browser.",
    type: "website",
    url: "https://desktools.run/tools/pdf-to-word/",
  },
};

export default function PdfToWordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
