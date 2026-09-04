import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AES 텍스트 암호화 / 복호화기 (AES-256) — 무료 비밀 텍스트 변환 | desktools.run",
  description:
    "비밀번호를 설정하여 중요한 텍스트, 계좌번호, API 키를 AES-256 군사급 암호문으로 안전하게 암호화하고 복호화하세요. 서버 전송 없는 100% 브라우저 로컬 암호화.",
  keywords: [
    "AES 암호화",
    "AES 복호화",
    "AES-256",
    "텍스트 암호화",
    "비밀번호 암호화",
    "AES encrypt decrypt",
    "텍스트 비밀번호 잠금",
    "무료 AES 암호화",
    "온라인 AES 암호화기",
  ],
  openGraph: {
    url: "https://desktools.run/tools/aes-encrypt/",
    title: "AES 텍스트 암호화 / 복호화기 (AES-256) | desktools.run",
    description: "중요한 텍스트를 AES-256 군사급 표준 암호문으로 안전하게 암호화하고 복호화하세요.",
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
