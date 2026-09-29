"use client";

import Link from "next/link";
import { Zap, Code2, X, Mail, ExternalLink } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";

export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  const FOOTER_LINKS = {
    [t("footer.nav.product")]: [
      { label: t("footer.links.allTools"),  href: "/tools" },
      { label: t("footer.links.changelog"), href: "/changelog" },
    ],
    [t("footer.nav.company")]: [
      { label: t("footer.links.about"),   href: "/about" },
      { label: t("footer.links.blog"),    href: "/blog" },
      { label: t("footer.links.request"), href: "/request" },
      { label: t("footer.links.status"),  href: "/status" },
    ],
    [t("footer.nav.legal")]: [
      { label: t("footer.links.privacy"),  href: "/privacy" },
      { label: t("footer.links.terms"),    href: "/terms" },
      { label: t("footer.links.cookies"),  href: "/cookies" },
      { label: t("footer.links.contact"),  href: "/contact" },
    ],
  };

  return (
    <footer
      style={{
        borderTop: "1px solid var(--colors-hairline)",
        marginTop: "auto",
        backgroundColor: "var(--footer-bg)",
        color: "var(--colors-ink-muted-80)",
        paddingTop: "64px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px 48px",
          display: "grid",
          gridTemplateColumns: "1fr repeat(3, auto)",
          gap: "48px",
        }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div style={{ maxWidth: "280px" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              marginBottom: "12px",
            }}
            aria-label="desktools.run home"
          >
            <Zap size={18} color="#0066cc" fill="#0066cc" />
            <span style={{ fontSize: "17px", fontWeight: 600, color: "var(--colors-ink)" }}>
              desktools.run
            </span>
          </Link>

          <p className="apple-caption" style={{ color: "var(--colors-ink-muted-80)", marginBottom: "20px" }}>
            {t("footer.tagline")}
          </p>

          {/* Social / Contact icon links */}
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              { icon: Code2, href: "https://github.com", label: "GitHub", external: true },
              { icon: X,     href: "https://x.com",      label: "X",      external: true },
              { icon: Mail,  href: "/contact",           label: "Contact", external: false },
            ].map(({ icon: Icon, href, label, external }) => {
              const content = (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "9999px",
                    backgroundColor: "var(--colors-surface-pearl)",
                    border: "1px solid var(--colors-hairline)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--colors-ink-muted-80)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <Icon size={15} />
                </div>
              );

              return external ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{ textDecoration: "none" }}
                >
                  {content}
                </a>
              ) : (
                <Link key={label} href={href} aria-label={label} style={{ textDecoration: "none" }}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Link columns — relaxed 2.41 leading per design.md */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--colors-ink)",
                marginBottom: "12px",
                letterSpacing: "-0.224px",
              }}
            >
              {title}
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" }}>
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="apple-dense-link"
                    style={{
                      color: "var(--colors-ink-muted-80)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--colors-primary)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--colors-ink-muted-80)"; }}
                  >
                    {label}
                    {href.startsWith("http") && <ExternalLink size={10} style={{ opacity: 0.5 }} />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Legal fine-print bar */}
      <div
        style={{
          borderTop: "1px solid var(--colors-hairline)",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <p style={{ fontSize: "12px", color: "var(--colors-ink-muted-48)" }}>
          © {year} desktools.run — {t("footer.copyright")}
        </p>
        <p style={{ fontSize: "12px", color: "var(--colors-ink-muted-48)" }}>
          {t("footer.privacy")}
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .footer-grid > div:first-child { grid-column: 1 / -1; max-width: 100% !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

