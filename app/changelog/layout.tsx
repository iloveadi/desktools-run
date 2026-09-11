import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Release Notes & Changelog — desktools.run Updates",
  description:
    "Track recent updates, new tool releases, and engine performance improvements across the desktools.run client-side utility suite.",
  alternates: {
    canonical: "https://desktools.run/changelog/",
  },
  openGraph: {
    title: "Release Notes & Changelog | desktools.run",
    description: "Track recent updates, new tool releases, and engine improvements.",
    url: "https://desktools.run/changelog/",
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

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
