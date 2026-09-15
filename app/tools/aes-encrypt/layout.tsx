import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AES 텍스트 암호화 / 복호화기 (AES-256) — 무료 보안 도구 | desktools.run",
  description:
    "비밀번호를 설정하여 중요한 텍스트, 계좌번호, API 키를 AES-256 군사급 암호문으로 안전하게 암호화하고 복호화하세요. 서버 전송 없는 100% 브라우저 WebCrypto 로컬 암호화.",
  keywords: [
    "AES 암호화",
    "AES 복호화",
    "AES-256",
    "AES GCM 암호화",
    "텍스트 암호화",
    "비밀번호 암호화",
    "AES encrypt decrypt",
    "온라인 AES 암호화기",
    "무료 AES 암호화",
    "AES encryption online",
    "AES decrypt online",
    "AES 256 encryptor",
    "AES 暗号化",
    "AES 復号化",
    "Cifrado AES 256",
    "Descifrado AES",
    "AES 文本加密",
    "AES 解密工具",
    "Chiffrement AES 256",
    "Déchiffrement AES",
  ],
  openGraph: {
    url: "https://desktools.run/tools/aes-encrypt/",
    title: "AES-256 텍스트 암호화 & 복호화기 | desktools.run",
    description:
      "중요한 비밀 메시지와 API 키를 군사급 AES-256 표준으로 100% 브라우저 로컬에서 안전하게 암호화하고 복호화하세요.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-global.jpg",
        width: 1376,
        height: 768,
        alt: "desktools.run — AES Text Encryptor & Decryptor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-global.jpg"],
  },
  alternates: {
    canonical: "https://desktools.run/tools/aes-encrypt/",
  },
  robots: { index: true, follow: true },
};

const AES_FAQS = [
  {
    q: "제가 입력한 텍스트나 비밀번호가 서버로 전송되나요?",
    a: "전혀 전송되지 않습니다. desktools.run의 모든 암호화 및 복호화 연산은 브라우저 내장 표준 WebCrypto API를 통해 100% 사용자의 기기 메모리에서만 로컬로 실행됩니다.",
  },
  {
    q: "AES-256 암호화는 얼마나 안전한가요?",
    a: "AES-256(고급 암호화 표준 256비트)은 미국 정부, 군사 기관, 글로벌 금융기관에서 기밀 데이터 보호에 사용하는 최고 등급 대칭키 암호화 표준입니다. 올바른 비밀번호 없이 무차별 대입(Brute-force)으로 해킹하는 것은 물리적으로 불가능합니다.",
  },
  {
    q: "AES-GCM과 AES-CBC 모드의 차이점은 무엇인가요?",
    a: "AES-GCM은 암호화와 동시에 데이터 변조 여부를 검증하는 인증 암호화(AEAD) 모드로 현대 웹 환경에서 가장 권장되는 최고 보안 모드입니다. AES-CBC는 전통적인 블록 암호화 표준으로 호환성이 뛰어납니다.",
  },
  {
    q: "비밀번호(비밀키)를 분실하면 복구할 수 있나요?",
    a: "아닙니다. 백도어나 마스터키가 없는 암호학적 수학 알고리즘을 사용하므로, 설정한 비밀번호가 없으면 원 작성자나 서비스 관리자도 복구할 수 없습니다. 비밀번호를 안전한 곳에 별도 보관하세요.",
  },
  {
    q: "PBKDF2 키 유도 함수는 어떤 역할을 하나요?",
    a: "사용자가 입력한 비밀번호 문자열을 SHA-256 해시와 16바이트 무작위 솔트(Salt)를 결합하여 100,000회 반복 연산함으로써 레인보우 테이블 공격 및 GPU 기반 해킹 시도를 원천 차단합니다.",
  },
  {
    q: "모바일 기기나 오프라인 환경에서도 사용할 수 있나요?",
    a: "네! WebCrypto API를 지원하는 모든 최신 스마트폰, 태블릿 및 PC 브라우저에서 인터넷 연결 없이도 안전하게 작동합니다.",
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
        title="AES Text Encrypt & Decrypt Tool (AES-256)"
        description="Securely encrypt and decrypt sensitive text, passwords, and API keys with military-grade AES-256 WebCrypto."
        toolUrl="https://desktools.run/tools/aes-encrypt/"
        faqs={AES_FAQS}
      />
      {children}
    </>
  );
}
