import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Live Preview — Side-by-Side Editor | desktools.run",
  description:
    "Write Markdown documents with live rendered HTML preview side-by-side in your web browser.",
  alternates: {
    canonical: "https://desktools.run/tools/markdown-preview/",
  },
  openGraph: {
    url: "https://desktools.run/tools/markdown-preview/",
    title: "Markdown Live Preview | desktools.run",
    description: "Write Markdown with side-by-side formatted HTML preview.",
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
        title="Markdown Live Preview"
        description="Write Markdown with side-by-side formatted HTML preview."
        toolUrl="https://desktools.run/tools/markdown-preview/"
      />
      {children}
    </>
  );
}
