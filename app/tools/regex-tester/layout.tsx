import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Tester & Debugger — Real-Time Pattern Matching | desktools.run",
  description:
    "Test regular expressions with real-time match highlighting, capture groups, and syntax checking in your browser.",
  alternates: {
    canonical: "https://desktools.run/tools/regex-tester/",
  },
  openGraph: {
    url: "https://desktools.run/tools/regex-tester/",
    title: "Regex Tester | desktools.run",
    description: "Test regular expressions with real-time match highlighting.",
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
