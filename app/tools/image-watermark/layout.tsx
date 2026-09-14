import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 워터마크 추가기 — 텍스트·로고 투명도 & 격자 패턴 무료 합성 | desktools.run",
  description:
    "사진 위에 텍스트 서명이나 브랜드 로고 워터마크를 투명도, 회전 각도, 격자 패턴(타일 반복)과 함께 실시간으로 합성하세요. 사진 도용 방지 및 저작권 보호. 서버 업로드 없는 100% 로컬 처리.",
  keywords: [
    "이미지 워터마크",
    "image watermark",
    "사진 워터마크 추가",
    "사진 로고 삽입",
    "워터마크 만들기",
    "사진 도용 방지",
    "무료 워터마크",
    "watermark generator",
    "photo watermark online",
    "add logo to picture",
    "tile watermark"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/image-watermark/",
  },
  openGraph: {
    url: "https://desktools.run/tools/image-watermark/",
    title: "이미지 워터마크 추가기 — 텍스트·로고 투명도 & 격자 패턴 무료 합성 | desktools.run",
    description: "사진 위에 텍스트 서명이나 브랜드 로고 워터마크를 투명도, 회전 각도, 격자 패턴과 함께 합성하세요.",
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
        title="Image Watermark Adder"
        description="Add custom text or logo watermarks to images with full opacity, rotation, and tile pattern controls."
        toolUrl="https://desktools.run/tools/image-watermark/"
      />
      {children}
    </>
  );
}
