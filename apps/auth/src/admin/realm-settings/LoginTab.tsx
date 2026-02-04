import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { Switch } from "@merge/ui/components/switch";
import { FormLabel } from "../../shared/keycloak-ui-shared";
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
        <div className="bg-muted/30 p-4">
            <FormPanel className="kc-login-screen" title={t("loginScreenCustomization")}>
                <FormAccess isHorizontal role="manage-realm">
                    <FormLabel
                        name="kc-user-reg"
                        label={t("registrationAllowed")}
                        labelIcon={
                            <HelpItem
                                helpText={t("userRegistrationHelpText")}
                                fieldLabelId="registrationAllowed"
                            />
                        }
                        hasNoPaddingTop
                    >
                        <Switch
                            id="kc-user-reg-switch"
                            data-testid="user-reg-switch"
                            checked={!!realm.registrationAllowed}
                            onCheckedChange={async (value) => {
                                await updateSwitchValue({ registrationAllowed: value });
                            }}
                            aria-label={t("registrationAllowed")}
                        />
                    </FormLabel>
                    <FormLabel
                        name="kc-forgot-pw"
                        label={t("resetPasswordAllowed")}
                        labelIcon={
                            <HelpItem
                                helpText={t("forgotPasswordHelpText")}
                                fieldLabelId="resetPasswordAllowed"
                            />
                        }
                        hasNoPaddingTop
                    >
                        <Switch
                            id="kc-forgot-pw-switch"
                            data-testid="forgot-pw-switch"
                            checked={!!realm.resetPasswordAllowed}
                            onCheckedChange={async (value) => {
                                await updateSwitchValue({ resetPasswordAllowed: value });
                            }}
                            aria-label={t("resetPasswordAllowed")}
                        />
                    </FormLabel>
                    <FormLabel
                        name="kc-remember-me"
                        label={t("rememberMe")}
                        labelIcon={
                            <HelpItem
                                helpText={t("rememberMeHelpText")}
                                fieldLabelId="rememberMe"
                            />
                        }
                        hasNoPaddingTop
                    >
                        <Switch
                            id="kc-remember-me-switch"
                            data-testid="remember-me-switch"
                            checked={!!realm.rememberMe}
                            onCheckedChange={async (value) => {
                                await updateSwitchValue({ rememberMe: value });
                            }}
                            aria-label={t("rememberMe")}
                        />
                    </FormLabel>
                </FormAccess>
            </FormPanel>
            <FormPanel className="kc-email-settings" title={t("emailSettings")}>
                <FormAccess isHorizontal role="manage-realm">
                    <FormLabel
                        name="kc-email-as-username"
                        label={t("registrationEmailAsUsername")}
                        labelIcon={
                            <HelpItem
                                helpText={t("emailAsUsernameHelpText")}
                                fieldLabelId="registrationEmailAsUsername"
                            />
                        }
                        hasNoPaddingTop
                    >
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
                    </FormLabel>
                    <FormLabel
                        name="kc-login-with-email"
                        label={t("loginWithEmailAllowed")}
                        labelIcon={
                            <HelpItem
                                helpText={t("loginWithEmailHelpText")}
                                fieldLabelId="loginWithEmailAllowed"
                            />
                        }
                        hasNoPaddingTop
                    >
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
                    </FormLabel>
                    <FormLabel
                        name="kc-duplicate-emails"
                        label={t("duplicateEmailsAllowed")}
                        labelIcon={
                            <HelpItem
                                helpText={t("duplicateEmailsHelpText")}
                                fieldLabelId="duplicateEmailsAllowed"
                            />
                        }
                        hasNoPaddingTop
                    >
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
                    </FormLabel>
                    <FormLabel
                        name="kc-verify-email"
                        label={t("verifyEmail")}
                        labelIcon={
                            <HelpItem
                                helpText={t("verifyEmailHelpText")}
                                fieldLabelId="verifyEmail"
                            />
                        }
                        hasNoPaddingTop
                    >
                        <Switch
                            id="kc-verify-email-switch"
                            data-testid="verify-email-switch"
                            checked={!!realm.verifyEmail}
                            onCheckedChange={async (value) => {
                                await updateSwitchValue({ verifyEmail: value });
                            }}
                            aria-label={t("verifyEmail")}
                        />
                    </FormLabel>
                </FormAccess>
            </FormPanel>
            <FormPanel className="kc-user-info-settings" title={t("userInfoSettings")}>
                <FormAccess isHorizontal role="manage-realm">
                    <FormLabel
                        name="kc-edit-username"
                        label={t("editUsernameAllowed")}
                        labelIcon={
                            <HelpItem
                                helpText={t("editUsernameHelp")}
                                fieldLabelId="editUsernameAllowed"
                            />
                        }
                        hasNoPaddingTop
                    >
                        <Switch
                            id="kc-edit-username-switch"
                            data-testid="edit-username-switch"
                            checked={!!realm.editUsernameAllowed}
                            onCheckedChange={async (value) => {
                                await updateSwitchValue({ editUsernameAllowed: value });
                            }}
                            aria-label={t("editUsernameAllowed")}
                        />
                    </FormLabel>
                </FormAccess>
            </FormPanel>
        </div>
    );
};
