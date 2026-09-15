import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Expression Parser & Schedule Generator Online — Human Translator | desktools.run",
  description:
    "Parse cron expressions into plain human-readable language and calculate next execution times in real-time. Interactive cron builder with full 5-field crontab support. 100% free and client-side.",
  keywords: [
    "cron parser",
    "cron expression generator",
    "crontab schedule builder",
    "cron human readable",
    "cron next run calculator",
    "Cron 파서",
    "크론 표현식",
    "Cron 計算",
    "generador expresiones cron",
    "Cron 表达式解析"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/cron-parser/",
  },
  openGraph: {
    url: "https://desktools.run/tools/cron-parser/",
    title: "Cron Expression Parser & Schedule Generator | desktools.run",
    description: "Translate cron expressions into human language and calculate future execution dates.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Cron Expression Parser & Generator — desktools.run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Expression Parser & Schedule Generator | desktools.run",
    description: "Translate cron expressions into plain language and calculate next execution schedules.",
    images: ["/og-banner.jpg"],
  },
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
        description="Parse cron expressions, generate human descriptions, and calculate next execution times."
        toolUrl="https://desktools.run/tools/cron-parser/"
      />
      {children}
    </>
  );
}
