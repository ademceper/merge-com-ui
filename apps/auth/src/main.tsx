import { Providers } from "@merge-rd/ui/components/providers";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { KcPage } from "./kc.gen";
import "@merge-rd/ui/globals.css";

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
