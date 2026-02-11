import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import {
    UnmanagedAttributePolicy,
    UserProfileConfig
} from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import {
    FormErrorText,
    HelpItem,
    KeycloakSpinner,
    SelectField,
    TextControl,
    useEnvironment,
    useFetch
} from "../../shared/keycloak-ui-shared";
import { FormPanel } from "../../shared/keycloak-ui-shared/scroll-form/FormPanel";
import { Button } from "@merge/ui/components/button";
import { Link } from "@merge/ui/components/link";
import { Copy, ArrowSquareOut } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { DefaultSwitchControl } from "../components/SwitchControl";
import { FixedButtonsGroup } from "../components/form/FixedButtonGroup";
import { FormAccess } from "../components/form/FormAccess";
import { KeyValueInput } from "../components/key-value-form/KeyValueInput";
import { useRealm } from "../context/realm-context/RealmContext";
import {
    addTrailingSlash,
    convertAttributeNameToForm,
    convertToFormValues
} from "../util";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import { UIRealmRepresentation } from "./RealmSettingsTabs";
import { SIGNATURE_ALGORITHMS } from "../clients/add/SamlSignature";

type RealmSettingsGeneralTabProps = {
    realm: UIRealmRepresentation;
    save: (realm: UIRealmRepresentation) => Promise<void>;
};

export const RealmSettingsGeneralTab = ({
    realm,
    save
}: RealmSettingsGeneralTabProps) => {
    const { adminClient } = useAdminClient();

    const { realm: realmName } = useRealm();
    const [userProfileConfig, setUserProfileConfig] = useState<UserProfileConfig>();

    useFetch(
        () => adminClient.users.getProfile({ realm: realmName }),
        config => setUserProfileConfig(config),
        []
    );

    if (!userProfileConfig) {
        return <KeycloakSpinner />;
    }

    return (
        <RealmSettingsGeneralTabForm
            realm={realm}
            save={save}
            userProfileConfig={userProfileConfig}
        />
    );
};

type RealmSettingsGeneralTabFormProps = {
    realm: UIRealmRepresentation;
    save: (realm: UIRealmRepresentation) => Promise<void>;
    userProfileConfig: UserProfileConfig;
};

type FormFields = Omit<RealmRepresentation, "groups"> & {
    unmanagedAttributePolicy: UnmanagedAttributePolicy;
};

const REQUIRE_SSL_TYPES = ["all", "external", "none"];

const UNMANAGED_ATTRIBUTE_POLICIES = [
    UnmanagedAttributePolicy.Disabled,
    UnmanagedAttributePolicy.Enabled,
    UnmanagedAttributePolicy.AdminView,
    UnmanagedAttributePolicy.AdminEdit
];

