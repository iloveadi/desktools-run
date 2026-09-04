import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System & Engine Status — Live Performance | desktools.run",
  description:
    "Real-time operational status of desktools.run client engines, WebAssembly modules, and CDN static delivery.",
  alternates: {
    canonical: "https://desktools.run/status/",
  },
  openGraph: {
    title: "System & Engine Status | desktools.run",
    description: "Real-time operational status of desktools.run client engines and CDN delivery.",
    url: "https://desktools.run/status/",
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
