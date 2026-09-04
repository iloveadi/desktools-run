import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT 디코더 — JSON Web Token 실시간 디코드 및 분석 | desktools.run",
  description:
    "JSON Web Token(JWT)을 브라우저에서 즉시 디코딩하고 Header, Payload, Signature 및 만료 시간을 안전하게 분석하세요. 100% 클라이언트 사이드 처리.",
  keywords: ["JWT 디코더", "jwt decoder", "jwt parser", "jwt inspector", "json web token", "토큰 분석기"],
  openGraph: {
    url: "https://desktools.run/tools/jwt-decoder/",
    title: "JWT 디코더 — JSON Web Token 실시간 디코드 및 분석 | desktools.run",
    description: "JWT 토큰을 브라우저에서 안전하고 빠르게 디코딩하고 분석하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/jwt-decoder/",
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
        title="JWT Decoder & Inspector"
        description="Decode JSON Web Tokens and inspect Header & Payload claims."
        toolUrl="https://desktools.run/tools/jwt-decoder/"
      />
      {children}
    </>
  );
}
