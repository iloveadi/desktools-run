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
    <footer style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "auto", background: "var(--footer-bg)" }}>
      <div
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "56px 24px 40px", display: "grid", gridTemplateColumns: "1fr repeat(3, auto)", gap: "48px" }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div style={{ maxWidth: "280px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "12px" }} aria-label="desktools.run home">
            <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={13} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-0.3px" }}>
              <span className="gradient-text">desktools</span>
              <span style={{ color: "var(--text-secondary)", marginLeft: "1px" }}>.run</span>
            </span>
          </Link>

          <p style={{ fontSize: "13.5px", lineHeight: "1.7", color: "var(--text-muted)", marginBottom: "20px" }}>
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
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(99,102,241,0.15)";
                    el.style.color = "#a5b4fc";
                    el.style.borderColor = "rgba(99,102,241,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(255,255,255,0.05)";
                    el.style.color = "var(--text-muted)";
                    el.style.borderColor = "rgba(255,255,255,0.07)";
                  }}
                >
                  <Icon size={16} />
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
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "14px" }}>
              {title}
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    style={{ fontSize: "13.5px", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.15s", display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 0" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#a5b4fc"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
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

      {/* Copyright bar with subtle secret admin entrance dot */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", maxWidth: "1280px", margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
          © {year} desktools.run — {t("footer.copyright")}
          {/* Secret discreet link on period '.' */}
          <Link
            href="/admin/requests"
            style={{ color: "inherit", textDecoration: "none", cursor: "default" }}
            title="desktools admin"
          >
            .
          </Link>
        </p>
        <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
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
