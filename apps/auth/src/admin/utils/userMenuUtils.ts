import type { KeycloakTokenParsed } from "oidc-spa/keycloak-js";
import type { TFunction } from "i18next";

export function loggedInUserName(token: KeycloakTokenParsed | undefined, t: TFunction): string {
    if (!token) return t("unknownUser");
    const givenName = token.given_name;
    const familyName = token.family_name;
    const preferredUsername = token.preferred_username;
    if (givenName && familyName) return t("fullName", { givenName, familyName });
    return givenName || familyName || preferredUsername || t("unknownUser");
}

export function avatarInitials(token: KeycloakTokenParsed | undefined): string {
    if (!token) return "?";
    const given = token.given_name?.[0] ?? "";
    const family = token.family_name?.[0] ?? "";
    if (given || family) return `${given}${family}`.toUpperCase();
    const preferred = token.preferred_username?.[0];
    return preferred ? preferred.toUpperCase() : "?";
}

export function userEmailFromToken(token: KeycloakTokenParsed | undefined): string {
    if (!token) return "";
    return (token as { email?: string }).email ?? token.preferred_username ?? "";
}
