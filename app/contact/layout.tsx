import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Feedback — desktools.run Support",
  description:
    "Get in touch with the desktools.run team for bug reports, technical inquiries, or general feedback.",
  alternates: {
    canonical: "https://desktools.run/contact/",
  },
  openGraph: {
    title: "Contact Us & Feedback | desktools.run",
    description: "Get in touch with the desktools.run team for bug reports or feedback.",
    url: "https://desktools.run/contact/",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
