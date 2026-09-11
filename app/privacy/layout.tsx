import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy (개인정보처리방침) | desktools.run",
  description:
    "desktools.run의 개인정보처리방침입니다. 모든 도구는 서버 업로드 없이 브라우저 내에서 100% 안전하고 비공개로 처리되어 파일이 외부로 유출되지 않습니다.",
  alternates: {
    canonical: "https://desktools.run/privacy/",
  },
  openGraph: {
    title: "Privacy Policy (개인정보처리방침) | desktools.run",
    description: "서버 업로드 없는 100% 브라우저 로컬 개인정보 보호 원칙.",
    url: "https://desktools.run/privacy/",
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

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
