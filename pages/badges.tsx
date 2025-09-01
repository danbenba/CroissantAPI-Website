import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faScrewdriverWrench,
  faShieldHalved,
  faUsers,
  faBolt,
  faBug,
  faCodeBranch,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "next-i18next";

const BADGES = [
  {
    key: "early_user",
    icon: faBolt,
    color: "#ff3535ff",
  },
  {
    key: "staff",
    icon: faScrewdriverWrench,
    color: "#7289DA",
  },
  {
    key: "bug_hunter",
    icon: faBug,
    color: "#fff200ff",
  },
  {
    key: "contributor",
    icon: faCodeBranch,
    color: "#7200b8ff",
  },
  {
    key: "moderator",
    icon: faShieldHalved,
    color: "#f2ad58ff",
  },
  {
    key: "community_manager",
    icon: faUsers,
    color: "#23a548ff",
  },
  {
    key: "partner",
    icon: faHandshake,
    color: "#677BC4",
  },
];

const BadgesPage: React.FC = () => {
  const { t } = useTranslation("common");
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    const updateHighlight = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash.replace(/^#/, "");
        setHighlighted(hash || null);
      }
    };
    updateHighlight();
    window.addEventListener("hashchange", updateHighlight);
    return () => window.removeEventListener("hashchange", updateHighlight);
  }, []);

  return (
    <div className="container" style={{ padding: "30px", textAlign: "left" }}>
      <h2 style={{ textAlign: "left" }}>{t("badges.title")}</h2>
      <div className="content" style={{ textAlign: "left" }}>
        <p>{t("badges.intro")}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {BADGES.map((badge) => {
            const isHighlighted = highlighted === badge.key;
            return (
              <div
                key={badge.key}
                id={badge.key}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 18,
                  background: isHighlighted ? "#2d2300" : "#181a20",
                  border: isHighlighted ? "2px solid #ffe066" : "1px solid #333",
                  borderRadius: 8,
                  padding: "18px 24px",
                  boxShadow: "0 1px 4px 0 rgba(0,0,0,0.12)",
                  transition: "background 0.2s, border 0.2s",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 48,
                    minHeight: 48,
                    borderRadius: 8,
                    background: badge.color + "22",
                    marginRight: 8,
                  }}
                >
                  <FontAwesomeIcon
                    icon={badge.icon}
                    color={badge.color}
                    style={{ fontSize: 32 }}
                    fixedWidth
                  />
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 20, color: badge.color }}>
                    {t(`badges.${badge.key}.label`)}
                  </div>
                  <div style={{ margin: "4px 0 8px 0", color: "#f5f6fa" }}>
                    {t(`badges.${badge.key}.description`)}
                  </div>
                  <div style={{ fontSize: 15, color: "#bdbdbd" }}>
                    <b>{t("badges.howtogetit")}</b> {t(`badges.${badge.key}.how`)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 32, color: "#888", fontSize: 14 }}>
          {t("badges.lastUpdated")}
        </div>
      </div>
    </div>
  );
};

export default BadgesPage;