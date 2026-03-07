import { KeycloakProvider } from "../../shared/keycloak-ui-shared";

import { App } from "./app";
import { environment } from "./environment";

export const Root = () => (
    <KeycloakProvider environment={environment}>
        <App />
    </KeycloakProvider>
);
