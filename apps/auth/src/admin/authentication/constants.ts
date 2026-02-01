/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/constants.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";

type UsedBy = "SPECIFIC_CLIENTS" | "SPECIFIC_PROVIDERS" | "DEFAULT";

export type AuthenticationType = AuthenticationFlowRepresentation & {
    usedBy?: { type?: UsedBy; values: string[] };
    realm: RealmRepresentation;
};

export const REALM_FLOWS = new Map<string, string>([
    ["browserFlow", "browser"],
    ["registrationFlow", "registration"],
    ["directGrantFlow", "direct grant"],
    ["resetCredentialsFlow", "reset credentials"],
    ["clientAuthenticationFlow", "clients"],
    ["dockerAuthenticationFlow", "docker auth"],
    ["firstBrokerLoginFlow", "firstBrokerLogin"]
]);
