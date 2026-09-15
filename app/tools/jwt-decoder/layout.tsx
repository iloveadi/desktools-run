import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Decoder & Token Inspector Online — Real-Time JSON Web Token Debugger | desktools.run",
  description:
    "Decode, inspect, and debug JSON Web Tokens (JWT) in real-time. Check Header, Payload, Signature, and expiration timestamps locally in your browser. 100% private, zero server uploads.",
  keywords: [
    "jwt decoder",
    "jwt debugger",
    "jwt inspector",
    "decode json web token",
    "jwt parser online",
    "jwt expiration checker",
    "JWT 디코더",
    "JWT 토큰 분석기",
    "JWT デコーダー",
    "decodificador jwt",
    "JWT 解码器"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/jwt-decoder/",
  },
  openGraph: {
    url: "https://desktools.run/tools/jwt-decoder/",
    title: "JWT Decoder & Token Inspector | desktools.run",
    description: "Decode JSON Web Tokens and inspect Header & Payload claims safely in your browser.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "JWT Decoder & Token Inspector — desktools.run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Decoder & Token Inspector | desktools.run",
    description: "Decode JSON Web Tokens and inspect Header & Payload claims safely in your browser.",
    images: ["/og-banner.jpg"],
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolJsonLd
        title="JWT Decoder & Token Inspector"
        description="Decode JSON Web Tokens and inspect Header, Payload, and expiration claims locally in your browser."
        toolUrl="https://desktools.run/tools/jwt-decoder/"
      />
      {children}
    </>
  );
}
