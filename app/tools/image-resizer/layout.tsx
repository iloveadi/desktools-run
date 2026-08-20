import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 크기 변환 — JPG·PNG·WebP 무료 리사이즈 | desktools.run",
  description:
    "이미지 크기(픽셀·%)를 브라우저에서 즉시 변환하세요. JPG, PNG, WebP, GIF 모두 지원. 서버 업로드 없이 100% 로컬 처리, 완전 무료.",
  keywords: ["이미지 리사이즈", "image resizer", "이미지 크기 변환", "사진 크기 줄이기", "이미지 압축", "무료 이미지 도구"],
  openGraph: {
    title: "이미지 크기 변환 — JPG·PNG·WebP 무료 리사이즈 | desktools.run",
    description: "이미지 크기(픽셀·%)를 브라우저에서 즉시 변환하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
