import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy (쿠키 정책) — Privacy-First Web Tools | desktools.run",
  description:
    "desktools.run의 쿠키 및 로컬 스토리지 사용 정책입니다. 사용자 개인정보를 추적하지 않는 안전한 100% 브라우저 기반 로컬 저장소 원칙을 안내합니다.",
  alternates: {
    canonical: "https://desktools.run/cookies/",
  },
  openGraph: {
    title: "Cookie Policy (쿠키 정책) | desktools.run",
    description: "개인정보 보호 중심 쿠키 및 로컬 스토리지 안내.",
    url: "https://desktools.run/cookies/",
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

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
