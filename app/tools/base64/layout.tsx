import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encode & Decode — Text & File Converter | desktools.run",
  description:
    "Encode plain text or binary files to Base64 strings and decode them back 100% in your browser.",
  alternates: {
    canonical: "https://desktools.run/tools/base64/",
  },
  openGraph: {
    url: "https://desktools.run/tools/base64/",
    title: "Base64 Encoder / Decoder | desktools.run",
    description: "Encode text and files into Base64 or decode Base64 back.",
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
        title="Base64 Encoder / Decoder"
        description="Encode text and files into Base64 or decode Base64 back."
        toolUrl="https://desktools.run/tools/base64/"
      />
      {children}
    </>
  );
}
