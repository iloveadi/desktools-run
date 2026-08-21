import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encode & Decode — Text & File Converter | desktools.run",
  description:
    "Encode plain text or binary files to Base64 strings and decode them back 100% in your browser.",
};

export default function Base64Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
