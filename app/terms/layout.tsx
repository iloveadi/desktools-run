import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Free Online Web Utilities | desktools.run",
  description:
    "Terms of Service for desktools.run. Review our terms of use, client-side utility guidelines, and free browser-native tools framework.",
  alternates: {
    canonical: "https://desktools.run/terms/",
  },
  openGraph: {
    title: "Terms of Service | desktools.run",
    description: "Terms and guidelines for using desktools.run free web utility tools.",
    url: "https://desktools.run/terms/",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
