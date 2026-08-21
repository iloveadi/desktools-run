import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Release Notes & Changelog — desktools.run Updates",
  description:
    "Track recent updates, new tool releases, and engine performance improvements on desktools.run.",
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
