import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 이미지 배경 제거기 — 1초 만에 누끼 따기·투명 PNG 무료 다운로드 | desktools.run",
  description:
    "브라우저 온디바이스 AI 신경망으로 인물, 상품, 사물 사진의 배경을 1초 만에 깔끔하게 제거하고 투명 PNG로 추출하세요. 손·다리 전경 보존 엔진 탑재. 서버 업로드 없는 100% 안전한 로컬 처리.",
  keywords: [
    "배경 제거",
    "background remover",
    "누끼 따기",
    "투명 PNG 만들기",
    "이미지 누끼",
    "사진 배경 지우기",
    "무료 누끼 따기",
    "ai background removal",
    "remove bg free",
    "transparent background maker",
    "product photo cutout"
  ],
  openGraph: {
    url: "https://desktools.run/tools/background-remover/",
    title: "AI 이미지 배경 제거기 — 1초 만에 누끼 따기·투명 PNG 무료 다운로드 | desktools.run",
    description: "클릭 한 번으로 이미지 배경을 즉시 투명하게 제거하고 누끼를 따세요. 100% 온디바이스 Web AI 로컬 처리.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-global.jpg",
        width: 1376,
        height: 768,
        alt: "desktools.run — Fast & Free Web Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-global.jpg"],
  },
  alternates: {
    canonical: "https://desktools.run/tools/background-remover/",
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
        title="Background Remover"
        description="Remove image backgrounds automatically with client-side Web AI neural networks."
        toolUrl="https://desktools.run/tools/background-remover/"
      />
      {children}
    </>
  );
}
