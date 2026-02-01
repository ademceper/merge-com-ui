/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/utils/useToggle.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useCallback, useState } from "react";

/**
 * A hook that allows you toggle a boolean value, useful for toggle buttons, showing and hiding modals, etc.
 *
 * @param initialValue The initial value to use, false by default.
 */
export default function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue);
    const toggleValue = useCallback(() => setValue(val => !val), []);

    return [value, toggleValue, setValue] as const;
}
