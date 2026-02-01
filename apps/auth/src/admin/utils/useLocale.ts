/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/utils/useLocale.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useMemo } from "react";
import { useRealm } from "../context/realm-context/RealmContext";
import { DEFAULT_LOCALE } from "../i18n/i18n";

export default function useLocale() {
    const { realmRepresentation: realm } = useRealm();

    const defaultSupportedLocales = useMemo(() => {
        return realm?.supportedLocales?.length
            ? realm.supportedLocales
            : [DEFAULT_LOCALE];
    }, [realm]);

    const defaultLocales = useMemo(() => {
        return realm?.defaultLocale?.length ? [realm.defaultLocale] : [];
    }, [realm]);

    const combinedLocales = useMemo(() => {
        return Array.from(new Set([...defaultLocales, ...defaultSupportedLocales]));
    }, [defaultLocales, defaultSupportedLocales]);

    return combinedLocales;
}
