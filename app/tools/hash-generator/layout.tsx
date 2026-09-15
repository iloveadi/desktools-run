import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "해시 생성기 (MD5 · SHA-1 · SHA-256 · SHA-512) — 무료 온라인 변환 | desktools.run",
  description:
    "텍스트 및 파일의 MD5, SHA-1, SHA-256, SHA-384, SHA-512 해시값을 브라우저에서 즉시 생성하세요. 데이터 무결성 검증, 체크섬 확인, WebCrypto 기반 100% 로컬 무료 도구.",
  keywords: [
    "해시 생성기",
    "MD5 해시 생성",
    "SHA-256 해시 생성",
    "SHA-512 해시",
    "SHA-1 변환기",
    "파일 체크섬 확인",
    "hash generator",
    "online MD5 generator",
    "SHA256 online",
    "checksum calculator",
    "ハッシュ生成",
    "MD5 変換",
    "SHA-256 変換",
    "Generador de hash",
    "Calcular MD5 SHA256",
    "哈希生成器",
    "MD5 计算",
    "SHA-256 在线计算",
    "Générateur de hash",
    "Calculer SHA256 MD5",
  ],
  openGraph: {
    url: "https://desktools.run/tools/hash-generator/",
    title: "해시 생성기 (MD5 · SHA-1 · SHA-256 · SHA-512) | desktools.run",
    description:
      "텍스트와 파일에서 MD5, SHA-1, SHA-256, SHA-512 암호학적 해시를 브라우저 로컬에서 즉시 계산하고 비교하세요.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-global.jpg",
        width: 1376,
        height: 768,
        alt: "desktools.run — Cryptographic Hash Generator & File Checksum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-global.jpg"],
  },
  alternates: {
    canonical: "https://desktools.run/tools/hash-generator/",
  },
  robots: { index: true, follow: true },
};

const HASH_FAQS = [
  {
    q: "입력한 텍스트나 업로드한 파일이 서버로 전송되나요?",
    a: "전혀 전송되지 않습니다! desktools.run의 모든 해시 계산은 브라우저 내장 WebCrypto API 및 클라이언트 자바스크립트 엔진을 통해 100% 사용자의 기기 내부 메모리에서만 연산됩니다.",
  },
  {
    q: "MD5, SHA-1, SHA-256, SHA-512의 차이점은 무엇인가요?",
    a: "해시 알고리즘별 출력 비트 수와 보안 강도가 다릅니다. MD5(128bit)와 SHA-1(160bit)은 가벼운 파일 체크섬에 주로 쓰이며, 현대 보안 및 암호화 표준으로는 충돌 저항성이 완벽한 SHA-256(256bit)과 SHA-512(512bit)가 권장됩니다.",
  },
  {
    q: "대용량 파일의 체크섬(Checksum)도 계산할 수 있나요?",
    a: "네! 사용자 PC의 브라우저 메모리가 허용하는 한 수백 MB 크기의 설치 파일, ISO 이미지, 문서 파일도 드래그 앤 드롭으로 서버 전송 없이 즉시 체크섬을 검증할 수 있습니다.",
  },
  {
    q: "해시값에서 원본 텍스트를 역으로 복원(복호화)할 수 있나요?",
    a: "불가능합니다. 암호학적 해시 함수는 수학적으로 설계된 단방향 함수(One-way Function)이므로 해시값에서 원본 텍스트를 역산하는 것은 불가능합니다.",
  },
  {
    q: "대문자(Uppercase)와 소문자(Lowercase) 해시는 무엇이 다른가요?",
    a: "해시값 자체의 바이너리 데이터는 동일하며, 16진수(Hexadecimal) 알파벳(A-F) 표기 방식만 다릅니다. 상단의 토글 버튼으로 필요에 따라 자유롭게 변환할 수 있습니다.",
  },
  {
    q: "이 도구는 무료인가요?",
    a: "네, 로그인이나 파일 크기/횟수 제한 없이 영구적으로 100% 무료로 제공됩니다.",
  },
];

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolJsonLd
        title="Cryptographic Hash Generator & Checksum Calculator"
        description="Calculate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for text and files 100% locally."
        toolUrl="https://desktools.run/tools/hash-generator/"
        faqs={HASH_FAQS}
      />
      {children}
    </>
  );
}
