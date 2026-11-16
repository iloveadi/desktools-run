import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — 100% Client-Side & Zero Server Tracking | desktools.run",
  description:
    "Privacy Policy for desktools.run. All utility operations run 100% locally in your web browser. No files, text, or sensitive data are uploaded to remote servers.",
  alternates: {
    canonical: "https://desktools.run/privacy/",
  },
  openGraph: {
    title: "Privacy Policy | desktools.run",
    description: "Zero server uploads. 100% client-side privacy architecture.",
    url: "https://desktools.run/privacy/",
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
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
