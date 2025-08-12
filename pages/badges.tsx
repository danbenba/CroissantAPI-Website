import React from "react";
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

/**
 * Badge definitions for display.
 */
const BADGES = [
  {
    key: "early_user",
    label: "Early User",
    icon: faBolt,
    color: "#ff3535ff",
    description: "Awarded to users who registered during the beta period.",
    how: "This badge is no longer awarded. It was reserved for the first members of the community.",
  },
  {
    key: "staff",
    label: "Staff",
    icon: faScrewdriverWrench,
    color: "#7289DA",
    description: "Given to administrators of the official Croissant Discord server.",
    how: "Be a member of the Discord administration team.",
  },
  {
    key: "bug_hunter",
    label: "Bug Hunter",
    icon: faBug,
    color: "#fff200ff",
    description: "Rewards users who reported a security vulnerability or critical bug.",
    how: "Report a security vulnerability or major bug to the Croissant team.",
  },
  {
    key: "contributor",
    label: "Contributor",
    icon: faCodeBranch,
    color: "#7200b8ff",
    description: "Awarded to contributors who participated in Croissant's development.",
    how: "Have a pull request accepted on one of Croissant's GitHub repositories.",
  },
  {
    key: "moderator",
    label: "Moderator",
    icon: faShieldHalved,
    color: "#f2ad58ff",
    description: "Badge reserved for Discord moderators.",
    how: "Be appointed as a moderator on the official Croissant Discord.",
  },
  {
    key: "community_manager",
    label: "Community Manager",
    icon: faUsers,
    color: "#23a548ff",
    description: "Rewards members who help grow the community.",
    how: "Refer a new person who lists you as their sponsor during registration (the sponsor must not be an alternate account).",
  },
  {
    key: "partner",
    label: "Partner",
    icon: faHandshake,
    color: "#677BC4",
    description: "Given to official Croissant partners.",
    how: "Establish an official partnership with Croissant, including a Croissant integration on the partner's site or platform.",
  },
];

const BadgesPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: "30px", textAlign: "left" }}>
      <h2 style={{ textAlign: "left" }}>Croissant - Badges</h2>
      <div className="content" style={{ textAlign: "left" }}>
        <p>
          Badges are special distinctions displayed on your Croissant profile. They reflect your engagement, contributions, or role in the community.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {BADGES.map((badge) => (
            <div
              key={badge.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 18,
                background: "#181a20",
                border: "1px solid #333",
                borderRadius: 8,
                padding: "18px 24px",
                boxShadow: "0 1px 4px 0 rgba(0,0,0,0.12)",
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
                  {badge.label}
                </div>
                <div style={{ margin: "4px 0 8px 0", color: "#f5f6fa" }}>
                  {badge.description}
                </div>
                <div style={{ fontSize: 15, color: "#bdbdbd" }}>
                  <b>How to get it:</b> {badge.how}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32, color: "#888", fontSize: 14 }}>
          Last updated: August 2025
        </div>
      </div>
    </div>
  );
}

export default BadgesPage;