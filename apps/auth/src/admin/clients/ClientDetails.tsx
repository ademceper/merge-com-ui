/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/ClientDetails.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useAlerts, useFetch } from "../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { Badge } from "@merge/ui/components/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@merge/ui/components/tooltip";
import { Separator } from "@merge/ui/components/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";
import { Info } from "@phosphor-icons/react";
import { cloneDeep, sortBy } from "lodash-es";
import { useMemo, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams as useRouterParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import {
    ConfirmDialogModal,
    useConfirmDialog
} from "../components/confirm-dialog/ConfirmDialog";
import { DownloadDialog } from "../components/download-dialog/DownloadDialog";
import type { KeyValueType } from "../components/key-value-form/key-value-convert";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { PermissionsTab } from "../components/permission-tab/PermissionTab";
import { RolesList } from "../components/roles-list/RolesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { ViewHeader, ViewHeaderBadge } from "../components/view-header/ViewHeader";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import {
    convertAttributeNameToForm,
    convertFormValuesToObject,
    convertToFormValues,
    exportClient
} from "../util";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import { useParams } from "../utils/useParams";
import useToggle from "../utils/useToggle";
import { AdvancedTab } from "./AdvancedTab";
import { ClientSessions } from "./ClientSessions";
import { ClientSettings } from "./ClientSettings";
import { AuthorizationEvaluate } from "./authorization/AuthorizationEvaluate";
import { AuthorizationExport } from "./authorization/AuthorizationExport";
import { AuthorizationPermissions } from "./authorization/Permissions";
import { AuthorizationPolicies } from "./authorization/Policies";
import { AuthorizationResources } from "./authorization/Resources";
import { AuthorizationScopes } from "./authorization/Scopes";
import { AuthorizationSettings } from "./authorization/Settings";
import { Credentials } from "./credentials/Credentials";
import { Keys } from "./keys/Keys";
import { SamlKeys } from "./keys/SamlKeys";
import { ClientParams, ClientTab, toClient } from "./routes/Client";
import { toClientRole } from "./routes/ClientRole";
import { toClients } from "./routes/Clients";
import { toCreateRole } from "./routes/NewRole";
import { ClientScopes } from "./scopes/ClientScopes";
import { EvaluateScopes } from "./scopes/EvaluateScopes";
import { ServiceAccount } from "./service-account/ServiceAccount";
import { getProtocolName, isRealmClient } from "./utils";
import { UserEvents } from "../events/UserEvents";
import { useIsAdminPermissionsClient } from "../utils/useIsAdminPermissionsClient";
import { AdminEvents } from "../events/AdminEvents";

type ClientDetailHeaderProps = {
    onChange: (value: boolean) => void;
    value: boolean | undefined;
    save: () => void;
    client: ClientRepresentation;
    toggleDownloadDialog: () => void;
    toggleDeleteDialog: () => void;
};

const ClientDetailHeader = ({
    onChange,
    value,
    save,
    client,
    toggleDownloadDialog,
    toggleDeleteDialog
}: ClientDetailHeaderProps) => {
    const { t } = useTranslation();
    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "disableConfirmClientTitle",
        messageKey: "disableConfirmClient",
        continueButtonLabel: "disable",
        onConfirm: () => {
            onChange(!value);
            save();
        }
    });

    const badges = useMemo<ViewHeaderBadge[]>(() => {
        const protocolName = getProtocolName(t, client.protocol ?? "openid-connect");

        const text = client.bearerOnly ? (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span
                            data-testid="bearer-only-explainer-label"
                            className="inline-flex items-center gap-1"
                        >
                            <Info className="size-4" />
                            <Label>{protocolName}</Label>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent data-testid="bearer-only-explainer-tooltip">
                        {t("explainBearerOnly")}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ) : (
            <Label>{protocolName}</Label>
        );

        return [{ text }];
    }, [client, t]);

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients") || client.access?.configure;

    const dropdownItems = [
        <DropdownMenuItem key="download" onClick={toggleDownloadDialog}>
            {t("downloadAdapterConfig")}
        </DropdownMenuItem>,
        <DropdownMenuItem key="export" onClick={() => exportClient(client)}>
            {t("export")}
        </DropdownMenuItem>,
        ...(!isRealmClient(client) && isManager
            ? [
                  <Separator key="divider" />,
                  <DropdownMenuItem
                      data-testid="delete-client"
                      key="delete"
                      onClick={toggleDeleteDialog}
                  >
                      {t("delete")}
                  </DropdownMenuItem>
              ]
            : [])
    ];

    return (
        <>
            <DisableConfirm />
            <ViewHeader
                titleKey={client.clientId!}
                subKey="clientsExplain"
                badges={badges}
                divider={false}
                isReadOnly={!isManager}
                helpTextKey="enableDisable"
                dropdownItems={dropdownItems}
                isEnabled={value}
                onToggle={value => {
                    if (!value) {
                        toggleDisableDialog();
                    } else {
                        onChange(value);
                        save();
                    }
                }}
            />
        </>
    );
};

