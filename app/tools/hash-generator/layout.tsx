import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Hash Generator — MD5, SHA-1, SHA-256 & SHA-512 | desktools.run",
  description: "Generate cryptographic checksums including MD5, SHA-1, SHA-256, SHA-384, and SHA-512 from text or files. 100% private local hashing in browser memory.",
  keywords: [
    "hash generator",
    "sha256 hash",
    "md5 hash generator",
    "sha512 checksum",
    "online hashing tool",
    "crypto hash calculator",
  ],
  openGraph: {
    url: "https://desktools.run/tools/hash-generator/",
    title: "Online Hash Generator | desktools.run",
    description: "Generate cryptographic checksums including MD5, SHA-1, SHA-256, SHA-384, and SHA-512 from text or files. 100% private local hashing in browser memory.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/hash-generator/",
  },
  robots: { index: true, follow: true },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolJsonLd
        title="Hash Generator"
        description="Generate MD5, SHA-1, SHA-256, or SHA-512 hashes from text."
        toolUrl="https://desktools.run/tools/hash-generator/"
      />
      {children}
    </>
  );
}
