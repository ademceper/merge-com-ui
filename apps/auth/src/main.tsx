import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { KcPage } from "./kc.gen";
import { Providers } from "@merge/ui/components/providers";
import "@merge/ui/globals.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Providers>
            {!window.kcContext ? (
                <h1>No Keycloak Context</h1>
            ) : (
                <KcPage kcContext={window.kcContext} />
            )}
        </Providers>
    </StrictMode>
);
