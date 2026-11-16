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
      images: [
      {
        url: "https://desktools.run/og-global.jpg",
        width: 1376,
        height: 768,
        alt: "desktools.run — Fast & Free Web Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://desktools.run/og-global.jpg"],
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
