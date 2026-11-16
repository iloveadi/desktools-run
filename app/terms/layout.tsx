import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Free Online Web Utilities | desktools.run",
  description:
    "Terms of Service for desktools.run. Review our terms of use, client-side utility guidelines, and free browser-native tools framework.",
  alternates: {
    canonical: "https://desktools.run/terms/",
  },
  openGraph: {
    title: "Terms of Service | desktools.run",
    description: "Terms and guidelines for using desktools.run free web utility tools.",
    url: "https://desktools.run/terms/",
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

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
