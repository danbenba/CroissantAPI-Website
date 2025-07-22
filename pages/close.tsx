import React, { Component } from "react";

export default class extends Component {
  render() {
    return (
      <>
        <div
          className="container"
          style={{ padding: "20px", borderRadius: "8px" }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              textAlign: "center",
              margin: "40px 0",
              color: "white",
              letterSpacing: "1px",
            }}
          >
            You can close this page now
          </h1>
        </div>
      </>
    );
  }
}
