import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마크다운 실시간 미리보기 — 2분할 에디터 & HTML 렌더러 | desktools.run",
  description:
    "좌측 에디터에서 Markdown을 작성하고 우측 화면에서 실시간 렌더링된 HTML 결과를 즉시 확인하세요. .md 파일 저장, HTML 코드 복사, 100% 브라우저 로컬 안전 처리.",
  keywords: [
    "마크다운 미리보기", "Markdown preview", "마크다운 에디터", "markdown editor",
    "마크다운 HTML 변환", "실시간 마크다운", "온라인 마크다운 뷰어", "markdown viewer", "무료 마크다운"
  ],
  openGraph: {
    url: "https://desktools.run/tools/markdown-preview/",
    title: "마크다운 실시간 미리보기 — 분할 에디터 | desktools.run",
    description: "마크다운 작성과 동시에 실시간 HTML 서식 렌더링 확인. 100% 브라우저 로컬 안전 처리.",
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
    canonical: "https://desktools.run/tools/markdown-preview/",
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
        title="Markdown Live Preview & Editor"
        description="Write Markdown documents with live rendered HTML preview side-by-side with zero server uploads."
        toolUrl="https://desktools.run/tools/markdown-preview/"
      />
      {children}
    </>
  );
}
