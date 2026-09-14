import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 크기 조절 & 리사이즈 — JPG·PNG·WebP 무료 고화질 해상도 변환기 | desktools.run",
  description:
    "화질 저하 없이 이미지 가로/세로 픽셀(px) 및 비율(%)을 브라우저에서 즉시 조절하세요. JPG, PNG, WebP 상호 변환 및 용량 최적화 지원. 서버 업로드 없는 100% 안전한 로컬 처리.",
  keywords: [
    "이미지 리사이즈",
    "image resizer",
    "사진 크기 조절",
    "이미지 픽셀 변환",
    "사진 용량 줄이기",
    "웹 이미지 최적화",
    "WebP 변환",
    "PNG 리사이즈",
    "증명사진 크기 조절",
    "무료 이미지 편집",
  ],
  openGraph: {
    url: "https://desktools.run/tools/image-resizer/",
    title: "이미지 크기 조절 & 리사이즈 — JPG·PNG·WebP 무료 고화질 해상도 변환기 | desktools.run",
    description: "화질 저하 없이 이미지 가로/세로 픽셀(px) 및 비율(%)을 브라우저에서 즉시 조절하세요.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-global.jpg",
        width: 1376,
        height: 768,
        alt: "desktools.run — Fast & Free Web Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-global.jpg"],
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
