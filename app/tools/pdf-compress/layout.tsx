import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Compressor — Reduce PDF File Size Online Free | desktools.run",
  description: "Compress and shrink heavy PDF documents directly in your browser. Save storage and bandwidth without compromising document visual readability.",
  keywords: [
    "pdf compress",
    "compress pdf online",
    "reduce pdf size",
    "shrink pdf",
    "free pdf compressor",
    "lossless pdf optimizer",
  ],
  openGraph: {
    url: "https://desktools.run/tools/pdf-compress/",
    title: "PDF Compressor | desktools.run",
    description: "Compress and shrink heavy PDF documents directly in your browser. Save storage and bandwidth without compromising document visual readability.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/pdf-compress/",
  },
  robots: { index: true, follow: true },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolJsonLd
        title="PDF Compress"
        description="Reduce PDF file size without sacrificing document visual quality."
        toolUrl="https://desktools.run/tools/pdf-compress/"
      />
      {children}
    </>
  );
}
