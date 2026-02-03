/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/registration/ClientRegistration.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { ClientRegistrationList } from "./ClientRegistrationList";

type ClientRegistrationProps = {
    subTab?: string;
};

export const ClientRegistration = ({ subTab = "anonymous" }: ClientRegistrationProps) => {
    const subType = subTab === "authenticated" ? "authenticated" : "anonymous";

    return <ClientRegistrationList subType={subType} />;
};
