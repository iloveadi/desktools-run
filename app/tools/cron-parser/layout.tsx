import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron 표현식 파서 및 생성기 — 주기 번역 및 예시 계산 | desktools.run",
  description:
    "Cron 표현식을 사람이 읽기 쉬운 언어로 한글/영문 자동 번역하고 다음 실행 시각 일정을 즉시 계산하세요. 리눅스 및 개발 스케줄러 설정 지원.",
  keywords: ["Cron 파서", "cron expression parser", "cron generator", "크론 표현식", "cron 계산기", "cron builder"],
  openGraph: {
    url: "https://desktools.run/tools/cron-parser/",
    title: "Cron 표현식 파서 및 생성기 — 주기 번역 및 예시 계산 | desktools.run",
    description: "Cron 표현식을 직관적으로 해석하고 계산해 보세요.",
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
    canonical: "https://desktools.run/tools/cron-parser/",
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
        title="Cron Expression Parser"
        description="Parse cron expressions, generate human descriptions, and next executions."
        toolUrl="https://desktools.run/tools/cron-parser/"
      />
      {children}
    </>
  );
}
