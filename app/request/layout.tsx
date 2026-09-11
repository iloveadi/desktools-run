import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a New Tool — Feature Feedback | desktools.run",
  description:
    "Suggest a new browser utility tool or feature improvement for desktools.run. Community requests are actively reviewed and implemented.",
  alternates: {
    canonical: "https://desktools.run/request/",
  },
  openGraph: {
    title: "Request a New Tool | desktools.run",
    description: "Suggest a new browser utility tool or feature improvement.",
    url: "https://desktools.run/request/",
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

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
