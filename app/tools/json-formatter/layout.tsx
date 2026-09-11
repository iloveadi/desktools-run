import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter, Prettify & Validator | desktools.run",
  description:
    "Prettify, minify, and validate JSON data with syntax highlighting 100% locally in your browser. Fast, secure, and developer-friendly with zero server tracking.",
  alternates: {
    canonical: "https://desktools.run/tools/json-formatter/",
  },
  openGraph: {
    url: "https://desktools.run/tools/json-formatter/",
    title: "JSON Formatter & Validator | desktools.run",
    description: "Format, minified, validate, and syntax highlight JSON data.",
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
        title="JSON Formatter & Validator"
        description="Format, minified, validate, and syntax highlight JSON data."
        toolUrl="https://desktools.run/tools/json-formatter/"
      />
      {children}
    </>
  );
}
