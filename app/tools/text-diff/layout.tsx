import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Diff Checker — Highlight Differences | desktools.run",
  description:
    "Compare two text blocks and highlight line-by-line and word differences instantly in your web browser.",
  alternates: {
    canonical: "https://desktools.run/tools/text-diff/",
  },
  openGraph: {
    url: "https://desktools.run/tools/text-diff/",
    title: "Text Diff Checker | desktools.run",
    description: "Compare two text snippets side by side and highlight differences.",
      images: [
      {
        url: "https://desktools.run/og-global.jpg",
        width: 1376,
        height: 768,
        alt: "desktools.run — Fast & Free Web Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://desktools.run/og-global.jpg"],
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
        title="Text Diff Checker"
        description="Compare two text snippets side by side and highlight differences."
        toolUrl="https://desktools.run/tools/text-diff/"
      />
      {children}
    </>
  );
}
