import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench, faShieldHalved, faUsers, faBolt, faBug, faCodeBranch, faHandshake } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

interface Badge {
  key: string;
  icon: any;
  color: string;
  hoverColor?: string;
}

const BADGES: Badge[] = [
  {
    key: "early_user",
    icon: faBolt,
    color: "#ff3535",
    hoverColor: "#ff4545",
  },
  {
    key: "staff",
    icon: faScrewdriverWrench,
    color: "#7289DA",
    hoverColor: "#8299EA",
  },
  {
    key: "bug_hunter",
    icon: faBug,
    color: "#fff200",
    hoverColor: "#fff555",
  },
  {
    key: "contributor",
    icon: faCodeBranch,
    color: "#7200b8",
    hoverColor: "#8210c8",
  },
  {
    key: "moderator",
    icon: faShieldHalved,
    color: "#f2ad58",
    hoverColor: "#f2bd68",
  },
  {
    key: "community_manager",
    icon: faUsers,
    color: "#23a548",
    hoverColor: "#33b558",
  },
  {
    key: "partner",
    icon: faHandshake,
    color: "#677BC4",
    hoverColor: "#778BD4",
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
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-6">{t("badges.title")}</h1>

      <div className="text-gray-300 mb-8">
        <p className="text-lg">{t("badges.intro")}</p>
      </div>

      <div className="space-y-6">
        {BADGES.map((badge) => {
          const isHighlighted = highlighted === badge.key;
          return (
            <div
              key={badge.key}
              id={badge.key}
              className={`
                flex items-start gap-5 rounded-xl p-6 shadow-md transition-all duration-200
                ${isHighlighted ? "bg-[#2d2300] border-2 border-[#ffe066]" : "bg-[#181a20] border border-[#333] hover:bg-[#1c1e24]"}
              `}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg shrink-0" style={{ backgroundColor: `${badge.color}22` }}>
                <FontAwesomeIcon icon={badge.icon} className="text-3xl" style={{ color: badge.color }} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold" style={{ color: badge.color }}>
                  {t(`badges.${badge.key}.label`)}
                </h2>

                <p className="text-gray-200">{t(`badges.${badge.key}.description`)}</p>

                <div className="text-sm text-gray-400">
                  <span className="font-semibold">{t("badges.howtogetit")}</span>
                  &nbsp;{t(`badges.${badge.key}.how`)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-sm text-gray-500">{t("badges.lastUpdated")}</div>
    </div>
  );
};

export default BadgesPage;
