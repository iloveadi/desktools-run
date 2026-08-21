import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encode & Decode — Parameter Converter | desktools.run",
  description:
    "Encode or decode special characters, Korean text, and parameters in URLs 100% in your browser.",
};

export default function UrlEncoderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
