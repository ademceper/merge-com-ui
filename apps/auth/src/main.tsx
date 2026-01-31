import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "@merge/ui/globals.css"
import { Providers } from "@merge/ui/components/providers";
import { KcPage } from "./kc.gen";

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
