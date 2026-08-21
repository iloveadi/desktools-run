import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 용량 압축기 — PNG·JPG·WEBP 손실없는 무료 압축 | desktools.run",
  description:
    "PNG, JPG, WEBP 이미지 용량을 브라우저에서 손실 없이 획기적으로 줄이세요. 다중 파일 일괄 압축 지원. 서버 업로드 없이 100% 로컬 처리, 완전 무료.",
  keywords: [
    "이미지 압축", "image compress", "사진 용량 줄이기", "PNG 압축",
    "JPG 압축", "WEBP 압축", "이미지 용량 절감", "무료 이미지 압축"
  ],
  openGraph: {
    title: "이미지 용량 압축기 — PNG·JPG·WEBP 손실없는 무료 압축 | desktools.run",
    description: "PNG, JPG, WEBP 이미지 용량을 브라우저에서 손실 없이 획기적으로 줄이세요.",
    type: "website",
    siteName: "desktools.run",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
