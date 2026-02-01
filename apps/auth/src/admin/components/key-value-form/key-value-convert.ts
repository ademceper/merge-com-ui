/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/key-value-form/key-value-convert.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Path, PathValue } from "react-hook-form";

export type KeyValueType = { key: string; value: string };

export function keyValueToArray(attributeArray: KeyValueType[] = []) {
    const validAttributes = attributeArray.filter(({ key }) => key !== "");
    const result: Record<string, string[]> = {};

    for (const { key, value } of validAttributes) {
        if (key in result) {
            result[key].push(value);
        } else {
            result[key] = [value];
        }
    }

    return result;
}

export function arrayToKeyValue<T>(attributes: Record<string, string[]> = {}) {
    const result = Object.entries(attributes).flatMap(([key, value]) =>
        value.map<KeyValueType>(value => ({ key, value }))
    );

    return result as PathValue<T, Path<T>>;
}
