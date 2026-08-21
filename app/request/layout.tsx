import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a New Tool — Feature Feedback | desktools.run",
  description:
    "Suggest a new browser utility tool or feature improvement for the desktools.run development team.",
};

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
