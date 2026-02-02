/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/permission-evaluation/PermissionEvaluationResult.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import PolicyEvaluationResponse from "@keycloak/keycloak-admin-client/lib/defs/policyEvaluationResponse";
import { useMemo } from "react";
import { Alert, AlertTitle, AlertDescription } from "@merge/ui/components/alert";
import { useTranslation } from "react-i18next";
import { sortBy } from "lodash-es";

type PermissionEvaluationResultProps = {
    evaluateResult: PolicyEvaluationResponse;
};

export const PermissionEvaluationResult = ({
    evaluateResult
}: PermissionEvaluationResultProps) => {
    const { t } = useTranslation();
    const evaluatedResults = evaluateResult?.results || [];
    const evaluatedResult = evaluatedResults[0] || {};
    const alertTitle =
        evaluatedResult?.resource?.name ?? t("permissionEvaluationAlertTitle");
    const alertVariant = evaluateResult?.status === "PERMIT" ? "success" : "warning";

    const evaluatedAllowedScopes = useMemo(
        () => sortBy(evaluatedResult?.allowedScopes || [], "name"),
        [evaluatedResult]
    );
    const evaluatedDeniedScopes = useMemo(
        () => sortBy(evaluatedResult?.deniedScopes || [], "name"),
        [evaluatedResult]
    );
    const evaluatedPolicies = useMemo(
        () => sortBy(evaluatedResult?.policies || [], "name"),
        [evaluatedResult]
    );

    const evaluatedPermission = function (title: string, status: string) {
        const permissions = evaluatedPolicies.filter(p => p.status === status);

        if (permissions.length == 0) {
            return;
        }

        return (
            <>
                <p className="pt-2">
                    <strong>{t(title)}</strong>:
                </p>
                <ul className="mt-2 list-disc pl-4">
                    {permissions.map(p => (
                        <li key={p.policy?.id}>
                            {t("evaluatedPolicy", {
                                name: p.policy?.name,
                                status: p.status
                            })}
                        </li>
                    ))}
                </ul>
            </>
        );
    };

    return (
        <Alert variant={alertVariant === "success" ? "default" : "destructive"}>
            <AlertTitle>{alertTitle}</AlertTitle>
            <AlertDescription>
            {evaluatedAllowedScopes.length > 0 && (
                <>
                    <p>
                        <b>{t("grantedScope")}</b>
                    </p>
                    <ul className="mt-2 list-disc pl-4">
                        {evaluatedAllowedScopes.map(scope => (
                            <li key={scope.id}>{scope.name}</li>
                        ))}
                    </ul>
                </>
            )}

            {evaluatedDeniedScopes.length > 0 && (
                <>
                    <p className="pt-2">
                        <strong>{t("deniedScope")}</strong>
                    </p>

                    <ul className="mt-2 list-disc pl-4">
                        {evaluatedDeniedScopes.map(scope => (
                            <li key={scope.id}>{scope.name}</li>
                        ))}
                    </ul>
                </>
            )}

            {evaluatedPermission("grantedPermissions", "PERMIT")}
            {evaluatedPermission("deniedPermissions", "DENY")}
            </AlertDescription>
        </Alert>
    );
};
