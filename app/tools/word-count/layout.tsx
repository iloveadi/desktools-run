import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Counter — Count Words, Characters & Sentences Free | desktools.run",
  description: "Analyze word count, character count (with/without spaces), sentences, paragraphs, reading time, and keyword density in real time right in your browser.",
  keywords: [
    "word counter",
    "character count",
    "word count tool",
    "reading time calculator",
    "keyword density analyzer",
    "free text counter online",
  ],
  openGraph: {
    url: "https://desktools.run/tools/word-count/",
    title: "Word & Character Counter | desktools.run",
    description: "Analyze word count, character count (with/without spaces), sentences, paragraphs, reading time, and keyword density in real time right in your browser.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/word-count/",
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
        title="Word & Character Counter"
        description="Analyze word count, character count, sentences, and reading time."
        toolUrl="https://desktools.run/tools/word-count/"
      />
      {children}
    </>
  );
}
