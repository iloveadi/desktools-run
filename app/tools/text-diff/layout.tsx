import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Diff Checker — Highlight Differences | desktools.run",
  description:
    "Compare two text blocks and highlight line-by-line and word differences instantly in your web browser.",
};

export default function TextDiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
