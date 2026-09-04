import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter, Prettify & Validator | desktools.run",
  description:
    "Prettify, minify, and validate JSON data with syntax highlighting 100% in your browser memory.",
  alternates: {
    canonical: "https://desktools.run/tools/json-formatter/",
  },
  openGraph: {
    url: "https://desktools.run/tools/json-formatter/",
    title: "JSON Formatter & Validator | desktools.run",
    description: "Format, minified, validate, and syntax highlight JSON data.",
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
        title="JSON Formatter & Validator"
        description="Format, minified, validate, and syntax highlight JSON data."
        toolUrl="https://desktools.run/tools/json-formatter/"
      />
      {children}
    </>
  );
}
