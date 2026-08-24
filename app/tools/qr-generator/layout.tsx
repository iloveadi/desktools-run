import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR 코드 생성기 — URL, 텍스트 QR 무료 생성 & 다운로드 | desktools.run",
  description:
    "웹주소(URL), 텍스트, Wi-Fi 정보를 고해상도 QR 코드로 자유롭게 생성하세요. 커스텀 색상, 크기 설정, PNG/SVG 다운로드 지원. 100% 브라우저 무료 생성.",
  keywords: ["QR 코드 생성기", "qr code generator", "qr 만들기", "qr code maker", "무료 QR 코드", "svg qr code"],
  openGraph: {
    title: "QR 코드 생성기 — URL, 텍스트 QR 무료 생성 & 다운로드 | desktools.run",
    description: "고해상도 QR 코드를 자유롭게 맞춤 디자인하고 다운로드하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
