import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "텍스트 차이점 비교 (Diff) — 줄 단위 실시간 변경점 강조 | desktools.run",
  description:
    "두 텍스트 블록의 원본과 수정본을 비교하고 추가·삭제·변경된 줄 단위 차이점을 실시간으로 강조 표시합니다. 소스 코드, 계약서, 기사 초안 비교 100% 브라우저 로컬 안전 처리.",
  keywords: [
    "텍스트 비교", "텍스트 diff", "코드 비교", "text diff", "text compare",
    "문서 차이점 비교", "온라인 diff", "diff checker", "무료 텍스트 비교"
  ],
  openGraph: {
    url: "https://desktools.run/tools/text-diff/",
    title: "텍스트 차이점 비교 (Diff) | desktools.run",
    description: "두 텍스트를 나란히 비교하고 변경된 줄을 실시간으로 강조 표시합니다. 100% 로컬 보안.",
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
    canonical: "https://desktools.run/tools/text-diff/",
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
        title="Text Diff Checker"
        description="Compare two text snippets side-by-side and highlight line-by-line differences in real-time."
        toolUrl="https://desktools.run/tools/text-diff/"
      />
      {children}
    </>
  );
}
