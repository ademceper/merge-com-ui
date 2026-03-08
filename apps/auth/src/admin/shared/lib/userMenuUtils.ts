import type { TFunction } from "@merge-rd/i18n";
import type { KeycloakTokenParsed } from "oidc-spa/keycloak-js";

export function loggedInUserName(
    token: KeycloakTokenParsed | undefined,
    t: TFunction
): string {
    if (!token) return t("unknownUser");
    const givenName = token.given_name;
    const familyName = token.family_name;
    const preferredUsername = token.preferred_username;
    if (givenName && familyName) return t("fullName", { givenName, familyName });
    return givenName || familyName || preferredUsername || t("unknownUser");
}

export function avatarInitials(token: KeycloakTokenParsed | undefined): string {
    if (!token) return "?";
    const initial =
        token.given_name?.[0] ?? token.family_name?.[0] ?? token.preferred_username?.[0];
    return initial ? initial.toUpperCase() : "?";
}

export function userEmailFromToken(token: KeycloakTokenParsed | undefined): string {
    if (!token) return "";
    return (token as { email?: string }).email ?? token.preferred_username ?? "";
}
