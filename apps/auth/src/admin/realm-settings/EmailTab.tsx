import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { Alert, AlertDescription, AlertTitle } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { Label } from "@merge/ui/components/label";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FormPanel, HelpItem, PasswordControl, TextControl } from "../../shared/keycloak-ui-shared";
import { Switch } from "@merge/ui/components/switch";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { FixedButtonsGroup } from "../components/form/FixedButtonGroup";
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
            toast.success(t("testConnectionSuccess"));
        } catch (error) {
            toast.error(t("testConnectionError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
        toggleTest();
    };

    return (
        <div className="pt-0">
            <FormProvider {...form}>
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(save)}
                >
                    <FormPanel title={t("template")}>
                        <div className="space-y-4">
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
                        </div>
                    </FormPanel>

                    <FormPanel title={t("connectionAndAuthentication")}>
                        <div className="space-y-4">
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
                            <div className="space-y-4">
                                <span className="text-sm font-medium text-muted-foreground">{t("encryption")}</span>
                                <div className="flex w-full items-center justify-between gap-2">
                                    <Label htmlFor="kc-enable-ssl" className="text-sm font-medium">{t("enableSSL")}</Label>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Controller
                                            name="smtpServer.ssl"
                                            control={control}
                                            defaultValue="false"
                                            render={({ field }) => (
                                                <>
                                                    <span className="text-sm text-muted-foreground">
                                                        {field.value === "true" ? t("on") : t("off")}
                                                    </span>
                                                    <Checkbox
                                                        id="kc-enable-ssl"
                                                        data-testid="enable-ssl"
                                                        checked={field.value === "true"}
                                                        onCheckedChange={(value) =>
                                                            field.onChange("" + value)
                                                        }
                                                    />
                                                </>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-between gap-2">
                                    <Label htmlFor="kc-enable-start-tls" className="text-sm font-medium">{t("enableStartTLS")}</Label>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Controller
                                            name="smtpServer.starttls"
                                            control={control}
                                            defaultValue="false"
                                            render={({ field }) => (
                                                <>
                                                    <span className="text-sm text-muted-foreground">
                                                        {field.value === "true" ? t("on") : t("off")}
                                                    </span>
                                                    <Checkbox
                                                        id="kc-enable-start-tls"
                                                        data-testid="enable-start-tls"
                                                        checked={field.value === "true"}
                                                        onCheckedChange={(value) =>
                                                            field.onChange("" + value)
                                                        }
                                                    />
                                                </>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium">{t("authentication")}</span>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Controller
                                        name="smtpServer.auth"
                                        control={control}
                                        defaultValue={realm.smtpServer?.auth ?? "false"}
                                        render={({ field }) => {
                                            const on = field.value === "true" || field.value === true;
                                            return (
                                                <>
                                                    <span className="text-sm text-muted-foreground">
                                                        {on ? t("on") : t("off")}
                                                    </span>
                                                    <Switch
                                                        id="smtpServer.auth"
                                                        data-testid="smtpServer.auth"
                                                        aria-label={t("authentication")}
                                                        checked={on}
                                                        onCheckedChange={(v) => field.onChange("" + v)}
                                                    />
                                                </>
                                            );
                                        }}
                                    />
                                </div>
                            </div>
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
                                        <span className="text-sm font-medium">{t("authenticationType")}</span>
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
                            <div className="flex w-full items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium">{t("allowutf8")}</span>
                                    <HelpItem
                                        helpText={t("allowutf8Help")}
                                        fieldLabelId="allowutf8"
                                    />
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Controller
                                        name="smtpServer.allowutf8"
                                        control={control}
                                        defaultValue={realm.smtpServer?.allowutf8 ?? "false"}
                                        render={({ field }) => {
                                            const on = field.value === "true" || field.value === true;
                                            return (
                                                <>
                                                    <span className="text-sm text-muted-foreground">
                                                        {on ? t("on") : t("off")}
                                                    </span>
                                                    <Switch
                                                        id="smtpServer.allowutf8"
                                                        data-testid="smtpServer.allowutf8"
                                                        aria-label={t("allowutf8")}
                                                        checked={on}
                                                        onCheckedChange={(v) => field.onChange("" + v)}
                                                    />
                                                </>
                                            );
                                        }}
                                    />
                                </div>
                            </div>
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
                            <div className="flex w-full items-center justify-between gap-2">
                                <Label htmlFor="kc-enable-debug" className="text-sm font-medium">{t("enableDebugSMTP")}</Label>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Controller
                                        name="smtpServer.debug"
                                        control={control}
                                        defaultValue="false"
                                        render={({ field }) => (
                                            <>
                                                <span className="text-sm text-muted-foreground">
                                                    {field.value === "true" ? t("on") : t("off")}
                                                </span>
                                                <Checkbox
                                                    id="kc-enable-debug"
                                                    data-testid="enable-debug"
                                                    checked={field.value === "true"}
                                                    onCheckedChange={(value) =>
                                                        field.onChange("" + value)
                                                    }
                                                />
                                            </>
                                        )}
                                    />
                                </div>
                            </div>
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
                        </div>
                    </FormPanel>

                    <div className="flex gap-2 pt-2">
                        <FixedButtonsGroup
                            name="email-tab"
                            reset={reset}
                            isSubmit
                        >
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
                        </FixedButtonsGroup>
                    </div>
                </FormAccess>
            </FormProvider>
        </div>
    );
};
