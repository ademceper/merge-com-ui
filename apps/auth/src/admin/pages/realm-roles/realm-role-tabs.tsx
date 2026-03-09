import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FormProvider, type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useAddCompositeRoles } from "./hooks/use-add-composite-roles";
import { useDeleteClientRole } from "./hooks/use-delete-client-role";
import { useDeleteRealmRole } from "./hooks/use-delete-realm-role";
import { useUpdateClientRole } from "./hooks/use-update-client-role";
import { useUpdateRealmRole } from "./hooks/use-update-realm-role";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import {
    type ClientRoleParams,
    type ClientRoleTab,
    toClient,
    toClientRole
} from "@/admin/shared/lib/routes/clients";
import {
    type RealmRoleTab,
    toRealmRole,
    toRealmRoles
} from "@/admin/shared/lib/routes/realm-roles";
import { useIsFeatureEnabled, Feature } from "@/admin/shared/lib/use-is-feature-enabled";
import { useParams, useParams as useRouterParams } from "@/admin/shared/lib/use-params";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import {
    type AttributeForm,
    AttributesForm
} from "@/admin/shared/ui/key-value-form/attribute-form";
import {
    arrayToKeyValue,
    type KeyValueType,
    keyValueToArray
} from "@/admin/shared/ui/key-value-form/key-value-convert";
import { PermissionsTab } from "@/admin/shared/ui/permission-tab/permission-tab";
import { RoleForm } from "@/admin/shared/ui/role-form/role-form";
import { RoleMapping } from "@/admin/shared/ui/role-mapping/role-mapping";
import { AdminEvents } from "../events/admin-events";
import { useClientDetail } from "./hooks/use-client-detail";
import { useRealmRole } from "./hooks/use-realm-role";
import { UsersInRoleTab } from "./users-in-role-tab";

