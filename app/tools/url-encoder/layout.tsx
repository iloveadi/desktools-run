import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encode & Decode — Parameter Converter | desktools.run",
  description:
    "Encode or decode special characters, Korean text, and parameters in URLs instantly. RFC 3986 compliant, 100% browser local execution with zero data leakage.",
  alternates: {
    canonical: "https://desktools.run/tools/url-encoder/",
  },
  openGraph: {
    url: "https://desktools.run/tools/url-encoder/",
    title: "URL Encoder / Decoder | desktools.run",
    description: "Encode special characters into URL-safe formats or decode.",
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
        title="URL Encoder / Decoder"
        description="Encode special characters into URL-safe formats or decode."
        toolUrl="https://desktools.run/tools/url-encoder/"
      />
      {children}
    </>
  );
}
