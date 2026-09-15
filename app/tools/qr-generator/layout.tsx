import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free QR Code Generator Online — Custom Colors, PNG & SVG Download | desktools.run",
  description:
    "Generate high-resolution QR codes for URLs, text, Wi-Fi networks, and contact info. Customize colors, sizing, and export in crisp PNG or vector SVG format. 100% free and client-side.",
  keywords: [
    "qr code generator",
    "free qr maker",
    "create qr code online",
    "wifi qr code generator",
    "svg qr code",
    "QR 코드 생성기",
    "QR 만들기",
    "QRコード 作成",
    "generador codigo qr",
    "二维码生成器"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/qr-generator/",
  },
  openGraph: {
    url: "https://desktools.run/tools/qr-generator/",
    title: "Free Custom QR Code Generator | desktools.run",
    description: "Create customizable high-resolution QR codes with PNG & SVG vector download.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Free QR Code Generator — desktools.run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Custom QR Code Generator | desktools.run",
    description: "Create customizable high-resolution QR codes with PNG & SVG vector download.",
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
        title="QR Code Generator"
        description="Generate customizable high-resolution QR codes for URLs, text, and Wi-Fi networks with PNG and SVG export."
        toolUrl="https://desktools.run/tools/qr-generator/"
      />
      {children}
    </>
  );
}
