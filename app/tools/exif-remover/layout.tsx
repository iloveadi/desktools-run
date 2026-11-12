import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EXIF Metadata Remover & Viewer — Photo Privacy Tool | desktools.run",
  description: "Inspect and wipe GPS location, camera settings, and sensitive metadata from JPG, PNG, and WebP images before sharing online. 100% client-side.",
  keywords: [
    "exif remover",
    "remove photo metadata",
    "view exif online",
    "clean image gps",
    "photo privacy tool",
    "strip exif tags",
  ],
  openGraph: {
    url: "https://desktools.run/tools/exif-remover/",
    title: "EXIF Metadata Remover & Viewer | desktools.run",
    description: "Inspect and wipe GPS location, camera settings, and sensitive metadata from JPG, PNG, and WebP images before sharing online. 100% client-side.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/exif-remover/",
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
        title="Image EXIF Cleaner & Viewer"
        description="Inspect GPS location, camera details, and date metadata from photos and strip all EXIF data in 1 click for 100% privacy."
        toolUrl="https://desktools.run/tools/exif-remover/"
      />
      {children}
    </>
  );
}
