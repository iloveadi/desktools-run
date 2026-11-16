import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Case Converter — UPPERCASE, lowercase, camelCase | desktools.run",
  description:
    "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, PascalCase, and kebab-case instantly.",
  alternates: {
    canonical: "https://desktools.run/tools/text-case/",
  },
  openGraph: {
    url: "https://desktools.run/tools/text-case/",
    title: "Text Case Converter | desktools.run",
    description: "Convert UPPERCASE, lowercase, Title Case, camelCase, and snake_case.",
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

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolJsonLd
        title="Text Case Converter"
        description="Convert UPPERCASE, lowercase, Title Case, camelCase, and snake_case."
        toolUrl="https://desktools.run/tools/text-case/"
      />
      {children}
    </>
  );
}
