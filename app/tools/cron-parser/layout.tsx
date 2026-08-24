import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron 표현식 파서 및 생성기 — 주기 번역 및 예시 계산 | desktools.run",
  description:
    "Cron 표현식을 사람이 읽기 쉬운 언어로 한글/영문 자동 번역하고, 다음 실행 예정 시각을 계산해 보세요. 클릭 방식으로 커스텀 Cron 생성기 제공.",
  keywords: ["Cron 파서", "cron expression parser", "cron generator", "크론 표현식", "cron 계산기", "cron builder"],
  openGraph: {
    title: "Cron 표현식 파서 및 생성기 — 주기 번역 및 예시 계산 | desktools.run",
    description: "Cron 표현식을 직관적으로 해석하고 계산해 보세요.",
    type: "website",
    siteName: "desktools.run",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
