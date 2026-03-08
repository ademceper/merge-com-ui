import type { ManagementPermissionReference } from "@keycloak/keycloak-admin-client/lib/defs/managementPermissionReference";
import { Trans, useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@merge-rd/ui/components/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Label } from "@merge-rd/ui/components/label";
import { Switch } from "@merge-rd/ui/components/switch";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/admin/shared/ui/data-table";
import { HelpItem, KeycloakSpinner } from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { usePermissions } from "../../api/use-permissions";
import { toPermissionDetails } from "../../lib/route-helpers";
import useLocaleSort from "../../lib/useLocaleSort";
import { useConfirmDialog } from "../confirm-dialog/confirm-dialog";

type PermissionScreenType =
    | "clients"
    | "users"
    | "groups"
    | "roles"
    | "identityProviders";

type PermissionsTabProps = {
    id?: string;
    type: PermissionScreenType;
};

export const PermissionsTab = ({ id, type }: PermissionsTabProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const [permission, setPermission] = useState<ManagementPermissionReference>();
    const localeSort = useLocaleSort();

    const { data: permissionsData } = usePermissions(id, type);
    const realmId = permissionsData?.realmId ?? "";
    useEffect(() => {
        if (permissionsData) setPermission(permissionsData.permission);
    }, [permissionsData]);

    const togglePermissionEnabled = (enabled: boolean) => {
        switch (type) {
            case "clients":
                return adminClient.clients.updateFineGrainPermission(
                    { id: id! },
                    { enabled }
                );
            case "users":
                return adminClient.realms.updateUsersManagementPermissions({
                    realm,
                    enabled
                });
            case "groups":
                return adminClient.groups.updatePermission({ id: id! }, { enabled });
            case "roles":
                return adminClient.roles.updatePermission({ id: id! }, { enabled });
            case "identityProviders":
                return adminClient.identityProviders.updatePermission(
                    { alias: id! },
                    { enabled }
                );
        }
    };

    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "permissionsDisable",
        messageKey: "permissionsDisableConfirm",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            const permission = await togglePermissionEnabled(false);
            setPermission(permission);
        }
    });

    if (!permission) {
        return <KeycloakSpinner />;
    }

    return (
        <div className="bg-muted/30 p-4">
            <DisableConfirm />
            <Card>
                <CardHeader>
                    <CardTitle>{t("permissions")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {t(`${type}PermissionsHint`)}
                    <div className="pt-4 permission-label">
                        <Label
                            htmlFor="permissionsEnabled"
                            className="flex items-center gap-1"
                        >
                            {t("permissionsEnabled")}
                            <HelpItem
                                helpText={t("permissionsEnabledHelp")}
                                fieldLabelId="permissionsEnabled"
                            />
                        </Label>
                        <div className="flex items-center gap-2 pt-2">
                            <Switch
                                id="permissionsEnabled"
                                data-testid="permissionSwitch"
                                checked={permission.enabled}
                                onCheckedChange={async enabled => {
                                    if (enabled) {
                                        const perm =
                                            await togglePermissionEnabled(enabled);
                                        setPermission(perm);
                                    } else {
                                        toggleDisableDialog();
                                    }
                                }}
                                aria-label={t("permissionsEnabled")}
                            />
                            <span className="text-sm text-muted-foreground">
                                {permission.enabled ? t("on") : t("off")}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {permission.enabled && (
                <>
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>{t("permissionsList")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Trans i18nKey="permissionsListIntro">
                                {" "}
                                <strong>
                                    {{
                                        realm:
                                            realm === "master"
                                                ? "master-realm"
                                                : "realm-management"
                                    }}
                                </strong>
                                .
                            </Trans>
                        </CardContent>
                    </Card>
                    <Card className="keycloak__permission__permission-table">
                        <CardContent className="p-0">
                            <Table aria-label={t("permissionsList")} className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead id="permissionsScopeName">
                                            {t("permissionsScopeName")}
                                        </TableHead>
                                        <TableHead id="description">
                                            {t("description")}
                                        </TableHead>
                                        <TableHead aria-hidden="true" className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {localeSort(
                                        Object.entries(permission.scopePermissions || {}),
                                        ([name]) => name
                                    ).map(([name, id]) => (
                                        <TableRow key={id}>
                                            <TableCell>
                                                <Link
                                                    to={
                                                        toPermissionDetails({
                                                            realm,
                                                            id: realmId,
                                                            permissionType: "scope",
                                                            permissionId: id
                                                        }) as string
                                                    }
                                                >
                                                    {name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {t(
                                                    `scopePermissions.${type}.${name}-description`
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={t("edit")}
                                                        >
                                                            <DotsThreeVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                navigate({
                                                                    to: toPermissionDetails(
                                                                        {
                                                                            realm,
                                                                            id: realmId,
                                                                            permissionType:
                                                                                "scope",
                                                                            permissionId:
                                                                                id
                                                                        }
                                                                    ) as string
                                                                })
                                                            }
                                                        >
                                                            {t("edit")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};
