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
    <div className="page-container">
      <div className="content-card max-w-[85vw] text-left">
        <h1 id="about-us" className="section-title">
          <span className="method put">{t("downloadLauncher.title")}</span>
        </h1>
        <p className="text-[#e2e8f0] mb-4">{t("downloadLauncher.instructions")}</p>
        <ol className="list-decimal list-inside space-y-2 mb-4 text-[#bdbdbd]">
          <li>
            <Trans
              i18nKey="downloadLauncher.step1"
              components={{
                link: (
                  <a
                    href="https://github.com/croissant-API/Launcher/releases/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-[#a3b3d6] transition-colors"
                  />
                ),
              }}
            />
          </li>
          <li>{t("downloadLauncher.step2")}</li>
          <li>{t("downloadLauncher.step3")}</li>
          <li>{t("downloadLauncher.step4")}</li>
        </ol>
        <p className="text-[#e2e8f0] mb-4">{t("downloadLauncher.description.desktop")}</p>
        <CachedImage
          src="/assets/launcher.png"
          alt="Croissant Launcher Screenshot"
          className="w-full h-auto rounded-lg"
        />
      </div>
    </div>
  );
}

function DownloadLauncherMobile() {
  const { t } = useTranslation("common");
  return (
    <div className="page-container !p-2">
      <div className="content-card !p-3 !mt-4 !mx-2 max-w-[85vw] text-left">
        <h2 className="section-title !text-[1.1rem]">
          <span className="method put">{t("downloadLauncher.title")}</span>
        </h2>
        <p className="font-bold mb-4 text-[#e2e8f0]">{t("downloadLauncher.note")}</p>
        {/* <p className="text-[#bdbdbd] mb-4">{t("downloadLauncher.instructions")}</p>
        <ol className="list-decimal list-inside space-y-2 mb-4 text-[#bdbdbd]">
          <li>
            <Trans
              i18nKey="downloadLauncher.step1"
              components={{
                link: (
                  <a
                    href="https://github.com/croissant-API/Launcher/releases/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-[#a3b3d6] transition-colors"
                  />
                ),
              }}
            />
          </li>
          <li>{t("downloadLauncher.step2")}</li>
          <li>{t("downloadLauncher.step3.windows")}</li>
          <li>{t("downloadLauncher.step4")}</li>
        </ol>
        <p className="text-[#e2e8f0] mb-4">{t("downloadLauncher.description.mobile")}</p>
        <CachedImage
          src="/assets/launcher.png"
          alt="Croissant Launcher Screenshot"
          className="w-full h-auto rounded-lg"
        /> */}
      </div>
    </div>
  );
}

export default function DownloadLauncher() {
  const isMobile = useIsMobile();
  return isMobile ? <DownloadLauncherMobile /> : <DownloadLauncherDesktop />;
}
