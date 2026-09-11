import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "색상 변환기 — HEX · RGB · HSL 무료 변환 | desktools.run",
  description:
    "HEX, RGB, HSL 색상 코드를 브라우저에서 즉시 상호 변환하세요. 실시간 색상 미리보기 팔레트와 CSS 코드 복사 기능을 100% 무료로 지원합니다.",
  keywords: ["색상 변환기", "color converter", "HEX to RGB", "RGB to HEX", "HSL converter", "color palette", "무료 색상 도구"],
  openGraph: {
    url: "https://desktools.run/tools/color-converter/",
    title: "색상 변환기 — HEX · RGB · HSL 무료 변환 | desktools.run",
    description: "HEX, RGB, HSL 색상 코드를 브라우저에서 즉시 상호 변환하세요.",
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
  alternates: {
    canonical: "https://desktools.run/tools/color-converter/",
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
        title="Color Converter & Picker"
        description="Convert between HEX, RGB, HSL, HSV, and CMYK color codes."
        toolUrl="https://desktools.run/tools/color-converter/"
      />
      {children}
    </>
  );
}
