import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter, Validator & Prettifier Online | desktools.run",
  description:
    "Format, prettify, minify, and validate JSON data instantly with syntax highlighting 100% locally in your browser. Fast, secure, zero data sent to servers.",
  keywords: [
    "json formatter",
    "json validator",
    "json prettifier",
    "minify json",
    "format json online",
    "json parser",
    "JSON 정렬",
    "JSON 유효성 검사",
    "JSON 整形",
    "formateador json",
    "JSON 格式化"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/json-formatter/",
  },
  openGraph: {
    url: "https://desktools.run/tools/json-formatter/",
    title: "JSON Formatter, Prettifier & Validator | desktools.run",
    description: "Format, minify, and validate JSON data in real time without uploading to any server.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "JSON Formatter & Validator — desktools.run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Formatter & Validator | desktools.run",
    description: "Format, minify, and validate JSON data locally in your browser.",
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
        title="JSON Formatter & Validator"
        description="Format, prettify, minify, and validate JSON data with syntax check locally in your browser."
        toolUrl="https://desktools.run/tools/json-formatter/"
      />
      {children}
    </>
  );
}
