import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
/**
 * Privacy Policy page for Croissant.
 * Explains how user data is handled and protected.
 */
const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation("common");
  return (
    <div className="container" style={{ padding: "30px" }}>
      <h2>{t("privacy.title")}</h2>
      <div className="content">
        <p>{t("privacy.intro")}</p>
        <b>{t("privacy.1")}</b>
        <p className="indent">{t("privacy.1.1")}</p>
        <p className="indent">{t("privacy.1.2")}</p>
        <p className="indent">{t("privacy.1.3")}</p>
        <b>{t("privacy.2")}</b>
        <p className="indent">{t("privacy.2.1")}</p>
        <p className="indent">{t("privacy.2.2")}</p>
        <p className="indent">{t("privacy.2.3")}</p>
        <b>{t("privacy.3")}</b>
        <p className="indent">{t("privacy.3.1")}</p>
        <p className="indent">{t("privacy.3.2")}</p>
        <p className="indent">{t("privacy.3.3")}</p>
        <b>{t("privacy.4")}</b>
        <p className="indent">{t("privacy.4.1")}</p>
        <p className="indent">{t("privacy.4.2")}</p>
        <b>{t("privacy.5")}</b>
        <p className="indent">{t("privacy.5.1")}</p>
        <p className="indent">{t("privacy.5.2")}</p>
        <p className="indent">{t("privacy.5.3")}</p>
        <b>{t("privacy.6")}</b>
        <p className="indent">{t("privacy.6.1")}</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
