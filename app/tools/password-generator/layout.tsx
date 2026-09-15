import ToolJsonLd from "@/components/common/ToolJsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "비밀번호 생성기 — 강력한 랜덤 비밀번호 무료 생성 | desktools.run",
  description:
    "대소문자, 숫자, 특수문자를 포함한 강력한 무작위 비밀번호를 브라우저에서 즉시 생성하세요. 암호 강도(엔트로피) 측정기, 대량 생성, 100% 암호학적 난수(WebCrypto) 로컬 보안.",
  keywords: [
    "비밀번호 생성기",
    "랜덤 비밀번호 생성기",
    "강력한 비밀번호",
    "암호 생성기",
    "비밀번호 만들기",
    "password generator",
    "secure password generator",
    "random password maker",
    "암호 강도 측정",
    "パスワード生成",
    "パスワード作成",
    "Generador de contraseñas",
    "Contraseñas seguras",
    "密码生成器",
    "随机密码",
    "Générateur de mot de passe",
    "Mot de passe sécurisé",
  ],
  openGraph: {
    url: "https://desktools.run/tools/password-generator/",
    title: "비밀번호 생성기 — 강력한 랜덤 비밀번호 무료 생성 | desktools.run",
    description:
      "암호학적 난수(WebCrypto API)를 기반으로 해킹이 불가능한 강력한 무작위 비밀번호를 100% 브라우저 로컬에서 즉시 생성하세요.",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/og-global.jpg",
        width: 1376,
        height: 768,
        alt: "desktools.run — Strong Random Password Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-global.jpg"],
  },
  alternates: {
    canonical: "https://desktools.run/tools/password-generator/",
  },
  robots: { index: true, follow: true },
};

const PASSWORD_FAQS = [
  {
    q: "생성된 비밀번호가 서버로 전송되거나 저장되나요?",
    a: "아닙니다! 모든 비밀번호는 브라우저의 window.crypto.getRandomValues API를 통해 100% 사용자의 기기 메모리 내에서만 생성되며 서버에 일절 전송되거나 보관되지 않습니다.",
  },
  {
    q: "Web Cryptography API 기반이란 무슨 뜻인가요?",
    a: "일반 무작위 함수(Math.random)와 달리 암호학적으로 안전한 의사 난수 생성기(CSPRNG)를 사용하여 공격자가 난수 발생 패턴을 예측할 수 없도록 보장하는 암호학 표준 API입니다.",
  },
  {
    q: "안전한 비밀번호 길이의 기준은 무엇인가요?",
    a: "대소문자, 숫자, 특수문자가 모두 혼합된 최소 16자 이상(엔트로피 80bits 이상)의 비밀번호 사용을 적극 권장합니다. 현대 GPU 클러스터로도 16자 이상 무작위 암호는 해독에 수천 년이 걸립니다.",
  },
  {
    q: "유사 문자(0, O, 1, l, I) 제외 옵션은 왜 필요한가요?",
    a: "숫자 0과 알파벳 대문자 O, 소문자 l과 대문자 I 등 화면에서 육안으로 구분하기 어려운 문자를 배제하여 키보드로 직접 입력할 때의 오타를 방지하기 위함입니다.",
  },
  {
    q: "비밀번호 엔트로피(Entropy)는 무엇을 의미하나요?",
    a: "비밀번호의 무작위성과 예측 불가능성을 비트(bits) 단위로 측정한 지표입니다. 엔트로피가 80비트 이상이면 무차별 대입 공격에 대해 매우 강력한 보안을 가집니다.",
  },
  {
    q: "여러 개의 비밀번호를 한 번에 생성할 수 있나요?",
    a: "네! 하단의 '대량 비밀번호 생성(Bulk Passwords)' 목록을 통해 한 번에 여러 개의 무작위 비밀번호 후보군을 확인하고 원하는 비밀번호를 개별 복사할 수 있습니다.",
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
        title="Strong Random Password Generator"
        description="Generate strong, cryptographically secure random passwords with entropy strength estimation."
        toolUrl="https://desktools.run/tools/password-generator/"
        faqs={PASSWORD_FAQS}
      />
      {children}
    </>
  );
}
