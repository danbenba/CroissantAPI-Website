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

  return (
    <footer
      className={`w-full bg-primary text-[#bdbdbd] text-[0.92rem] text-center py-[1.4rem] px-0 border-t border-secondary ${
        footerPosition === "absolute" ? "absolute bottom-0 left-0" : "relative"
      }`}
      style={{ display: show }}
    >
      <span className="mr-2">{t("footer.copyright")}</span>
      {footerLinks.map((link, idx) => (
        <React.Fragment key={link.href}>
          {idx > 0 && <span className="text-[#444]">|</span>}
          <Link
            href={link.href}
            className="text-accent no-underline mx-2 hover:text-[#a3b3d6] transition-colors"
          >
            {link.label}
          </Link>
        </React.Fragment>
      ))}
    </footer>
  );
}
