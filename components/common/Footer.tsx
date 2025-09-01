import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";

export default function Footer() {
  const { t } = useTranslation("common");
  const [show, setShow] = useState("");
  const [footerPosition, setFooterPosition] = useState<"relative" | "absolute">(
    "absolute"
  );

  useEffect(() => {
    const checkFooterPosition = () => {
      if (document.body.scrollHeight <= window.innerHeight) {
        setFooterPosition("absolute");
      } else {
        setFooterPosition("relative");
      }

      requestAnimationFrame(checkFooterPosition);
    };

    checkFooterPosition();

    return () => {
      window.removeEventListener("resize", checkFooterPosition);
    };
  }, []);

  const footerLinks = [
    { href: "/tos", label: t("footer.terms") },
    { href: "/privacy", label: t("footer.privacy") },
  ];

  const linkStyle = {
    color: "#8fa1c7",
    textDecoration: "none",
    margin: "0 0.5rem",
  };

  return (
    <footer
      style={{
        display: show,
        width: "100%",
        background: "#191b20",
        color: "#bdbdbd",
        fontSize: "0.92rem",
        textAlign: "center",
        padding: "1.4rem 0 1.2rem 0",
        borderTop: "1px solid #23242a",
        position: footerPosition,
        bottom: 0,
        left: 0,
      }}
    >
      <span style={{ marginRight: 8 }}>{t("footer.copyright")}</span>
      {footerLinks.map((link, idx) => (
        <React.Fragment key={link.href}>
          {idx > 0 && <span style={{ color: "#444" }}>|</span>}
          <Link href={link.href} legacyBehavior>
            <a style={linkStyle}>{link.label}</a>
          </Link>
        </React.Fragment>
      ))}
    </footer>
  );
}
