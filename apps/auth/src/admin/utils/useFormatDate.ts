/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/utils/useFormatDate.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useWhoAmI } from "../context/whoami/WhoAmI";

export const FORMAT_DATE_AND_TIME: Intl.DateTimeFormatOptions = {
    dateStyle: "long",
    timeStyle: "short"
};

export default function useFormatDate() {
    const { whoAmI } = useWhoAmI();

    return function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
        return date.toLocaleString(whoAmI.locale, options);
    };
}
