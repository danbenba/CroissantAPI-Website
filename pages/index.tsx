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
  const { t } = useTranslation('common');

  // Overview details content as an array for easier maintenance
  const overviewDetails = [
    {
      summary: t("index.overview.players.title"),
      content: (
        <ul>
          <li>{t("index.overview.players.1")}</li>
          <li>{t("index.overview.players.2")}</li>
          <li>{t("index.overview.players.3")}</li>
          <li>{t("index.overview.players.4")}</li>
          <li>
            <span style={{ color: "red" }}>NEW:</span> {t("index.overview.players.5")}
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
                    <Link href="/api-docs" legacyBehavior>
                      <a>SDK or API</a>
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
              <span style={{ color: "red" }}>NEW:</span> {t("index.overview.creators.5")}
            </li>
            <li>
              <span style={{ color: "red" }}>NEW:</span> {t("index.overview.creators.6")}
            </li>
          </ul>
          <p>
            <b>{t("index.overview.creators.getstarted").split(":")[0]}:</b>{" "}
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
      content: (
        <ListSection
          title={t("index.overview.marketplace.title")}
          description={t("index.overview.marketplace.desc")}
          items={[
            t("index.overview.marketplace.1"),
            t("index.overview.marketplace.2"),
            t("index.overview.marketplace.3"),
            t("index.overview.marketplace.4"),
          ]}
        />
      ),
    },
    {
      summary: t("index.overview.lobby.title"),
      content: (
        <ListSection
          title={t("index.overview.lobby.title")}
          description={t("index.overview.lobby.desc")}
          items={[
            t("index.overview.lobby.1"),
            t("index.overview.lobby.2"),
            t("index.overview.lobby.3"),
            t("index.overview.lobby.4"),
          ]}
        />
      ),
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

  const topSpanStyle: React.CSSProperties = {
    fontSize: 16,
    marginTop: 0,
    marginBottom: 16,
    opacity: 0.7,
    textAlign: "center",
    justifyContent: "center",
    display: "flex",
    flexWrap: "wrap",
    whiteSpace: "normal",
    wordBreak: "break-word",
  };

  // Version Desktop
  function HomeDesktop() {
    const detailsStyle: React.CSSProperties = {
      border: "1px solid #333",
      borderRadius: 8,
      marginBottom: "1.5rem",
      background: "#23272faa",
      boxShadow: "0 2px 8px rgba(0,0,0,0.24)",
      padding: "0.5rem 1.2rem 1rem 1.2rem",
      color: "#f3f3f3",
    };
    const summaryStyle: React.CSSProperties = {
      fontWeight: 600,
      fontSize: "1.15rem",
      cursor: "pointer",
      outline: "none",
      padding: "0.7rem 0",
      color: "#e2e8f0",
    };
    const aboutStyle: React.CSSProperties = {
      border: "1px solid #333",
      borderRadius: 8,
      background: "#181a20aa",
      padding: "1.2rem",
      marginTop: "2rem",
      color: "#f3f3f3",
      marginLeft: "1.5rem",
      marginRight: "1.5rem",
    };

    return (
      <>
        <span style={topSpanStyle}>{t("index.topspan")}</span>
        <div className="container" style={{ margin: "0 auto", padding: "1rem", maxWidth: 1100 }}>
          <h1>
            <span className="method post">{t("index.overview.title")}</span>
          </h1>
          <div style={aboutStyle} className="indent">
            {overviewDetails.map(({ summary, content }) => (
              <details style={detailsStyle} open key={summary}>
                <summary style={summaryStyle}>{summary}</summary>
                {content}
              </details>
            ))}
          </div>
          <h1 id="about-us">
            <span className="method put">{t("index.about.title")}</span>
          </h1>
          <div style={aboutStyle}>
            {aboutDetails.map(({ summary, content }) => (
              <details style={detailsStyle} open key={summary}>
                <summary style={summaryStyle}>{summary}</summary>
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
    const detailsStyle: React.CSSProperties = {
      border: "1px solid #333",
      borderRadius: 8,
      marginBottom: "0.8rem",
      background: "#23272faa",
      padding: "0.3rem 0.5rem 0.7rem 0.5rem",
      color: "#f3f3f3",
    };
    const summaryStyle: React.CSSProperties = {
      fontWeight: 600,
      fontSize: "1rem",
      cursor: "pointer",
      outline: "none",
      padding: "0.5rem 0",
      color: "#e2e8f0",
    };
    const aboutStyle: React.CSSProperties = {
      border: "1px solid #333",
      borderRadius: 8,
      background: "#181a20aa",
      padding: "0.7rem",
      marginTop: "1rem",
      color: "#f3f3f3",
      marginLeft: "0.5rem",
      marginRight: "0.5rem",
    };

    return (
      <>
        <div className="container" style={{ margin: "0 auto", padding: "0.5rem", maxWidth: 1000 }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: 8 }}>
            <span className="method post">{t("index.overview.title")}</span>
          </h2>
          <div style={aboutStyle}>
            {overviewDetails.map(({ summary, content }) => (
              <details style={detailsStyle} open key={summary}>
                <summary style={summaryStyle}>{summary}</summary>
                {content}
              </details>
            ))}
          </div>
          <h2 id="about-us" style={{ fontSize: "1.1rem", marginTop: 18 }}>
            <span className="method put">{t("index.about.title")}</span>
          </h2>
          <div style={aboutStyle}>
            {aboutDetails.map(({ summary, content }) => (
              <details style={detailsStyle} open key={summary}>
                <summary style={summaryStyle}>{summary}</summary>
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
