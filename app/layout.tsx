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
  title: "desktools.run — Fast & Lightweight Web Utilities",
  description:
    "Run powerful web utilities instantly in your browser. No install required. PDF tools, image editing, text processing, developer tools and more — all free.",
  keywords: [
    "web utilities", "online tools", "PDF tools", "image resizer",
    "text tools", "developer tools", "free online tools", "browser tools",
  ],
  authors: [{ name: "desktools.run" }],
  openGraph: {
    title: "desktools.run — Fast & Lightweight Web Utilities",
    description: "Run powerful web utilities instantly in your browser. No install required.",
    type: "website",
    siteName: "desktools.run",
  },
  robots: { index: true, follow: true },
};

// Inline script: runs before React hydration to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('desktools-theme');
      var theme = saved === 'light' || saved === 'dark'
        ? saved
        : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(theme);
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Anti-flash theme script — must run before any CSS paints */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
