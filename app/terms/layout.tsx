import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service (이용약관) — Free Web Utilities | desktools.run",
  description:
    "desktools.run의 이용약관입니다. 회원가입 없이 무료로 제공되는 안전한 웹 브라우저 유틸리티 서비스의 이용 조건 및 권리 사항을 안내합니다.",
  alternates: {
    canonical: "https://desktools.run/terms/",
  },
  openGraph: {
    title: "Terms of Service (이용약관) | desktools.run",
    description: "무료 웹 유틸리티 도구 desktools.run 이용약관 안내.",
    url: "https://desktools.run/terms/",
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
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
