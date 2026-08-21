import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Tester & Debugger — Real-Time Pattern Matching | desktools.run",
  description:
    "Test regular expressions with real-time match highlighting, capture groups, and syntax checking in your browser.",
};

export default function RegexTesterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
