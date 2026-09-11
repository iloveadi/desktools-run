import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "글자 수 세기 — 단어·문자·문장 수 카운터 무료 | desktools.run",
  description:
    "텍스트의 글자 수, 단어 수, 문장 수를 브라우저에서 즉시 세어 보세요. 공백 포함·제외 선택, 단어 밀도 분석 및 SNS 글자 수 제한 실시간 확인 지원.",
  keywords: ["글자 수 세기", "word count", "글자 수", "단어 수", "문자 수 세기", "character count", "무료 텍스트 도구"],
  openGraph: {
    url: "https://desktools.run/tools/word-count/",
    title: "글자 수 세기 — 단어·문자·문장 수 카운터 무료 | desktools.run",
    description: "텍스트의 글자 수, 단어 수, 문장 수를 브라우저에서 즉시 세어 보세요.",
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
    canonical: "https://desktools.run/tools/word-count/",
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
        title="Word & Character Counter"
        description="Analyze word count, character count, sentences, and reading time."
        toolUrl="https://desktools.run/tools/word-count/"
      />
      {children}
    </>
  );
}
