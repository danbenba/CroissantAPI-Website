
import React, { useState, useEffect } from "react";

const OAUTH2_SERVER_URL = "/downloadables/oauth2-test-server.js";
const OAUTH2_RESULT_IMG = "/assets/oauth2_result.png";

export default function OAuth2Demo() {
    const [serverCode, setServerCode] = useState<string>("");

    useEffect(() => {
        fetch(OAUTH2_SERVER_URL)
            .then(r => r.text())
            .then(setServerCode);
    }, []);

    return (
        <div style={{
            maxWidth: 900,
            margin: "40px auto",
            background: "#222",
            borderRadius: 18,
            boxShadow: "0 6px 32px rgba(0,0,0,0.45)",
            padding: "40px 32px 32px 32px",
            fontFamily: "Montserrat, Arial, sans-serif",
            color: "#fff",
        }}>
            <h1 style={{ color: "#3a8fdc", fontSize: "2.5rem", marginBottom: 8 }}>Exemple d'intégration OAuth2 Croissant</h1>
            <p style={{ fontSize: "1.15rem", color: "#ccc" }}>
                Voici un exemple minimaliste d'un serveur Node.js permettant de tester l'authentification OAuth2 avec l'API Croissant.<br />
                Téléchargez le script, lancez-le, puis suivez le flux d'authentification pour obtenir les informations utilisateur.
            </p>
            <a
                href={OAUTH2_SERVER_URL}
                download
                style={{
                    display: "inline-block",
                    margin: "1em 0 2em 0",
                    padding: "0.7em 1.5em",
                    background: "#3a8fdc",
                    color: "#fff",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 700,
                    transition: "background 0.2s",
                    border: "1px solid #222",
                    boxShadow: "0 2px 8px rgba(58,143,220,0.08)",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#2563eb")}
                onMouseOut={e => (e.currentTarget.style.background = "#3a8fdc")}
            >
                📥 Télécharger le serveur Node.js d'exemple
            </a>

            <h2 style={{ color: "#fff", fontSize: "1.5rem", marginTop: 32 }}>Démo OAuth2</h2>
            <p style={{ color: "#aaa" }}>1. Lancez le serveur Node.js téléchargé.<br />2. Cliquez sur le bouton ci-dessous pour démarrer l'authentification :</p>
            <button
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 22px",
                    fontSize: "1.1rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#333",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    marginBottom: 24,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                    transition: "background 0.2s",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#444")}
                onMouseOut={e => (e.currentTarget.style.background = "#333")}
                onClick={() => {
                    window.open(
                        window.location.origin + "/oauth2/auth?client_id=2b90be46-3fdb-45f1-98bd-081b70cc3d9f&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcroissant-oauth",
                        "_blank",
                        "width=428,height=238"
                    );
                }}
            >
                <img
                    src="/favicon.png"
                    alt="icon"
                    style={{
                        width: 24,
                        height: 24,
                        verticalAlign: "middle",
                        display: "inline-block",
                        filter: "drop-shadow(0 0 2px #fff)"
                    }}
                />
                <span style={{ verticalAlign: "middle" }}>Connect with OAuth2</span>
            </button>

            {/* <h2 style={{ color: "#fff", fontSize: "1.5rem", marginTop: 32 }}>Code du serveur (oauth2-test-server.js)</h2>
            <pre style={{ background: "#2c2c2c", borderRadius: 8, padding: 18, fontSize: "1.05em", overflowX: "auto", color: "#fff" }}>
                <code style={{ background: "#444", borderRadius: 4, padding: "2px 6px" }}>{serverCode || "Chargement..."}</code>
            </pre> */}

            <h2 style={{ color: "#fff", fontSize: "1.5rem", marginTop: 32 }}>Résultat attendu</h2>
            <img
                src={OAUTH2_RESULT_IMG}
                alt="Résultat attendu de l'authentification OAuth2"
                style={{
                    display: "block",
                    margin: "32px auto 0 auto",
                    maxWidth: "100%",
                    borderRadius: 12,
                    boxShadow: "0 2px 12px rgba(58,143,220,0.08)",
                }}
            />
        </div>
    );
}