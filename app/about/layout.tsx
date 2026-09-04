import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Fast & Private Browser Utilities | desktools.run",
  description:
    "Learn about desktools.run mission: providing 100% private, browser-first tools with zero server uploads.",
  alternates: {
    canonical: "https://desktools.run/about/",
  },
  openGraph: {
    title: "About Us | desktools.run",
    description: "100% private, browser-first tools with zero server uploads.",
    url: "https://desktools.run/about/",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
