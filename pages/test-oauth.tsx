
import React, { Component } from "react";

export default class extends Component {
    componentDidMount() {
        // document.title = "Page not found | Croissant";
    }
    render(): React.ReactNode {
        return (
            <button
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    fontSize: "1rem",
                    borderRadius: "6px",
                    border: "none",
                    background: "#333",
                    color: "#fff",
                    cursor: "pointer",
                }}
                onClick={() => {
                    window.open(
                        "http://localhost:8580/oauth2/auth?client_id=2b90be46-3fdb-45f1-98bd-081b70cc3d9f&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcroissant-oauth",
                        "_blank",
                        "width=428,height=238"
                    );
                }}
            >
                <img
                    src="http://localhost:8580/favicon.png"
                    alt="icon"
                    style={{
                        width: "20px",
                        height: "20px",
                        verticalAlign: "middle",
                        display: "inline-block",
                    }}
                />
                <span style={{ verticalAlign: "middle" }}>Connect with OAuth2</span>
            </button>
        );
    }
}