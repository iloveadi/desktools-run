import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon & 앱 아이콘 생성기 — 1클릭 일괄 압축 생성 | desktools.run",
  description:
    "하나의 로고 이미지로 16x16, 32x32, 48x48, apple-touch-icon, favicon.ico, site.webmanifest 파비콘 세트를 1클릭으로 생성하고 ZIP 패키지로 일괄 다운로드하세요.",
  keywords: [
    "파비콘 생성기", "Favicon generator", "favicon.ico 생성", "앱 아이콘 생성", "apple-touch-icon",
    "웹사이트 아이콘", "PWA 아이콘 생성", "무료 파비콘", "파비콘 만드는 법"
  ],
  openGraph: {
    url: "https://desktools.run/tools/favicon-generator/",
    title: "Favicon & 앱 아이콘 생성기 — 1클릭 일괄 압축 생성 | desktools.run",
    description: "하나의 로고 이미지로 16x16, 32x32, apple-touch-icon, favicon.ico, site.webmanifest 세트를 1클릭 생성하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/favicon-generator/",
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
        title="Favicon & App Icon Generator"
        description="Generate complete 16x16, 32x32, 48x48, apple-touch-icon, favicon.ico, and site.webmanifest packages in 1 click."
        toolUrl="https://desktools.run/tools/favicon-generator/"
      />
      {children}
    </>
  );
}
