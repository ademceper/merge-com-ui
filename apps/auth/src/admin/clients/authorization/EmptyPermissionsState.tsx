/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/authorization/EmptyPermissionsState.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@merge/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@merge/ui/components/tooltip";
import { PlusCircle } from "@phosphor-icons/react";

import { PermissionType, toNewPermission } from "../routes/NewPermission";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toUpperCase } from "../../util";

type EmptyButtonProps = {
    permissionType: PermissionType;
    disabled?: boolean;
    clientId: string;
};

const EmptyButton = ({
    permissionType,
    disabled = false,
    clientId
}: EmptyButtonProps) => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    return (
        <Button
            data-testid={`create-${permissionType}`}
            className={disabled ? "keycloak__permissions__empty_state " : "pf-v5-u-m-sm"}
            variant="secondary"
            onClick={() =>
                !disabled &&
                navigate(toNewPermission({ realm, id: clientId, permissionType }))
            }
        >
            {t(`create${toUpperCase(permissionType)}BasedPermission`)}
        </Button>
    );
};

const TooltipEmptyButton = ({ permissionType, disabled, ...props }: EmptyButtonProps) => {
    const { t } = useTranslation();
    return disabled ? (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span>
                        <EmptyButton {...props} disabled={disabled} permissionType={permissionType} />
                    </span>
                </TooltipTrigger>
                <TooltipContent>{t(`no${toUpperCase(permissionType)}CreateHint`)}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ) : (
        <EmptyButton {...props} disabled={disabled} permissionType={permissionType} />
    );
};

type EmptyPermissionsStateProps = {
    clientId: string;
    isResourceEnabled?: boolean;
    isScopeEnabled?: boolean;
};

export const EmptyPermissionsState = ({
    clientId,
    isResourceEnabled,
    isScopeEnabled
}: EmptyPermissionsStateProps) => {
    const { t } = useTranslation();
    return (
        <div data-testid="empty-state" className="flex flex-col items-center justify-center py-12 gap-4">
            <PlusCircle className="size-12 text-muted-foreground" />
            <h1 className="text-xl font-semibold">{t("emptyPermissions")}</h1>
            <p className="text-muted-foreground">{t("emptyPermissionInstructions")}</p>
            <div className="flex flex-col gap-2">
                <TooltipEmptyButton
                    permissionType="resource"
                    disabled={isResourceEnabled}
                    clientId={clientId}
                />
                <TooltipEmptyButton
                    permissionType="scope"
                    disabled={isScopeEnabled}
                    clientId={clientId}
                />
            </div>
        </div>
    );
};
