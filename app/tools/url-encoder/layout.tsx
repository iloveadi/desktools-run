import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encoder & Decoder Online — Percent-Encoding & URI Converter | desktools.run",
  description:
    "Encode or decode special characters, multilingual text, and query parameters in URLs instantly. RFC 3986 compliant, 100% browser local execution with zero data leakage.",
  keywords: [
    "url encoder",
    "url decoder",
    "percent encoding",
    "uri component encoder",
    "decode url query",
    "URL 인코더",
    "URL 디코더",
    "URL エンコード",
    "codificador url",
    "URL 编码解码"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/url-encoder/",
  },
  openGraph: {
    url: "https://desktools.run/tools/url-encoder/",
    title: "URL Encoder & Decoder | desktools.run",
    description: "Encode special characters into URL-safe formats or decode URL query strings instantly.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "URL Encoder & Decoder — desktools.run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Encoder & Decoder | desktools.run",
    description: "Encode or decode URLs and query strings safely and securely in your browser.",
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
        title="URL Encoder / Decoder"
        description="Encode special characters into URL-safe formats or decode URL query strings instantly in your browser."
        toolUrl="https://desktools.run/tools/url-encoder/"
      />
      {children}
    </>
  );
}
