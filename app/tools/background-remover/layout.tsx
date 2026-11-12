import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Image Background Remover — Transparent PNG Maker Free | desktools.run",
  description: "Remove backgrounds from photos instantly and create transparent PNGs in your browser. 100% private client-side processing with zero server uploads.",
  keywords: [
    "background remover",
    "remove bg",
    "transparent background",
    "photo cutout",
    "free background remover online",
    "remove image background",
  ],
  openGraph: {
    url: "https://desktools.run/tools/background-remover/",
    title: "AI Image Background Remover | desktools.run",
    description: "Remove backgrounds from photos instantly and create transparent PNGs in your browser. 100% private client-side processing with zero server uploads.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/background-remover/",
  },
  robots: { index: true, follow: true },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolJsonLd
        title="Background Remover"
        description="Remove image backgrounds automatically with client-side Web AI."
        toolUrl="https://desktools.run/tools/background-remover/"
      />
      {children}
    </>
  );
}
