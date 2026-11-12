import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Password Remover — Unlock & Decrypt PDF Online Free | desktools.run",
  description: "Remove passwords and encryption from authorized PDF documents to enable free viewing, printing, and sharing. 100% local processing in browser memory.",
  keywords: [
    "pdf unlock",
    "remove pdf password",
    "decrypt pdf",
    "unlock pdf file online",
    "pdf security remover",
    "free pdf unlocker",
  ],
  openGraph: {
    url: "https://desktools.run/tools/pdf-unlock/",
    title: "PDF Password Remover | desktools.run",
    description: "Remove passwords and encryption from authorized PDF documents to enable free viewing, printing, and sharing. 100% local processing in browser memory.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/pdf-unlock/",
  },
  robots: { index: true, follow: true },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolJsonLd
        title="PDF Unlock & Decrypt"
        description="Remove password protection and permanently unlock encrypted PDF documents."
        toolUrl="https://desktools.run/tools/pdf-unlock/"
      />
      {children}
    </>
  );
}
