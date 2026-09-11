import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Browser Utility Tools Catalog | desktools.run",
  description:
    "Browse our complete catalog of free, private, client-side browser tools for PDF, image, text, developer, and converter workflows.",
  alternates: {
    canonical: "https://desktools.run/tools/",
  },
  openGraph: {
    title: "All Free Browser Utility Tools | desktools.run",
    description: "Browse our complete catalog of free, private, client-side browser tools.",
    url: "https://desktools.run/tools/",
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

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
