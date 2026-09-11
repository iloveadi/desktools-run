import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Blog & Guides — Privacy Web Tools | desktools.run",
  description:
    "Read articles and technical guides on WebAssembly, PDF processing, client-side Web AI, and modern web developer tools.",
  alternates: {
    canonical: "https://desktools.run/blog/",
  },
  openGraph: {
    title: "Developer Blog & Guides | desktools.run",
    description: "Articles and technical guides on WebAssembly, PDF processing, and modern web tools.",
    url: "https://desktools.run/blog/",
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

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
