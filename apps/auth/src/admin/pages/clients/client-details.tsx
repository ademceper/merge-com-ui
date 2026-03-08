import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Label } from "@merge-rd/ui/components/label";
import { Separator } from "@merge-rd/ui/components/separator";
import { Switch } from "@merge-rd/ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@merge-rd/ui/components/tooltip";
import { Info } from "@phosphor-icons/react";
import {
    useLocation,
    useNavigate,
    useParams as useRouterParams
} from "@tanstack/react-router";
import { cloneDeep, sortBy } from "lodash-es";
import { Fragment, isValidElement, useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useIsAdminPermissionsClient } from "../../shared/lib/useIsAdminPermissionsClient";
import useIsFeatureEnabled, { Feature } from "../../shared/lib/useIsFeatureEnabled";
import { useParams } from "../../shared/lib/useParams";
import useToggle from "../../shared/lib/useToggle";
import {
    convertAttributeNameToForm,
    convertFormValuesToObject,
    convertToFormValues,
    exportClient
} from "../../shared/lib/util";
import {
    ConfirmDialogModal,
    useConfirmDialog
} from "../../shared/ui/confirm-dialog/confirm-dialog";
import { DownloadDialog } from "../../shared/ui/download-dialog/download-dialog";
import type { KeyValueType } from "../../shared/ui/key-value-form/key-value-convert";
import { PermissionsTab } from "../../shared/ui/permission-tab/permission-tab";
import { RolesList } from "../../shared/ui/roles-list/roles-list";
import { AdminEvents } from "../events/admin-events";
import { UserEvents } from "../events/user-events";
import { AdvancedTab } from "./advanced-tab";
import { useClient } from "./api/use-client";
import { AuthorizationEvaluate } from "./authorization/authorization-evaluate";
import { AuthorizationExport } from "./authorization/authorization-export";
import { AuthorizationPermissions } from "./authorization/permissions";
import { AuthorizationPolicies } from "./authorization/policies";
import { AuthorizationResources } from "./authorization/resources";
import { AuthorizationScopes } from "./authorization/scopes";
import { AuthorizationSettings } from "./authorization/settings";
import { ClientSessions } from "./client-sessions";
import { ClientSettings } from "./client-settings";
import { Credentials } from "./credentials/credentials";
import { Keys } from "./keys/keys";
import { SamlKeys } from "./keys/saml-keys";
import type { ClientParams } from "../../shared/lib/routes/clients";
import { toClientRole } from "../../shared/lib/routes/clients";
import { toClients } from "../../shared/lib/routes/clients";
import { toCreateRole } from "../../shared/lib/routes/clients";
import { ClientScopes } from "./scopes/client-scopes";
import { EvaluateScopes } from "./scopes/evaluate-scopes";
import { ServiceAccount } from "./service-account/service-account";
import { isRealmClient } from "./utils";

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

    const badges = useMemo<
        { id?: string; text?: string | React.ReactNode; readonly?: boolean }[]
    >(() => {
        const protocol = client.protocol ?? "openid-connect";
        const label =
            protocol === "openid-connect"
                ? "OIDC"
                : protocol === "saml"
                  ? "SAML"
                  : protocol === "oid4vc"
                    ? "OID4VC"
                    : (protocol ?? "");

        const text = client.bearerOnly ? (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span
                            data-testid="bearer-only-explainer-label"
                            className="inline-flex items-center gap-1"
                        >
                            <Info className="size-4" />
                            <Badge
                                variant="secondary"
                                className="max-w-full truncate font-medium rounded-sm bg-indigo-500/15 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-300 border-0 h-auto py-1 px-2"
                            >
                                {label}
                            </Badge>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent data-testid="bearer-only-explainer-tooltip">
                        {t("explainBearerOnly")}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ) : (
            <Badge
                variant="secondary"
                className="max-w-full truncate font-medium rounded-sm bg-indigo-500/15 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-300 border-0 h-auto py-1 px-2"
            >
                {label}
            </Badge>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    {badges.map((badge, index) => (
                        <Fragment key={index}>
                            {!isValidElement(badge.text) && (
                                <Badge
                                    data-testid={badge.id}
                                    variant={badge.readonly ? "secondary" : "default"}
                                >
                                    {badge.text}
                                </Badge>
                            )}
                            {isValidElement(badge.text) && badge.text}
                        </Fragment>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <Label
                            htmlFor={`${client.clientId!.replace(/\s/g, "-")}-switch`}
                            className="text-sm"
                        >
                            {t("enabled")}
                        </Label>
                        <Switch
                            id={`${client.clientId!.replace(/\s/g, "-")}-switch`}
                            data-testid={`${client.clientId!}-switch`}
                            disabled={!isManager}
                            checked={value}
                            aria-label={t("enabled")}
                            onCheckedChange={value => {
                                if (!value) {
                                    toggleDisableDialog();
                                } else {
                                    onChange(value);
                                    save();
                                }
                            }}
                        />
                    </div>
                    {dropdownItems.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                data-testid="action-dropdown"
                                className={buttonVariants()}
                            >
                                {t("action")}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {dropdownItems}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
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
    const { tab } = useRouterParams({ strict: false }) as { tab?: string };

    const [downloadDialogOpen, toggleDownloadDialogOpen] = useToggle();
    const [changeAuthenticatorOpen, toggleChangeAuthenticatorOpen] = useToggle();

    const form = useForm<FormFields>();
    const { clientId } = useParams<ClientParams>();

    const isAdminPermissionsClient = useIsAdminPermissionsClient(clientId);

    const clientAuthenticatorType = useWatch({
        control: form.control,
        name: "clientAuthenticatorType",
        defaultValue: "client-secret"
    });

    const [client, setClient] = useState<ClientRepresentation>();
    const { data: fetchedClient, refetch } = useClient(clientId);
    const refresh = () => {
        refetch();
    };

    useEffect(() => {
        if (fetchedClient) {
            if (!fetchedClient) {
                throw new Error(t("notFound"));
            }
            setClient(cloneDeep(fetchedClient));
            setupForm(fetchedClient);
        }
    }, [fetchedClient]);

    const loader = async () => {
        const roles = await adminClient.clients.listRoles({ id: clientId });
        return sortBy(roles, role => role.name?.toUpperCase());
    };

    const [activeEventsTab, setActiveEventsTab] = useState("userEvents");

    // Check if we're in a sub-tab route
    const isClientScopesSubTab = location.pathname.includes(
        `/clients/${clientId}/clientScopes/`
    );
    const isAuthorizationSubTab = location.pathname.includes(
        `/clients/${clientId}/authorization/`
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "clientDeleteConfirmTitle",
        messageKey: "clientDeleteConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.clients.del({ id: clientId });
                toast.success(t("clientDeletedSuccess"));
                navigate({ to: toClients({ realm }) as string });
            } catch (error) {
                toast.error(t("clientDeleteError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const setupForm = (client: ClientRepresentation) => {
        convertToFormValues(client, form.setValue);
        if (client.attributes?.["acr.loa.map"]) {
            (form.setValue as (name: string, value: unknown) => void)(
                convertAttributeNameToForm("attributes.acr.loa.map"),
                Object.entries(JSON.parse(client.attributes["acr.loa.map"])).flatMap(
                    ([key, value]: [string, unknown]) => ({ key, value })
                )
            );
        }
        // reset dirty as for reason it is not resetting
        form.reset(form.getValues(), { keepDirty: false });
    };

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
            toast.success(t(messageKey));
        } catch (error) {
            toast.error(t("clientSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    if (!client) {
        return <KeycloakSpinner />;
    }

    const renderClientScopesContent = () => {
        switch (tab) {
            case "evaluate":
                return (
                    <EvaluateScopes clientId={clientId} protocol={client!.protocol!} />
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
                    <AuthorizationEvaluate client={client} save={save} />
                ) : null;
            case "export":
                return hasAccess("manage-authorization") ? <AuthorizationExport /> : null;
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
                return (!client.publicClient && !isRealmClient(client)) ||
                    client.protocol === "saml" ? (
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
                return !client.publicClient &&
                    !isRealmClient(client) &&
                    (hasViewClients ||
                        client.access?.configure ||
                        client.access?.view) ? (
                    <Credentials
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
                return !isRealmClient(client) && !client.bearerOnly ? (
                    <ClientScopes
                        clientName={client.clientId!}
                        clientId={clientId}
                        protocol={client!.protocol!}
                        fineGrainedAccess={client!.access?.manage}
                    />
                ) : null;
            case "authorization":
                return client!.authorizationServicesEnabled &&
                    !isAdminPermissionsClient &&
                    (hasManageAuthorization || hasViewAuthorization) ? (
                    <AuthorizationSettings clientId={clientId} />
                ) : null;
            case "serviceAccount":
                return client!.serviceAccountsEnabled && hasViewUsers ? (
                    <ServiceAccount client={client} />
                ) : null;
            case "sessions":
                return <ClientSessions client={client} />;
            case "permissions":
                return permissionsEnabled &&
                    (hasManageClients || client.access?.manage) ? (
                    <PermissionsTab id={client.id!} type="clients" />
                ) : null;
            case "advanced":
                return <AdvancedTab save={save} client={client} />;
            case "events":
                return hasAccess("view-events") ? (
                    <Tabs value={activeEventsTab} onValueChange={setActiveEventsTab}>
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
                            <AdminEvents resourcePath={`clients/${client.id}`} />
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
                {t("changeAuthenticatorConfirm", {
                    clientAuthenticatorType: clientAuthenticatorType
                })}
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
            <div className="pt-4 pb-6 px-0">
                <FormProvider {...form}>{renderContent()}</FormProvider>
            </div>
        </>
    );
}
