import React from "react";

/**
 * Terms of Service page for Croissant.
 * Displays the rules and guidelines for using the platform.
 */
const TermsOfService: React.FC = () => {
  return (
    <div className="container" style={{ padding: "30px", textAlign: "left" }}>
      <h2 style={{ textAlign: "left" }}>Croissant - Terms of Service</h2>
      <div className="content" style={{ textAlign: "left" }}>
        <p>
          Welcome to Croissant! These Terms of Service govern your use of our
          inventory system, including our Discord bot, API, and web interface.
        </p>

        <b>1. Service Usage</b>
        <p className="indent">
          1.1. Our services are provided free of charge and are intended for
          managing virtual items in games.
        </p>
        <p className="indent">
          1.2. You must use our services in accordance with Discord's Terms of
          Service when using our bot.
        </p>

        <b>2. Item Creation and Ownership</b>
        <p className="indent">
          2.1. Users can create and customize their own items using launcher.
        </p>
        <p className="indent">
          2.2. Item creators receive 75% of the sale price when their items are
          sold.
        </p>
        <p className="indent">
          2.3. We reserve the right to remove inappropriate or offensive items.
        </p>

        <b>3. Trading and Transactions</b>
        <p className="indent">
          3.1. All trades must be confirmed by both parties to be completed.
        </p>
        <p className="indent">
          3.2. Users are responsible for verifying trade details before
          confirmation.
        </p>
        <p className="indent">
          3.3. Virtual items and credits have no real-world monetary value.
          Credits can be converted into real life money by contacting us to make
          a cooperation operation.
        </p>

        <b>4. API Usage</b>
        <p className="indent">
          4.1. API keys must be obtained through the /api-key command.
        </p>
        <p className="indent">
          4.2. Developers must ensure secure handling of API keys.
        </p>
        <p className="indent">
          4.3. We reserve the right to revoke API access for misuse.
        </p>

        <b>5. Prohibited Activities</b>
        <p className="indent">
          5.1. Exploiting bugs or vulnerabilities in our systems.
        </p>
        <p className="indent">
          5.2. Creating automated bots to interact with our services.
        </p>
        <p className="indent">
          5.3. Selling or trading items for real-world currency.
        </p>

        <b>6. Service Modifications</b>
        <p className="indent">
          6.1. We may modify or discontinue services at any time.
        </p>
        <p className="indent">
          6.2. Major changes will be announced through our Discord bot.
        </p>

        <h3 style={{ textAlign: "left" }}>Legal Mentions</h3>
        <p className="indent">
          Croissant is published by Fox (fox3000foxy), an independent developer based in France.
          For any questions or requests regarding the site, you can contact us via Discord or by email at the address provided on our official server, <a href="mailto:contact@croissant-api.fr">contact@croissant-api.fr</a>.
          The personal data collected is only used for the proper functioning of the service and is never resold to third parties.
          The site is hosted by Skorpia, an association based in France, whose CEO is Eliott M. For any questions relating to hosting, you can contact Skorpia at <a href="mailto:contact@skorpia.fr">contact@skorpia.fr</a>.
          The host complies with the GDPR.
          Any reproduction, even partial, of the content of the site is prohibited without prior authorization.
        </p>

        <h3 style={{ textAlign: "left" }}>Legal Information (Hosting)</h3>
        <p className="indent">
          <b>General Information</b><br />
          - Association Name: SKORPIA<br />
          - Legal Status: Association loi 1901<br />
          - Registered Office: 2 avenue Pasteur, 76000 Rouen<br />
          - Declaration Number: W142017282<br />
          - Email Address: <a href="mailto:contact@skorpia.fr">contact@skorpia.fr</a><br />
          - Phone Number: +33 782 620 861<br />
          - Director of Publication: Eliot Mafille
        </p>
        <p className="indent">
          <b>Website Hosting</b><br />
          - Host Name: SKORPIA<br />
          - Host Address: 2 avenue Pasteur, 76000 Rouen<br />
          - Host Contact: <a href="mailto:contact@skorpia.fr">contact@skorpia.fr</a>
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
