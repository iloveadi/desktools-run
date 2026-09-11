import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Tester & Debugger — Real-Time Matching | desktools.run",
  description:
    "Test regular expressions with real-time match highlighting, capture groups, and syntax checking in your browser.",
  alternates: {
    canonical: "https://desktools.run/tools/regex-tester/",
  },
  openGraph: {
    url: "https://desktools.run/tools/regex-tester/",
    title: "Regex Tester | desktools.run",
    description: "Test regular expressions with real-time match highlighting.",
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
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolJsonLd
        title="Regex Tester"
        description="Test regular expressions with real-time match highlighting."
        toolUrl="https://desktools.run/tools/regex-tester/"
      />
      {children}
    </>
  );
}
