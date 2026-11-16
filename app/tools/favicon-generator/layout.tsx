import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon & App Icon Generator — Multi-Size PNG & ICO Suite | desktools.run",
  description: "Generate complete favicon packages including 16x16, 32x32, 48x48, Apple Touch Icon, Android manifest icons, and ICO files in one click.",
  keywords: [
    "favicon generator",
    "generate ico",
    "app icon maker",
    "apple touch icon",
    "webmanifest icon generator",
    "free favicon tool",
  ],
  openGraph: {
    url: "https://desktools.run/tools/favicon-generator/",
    title: "Favicon & App Icon Generator | desktools.run",
    description: "Generate complete favicon packages including 16x16, 32x32, 48x48, Apple Touch Icon, Android manifest icons, and ICO files in one click.",
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
    canonical: "https://desktools.run/tools/favicon-generator/",
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
        title="Favicon & App Icon Generator"
        description="Generate complete 16x16, 32x32, 48x48, apple-touch-icon, favicon.ico, and site.webmanifest packages in 1 click."
        toolUrl="https://desktools.run/tools/favicon-generator/"
      />
      {children}
    </>
  );
}
