import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 용량 압축기 — PNG·JPG·WEBP 손실없는 무료 고효율 압축 | desktools.run",
  description:
    "PNG, JPG, WEBP 이미지 용량을 브라우저에서 화질 저하 없이 최대 80% 스마트 압축하세요. 다중 파일 일괄 압축, WebP 자동 변환 지원. 서버 업로드 없는 100% 로컬 프라이버시 보장.",
  keywords: [
    "이미지 압축",
    "image compress",
    "사진 용량 줄이기",
    "PNG 압축",
    "JPG 압축",
    "WEBP 압축",
    "이미지 용량 절감",
    "무료 이미지 압축",
    "batch image compressor",
    "reduce image size",
    "compress webp",
    "lossless image compression"
  ],
  openGraph: {
    url: "https://desktools.run/tools/image-compress/",
    title: "이미지 용량 압축기 — PNG·JPG·WEBP 손실없는 무료 고효율 압축 | desktools.run",
    description: "PNG, JPG, WEBP 이미지 용량을 브라우저에서 화질 손실 없이 획기적으로 줄이세요. 100% 브라우저 로컬 처리.",
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
        description="Reduce image file sizes for faster web page loading with client-side WebP and smart compression."
        toolUrl="https://desktools.run/tools/image-compress/"
      />
      {children}
    </>
  );
}
