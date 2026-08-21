import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System & Engine Status — Live Performance | desktools.run",
  description:
    "Real-time operational status of desktools.run client engines, WebAssembly modules, and CDN static delivery.",
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
