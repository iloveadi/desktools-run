import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter, Prettify & Validator | desktools.run",
  description:
    "Prettify, minify, and validate JSON data with syntax highlighting 100% in your browser memory.",
};

export default function JsonFormatterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