export type SaveOptions = {
    confirmed?: boolean;
    messageKey?: string;
};

export type FormFields = Omit<
    ClientRepresentation,
    "authorizationSettings" | "resources"
>;

export default function ClientDetails() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();
    const { realm } = useRealm();
    const { hasAccess } = useAccess();
    const isFeatureEnabled = useIsFeatureEnabled();

    const hasManageAuthorization = hasAccess("manage-authorization");
    const hasViewAuthorization = hasAccess("view-authorization");
    const hasManageClients = hasAccess("manage-clients");
    const hasViewClients = hasAccess("view-clients");
    const hasViewUsers = hasAccess("view-users");
    const permissionsEnabled =
        isFeatureEnabled(Feature.AdminFineGrainedAuthz) &&
        (hasManageAuthorization || hasViewAuthorization);

    const navigate = useNavigate();
    const location = useLocation();
    const { tab } = useRouterParams<{ tab?: string }>();

    const [downloadDialogOpen, toggleDownloadDialogOpen] = useToggle();
    const [changeAuthenticatorOpen, toggleChangeAuthenticatorOpen] = useToggle();

    const form = useForm<FormFields>();
    const { clientId } = useParams<ClientParams>();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const isAdminPermissionsClient = useIsAdminPermissionsClient(clientId);

    const clientAuthenticatorType = useWatch({
        control: form.control,
        name: "clientAuthenticatorType",
        defaultValue: "client-secret"
    });

    const [client, setClient] = useState<ClientRepresentation>();

    const loader = async () => {
        const roles = await adminClient.clients.listRoles({ id: clientId });
        return sortBy(roles, role => role.name?.toUpperCase());
    };

    const [activeEventsTab, setActiveEventsTab] = useState("userEvents");

    // Check if we're in a sub-tab route
    const isClientScopesSubTab = location.pathname.includes(`/clients/${clientId}/clientScopes/`);
    const isAuthorizationSubTab = location.pathname.includes(`/clients/${clientId}/authorization/`);

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "clientDeleteConfirmTitle",
        messageKey: "clientDeleteConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "danger",
        onConfirm: async () => {
            try {
                await adminClient.clients.del({ id: clientId });
                addAlert(t("clientDeletedSuccess"), AlertVariant.success);
                navigate(toClients({ realm }));
            } catch (error) {
                addError("clientDeleteError", error);
            }
        }
    });

    const setupForm = (client: ClientRepresentation) => {
        convertToFormValues(client, form.setValue);
        if (client.attributes?.["acr.loa.map"]) {
            form.setValue(
                convertAttributeNameToForm("attributes.acr.loa.map"),
                // @ts-ignore
                Object.entries(JSON.parse(client.attributes["acr.loa.map"])).flatMap(
                    ([key, value]) => ({ key, value })
                )
            );
        }
        // reset dirty as for reason it is not resetting
        form.reset(form.getValues(), { keepDirty: false });
    };

    useFetch(
        () => adminClient.clients.findOne({ id: clientId }),
        fetchedClient => {
            if (!fetchedClient) {
                throw new Error(t("notFound"));
            }
            setClient(cloneDeep(fetchedClient));
            setupForm(fetchedClient);
        },
        [clientId, key]
    );

    const save = async (
        { confirmed = false, messageKey = "clientSaveSuccess" }: SaveOptions = {
            confirmed: false,
            messageKey: "clientSaveSuccess"
        }
    ) => {
        if (!(await form.trigger())) {
            return;
        }

        if (
            !client?.publicClient &&
            client?.clientAuthenticatorType !== clientAuthenticatorType &&
            !confirmed
        ) {
            toggleChangeAuthenticatorOpen();
            return;
        }

        const values = convertFormValuesToObject(form.getValues());

        const submittedClient = convertFormValuesToObject<ClientRepresentation>(values);

        if (submittedClient.attributes?.["acr.loa.map"]) {
            submittedClient.attributes["acr.loa.map"] = JSON.stringify(
                Object.fromEntries(
                    (submittedClient.attributes["acr.loa.map"] as KeyValueType[])
                        .filter(({ key }) => key !== "")
                        .map(({ key, value }) => [key, value])
                )
            );
        }

        try {
            const newClient: ClientRepresentation = {
                ...client,
                ...submittedClient
            };

            newClient.clientId = newClient.clientId?.trim();

            await adminClient.clients.update({ id: clientId }, newClient);
            setupForm(newClient);
            setClient(newClient);
            addAlert(t(messageKey), AlertVariant.success);
        } catch (error) {
            addError("clientSaveError", error);
        }
    };

    if (!client) {
        return <KeycloakSpinner />;
    }

    const renderClientScopesContent = () => {
        switch (tab) {
            case "evaluate":
                return (
                    <EvaluateScopes
                        clientId={clientId}
                        protocol={client!.protocol!}
                    />
                );
            default:
                return (
                    <ClientScopes
                        clientName={client.clientId!}
                        clientId={clientId}
                        protocol={client!.protocol!}
                        fineGrainedAccess={client!.access?.manage}
                    />
                );
        }
    };

    const renderAuthorizationContent = () => {
        switch (tab) {
            case "resources":
                return (
                    <AuthorizationResources
                        clientId={clientId}
                        isDisabled={!hasManageAuthorization}
                    />
                );
            case "scopes":
                return (
                    <AuthorizationScopes
                        clientId={clientId}
                        isDisabled={!hasManageAuthorization}
                    />
                );
            case "policies":
                return (
                    <AuthorizationPolicies
                        clientId={clientId}
                        isDisabled={!hasManageAuthorization}
                    />
                );
            case "permissions":
                return (
                    <AuthorizationPermissions
                        clientId={clientId}
                        isDisabled={!hasManageAuthorization}
                    />
                );
            case "evaluate":
                return hasViewUsers ? (
                    <AuthorizationEvaluate
                        client={client}
                        save={save}
                    />
                ) : null;
            case "export":
                return hasAccess("manage-authorization") ? (
                    <AuthorizationExport />
                ) : null;
            default:
                return <AuthorizationSettings clientId={clientId} />;
        }
    };

    const renderContent = () => {
        // Handle sub-tab routes
        if (isClientScopesSubTab) {
            return renderClientScopesContent();
        }
        if (isAuthorizationSubTab) {
            return renderAuthorizationContent();
        }

        switch (tab) {
            case "keys":
                return ((!client.publicClient && !isRealmClient(client)) || client.protocol === "saml") ? (
                    <>
                        {client.protocol === "openid-connect" && (
                            <Keys
                                clientId={clientId}
                                save={save}
                                refresh={refresh}
                                hasConfigureAccess={client.access?.configure}
                            />
                        )}
                        {client.protocol === "saml" && (
                            <SamlKeys clientId={clientId} save={save} />
                        )}
                    </>
                ) : null;
            case "credentials":
                return (!client.publicClient && !isRealmClient(client) &&
                    (hasViewClients || client.access?.configure || client.access?.view)) ? (
                    <Credentials
                        key={key}
                        client={client}
                        save={save}
                        refresh={refresh}
                    />
                ) : null;
            case "roles":
                return (
                    <RolesList
                        loader={loader}
                        paginated={false}
                        messageBundle="client"
                        toCreate={toCreateRole({ realm, clientId: client.id! })}
                        toDetail={roleId =>
                            toClientRole({
                                realm,
                                clientId: client.id!,
                                id: roleId,
                                tab: "details"
                            })
                        }
                        isReadOnly={!(hasManageClients || client.access?.configure)}
                    />
                );
            case "clientScopes":
                return (!isRealmClient(client) && !client.bearerOnly) ? (
                    <ClientScopes
                        clientName={client.clientId!}
                        clientId={clientId}
                        protocol={client!.protocol!}
                        fineGrainedAccess={client!.access?.manage}
                    />
                ) : null;
            case "authorization":
                return (client!.authorizationServicesEnabled &&
                    !isAdminPermissionsClient &&
                    (hasManageAuthorization || hasViewAuthorization)) ? (
                    <AuthorizationSettings clientId={clientId} />
                ) : null;
            case "serviceAccount":
                return (client!.serviceAccountsEnabled && hasViewUsers) ? (
                    <ServiceAccount client={client} />
                ) : null;
            case "sessions":
                return <ClientSessions client={client} />;
            case "permissions":
                return (permissionsEnabled && (hasManageClients || client.access?.manage)) ? (
                    <PermissionsTab id={client.id!} type="clients" />
                ) : null;
            case "advanced":
                return <AdvancedTab save={save} client={client} />;
            case "events":
                return hasAccess("view-events") ? (
                    <Tabs
                        value={activeEventsTab}
                        onValueChange={setActiveEventsTab}
                    >
                        <TabsList>
                            <TabsTrigger value="userEvents">
                                {t("userEvents")}
                            </TabsTrigger>
                            <TabsTrigger value="adminEvents">
                                {t("adminEvents")}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="userEvents">
                            <UserEvents client={client.clientId} />
                        </TabsContent>
                        <TabsContent value="adminEvents">
                            <AdminEvents
                                resourcePath={`clients/${client.id}`}
                            />
                        </TabsContent>
                    </Tabs>
                ) : null;
            default:
                return (
                    <ClientSettings
                        client={client}
                        save={() => save()}
                        reset={() => setupForm(client)}
                    />
                );
        }
    };

    return (
        <>
            <ConfirmDialogModal
                continueButtonLabel="yes"
                cancelButtonLabel="no"
                titleKey={t("changeAuthenticatorConfirmTitle", {
                    clientAuthenticatorType: clientAuthenticatorType
                })}
                open={changeAuthenticatorOpen}
                toggleDialog={toggleChangeAuthenticatorOpen}
                onConfirm={() => save({ confirmed: true })}
            >
                <>
                    {t("changeAuthenticatorConfirm", {
                        clientAuthenticatorType: clientAuthenticatorType
                    })}
                </>
            </ConfirmDialogModal>
            <DeleteConfirm />
            {downloadDialogOpen && (
                <DownloadDialog
                    id={client.id!}
                    protocol={client.protocol}
                    open
                    toggleDialog={toggleDownloadDialogOpen}
                />
            )}
            <Controller
                name="enabled"
                control={form.control}
                defaultValue={true}
                render={({ field }) => (
                    <ClientDetailHeader
                        value={field.value}
                        onChange={field.onChange}
                        client={client}
                        save={save}
                        toggleDeleteDialog={toggleDeleteDialog}
                        toggleDownloadDialog={toggleDownloadDialogOpen}
                    />
                )}
            />
            <div className="p-0">
                <FormProvider {...form}>
                    <div className="bg-muted/30">
                        {renderContent()}
                    </div>
                </FormProvider>
            </div>
        </>
    );
}
