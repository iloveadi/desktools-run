import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Feedback — desktools.run Support",
  description:
    "Get in touch with the desktools.run team for bug reports, technical inquiries, and feature suggestions. We respond within 24-48 hours.",
  alternates: {
    canonical: "https://desktools.run/contact/",
  },
  openGraph: {
    title: "Contact Us & Feedback | desktools.run",
    description: "Get in touch with the desktools.run team for bug reports or feedback.",
    url: "https://desktools.run/contact/",
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
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
