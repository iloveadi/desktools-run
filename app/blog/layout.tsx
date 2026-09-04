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
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
