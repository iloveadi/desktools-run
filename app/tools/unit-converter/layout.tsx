import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unit Converter Online — Length, Weight, Temperature, Area, Volume & Speed | desktools.run",
  description:
    "Convert length, weight, temperature, area, volume, speed, time, and data storage units instantly in your browser. Real-time multi-unit comparison table with 100% precision.",
  keywords: [
    "unit converter",
    "length converter",
    "weight converter",
    "temperature converter",
    "area converter",
    "speed converter",
    "단위 변환기",
    "평수 계산기",
    "単位変換",
    "conversor de unidades",
    "单位换算器"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/unit-converter/",
  },
  openGraph: {
    url: "https://desktools.run/tools/unit-converter/",
    title: "Unit Converter — Multi-Dimension Unit Calculator | desktools.run",
    description: "Convert length, weight, temperature, area, volume, and speed units in real-time.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Unit Converter — desktools.run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unit Converter — Multi-Dimension Unit Calculator | desktools.run",
    description: "Convert length, weight, temperature, area, volume, and speed units in real-time.",
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
        title="Unit Converter"
        description="Convert length, weight, temperature, area, volume, speed, time, and digital storage units instantly."
        toolUrl="https://desktools.run/tools/unit-converter/"
      />
      {children}
    </>
  );
}
