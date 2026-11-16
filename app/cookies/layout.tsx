import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — Privacy-First Web Utilities | desktools.run",
  description:
    "Cookie and local storage policy for desktools.run. Learn how we minimize user tracking and maintain transparent, client-side privacy standards.",
  alternates: {
    canonical: "https://desktools.run/cookies/",
  },
  openGraph: {
    title: "Cookie Policy | desktools.run",
    description: "Transparent, privacy-first cookie and local storage guidelines.",
    url: "https://desktools.run/cookies/",
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

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
