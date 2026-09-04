import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 EXIF 메타데이터 제거기 / 보기 — 100% 브라우저 무료 연산 | desktools.run",
  description:
    "사진에 숨겨진 GPS 위치 정보, 카메라 기기 정보, 촬영 일시 EXIF 메타데이터를 확인하고 1클릭 완벽 제거 후 다운로드하세요. 서버 전송 없이 100% 로컬 개인정보 보호.",
  keywords: [
    "EXIF 제거기", "EXIF 보기", "사진 GPS 제거", "이미지 개인정보 삭제", "사진 위치정보 삭제",
    "EXIF cleaner", "EXIF remover", "사진 메타데이터 삭제", "무료 EXIF 제거"
  ],
  openGraph: {
    url: "https://desktools.run/tools/exif-remover/",
    title: "이미지 EXIF 메타데이터 제거기 / 보기 — 100% 브라우저 무료 연산 | desktools.run",
    description: "사진에 숨겨진 GPS 위치 정보, 카메라 기기 정보 EXIF 메타데이터를 확인하고 1클릭 완벽 제거 후 다운로드하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  alternates: {
    canonical: "https://desktools.run/tools/exif-remover/",
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
        title="Image EXIF Cleaner & Viewer"
        description="Inspect GPS location, camera details, and date metadata from photos and strip all EXIF data in 1 click for 100% privacy."
        toolUrl="https://desktools.run/tools/exif-remover/"
      />
      {children}
    </>
  );
}
