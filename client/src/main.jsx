import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "splix-toast",
            success: "splix-toast splix-toast-success",
            error: "splix-toast splix-toast-error"
          },
          duration: 2800
        }}
      />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);
