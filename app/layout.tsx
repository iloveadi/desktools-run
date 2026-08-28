import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/context/LocaleContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import AdSenseLoader from "@/components/common/AdSenseLoader";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import AdminShortcut from "@/components/common/AdminShortcut";
import FloatingScrollButtons from "@/components/common/FloatingScrollButtons";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://desktools.run"),
  title: "desktools.run — 무료 웹 유틸리티",
  description:
    "PDF, 이미지, 텍스트, 개발자 도구를 회원가입 없이 브라우저에서 100% 무료로 실행하는 웹 유틸리티 모음.",
  keywords: [
    "웹 유틸리티", "온라인 도구", "PDF 합치기", "이미지 리사이즈",
    "글자수 세기", "개발자 도구", "desktools", "무료 유틸리티",
  ],
  authors: [{ name: "desktools.run" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "desktools.run — 무료 웹 유틸리티",
    description: "PDF, 이미지, 텍스트, 개발자 도구를 회원가입 없이 브라우저에서 100% 무료로 실행하세요.",
    url: "https://desktools.run",
    type: "website",
    siteName: "desktools.run",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "desktools.run logo",
      },
    ],
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
        var detected = 'ko';
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
    <html lang="ko" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="78cc45882494368515599712d3cbe77cb0321e65" />
        <meta name="google-site-verification" content="h6rIrI3xMIgonXn1PDKk5T5FHzgHbXtiOpgut4AtuZM" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://desktools.run/#website",
                  "url": "https://desktools.run/",
                  "name": "desktools.run",
                  "description": "PDF, 이미지, 텍스트, 개발자 도구를 회원가입 없이 브라우저에서 100% 무료로 실행하는 웹 유틸리티 모음.",
                  "inLanguage": "ko"
                },
                {
                  "@type": "Organization",
                  "@id": "https://desktools.run/#organization",
                  "name": "desktools.run",
                  "url": "https://desktools.run/",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://desktools.run/icon-512.png",
                    "width": 512,
                    "height": 512
                  }
                },
                {
                  "@type": "WebApplication",
                  "@id": "https://desktools.run/#webapp",
                  "url": "https://desktools.run/",
                  "name": "desktools.run",
                  "applicationCategory": "UtilitiesApplication",
                  "operatingSystem": "All",
                  "browserRequirements": "Requires JavaScript. Requires HTML5.",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  }
                }
              ]
            })
          }}
        />
        {/* Anti-flash theme & locale script — must run before any CSS paints */}
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <AdSenseLoader />
        <GoogleAnalytics />
        <AdminShortcut />
        <FloatingScrollButtons />
        <ThemeProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

