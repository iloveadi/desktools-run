import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF 비밀번호 설정 / 암호화 — 무료 PDF 잠금 | desktools.run",
  description:
    "중요한 PDF 문서에 비밀번호를 설정하여 안전하게 암호화하세요. 최고 수준 보안 알고리즘 적용, 서버 업로드 없이 브라우저 내 100% 로컬 암호화.",
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
