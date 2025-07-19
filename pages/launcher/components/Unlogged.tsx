import React, { Component } from "react";

export default class extends Component {
  render() {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#18181b",
          userSelect: "none",
        }}
      >
        <div
          style={{
            background: "#23232a",
            padding: "40px 32px",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "320px",
          }}
        >
          <h1 style={{ color: "#fff", marginBottom: "32px" }}>Login required</h1>
          <button
            style={{
              width: "220px",
              height: "48px",
              background: "#ffb300",
              color: "#222",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "12px",
            }}
            onClick={() => {
              // Redirects to the website login page
              window?.electron?.window?.openEmailLogin?.();
            }}
          >
            Log in on the website
          </button>
        </div>
      </div>
    );
  }
}