/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/utils/useUpdateEffect.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { DependencyList, EffectCallback, useEffect, useRef } from "react";

/**
 * A `useEffect` hook that only triggers on updates, not on initial render.
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
    const didMount = useRef(false);

    useEffect(() => {
        if (didMount.current) {
            return effect();
        }

        didMount.current = true;
    }, deps);
}
