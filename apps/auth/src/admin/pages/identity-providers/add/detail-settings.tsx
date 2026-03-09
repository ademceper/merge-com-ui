import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { IdentityProviderType } from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Label } from "@merge-rd/ui/components/label";
import { Separator } from "@merge-rd/ui/components/separator";
import { Switch } from "@merge-rd/ui/components/switch";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
    Controller,
    FormProvider,
    useForm,
    useFormContext,
    useWatch
} from "react-hook-form";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner,
    ScrollForm
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import {
    type IdentityProviderParams,
    toIdentityProvider,
    toIdentityProviderAddMapper,
    toIdentityProviderEditMapper,
    toIdentityProviders
} from "@/admin/shared/lib/routes/identity-providers";
import { useIsFeatureEnabled, Feature } from "@/admin/shared/lib/use-is-feature-enabled";
import { useParams, useParams as useRouterParams } from "@/admin/shared/lib/use-params";
import { toUpperCase } from "@/admin/shared/lib/util";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { DynamicComponents } from "@/admin/shared/ui/dynamic/dynamic-components";
import { FixedButtonsGroup } from "@/admin/shared/ui/form/fixed-button-group";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { PermissionsTab } from "@/admin/shared/ui/permission-tab/permission-tab";
import { DefaultSwitchControl } from "@/admin/shared/ui/switch-control";
import { AdminEvents } from "@/admin/pages/events/admin-events";
import { idpKeys } from "../hooks/keys";
import { useDeleteIdentityProvider } from "../hooks/use-delete-identity-provider";
import { useDeleteIdentityProviderMapper } from "../hooks/use-delete-identity-provider-mapper";
import { useIdentityProvider } from "../hooks/use-identity-provider";
import { useIdentityProviderMapperTypes } from "../hooks/use-identity-provider-mapper-types";
import { useIdentityProviderMappers } from "../hooks/use-identity-provider-mappers";
import { useImportFromUrl } from "../hooks/use-import-from-url";
import { useReloadKeys } from "../hooks/use-reload-keys";
import { useUpdateIdentityProvider } from "../hooks/use-update-identity-provider";
import { AdvancedSettings } from "./advanced-settings";
import { DescriptorSettings } from "./descriptor-settings";
import { DiscoverySettings } from "./discovery-settings";
import { ExtendedNonDiscoverySettings } from "./extended-non-discovery-settings";
import { ExtendedOAuth2Settings } from "./extended-o-auth2-settings";
import { GeneralSettings } from "./general-settings";
import { JWTAuthorizationGrantAssertionSettings } from "./jwt-authorization-grant-assertion-settings";
import { JWTAuthorizationGrantSettings } from "./jwt-authorization-grant-settings";
import { KubernetesSettings } from "./kubernetes-settings";
import { UserProfileClaimsSettings } from "./o-auth2-user-profile-claims-settings";
import { OIDCAuthentication } from "./oidc-authentication";
import { OIDCGeneralSettings } from "./oidc-general-settings";
import { ReqAuthnConstraints } from "./req-authn-constraints-settings";
import { SamlGeneralSettings } from "./saml-general-settings";
import { SpiffeSettings } from "./spiffe-settings";

type HeaderProps = {
    onChange: (value: boolean) => void;
    value: boolean;
    save: () => void;
    toggleDeleteDialog: () => void;
};

type IdPWithMapperAttributes = IdentityProviderMapperRepresentation & {
    name: string;
    category?: string;
    helpText?: string;
    type: string;
    mapperId: string;
};

