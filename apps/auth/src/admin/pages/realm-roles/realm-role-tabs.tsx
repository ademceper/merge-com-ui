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
} from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import useIsFeatureEnabled, { Feature } from "../../shared/lib/useIsFeatureEnabled";
import { useParams, useParams as useRouterParams } from "../../shared/lib/useParams";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import {
    type AttributeForm,
    AttributesForm
} from "../../shared/ui/key-value-form/attribute-form";
import {
    arrayToKeyValue,
    type KeyValueType,
    keyValueToArray
} from "../../shared/ui/key-value-form/key-value-convert";
import { PermissionsTab } from "../../shared/ui/permission-tab/permission-tab";
import { RoleForm } from "../../shared/ui/role-form/role-form";
import { RoleMapping } from "../../shared/ui/role-mapping/role-mapping";
import { toClient } from "../../shared/lib/routes/clients";
import {
    type ClientRoleParams,
    type ClientRoleTab,
    toClientRole
} from "../../shared/lib/routes/clients";
import { AdminEvents } from "../events/admin-events";
import { useClientDetail } from "./api/use-client-detail";
import { useRealmRole } from "./api/use-realm-role";
import { type RealmRoleTab, toRealmRole, toRealmRoles } from "../../shared/lib/routes/realm-roles";
import { UsersInRoleTab } from "./users-in-role-tab";

export default function RealmRoleTabs() {
    const { adminClient } = useAdminClient();

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
                await adminClient.roles.updateById({ id }, roleRepresentation);
            } else {
                await adminClient.clients.updateRole(
                    { id: clientId, roleName: formValues.name! },
                    roleRepresentation
                );
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
                    await adminClient.roles.delById({ id });
                } else {
                    await adminClient.clients.delRole({
                        id: clientId,
                        roleName: roleName!
                    });
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

    const addComposites = async (composites: RoleRepresentation[]) => {
        try {
            await adminClient.roles.createComposite(
                { roleId: id, realm: realm!.realm },
                composites
            );
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
                        save={rows => addComposites(rows.map(r => r.role))}
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
