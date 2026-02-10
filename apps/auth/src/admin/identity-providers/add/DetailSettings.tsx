import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import IdentityProviderRepresentation, {
    IdentityProviderType
} from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { getErrorDescription, getErrorMessage, KeycloakSpinner, ScrollForm, useFetch } from "../../../shared/keycloak-ui-shared";
import { DataTable, DataTableRowActions, type ColumnDef } from "@merge/ui/components/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@merge/ui/components/empty";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Separator } from "@merge/ui/components/separator";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { useMemo, useState } from "react";
import {
    Controller,
    FormProvider,
    useForm,
    useFormContext,
    useWatch
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams as useRouterParams } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { DynamicComponents } from "../../components/dynamic/DynamicComponents";
import { FixedButtonsGroup } from "../../components/form/FixedButtonGroup";
import { FormAccess } from "../../components/form/FormAccess";
import { PermissionsTab } from "../../components/permission-tab/PermissionTab";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useAccess } from "../../context/access/Access";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { toUpperCase } from "../../util";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";
import { useParams } from "../../utils/useParams";
import { toIdentityProviderAddMapper } from "../routes/AddMapper";
import { toIdentityProviderEditMapper } from "../routes/EditMapper";
import {
    IdentityProviderParams,
    toIdentityProvider
} from "../routes/IdentityProvider";
import { toIdentityProviders } from "../routes/IdentityProviders";
import { AdvancedSettings } from "./AdvancedSettings";
import { DescriptorSettings } from "./DescriptorSettings";
import { DiscoverySettings } from "./DiscoverySettings";
import { ExtendedNonDiscoverySettings } from "./ExtendedNonDiscoverySettings";
import { ExtendedOAuth2Settings } from "./ExtendedOAuth2Settings";
import { GeneralSettings } from "./GeneralSettings";
import { OIDCAuthentication } from "./OIDCAuthentication";
import { OIDCGeneralSettings } from "./OIDCGeneralSettings";
import { ReqAuthnConstraints } from "./ReqAuthnConstraintsSettings";
import { SamlGeneralSettings } from "./SamlGeneralSettings";
import { SpiffeSettings } from "./SpiffeSettings";
import { AdminEvents } from "../../events/AdminEvents";
import { UserProfileClaimsSettings } from "./OAuth2UserProfileClaimsSettings";
import { KubernetesSettings } from "./KubernetesSettings";
import { JWTAuthorizationGrantAssertionSettings } from "./JWTAuthorizationGrantAssertionSettings";
import JWTAuthorizationGrantSettings from "./JWTAuthorizationGrantSettings";
import { DefaultSwitchControl } from "../../components/SwitchControl";

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
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { alias: displayName } = useParams<{ alias: string }>();
    const [provider, setProvider] = useState<IdentityProviderRepresentation>();
