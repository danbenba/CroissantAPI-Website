import React from "react";
import CachedImage from "../components/utils/CachedImage";
import useIsMobile from "../hooks/useIsMobile";
import { useTranslation, Trans } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
function DownloadLauncherDesktop() {
  const { t } = useTranslation("common");
  return (
    <div
      className="container"
      style={{
        padding: "20px",
        backgroundColor: "#3c3c3cee",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <h1 id="about-us">
        <span className="method put">{t("downloadLauncher.title")}</span>
      </h1>
      <p>{t("downloadLauncher.instructions")}</p>
      <ol>
        <li>
          <Trans
            i18nKey="downloadLauncher.step1"
            components={{
              link: (
                <a
                  href="https://github.com/croissant-API/Launcher/releases/"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </li>
        <li>{t("downloadLauncher.step2")}</li>
        <li>{t("downloadLauncher.step3")}</li>
        <li>{t("downloadLauncher.step4")}</li>
      </ol>
      <p>{t("downloadLauncher.description.desktop")}</p>
      <CachedImage
        src="/assets/launcher.png"
        alt="Croissant Launcher Screenshot"
        style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
      />
    </div>
  );
}

function DownloadLauncherMobile() {
  const { t } = useTranslation("common");
  return (
    <div
      className="container"
      style={{
        padding: "10px",
        backgroundColor: "#3c3c3cee",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        maxWidth: 420,
        margin: "0 auto",
        fontSize: "0.98em",
      }}
    >
      <h2 id="about-us" style={{ fontSize: "1.1em" }}>
        <span className="method put">{t("downloadLauncher.title")}</span>
      </h2>
      <p>
        <b>{t("downloadLauncher.note")}</b>
      </p>
      <p>{t("downloadLauncher.instructions")}</p>
      <ol>
        <li>
          <Trans
            i18nKey="downloadLauncher.step1"
            components={{
              link: (
                <a
                  href="https://github.com/croissant-API/Launcher/releases/"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </li>
        <li>{t("downloadLauncher.step2")}</li>
        <li>{t("downloadLauncher.step3.windows")}</li>
        <li>{t("downloadLauncher.step4")}</li>
      </ol>
      <p>{t("downloadLauncher.description.mobile")}</p>
      <CachedImage
        src="/assets/launcher.png"
        alt="Croissant Launcher Screenshot"
        style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
      />
    </div>
  );
}

export default function DownloadLauncher() {
  const isMobile = useIsMobile();
  return isMobile ? <DownloadLauncherMobile /> : <DownloadLauncherDesktop />;
}