export function RealmRoleTabs() {

    const isFeatureEnabled = useIsFeatureEnabled();
    const { t } = useTranslation();
    const form = useForm<AttributeForm>({
        mode: "onChange"
    });
    const { control, reset, setValue } = form;
    const navigate = useNavigate();

    const { id, clientId } = useParams<ClientRoleParams>();
    const { tab } = useRouterParams<{ tab?: string }>();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const [attributes, setAttributes] = useState<KeyValueType[] | undefined>();

    const { hasAccess } = useAccess();
    const canViewPermissionsTab = hasAccess("query-clients", "manage-authorization");

    const [canManageClientRole, setCanManageClientRole] = useState(false);

    const convert = (role: RoleRepresentation) => {
        const { attributes, ...rest } = role;
        return {
            attributes: arrayToKeyValue(attributes),
            ...rest
        };
    };

    const roleName = useWatch({
        control,
        defaultValue: undefined,
        name: "name"
    });

    const composites = useWatch({
        control,
        defaultValue: false,
        name: "composite"
    });

    const { data: roleData, refetch: refetchRole } = useRealmRole(id);
    const refresh = () => refetchRole();

    const { mutateAsync: updateRealmRole } = useUpdateRealmRole(id);
    const { mutateAsync: updateClientRoleMut } = useUpdateClientRole(clientId ?? "");
    const { mutateAsync: deleteRealmRoleMut } = useDeleteRealmRole();
    const { mutateAsync: deleteClientRoleMut } = useDeleteClientRole(clientId ?? "");
    const { mutateAsync: addComposites } = useAddCompositeRoles();

    useEffect(() => {
        if (!roleData) return;
        const convertedRole = convert(roleData);
        reset(convertedRole);
        setAttributes(convertedRole.attributes);
    }, [roleData, reset]);

    const { data: clientData } = useClientDetail(clientId);

    useEffect(() => {
        if (clientId && clientData) {
            setCanManageClientRole(clientData.access?.manage as boolean);
        }
    }, [clientId, clientData]);

    const onSubmit: SubmitHandler<AttributeForm> = async formValues => {
        try {
            const { attributes, ...rest } = formValues;
            const roleRepresentation: RoleRepresentation = rest;

            roleRepresentation.name = roleRepresentation.name?.trim();
            roleRepresentation.attributes = keyValueToArray(attributes);

            if (!clientId) {
                await updateRealmRole(roleRepresentation);
            } else {
                await updateClientRoleMut({
                    roleName: formValues.name!,
                    role: roleRepresentation
                });
            }

            setAttributes(attributes);
            toast.success(t("roleSaveSuccess"));
        } catch (error) {
            toast.error(t("roleSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const location = useLocation();
    const clientRoleMatch = location.pathname.includes("/clients/");
    const realmRoleMatch = !clientRoleMatch && location.pathname.includes("/roles/");

    const toOverview = () => {
        if (realmRoleMatch) {
            return toRealmRoles({ realm: realmName });
        }

        if (clientRoleMatch) {
            return toClient({
                realm: realmName,
                clientId: clientId,
                tab: "roles"
            });
        }

        throw new Error("Roles overview route could not be determined.");
    };

    const toTab = (tab: RealmRoleTab | ClientRoleTab) => {
        if (realmRoleMatch) {
            return toRealmRole({
                realm: realmName,
                id,
                tab
            });
        }

        if (clientRoleMatch) {
            return toClientRole({
                realm: realmName,
                id,
                clientId: clientId,
                tab: tab as ClientRoleTab
            });
        }

        throw new Error("Route could not be determined.");
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "roleDeleteConfirm",
        messageKey: t("roleDeleteConfirmDialog", {
            selectedRoleName: roleName || t("createRole")
        }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                if (!clientId) {
                    await deleteRealmRoleMut(id);
                } else {
                    await deleteClientRoleMut(roleName!);
                }
                toast.success(t("roleDeletedSuccess"));
                navigate({ to: toOverview() as string });
            } catch (error) {
                toast.error(t("roleDeleteError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const handleAddComposites = async (composites: RoleRepresentation[]) => {
        try {
            await addComposites({
                roleId: id,
                realm: realm!.realm!,
                composites
            });
            refresh();
            navigate({ to: toTab("associated-roles") as string });
            toast.success(t("addAssociatedRolesSuccess"));
        } catch (error) {
            toast.error(t("addAssociatedRolesError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const isDefaultRole = (name: string | undefined) =>
        realm?.defaultRole && realm.defaultRole!.name === name;

    if (!realm) {
        return <KeycloakSpinner />;
    }

    const renderContent = () => {
        switch (tab) {
            case "associated-roles":
                return (
                    <RoleMapping
                        name={roleName!}
                        id={id}
                        type="roles"
                        isManager
                        save={rows => handleAddComposites(rows.map(r => r.role))}
                    />
                );
            case "attributes":
                return !isDefaultRole(roleName) ? (
                    <AttributesForm
                        form={form}
                        save={onSubmit}
                        fineGrainedAccess={canManageClientRole}
                        reset={() =>
                            setValue("attributes", attributes, {
                                shouldDirty: false
                            })
                        }
                    />
                ) : null;
            case "users-in-role":
                return !isDefaultRole(roleName) ? (
                    <UsersInRoleTab data-cy="users-in-role-tab" />
                ) : null;
            case "permissions":
                return isFeatureEnabled(Feature.AdminFineGrainedAuthz) &&
                    canViewPermissionsTab ? (
                    <PermissionsTab id={id} type="roles" />
                ) : null;
            case "events":
                return hasAccess("view-events") ? (
                    <AdminEvents resourcePath={`roles-by-id/${id}`} />
                ) : null;
            default:
                return (
                    <RoleForm
                        form={form}
                        onSubmit={onSubmit}
                        role={clientRoleMatch ? "manage-clients" : "manage-realm"}
                        cancelLink={
                            clientRoleMatch
                                ? toClient({
                                      realm: realmName,
                                      clientId,
                                      tab: "roles"
                                  })
                                : toRealmRoles({ realm: realmName })
                        }
                        editMode
                    />
                );
        }
    };

    return (
        <>
            <DeleteConfirm />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    {composites && (
                        <Badge data-testid="composite-role-badge" variant="secondary">
                            {t("composite")}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            id="roles-actions-dropdown"
                            data-testid="action-dropdown"
                            className={buttonVariants()}
                        >
                            {t("action")}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                key="delete-role"
                                onClick={() => {
                                    toggleDeleteDialog();
                                }}
                            >
                                {t("deleteRole")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <section className="py-6 bg-muted/30 p-0">
                <FormProvider {...form}>
                    <div className="bg-muted/30">{renderContent()}</div>
                </FormProvider>
            </section>
        </>
    );
}
