/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/alerts/Alerts.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { PropsWithChildren, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { toast } from "@merge/ui/components/sonner";
import { createNamedContext } from "../utils/createNamedContext";
import { getErrorDescription, getErrorMessage } from "../utils/errors";
import { useRequiredContext } from "../utils/useRequiredContext";

export const AlertVariant = {
    success: "success",
    danger: "danger",
    warning: "warning",
    info: "info",
} as const;
export type AlertVariantType = (typeof AlertVariant)[keyof typeof AlertVariant];

export type AddAlertFunction = (
    message: string,
    variant?: AlertVariantType,
    description?: string
) => void;

export type AddErrorFunction = (messageKey: string, error: unknown) => void;

export type AlertProps = {
    addAlert: AddAlertFunction;
    addError: AddErrorFunction;
};

const AlertContext = createNamedContext<AlertProps | undefined>(
    "AlertContext",
    undefined
);

export const useAlerts = () => useRequiredContext(AlertContext);

export type AlertEntry = {
    id: number;
    message: string;
    variant: AlertVariantType;
    description?: string;
};

export const AlertProvider = ({ children }: PropsWithChildren) => {
    const { t } = useTranslation();

    const addAlert = useCallback<AddAlertFunction>(
        (message, variant = "success", description) => {
            const options = description ? { description } : undefined;
            switch (variant) {
                case "danger":
                    toast.error(message, options);
                    break;
                case "warning":
                    toast.warning(message, options);
                    break;
                case "info":
                    toast.info(message, options);
                    break;
                default:
                    toast.success(message, options);
            }
        },
        []
    );

    const addError = useCallback<AddErrorFunction>(
        (messageKey, error) => {
            const message = t(messageKey, { error: getErrorMessage(error) });
            const description = getErrorDescription(error);

            addAlert(message, "danger", description);
        },
        [addAlert, t]
    );

    const value = useMemo(() => ({ addAlert, addError }), [addAlert, addError]);

    return (
        <AlertContext.Provider value={value}>
            {children}
        </AlertContext.Provider>
    );
};
