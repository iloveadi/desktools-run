import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Splitter — Extract Pages & Split PDF Online Free | desktools.run",
  description:
    "Split PDF documents or extract specific pages instantly in your browser. 100% free, no registration, no file size limits, zero server uploads.",
  keywords: [
    "pdf splitter",
    "split pdf",
    "extract pdf pages",
    "split pdf online free",
    "pdf page extractor",
    "pdf 분할",
    "pdf 페이지 추출",
    "pdf 나누기",
    "pdf 페이지 자르기",
    "desktools",
  ],
  openGraph: {
    title: "PDF Splitter — Extract Pages & Split PDF Online Free",
    description: "Split PDF files or extract specific pages 100% locally in your browser memory.",
    type: "website",
    url: "https://desktools.run/tools/pdf-split/",
  },
  alternates: {
    canonical: "https://desktools.run/tools/pdf-split/",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolJsonLd
        title="PDF Split"
        description="Extract specific pages or split a PDF into separate files."
        toolUrl="https://desktools.run/tools/pdf-split/"
      />
      {children}
    </>
  );
}
