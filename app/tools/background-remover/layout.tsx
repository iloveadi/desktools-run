import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 배경 제거기 — 누끼 따기·투명 PNG 무료 제작 | desktools.run",
  description:
    "클릭 한 번으로 이미지 배경을 즉시 투명하게 제거하고 누끼를 따세요. 스포이드 색동 감지, 허용 오차 조절, 투명 PNG 다운로드 지원. 서버 업로드 없이 100% 로컬 처리, 완전 무료.",
  keywords: [
    "배경 제거", "background remover", "누끼 따기", "투명 PNG 만들기",
    "이미지 누끼", "사진 배경 지우기", "크로마키 제거", "무료 누끼 따기"
  ],
  openGraph: {
    title: "이미지 배경 제거기 — 누끼 따기·투명 PNG 무료 제작 | desktools.run",
    description: "클릭 한 번으로 이미지 배경을 즉시 투명하게 제거하고 누끼를 따세요.",
    type: "website",
    siteName: "desktools.run",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
