/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/components/AuthenticationProviderContext.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import {
    createNamedContext,
    useFetch,
    useRequiredContext
} from "../../../shared/keycloak-ui-shared";
import { PropsWithChildren, useState } from "react";
import { useAdminClient } from "../../admin-client";

export const AuthenticationProviderContext = createNamedContext<
    { providers?: AuthenticationProviderRepresentation[] } | undefined
>("AuthenticationProviderContext", undefined);

export const AuthenticationProviderContextProvider = ({
    children
}: PropsWithChildren) => {
    const { adminClient } = useAdminClient();
    const [providers, setProviders] = useState<AuthenticationProviderRepresentation[]>();

    useFetch(
        async () =>
            Promise.all([
                adminClient.authenticationManagement.getClientAuthenticatorProviders(),
                adminClient.authenticationManagement.getFormActionProviders(),
                adminClient.authenticationManagement.getAuthenticatorProviders()
            ]),
        providers => setProviders(providers.flat()),
        []
    );

    return (
        <AuthenticationProviderContext.Provider value={{ providers }}>
            {children}
        </AuthenticationProviderContext.Provider>
    );
};

export const useAuthenticationProvider = () =>
    useRequiredContext(AuthenticationProviderContext);
