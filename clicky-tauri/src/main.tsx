import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Overlay from "./Overlay";

const isOverlay = window.location.search.includes("overlay=true");

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {isOverlay ? <Overlay /> : <App />}
  </React.StrictMode>,
);
