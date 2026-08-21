import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Blog & Guides — Privacy Web Tools | desktools.run",
  description:
    "Read articles and technical guides on WebAssembly, PDF processing, client-side Web AI, and modern web developer tools.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
