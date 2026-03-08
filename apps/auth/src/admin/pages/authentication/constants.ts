import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";

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
