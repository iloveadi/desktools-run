import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF 비밀번호 설정 / 암호화 — 무료 PDF 잠금 | desktools.run",
  description:
    "중요한 PDF 문서에 비밀번호를 설정하여 안전하게 암호화하고 잠그세요. 서버 전송 없이 100% 브라우저 로컬 암호화로 완벽한 개인정보 보호.",
  keywords: [
    "PDF 비밀번호 설정",
    "PDF 암호화",
    "PDF 잠금",
    "PDF protect",
    "PDF password",
    "PDF 보안",
    "PDF 암호 걸기",
    "무료 PDF 암호화",
  ],
  openGraph: {
    url: "https://desktools.run/tools/pdf-protect/",
    title: "PDF 비밀번호 설정 / 암호화 — 무료 PDF 잠금 | desktools.run",
    description: "중요한 PDF 문서에 비밀번호를 설정하여 브라우저에서 100% 무료로 즉시 암호화하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/pdf-protect/",
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
        title="PDF Protect & Encrypt"
        description="Protect sensitive PDF documents with secure password encryption."
        toolUrl="https://desktools.run/tools/pdf-protect/"
      />
      {children}
    </>
  );
}
