import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Format Converter — Convert PNG, JPG, WebP, BMP, ICO | desktools.run",
  description: "Batch convert images between PNG, JPG, WebP, BMP, GIF, and ICO formats instantly in your browser. 100% free, private, and unlimited.",
  keywords: [
    "image converter",
    "png to jpg",
    "webp to png",
    "jpg to webp",
    "image format converter",
    "online photo converter free",
  ],
  openGraph: {
    url: "https://desktools.run/tools/image-converter/",
    title: "Image Format Converter | desktools.run",
    description: "Batch convert images between PNG, JPG, WebP, BMP, GIF, and ICO formats instantly in your browser. 100% free, private, and unlimited.",
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
    canonical: "https://desktools.run/tools/image-converter/",
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
        title="Image Converter"
        description="Convert between JPG, PNG, WebP, AVIF, and GIF formats."
        toolUrl="https://desktools.run/tools/image-converter/"
      />
      {children}
    </>
  );
}
