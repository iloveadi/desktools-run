import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Watermark Adder | Free Online Photo Copyright Protection - desktools.run",
  description:
    "Add custom text or logo watermarks to images with full opacity, rotation angle, font styling, and tiled pattern controls. 100% private client-side browser processing with zero server uploads.",
  keywords: [
    "image watermark",
    "photo watermark online",
    "add logo to picture",
    "watermark generator",
    "bulk watermark photo",
    "copyright watermark",
    "이미지 워터마크 추가",
    "사진 워터마크 합성",
    "이미지 로고 삽입",
    "desktools",
  ],
  alternates: {
    canonical: "https://desktools.run/tools/image-watermark/",
  },
  openGraph: {
    url: "https://desktools.run/tools/image-watermark/",
    title: "Image Watermark Adder | desktools.run",
    description: "Add custom text or logo watermarks to images with full opacity, rotation, and pattern controls.",
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
        title="Image Watermark Adder"
        description="Add custom text or logo watermarks to images with full opacity, rotation, and pattern controls."
        toolUrl="https://desktools.run/tools/image-watermark/"
      />
      {children}
    </>
  );
}
