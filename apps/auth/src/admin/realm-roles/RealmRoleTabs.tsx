import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { getErrorDescription, getErrorMessage, KeycloakSpinner, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { useState } from "react";
import { FormProvider, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMatch, useNavigate, useParams as useRouterParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { toClient } from "../clients/routes/Client";
import {
    ClientRoleParams,
    ClientRoleRoute,
    ClientRoleTab,
    toClientRole
} from "../clients/routes/ClientRole";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import {
    AttributeForm,
    AttributesForm
} from "../components/key-value-form/AttributeForm";
import {
    KeyValueType,
    arrayToKeyValue,
    keyValueToArray
} from "../components/key-value-form/key-value-convert";
import { PermissionsTab } from "../components/permission-tab/PermissionTab";
import { RoleForm } from "../components/role-form/RoleForm";
import { RoleMapping } from "../components/role-mapping/RoleMapping";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { AdminEvents } from "../events/AdminEvents";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import { useParams } from "../utils/useParams";
import { UsersInRoleTab } from "./UsersInRoleTab";
import { RealmRoleRoute, RealmRoleTab, toRealmRole } from "./routes/RealmRole";
import { toRealmRoles } from "./routes/RealmRoles";

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
    const [key, setKey] = useState(0);
    const [attributes, setAttributes] = useState<KeyValueType[] | undefined>();

    const refresh = () => setKey(key + 1);
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

    useFetch(
        async () => adminClient.roles.findOneById({ id }),
        role => {
            if (!role) {
                throw new Error(t("notFound"));
            }

            const convertedRole = convert(role);

            reset(convertedRole);
            setAttributes(convertedRole.attributes);
        },
        [key]
    );

    useFetch(
        async () => adminClient.clients.findOne({ id: clientId }),
        client => {
            if (clientId) setCanManageClientRole(client?.access?.manage as boolean);
        },
        []
    );

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
            toast.error(t("roleSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const realmRoleMatch = useMatch(RealmRoleRoute.path);
    const clientRoleMatch = useMatch(ClientRoleRoute.path);

    const toOverview = () => {
        if (realmRoleMatch) {
            return toRealmRoles({ realm: realmName });
        }

        if (clientRoleMatch) {
            return toClient({
                realm: realmName,
                clientId: clientRoleMatch.params.clientId!,
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
                clientId: clientRoleMatch.params.clientId!,
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
                navigate(toOverview());
            } catch (error) {
                toast.error(t("roleDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
            navigate(toTab("associated-roles"));
            toast.success(t("addAssociatedRolesSuccess"));
        } catch (error) {
            toast.error(t("addAssociatedRolesError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                return (isFeatureEnabled(Feature.AdminFineGrainedAuthz) && canViewPermissionsTab) ? (
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
            <ViewHeader
                titleKey={roleName!}
                badges={[
                    {
                        id: "composite-role-badge",
                        text: composites ? t("composite") : "",
                        readonly: true
                    }
                ]}
                actionsDropdownId="roles-actions-dropdown"
                dropdownItems={[
                    <DropdownMenuItem
                        key="delete-role"
                        onClick={() => {
                            toggleDeleteDialog();
                        }}
                    >
                        {t("deleteRole")}
                    </DropdownMenuItem>
                ]}
                divider={false}
            />
            <section className="py-6 bg-muted/30 p-0">
                <FormProvider {...form}>
                    <div className="bg-muted/30">
                        {renderContent()}
                    </div>
                </FormProvider>
            </section>
        </>
    );
}
