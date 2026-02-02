/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/EmailTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { Alert, AlertDescription, AlertTitle } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { Label } from "@merge/ui/components/label";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    FormPanel,
    PasswordControl,
    SwitchControl,
    TextControl
} from "../../shared/keycloak-ui-shared";
import { useAdminClient } from "../admin-client";
import { useAlerts } from "../../shared/keycloak-ui-shared";
import { FormAccess } from "../components/form/FormAccess";
import { toUser } from "../user/routes/User";
import { emailRegexPattern } from "../util";
import { useCurrentUser } from "../utils/useCurrentUser";
import useToggle from "../utils/useToggle";


type RealmSettingsEmailTabProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
};

type FormFields = Omit<RealmRepresentation, "users" | "federatedUsers">;

export const RealmSettingsEmailTab = ({ realm, save }: RealmSettingsEmailTabProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();
    const currentUser = useCurrentUser();

    const form = useForm<FormFields>({ defaultValues: realm });
    const { control, handleSubmit, watch, reset: resetForm, getValues } = form;

    const reset = () => resetForm(realm);
    const watchFromValue = watch("smtpServer.from", "");
    const watchHostValue = watch("smtpServer.host", "");
    const [isTesting, toggleTest] = useToggle();

    const authenticationEnabled = useWatch({
        control,
        name: "smtpServer.auth",
        defaultValue: realm.smtpServer?.auth || "false"
    });

    const authType = useWatch({
        control,
        name: "smtpServer.authType",
        defaultValue: realm.smtpServer?.authType || "basic"
    });

    const testConnection = async () => {
        const toNumber = (value: string) => Number(value);
        const toBoolean = (value: string) => value === true.toString();
        const valueMapper = new Map<string, (value: string) => unknown>([
            ["port", toNumber],
            ["ssl", toBoolean],
            ["starttls", toBoolean],
            ["auth", toBoolean]
        ]);

        const serverSettings = { ...getValues()["smtpServer"] };

        for (const [key, mapperFn] of valueMapper.entries()) {
            serverSettings[key] = mapperFn(serverSettings[key]);
        }

        // For default value, back end is expecting null instead of 0
        if (serverSettings.port === 0) serverSettings.port = null;

        try {
            toggleTest();
            await adminClient.realms.testSMTPConnection(
                { realm: realm.realm! },
                serverSettings
            );
            addAlert(t("testConnectionSuccess"), AlertVariant.success);
        } catch (error) {
            addError("testConnectionError", error);
        }
        toggleTest();
    };

    return (
        <div className="p-6">
            <FormProvider {...form}>
                <FormPanel title={t("template")} className="kc-email-template">
                    <FormAccess
                        isHorizontal
                        role="manage-realm"
                        className="mt-4"
                        onSubmit={handleSubmit(save)}
                    >
                        <TextControl
                            name="smtpServer.from"
                            label={t("from")}
                            type="email"
                            placeholder={t("smtpFromPlaceholder")}
                            rules={{
                                pattern: {
                                    value: emailRegexPattern,
                                    message: t("emailInvalid")
                                },
                                required: t("required")
                            }}
                        />
                        <TextControl
                            name="smtpServer.fromDisplayName"
                            label={t("fromDisplayName")}
                            labelIcon={t("fromDisplayNameHelp")}
                            placeholder={t("smtpFromDisplayPlaceholder")}
                        />
                        <TextControl
                            name="smtpServer.replyTo"
                            label={t("replyTo")}
                            type="email"
                            placeholder={t("replyToEmailPlaceholder")}
                            rules={{
                                pattern: {
                                    value: emailRegexPattern,
                                    message: t("emailInvalid")
                                }
                            }}
                        />
                        <TextControl
                            name="smtpServer.replyToDisplayName"
                            label={t("replyToDisplayName")}
                            labelIcon={t("replyToDisplayNameHelp")}
                            placeholder={t("replyToDisplayPlaceholder")}
                        />
                        <TextControl
                            name="smtpServer.envelopeFrom"
                            label={t("envelopeFrom")}
                            labelIcon={t("envelopeFromHelp")}
                            placeholder={t("senderEnvelopePlaceholder")}
                        />
                    </FormAccess>
                </FormPanel>
                <FormPanel
                    className="kc-email-connection"
                    title={t("connectionAndAuthentication")}
                >
                    <FormAccess
                        isHorizontal
                        role="manage-realm"
                        className="mt-4"
                        onSubmit={handleSubmit(save)}
                    >
                        <TextControl
                            name="smtpServer.host"
                            label={t("host")}
                            rules={{
                                required: t("required")
                            }}
                        />
                        <TextControl
                            name="smtpServer.port"
                            label={t("port")}
                            placeholder={t("smtpPortPlaceholder")}
                        />
                        <div className="space-y-2">
                            <label>{t("encryption")}</label>
                            <Controller
                                name="smtpServer.ssl"
                                control={control}
                                defaultValue="false"
                                render={({ field }) => (
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="kc-enable-ssl"
                                            data-testid="enable-ssl"
                                            checked={field.value === "true"}
                                            onCheckedChange={(value) =>
                                                field.onChange("" + value)
                                            }
                                        />
                                        <Label htmlFor="kc-enable-ssl">{t("enableSSL")}</Label>
                                    </div>
                                )}
                            />
                            <Controller
                                name="smtpServer.starttls"
                                control={control}
                                defaultValue="false"
                                render={({ field }) => (
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="kc-enable-start-tls"
                                            data-testid="enable-start-tls"
                                            checked={field.value === "true"}
                                            onCheckedChange={(value) =>
                                                field.onChange("" + value)
                                            }
                                        />
                                        <Label htmlFor="kc-enable-start-tls">{t("enableStartTLS")}</Label>
                                    </div>
                                )}
                            />
                        </div>
                        <SwitchControl
                            name="smtpServer.auth"
                            label={t("authentication")}
                            data-testid="smtpServer.auth"
                            defaultValue=""
                            labelOn={t("enabled")}
                            labelOff={t("disabled")}
                            stringify
                        />
                        {authenticationEnabled === "true" && (
                            <>
                                <TextControl
                                    name="smtpServer.user"
                                    label={t("username")}
                                    placeholder={t("loginUsernamePlaceholder")}
                                    rules={{
                                        required: t("required")
                                    }}
                                />
                                <div className="space-y-2">
                                    <label>{t("authenticationType")}</label>
                                    <Controller
                                        name="smtpServer.authType"
                                        control={control}
                                        defaultValue="basic"
                                        render={({ field }) => (
                                            <RadioGroup
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem
                                                        id="basicAuth"
                                                        value="basic"
                                                        data-testid="smtpServer.authType.basic"
                                                    />
                                                    <Label htmlFor="basicAuth">{t("authenticationTypeBasicAuth")}</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem
                                                        id="tokenAuth"
                                                        value="token"
                                                        data-testid="smtpServer.authType.token"
                                                    />
                                                    <Label htmlFor="tokenAuth">{t("authenticationTypeTokenAuth")}</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                                {authType === "basic" && (
                                    <PasswordControl
                                        name="smtpServer.password"
                                        label={t("password")}
                                        labelIcon={t("passwordHelp")}
                                        rules={{
                                            required: t("required")
                                        }}
                                    />
                                )}
                                {authType === "token" && (
                                    <>
                                        <TextControl
                                            name="smtpServer.authTokenUrl"
                                            label={t("authTokenUrl")}
                                            helperText={t("tokenTokenUrlHelp")}
                                            rules={{
                                                required: t("required")
                                            }}
                                        />
                                        <TextControl
                                            name="smtpServer.authTokenScope"
                                            label={t("authTokenScope")}
                                            helperText={t("authTokenScopeHelp")}
                                            rules={{
                                                required: t("required")
                                            }}
                                        />
                                        <TextControl
                                            name="smtpServer.authTokenClientId"
                                            label={t("authTokenClientId")}
                                            helperText={t("authTokenClientIdHelp")}
                                            rules={{
                                                required: t("required")
                                            }}
                                        />
                                        <PasswordControl
                                            name="smtpServer.authTokenClientSecret"
                                            label={t("authTokenClientSecret")}
                                            labelIcon={t("authTokenClientSecretHelp")}
                                            rules={{
                                                required: t("required")
                                            }}
                                        />
                                    </>
                                )}
                            </>
                        )}
                        <SwitchControl
                            name="smtpServer.allowutf8"
                            label={t("allowutf8")}
                            labelIcon={t("allowutf8Help")}
                            data-testid="smtpServer.allowutf8"
                            defaultValue=""
                            labelOn={t("enabled")}
                            labelOff={t("disabled")}
                            stringify
                        />
                        <TextControl
                            name="smtpServer.connectionTimeout"
                            label={t("smtpConnectionTimeout")}
                            labelIcon={t("smtpConnectionTimeoutHelp")}
                            type="number"
                            defaultValue={10000}
                            min={0}
                        />
                        <TextControl
                            name="smtpServer.timeout"
                            label={t("smtpSocketReadTimeout")}
                            labelIcon={t("smtpSocketReadTimeoutHelp")}
                            type="number"
                            defaultValue={10000}
                            min={0}
                        />
                        <TextControl
                            name="smtpServer.writeTimeout"
                            label={t("smtpSocketWriteTimeout")}
                            labelIcon={t("smtpSocketWriteTimeoutHelp")}
                            type="number"
                            defaultValue={10000}
                            min={0}
                        />
                        <Controller
                            name="smtpServer.debug"
                            control={control}
                            defaultValue="false"
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="kc-enable-debug"
                                        data-testid="enable-debug"
                                        checked={field.value === "true"}
                                        onCheckedChange={(value) =>
                                            field.onChange("" + value)
                                        }
                                    />
                                    <Label htmlFor="kc-enable-debug">{t("enableDebugSMTP")}</Label>
                                </div>
                            )}
                        />
                        {currentUser && (
                            <div id="descriptionTestConnection">
                                {currentUser.email ? (
                                    <Alert variant="default">
                                        <AlertTitle>
                                            {t("testConnectionHint.withEmail", {
                                                email: currentUser.email
                                            })}
                                        </AlertTitle>
                                    </Alert>
                                ) : (
                                    <Alert variant="destructive">
                                        <AlertTitle>
                                            {t("testConnectionHint.withoutEmail", {
                                                userName: currentUser.username
                                            })}
                                        </AlertTitle>
                                        <AlertDescription>
                                            <Link
                                                to={toUser({
                                                    realm: currentUser.realm!,
                                                    id: currentUser.id!,
                                                    tab: "settings"
                                                })}
                                            >
                                                {t(
                                                    "testConnectionHint.withoutEmailAction"
                                                )}
                                            </Link>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <div>
                                <Button
                                    type="submit"
                                    data-testid="email-tab-save"
                                >
                                    {t("save")}
                                </Button>
                            </div>
                            <div>
                                <Button
                                    variant="secondary"
                                    onClick={() => testConnection()}
                                    data-testid="test-connection-button"
                                    disabled={
                                        !(
                                            emailRegexPattern.test(watchFromValue) &&
                                            watchHostValue
                                        ) || !currentUser?.email
                                    }
                                    aria-describedby="descriptionTestConnection"
                                >
                                    {isTesting ? t("testingConnection") : t("testConnection")}
                                </Button>
                            </div>
                            <div>
                                <Button
                                    variant="link"
                                    onClick={reset}
                                    data-testid="email-tab-revert"
                                >
                                    {t("revert")}
                                </Button>
                            </div>
                        </div>
                    </FormAccess>
                </FormPanel>
            </FormProvider>
        </div>
    );
};
