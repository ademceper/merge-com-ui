/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/utils/useAccountAlerts.ts" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ApiError } from "../api/parse-response";

type AlertVariant = "success" | "danger" | "warning" | "info" | "default";

type AlertEntry = {
    id: number;
    message: string;
    variant: AlertVariant;
    description?: string;
};

let alertIdCounter = 0;
const alertListeners: Set<(alert: AlertEntry) => void> = new Set();

function broadcastAlert(alert: AlertEntry) {
    alertListeners.forEach(listener => listener(alert));
}

export function useAlertListener(onAlert: (alert: AlertEntry) => void) {
    // Components can use this to listen for alerts
    useState(() => {
        alertListeners.add(onAlert);
        return () => alertListeners.delete(onAlert);
    });
}

export function useAccountAlerts() {
    const { t } = useTranslation();

    const addAlert = useCallback(
        (message: string, variant: AlertVariant | string = "success", description?: string) => {
            broadcastAlert({
                id: ++alertIdCounter,
                message,
                variant: variant as AlertVariant,
                description
            });
        },
        []
    );

    const addError = useCallback(
        (messageKey: string, error: unknown) => {
            if (error instanceof ApiError) {
                const message = t(messageKey, { error: error.message });
                addAlert(message, "danger", error.description);
                return;
            }
            const message = t(messageKey, {
                error: error instanceof Error ? error.message : error
            });
            addAlert(message, "danger");
        },
        [addAlert, t]
    );

    return useMemo(
        () => ({ addAlert, addError }),
        [addAlert, addError]
    );
}
