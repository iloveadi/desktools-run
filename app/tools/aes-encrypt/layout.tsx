import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AES Text Encryptor & Decryptor — Military-Grade AES-256 | desktools.run",
  description:
    "Securely encrypt and decrypt sensitive text, passwords, and API keys with 256-bit AES encryption. 100% private, client-side WebCrypto processing with zero server uploads.",
  keywords: [
    "AES encryption",
    "AES decryption",
    "AES-256",
    "text encryptor",
    "password encryption",
    "AES encrypt decrypt online",
    "secure text cipher",
    "free AES tool",
    "client-side encryption",
  ],
  openGraph: {
    url: "https://desktools.run/tools/aes-encrypt/",
    title: "AES Text Encryptor & Decryptor (AES-256) | desktools.run",
    description: "Securely encrypt and decrypt sensitive text with military-grade AES-256 encryption in your browser.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/aes-encrypt/",
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
        title="AES Text Encrypt / Decrypt"
        description="Encrypt and decrypt text, passwords, and sensitive keys with military-grade AES-256."
        toolUrl="https://desktools.run/tools/aes-encrypt/"
      />
      {children}
    </>
  );
}