function RealmSettingsGeneralTabForm({
    realm,
    save,
    userProfileConfig
}: RealmSettingsGeneralTabFormProps) {
    const {
        environment: { serverBaseUrl }
    } = useEnvironment();

    const { t } = useTranslation();
    const { realm: realmName } = useRealm();
    const form = useForm<FormFields>();
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors }
    } = form;
    const isFeatureEnabled = useIsFeatureEnabled();
    const isOrganizationsEnabled = isFeatureEnabled(Feature.Organizations);
    const isAdminPermissionsV2Enabled = isFeatureEnabled(Feature.AdminFineGrainedAuthzV2);
    const isOpenid4vciEnabled = isFeatureEnabled(Feature.OpenId4VCI);

    const setupForm = () => {
        convertToFormValues(realm, setValue);
        setValue(
            "unmanagedAttributePolicy",
            userProfileConfig.unmanagedAttributePolicy || UNMANAGED_ATTRIBUTE_POLICIES[0]
        );
        if (realm.attributes?.["acr.loa.map"]) {
            const result = Object.entries(
                JSON.parse(realm.attributes["acr.loa.map"])
            ).flatMap(([key, value]) => ({ key, value }));
            result.concat({ key: "", value: "" });
            setValue(convertAttributeNameToForm("attributes.acr.loa.map") as any, result);
        }
    };

    useEffect(setupForm, []);

    const onSubmit = handleSubmit(async ({ unmanagedAttributePolicy, ...data }) => {
        const upConfig = { ...userProfileConfig };

        if (unmanagedAttributePolicy === UnmanagedAttributePolicy.Disabled) {
            delete upConfig.unmanagedAttributePolicy;
        } else {
            upConfig.unmanagedAttributePolicy = unmanagedAttributePolicy;
        }

        await save({ ...data, upConfig });
    });

    return (
        <div className="pt-0">
            <FormProvider {...form}>
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    className="mt-6 space-y-6"
                    onSubmit={onSubmit}
                >
                    <FormPanel title={t("realmName")}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="kc-realm-id" className="text-sm font-medium">
                                    {t("realmName")} *
                                </label>
                                <Controller
                                    name="realm"
                                    control={control}
                                    rules={{
                                        required: { value: true, message: t("required") }
                                    }}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <div className="flex items-center gap-2" data-testid="realmName">
                                            <span className="font-mono rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                                                {field.value}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="size-8 shrink-0"
                                                onClick={() => navigator.clipboard.writeText(field.value || "")}
                                                aria-label={t("copy")}
                                            >
                                                <Copy className="size-4" />
                                            </Button>
                                        </div>
                                    )}
                                />
                                {errors.realm && (
                                    <FormErrorText
                                        data-testid="realm-id-error"
                                        message={errors.realm.message as string}
                                    />
                                )}
                            </div>
                            <TextControl name="displayName" label={t("displayName")} />
                            <TextControl name="displayNameHtml" label={t("htmlDisplayName")} />
                            <TextControl
                                name={convertAttributeNameToForm("attributes.frontendUrl")}
                                type="url"
                                label={t("frontendUrl")}
                                labelIcon={t("frontendUrlHelp")}
                            />
                            <SelectField
                                name="sslRequired"
                                label={t("requireSsl")}
                                labelIcon={t("requireSslHelp")}
                                defaultValue="none"
                                options={REQUIRE_SSL_TYPES.map(sslType => ({
                                    key: sslType,
                                    value: t(`sslType.${sslType}`)
                                }))}
                            />
                        </div>
                    </FormPanel>

                    <FormPanel title={t("acrToLoAMapping")}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <label htmlFor="acrToLoAMapping" className="text-sm font-medium">
                                    {t("acrToLoAMapping")}
                                </label>
                                <HelpItem
                                    helpText={t("acrToLoAMappingHelp")}
                                    fieldLabelId="acrToLoAMapping"
                                />
                            </div>
                            <KeyValueInput
                                label={t("acrToLoAMapping")}
                                name={convertAttributeNameToForm("attributes.acr.loa.map")}
                            />
                        </div>
                    </FormPanel>

                    <FormPanel title={t("generalOptions")}>
                        <div className="space-y-4">
                            <DefaultSwitchControl
                                name="userManagedAccessAllowed"
                                label={t("userManagedAccess")}
                                labelIcon={t("userManagedAccessHelp")}
                            />
                            {isOrganizationsEnabled && (
                                <DefaultSwitchControl
                                    name="organizationsEnabled"
                                    label={t("organizationsEnabled")}
                                    labelIcon={t("organizationsEnabledHelp")}
                                />
                            )}
                            {isAdminPermissionsV2Enabled && (
                                <DefaultSwitchControl
                                    name="adminPermissionsEnabled"
                                    label={t("adminPermissionsEnabled")}
                                    labelIcon={t("adminPermissionsEnabledHelp")}
                                />
                            )}
                            {isOpenid4vciEnabled && (
                                <DefaultSwitchControl
                                    name="verifiableCredentialsEnabled"
                                    label={t("verifiableCredentialsEnabled")}
                                    labelIcon={t("verifiableCredentialsEnabledHelp")}
                                />
                            )}
                            <SelectField
                                name="unmanagedAttributePolicy"
                                label={t("unmanagedAttributes")}
                                labelIcon={t("unmanagedAttributesHelpText")}
                                defaultValue={UNMANAGED_ATTRIBUTE_POLICIES[0]}
                                options={UNMANAGED_ATTRIBUTE_POLICIES.map(policy => ({
                                    key: policy,
                                    value: t(`unmanagedAttributePolicy.${policy}`)
                                }))}
                            />
                            <SelectField
                                name={convertAttributeNameToForm<FormFields>(
                                    "attributes.saml.signature.algorithm"
                                )}
                                label={t("signatureAlgorithmIdentityProviderMetadata")}
                                labelIcon={t("signatureAlgorithmIdentityProviderMetadataHelp")}
                                defaultValue=""
                                placeholderText={t("choose")}
                                options={SIGNATURE_ALGORITHMS.map(v => ({ key: v, value: v }))}
                            />
                        </div>
                    </FormPanel>

                    <FormPanel title={t("endpoints")}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <label htmlFor="kc-endpoints" className="text-sm font-medium">
                                    {t("endpoints")}
                                </label>
                                <HelpItem
                                    helpText={t("endpointsHelp")}
                                    fieldLabelId="endpoints"
                                />
                            </div>
                            <div className="text-muted-foreground mt-1 flex flex-col gap-2">
                                <Link
                                    href={`${addTrailingSlash(
                                        serverBaseUrl
                                    )}realms/${realmName}/.well-known/openid-configuration`}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex w-fit items-center gap-1.5"
                                >
                                    {t("openIDEndpointConfiguration")}
                                </Link>
                                <Link
                                    href={`${addTrailingSlash(
                                        serverBaseUrl
                                    )}realms/${realmName}/protocol/saml/descriptor`}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex w-fit items-center gap-1.5"
                                >
                                    {t("samlIdentityProviderMetadata")}
                                </Link>
                                {isOpenid4vciEnabled && realm.verifiableCredentialsEnabled && (
                                    <Link
                                        href={`${addTrailingSlash(
                                            serverBaseUrl
                                        )}.well-known/openid-credential-issuer/realms/${realmName}`}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="inline-flex w-fit items-center gap-1.5"
                                    >
                                        {t("oid4vcIssuerMetadata")}
                                        <ArrowSquareOut className="size-4 shrink-0" aria-hidden />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </FormPanel>

                    <div className="flex gap-2 pt-2">
                        <FixedButtonsGroup
                            name="realmSettingsGeneralTab"
                            reset={setupForm}
                            isSubmit
                        />
                    </div>
                </FormAccess>
            </FormProvider>
        </div>
    );
}
