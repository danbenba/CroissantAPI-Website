import React, { Component } from "react";
import CachedImage from "../components/utils/CachedImage";
import { withTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
class BuyCredits extends Component<{ t: any }> {
  render(): React.ReactNode {
    const { t } = this.props;
    const tiers = [
      {
        img: "/assets/credits/tier1.avif",
        alt: t("buyCredits.tier1.alt"),
        credits: "200",
        price: "0.99€",
        id: "tier1",
      },
      {
        img: "/assets/credits/tier2.avif",
        alt: t("buyCredits.tier2.alt"),
        credits: "400",
        price: "1.98€",
        id: "tier2",
      },
      {
        img: "/assets/credits/tier3.avif",
        alt: t("buyCredits.tier3.alt"),
        credits: "1000",
        price: "4.95€",
        id: "tier3",
      },
      {
        img: "/assets/credits/tier4.avif",
        alt: t("buyCredits.tier4.alt"),
        credits: "2000",
        price: "9.90€",
        id: "tier4",
      },
    ];
    return (
      <div className="credits-container">
        <h1 className="credits-title">{t("buyCredits.title")}</h1>
        <div className="credits-images">
          {tiers.map((tier) => (
            <div
              key={tier.credits}
              className="credit-tier"
              tabIndex={0}
              onClick={() => {
                fetch(`/api/stripe/checkout?tier=${tier.id}`)
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.url) {
                      location.href = data.url;
                    } else {
                      console.error("Failed to create checkout session");
                    }
                  })
                  .catch((error) => {
                    console.error("Error:", error);
                  });
              }}
            >
              <CachedImage
                src={tier.img}
                alt={tier.alt}
                className="credit-tier-img"
              />
              <div className="credit-tier-credits">
                {tier.credits}{" "}
                <CachedImage
                  src="/assets/credit.avif"
                  className="credit-icon navbar-credit-img"
                  style={{ position: "relative", top: "4px" }}
                />
              </div>
              <div className="credit-tier-price">{tier.price}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withTranslation("common")(BuyCredits);
