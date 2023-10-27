import React from "react";
import ReactDOM from "react-dom/client";
import ThemeProvider from "../components/ThemeProvider";

import HomePage from "./HomePage";

const appDiv = ReactDOM.createRoot(document.getElementById("app"));
appDiv.render(
  <React.StrictMode>
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  </React.StrictMode>
);
