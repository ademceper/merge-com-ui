import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { SelectField } from "../../../shared/keycloak-ui-shared";
import { FormPanel } from "../../../shared/keycloak-ui-shared/scroll-form/FormPanel";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FixedButtonsGroup } from "../../components/form/FixedButtonGroup";
import { FormAccess } from "../../components/form/FormAccess";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { convertToFormValues } from "../../util";

type ThemeSettingsTabProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
};

export const ThemeSettingsTab = ({ realm, save }: ThemeSettingsTabProps) => {
    const { t } = useTranslation();

    const form = useForm<RealmRepresentation>();
    const { handleSubmit, setValue } = form;
    const themeTypes = useServerInfo().themes!;

    const setupForm = () => {
        convertToFormValues(realm, setValue);
    };
    useEffect(setupForm, []);

    const appendEmptyChoice = (items: { key: string; value: string }[]) => [
        { key: "", value: t("choose") },
        ...items
    ];

    return (
        <div className="pt-0">
            <FormProvider {...form}>
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(save)}
                >
                    <FormPanel title={t("themeSettings")}>
                        <div className="space-y-4">
                            <DefaultSwitchControl
                                name="attributes.darkMode"
                                labelIcon={t("darkModeEnabledHelp")}
                                label={t("darkModeEnabled")}
                                defaultValue="true"
                                stringify
                            />
                            <SelectField
                                id="kc-login-theme"
                                name="loginTheme"
                                label={t("loginTheme")}
                                labelIcon={t("loginThemeHelp")}
                                defaultValue=""
                                options={appendEmptyChoice(
                                    themeTypes.login.map(theme => ({
                                        key: theme.name,
                                        value: theme.name
                                    }))
                                )}
                            />
                            <SelectField
                                id="kc-account-theme"
                                name="accountTheme"
                                label={t("accountTheme")}
                                labelIcon={t("accountThemeHelp")}
                                placeholderText={t("selectATheme")}
                                defaultValue=""
                                options={appendEmptyChoice(
                                    themeTypes.account.map(theme => ({
                                        key: theme.name,
                                        value: theme.name
                                    }))
                                )}
                            />
                            <SelectField
                                id="kc-admin-theme"
                                name="adminTheme"
                                label={t("adminTheme")}
                                labelIcon={t("adminThemeHelp")}
                                placeholderText={t("selectATheme")}
                                defaultValue=""
                                options={appendEmptyChoice(
                                    themeTypes.admin.map(theme => ({
                                        key: theme.name,
                                        value: theme.name
                                    }))
                                )}
                            />
                            <SelectField
                                id="kc-email-theme"
                                name="emailTheme"
                                label={t("emailTheme")}
                                labelIcon={t("emailThemeHelp")}
                                placeholderText={t("selectATheme")}
                                defaultValue=""
                                options={appendEmptyChoice(
                                    themeTypes.email.map(theme => ({
                                        key: theme.name,
                                        value: theme.name
                                    }))
                                )}
                            />
                        </div>
                    </FormPanel>

                    <div className="flex gap-2 pt-2">
                        <FixedButtonsGroup
                            name="themes-tab"
                            reset={setupForm}
                            isSubmit
                        />
                    </div>
                </FormAccess>
            </FormProvider>
        </div>
    );
};
