import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { Switch } from "@merge/ui/components/switch";
import { useTranslation } from "react-i18next";
import { FormPanel, HelpItem } from "../../shared/keycloak-ui-shared";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { FormAccess } from "../components/form/FormAccess";
import { useRealm } from "../context/realm-context/RealmContext";

type RealmSettingsLoginTabProps = {
    realm: RealmRepresentation;
    refresh: () => void;
};

type SwitchType = { [K in keyof RealmRepresentation]: boolean };

export const RealmSettingsLoginTab = ({ realm, refresh }: RealmSettingsLoginTabProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm: realmName } = useRealm();

    const updateSwitchValue = async (switches: SwitchType | SwitchType[]) => {
        const name = Array.isArray(switches)
            ? Object.keys(switches[0])[0]
            : Object.keys(switches)[0];

        try {
            await adminClient.realms.update(
                {
                    realm: realmName
                },
                Array.isArray(switches)
                    ? switches.reduce((realm, s) => Object.assign(realm, s), realm)
                    : Object.assign(realm, switches)
            );
            toast.success(t("enableSwitchSuccess", { switch: t(name) }));
            refresh();
        } catch (error) {
            toast.error(t("enableSwitchError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <div className="pt-0 space-y-6">
            <FormPanel className="kc-login-screen" title={t("loginScreenCustomization")}>
                <FormAccess isHorizontal role="manage-realm">
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{t("registrationAllowed")}</span>
                            <HelpItem
                                helpText={t("userRegistrationHelpText")}
                                fieldLabelId="registrationAllowed"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {realm.registrationAllowed ? t("on") : t("off")}
                            </span>
                            <Switch
                                id="kc-user-reg-switch"
                                data-testid="user-reg-switch"
                                checked={!!realm.registrationAllowed}
                                onCheckedChange={async (value) => {
                                    await updateSwitchValue({ registrationAllowed: value });
                                }}
                                aria-label={t("registrationAllowed")}
                            />
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{t("resetPasswordAllowed")}</span>
                            <HelpItem
                                helpText={t("forgotPasswordHelpText")}
                                fieldLabelId="resetPasswordAllowed"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {realm.resetPasswordAllowed ? t("on") : t("off")}
                            </span>
                            <Switch
                                id="kc-forgot-pw-switch"
                                data-testid="forgot-pw-switch"
                                checked={!!realm.resetPasswordAllowed}
                                onCheckedChange={async (value) => {
                                    await updateSwitchValue({ resetPasswordAllowed: value });
                                }}
                                aria-label={t("resetPasswordAllowed")}
                            />
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{t("rememberMe")}</span>
                            <HelpItem
                                helpText={t("rememberMeHelpText")}
                                fieldLabelId="rememberMe"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {realm.rememberMe ? t("on") : t("off")}
                            </span>
                            <Switch
                                id="kc-remember-me-switch"
                                data-testid="remember-me-switch"
                                checked={!!realm.rememberMe}
                                onCheckedChange={async (value) => {
                                    await updateSwitchValue({ rememberMe: value });
                                }}
                                aria-label={t("rememberMe")}
                            />
                        </div>
                    </div>
                </FormAccess>
            </FormPanel>
            <FormPanel className="kc-email-settings" title={t("emailSettings")}>
                <FormAccess isHorizontal role="manage-realm">
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{t("registrationEmailAsUsername")}</span>
                            <HelpItem
                                helpText={t("emailAsUsernameHelpText")}
                                fieldLabelId="registrationEmailAsUsername"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {realm.registrationEmailAsUsername ? t("on") : t("off")}
                            </span>
                            <Switch
                                id="kc-email-as-username-switch"
                                data-testid="email-as-username-switch"
                                checked={!!realm.registrationEmailAsUsername}
                                onCheckedChange={async (value) => {
                                    await updateSwitchValue([
                                        {
                                            registrationEmailAsUsername: value
                                        },
                                        {
                                            duplicateEmailsAllowed: false
                                        }
                                    ]);
                                }}
                                aria-label={t("registrationEmailAsUsername")}
                            />
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{t("loginWithEmailAllowed")}</span>
                            <HelpItem
                                helpText={t("loginWithEmailHelpText")}
                                fieldLabelId="loginWithEmailAllowed"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {realm.loginWithEmailAllowed ? t("on") : t("off")}
                            </span>
                            <Switch
                                id="kc-login-with-email-switch"
                                data-testid="login-with-email-switch"
                                checked={!!realm.loginWithEmailAllowed}
                                onCheckedChange={async (value) => {
                                    await updateSwitchValue([
                                        {
                                            loginWithEmailAllowed: value
                                        },
                                        { duplicateEmailsAllowed: false }
                                    ]);
                                }}
                                aria-label={t("loginWithEmailAllowed")}
                            />
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{t("duplicateEmailsAllowed")}</span>
                            <HelpItem
                                helpText={t("duplicateEmailsHelpText")}
                                fieldLabelId="duplicateEmailsAllowed"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {realm.duplicateEmailsAllowed ? t("on") : t("off")}
                            </span>
                            <Switch
                                id="kc-duplicate-emails-switch"
                                data-testid="duplicate-emails-switch"
                                checked={!!realm.duplicateEmailsAllowed}
                                onCheckedChange={async (value) => {
                                    await updateSwitchValue({
                                        duplicateEmailsAllowed: value
                                    });
                                }}
                                disabled={
                                    !!realm.loginWithEmailAllowed ||
                                    !!realm.registrationEmailAsUsername
                                }
                                aria-label={t("duplicateEmailsAllowed")}
                            />
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{t("verifyEmail")}</span>
                            <HelpItem
                                helpText={t("verifyEmailHelpText")}
                                fieldLabelId="verifyEmail"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {realm.verifyEmail ? t("on") : t("off")}
                            </span>
                            <Switch
                                id="kc-verify-email-switch"
                                data-testid="verify-email-switch"
                                checked={!!realm.verifyEmail}
                                onCheckedChange={async (value) => {
                                    await updateSwitchValue({ verifyEmail: value });
                                }}
                                aria-label={t("verifyEmail")}
                            />
                        </div>
                    </div>
                </FormAccess>
            </FormPanel>
            <FormPanel className="kc-user-info-settings" title={t("userInfoSettings")}>
                <FormAccess isHorizontal role="manage-realm">
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{t("editUsernameAllowed")}</span>
                            <HelpItem
                                helpText={t("editUsernameHelp")}
                                fieldLabelId="editUsernameAllowed"
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {realm.editUsernameAllowed ? t("on") : t("off")}
                            </span>
                            <Switch
                                id="kc-edit-username-switch"
                                data-testid="edit-username-switch"
                                checked={!!realm.editUsernameAllowed}
                                onCheckedChange={async (value) => {
                                    await updateSwitchValue({ editUsernameAllowed: value });
                                }}
                                aria-label={t("editUsernameAllowed")}
                            />
                        </div>
                    </div>
                </FormAccess>
            </FormPanel>
        </div>
    );
};
