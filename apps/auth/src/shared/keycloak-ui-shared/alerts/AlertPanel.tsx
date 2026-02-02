/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/alerts/AlertPanel.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { X } from "@phosphor-icons/react";
import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";

import type { AlertEntry } from "./Alerts";

export type AlertPanelProps = {
    alerts: AlertEntry[];
    onCloseAlert: (id: number) => void;
};

export function AlertPanel({ alerts, onCloseAlert }: AlertPanelProps) {
    return (
        <div
            data-testid="global-alerts"
            className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md"
            style={{ whiteSpace: "pre-wrap" }}
            role="region"
            aria-live="polite"
        >
            {alerts.map(({ id, variant, message, description }, index) => (
                <Alert
                    key={id}
                    data-testid={index === 0 ? "last-alert" : undefined}
                    variant={variant === "danger" ? "destructive" : "default"}
                >
                    <AlertTitle>{message}</AlertTitle>
                    {description && (
                        <AlertDescription>
                            <p>{description}</p>
                        </AlertDescription>
                    )}
                    <AlertAction>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Close"
                            onClick={() => onCloseAlert(id)}
                        >
                            <X size={16} />
                        </Button>
                    </AlertAction>
                </Alert>
            ))}
        </div>
    );
}
