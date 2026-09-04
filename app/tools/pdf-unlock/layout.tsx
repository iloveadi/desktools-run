import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF 비밀번호 해제 / 잠금 풀기 — 무료 PDF 암호 제거 | desktools.run",
  description:
    "암호가 걸린 PDF 문서의 비밀번호를 입력하여 영구적으로 잠금을 해제하고 암호 없는 일반 PDF로 저장하세요. 서버 전송 없이 100% 브라우저 로컬 처리.",
  keywords: [
    "PDF 비밀번호 해제",
    "PDF 암호 제거",
    "PDF 잠금 풀기",
    "PDF unlock",
    "PDF decrypt",
    "PDF 비밀번호 풀기",
    "무료 PDF 암호 해제",
  ],
  openGraph: {
    url: "https://desktools.run/tools/pdf-unlock/",
    title: "PDF 비밀번호 해제 / 잠금 풀기 — 무료 PDF 암호 제거 | desktools.run",
    description: "암호가 걸린 PDF 문서의 비밀번호를 입력하여 브라우저에서 100% 무료로 즉시 잠금을 해제하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/pdf-unlock/",
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
        title="PDF Unlock & Decrypt"
        description="Remove password protection and permanently unlock encrypted PDF documents."
        toolUrl="https://desktools.run/tools/pdf-unlock/"
      />
      {children}
    </>
  );
}
