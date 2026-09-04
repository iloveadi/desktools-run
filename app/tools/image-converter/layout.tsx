import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 포맷 변환기 — PNG·JPG·WEBP·BMP·ICO 무료 변환 | desktools.run",
  description:
    "PNG, JPG, WEBP, BMP, ICO 이미지 포맷을 브라우저에서 즉시 상호 변환하세요. 다중 파일 일괄 변환 지원. 서버 업로드 없이 100% 로컬 처리, 완전 무료.",
  keywords: [
    "이미지 변환기", "image converter", "PNG JPG 변환", "WEBP 변환",
    "ICO 변환", "이미지 포맷 변경", "무료 이미지 변환", "이미지 일괄 변환"
  ],
  openGraph: {
    url: "https://desktools.run/tools/image-converter/",
    title: "이미지 포맷 변환기 — PNG·JPG·WEBP·BMP·ICO 무료 변환 | desktools.run",
    description: "PNG, JPG, WEBP, BMP, ICO 이미지 포맷을 브라우저에서 즉시 상호 변환하세요.",
    type: "website",
    siteName: "desktools.run",
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
