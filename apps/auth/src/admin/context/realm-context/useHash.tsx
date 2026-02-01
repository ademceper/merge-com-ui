/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/context/realm-context/useHash.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useEffect, useState } from "react";

export const useHash = () => {
    const [hash, setHash] = useState(location.hash);

    useEffect(() => {
        const orgPushState = window.history.pushState;
        window.history.pushState = new Proxy(window.history.pushState, {
            apply: (func, target, args) => {
                const url = new URL(args[2], window.location.origin);
                setHash(url.hash.substring(1));
                return Reflect.apply(func, target, args);
            }
        });
        return () => {
            window.history.pushState = orgPushState;
        };
    }, []);
    return decodeURIComponent(hash);
};
