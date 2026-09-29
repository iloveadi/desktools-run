"use client";

import Link from "next/link";
import { Zap, Code2, X, Mail, ArrowUpRight } from "lucide-react";
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
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        marginTop: "auto",
        backgroundColor: "var(--colors-canvas)",
        color: "var(--colors-body)",
        paddingTop: "48px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px 40px",
          display: "grid",
          gridTemplateColumns: "1fr repeat(3, auto)",
          gap: "48px",
        }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div style={{ maxWidth: "300px" }}>
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
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "6px",
                backgroundColor: "var(--colors-canvas-soft)",
                border: "1px solid var(--colors-hairline)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={14} color="var(--colors-primary)" fill="var(--colors-primary)" />
            </div>
            <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--colors-ink-strong)" }}>
              desktools<span style={{ color: "var(--colors-primary)" }}>.run</span>
            </span>
          </Link>

          <p className="body-sm" style={{ color: "var(--colors-mute)", marginBottom: "20px" }}>
            {t("footer.tagline")}
          </p>

          {/* Social / Contact icon links */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { icon: Code2, href: "https://github.com/iloveadi/desktools-run", label: "GitHub", external: true },
              { icon: Mail,  href: "/contact", label: "Contact", external: false },
            ].map(({ icon: Icon, href, label, external }) => {
              const content = (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    backgroundColor: "var(--colors-canvas-soft)",
                    border: "1px solid var(--colors-hairline)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--colors-body)",
                    transition: "border-color 0.15s ease, color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--colors-primary)";
                    e.currentTarget.style.color = "var(--colors-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--colors-hairline)";
                    e.currentTarget.style.color = "var(--colors-body)";
                  }}
                >
                  <Icon size={14} />
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

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([sectionTitle, links]) => (
          <div key={sectionTitle}>
            <p
              className="eyebrow-mono font-mono"
              style={{
                fontSize: "12px",
                letterSpacing: "1.5px",
                marginBottom: "16px",
                color: "var(--colors-ink-strong)",
              }}
            >
              {sectionTitle}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    style={{
                      fontSize: "13.5px",
                      color: "var(--colors-body)",
                      textDecoration: "none",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--colors-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--colors-body)")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Dashed divider */}
      <div className="dashed-divider" />

      {/* Bottom Legal / Copyright Row */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
        className="footer-bottom-row"
      >
        <span className="caption font-mono" style={{ color: "var(--colors-mute)", lineHeight: "18px", wordBreak: "break-word" }}>
          &copy; {year} desktools.run &middot; Zero server upload, 100% in-browser.
        </span>

        <span className="caption font-mono" style={{ color: "var(--colors-mute)", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--colors-primary)" }} />
          ALL SYSTEMS OPERATIONAL
        </span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
          .footer-bottom-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding-bottom: 76px !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
      `}</style>
    </footer>
  );
}
