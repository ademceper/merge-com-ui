/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/resources/ResourcesTab.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge/ui/components/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@merge/ui/components/alert-dialog";
import {
    ArrowSquareOut,
    CaretDown,
    CaretUp,
    DotsThreeVertical,
    PencilSimple,
    ShareNetwork,
    Trash
} from "@phosphor-icons/react";

import { fetchPermission, fetchResources, updatePermissions } from "../api";
import { getPermissionRequests } from "../api/methods";
import { Links } from "../api/parse-links";
import { Permission, Resource } from "../api/representations";
import { useAccountAlerts } from "../utils/useAccountAlerts";
import { usePromise } from "../utils/usePromise";
import { EditTheResource } from "./EditTheResource";
import { PermissionRequest } from "./PermissionRequest";
import { ResourceToolbar } from "./ResourceToolbar";
import { ShareTheResource } from "./ShareTheResource";
import { SharedWith } from "./SharedWith";

type PermissionDetail = {
    contextOpen?: boolean;
    rowOpen?: boolean;
    shareDialogOpen?: boolean;
    editDialogOpen?: boolean;
    permissions?: Permission[];
};

type ResourcesTabProps = {
    isShared?: boolean;
};

export const ResourcesTab = ({ isShared = false }: ResourcesTabProps) => {
    const { t } = useTranslation();
    const context = useEnvironment();
    const { addAlert, addError } = useAccountAlerts();

    const [params, setParams] = useState<Record<string, string>>({
        first: "0",
        max: "5"
    });
    const [links, setLinks] = useState<Links | undefined>();
    const [resources, setResources] = useState<Resource[]>();
    const [details, setDetails] = useState<Record<string, PermissionDetail | undefined>>(
        {}
    );
    const [key, setKey] = useState(1);
    const refresh = () => setKey(key + 1);

    usePromise(
        async signal => {
            const result = await fetchResources({ signal, context }, params, isShared);
            if (!isShared)
                await Promise.all(
                    result.data.map(
                        async r =>
                            (r.shareRequests = await getPermissionRequests(r._id, {
                                signal,
                                context
                            }))
                    )
                );
            return result;
        },
        ({ data, links }) => {
            setResources(data);
            setLinks(links);
        },
        [params, key]
    );

    if (!resources) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const fetchPermissions = async (id: string) => {
        let permissions = details[id]?.permissions || [];
        if (!details[id]) {
            permissions = await fetchPermission({ context }, id);
        }
        return permissions;
    };

    const removeShare = async (resource: Resource) => {
        try {
            const permissions = (await fetchPermissions(resource._id)).map(
                ({ username }) =>
                    ({
                        username,
                        scopes: []
                    }) as Permission
            )!;
            await updatePermissions(context, resource._id, permissions);
            setDetails({});
            addAlert(t("unShareSuccess"));
        } catch (error) {
            addError("unShareError", error);
        }
    };

    const toggleOpen = async (
        id: string,
        field: keyof PermissionDetail,
        open: boolean
    ) => {
        const permissions = await fetchPermissions(id);

        setDetails({
            ...details,
            [id]: { ...details[id], [field]: open, permissions }
        });
    };

    return (
        <>
            <ResourceToolbar
                onFilter={name => setParams({ ...params, name })}
                count={resources.length}
                first={parseInt(params["first"])}
                max={parseInt(params["max"])}
                onNextClick={() => setParams(links?.next || {})}
                onPreviousClick={() => setParams(links?.prev || {})}
                onPerPageSelect={(first, max) =>
                    setParams({ first: `${first}`, max: `${max}` })
                }
                hasNext={!!links?.next}
            />
            <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm" aria-label={t("resources")}>
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="w-10 px-4 py-3" aria-hidden="true" />
                            <th className="px-4 py-3 text-left font-medium">{t("resourceName")}</th>
                            <th className="px-4 py-3 text-left font-medium">{t("application")}</th>
                            <th className="px-4 py-3 text-left font-medium" aria-hidden={isShared}>
                                {!isShared ? t("permissionRequests") : ""}
                            </th>
                            <th className="px-4 py-3 text-right font-medium" aria-hidden="true" />
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {resources.map((resource, index) => (
                            <ResourceRow
                                key={resource.name}
                                resource={resource}
                                index={index}
                                isShared={isShared}
                                details={details}
                                toggleOpen={toggleOpen}
                                removeShare={removeShare}
                                setDetails={setDetails}
                                refresh={refresh}
                                t={t}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

function ResourceRow({
    resource,
    index,
    isShared,
    details,
    toggleOpen,
    removeShare,
    setDetails,
    refresh,
    t
}: {
    resource: Resource;
    index: number;
    isShared: boolean;
    details: Record<string, PermissionDetail | undefined>;
    toggleOpen: (id: string, field: keyof PermissionDetail, open: boolean) => Promise<void>;
    removeShare: (resource: Resource) => Promise<void>;
    setDetails: (d: Record<string, PermissionDetail | undefined>) => void;
    refresh: () => void;
    t: any;
}) {
    const isExpanded = details[resource._id]?.rowOpen || false;

    return (
        <>
            <tr>
                <td className="px-4 py-3">
                    {!isShared && (
                        <button
                            type="button"
                            data-testid={`expand-${resource.name}`}
                            onClick={() => toggleOpen(resource._id, "rowOpen", !isExpanded)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {isExpanded ? (
                                <CaretUp className="h-4 w-4" />
                            ) : (
                                <CaretDown className="h-4 w-4" />
                            )}
                        </button>
                    )}
                </td>
                <td
                    className="px-4 py-3 font-medium"
                    data-testid={`row[${index}].name`}
                >
                    {resource.name}
                </td>
                <td className="px-4 py-3">
                    <a
                        href={resource.client.baseUrl}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                        {resource.client.name || resource.client.clientId}
                        <ArrowSquareOut className="h-3.5 w-3.5" />
                    </a>
                </td>
                <td className="px-4 py-3">
                    {resource.shareRequests &&
                        resource.shareRequests.length > 0 && (
                            <PermissionRequest
                                resource={resource}
                                refresh={() => refresh()}
                            />
                        )}
                    <ShareTheResource
                        resource={resource}
                        permissions={details[resource._id]?.permissions}
                        open={details[resource._id]?.shareDialogOpen || false}
                        onClose={() => setDetails({})}
                    />
                    {details[resource._id]?.editDialogOpen && (
                        <EditTheResource
                            resource={resource}
                            permissions={details[resource._id]?.permissions}
                            onClose={() => setDetails({})}
                        />
                    )}
                </td>
                <td className="px-4 py-3 text-right">
                    {isShared ? (
                        resource.scopes.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-end">
                                {resource.scopes.map(scope => (
                                    <Badge key={scope.name} variant="secondary">
                                        {scope.displayName || scope.name}
                                    </Badge>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`share-${resource.name}`}
                                onClick={() =>
                                    toggleOpen(resource._id, "shareDialogOpen", true)
                                }
                                className="gap-1"
                            >
                                <ShareNetwork className="h-4 w-4" />
                                {t("share")}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <DotsThreeVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        disabled={
                                            details[resource._id]?.permissions?.length === 0
                                        }
                                        onClick={() =>
                                            toggleOpen(resource._id, "editDialogOpen", true)
                                        }
                                    >
                                        <PencilSimple className="h-4 w-4 mr-2" />
                                        {t("edit")}
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem
                                                disabled={
                                                    details[resource._id]?.permissions?.length === 0
                                                }
                                                onSelect={e => e.preventDefault()}
                                                variant="destructive"
                                            >
                                                <Trash className="h-4 w-4 mr-2" />
                                                {t("unShare")}
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t("unShare")}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t("unShareAllConfirm")}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                                <AlertDialogAction
                                                    variant="destructive"
                                                    onClick={() => removeShare(resource)}
                                                >
                                                    {t("confirm")}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </td>
            </tr>
            {!isShared && isExpanded && (
                <tr>
                    <td colSpan={5} className="px-4 py-3 bg-muted/30 text-center">
                        <SharedWith permissions={details[resource._id]?.permissions} />
                    </td>
                </tr>
            )}
        </>
    );
}
