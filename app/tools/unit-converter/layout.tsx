import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "단위 변환기 — 길이·무게·온도·속도 무료 변환 | desktools.run",
  description:
    "길이, 무게, 온도, 속도, 넓이, 부피 등 다양한 단위를 브라우저에서 즉시 변환하세요. 설치 불필요, 완전 무료.",
  keywords: ["단위 변환기", "unit converter", "길이 변환", "무게 변환", "온도 변환", "km to mile", "무료 단위 변환"],
  openGraph: {
    url: "https://desktools.run/tools/unit-converter/",
    title: "단위 변환기 — 길이·무게·온도·속도 무료 변환 | desktools.run",
    description: "길이, 무게, 온도, 속도 등 다양한 단위를 브라우저에서 즉시 변환하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/unit-converter/",
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
        title="Unit Converter"
        description="Convert length, weight, temperature, area, volume, and speed."
        toolUrl="https://desktools.run/tools/unit-converter/"
      />
      {children}
    </>
  );
}
