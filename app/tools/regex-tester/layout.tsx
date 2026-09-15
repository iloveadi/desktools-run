import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Tester & Debugger Online — Real-Time Regular Expression Matching | desktools.run",
  description:
    "Test, debug, and validate regular expressions with real-time match highlighting, capture groups, and flag controls 100% locally in your browser. Fast, secure, and developer-ready.",
  keywords: [
    "regex tester",
    "regular expression tester",
    "regex debugger",
    "javascript regex",
    "regex online",
    "정규표현식 테스터",
    "정규식 검사",
    "正規表現 テスター",
    "probador regex",
    "正则表达式测试"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/regex-tester/",
  },
  openGraph: {
    url: "https://desktools.run/tools/regex-tester/",
    title: "Regex Tester & Debugger | desktools.run",
    description: "Test regular expressions with real-time match highlighting and capture group inspection.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Regex Tester & Debugger — desktools.run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Regex Tester & Debugger | desktools.run",
    description: "Test and debug regular expressions with instant match highlighting in your browser.",
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
        title="Regex Tester & Debugger"
        description="Test and debug regular expressions with real-time match highlighting and capture group inspection."
        toolUrl="https://desktools.run/tools/regex-tester/"
      />
      {children}
    </>
  );
}
