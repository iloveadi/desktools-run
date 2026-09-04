import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy (쿠키 정책) — Privacy-First Web Tools | desktools.run",
  description:
    "desktools.run의 쿠키 및 로컬 스토리지 사용 정책입니다. 사용자 추적을 최소화하고 투명하게 운영합니다.",
  alternates: {
    canonical: "https://desktools.run/cookies/",
  },
  openGraph: {
    title: "Cookie Policy (쿠키 정책) | desktools.run",
    description: "개인정보 보호 중심 쿠키 및 로컬 스토리지 안내.",
    url: "https://desktools.run/cookies/",
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
