import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Password Protector — Encrypt & Lock PDF Online Free | desktools.run",
  description: "Encrypt and lock confidential PDF documents with 128-bit / 256-bit passwords. Prevent unauthorized opening and copying with 100% browser-based security.",
  keywords: [
    "pdf protect",
    "encrypt pdf",
    "password protect pdf",
    "lock pdf file",
    "secure pdf online",
    "free pdf security tool",
  ],
  openGraph: {
    url: "https://desktools.run/tools/pdf-protect/",
    title: "PDF Password Protector | desktools.run",
    description: "Encrypt and lock confidential PDF documents with 128-bit / 256-bit passwords. Prevent unauthorized opening and copying with 100% browser-based security.",
    type: "website",
    siteName: "desktools.run",
      images: [
      {
        url: "https://desktools.run/og-global.jpg",
        width: 1376,
        height: 768,
        alt: "desktools.run — Fast & Free Web Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://desktools.run/og-global.jpg"],
  },
  alternates: {
    canonical: "https://desktools.run/tools/pdf-protect/",
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
        title="PDF Protect & Encrypt"
        description="Protect sensitive PDF documents with secure password encryption."
        toolUrl="https://desktools.run/tools/pdf-protect/"
      />
      {children}
    </>
  );
}
