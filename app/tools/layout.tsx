import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Free Browser Utility Tools — Privacy-First Web Tools | desktools.run",
  description:
    "Browse our complete catalog of free, private, client-side browser tools for PDF, image, text, developer, and converter workflows.",
  alternates: {
    canonical: "https://desktools.run/tools/",
  },
  openGraph: {
    title: "All Free Browser Utility Tools | desktools.run",
    description: "Browse our complete catalog of free, private, client-side browser tools.",
    url: "https://desktools.run/tools/",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
