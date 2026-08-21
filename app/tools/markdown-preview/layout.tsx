import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Live Preview — Side-by-Side Editor | desktools.run",
  description:
    "Write Markdown documents with live rendered HTML preview side-by-side in your web browser.",
};

export default function MarkdownPreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
