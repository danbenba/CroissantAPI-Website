import React, { Component } from "react";

const buyLinks = {
  "200": "https://buy.stripe.com/test_eVqdR9bkqb0L31mgA09Zm00",
  "400": "https://buy.stripe.com/test_7sY4gz2NU5Gr1Xi0B29Zm01",
  "1000": "https://buy.stripe.com/test_6oU9AT9cid8T31m83u9Zm02",
  "2000": "https://buy.stripe.com/test_eVq9ATgEKgl559uerS9Zm03",
}

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
              link: buyLinks["200"],
            },
            {
              img: "/assets/credits/tier2.png",
              alt: "Credit 2",
              credits: "400",
              price: "1.99€",
              link: buyLinks["400"],
            },
            {
              img: "/assets/credits/tier3.png",
              alt: "Credit 3",
              credits: "1000",
              price: "4.99€",
              link: buyLinks["1000"],
            },
            {
              img: "/assets/credits/tier4.png",
              alt: "Credit 4",
              credits: "2000",
              price: "9.99€",
              link: buyLinks["2000"],
            },
          ].map((tier, i) => (
            <div key={tier.credits} className="credit-tier" tabIndex={0} onClick={() => window.open(tier.link, "_blank")}>
              <img src={tier.img} alt={tier.alt} className="credit-tier-img" />
              <div className="credit-tier-credits">
                {tier.credits}{" "}
                <img
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
