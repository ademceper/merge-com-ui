/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/permission-tab/PermissionTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { ManagementPermissionReference } from "@keycloak/keycloak-admin-client/lib/defs/managementPermissionReference";
import { HelpItem, useFetch } from "../../../shared/keycloak-ui-shared";
import { Card, CardContent, CardHeader, CardTitle } from "@merge/ui/components/card";
import { Label } from "@merge/ui/components/label";
import { Switch } from "@merge/ui/components/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import { Button } from "@merge/ui/components/button";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { toPermissionDetails } from "../../clients/routes/PermissionDetails";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import useLocaleSort from "../../utils/useLocaleSort";
import { useConfirmDialog } from "../confirm-dialog/ConfirmDialog";


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
    const [realmId, setRealmId] = useState("");
    const [permission, setPermission] = useState<ManagementPermissionReference>();
    const localeSort = useLocaleSort();

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

    useFetch(
        () =>
            Promise.all([
                adminClient.clients.find({
                    search: true,
                    clientId: realm === "master" ? "master-realm" : "realm-management"
                }),
                (() => {
                    switch (type) {
                        case "clients":
                            return adminClient.clients.listFineGrainPermissions({
                                id: id!
                            });
                        case "users":
                            return adminClient.realms.getUsersManagementPermissions({
                                realm
                            });
                        case "groups":
                            return adminClient.groups.listPermissions({ id: id! });
                        case "roles":
                            return adminClient.roles.listPermissions({ id: id! });
                        case "identityProviders":
                            return adminClient.identityProviders.listPermissions({
                                alias: id!
                            });
                    }
                })()
            ]),
        ([clients, permission]) => {
            setRealmId(clients[0]?.id!);
            setPermission(permission);
        },
        [id]
    );

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
                        <Label htmlFor="permissionsEnabled" className="flex items-center gap-1">
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
                                onCheckedChange={async (enabled) => {
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
                                        <TableHead id="description">{t("description")}</TableHead>
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
                                                    to={toPermissionDetails({
                                                        realm,
                                                        id: realmId,
                                                        permissionType: "scope",
                                                        permissionId: id
                                                    })}
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
                                                                navigate(
                                                                    toPermissionDetails({
                                                                        realm,
                                                                        id: realmId,
                                                                        permissionType:
                                                                            "scope",
                                                                        permissionId: id
                                                                    })
                                                                )
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
