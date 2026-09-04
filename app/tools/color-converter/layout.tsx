import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "색상 변환기 — HEX · RGB · HSL 무료 변환 | desktools.run",
  description:
    "HEX, RGB, HSL 색상 코드를 브라우저에서 즉시 상호 변환하세요. 보색·유사색 팔레트 생성 기능 포함. 설치 불필요, 100% 무료.",
  keywords: ["색상 변환기", "color converter", "HEX to RGB", "RGB to HEX", "HSL converter", "color palette", "무료 색상 도구"],
  openGraph: {
    url: "https://desktools.run/tools/color-converter/",
    title: "색상 변환기 — HEX · RGB · HSL 무료 변환 | desktools.run",
    description: "HEX, RGB, HSL 색상 코드를 브라우저에서 즉시 상호 변환하세요.",
    type: "website",
    siteName: "desktools.run",
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
