import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Converter & Palette Generator Online — HEX, RGB, HSL, HSV & CMYK | desktools.run",
  description:
    "Convert between HEX, RGB, HSL, HSV, and CMYK color codes in real-time. Generate harmonic palettes, tints & shades, and inspect WCAG contrast ratios. 100% free and browser-native.",
  keywords: [
    "color converter",
    "hex to rgb",
    "rgb to hex",
    "hsl converter",
    "cmyk converter",
    "color picker online",
    "wcag contrast checker",
    "색상 변환기",
    "컬러 피커",
    "カラーコード変換",
    "conversor de color",
    "颜色代码转换器"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/color-converter/",
  },
  openGraph: {
    url: "https://desktools.run/tools/color-converter/",
    title: "Color Converter & Palette Generator | desktools.run",
    description: "Convert HEX, RGB, HSL, and CMYK colors with harmonic palettes and WCAG contrast analysis.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Color Converter & Palette Generator — desktools.run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Converter & Palette Generator | desktools.run",
    description: "Convert HEX, RGB, HSL, and CMYK colors with harmonic palettes and WCAG contrast analysis.",
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
        title="Color Converter & Palette Generator"
        description="Convert between HEX, RGB, HSL, HSV, and CMYK color codes with harmonic palettes and WCAG contrast ratios."
        toolUrl="https://desktools.run/tools/color-converter/"
      />
      {children}
    </>
  );
}
