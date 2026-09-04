import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 PDF 변환기 (Image to PDF) - 여러 장의 사진을 1클릭 PDF로 병합 | desktools.run",
  description:
    "JPG, PNG, WebP 등 여러 장의 이미지를 순서대로 1개의 고화질 PDF 문서로 즉시 변환합니다. A4/Letter 용지 설정, 여백 및 방향 조절, 100% 브라우저 로컬 안전 변환.",
  keywords: [
    "이미지 PDF 변환",
    "사진 PDF 합치기",
    "JPG to PDF",
    "PNG to PDF",
    "Image to PDF Converter",
    "사진 문서 변환",
    "무료 PDF 변환기",
    "desktools",
  ],
  alternates: {
    canonical: "https://desktools.run/tools/image-to-pdf/",
  },
  openGraph: {
    title: "이미지 PDF 변환기 (Image to PDF Converter) | desktools.run",
    description:
      "여러 장의 사진/이미지를 순서대로 하나의 PDF 문서로 즉시 변환하고 다운로드하세요. 서버 전송 없는 100% 안전한 브라우저 변환.",
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
