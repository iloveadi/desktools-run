import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF 파일 합치기 — 여러 PDF를 하나로 무료 병합 | desktools.run",
  description:
    "여러 PDF 파일을 브라우저에서 즉시 하나로 합치세요. 서버 업로드 없이 100% 로컬 처리. 설치 불필요, 완전 무료.",
  keywords: ["PDF 합치기", "PDF merger", "PDF 병합", "merge PDF", "PDF 결합", "무료 PDF 도구", "온라인 PDF"],
  openGraph: {
    url: "https://desktools.run/tools/pdf-merger/",
    title: "PDF 파일 합치기 — 여러 PDF를 하나로 무료 병합 | desktools.run",
    description: "여러 PDF 파일을 브라우저에서 즉시 하나로 합치세요.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/pdf-merger/",
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
        title="PDF Merge"
        description="Combine multiple PDF files into a single document instantly."
        toolUrl="https://desktools.run/tools/pdf-merger/"
      />
      {children}
    </>
  );
}
