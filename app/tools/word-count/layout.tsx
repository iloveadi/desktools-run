import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "글자 수 세기 — 단어·문자·문장 수 실시간 카운터 무료 | desktools.run",
  description:
    "텍스트의 공백 포함/제외 글자 수, 단어 수, 문장 수, 단락 수, 읽기/말하기 예상 시간 및 키워드 밀도를 100% 브라우저 메모리에서 실시간 분석하세요. 자기소개서, 리포트, 블로그 글자 수 최적화.",
  keywords: [
    "글자 수 세기", "단어 수 세기", "글자수세기", "자기소개서 글자수", "자소서 글자수 계산기",
    "word counter", "character count", "텍스트 분석기", "단어 밀도 분석", "무료 글자수"
  ],
  openGraph: {
    url: "https://desktools.run/tools/word-count/",
    title: "단어 및 글자 수 세기 — 실시간 무료 텍스트 분석기 | desktools.run",
    description: "공백 포함/제외 글자 수, 단어 수, 문장 수, 예상 낭독 시간을 실시간 계산하세요. 100% 로컬 프라이버시 보장.",
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
        description="Analyze word count, character count, sentences, and reading time in real-time."
        toolUrl="https://desktools.run/tools/word-count/"
      />
      {children}
    </>
  );
}
