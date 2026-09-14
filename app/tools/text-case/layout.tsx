import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대소문자 및 표기법 변환기 — camelCase·snake_case·대문자 | desktools.run",
  description:
    "영어 텍스트를 대문자(UPPERCASE), 소문자(lowercase), 제목(Title Case), camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE로 1클릭 일괄 변환하세요.",
  keywords: [
    "대소문자 변환기", "camelCase 변환", "snake_case 변환", "PascalCase", "kebab-case",
    "대문자 소문자 변환", "Title Case", "case converter", "표기법 변환기", "무료 텍스트 변환"
  ],
  openGraph: {
    url: "https://desktools.run/tools/text-case/",
    title: "대소문자 및 표기법 변환기 — camelCase·snake_case | desktools.run",
    description: "대문자, 소문자, Title Case, camelCase, snake_case, kebab-case 실시간 일괄 변환.",
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
    canonical: "https://desktools.run/tools/text-case/",
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
        title="Text Case & Naming Convention Converter"
        description="Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, PascalCase, and kebab-case instantly."
        toolUrl="https://desktools.run/tools/text-case/"
      />
      {children}
    </>
  );
}
