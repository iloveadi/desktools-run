import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strong Password Generator — Secure Random Passwords Free | desktools.run",
  description: "Generate strong, uncrackable random passwords with custom symbols, numbers, uppercase letters, and entropy strength meters. 100% client-side secure.",
  keywords: [
    "password generator",
    "random password generator",
    "strong password maker",
    "secure password tool",
    "password entropy calculator",
  ],
  openGraph: {
    url: "https://desktools.run/tools/password-generator/",
    title: "Strong Password Generator | desktools.run",
    description: "Generate strong, uncrackable random passwords with custom symbols, numbers, uppercase letters, and entropy strength meters. 100% client-side secure.",
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
    canonical: "https://desktools.run/tools/password-generator/",
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
        title="Password Generator"
        description="Generate strong, cryptographically secure random passwords."
        toolUrl="https://desktools.run/tools/password-generator/"
      />
      {children}
    </>
  );
}
