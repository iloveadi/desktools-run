import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Merger — Combine Multiple PDF Files Online Free | desktools.run",
  description: "Combine multiple PDF documents into a single organized file in seconds. Drag-and-drop page ordering, 100% private local processing with zero uploads.",
  keywords: [
    "pdf merger",
    "combine pdf",
    "merge pdf files",
    "join pdf documents",
    "free pdf merger online",
    "client-side pdf tools",
  ],
  openGraph: {
    url: "https://desktools.run/tools/pdf-merger/",
    title: "PDF Merger | desktools.run",
    description: "Combine multiple PDF documents into a single organized file in seconds. Drag-and-drop page ordering, 100% private local processing with zero uploads.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/pdf-merger/",
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
        title="PDF Merge"
        description="Combine multiple PDF files into a single document instantly."
        toolUrl="https://desktools.run/tools/pdf-merger/"
      />
      {children}
    </>
  );
}
