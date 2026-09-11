import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encode & Decode — Text & File Converter | desktools.run",
  description:
    "Encode plain text or binary files to Base64 strings and decode them back instantly in your browser. 100% client-side, zero server uploads, safe and private.",
  alternates: {
    canonical: "https://desktools.run/tools/base64/",
  },
  openGraph: {
    url: "https://desktools.run/tools/base64/",
    title: "Base64 Encoder / Decoder | desktools.run",
    description: "Encode text and files into Base64 or decode Base64 back.",
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
        title="Base64 Encoder / Decoder"
        description="Encode text and files into Base64 or decode Base64 back."
        toolUrl="https://desktools.run/tools/base64/"
      />
      {children}
    </>
  );
}
