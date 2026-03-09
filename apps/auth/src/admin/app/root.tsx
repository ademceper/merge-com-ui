import { Outlet } from "@tanstack/react-router";
import { KeycloakProvider } from "@/shared/keycloak-ui-shared";
import { environment } from "./environment";

export const Root = () => (
    <KeycloakProvider environment={environment}>
        <Outlet />
    </KeycloakProvider>
);
