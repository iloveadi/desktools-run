import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System & Engine Status — Live Performance | desktools.run",
  description:
    "Real-time operational status of desktools.run client engines, WebAssembly modules, and global CDN delivery network.",
  alternates: {
    canonical: "https://desktools.run/status/",
  },
  openGraph: {
    title: "System & Engine Status | desktools.run",
    description: "Real-time operational status of desktools.run client engines and CDN delivery.",
    url: "https://desktools.run/status/",
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

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
