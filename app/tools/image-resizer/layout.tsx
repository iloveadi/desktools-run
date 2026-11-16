import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Resizer — Resize PNG, JPG, WebP by Pixels & Percent | desktools.run",
  description: "Resize images by custom width, height, or percentage while locking aspect ratios. High-resolution canvas resampling without server uploads.",
  keywords: [
    "image resizer",
    "resize photo online",
    "resize png",
    "resize jpg",
    "change photo dimensions",
    "free image resizer",
  ],
  openGraph: {
    url: "https://desktools.run/tools/image-resizer/",
    title: "Image Resizer | desktools.run",
    description: "Resize images by custom width, height, or percentage while locking aspect ratios. High-resolution canvas resampling without server uploads.",
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
    canonical: "https://desktools.run/tools/image-resizer/",
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
        title="Image Resizer"
        description="Resize images to exact dimensions or scaling percentage."
        toolUrl="https://desktools.run/tools/image-resizer/"
      />
      {children}
    </>
  );
}
