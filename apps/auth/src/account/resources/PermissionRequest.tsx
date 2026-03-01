/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/resources/PermissionRequest.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@merge/ui/components/dialog";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { UserCheck } from "@phosphor-icons/react";

import { fetchPermission, updateRequest } from "../api";
import { Permission, Resource } from "../api/representations";
import { useAccountAlerts } from "../utils/useAccountAlerts";

type PermissionRequestProps = {
    resource: Resource;
    refresh: () => void;
};

export const PermissionRequest = ({ resource, refresh }: PermissionRequestProps) => {
    const { t } = useTranslation();
    const context = useEnvironment();
    const { addAlert, addError } = useAccountAlerts();

    const [open, setOpen] = useState(false);

    const toggle = () => setOpen(!open);

    const approveDeny = async (shareRequest: Permission, approve: boolean = false) => {
        try {
            const permissions = await fetchPermission({ context }, resource._id);
            const { scopes, username } = permissions.find(
                p => p.username === shareRequest.username
            ) || { scopes: [], username: shareRequest.username };

            await updateRequest(
                context,
                resource._id,
                username,
                approve
                    ? [...(scopes as string[]), ...(shareRequest.scopes as string[])]
                    : scopes
            );
            addAlert(t("shareSuccess"));
            toggle();
            refresh();
        } catch (error) {
            addError("shareError", error);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={toggle}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80"
            >
                <UserCheck className="h-5 w-5" />
                <Badge variant="secondary">{resource.shareRequests?.length}</Badge>
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {t("permissionRequest", { name: resource.name })}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            {t("permissionRequest", { name: resource.name })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm" aria-label={t("resources")}>
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">{t("requestor")}</th>
                                    <th className="px-4 py-3 text-left font-medium">{t("permissionRequests")}</th>
                                    <th className="px-4 py-3 text-right font-medium" aria-hidden="true"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {resource.shareRequests?.map(shareRequest => (
                                    <tr key={shareRequest.username}>
                                        <td className="px-4 py-3">
                                            <div>
                                                {shareRequest.firstName} {shareRequest.lastName}{" "}
                                                {shareRequest.lastName ? "" : shareRequest.username}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {shareRequest.email}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {shareRequest.scopes.map(scope => (
                                                    <Badge key={scope.toString()} variant="secondary">
                                                        {scope as string}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={async () => {
                                                        await approveDeny(shareRequest, true);
                                                    }}
                                                >
                                                    {t("accept")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={async () => {
                                                        await approveDeny(shareRequest);
                                                    }}
                                                >
                                                    {t("deny")}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={toggle}>
                            {t("close")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
