import React, { Component } from "react";
import CachedImage from "../components/utils/CachedImage";

export default class extends Component {
  render(): React.ReactNode {
    return (
      <div className="credits-container">
        <h1 className="credits-title">Buy Credits</h1>
        <div className="credits-images">
          {[
            {
              img: "/assets/credits/tier1.png",
              alt: "Credit 1",
              credits: "200",
              price: "0.99€",
              id: "tier1",
            },
            {
              img: "/assets/credits/tier2.png",
              alt: "Credit 2",
              credits: "400",
              price: "1.98€",
              id: "tier2",
            },
            {
              img: "/assets/credits/tier3.png",
              alt: "Credit 3",
              credits: "1000",
              price: "4.95€",
              id: "tier3",
            },
            {
              img: "/assets/credits/tier4.png",
              alt: "Credit 4",
              credits: "2000",
              price: "9.90€",
              id: "tier4",
            },
          ].map((tier, i) => (
            <div key={tier.credits} className="credit-tier" tabIndex={0} onClick={() => {
              fetch(`/api/stripe/checkout?tier=${tier.id}`)
                .then(response => response.json())
                .then(data => {
                  if (data.url) {
                    location.href = data.url;
                  } else {
                    console.error("Failed to create checkout session");
                  }
                })
                .catch(error => {
                  console.error("Error:", error);
                });
            }}>
              <CachedImage src={tier.img} alt={tier.alt} className="credit-tier-img" />
              <div className="credit-tier-credits">
                {tier.credits}{" "}
                <CachedImage
                  src="/assets/credit.png"
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
