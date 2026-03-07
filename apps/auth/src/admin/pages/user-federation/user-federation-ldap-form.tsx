import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { Button } from "@merge-rd/ui/components/button";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import { ScrollForm } from "../../../shared/keycloak-ui-shared";

import { FixedButtonsGroup } from "../../shared/ui/form/fixed-button-group";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import useIsFeatureEnabled, { Feature } from "../../shared/lib/useIsFeatureEnabled";
import { LdapSettingsAdvanced } from "./ldap/ldap-settings-advanced";
import { LdapSettingsConnection } from "./ldap/ldap-settings-connection";
import { LdapSettingsGeneral } from "./ldap/ldap-settings-general";
import { LdapSettingsKerberosIntegration } from "./ldap/ldap-settings-kerberos-integration";
import { LdapSettingsSearching } from "./ldap/ldap-settings-searching";
import { LdapSettingsSynchronization } from "./ldap/ldap-settings-synchronization";
import { toUserFederation } from "./routes/user-federation";
import { SettingsCache } from "./shared/settings-cache";

export type LdapComponentRepresentation = ComponentRepresentation & {
    config?: {
        periodicChangedUsersSync?: boolean;
        periodicFullSync?: boolean;
    };
};

type UserFederationLdapFormProps = {
    id?: string;
    onSubmit: (formData: LdapComponentRepresentation) => void;
};

export const UserFederationLdapForm = ({ id, onSubmit }: UserFederationLdapFormProps) => {
    const { t } = useTranslation();
    const form = useFormContext<LdapComponentRepresentation>();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const isFeatureEnabled = useIsFeatureEnabled();

    return (
        <>
            <ScrollForm
                label={t("jumpToSection")}
                sections={[
                    {
                        title: t("generalOptions"),
                        panel: <LdapSettingsGeneral form={form} vendorEdit={!!id} />
                    },
                    {
                        title: t("connectionAndAuthenticationSettings"),
                        panel: <LdapSettingsConnection form={form} id={id} />
                    },
                    {
                        title: t("ldapSearchingAndUpdatingSettings"),
                        panel: <LdapSettingsSearching form={form} />
                    },
                    {
                        title: t("synchronizationSettings"),
                        panel: <LdapSettingsSynchronization form={form} />
                    },
                    {
                        title: t("kerberosIntegration"),
                        panel: <LdapSettingsKerberosIntegration form={form} />,
                        isHidden: !isFeatureEnabled(Feature.Kerberos)
                    },
                    { title: t("cacheSettings"), panel: <SettingsCache form={form} /> },
                    {
                        title: t("advancedSettings"),
                        panel: <LdapSettingsAdvanced form={form} id={id} />
                    }
                ]}
            />
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FixedButtonsGroup
                    name="ldap"
                    isDisabled={!form.formState.isDirty}
                    isSubmit
                >
                    <Button
                        type="button"
                        variant="link"
                        onClick={() => navigate({ to: toUserFederation({ realm }) as string })}
                        data-testid="ldap-cancel"
                    >
                        {t("cancel")}
                    </Button>
                </FixedButtonsGroup>
            </form>
        </>
    );
};

export function serializeFormData(
    formData: LdapComponentRepresentation
): LdapComponentRepresentation {
    const { config } = formData;

    if (config?.periodicChangedUsersSync !== undefined) {
        if (config.periodicChangedUsersSync === false) {
            config.changedSyncPeriod = ["-1"];
        }
        delete config.periodicChangedUsersSync;
    }

    if (config?.periodicFullSync !== undefined) {
        if (config.periodicFullSync === false) {
            config.fullSyncPeriod = ["-1"];
        }
        delete config.periodicFullSync;
    }

    return formData;
}
