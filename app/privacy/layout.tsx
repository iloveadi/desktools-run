import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — 100% Client-Side & Zero Server Tracking | desktools.run",
  description:
    "Privacy Policy for desktools.run. All utility operations run 100% locally in your web browser. No files, text, or sensitive data are uploaded to remote servers.",
  alternates: {
    canonical: "https://desktools.run/privacy/",
  },
  openGraph: {
    title: "Privacy Policy | desktools.run",
    description: "Zero server uploads. 100% client-side privacy architecture.",
    url: "https://desktools.run/privacy/",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
