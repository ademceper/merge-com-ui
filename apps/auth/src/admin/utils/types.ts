/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/utils/types.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

export type ReplaceStringOptions = {
    skipFirst?: boolean;
};

export type ReplaceString<
    Input extends string,
    Search extends string,
    Replacement extends string,
    Options extends ReplaceStringOptions = object
> = Input extends `${infer Head}${Search}${infer Tail}`
    ? Options["skipFirst"] extends true
        ? `${Head}${Search}${ReplaceString<Tail, Search, Replacement>}`
        : `${Head}${Replacement}${ReplaceString<Tail, Search, Replacement>}`
    : Input;
