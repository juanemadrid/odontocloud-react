// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";

const BASENAME =
  import.meta.env.BASE_URL?.replace(/\/+$/, "") || "/odontocloud-react";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter basename={BASENAME}>
      <App />
    </HashRouter>
  </React.StrictMode>
);
