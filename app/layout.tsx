import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/context/LocaleContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "desktools.run — 무료 웹 유틸리티",
  description:
    "PDF, 이미지, 텍스트, 개발자 도구를 회원가입 없이 브라우저에서 100% 무료로 실행하는 웹 유틸리티 모음.",
  keywords: [
    "웹 유틸리티", "온라인 도구", "PDF 합치기", "이미지 리사이즈",
    "글자수 세기", "개발자 도구", "desktools", "무료 유틸리티",
  ],
  authors: [{ name: "desktools.run" }],
  openGraph: {
    title: "desktools.run — 무료 웹 유틸리티",
    description: "PDF, 이미지, 텍스트, 개발자 도구를 회원가입 없이 브라우저에서 100% 무료로 실행하세요.",
    type: "website",
    siteName: "desktools.run",
  },
  robots: { index: true, follow: true },
  verification: {
    other: {
      "naver-site-verification": "78cc45882494368515599712d3cbe77cb0321e65",
      "google-site-verification": "h6rIrI3xMIgonXn1PDKk5T5FHzgHbXtiOpgut4AtuZM",
    },
  },
};

// Inline script: runs before React hydration to prevent flash of wrong theme & language
const initScript = `
  (function() {
    try {
      var savedTheme = localStorage.getItem('desktools-theme');
      var theme = savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(theme);

      var savedLocale = localStorage.getItem('desktools-locale');
      if (savedLocale) {
        document.documentElement.lang = savedLocale;
      } else {
        var langs = navigator.languages || [navigator.language || navigator.userLanguage];
        var detected = 'en';
        for (var i = 0; i < langs.length; i++) {
          if (!langs[i]) continue;
          var l = langs[i].toLowerCase();
          if (l.indexOf('ko') === 0) { detected = 'ko'; break; }
          if (l.indexOf('ja') === 0) { detected = 'ja'; break; }
          if (l.indexOf('zh') === 0) { detected = 'zh'; break; }
          if (l.indexOf('es') === 0) { detected = 'es'; break; }
          if (l.indexOf('fr') === 0) { detected = 'fr'; break; }
          if (l.indexOf('en') === 0) { detected = 'en'; break; }
        }
        document.documentElement.lang = detected;
      }
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="78cc45882494368515599712d3cbe77cb0321e65" />
        <meta name="google-site-verification" content="h6rIrI3xMIgonXn1PDKk5T5FHzgHbXtiOpgut4AtuZM" />
        {/* Anti-flash theme & locale script — must run before any CSS paints */}
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
