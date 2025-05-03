import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/atom-one-dark.min.css";
import "./styles/main.css";

import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);