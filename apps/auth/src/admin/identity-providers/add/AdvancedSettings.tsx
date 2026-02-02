/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/add/AdvancedSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import {
    FormErrorText,
    HelpItem,
    KeycloakSelect,
    SelectControl,
    SelectVariant,
    useFetch
} from "../../../shared/keycloak-ui-shared";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Switch } from "@merge/ui/components/switch";
import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";
import type { FieldProps } from "../component/FormGroupField";
import { FormGroupField } from "../component/FormGroupField";
import { SwitchField } from "../component/SwitchField";
import { TextField } from "../component/TextField";

const LoginFlow = ({
    field,
    label,
    defaultValue,
    labelForEmpty = "none"
}: FieldProps & { defaultValue: string; labelForEmpty?: string }) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { control } = useFormContext();

    const [flows, setFlows] = useState<AuthenticationFlowRepresentation[]>();
    const [open, setOpen] = useState(false);

    useFetch(
        () => adminClient.authenticationManagement.getFlows(),
        flows => setFlows(flows.filter(flow => flow.providerId === "basic-flow")),
        []
    );

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label htmlFor={label}>{t(label)}</Label>
                <HelpItem helpText={t(`${label}Help`)} fieldLabelId={label} />
            </div>
            <Controller
                name={field}
                defaultValue={defaultValue}
                control={control}
                render={({ field }) => (
                    <KeycloakSelect
                        toggleId={label}
                        onToggle={() => setOpen(!open)}
                        onSelect={value => {
                            field.onChange(value as string);
                            setOpen(false);
                        }}
                        selections={field.value || t(labelForEmpty)}
                        variant={SelectVariant.single}
                        aria-label={t(label)}
                        isOpen={open}
                    >
                        {[
                            ...(defaultValue === ""
                                ? [
                                      <SelectOption key="empty" value="">
                                          {t(labelForEmpty)}
                                      </SelectOption>
                                  ]
                                : []),
                            ...(flows?.map(option => (
                                <SelectOption
                                    selected={option.alias === field.value}
                                    key={option.id}
                                    value={option.alias}
                                >
                                    {option.alias}
                                </SelectOption>
                            )) || [])
                        ]}
                    </KeycloakSelect>
                )}
            />
        </div>
    );
};

const SYNC_MODES = ["IMPORT", "LEGACY", "FORCE"];
const SHOW_IN_ACCOUNT_CONSOLE_VALUES = ["ALWAYS", "WHEN_LINKED", "NEVER"];
type AdvancedSettingsProps = {
    isOIDC: boolean;
    isSAML: boolean;
    isOAuth2: boolean;
};

