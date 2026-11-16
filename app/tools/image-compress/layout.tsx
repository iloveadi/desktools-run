import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor — Compress PNG, JPG, WebP Losslessly | desktools.run",
  description: "Reduce image file sizes up to 80% without losing visual quality. Batch compress JPG, PNG, and WebP images directly in your browser with zero limits.",
  keywords: [
    "image compressor",
    "compress png",
    "compress jpg",
    "reduce photo size",
    "lossless image compression",
    "online photo compressor",
  ],
  openGraph: {
    url: "https://desktools.run/tools/image-compress/",
    title: "Image Compressor — PNG, JPG, WebP | desktools.run",
    description: "Reduce image file sizes up to 80% without losing visual quality. Batch compress JPG, PNG, and WebP images directly in your browser with zero limits.",
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
    canonical: "https://desktools.run/tools/image-compress/",
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
        title="Image Compress"
        description="Reduce image file sizes for faster web page loading."
        toolUrl="https://desktools.run/tools/image-compress/"
      />
      {children}
    </>
  );
}
