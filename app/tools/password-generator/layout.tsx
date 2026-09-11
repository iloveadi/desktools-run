import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "비밀번호 생성기 — 강력한 랜덤 비밀번호 무료 생성 | desktools.run",
  description:
    "대소문자, 숫자, 특수문자를 포함한 강력한 랜덤 비밀번호를 브라우저에서 즉시 생성하세요. 암호 강도 측정기 탑재, 100% 로컬 생성으로 안전합니다.",
  keywords: ["비밀번호 생성기", "password generator", "랜덤 비밀번호", "강력한 비밀번호", "password maker", "무료 비밀번호"],
  openGraph: {
    url: "https://desktools.run/tools/password-generator/",
    title: "비밀번호 생성기 — 강력한 랜덤 비밀번호 무료 생성 | desktools.run",
    description: "강력한 랜덤 비밀번호를 브라우저에서 즉시 생성하세요.",
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
    canonical: "https://desktools.run/tools/password-generator/",
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
        title="Password Generator"
        description="Generate strong, cryptographically secure random passwords."
        toolUrl="https://desktools.run/tools/password-generator/"
      />
      {children}
    </>
  );
}
