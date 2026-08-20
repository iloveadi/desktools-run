import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV → JSON 변환기 — 브라우저에서 즉시 무료 변환 | desktools.run",
  description:
    "CSV 파일을 JSON 형식으로 즉시 변환하세요. 드래그앤드롭 업로드, 배열/객체 출력 선택, 테이블 미리보기 지원. 서버 전송 없이 100% 로컬 처리, 완전 무료.",
  keywords: ["CSV to JSON", "CSV 변환기", "JSON 변환", "csv json 변환", "엑셀 JSON 변환", "무료 CSV 변환", "온라인 CSV"],
  openGraph: {
    title: "CSV → JSON 변환기 — 브라우저에서 즉시 무료 변환 | desktools.run",
    description: "CSV 파일을 JSON 형식으로 즉시 변환하세요. 서버 전송 없이 100% 로컬 처리.",
    type: "website",
    siteName: "desktools.run",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
