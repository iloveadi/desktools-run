import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF 용량 줄이기 — PDF 파일 압축 무료 | desktools.run",
  description:
    "PDF 파일 크기를 브라우저에서 즉시 압축하세요. 서버 업로드 없이 100% 로컬 처리로 개인정보 보호. 설치 불필요, 완전 무료.",
  keywords: ["PDF 압축", "PDF 용량 줄이기", "PDF compress", "PDF 크기 줄이기", "PDF 파일 압축", "무료 PDF 도구"],
  openGraph: {
    url: "https://desktools.run/tools/pdf-compress/",
    title: "PDF 용량 줄이기 — PDF 파일 압축 무료 | desktools.run",
    description: "PDF 파일 크기를 브라우저에서 즉시 압축하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/pdf-compress/",
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
        title="PDF Compress"
        description="Reduce PDF file size without sacrificing document visual quality."
        toolUrl="https://desktools.run/tools/pdf-compress/"
      />
      {children}
    </>
  );
}
