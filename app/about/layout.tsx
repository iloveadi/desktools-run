import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Fast & Private Browser Utilities | desktools.run",
  description:
    "Learn about desktools.run mission: providing 100% private, browser-first utility tools with zero server uploads, no logins, and lightning-fast client execution.",
  alternates: {
    canonical: "https://desktools.run/about/",
  },
  openGraph: {
    title: "About Us | desktools.run",
    description: "100% private, browser-first tools with zero server uploads.",
    url: "https://desktools.run/about/",
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

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
