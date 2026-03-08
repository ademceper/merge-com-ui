import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@merge-rd/ui/components/tooltip";
import { PlusCircle } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { toUpperCase } from "../../../shared/lib/util";
import { type PermissionType, toNewPermission } from "../../../shared/lib/routes/clients";

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
                navigate({
                    to: toNewPermission({ realm, id: clientId, permissionType }) as string
                })
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
                        <EmptyButton
                            {...props}
                            disabled={disabled}
                            permissionType={permissionType}
                        />
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    {t(`no${toUpperCase(permissionType)}CreateHint`)}
                </TooltipContent>
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
        <div
            data-testid="empty-state"
            className="flex flex-col items-center justify-center py-12 gap-4"
        >
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
