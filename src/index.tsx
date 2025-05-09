import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/atom-one-dark.min.css";
import "./styles/main.css";

import App from "./App";

if(document.getElementById("root")) {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}
