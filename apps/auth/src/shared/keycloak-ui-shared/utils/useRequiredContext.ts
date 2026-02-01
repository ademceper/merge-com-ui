/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/utils/useRequiredContext.ts"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { Context } from "react";
import { useContext } from "react";
import { isDefined } from "./isDefined";

/**
 * Passes the call to `useContext` and throw an exception if the resolved value is either `null` or `undefined`.
 * Can be used for contexts that are required and should always have a non nullable value.
 *
 * @param context The context to pass to `useContext`
 * @returns
 */
export function useRequiredContext<T>(context: Context<T>): NonNullable<T> {
    const resolved = useContext(context);

    if (isDefined(resolved)) {
        return resolved;
    }

    throw new Error(
        `No provider found for ${
            context.displayName ? `the '${context.displayName}'` : "an unknown"
        } context, make sure it is included in your component hierarchy.`
    );
}
