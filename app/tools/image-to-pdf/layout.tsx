import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to PDF Converter — Convert JPG, PNG to PDF Online Free | desktools.run",
  description: "Combine and convert multiple JPG, PNG, and WebP pictures into a clean, unified PDF document in seconds. 100% client-side privacy.",
  keywords: [
    "image to pdf",
    "convert jpg to pdf",
    "png to pdf",
    "photo to pdf",
    "combine pictures into pdf",
    "free online pdf tool",
  ],
  alternates: {
    canonical: "https://desktools.run/tools/image-to-pdf/",
  },
  openGraph: {
    title: "Image to PDF Converter | desktools.run",
    description: "Combine and convert multiple JPG, PNG, and WebP pictures into a clean, unified PDF document in seconds. 100% client-side privacy.",
    url: "https://desktools.run/tools/image-to-pdf/",
    type: "website",
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
        title="Image to PDF Converter"
        description="Combine and convert multiple JPG, PNG, and WebP images into a single clean PDF document."
        toolUrl="https://desktools.run/tools/image-to-pdf/"
      />
      {children}
    </>
  );
}
