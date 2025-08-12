import React, { useState } from "react";

/**
 * Terms of Service page for Croissant.
 * Displays the rules and guidelines for using the platform.
 */
const TermsOfService: React.FC = () => {
  const [openFr, setOpenFr] = useState(false);
  const [openEn, setOpenEn] = useState(false);

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

        <h3 style={{ textAlign: "left" }}>Mentions légales / Legal Mentions</h3>

        {/* Dropdown Français */}
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => setOpenFr((v) => !v)}
            style={{
              background: "#23272f",
              color: "#f5f6fa",
              border: "1px solid #444",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px",
              marginBottom: "5px",
              transition: "background 0.2s",
            }}
          >
            {openFr ? "▼" : "►"} Mentions légales (Français)
          </button>
          {openFr && (
            <div
              style={{
                padding: "10px 20px",
                background: "#181a20",
                color: "#f5f6fa",
                border: "1px solid #333",
                borderRadius: "4px",
              }}
            >
              <p className="indent">
                Croissant est édité par Fox (fox3000foxy), développeur indépendant
                basé en France. Pour toute question ou demande concernant le site,
                vous pouvez nous contacter via Discord ou par email à l'adresse
                indiquée sur notre serveur officiel,{" "}
                <a href="mailto:contact@croissant-api.fr">contact@croissant-api.fr</a>
                .
                <br />
                Les données personnelles collectées sont uniquement utilisées pour le
                bon fonctionnement du service et ne sont jamais revendues à des
                tiers.
                <br />
                Le site est hébergé par Skorpia, une association basée en France,
                dont le président est Eliott M. Pour toute question relative à
                l'hébergement, vous pouvez contacter Skorpia à{" "}
                <a href="mailto:contact@skorpia.fr">contact@skorpia.fr</a>.
                <br />
                L'hébergeur est conforme au RGPD.
                <br />
                Aucun cookie tiers n'est utilisé sur ce site.
                <br />
                Toute reproduction, même partielle, du contenu du site est interdite
                sans autorisation préalable.
              </p>
              <p className="indent">
                <b>Informations légales (Hébergement)</b>
                <br />
                - Nom de l'association : SKORPIA
                <br />
                - Statut juridique : Association loi 1901
                <br />
                - Siège social : 2 avenue Pasteur, 76000 Rouen
                <br />
                - Numéro de déclaration : W142017282
                <br />
                - Adresse email :{" "}
                <a href="mailto:contact@skorpia.fr">contact@skorpia.fr</a>
                <br />
                - Numéro de téléphone : +33 782 620 861
                <br />
                - Directeur de la publication : Eliot Mafille
                <br />
                <b>Hébergement du site</b>
                <br />
                - Nom de l'hébergeur : SKORPIA
                <br />
                - Adresse de l'hébergeur : 2 avenue Pasteur, 76000 Rouen
                <br />
                - Contact hébergeur :{" "}
                <a href="mailto:contact@skorpia.fr">contact@skorpia.fr</a>
              </p>
            </div>
          )}
        </div>

        {/* Dropdown English */}
        <div>
          <button
            onClick={() => setOpenEn((v) => !v)}
            style={{
              background: "#23272f",
              color: "#f5f6fa",
              border: "1px solid #444",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px",
              marginBottom: "5px",
              transition: "background 0.2s",
            }}
          >
            {openEn ? "▼" : "►"} Legal Mentions (English)
          </button>
          {openEn && (
            <div
              style={{
                padding: "10px 20px",
                background: "#181a20",
                color: "#f5f6fa",
                border: "1px solid #333",
                borderRadius: "4px",
              }}
            >
              <p className="indent">
                Croissant is published by Fox (fox3000foxy), an independent
                developer based in France. For any questions or requests regarding
                the site, you can contact us via Discord or by email at the address
                provided on our official server,{" "}
                <a href="mailto:contact@croissant-api.fr">contact@croissant-api.fr</a>
                .
                <br />
                The personal data collected is only used for the proper functioning
                of the service and is never resold to third parties.
                <br />
                The site is hosted by Skorpia, an association based in France, whose
                CEO is Eliott M. For any questions relating to hosting, you can
                contact Skorpia at{" "}
                <a href="mailto:contact@skorpia.fr">contact@skorpia.fr</a>.
                <br />
                The host complies with the GDPR.
                <br />
                No third-party cookies are used on this site.
                <br />
                Any reproduction, even partial, of the content of the site is
                prohibited without prior authorization.
              </p>
              <p className="indent">
                <b>Legal Information (Hosting)</b>
                <br />
                - Association Name: SKORPIA
                <br />
                - Legal Status: Association loi 1901
                <br />
                - Registered Office: 2 avenue Pasteur, 76000 Rouen
                <br />
                - Declaration Number: W142017282
                <br />
                - Email Address:{" "}
                <a href="mailto:contact@skorpia.fr">contact@skorpia.fr</a>
                <br />
                - Phone Number: +33 782 620 861
                <br />
                - Director of Publication: Eliot Mafille
                <br />
                <b>Website Hosting</b>
                <br />
                - Host Name: SKORPIA
                <br />
                - Host Address: 2 avenue Pasteur, 76000 Rouen
                <br />
                - Host Contact:{" "}
                <a href="mailto:contact@skorpia.fr">contact@skorpia.fr</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