const { setValue, formState, control } = useFormContext();

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

    useFetch(
        () => adminClient.identityProviders.findOne({ alias: displayName }),
        fetchedProvider => {
            if (!fetchedProvider) {
                throw new Error(t("notFound"));
            }
            setProvider(fetchedProvider);
        },
        []
    );

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
            const result = await adminClient.identityProviders.importFromUrl({
                providerId: providerId,
                fromUrl: metadataDescriptorUrl
            });
            if (result.signingCertificate) {
                setValue(`config.signingCertificate`, result.signingCertificate);
                toast.success(t("importKeysSuccess"));
            } else {
                toast.error(t("importKeysError", { error: t("importKeysErrorNoSigningCertificate") }));
            }
        } catch (error) {
            toast.error(t("importKeysError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const reloadSamlKeys = async (alias: string) => {
        try {
            const result = await adminClient.identityProviders.reloadKeys({
                alias: alias
            });
            if (result) {
                toast.success(t("reloadKeysSuccess"));
            } else {
                toast.warning(t("reloadKeysSuccessButFalse"));
            }
        } catch (error) {
            toast.error(t("reloadKeysError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            <DisableConfirm />
            <ViewHeader
                titleKey={toUpperCase(
                    provider
                        ? provider.displayName
                            ? provider.displayName
                            : provider.providerId!
                        : ""
                )}
                divider={false}
                dropdownItems={[
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
                                        importSamlKeys(
                                            provider.providerId!,
                                            metadataDescriptorUrl
                                        )
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
                ]}
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

type MapperLinkProps = IdPWithMapperAttributes & {
    provider?: IdentityProviderRepresentation;
};

const MapperLink = ({ name, mapperId, provider }: MapperLinkProps) => {
    const { realm } = useRealm();
    const { alias } = useParams<IdentityProviderParams>();

    return (
        <Link
            to={toIdentityProviderEditMapper({
                realm,
                alias,
                providerId: provider?.providerId!,
                id: mapperId
            })}
        >
            {name}
        </Link>
    );
};

export default function DetailSettings() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { alias, providerId } = useParams<IdentityProviderParams>();
    const { tab } = useRouterParams<{ tab?: string }>();
    const isFeatureEnabled = useIsFeatureEnabled();
    const form = useForm<IdentityProviderRepresentation>();
    const { handleSubmit, getValues, reset, control } = form;
    const [provider, setProvider] = useState<IdentityProviderRepresentation>();
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
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const { hasAccess } = useAccess();

    useFetch(
        () => adminClient.identityProviders.findOne({ alias }),
        fetchedProvider => {
            if (!fetchedProvider) {
                throw new Error(t("notFound"));
            }

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
        },
        []
    );

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
            await adminClient.identityProviders.update(
                { alias },
                {
                    ...p,
                    config: { ...provider?.config, ...p.config },
                    alias,
                    providerId
                }
            );
            if (origAuthnContextClassRefs) {
                p.config!.authnContextClassRefs = origAuthnContextClassRefs;
            }
            if (origAuthnContextDeclRefs) {
                p.config!.authnContextDeclRefs = origAuthnContextDeclRefs;
            }
            reset(p);
            toast.success(t("updateSuccessIdentityProvider"));
        } catch (error) {
            toast.error(t("updateErrorIdentityProvider", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteProvider",
        messageKey: t("deleteConfirmIdentityProvider", { provider: alias }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.identityProviders.del({ alias: alias });
                toast.success(t("deletedSuccessIdentityProvider"));
                navigate(toIdentityProviders({ realm }));
            } catch (error) {
                toast.error(t("deleteErrorIdentityProvider", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                await adminClient.identityProviders.delMapper({
                    alias: alias,
                    id: selectedMapper?.mapperId!
                });
                toast.success(t("deleteMapperSuccess"));
                refresh();
                navigate(
                    toIdentityProvider({ providerId, alias, tab: "mappers", realm })
                );
            } catch (error) {
                toast.error(t("deleteErrorIdentityProvider", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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

    const [mappers, setMappers] = useState<IdPWithMapperAttributes[]>([]);

    useFetch(
        async () => {
            const [loaderMappers, loaderMapperTypes] = await Promise.all([
                adminClient.identityProviders.findMappers({ alias }),
                adminClient.identityProviders.findMapperTypes({ alias })
            ]);
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
        },
        setMappers,
        [key, alias]
    );

    const mapperColumns: ColumnDef<IdPWithMapperAttributes>[] = [
        { accessorKey: "name", header: t("name"), cell: ({ row }) => <MapperLink {...row.original} provider={provider} /> },
        { accessorKey: "category", header: t("category") },
        { accessorKey: "type", header: t("type") },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <DropdownMenuItem onClick={() => { setSelectedMapper(row.original); toggleDeleteMapperDialog(); }} className="text-destructive">
                        {t("delete")}
                    </DropdownMenuItem>
                </DataTableRowActions>
            )
        }
    ];

    const renderContent = () => {
        switch (tab) {
            case "mappers":
                return (isSPIFFE || isKubernetes || isJWTAuthorizationGrant) ? null : (
                    <DataTable<IdPWithMapperAttributes>
                        key={key}
                        columns={mapperColumns}
                        data={mappers}
                        searchColumnId="name"
                        searchPlaceholder={t("searchForMapper")}
                        emptyContent={
                            <Empty className="py-12">
                                <EmptyHeader><EmptyTitle>{t("noMappers")}</EmptyTitle></EmptyHeader>
                                <EmptyContent><EmptyDescription>{t("noMappersInstructions")}</EmptyDescription></EmptyContent>
                                <Button className="mt-2" asChild>
                                    <Link to={toIdentityProviderAddMapper({ realm, alias: alias!, providerId: provider.providerId!, tab: "mappers" })}>
                                        {t("addMapper")}
                                    </Link>
                                </Button>
                            </Empty>
                        }
                        emptyMessage={t("noMappers")}
                        toolbar={
                            <Button id="add-mapper-button" asChild data-testid="addMapper">
                                <Link to={toIdentityProviderAddMapper({ realm, alias: alias!, providerId: provider.providerId!, tab: "mappers" })}>
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
                return (realmRepresentation?.adminEventsEnabled && hasAccess("view-events")) ? (
                    <AdminEvents
                        resourcePath={`identity-provider/instances/${alias}`}
                    />
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
                    <p className="pb-4">
                        {t("authorizationGrantSettingsHelp")}
                    </p>
                    <form
                        className="py-4"
                        onSubmit={handleSubmit(save)}
                    >
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
                <form
                    className="py-4"
                    onSubmit={handleSubmit(save)}
                >
                    <SpiffeSettings />
                    <FixedButtonsGroup name="idp-details" isSubmit reset={reset} />
                </form>
            )
        },
        {
            title: t("generalSettings"),
            isHidden: !isJWTAuthorizationGrant,
            panel: (
                <form
                    className="py-4"
                    onSubmit={handleSubmit(save)}
                >
                    <JWTAuthorizationGrantSettings />
                    <FixedButtonsGroup name="idp-details" isSubmit reset={reset} />
                </form>
            )
        },
        {
            title: t("generalSettings"),
            isHidden: !isKubernetes,
            panel: (
                <form
                    className="py-4"
                    onSubmit={handleSubmit(save)}
                >
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
                <div className="bg-muted/30">
                    {renderContent()}
                </div>
            </div>
        </FormProvider>
    );
}
