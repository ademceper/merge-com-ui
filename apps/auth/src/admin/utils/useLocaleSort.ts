/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/utils/useLocaleSort.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useWhoAmI } from "../context/whoami/WhoAmI";

export type ValueMapperFn<T> = (item: T) => string | undefined;

export default function useLocaleSort() {
    const { whoAmI } = useWhoAmI();

    return function localeSort<T>(items: T[], mapperFn: ValueMapperFn<T>): T[] {
        return [...items].sort((a, b) => {
            const valA = mapperFn(a);
            const valB = mapperFn(b);

            if (valA === undefined || valB === undefined) {
                return 0;
            }

            return valA.localeCompare(valB, whoAmI.locale);
        });
    };
}

// TODO: This might be built into TypeScript into future.
// See: https://github.com/microsoft/TypeScript/issues/48992
type KeysMatching<T, V> = {
    [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export const mapByKey =
    <T extends { [_ in K]?: string }, K extends KeysMatching<T, string | undefined>>(
        key: K
    ) =>
    (item: T) =>
        item[key];
