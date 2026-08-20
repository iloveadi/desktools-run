import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "비밀번호 생성기 — 강력한 랜덤 비밀번호 무료 생성 | desktools.run",
  description:
    "대소문자, 숫자, 특수문자를 포함한 강력한 랜덤 비밀번호를 브라우저에서 즉시 생성하세요. 서버 전송 없이 100% 로컬 처리, 완전 무료.",
  keywords: ["비밀번호 생성기", "password generator", "랜덤 비밀번호", "강력한 비밀번호", "password maker", "무료 비밀번호"],
  openGraph: {
    title: "비밀번호 생성기 — 강력한 랜덤 비밀번호 무료 생성 | desktools.run",
    description: "강력한 랜덤 비밀번호를 브라우저에서 즉시 생성하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
