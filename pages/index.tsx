import Section from "../components/common/Section/Section";
import ListSection from "../components/common/Section/ListSection";
import React, { useEffect } from "react";
import Link from "next/link";
import useIsMobile from "../hooks/useIsMobile";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default function Home() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { t } = useTranslation("common");

  // Overview details content as an array for easier maintenance
  const overviewDetails = [
    {
      summary: t("index.overview.players.title"),
      content: (
        <ul className="list-disc pl-5 space-y-2 text-[#e2e8f0]">
          <li className="text-[#bdbdbd]">{t("index.overview.players.1")}</li>
          <li>{t("index.overview.players.2")}</li>
          <li>{t("index.overview.players.3")}</li>
          <li>{t("index.overview.players.4")}</li>
          <li>
            <span className="text-red-500">NEW:</span> {t("index.overview.players.5")}
          </li>
        </ul>
      ),
    },
    {
      summary: t("index.overview.creators.title"),
      content: (
        <>
          <ul>
            <li>
              {(() => {
                const text = t("index.overview.creators.1");
                const parts = text.split("SDK or API");
                return (
                  <>
                    {parts[0]}
                    <Link href="/api-docs" className="text-accent hover:text-[#a3b3d6] transition-colors">
                      SDK or API
                    </Link>
                    {parts[1]}
                  </>
                );
              })()}
            </li>
            <li>{t("index.overview.creators.2")}</li>
            <li>{t("index.overview.creators.3")}</li>
            <li>{t("index.overview.creators.4")}</li>
            <li>
              <span className="text-red-500">NEW:</span> {t("index.overview.creators.5")}
            </li>
            <li>
              <span className="text-red-500">NEW:</span> {t("index.overview.creators.6")}
            </li>
          </ul>
          <p className="text-[#bdbdbd] mb-3">
            <span className="font-bold text-[#e2e8f0]">{t("index.overview.creators.getstarted").split(":")[0]}:</span>
          </p>
          <p>
            {
              // Fix: Don't use .replace with a React element, use string splitting and React fragments
              (() => {
                const getStarted = t("index.overview.creators.getstarted");
                const [label, rest] = getStarted.split(":");
                let content = rest || "";
                // Replace "settings" and "documentation" with links
                const parts = content.split(/(settings|documentation)/g);
                return (
                  <>
                    {parts.map((part, idx) => {
                      if (part === "settings") {
                        return (
                          <Link href="/settings" legacyBehavior key={idx}>
                            <a>settings</a>
                          </Link>
                        );
                      }
                      if (part === "documentation") {
                        return (
                          <Link href="/api-docs" legacyBehavior key={idx}>
                            <a>documentation</a>
                          </Link>
                        );
                      }
                      return part;
                    })}
                  </>
                );
              })()
            }
          </p>
        </>
      ),
    },
    {
      summary: t("index.overview.marketplace.title"),
      content: <ListSection title={t("index.overview.marketplace.title")} description={t("index.overview.marketplace.desc")} items={[t("index.overview.marketplace.1"), t("index.overview.marketplace.2"), t("index.overview.marketplace.3"), t("index.overview.marketplace.4")]} />,
    },
    {
      summary: t("index.overview.lobby.title"),
      content: <ListSection title={t("index.overview.lobby.title")} description={t("index.overview.lobby.desc")} items={[t("index.overview.lobby.1"), t("index.overview.lobby.2"), t("index.overview.lobby.3"), t("index.overview.lobby.4")]} />,
    },
    {
      summary: t("index.overview.safety.title"),
      content: (
        <Section title={t("index.overview.safety.title")}>
          <p>{t("index.overview.safety.1")}</p>
        </Section>
      ),
    },
    {
      summary: t("index.overview.oauth2.title"),
      content: (
        <>
          <p>
            {
              // Fix: Don't use .replace with a React element, use string splitting and React fragments
              (() => {
                const oauthText = t("index.overview.oauth2.1");
                const [before, after] = oauthText.split("/oauth2/test");
                return (
                  <>
                    {before}
                    <Link href="/oauth2/test" legacyBehavior>
                      <a>
                        <b>/oauth2/test</b>
                      </a>
                    </Link>
                    {after}
                  </>
                );
              })()
            }
            <br />
            {t("index.overview.oauth2.2")}
          </p>
          <ul>
            <li>{t("index.overview.oauth2.3")}</li>
            <li>{t("index.overview.oauth2.4")}</li>
            <li>{t("index.overview.oauth2.5")}</li>
          </ul>
          <p>
            <b>{t("index.overview.oauth2.try").split(":")[0]}:</b>{" "}
            <Link href="/oauth2/test" legacyBehavior>
              <a>/oauth2/test</a>
            </Link>
          </p>
        </>
      ),
    },
  ];

  // About details content as an array for easier maintenance
  const aboutDetails = [
    {
      summary: t("index.about.whoami.title"),
      content: <p>{t("index.about.whoami.1")}</p>,
    },
    {
      summary: t("index.about.system.title"),
      content: (
        <>
          <p>{t("index.about.system.1")}</p>
          <p>{t("index.about.system.2")}</p>
          <p>{t("index.about.system.3")}</p>
        </>
      ),
    },
    {
      summary: t("index.about.api.title"),
      content: (
        <p>
          {
            // Fix: Don't use .replace with a React element, use string splitting and React fragments
            (() => {
              const apiText = t("index.about.api.1");
              const [before, after] = apiText.split("here");
              return (
                <>
                  {before}
                  <a href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923">
                    <b>here</b>
                  </a>
                  {after}
                </>
              );
            })()
          }
        </p>
      ),
    },
    {
      summary: t("index.about.philosophy.title"),
      content: (
        <>
          <p>{t("index.about.philosophy.1")}</p>
          <p>{t("index.about.philosophy.2")}</p>
        </>
      ),
    },
    {
      summary: t("index.about.gamers.title"),
      content: <p>{t("index.about.gamers.1")}</p>,
    },
    {
      summary: t("index.about.creators.title"),
      content: <p>{t("index.about.creators.1")}</p>,
    },
    {
      summary: t("index.about.simplicity.title"),
      content: <p>{t("index.about.simplicity.1")}</p>,
    },
    {
      summary: t("index.about.future.title"),
      content: <p>{t("index.about.future.1")}</p>,
    },
    {
      summary: t("index.about.community.title"),
      content: <p>{t("index.about.community.1")}</p>,
    },
  ];

  // Version Desktop
  function HomeDesktop() {
    return (
      <>
        <div className="page-container">
          <div className="content-card">
            <h1 className="section-title">
              <span className="method post">{t("index.overview.title")}</span>
            </h1>
            {overviewDetails.map(({ summary, content }) => (
              <details className="details-item" open key={summary}>
                <summary className="details-summary">{summary}</summary>
                {content}
              </details>
            ))}
          </div>
          <div className="content-card">
            <h1 id="about-us" className="section-title">
              <span className="method put">{t("index.about.title")}</span>
            </h1>
            {aboutDetails.map(({ summary, content }) => (
              <details className="details-item" open key={summary}>
                <summary className="details-summary">{summary}</summary>
                {content}
              </details>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Version Mobile
  function HomeMobile() {
    return (
      <>
        <div className="page-container !p-2 !max-w-[1000px]">
          <div className="content-card !p-3 !mt-4 !mx-2">
            <h2 className="section-title !text-[1.1rem]">
              <span className="method post">{t("index.overview.title")}</span>
            </h2>
            {overviewDetails.map(({ summary, content }) => (
              <details className="details-item !mb-3 !p-1 !px-2 !pb-3" open key={summary}>
                <summary className="details-summary !text-base !py-2">{summary}</summary>
                {content}
              </details>
            ))}
          </div>
          <div className="content-card !p-3 !mt-4 !mx-2">
            <h2 id="about-us" className="section-title !text-[1.1rem] !mt-[18px]">
              <span className="method put">{t("index.about.title")}</span>
            </h2>
            {aboutDetails.map(({ summary, content }) => (
              <details className="details-item !mb-3 !p-1 !px-2 !pb-3" open key={summary}>
                <summary className="details-summary !text-base !py-2">{summary}</summary>
                {content}
              </details>
            ))}
          </div>
        </div>
      </>
    );
  }

  useEffect(() => {
    // Fix: check for the cookie "from=app" and redirect if present
    if (typeof document !== "undefined" && document.cookie.includes("from=app")) {
      router.push("/launcher/home");
    }
  }, [router]);

  return isMobile ? <HomeMobile /> : <HomeDesktop />;
}
