import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { getErrorDescription, getErrorMessage, TextControl, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import { Alert, AlertTitle } from "@merge/ui/components/alert";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";

type GroupsModalProps = {
    id?: string;
    rename?: GroupRepresentation;
    duplicateId?: string;
    handleModalToggle: () => void;
    refresh: (group?: GroupRepresentation) => void;
    /** Controlled mode: dialog visibility */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

type RoleMappingPayload = {
    id: string;
    name?: string;
    clientUniqueId?: string;
};

type ClientRoleMapping = {
    clientId: string;
    roles: RoleMappingPayload[];
};

export const GroupsModal = ({
    id,
    rename,
    duplicateId,
    handleModalToggle,
    refresh,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: GroupsModalProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
const isFeatureEnabled = useIsFeatureEnabled();
    const [duplicateGroupDetails, setDuplicateGroupDetails] =
        useState<GroupRepresentation | null>(null);

    const form = useForm({
        defaultValues: {
            name: rename?.name || "",
            description: rename?.description || ""
        }
    });
    const { handleSubmit, formState } = form;

    useFetch(
        async () => {
            if (duplicateId) {
                return adminClient.groups.findOne({ id: duplicateId });
            }
        },
        group => {
            if (group) {
                setDuplicateGroupDetails(group);
                form.reset({ name: t("copyOf", { name: group.name }) });
            }
        },
        [duplicateId]
    );

    const fetchClientRoleMappings = async (groupId: string) => {
        try {
            const clientRoleMappings: ClientRoleMapping[] = [];
            const clients = await adminClient.clients.find();

            for (const client of clients) {
                const roles = await adminClient.groups.listClientRoleMappings({
                    id: groupId,
                    clientUniqueId: client.id!
                });

                const clientRoles = roles
                    .filter(role => role.id && role.name)
                    .map(role => ({
                        id: role.id!,
                        name: role.name!
                    }));

                if (clientRoles.length > 0) {
                    clientRoleMappings.push({ clientId: client.id!, roles: clientRoles });
                }
            }

            return clientRoleMappings;
        } catch (error) {
            toast.error(t("couldNotFetchClientRoleMappings", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            throw error;
        }
    };

    const duplicateGroup = async (
        sourceGroup: GroupRepresentation,
        parentId?: string,
        isSubGroup: boolean = false
    ) => {
        try {
            const newGroup: GroupRepresentation = {
                ...sourceGroup,
                name: isSubGroup
                    ? sourceGroup.name
                    : t("copyOf", { name: sourceGroup.name }),
                ...(parentId ? {} : { attributes: duplicateGroupDetails?.attributes })
            };

            delete newGroup.id;

            const createdGroup = parentId
                ? await adminClient.groups.createChildGroup({ id: parentId }, newGroup)
                : await adminClient.groups.create(newGroup);

            const members = await adminClient.groups.listMembers({
                id: sourceGroup.id!
            });

            for (const member of members) {
                await adminClient.users.addToGroup({
                    id: member.id!,
                    groupId: createdGroup.id
                });
            }

            if (isFeatureEnabled(Feature.AdminFineGrainedAuthz)) {
                const permissions = await adminClient.groups.listPermissions({
                    id: sourceGroup.id!
                });

                if (permissions) {
                    await adminClient.groups.updatePermission(
                        { id: createdGroup.id },
                        permissions
                    );
                }
            }

            const realmRoles = await adminClient.groups.listRealmRoleMappings({
                id: sourceGroup.id!
            });

            const realmRolesPayload: RoleMappingPayload[] = realmRoles.map(role => ({
                id: role.id!,
                name: role.name!
            }));

            const clientRoleMappings = await fetchClientRoleMappings(sourceGroup.id!);

            const clientRolesPayload: RoleMappingPayload[] = clientRoleMappings?.flatMap(
                clientRoleMapping =>
                    clientRoleMapping.roles.map(role => ({
                        id: role.id!,
                        name: role.name!,
                        clientUniqueId: clientRoleMapping.clientId
                    }))
            );

            const rolesToAssign: RoleMappingPayload[] = [
                ...realmRolesPayload,
                ...clientRolesPayload
            ];

            await assignRoles(rolesToAssign, createdGroup.id);

            const subGroups = await adminClient.groups.listSubGroups({
                parentId: sourceGroup.id!
            });

            for (const childGroup of subGroups) {
                const childAttributes = childGroup.attributes;
                await duplicateGroup(
                    { ...childGroup, attributes: childAttributes },
                    createdGroup.id,
                    true
                );
            }

            return createdGroup;
        } catch (error) {
            toast.error(t("couldNotDuplicateGroup", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            throw error;
        }
    };

    const assignRoles = async (roles: RoleMappingPayload[], groupId: string) => {
        try {
            const realmRoles = roles.filter(role => !role.clientUniqueId && role.name);
            const clientRoles = roles.filter(role => role.clientUniqueId && role.name);

            await adminClient.groups.addRealmRoleMappings({
                id: groupId,
                roles: realmRoles.map(({ id, name }) => ({ id, name: name! }))
            });

            await Promise.all(
                clientRoles.map(clientRole => {
                    if (clientRole.clientUniqueId && clientRole.name) {
                        return adminClient.groups.addClientRoleMappings({
                            id: groupId,
                            clientUniqueId: clientRole.clientUniqueId,
                            roles: [{ id: clientRole.id, name: clientRole.name }]
                        });
                    }
                    return Promise.resolve();
                })
            );
        } catch (error) {
            toast.error(t("roleMappingUpdatedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const submitForm = async (group: GroupRepresentation) => {
        group.name = group.name?.trim();

        try {
            if (duplicateId && duplicateGroupDetails) {
                await duplicateGroup(duplicateGroupDetails);
            } else if (!id) {
                await adminClient.groups.create(group);
            } else if (rename) {
                await adminClient.groups.update(
                    { id },
                    { ...rename, name: group.name, description: group.description }
                );
            } else {
                await adminClient.groups.updateChildGroup({ id }, group);
            }

            refresh(rename ? { ...rename, ...group } : undefined);
            handleModalToggle();
            toast.success(t(
                    rename
                        ? "groupUpdated"
                        : duplicateId
                          ? "groupDuplicated"
                          : "groupCreated"
                ));
        } catch (error) {
            toast.error(t("couldNotCreateGroup", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const isOpen = controlledOpen ?? true;
    const handleOpenChange = (open: boolean) => {
        if (!open) handleModalToggle();
        controlledOnOpenChange?.(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg sm:max-w-lg">
                <DialogHeader className="w-full">
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <DialogTitle className="min-w-0 flex-1 truncate">
                            {rename
                                ? t("editGroup")
                                : duplicateId
                                  ? t("duplicateAGroup")
                                  : t("createAGroup")}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="min-h-[120px]">
                    <FormProvider {...form}>
                        <form id="group-form" onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-5 py-2">
                            {duplicateId && (
                                <Alert variant="destructive">
                                    <AlertTitle>{t("duplicateGroupWarning")}</AlertTitle>
                                </Alert>
                            )}
                            <TextControl
                                name="name"
                                label={t("name")}
                                showLabel
                                rules={{ required: t("required") }}
                                autoFocus
                            />
                            <TextControl name="description" label={t("description")} showLabel />
                        </form>
                    </FormProvider>
                </div>
                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end sm:gap-4">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0 sm:items-center">
                        <DialogClose asChild>
                            <Button
                                id="modal-cancel"
                                data-testid="cancel"
                                variant="ghost"
                                className="h-9 min-h-9 w-full text-foreground sm:w-auto"
                            >
                                {t("cancel")}
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            form="group-form"
                            data-testid={`${rename ? "rename" : duplicateId ? "duplicate" : "create"}Group`}
                            disabled={formState.isLoading || formState.isValidating || formState.isSubmitting}
                            className="h-9 min-h-9 w-full group sm:w-auto"
                        >
                            {t(rename ? "edit" : duplicateId ? "duplicate" : "create")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
