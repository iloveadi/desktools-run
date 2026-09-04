import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "글자 수 세기 — 단어·문자·문장 수 카운터 무료 | desktools.run",
  description:
    "텍스트의 글자 수, 단어 수, 문장 수를 브라우저에서 즉시 세어 보세요. 공백 포함·제외 선택 가능. SNS 글자 수 제한 확인에 최적.",
  keywords: ["글자 수 세기", "word count", "글자 수", "단어 수", "문자 수 세기", "character count", "무료 텍스트 도구"],
  openGraph: {
    url: "https://desktools.run/tools/word-count/",
    title: "글자 수 세기 — 단어·문자·문장 수 카운터 무료 | desktools.run",
    description: "텍스트의 글자 수, 단어 수, 문장 수를 브라우저에서 즉시 세어 보세요.",
    type: "website",
    siteName: "desktools.run",
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
