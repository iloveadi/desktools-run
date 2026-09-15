import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder Online — Text & File Converter | desktools.run",
  description:
    "Encode plain text or binary files to Base64 strings and decode Base64 back instantly in your browser. 100% client-side, zero server uploads, safe and private.",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "base64 convert",
    "base64 string to image",
    "base64 to text",
    "Base64 인코딩",
    "Base64 디코딩",
    "Base64 変換",
    "codificador base64",
    "Base64 编码解码"
  ],
  alternates: {
    canonical: "https://desktools.run/tools/base64/",
  },
  openGraph: {
    url: "https://desktools.run/tools/base64/",
    title: "Base64 Encoder & Decoder | desktools.run",
    description: "Encode text and files into Base64 or decode Base64 back instantly in your browser.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Base64 Encoder & Decoder — desktools.run",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Base64 Encoder & Decoder | desktools.run",
    description: "Encode and decode Base64 strings and files 100% locally in your browser.",
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
        title="Base64 Encoder / Decoder"
        description="Encode text and files into Base64 or decode Base64 back instantly in your browser."
        toolUrl="https://desktools.run/tools/base64/"
      />
      {children}
    </>
  );
}
