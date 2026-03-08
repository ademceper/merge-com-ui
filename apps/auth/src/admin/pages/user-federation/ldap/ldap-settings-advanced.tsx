import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Switch } from "@merge-rd/ui/components/switch";
import { Controller, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import {
    FormLabel,
    getErrorDescription,
    getErrorMessage,
    HelpItem
} from "../../../../shared/keycloak-ui-shared";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { useLdapServerCapabilities } from "../hooks/use-ldap-server-capabilities";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { WizardSectionHeader } from "../../../shared/ui/wizard-section-header/wizard-section-header";
import { convertFormToSettings } from "./ldap-settings-connection";

type LdapSettingsAdvancedProps = {
    id?: string;
    form: UseFormReturn;
    showSectionHeading?: boolean;
    showSectionDescription?: boolean;
};

const PASSWORD_MODIFY_OID = "1.3.6.1.4.1.4203.1.11.1";

export const LdapSettingsAdvanced = ({
    id,
    form,
    showSectionHeading = false,
    showSectionDescription = false
}: LdapSettingsAdvancedProps) => {

    const { t } = useTranslation();

    const { realm } = useRealm();
    const { mutateAsync: ldapServerCapabilitiesMut } = useLdapServerCapabilities();
    const testLdap = async () => {
        if (!(await form.trigger())) return;
        try {
            const settings = convertFormToSettings(form);
            const ldapOids = await ldapServerCapabilitiesMut({
                realm,
                settings: { ...settings, componentId: id }
            });
            toast.success(t("testSuccess"));
            const passwordModifyOid = ldapOids.filter(
                (oidItem: { oid: string }) => oidItem.oid === PASSWORD_MODIFY_OID
            );
            form.setValue("config.usePasswordModifyExtendedOp", [
                (passwordModifyOid.length > 0).toString()
            ]);
        } catch (error) {
            toast.error(t("testError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <>
            {showSectionHeading && (
                <WizardSectionHeader
                    title={t("advancedSettings")}
                    description={t("ldapAdvancedSettingsDescription")}
                    showDescription={showSectionDescription}
                />
            )}

            <FormAccess role="manage-realm" isHorizontal>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <FormLabel
                            name="kc-enable-ldapv3-password"
                            label={t("enableLdapv3Password")}
                            labelIcon={
                                <HelpItem
                                    helpText={t("enableLdapv3PasswordHelp")}
                                    fieldLabelId="enableLdapv3Password"
                                />
                            }
                            hasNoPaddingTop
                        >
                            <Controller
                                name="config.usePasswordModifyExtendedOp"
                                defaultValue={["false"]}
                                control={form.control}
                                render={({ field }) => (
                                    <Switch
                                        id="kc-enable-ldapv3-password"
                                        data-testid="ldapv3-password"
                                        checked={field.value[0] === "true"}
                                        onCheckedChange={value =>
                                            field.onChange([`${value}`])
                                        }
                                        aria-label={t("enableLdapv3Password")}
                                    />
                                )}
                            />
                        </FormLabel>
                    </div>
                    <div className="space-y-2">
                        <FormLabel
                            name="kc-validate-password-policy"
                            label={t("validatePasswordPolicy")}
                            labelIcon={
                                <HelpItem
                                    helpText={t("validatePasswordPolicyHelp")}
                                    fieldLabelId="validatePasswordPolicy"
                                />
                            }
                            hasNoPaddingTop
                        >
                            <Controller
                                name="config.validatePasswordPolicy"
                                defaultValue={["false"]}
                                control={form.control}
                                render={({ field }) => (
                                    <Switch
                                        id="kc-validate-password-policy"
                                        data-testid="password-policy"
                                        checked={field.value[0] === "true"}
                                        onCheckedChange={value =>
                                            field.onChange([`${value}`])
                                        }
                                        aria-label={t("validatePasswordPolicy")}
                                    />
                                )}
                            />
                        </FormLabel>
                    </div>
                    <div className="space-y-2">
                        <FormLabel
                            name="kc-trust-email"
                            label={t("trustEmail")}
                            labelIcon={
                                <HelpItem
                                    helpText={t("trustEmailHelp")}
                                    fieldLabelId="trustEmail"
                                />
                            }
                            hasNoPaddingTop
                        >
                            <Controller
                                name="config.trustEmail"
                                defaultValue={["false"]}
                                control={form.control}
                                render={({ field }) => (
                                    <Switch
                                        id="kc-trust-email"
                                        data-testid="trust-email"
                                        checked={field.value[0] === "true"}
                                        onCheckedChange={value =>
                                            field.onChange([`${value}`])
                                        }
                                        aria-label={t("trustEmail")}
                                    />
                                )}
                            />
                        </FormLabel>
                    </div>
                    <div className="space-y-2">
                        <FormLabel
                            name="kc-connection-trace"
                            label={t("connectionTrace")}
                            labelIcon={
                                <HelpItem
                                    helpText={t("connectionTraceHelp")}
                                    fieldLabelId="connectionTrace"
                                />
                            }
                            hasNoPaddingTop
                        >
                            <Controller
                                name="config.connectionTrace"
                                defaultValue={["false"]}
                                control={form.control}
                                render={({ field }) => (
                                    <Switch
                                        id="kc-connection-trace"
                                        data-testid="connection-trace"
                                        checked={field.value[0] === "true"}
                                        onCheckedChange={value =>
                                            field.onChange([`${value}`])
                                        }
                                        aria-label={t("connectionTrace")}
                                    />
                                )}
                            />
                        </FormLabel>
                    </div>
                    <div>
                        <Button
                            variant="outline"
                            id="query-extensions"
                            data-testid="query-extensions"
                            onClick={testLdap}
                        >
                            {t("queryExtensions")}
                        </Button>
                    </div>
                </div>
            </FormAccess>
        </>
    );
};
