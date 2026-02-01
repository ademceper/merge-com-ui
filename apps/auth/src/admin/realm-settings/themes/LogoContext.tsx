/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/themes/LogoContext.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { createNamedContext } from "../../../shared/keycloak-ui-shared";
import { PropsWithChildren, useContext, useState } from "react";

type LogoContextProps = {
    logo: string;
    setLogo: (logo: string) => void;
};

export const LogoPreviewContext = createNamedContext<LogoContextProps | undefined>(
    "LogoContext",
    undefined
);

export const usePreviewLogo = () => useContext(LogoPreviewContext);

export const LogoContext = ({ children }: PropsWithChildren) => {
    const [logo, setLogo] = useState("");

    return (
        <LogoPreviewContext.Provider value={{ logo, setLogo }}>
            {children}
        </LogoPreviewContext.Provider>
    );
};
