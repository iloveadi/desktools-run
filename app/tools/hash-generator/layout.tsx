import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "해시 생성기 — MD5·SHA-1·SHA-256·SHA-512 무료 변환 | desktools.run",
  description:
    "텍스트를 MD5, SHA-1, SHA-256, SHA-512 해시로 브라우저에서 즉시 변환하세요. 서버 전송 없이 100% 로컬 처리, 완전 무료.",
  keywords: ["해시 생성기", "hash generator", "MD5", "SHA-256", "SHA-512", "SHA-1", "hash converter", "무료 해시"],
  openGraph: {
    title: "해시 생성기 — MD5·SHA-256·SHA-512 무료 변환 | desktools.run",
    description: "텍스트를 MD5, SHA-1, SHA-256 등 해시로 즉시 변환하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