const Header = ({ onChange, value, save, toggleDeleteDialog }: HeaderProps) => {

    const { t } = useTranslation();
    const { alias: displayName } = useParams<{ alias: string }>();
    const { data: provider } = useIdentityProvider(displayName);
    const { setValue, formState, control } = useFormContext();
    const { mutateAsync: importFromUrlMutation } = useImportFromUrl();
    const { mutateAsync: reloadKeysMutation } = useReloadKeys();

    const validateSignature = useWatch({
        control,
        name: "config.validateSignature"
    });

    const useMetadataDescriptorUrl = useWatch({
        control,
        name: "config.useMetadataDescriptorUrl"
    });

    const metadataDescriptorUrl = useWatch({
        control,
        name: "config.metadataDescriptorUrl"
    });

    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "disableProvider",
        messageKey: t("disableConfirmIdentityProvider", { provider: displayName }),
        continueButtonLabel: "disable",
        onConfirm: () => {
            onChange(!value);
            save();
        }
    });

    const importSamlKeys = async (providerId: string, metadataDescriptorUrl: string) => {
        try {
            const result = await importFromUrlMutation({
                providerId: providerId,
                fromUrl: metadataDescriptorUrl
            });
            if (result.signingCertificate) {
                setValue(`config.signingCertificate`, result.signingCertificate);
                toast.success(t("importKeysSuccess"));
            } else {
                toast.error(
                    t("importKeysError", {
                        error: t("importKeysErrorNoSigningCertificate")
                    })
                );
            }
        } catch (error) {
            toast.error(t("importKeysError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const reloadSamlKeys = async (alias: string) => {
        try {
            const result = await reloadKeysMutation(alias);
            if (result) {
                toast.success(t("reloadKeysSuccess"));
            } else {
                toast.warning(t("reloadKeysSuccessButFalse"));
            }
        } catch (error) {
            toast.error(t("reloadKeysError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const headerTitleKey = toUpperCase(
        provider
            ? provider.displayName
                ? provider.displayName
                : provider.providerId!
            : ""
    );

    const dropdownItems = [
        ...(provider?.providerId?.includes("saml") &&
        validateSignature === "true" &&
        useMetadataDescriptorUrl === "true" &&
        metadataDescriptorUrl &&
        !formState.isDirty &&
        value
            ? [
                  <DropdownMenuItem
                      key="reloadKeys"
                      onClick={() => reloadSamlKeys(provider.alias!)}
                  >
                      {t("reloadKeys")}
                  </DropdownMenuItem>
              ]
            : provider?.providerId?.includes("saml") &&
                validateSignature === "true" &&
                useMetadataDescriptorUrl !== "true" &&
                metadataDescriptorUrl &&
                !formState.isDirty
              ? [
                    <DropdownMenuItem
                        key="importKeys"
                        onClick={() =>
                            importSamlKeys(provider.providerId!, metadataDescriptorUrl)
                        }
                    >
                        {t("importKeys")}
                    </DropdownMenuItem>
                ]
              : []),
        <Separator key="separator" />,
        <DropdownMenuItem key="delete" onClick={() => toggleDeleteDialog()}>
            {t("delete")}
        </DropdownMenuItem>
    ];

    return (
        <>
            <DisableConfirm />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2" />
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <Label
                            htmlFor={`${headerTitleKey.replace(/\s/g, "-")}-switch`}
                            className="text-sm"
                        >
                            {t("enabled")}
                        </Label>
                        <Switch
                            id={`${headerTitleKey.replace(/\s/g, "-")}-switch`}
                            data-testid={`${headerTitleKey}-switch`}
                            checked={value}
                            aria-label={t("enabled")}
                            onCheckedChange={val => {
                                if (!val) {
                                    toggleDisableDialog();
                                } else {
                                    onChange(val);
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

type MapperLinkProps = IdPWithMapperAttributes & {
    provider?: IdentityProviderRepresentation;
};

const MapperLink = ({ name, mapperId, provider }: MapperLinkProps) => {
    const { realm } = useRealm();
    const { alias } = useParams<IdentityProviderParams>();

    return (
        <Link
            to={
                toIdentityProviderEditMapper({
                    realm,
                    alias,
                    providerId: provider?.providerId!,
                    id: mapperId
                }) as string
            }
        >
            {name}
        </Link>
    );
};

export function DetailSettings() {
    const queryClient = useQueryClient();

    const { t } = useTranslation();
    const { alias, providerId } = useParams<IdentityProviderParams>();
    const { tab } = useRouterParams<{ tab?: string }>();
    const isFeatureEnabled = useIsFeatureEnabled();
    const form = useForm<IdentityProviderRepresentation>();
    const { handleSubmit, getValues, reset, control } = form;
    const [provider, setProvider] = useState<IdentityProviderRepresentation>();
    const { mutateAsync: updateIdp } = useUpdateIdentityProvider(alias);
    const { mutateAsync: deleteIdp } = useDeleteIdentityProvider();
    const { mutateAsync: deleteMapperMutation } = useDeleteIdentityProviderMapper(alias);
    const [selectedMapper, setSelectedMapper] = useState<IdPWithMapperAttributes>();
    const serverInfo = useServerInfo();
    const providerInfo = useMemo(() => {
        const namespaces = [
            "org.keycloak.broker.social.SocialIdentityProvider",
            "org.keycloak.broker.provider.IdentityProvider"
        ];

        for (const namespace of namespaces) {
            const social = serverInfo.componentTypes?.[namespace]?.find(
                ({ id }) => id === providerId
            );

            if (social) {
                return social;
            }
        }
    }, [serverInfo, providerId]);
    const navigate = useNavigate();
    const { realm, realmRepresentation } = useRealm();
    const { hasAccess } = useAccess();

    const { data: fetchedProvider } = useIdentityProvider(alias);

    useEffect(() => {
        if (fetchedProvider) {
            if (!provider) {
                reset(fetchedProvider);
                setProvider(fetchedProvider);

                if (fetchedProvider.config!.authnContextClassRefs) {
                    form.setValue(
                        "config.authnContextClassRefs",
                        JSON.parse(fetchedProvider.config?.authnContextClassRefs)
                    );
                }

                if (fetchedProvider.config!.authnContextDeclRefs) {
                    form.setValue(
                        "config.authnContextDeclRefs",
                        JSON.parse(fetchedProvider.config?.authnContextDeclRefs)
                    );
                }
            }
        }
    }, [fetchedProvider]);

    const save = async (savedProvider?: IdentityProviderRepresentation) => {
        const p = savedProvider || getValues();
        const origAuthnContextClassRefs = p.config?.authnContextClassRefs;
        if (p.config?.authnContextClassRefs)
            p.config.authnContextClassRefs = JSON.stringify(
                p.config.authnContextClassRefs
            );
        const origAuthnContextDeclRefs = p.config?.authnContextDeclRefs;
        if (p.config?.authnContextDeclRefs)
            p.config.authnContextDeclRefs = JSON.stringify(p.config.authnContextDeclRefs);

        try {
            await updateIdp({
                ...p,
                config: { ...provider?.config, ...p.config },
                alias,
                providerId
            });
            if (origAuthnContextClassRefs) {
                p.config!.authnContextClassRefs = origAuthnContextClassRefs;
            }
            if (origAuthnContextDeclRefs) {
                p.config!.authnContextDeclRefs = origAuthnContextDeclRefs;
            }
            reset(p);
            toast.success(t("updateSuccessIdentityProvider"));
        } catch (error) {
            toast.error(
                t("updateErrorIdentityProvider", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteProvider",
        messageKey: t("deleteConfirmIdentityProvider", { provider: alias }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await deleteIdp(alias);
                toast.success(t("deletedSuccessIdentityProvider"));
                navigate({ to: toIdentityProviders({ realm }) as string });
            } catch (error) {
                toast.error(
                    t("deleteErrorIdentityProvider", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        }
    });

    const [toggleDeleteMapperDialog, DeleteMapperConfirm] = useConfirmDialog({
        titleKey: "deleteProviderMapper",
        messageKey: t("deleteMapperConfirm", {
            mapper: selectedMapper?.name
        }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await deleteMapperMutation(selectedMapper?.mapperId!);
                toast.success(t("deleteMapperSuccess"));
                await queryClient.invalidateQueries({ queryKey: idpKeys.mappers(alias) });
                navigate({
                    to: toIdentityProvider({
                        providerId,
                        alias,
                        tab: "mappers",
                        realm
                    }) as string
                });
            } catch (error) {
                toast.error(
                    t("deleteErrorIdentityProvider", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        }
    });
    const jwtAuthorizationGrantEnabled = useWatch({
        control,
        name: "config.jwtAuthorizationGrantEnabled"
    });

    if (!provider) {
        return <KeycloakSpinner />;
    }

    const isOIDC = provider.providerId!.includes("oidc");
    const isSAML = provider.providerId!.includes("saml");
    const isOAuth2 = provider.providerId!.includes("oauth2");
    const isSPIFFE = provider.providerId!.includes("spiffe");
    const isKubernetes = provider.providerId!.includes("kubernetes");
    const isJWTAuthorizationGrant = provider.providerId!.includes(
        "jwt-authorization-grant"
    );
    const isSocial = !isOIDC && !isSAML && !isOAuth2;
    const isJWTAuthorizationGrantSupported =
        (isOAuth2 || isOIDC) &&
        !!provider?.types?.includes(IdentityProviderType.JWT_AUTHORIZATION_GRANT) &&
        isFeatureEnabled(Feature.JWTAuthorizationGrant);

    const { data: loaderMappers = [] } = useIdentityProviderMappers(alias);
    const { data: loaderMapperTypes } = useIdentityProviderMapperTypes(alias);

    const mappers = useMemo(() => {
        if (!loaderMappers || !loaderMapperTypes) return [];
        return loaderMappers.map(loaderMapper => {
            const mapperType = Object.values(loaderMapperTypes).find(
                mt => loaderMapper.identityProviderMapper! === mt.id!
            );
            return {
                ...mapperType,
                name: loaderMapper.name!,
                type: mapperType?.name!,
                mapperId: loaderMapper.id!
            } as IdPWithMapperAttributes;
        });
    }, [loaderMappers, loaderMapperTypes]);

    const mapperColumns: ColumnDef<IdPWithMapperAttributes>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => <MapperLink {...row.original} provider={provider} />
        },
        { accessorKey: "category", header: t("category") },
        { accessorKey: "type", header: t("type") },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <DropdownMenuItem
                        onClick={() => {
                            setSelectedMapper(row.original);
                            toggleDeleteMapperDialog();
                        }}
                        className="text-destructive"
                    >
                        {t("delete")}
                    </DropdownMenuItem>
                </DataTableRowActions>
            )
        }
    ];

    const renderContent = () => {
        switch (tab) {
            case "mappers":
                return isSPIFFE || isKubernetes || isJWTAuthorizationGrant ? null : (
                    <DataTable<IdPWithMapperAttributes>
                        columns={mapperColumns}
                        data={mappers}
                        searchColumnId="name"
                        searchPlaceholder={t("searchForMapper")}
                        emptyContent={
                            <Empty className="py-12">
                                <EmptyHeader>
                                    <EmptyTitle>{t("noMappers")}</EmptyTitle>
                                </EmptyHeader>
                                <EmptyContent>
                                    <EmptyDescription>
                                        {t("noMappersInstructions")}
                                    </EmptyDescription>
                                </EmptyContent>
                                <Button className="mt-2" asChild>
                                    <Link
                                        to={
                                            toIdentityProviderAddMapper({
                                                realm,
                                                alias: alias!,
                                                providerId: provider.providerId!,
                                                tab: "mappers"
                                            }) as string
                                        }
                                    >
                                        {t("addMapper")}
                                    </Link>
                                </Button>
                            </Empty>
                        }
                        emptyMessage={t("noMappers")}
                        toolbar={
                            <Button
                                id="add-mapper-button"
                                asChild
                                data-testid="addMapper"
                            >
                                <Link
                                    to={
                                        toIdentityProviderAddMapper({
                                            realm,
                                            alias: alias!,
                                            providerId: provider.providerId!,
                                            tab: "mappers"
                                        }) as string
                                    }
                                >
                                    {t("addMapper")}
                                </Link>
                            </Button>
                        }
                    />
                );
            case "permissions":
                return isFeatureEnabled(Feature.AdminFineGrainedAuthz) ? (
                    <PermissionsTab id={alias} type="identityProviders" />
                ) : null;
            case "events":
                return realmRepresentation?.adminEventsEnabled &&
                    hasAccess("view-events") ? (
                    <AdminEvents resourcePath={`identity-provider/instances/${alias}`} />
                ) : null;
            default:
                return (
                    <ScrollForm
                        label={t("jumpToSection")}
                        className="px-4"
                        sections={sections}
                    />
                );
        }
    };

    const sections = [
        {
            title: t("generalSettings"),
            isHidden: isSPIFFE || isKubernetes || isJWTAuthorizationGrant,
            panel: (
                <FormAccess
                    role="manage-identity-providers"
                    isHorizontal
                    onSubmit={handleSubmit(save)}
                >
                    {isSocial && <GeneralSettings create={false} id={providerId} />}
                    {(isOIDC || isOAuth2) && <OIDCGeneralSettings />}
                    {isSAML && <SamlGeneralSettings isAliasReadonly />}
                    {providerInfo && (
                        <DynamicComponents
                            stringify
                            properties={providerInfo.properties}
                        />
                    )}
                </FormAccess>
            )
        },
        {
            title: t("oidcSettings"),
            isHidden: !isOIDC,
            panel: (
                <>
                    <DiscoverySettings readOnly={false} isOIDC={isOIDC} />
                    <form className="py-4">
                        <Separator />
                        <OIDCAuthentication create={false} />
                    </form>
                    <ExtendedNonDiscoverySettings />
                </>
            )
        },
        {
            title: t("oAuthSettings"),
            isHidden: !isOAuth2,
            panel: (
                <>
                    <DiscoverySettings readOnly={false} isOIDC={isOIDC} />
                    <form className="py-4">
                        <Separator />
                        <OIDCAuthentication create={false} />
                    </form>
                    <UserProfileClaimsSettings />
                    <ExtendedOAuth2Settings />
                </>
            )
        },
        {
            title: t("authorizationGrantSettings"),
            isHidden: !isJWTAuthorizationGrantSupported,
            panel: (
                <>
                    <p className="pb-4">{t("authorizationGrantSettingsHelp")}</p>
                    <form className="py-4" onSubmit={handleSubmit(save)}>
                        <DefaultSwitchControl
                            name="config.jwtAuthorizationGrantEnabled"
                            label={t("jwtAuthorizationGrantIdpEnabled")}
                            labelIcon={t("jwtAuthorizationGrantIdpEnabledHelp")}
                            stringify
                        />

                        {jwtAuthorizationGrantEnabled === "true" && (
                            <JWTAuthorizationGrantAssertionSettings />
                        )}
                    </form>
                </>
            )
        },
        {
            title: t("generalSettings"),
            isHidden: !isSPIFFE,
            panel: (
                <form className="py-4" onSubmit={handleSubmit(save)}>
                    <SpiffeSettings />
                    <FixedButtonsGroup name="idp-details" isSubmit reset={reset} />
                </form>
            )
        },
        {
            title: t("generalSettings"),
            isHidden: !isJWTAuthorizationGrant,
            panel: (
                <form className="py-4" onSubmit={handleSubmit(save)}>
                    <JWTAuthorizationGrantSettings />
                    <FixedButtonsGroup name="idp-details" isSubmit reset={reset} />
                </form>
            )
        },
        {
            title: t("generalSettings"),
            isHidden: !isKubernetes,
            panel: (
                <form className="py-4" onSubmit={handleSubmit(save)}>
                    <KubernetesSettings />
                    <FixedButtonsGroup name="idp-details" isSubmit reset={reset} />
                </form>
            )
        },
        {
            title: t("samlSettings"),
            isHidden: !isSAML,
            panel: <DescriptorSettings readOnly={false} />
        },
        {
            title: t("reqAuthnConstraints"),
            isHidden: !isSAML,
            panel: (
                <FormAccess
                    role="manage-identity-providers"
                    isHorizontal
                    onSubmit={handleSubmit(save)}
                >
                    <ReqAuthnConstraints />
                </FormAccess>
            )
        },
        {
            title: t("advancedSettings"),
            isHidden: isSPIFFE || isKubernetes || isJWTAuthorizationGrant,
            panel: (
                <FormAccess
                    role="manage-identity-providers"
                    isHorizontal
                    onSubmit={handleSubmit(save)}
                >
                    <AdvancedSettings
                        isOIDC={isOIDC!}
                        isSAML={isSAML!}
                        isOAuth2={isOAuth2!}
                    />

                    <FixedButtonsGroup name="idp-details" isSubmit reset={reset} />
                </FormAccess>
            )
        }
    ];

    return (
        <FormProvider {...form}>
            <DeleteConfirm />
            <DeleteMapperConfirm />
            <Controller
                name="enabled"
                control={form.control}
                defaultValue={true}
                render={({ field }) => (
                    <Header
                        value={field.value || false}
                        onChange={field.onChange}
                        save={save}
                        toggleDeleteDialog={toggleDeleteDialog}
                    />
                )}
            />

            <div className="p-0">
                <div className="bg-muted/30">{renderContent()}</div>
            </div>
        </FormProvider>
    );
}