export const AdvancedSettings = ({ isOIDC, isSAML, isOAuth2 }: AdvancedSettingsProps) => {
    const { t } = useTranslation();
    const {
        control,
        register,
        setValue,
        formState: { errors }
    } = useFormContext<IdentityProviderRepresentation>();
    const filteredByClaim = useWatch({
        control,
        name: "config.filteredByClaim",
        defaultValue: "false"
    });
    const claimFilterRequired = filteredByClaim === "true";
    const isFeatureEnabled = useIsFeatureEnabled();
    const isTransientUsersEnabled = isFeatureEnabled(Feature.TransientUsers);
    const isClientAuthFederatedEnabled = isFeatureEnabled(Feature.ClientAuthFederated);
    const transientUsers = useWatch({
        control,
        name: "config.doNotStoreUsers",
        defaultValue: "false"
    });
    const syncModeAvailable = transientUsers === "false";
    return (
        <>
            {!isOIDC && !isSAML && !isOAuth2 && (
                <TextField field="config.defaultScope" label="scopes" />
            )}
            <SwitchField field="storeToken" label="storeTokens" fieldType="boolean" />
            {(isSAML || isOIDC || isOAuth2) && (
                <SwitchField
                    field="addReadTokenRoleOnCreate"
                    label="storedTokensReadable"
                    fieldType="boolean"
                />
            )}
            {!isOIDC && !isSAML && !isOAuth2 && (
                <>
                    <SwitchField
                        field="config.acceptsPromptNoneForwardFromClient"
                        label="acceptsPromptNone"
                    />
                    <SwitchField field="config.disableUserInfo" label="disableUserInfo" />
                </>
            )}
            {isOIDC && (
                <SwitchField field="config.isAccessTokenJWT" label="isAccessTokenJWT" />
            )}
            <SwitchField field="trustEmail" label="trustEmail" fieldType="boolean" />
            <SwitchField
                field="linkOnly"
                label="accountLinkingOnly"
                fieldType="boolean"
            />
            <SwitchField
                field="hideOnLogin"
                label="hideOnLoginPage"
                fieldType="boolean"
            />
            <SelectControl
                name="config.showInAccountConsole"
                label={t("showInAccountConsole")}
                labelIcon={t("showInAccountConsoleHelp")}
                options={SHOW_IN_ACCOUNT_CONSOLE_VALUES.map(showInAccountConsole => ({
                    key: showInAccountConsole,
                    value: t(
                        `showInAccountConsole.${showInAccountConsole.toLocaleLowerCase()}`
                    )
                }))}
                controller={{
                    defaultValue: SHOW_IN_ACCOUNT_CONSOLE_VALUES[0],
                    rules: { required: t("required") }
                }}
            />

            {((!isSAML && !isOAuth2) || isOIDC) && (
                <FormGroupField label="filteredByClaim">
                    <Controller
                        name="config.filteredByClaim"
                        defaultValue="false"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                id="filteredByClaim"
                                checked={field.value === "true"}
                                onCheckedChange={(value) => {
                                    field.onChange(value.toString());
                                }}
                            />
                        )}
                    />
                </FormGroupField>
            )}
            {(!isSAML || isOIDC) && claimFilterRequired && (
                <>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="kc-claim-filter-name">{t("claimFilterName")}</Label>
                            <HelpItem
                                helpText={t("claimFilterNameHelp")}
                                fieldLabelId="claimFilterName"
                            />
                        </div>
                        <Input
                            required
                            id="kc-claim-filter-name"
                            data-testid="claimFilterName"
                            className={errors.config?.claimFilterName ? "border-destructive" : ""}
                            {...register("config.claimFilterName", { required: true })}
                        />
                        {errors.config?.claimFilterName && (
                            <FormErrorText message={t("required")} />
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="kc-claim-filter-value">{t("claimFilterValue")}</Label>
                            <HelpItem
                                helpText={t("claimFilterValueHelp")}
                                fieldLabelId="claimFilterName"
                            />
                        </div>
                        <Input
                            required
                            id="kc-claim-filter-value"
                            data-testid="claimFilterValue"
                            className={errors.config?.claimFilterValue ? "border-destructive" : ""}
                            {...register("config.claimFilterValue", { required: true })}
                        />
                        {errors.config?.claimFilterValue && (
                            <FormErrorText message={t("required")} />
                        )}
                    </div>
                </>
            )}
            <LoginFlow
                field="firstBrokerLoginFlowAlias"
                label="firstBrokerLoginFlowAliasOverride"
                defaultValue=""
                labelForEmpty=""
            />
            <LoginFlow
                field="postBrokerLoginFlowAlias"
                label="postBrokerLoginFlowAlias"
                defaultValue=""
            />

            {isTransientUsersEnabled && (
                <FormGroupField label="doNotStoreUsers">
                    <Controller
                        name="config.doNotStoreUsers"
                        defaultValue="false"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                id="doNotStoreUsers"
                                checked={field.value === "true"}
                                onCheckedChange={(value) => {
                                    field.onChange(value.toString());
                                    // if field is checked, set sync mode to import
                                    if (value) {
                                        setValue("config.syncMode", "IMPORT");
                                    }
                                }}
                            />
                        )}
                    />
                </FormGroupField>
            )}
            {syncModeAvailable && (
                <SelectControl
                    name="config.syncMode"
                    label={t("syncMode")}
                    labelIcon={t("syncModeHelp")}
                    options={SYNC_MODES.map(syncMode => ({
                        key: syncMode,
                        value: t(`syncModes.${syncMode.toLocaleLowerCase()}`)
                    }))}
                    controller={{
                        defaultValue: SYNC_MODES[0],
                        rules: { required: t("required") }
                    }}
                />
            )}
            <SwitchField
                field="config.caseSensitiveOriginalUsername"
                label="caseSensitiveOriginalUsername"
            />
            {isClientAuthFederatedEnabled && isOIDC && (
                <>
                    <SwitchField
                        field="config.supportsClientAssertions"
                        label="supportsClientAssertions"
                    />
                    <SwitchField
                        field="config.supportsClientAssertionReuse"
                        label="supportsClientAssertionReuse"
                    />
                </>
            )}
        </>
    );
};
