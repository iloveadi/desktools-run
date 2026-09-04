import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy (개인정보처리방침) — 100% Client-Side Private | desktools.run",
  description:
    "desktools.run의 개인정보처리방침입니다. 모든 도구는 서버 업로드 없이 브라우저 로컬에서만 100% 안전하게 실행됩니다.",
  alternates: {
    canonical: "https://desktools.run/privacy/",
  },
  openGraph: {
    title: "Privacy Policy (개인정보처리방침) | desktools.run",
    description: "서버 업로드 없는 100% 브라우저 로컬 개인정보 보호 원칙.",
    url: "https://desktools.run/privacy/",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
