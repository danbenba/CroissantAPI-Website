import React, { useState } from "react";
import { useTranslation } from "next-i18next";

/**
 * Terms of Service page for Croissant.
 * Displays the rules and guidelines for using the platform.
 */
const TermsOfService: React.FC = () => {
  const [openFr, setOpenFr] = useState(false);
  const [openEn, setOpenEn] = useState(false);
  const { t } = useTranslation("common");

  return (
    <div className="container" style={{ padding: "30px", textAlign: "left" }}>
      <h2 style={{ textAlign: "left" }}>{t("tos.title")}</h2>
      <div className="content" style={{ textAlign: "left" }}>
        <p>{t("tos.intro")}</p>
        <b>{t("tos.1")}</b>
        <p className="indent">{t("tos.1.1")}</p>
        <p className="indent">{t("tos.1.2")}</p>
        <b>{t("tos.2")}</b>
        <p className="indent">{t("tos.2.1")}</p>
        <p className="indent">{t("tos.2.2")}</p>
        <p className="indent">{t("tos.2.3")}</p>
        <b>{t("tos.3")}</b>
        <p className="indent">{t("tos.3.1")}</p>
        <p className="indent">{t("tos.3.2")}</p>
        <p className="indent">{t("tos.3.3")}</p>
        <b>{t("tos.4")}</b>
        <p className="indent">{t("tos.4.1")}</p>
        <p className="indent">{t("tos.4.2")}</p>
        <p className="indent">{t("tos.4.3")}</p>
        <b>{t("tos.5")}</b>
        <p className="indent">{t("tos.5.1")}</p>
        <p className="indent">{t("tos.5.2")}</p>
        <p className="indent">{t("tos.5.3")}</p>
        <b>{t("tos.6")}</b>
        <p className="indent">{t("tos.6.1")}</p>
        <p className="indent">{t("tos.6.2")}</p>
        <h3 style={{ textAlign: "left" }}>{t("tos.legalMentions")}</h3>

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
