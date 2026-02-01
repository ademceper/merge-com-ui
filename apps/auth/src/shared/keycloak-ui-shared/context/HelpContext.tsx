/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/context/HelpContext.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { PropsWithChildren } from "react";
import { createNamedContext } from "../utils/createNamedContext";
import { useRequiredContext } from "../utils/useRequiredContext";
import { useStoredState } from "../utils/useStoredState";

type HelpContextProps = {
    enabled: boolean;
    toggleHelp: () => void;
};

export const HelpContext = createNamedContext<HelpContextProps | undefined>(
    "HelpContext",
    undefined
);

export const useHelp = () => useRequiredContext(HelpContext);

export const Help = ({ children }: PropsWithChildren) => {
    const [enabled, setHelp] = useStoredState(localStorage, "helpEnabled", true);

    function toggleHelp() {
        setHelp(!enabled);
    }

    return (
        <HelpContext.Provider value={{ enabled, toggleHelp }}>
            {children}
        </HelpContext.Provider>
    );
};
