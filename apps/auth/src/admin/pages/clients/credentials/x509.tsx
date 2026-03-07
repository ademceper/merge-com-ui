import { useTranslation } from "@merge-rd/i18n";
import { TextControl } from "../../../../shared/keycloak-ui-shared";
import { DefaultSwitchControl } from "../../../shared/ui/switch-control";
import { convertAttributeNameToForm } from "../../../shared/lib/util";
import { FormFields } from "../client-details";

export const X509 = () => {
    const { t } = useTranslation();
    return (
        <>
            <DefaultSwitchControl
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.x509.allow.regex.pattern.comparison"
                )}
                label={t("allowRegexComparison")}
                labelIcon={t("allowRegexComparisonHelp")}
                stringify
            />
            <TextControl
                name={convertAttributeNameToForm("attributes.x509.subjectdn")}
                label={t("subject")}
                labelIcon={t("subjectHelp")}
                rules={{
                    required: t("required")
                }}
            />
        </>
    );
};
