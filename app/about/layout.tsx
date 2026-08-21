import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Fast & Private Browser Utilities | desktools.run",
  description:
    "Learn about desktools.run mission: providing 100% private, browser-first tools with zero server uploads.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
