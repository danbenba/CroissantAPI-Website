import React from "react";
import Link from "next/link";
import useIsMobile from "../hooks/useIsMobile";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

function NotFoundDesktop({ t }) {
  return (
    <main>
      <div className="container" style={{ maxWidth: 600, margin: "48px auto", padding: 32 }}>
        <h2 style={{ fontSize: "2.2em", marginBottom: 12 }}>{t("404.title.desktop")}</h2>
        <div className="indent" style={{ marginBottom: 18 }}>
          <p>{t("404.desc1.desktop")}</p>
          <p>{t("404.desc2.desktop")}</p>
        </div>
        <h3 style={{ marginBottom: 8 }}>{t("404.whatcan.desktop")}</h3>
        <div className="indent">
          <p>{t("404.try.desktop")}</p>
          <ul>
            <li>
              <Link href="/" legacyBehavior>
                <a>{t("404.home")}</a>
              </Link>
            </li>
            <li>
              <Link href="/contact" legacyBehavior>
                <a>{t("404.contact")}</a>
              </Link>
            </li>
            <li>
              <Link href="/api-docs" legacyBehavior>
                <a>{t("404.api")}</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

function NotFoundMobile({ t }) {
  return (
    <main>
      <div
        className="container"
        style={{
          maxWidth: 340,
          margin: "32px auto",
          padding: "18px 8px",
          borderRadius: 12,
          background: "#23272e",
          color: "#fff",
          boxShadow: "0 2px 12px #0002",
          fontSize: "1em",
        }}
      >
        <h2 style={{ fontSize: "1.2em", marginBottom: 10, textAlign: "center" }}>
          {t("404.title.mobile")}
        </h2>
        <div className="indent" style={{ marginBottom: 12 }}>
          <p style={{ marginBottom: 6 }}>{t("404.desc1.mobile")}</p>
          <p style={{ marginBottom: 0 }}>{t("404.desc2.mobile")}</p>
        </div>
        <div className="indent" style={{ marginTop: 10 }}>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li style={{ marginBottom: 6 }}>
              <Link href="/" legacyBehavior>
                <a style={{ color: "#fff", textDecoration: "underline" }}>{t("404.home")}</a>
              </Link>
            </li>
            <li style={{ marginBottom: 6 }}>
              <Link href="/contact" legacyBehavior>
                <a style={{ color: "#fff", textDecoration: "underline" }}>{t("404.contact")}</a>
              </Link>
            </li>
            <li>
              <Link href="/api-docs" legacyBehavior>
                <a style={{ color: "#fff", textDecoration: "underline" }}>{t("404.api.mobile")}</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function NotFoundPage() {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  return isMobile ? <NotFoundMobile t={t} /> : <NotFoundDesktop t={t} />;
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}