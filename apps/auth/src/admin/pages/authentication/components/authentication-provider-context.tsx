import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import type { PropsWithChildren } from "react";
import {
    createNamedContext,
    useRequiredContext
} from "../../../../shared/keycloak-ui-shared";
import { useAuthenticationProviders } from "../hooks/use-authentication-providers";

const AuthenticationProviderContext = createNamedContext<
    { providers?: AuthenticationProviderRepresentation[] } | undefined
>("AuthenticationProviderContext", undefined);

export const AuthenticationProviderContextProvider = ({
    children
}: PropsWithChildren) => {
    const { data: providers } = useAuthenticationProviders();

    return (
        <AuthenticationProviderContext.Provider value={{ providers }}>
            {children}
        </AuthenticationProviderContext.Provider>
    );
};

export const useAuthenticationProvider = () =>
    useRequiredContext(AuthenticationProviderContext);
