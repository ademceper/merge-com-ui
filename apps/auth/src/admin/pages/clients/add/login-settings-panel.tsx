import { useFormContext } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { SelectField, TextAreaControl } from "../../../../shared/keycloak-ui-shared";
import { DefaultSwitchControl } from "../../../shared/ui/switch-control";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { useServerInfo } from "../../../app/providers/server-info/server-info-provider";
import { convertAttributeNameToForm } from "../../../shared/lib/util";
import { FormFields } from "../client-details";

export const LoginSettingsPanel = ({ access }: { access?: boolean }) => {
    const { t } = useTranslation();
    const { watch } = useFormContext<FormFields>();

    const loginThemes = useServerInfo().themes!["login"];
    const consentRequired = watch("consentRequired");
    const displayOnConsentScreen: string = watch(
        convertAttributeNameToForm<FormFields>("attributes.display.on.consent.screen")
    );

    return (
        <FormAccess fineGrainedAccess={access} role="manage-clients">
            <div className="flex flex-col gap-5">
            <SelectField
                name="attributes.login_theme"
                label={t("loginTheme")}
                labelIcon={t("loginThemeHelp")}
                defaultValue=""
                options={[
                    { key: "", value: t("choose") },
                    ...loginThemes.map(({ name }) => ({ key: name, value: name }))
                ]}
            />
            <DefaultSwitchControl
                name="consentRequired"
                label={t("consentRequired")}
                labelIcon={t("consentRequiredHelp")}
            />
            <DefaultSwitchControl
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.display.on.consent.screen"
                )}
                label={t("displayOnClient")}
                labelIcon={t("displayOnClientHelp")}
                isDisabled={!consentRequired}
                stringify
            />
            <TextAreaControl
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.consent.screen.text"
                )}
                label={t("consentScreenText")}
                labelIcon={t("consentScreenTextHelp")}
                isDisabled={!(consentRequired && displayOnConsentScreen === "true")}
            />
            </div>
        </FormAccess>
    );
};
