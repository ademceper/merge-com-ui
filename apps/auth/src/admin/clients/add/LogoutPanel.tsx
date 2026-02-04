import { Switch } from "@merge/ui/components/switch";
import { Label } from "@merge/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HelpItem, TextControl } from "../../../shared/keycloak-ui-shared";

import { DefaultSwitchControl } from "../../components/SwitchControl";
import { FormAccess } from "../../components/form/FormAccess";
import { useAccess } from "../../context/access/Access";
import { convertAttributeNameToForm } from "../../util";
import { FormFields } from "../ClientDetails";
import type { ClientSettingsProps } from "../ClientSettings";

const validateUrl = (uri: string | undefined, error: string) =>
    ((uri?.startsWith("https://") || uri?.startsWith("http://")) && !uri.includes("*")) ||
    uri === "" ||
    error;

export const LogoutPanel = ({ client: { access } }: ClientSettingsProps) => {
    const { t } = useTranslation();
    const { control, watch } = useFormContext<FormFields>();

    useAccess();

    const protocol = watch("protocol");
    const frontchannelLogout = watch("frontchannelLogout");
    const frontchannelLogoutTooltip =
        protocol === "openid-connect"
            ? "frontchannelLogoutOIDCHelp"
            : "frontchannelLogoutHelp";

    return (
        <FormAccess
            fineGrainedAccess={access?.configure}
            role="manage-clients"
        >
            <div className="flex flex-col gap-5">
            <div className="flex w-full items-center justify-between gap-2">
                <Label htmlFor="kc-frontchannelLogout">{t("frontchannelLogout")}</Label>
                <div className="flex shrink-0 items-center gap-2">
                    <Controller
                        name="frontchannelLogout"
                        defaultValue={true}
                        control={control}
                        render={({ field }) => (
                            <>
                                <span className="text-sm text-muted-foreground">
                                    {field.value ? t("on") : t("off")}
                                </span>
                                <Switch
                                    id="kc-frontchannelLogout-switch"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    aria-label={t("frontchannelLogout")}
                                />
                            </>
                        )}
                    />
                    <HelpItem
                        helpText={t(frontchannelLogoutTooltip)}
                        fieldLabelId="frontchannelLogout"
                    />
                </div>
            </div>
            {protocol === "openid-connect" && frontchannelLogout && (
                <TextControl
                    data-testid="frontchannelLogoutUrl"
                    type="url"
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.frontchannel.logout.url"
                    )}
                    label={t("frontchannelLogoutUrl")}
                    labelIcon={t("frontchannelLogoutUrlHelp")}
                    rules={{
                        validate: uri => validateUrl(uri, t("frontchannelUrlInvalid"))
                    }}
                />
            )}
            {protocol === "openid-connect" && frontchannelLogout && (
                <DefaultSwitchControl
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.frontchannel.logout.session.required"
                    )}
                    defaultValue="true"
                    label={t("frontchannelLogoutSessionRequired")}
                    labelIcon={t("frontchannelLogoutSessionRequiredHelp")}
                    stringify
                />
            )}
            {protocol === "openid-connect" && !frontchannelLogout && (
                <>
                    <TextControl
                        data-testid="backchannelLogoutUrl"
                        type="url"
                        name={convertAttributeNameToForm<FormFields>(
                            "attributes.backchannel.logout.url"
                        )}
                        label={t("backchannelLogoutUrl")}
                        labelIcon={t("backchannelLogoutUrlHelp")}
                        rules={{
                            validate: uri => validateUrl(uri, t("backchannelUrlInvalid"))
                        }}
                    />
                    <div className="flex w-full items-center justify-between gap-2">
                        <Label htmlFor="backchannelLogoutSessionRequired">{t("backchannelLogoutSessionRequired")}</Label>
                        <div className="flex shrink-0 items-center gap-2">
                            <Controller
                                name={convertAttributeNameToForm<FormFields>(
                                    "attributes.backchannel.logout.session.required"
                                )}
                                defaultValue="false"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <span className="text-sm text-muted-foreground">
                                            {field.value === "true" ? t("on") : t("off")}
                                        </span>
                                        <Switch
                                            id="backchannelLogoutSessionRequired"
                                            checked={field.value === "true"}
                                            onCheckedChange={(value) =>
                                                field.onChange(value.toString())
                                            }
                                            aria-label={t("backchannelLogoutSessionRequired")}
                                        />
                                    </>
                                )}
                            />
                            <HelpItem
                                helpText={t("backchannelLogoutSessionRequiredHelp")}
                                fieldLabelId="backchannelLogoutSessionRequired"
                            />
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                        <Label htmlFor="backchannelLogoutRevokeOfflineSessions">{t("backchannelLogoutRevokeOfflineSessions")}</Label>
                        <div className="flex shrink-0 items-center gap-2">
                            <Controller
                                name={convertAttributeNameToForm<FormFields>(
                                    "attributes.backchannel.logout.revoke.offline.tokens"
                                )}
                                defaultValue="false"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <span className="text-sm text-muted-foreground">
                                            {field.value === "true" ? t("on") : t("off")}
                                        </span>
                                        <Switch
                                            id="backchannelLogoutRevokeOfflineSessions"
                                            checked={field.value === "true"}
                                            onCheckedChange={(value) =>
                                                field.onChange(value.toString())
                                            }
                                            aria-label={t(
                                                "backchannelLogoutRevokeOfflineSessions"
                                            )}
                                        />
                                    </>
                                )}
                            />
                            <HelpItem
                                helpText={t("backchannelLogoutRevokeOfflineSessionsHelp")}
                                fieldLabelId="backchannelLogoutRevokeOfflineSessions"
                            />
                        </div>
                    </div>
                </>
            )}
            {protocol === "openid-connect" && (
                <DefaultSwitchControl
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.logout.confirmation.enabled"
                    )}
                    defaultValue="false"
                    label={t("logoutConfirmation")}
                    labelIcon={t("logoutConfirmationHelp")}
                    stringify
                />
            )}
            </div>
        </FormAccess>
    );
};
